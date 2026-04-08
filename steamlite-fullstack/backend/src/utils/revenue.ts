import { env } from "../config/env";

export const PLATFORM_COMMISSION_RATE = env.platformCommissionRate;
export const DEVELOPER_REVENUE_RATE = Number((1 - PLATFORM_COMMISSION_RATE).toFixed(4));

export const calculateRevenueSplit = (grossAmount: number) => {
  const normalizedGross = Number(grossAmount.toFixed(2));
  const platformRevenue = Number((normalizedGross * PLATFORM_COMMISSION_RATE).toFixed(2));
  const developerRevenue = Number((normalizedGross - platformRevenue).toFixed(2));

  return {
    grossRevenue: normalizedGross,
    platformRevenue,
    developerRevenue,
    commissionRate: PLATFORM_COMMISSION_RATE,
  };
};

export const calculateLineRevenueSplit = (unitPrice: number, quantity = 1) =>
  calculateRevenueSplit(unitPrice * quantity);
