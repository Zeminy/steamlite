import { createHash, randomInt } from "crypto";
import { Router } from "express";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";
import { createRateLimit } from "../../middlewares/rateLimit";
import { Role } from "../../types/domain";
import {
  getPasswordPolicyMessage,
  isStrongPassword,
  isValidDisplayName,
  isValidEmailAddress,
  normalizeDisplayName,
  normalizeEmail,
} from "../../utils/authValidation";
import {
  buildVerificationEmail,
  buildWelcomeEmail,
  queueTransactionalEmail,
} from "../../utils/email";

export const authRouter = Router();

const LOGIN_LOCK_THRESHOLD = 5;
const LOGIN_LOCK_WINDOW_MS = 15 * 60 * 1000;

const registerRateLimit = createRateLimit({
  key: "auth-register",
  maxAttempts: 6,
  windowMs: 15 * 60 * 1000,
});

const loginRateLimit = createRateLimit({
  key: "auth-login",
  maxAttempts: 20,
  windowMs: 15 * 60 * 1000,
});

const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_VERIFICATION_COOLDOWN_MS = 60 * 1000;

const createVerificationCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

const hashVerificationCode = (email: string, code: string) =>
  createHash("sha256")
    .update(`${normalizeEmail(email)}:${String(code || "").trim()}`)
    .digest("hex");

const sendVerificationCodeEmail = async ({
  email,
  username,
  code,
  expiresAt,
}: {
  email: string;
  username: string;
  code: string;
  expiresAt: Date;
}) => {
  const verificationEmail = buildVerificationEmail({
    username,
    verificationCode: code,
    expiresAt,
  });

  const delivery = await queueTransactionalEmail({
    recipient: email,
    subject: verificationEmail.subject,
    template: verificationEmail.template,
    bodyText: verificationEmail.bodyText,
    bodyHtml: verificationEmail.bodyHtml,
  });

  return {
    recipient: delivery.recipient,
    status: delivery.status,
    sentAt: delivery.sentAt,
    provider: delivery.provider,
  };
};

authRouter.post(
  "/register",
  registerRateLimit,
  asyncHandler(async (req, res) => {
    const { username, email, password, marketingEmails } = req.body;
    const resolvedUsername = normalizeDisplayName(username);
    const normalizedEmail = normalizeEmail(email);

    if (!resolvedUsername || !email || !password) {
      throw new AppError(400, "Username, email and password are required.");
    }

    if (!isValidDisplayName(resolvedUsername)) {
      throw new AppError(400, "Username must be between 3 and 32 characters.");
    }

    if (!isValidEmailAddress(normalizedEmail)) {
      throw new AppError(400, "Please enter a valid email address.");
    }

    if (!isStrongPassword(String(password))) {
      throw new AppError(400, getPasswordPolicyMessage());
    }

    await prisma.pendingRegistration.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    const [
      existingUserByEmail,
      existingUserByUsername,
      existingPendingByEmail,
      existingPendingByUsername,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),
      prisma.user.findUnique({
        where: {
          username: resolvedUsername,
        },
        select: {
          id: true,
          deletedAt: true,
        },
      }),
      prisma.pendingRegistration.findUnique({
        where: {
          email: normalizedEmail,
        },
      }),
      prisma.pendingRegistration.findUnique({
        where: {
          username: resolvedUsername,
        },
      }),
    ]);

    if (existingUserByEmail) {
      if (existingUserByEmail.deletedAt) {
        throw new AppError(409, "This email belongs to a deleted account and cannot be reused.");
      }

      throw new AppError(409, "An account with this email already exists.");
    }

    if (existingUserByUsername) {
      if (existingUserByUsername.deletedAt) {
        throw new AppError(409, "This username belongs to a deleted account and cannot be reused.");
      }

      throw new AppError(409, "This username is already taken.");
    }

    if (existingPendingByUsername && existingPendingByUsername.email !== normalizedEmail) {
      throw new AppError(409, "This username is already reserved by another pending sign-up.");
    }

    if (existingPendingByEmail && existingPendingByEmail.username !== resolvedUsername) {
      throw new AppError(
        409,
        "An unverified sign-up already exists for this email. Check your inbox before trying again."
      );
    }

    const verificationCode = createVerificationCode();
    const expiresAt = new Date(Date.now() + env.emailVerificationTtlHours * 60 * 60 * 1000);
    const passwordHash = await hashPassword(String(password));
    const verificationSentAt = new Date();
    const verificationCodeHash = hashVerificationCode(normalizedEmail, verificationCode);

    await prisma.pendingRegistration.upsert({
      where: {
        email: normalizedEmail,
      },
      update: {
        username: resolvedUsername,
        passwordHash,
        marketingEmails: Boolean(marketingEmails),
        verificationCodeHash,
        verificationSentAt,
        verificationAttempts: 0,
        expiresAt,
      },
      create: {
        username: resolvedUsername,
        email: normalizedEmail,
        passwordHash,
        marketingEmails: Boolean(marketingEmails),
        verificationCodeHash,
        verificationSentAt,
        expiresAt,
      },
    });

    const emailDelivery = await sendVerificationCodeEmail({
      email: normalizedEmail,
      username: resolvedUsername,
      code: verificationCode,
      expiresAt,
    });

    res.status(202).json({
      message: "Enter the 6-digit code we sent to your email to finish creating your account.",
      email: normalizedEmail,
      emailDelivery,
      verificationPreviewCode: emailDelivery.provider.endsWith("PREVIEW") ? verificationCode : undefined,
    });
  })
);

authRouter.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const code = String(req.body.code || "").trim();
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail || !code) {
      throw new AppError(400, "Email and verification code are required.");
    }

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!pendingRegistration) {
      throw new AppError(400, "No pending sign-up was found for this email.");
    }

    if (pendingRegistration.expiresAt.getTime() <= Date.now()) {
      await prisma.pendingRegistration.delete({
        where: {
          id: pendingRegistration.id,
        },
      });

      throw new AppError(410, "This verification code has expired. Register again to get a new one.");
    }

    if (pendingRegistration.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      throw new AppError(429, "Too many incorrect verification attempts. Register again to continue.");
    }

    const submittedCodeHash = hashVerificationCode(normalizedEmail, code);

    if (submittedCodeHash !== pendingRegistration.verificationCodeHash) {
      await prisma.pendingRegistration.update({
        where: {
          id: pendingRegistration.id,
        },
        data: {
          verificationAttempts: {
            increment: 1,
          },
        },
      });

      throw new AppError(400, "The verification code is incorrect.");
    }

    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({
        where: {
          email: pendingRegistration.email,
        },
        select: {
          id: true,
        },
      }),
      prisma.user.findUnique({
        where: {
          username: pendingRegistration.username,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (existingUserByEmail || existingUserByUsername) {
      await prisma.pendingRegistration.delete({
        where: {
          id: pendingRegistration.id,
        },
      });

      throw new AppError(409, "This verification request can no longer be used. Please sign in instead.");
    }

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          username: pendingRegistration.username,
          email: pendingRegistration.email,
          password: pendingRegistration.passwordHash,
          marketingEmails: pendingRegistration.marketingEmails,
          cart: {
            create: {},
          },
          wishlist: {
            create: {},
          },
        },
      });

      await transaction.pendingRegistration.delete({
        where: {
          id: pendingRegistration.id,
        },
      });

      return createdUser;
    });

    let welcomeEmailDelivery: {
      recipient: string;
      status: string;
      sentAt: Date | null;
      provider: string;
    } | null = null;

    try {
      const welcomeEmail = buildWelcomeEmail(user.username);
      const delivery = await queueTransactionalEmail({
        userId: user.id,
        recipient: user.email,
        subject: welcomeEmail.subject,
        template: welcomeEmail.template,
        bodyText: welcomeEmail.bodyText,
        bodyHtml: welcomeEmail.bodyHtml,
      });

      welcomeEmailDelivery = {
        recipient: delivery.recipient,
        status: delivery.status,
        sentAt: delivery.sentAt,
        provider: delivery.provider,
      };
    } catch (_error) {
      welcomeEmailDelivery = null;
    }

    res.json({
      message: "Email confirmed. Your SteamLite account is ready.",
      email: user.email,
      username: user.username,
      welcomeEmailDelivery,
    });
  })
);

authRouter.post(
  "/resend-verification-code",
  registerRateLimit,
  asyncHandler(async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      throw new AppError(400, "Email is required.");
    }

    const pendingRegistration = await prisma.pendingRegistration.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!pendingRegistration) {
      throw new AppError(404, "No pending sign-up was found for this email.");
    }

    if (pendingRegistration.expiresAt.getTime() <= Date.now()) {
      await prisma.pendingRegistration.delete({
        where: {
          id: pendingRegistration.id,
        },
      });

      throw new AppError(410, "Your previous verification code expired. Register again to continue.");
    }

    if (Date.now() - pendingRegistration.verificationSentAt.getTime() < RESEND_VERIFICATION_COOLDOWN_MS) {
      throw new AppError(429, "Please wait a minute before requesting another verification code.");
    }

    const verificationCode = createVerificationCode();
    const updatedPending = await prisma.pendingRegistration.update({
      where: {
        id: pendingRegistration.id,
      },
      data: {
        verificationCodeHash: hashVerificationCode(normalizedEmail, verificationCode),
        verificationSentAt: new Date(),
        verificationAttempts: 0,
      },
    });

    const emailDelivery = await sendVerificationCodeEmail({
      email: updatedPending.email,
      username: updatedPending.username,
      code: verificationCode,
      expiresAt: updatedPending.expiresAt,
    });

    res.json({
      message: "A new verification code has been sent to your email.",
      email: updatedPending.email,
      emailDelivery,
      verificationPreviewCode: emailDelivery.provider.endsWith("PREVIEW") ? verificationCode : undefined,
    });
  })
);

authRouter.post(
  "/login",
  loginRateLimit,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!email || !password) {
      throw new AppError(400, "Email and password are required.");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      const pendingRegistration = await prisma.pendingRegistration.findUnique({
        where: {
          email: normalizedEmail,
        },
        select: {
          id: true,
          expiresAt: true,
        },
      });

      if (pendingRegistration) {
        if (pendingRegistration.expiresAt.getTime() <= Date.now()) {
          await prisma.pendingRegistration.delete({
            where: {
              id: pendingRegistration.id,
            },
          });

          throw new AppError(410, "Your verification code expired. Register again to continue.");
        }

        throw new AppError(403, "Please verify your email with the 6-digit code before signing in.");
      }

      throw new AppError(401, "Invalid email or password.");
    }

    if (user.deletedAt) {
      throw new AppError(403, "This account has been deleted permanently.");
    }

    if (user.isBanned) {
      throw new AppError(403, "This account has been banned.");
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new AppError(429, "Too many failed attempts. Please try again later.");
    }

    const isPasswordValid = await comparePassword(String(password), user.password);

    if (!isPasswordValid) {
      const nextAttemptCount = user.failedLoginAttempts + 1;
      const shouldLock = nextAttemptCount >= LOGIN_LOCK_THRESHOLD;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : nextAttemptCount,
          lockedUntil: shouldLock ? new Date(Date.now() + LOGIN_LOCK_WINDOW_MS) : null,
        },
      });

      if (shouldLock) {
        throw new AppError(429, "Too many failed attempts. Please try again later.");
      }

      throw new AppError(401, "Invalid email or password.");
    }

    const refreshedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = signToken({
      userId: refreshedUser.id,
      email: refreshedUser.email,
      username: refreshedUser.username,
      role: refreshedUser.role as Role,
    });

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: refreshedUser.id,
        username: refreshedUser.username,
        email: refreshedUser.email,
        role: refreshedUser.role,
        isBanned: refreshedUser.isBanned,
        marketingEmails: refreshedUser.marketingEmails,
      },
    });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user!.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isBanned: true,
        marketingEmails: true,
        deletedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    if (user.deletedAt) {
      throw new AppError(403, "This account has been deleted permanently.");
    }

    res.json({ user });
  })
);
