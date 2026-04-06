import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { AppError } from "../../utils/appError";
import { generateAssistantReply } from "./assistant.service";

export const assistantRouter = Router();

assistantRouter.post(
  "/chat",
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = String(req.body.message || "").trim();
    const history = Array.isArray(req.body.history)
      ? req.body.history
          .map((entry) => ({
            role: entry?.role === "assistant" ? "assistant" : "user",
            content: String(entry?.content || "").trim(),
          }))
          .filter((entry) => entry.content)
          .slice(-8)
      : [];

    if (!message) {
      throw new AppError(400, "A message is required.");
    }

    const reply = await generateAssistantReply({
      user: req.user!,
      message,
      history,
    });

    res.json(reply);
  })
);
