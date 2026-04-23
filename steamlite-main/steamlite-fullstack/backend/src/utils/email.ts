import nodemailer, { type Transporter } from "nodemailer";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { AppError } from "./appError";

type EmailArgs = {
  userId?: number | null;
  orderId?: number | null;
  recipient: string;
  subject: string;
  template: string;
  bodyText: string;
  bodyHtml?: string;
};

type EmailTemplatePayload = {
  subject: string;
  template: string;
  bodyText: string;
  bodyHtml?: string;
};

let transporterPromise: Promise<Transporter> | null = null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const resolveProviderLabel = () => {
  const host = env.smtpHost.toLowerCase();

  if (host.includes("resend")) {
    return "RESEND_SMTP";
  }

  if (host.includes("sendgrid")) {
    return "SENDGRID_SMTP";
  }

  if (host.includes("gmail")) {
    return "GMAIL_SMTP";
  }

  return "SMTP";
};

const renderDefaultEmailHtml = ({
  heading,
  intro,
  bodyLines,
  actionLabel,
  actionUrl,
}: {
  heading: string;
  intro: string;
  bodyLines: string[];
  actionLabel?: string;
  actionUrl?: string;
}) =>
  `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0b1120;font-family:Segoe UI,Arial,sans-serif;color:#e2e8f0;">
    <div style="max-width:640px;margin:0 auto;padding:32px 18px;">
      <div style="background:#111827;border:1px solid rgba(148,163,184,0.18);border-radius:24px;overflow:hidden;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#0f766e,#f59e0b);color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;opacity:0.92;">SteamLite</div>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${escapeHtml(heading)}</h1>
          <p style="margin:12px 0 0;font-size:15px;line-height:1.6;opacity:0.95;">${escapeHtml(intro)}</p>
        </div>
        <div style="padding:26px 28px;">
          ${bodyLines
            .map((line) =>
              line
                ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#dbe4f0;">${escapeHtml(line)}</p>`
                : `<div style="height:6px;"></div>`
            )
            .join("")}
          ${
            actionLabel && actionUrl
              ? `<div style="margin-top:24px;">
                  <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:12px 18px;border-radius:14px;background:#f59e0b;color:#111827;font-weight:700;text-decoration:none;">
                    ${escapeHtml(actionLabel)}
                  </a>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
  </body>
</html>`;

const resolveDeliveryMeta = () => {
  if (env.emailDeliveryMode === "smtp") {
    return {
      status: "PENDING",
      provider: resolveProviderLabel(),
    };
  }

  if (env.emailDeliveryMode === "console") {
    return {
      status: "SIMULATED",
      provider: "CONSOLE_PREVIEW",
    };
  }

  return {
    status: "SIMULATED",
    provider: "APP_PREVIEW",
  };
};

const getTransporter = async () => {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    throw new AppError(
      500,
      "SMTP is enabled but SMTP_HOST, SMTP_USER, or SMTP_PASS is missing in the backend .env."
    );
  }

  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        requireTLS: env.smtpRequireTls,
        auth: {
          user: env.smtpUser,
          pass: env.smtpPass,
        },
      })
    );
  }

  return transporterPromise;
};

export const queueTransactionalEmail = async ({
  userId,
  orderId,
  recipient,
  subject,
  template,
  bodyText,
  bodyHtml,
}: EmailArgs) => {
  const deliveryMeta = resolveDeliveryMeta();
  const delivery = await prisma.emailDelivery.create({
    data: {
      userId: userId ?? null,
      orderId: orderId ?? null,
      recipient,
      subject,
      template,
      bodyText,
      status: deliveryMeta.status,
      provider: deliveryMeta.provider,
    },
  });

  if (env.emailDeliveryMode === "smtp") {
    try {
      const transporter = await getTransporter();

      await transporter.sendMail({
        from: `"${env.emailFromName}" <${env.emailFromAddress}>`,
        to: recipient,
        replyTo: env.emailReplyTo,
        subject,
        text: bodyText,
        html: bodyHtml || `<pre style="font-family:Segoe UI,Arial,sans-serif;white-space:pre-wrap;">${escapeHtml(bodyText)}</pre>`,
      });

      return prisma.emailDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: "SENT",
          provider: deliveryMeta.provider,
          sentAt: new Date(),
        },
      });
    } catch (_error) {
      await prisma.emailDelivery.update({
        where: {
          id: delivery.id,
        },
        data: {
          status: "FAILED",
          provider: deliveryMeta.provider,
        },
      });

      throw new AppError(
        502,
        "SteamLite could not send the transactional email right now. Check SMTP settings and try again."
      );
    }
  }

  if (env.emailDeliveryMode === "console") {
    console.log("SteamLite email preview");
    console.log(`To: ${recipient}`);
    console.log(`Subject: ${subject}`);
    console.log(bodyText);
  }

  return delivery;
};

export const buildWelcomeEmail = (username: string): EmailTemplatePayload => ({
  subject: "Welcome to SteamLite",
  template: "WELCOME",
  bodyText: [
    `Hi ${username},`,
    "",
    "Thanks for verifying your email and activating your SteamLite account.",
    "You can now browse the catalog, save games to your wishlist, and complete purchases from your verified account email.",
    "",
    `If this was not you, contact ${env.supportEmail} immediately.`,
    "",
    "See you in the store,",
    "SteamLite",
  ].join("\n"),
  bodyHtml: renderDefaultEmailHtml({
    heading: "Welcome to SteamLite",
    intro: "Your account is verified and ready for your next game purchase.",
    bodyLines: [
      `Hi ${username},`,
      "Thanks for verifying your email and activating your SteamLite account.",
      "You can now browse the catalog, save games to your wishlist, and complete purchases from your verified account email.",
      `If this was not you, contact ${env.supportEmail} immediately.`,
      "See you in the store,",
      "SteamLite",
    ],
  }),
});

export const buildVerificationEmail = (args: {
  username: string;
  verificationCode: string;
  expiresAt: Date;
}): EmailTemplatePayload => ({
  subject: "Your SteamLite verification code",
  template: "ACCOUNT_VERIFICATION_CODE",
  bodyText: [
    `Hi ${args.username},`,
    "",
    "Thanks for starting your SteamLite registration.",
    "Use this 6-digit code to finish creating your account:",
    args.verificationCode,
    "",
    `This code expires on ${args.expiresAt.toLocaleString()}.`,
    `If you did not request this, ignore this message or contact ${env.supportEmail}.`,
    "",
    "See you in the store,",
    "SteamLite",
  ].join("\n"),
  bodyHtml: renderDefaultEmailHtml({
    heading: "Verify your SteamLite account",
    intro: "Enter this 6-digit code in the app to finish creating your account.",
    bodyLines: [
      `Hi ${args.username},`,
      "Thanks for starting your SteamLite registration.",
      `Your verification code is: ${args.verificationCode}`,
      `This code expires on ${args.expiresAt.toLocaleString()}.`,
      `If you did not request this, ignore this message or contact ${env.supportEmail}.`,
      "See you in the store,",
      "SteamLite",
    ],
  }),
});

export const buildOrderConfirmationEmail = (args: {
  username: string;
  orderId: number;
  confirmationCode: string;
  totalAmount: number;
  itemTitles: string[];
}): EmailTemplatePayload => ({
  subject: `SteamLite order #${args.orderId} confirmed`,
  template: "ORDER_CONFIRMATION",
  bodyText: [
    `Hi ${args.username},`,
    "",
    "Thanks for your purchase on SteamLite.",
    "We appreciate your support and hope you enjoy your new games.",
    `Order ID: #${args.orderId}`,
    `Confirmation code: ${args.confirmationCode}`,
    `Total charged: $${args.totalAmount.toFixed(2)}`,
    `Games added to your library: ${args.itemTitles.join(", ")}`,
    "",
    "Your library has been updated and your receipt is attached to your account history.",
    "",
    `Need help? Contact ${env.supportEmail}.`,
    "",
    "Enjoy your games,",
    "SteamLite",
  ].join("\n"),
  bodyHtml: renderDefaultEmailHtml({
    heading: "Purchase confirmed",
    intro: "Thanks for your order. Your receipt is ready and the games are now in your library.",
    bodyLines: [
      `Hi ${args.username},`,
      "Thanks for your purchase on SteamLite.",
      "We appreciate your support and hope you enjoy your new games.",
      `Order ID: #${args.orderId}`,
      `Confirmation code: ${args.confirmationCode}`,
      `Total charged: $${args.totalAmount.toFixed(2)}`,
      `Games added to your library: ${args.itemTitles.join(", ")}`,
      "Your library has been updated and your receipt is attached to your account history.",
      `Need help? Contact ${env.supportEmail}.`,
      "Enjoy your games,",
      "SteamLite",
    ],
  }),
});
