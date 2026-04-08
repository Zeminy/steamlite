export const ROLES = ["CUSTOMER", "DEVELOPER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PAYMENT_METHODS = ["CREDIT_CARD", "PAYPAL", "MOMO", "BANK_TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
