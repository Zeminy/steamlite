import dotenv from "dotenv";

dotenv.config();

const parsedCommissionRate = Number(process.env.PLATFORM_COMMISSION_RATE || 0.3);
const normalizedCommissionRate =
  Number.isFinite(parsedCommissionRate) && parsedCommissionRate >= 0 && parsedCommissionRate <= 1
    ? parsedCommissionRate
    : 0.3;
const truthyValues = new Set(["1", "true", "yes", "on"]);
const parsedWebSearchEnabled = truthyValues.has((process.env.AI_WEB_SEARCH_ENABLED || "").toLowerCase());
const parsedReasoningEffort = (process.env.AI_REASONING_EFFORT || "low").toLowerCase();
const normalizedReasoningEffort =
  parsedReasoningEffort === "minimal" ||
  parsedReasoningEffort === "low" ||
  parsedReasoningEffort === "medium" ||
  parsedReasoningEffort === "high"
    ? parsedReasoningEffort
    : "low";
const parsedVerificationWindowHours = Number(process.env.EMAIL_VERIFICATION_TTL_HOURS || 24);
const normalizedVerificationWindowHours =
  Number.isFinite(parsedVerificationWindowHours) && parsedVerificationWindowHours >= 1
    ? parsedVerificationWindowHours
    : 24;
const parsedSmtpPort = Number(process.env.SMTP_PORT || 465);
const normalizedSmtpPort = Number.isFinite(parsedSmtpPort) && parsedSmtpPort > 0 ? parsedSmtpPort : 465;
const parsedSmtpSecure = truthyValues.has((process.env.SMTP_SECURE || "").toLowerCase());
const parsedSmtpRequireTls = truthyValues.has((process.env.SMTP_REQUIRE_TLS || "").toLowerCase());

export const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  platformCommissionRate: normalizedCommissionRate,
  emailDeliveryMode: (process.env.EMAIL_DELIVERY_MODE || "preview").toLowerCase(),
  emailVerificationTtlHours: normalizedVerificationWindowHours,
  emailFromName: process.env.EMAIL_FROM_NAME || "SteamLite",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "noreply@steamlite-demo.com",
  emailReplyTo: process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "support@steamlite-demo.com",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: normalizedSmtpPort,
  smtpSecure: parsedSmtpSecure || normalizedSmtpPort === 465,
  smtpRequireTls: parsedSmtpRequireTls,
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  supportEmail: process.env.SUPPORT_EMAIL || "support@steamlite-demo.com",
  aiKey: process.env.AI_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "",
  aiBaseUrl: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1",
  aiModel: process.env.AI_MODEL || "openai/gpt-oss-20b",
  aiWebSearchEnabled: parsedWebSearchEnabled,
  aiReasoningEffort: normalizedReasoningEffort,
};
