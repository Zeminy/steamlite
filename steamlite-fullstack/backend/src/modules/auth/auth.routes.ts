import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { comparePassword, hashPassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { requireAuth } from "../../middlewares/auth";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new AppError(400, "Username, email and password are required.");
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: String(username).trim() }],
      },
    });

    if (existingUser) {
      throw new AppError(409, "Username or email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        username: String(username).trim(),
        email: normalizedEmail,
        password: await hashPassword(String(password)),
        cart: {
          create: {},
        },
        wishlist: {
          create: {},
        },
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, "Email and password are required.");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: String(email).trim().toLowerCase(),
      },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password.");
    }

    const isPasswordValid = await comparePassword(String(password), user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password.");
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
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
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    res.json({ user });
  })
);
