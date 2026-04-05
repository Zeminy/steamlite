import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";

export const errorHandler = (
  error: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;

    return res.status(400).json({
      message: "Database request failed.",
      code: prismaError.code,
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error.",
  });
};
