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

export const env = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  platformCommissionRate: normalizedCommissionRate,
  aiKey: process.env.AI_KEY || process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || "",
  aiBaseUrl: process.env.AI_BASE_URL || "https://api.groq.com/openai/v1",
  aiModel: process.env.AI_MODEL || "openai/gpt-oss-20b",
  aiWebSearchEnabled: parsedWebSearchEnabled,
  aiReasoningEffort: normalizedReasoningEffort,
};
