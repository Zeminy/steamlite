import { Role } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/appError";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized."));
  }

  try {
    const token = header.split(" ")[1];
    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };

    next();
  } catch (_error) {
    next(new AppError(401, "Invalid or expired token."));
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden."));
    }

    next();
  };
