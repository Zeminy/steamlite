import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

type RateEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateEntry>();

type Options = {
  key: string;
  maxAttempts: number;
  windowMs: number;
};

export const createRateLimit =
  ({ key, maxAttempts, windowMs }: Options) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const identifier = `${key}:${req.ip || "unknown"}`;
    const now = Date.now();
    const existing = buckets.get(identifier);

    if (!existing || existing.resetAt <= now) {
      buckets.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= maxAttempts) {
      return next(new AppError(429, "Too many attempts. Please wait a few minutes and try again."));
    }

    existing.count += 1;
    buckets.set(identifier, existing);
    return next();
  };
