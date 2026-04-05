import bcrypt from "bcryptjs";

export const hashPassword = (value: string) => bcrypt.hash(value, 10);

export const comparePassword = (value: string, hashedValue: string) =>
  bcrypt.compare(value, hashedValue);
