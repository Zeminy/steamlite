const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,72}$/;

export const normalizeEmail = (value: string) => String(value || "").trim().toLowerCase();

export const isValidEmailAddress = (value: string) => {
  const email = normalizeEmail(value);
  return emailPattern.test(email) && !email.endsWith(".local");
};

export const isStrongPassword = (value: string) => passwordPattern.test(String(value || ""));

export const getPasswordPolicyMessage = () =>
  "Password must be 10-72 characters and include uppercase, lowercase, number, and symbol.";

export const normalizeDisplayName = (value: string) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

export const isValidDisplayName = (value: string) => {
  const displayName = normalizeDisplayName(value);
  return displayName.length >= 3 && displayName.length <= 32;
};
