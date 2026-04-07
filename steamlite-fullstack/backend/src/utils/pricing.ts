export const normalizeDiscountPercent = (discountPercent: number) => {
  if (!Number.isFinite(discountPercent)) {
    return 0;
  }

  if (discountPercent < 0) {
    return 0;
  }

  if (discountPercent > 90) {
    return 90;
  }

  return Number(discountPercent.toFixed(2));
};

export const calculateDiscountedPrice = (price: number, discountPercent = 0) => {
  const normalizedPrice = Number(price.toFixed(2));
  const normalizedDiscount = normalizeDiscountPercent(discountPercent);
  const finalPrice = Number((normalizedPrice * (1 - normalizedDiscount / 100)).toFixed(2));

  return {
    basePrice: normalizedPrice,
    discountPercent: normalizedDiscount,
    finalPrice,
    isDiscounted: normalizedDiscount > 0,
  };
};
