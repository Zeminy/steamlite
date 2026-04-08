import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../types/domain";

export type JwtPayload = {
  userId: number;
  email: string;
  username: string;
  role: Role;
};

export const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.jwtSecret) as JwtPayload & { iat: number; exp: number };
