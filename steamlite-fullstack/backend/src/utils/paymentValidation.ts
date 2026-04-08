import { PaymentMethod } from "../types/domain";

type PaymentValidationResult = {
  providerReference: string;
  cardBrand?: string | null;
  last4?: string | null;
};

const digitsOnly = (value: string) => String(value || "").replace(/\D/g, "");

const luhnCheck = (cardNumber: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const detectCardBrand = (cardNumber: string) => {
  if (/^4/.test(cardNumber)) {
    return "VISA";
  }

  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(cardNumber)) {
    return "MASTERCARD";
  }

  if (/^3[47]/.test(cardNumber)) {
    return "AMEX";
  }

  return "CARD";
};

export const validatePaymentDetails = (
  paymentMethod: PaymentMethod,
  paymentDetails: Record<string, unknown> | null | undefined
): PaymentValidationResult => {
  const details = paymentDetails || {};

  if (paymentMethod === "CREDIT_CARD") {
    const cardholderName = String(details.cardholderName || "").trim();
    const cardNumber = digitsOnly(String(details.cardNumber || ""));
    const expiryMonth = Number(details.expiryMonth);
    const expiryYear = Number(details.expiryYear);
    const cvv = digitsOnly(String(details.cvv || ""));

    if (cardholderName.length < 2) {
      throw new Error("Cardholder name is required.");
    }

    if (cardNumber.length < 13 || cardNumber.length > 19 || !luhnCheck(cardNumber)) {
      throw new Error("Card number is invalid.");
    }

    if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
      throw new Error("Card expiry month is invalid.");
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (!Number.isInteger(expiryYear) || expiryYear < currentYear || expiryYear > currentYear + 20) {
      throw new Error("Card expiry year is invalid.");
    }

    if (expiryYear === currentYear && expiryMonth < currentMonth) {
      throw new Error("Card has expired.");
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      throw new Error("Security code is invalid.");
    }

    return {
      providerReference: `CARD-${Date.now()}`,
      cardBrand: detectCardBrand(cardNumber),
      last4: cardNumber.slice(-4),
    };
  }

  if (paymentMethod === "PAYPAL") {
    const paypalEmail = String(details.paypalEmail || "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(paypalEmail)) {
      throw new Error("PayPal email is invalid.");
    }

    return {
      providerReference: `PAYPAL-${Date.now()}`,
      cardBrand: null,
      last4: null,
    };
  }

  if (paymentMethod === "MOMO") {
    const phone = digitsOnly(String(details.phone || ""));

    if (!/^0\d{9,10}$/.test(phone)) {
      throw new Error("MoMo phone number is invalid.");
    }

    return {
      providerReference: `MOMO-${Date.now()}`,
      cardBrand: null,
      last4: phone.slice(-4),
    };
  }

  if (paymentMethod === "BANK_TRANSFER") {
    const bankName = String(details.bankName || "").trim();
    const accountName = String(details.accountName || "").trim();

    if (bankName.length < 2 || accountName.length < 2) {
      throw new Error("Bank transfer details are incomplete.");
    }

    return {
      providerReference: `BANK-${Date.now()}`,
      cardBrand: bankName.toUpperCase(),
      last4: null,
    };
  }

  throw new Error("Unsupported payment method.");
};
