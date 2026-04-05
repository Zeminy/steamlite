import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { verifyToken } from "../utils/jwt";
import { AppError } from "../utils/appError";
import { Role } from "../types/domain";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized."));
  }

  let payload;

  try {
    const token = header.split(" ")[1];
    payload = verifyToken(token);
  } catch (_error) {
    return next(new AppError(401, "Invalid or expired token."));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isBanned: true,
      },
    });

    if (!user) {
      return next(new AppError(401, "User no longer exists."));
    }

    if (user.isBanned) {
      return next(new AppError(403, "This account has been banned."));
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as Role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireRole =
  (roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Forbidden."));
    }

    next();
  };
