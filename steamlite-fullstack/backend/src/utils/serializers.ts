import { calculateDiscountedPrice } from "./pricing";

export const serializeGame = (game: any) => {
  const ratings = (game.reviews || []).map((review: any) => review.rating);
  const averageRating = ratings.length
    ? Number(
        (ratings.reduce((total: number, rating: number) => total + rating, 0) / ratings.length).toFixed(1)
      )
    : 0;
  const pricing = calculateDiscountedPrice(game.price, game.discountPercent || 0);

  return {
    id: game.id,
    title: game.title,
    description: game.description,
    price: game.price,
    basePrice: pricing.basePrice,
    discountPercent: pricing.discountPercent,
    finalPrice: pricing.finalPrice,
    isDiscounted: pricing.isDiscounted,
    genre: game.genre,
    coverImageUrl: game.coverImageUrl,
    releaseDate: game.releaseDate,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    developerId: game.developerId,
    developerUserId: game.developer?.userId || null,
    developerCompany: game.developer?.company || "Independent",
    reviewCount: ratings.length,
    averageRating,
  };
};

export const serializeReview = (review: any) => ({
  id: review.id,
  username: review.user?.username,
  userId: review.userId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt,
});

export const serializeCart = (cart: any) => {
  const items = (cart.items || []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    game: serializeGame(item.game),
    lineTotal: Number((item.quantity * calculateDiscountedPrice(item.game.price, item.game.discountPercent || 0).finalPrice).toFixed(2)),
  }));

  const totalItems = items.reduce((count: number, item: any) => count + item.quantity, 0);
  const totalAmount = Number(
    items.reduce((sum: number, item: any) => sum + item.lineTotal, 0).toFixed(2)
  );

  return {
    id: cart.id,
    userId: cart.userId,
    totalItems,
    totalAmount,
    items,
  };
};

export const serializeOrder = (order: any) => ({
  id: order.id,
  userId: order.userId,
  orderDate: order.orderDate,
  totalAmount: order.totalAmount,
  platformRevenue: order.platformRevenue,
  developerRevenue: order.developerRevenue,
  commissionRate: order.commissionRate,
  status: order.status,
  payment: order.payment
    ? {
        id: order.payment.id,
        amount: order.payment.amount,
        paymentDate: order.payment.paymentDate,
        paymentMethod: order.payment.paymentMethod,
        status: order.payment.status,
      }
    : null,
  items: (order.items || []).map((item: any) => {
    const fallbackFinalUnitPrice =
      item.finalUnitPrice && item.finalUnitPrice > 0
        ? item.finalUnitPrice
        : item.baseUnitPrice && item.baseUnitPrice > 0
        ? item.baseUnitPrice
        : calculateDiscountedPrice(item.game.price, item.game.discountPercent || 0).finalPrice;

    return {
      id: item.id,
      quantity: item.quantity,
      game: serializeGame(item.game),
      baseUnitPrice: item.baseUnitPrice,
      discountPercent: item.discountPercent,
      finalUnitPrice: fallbackFinalUnitPrice,
      lineTotal: Number((item.quantity * fallbackFinalUnitPrice).toFixed(2)),
    };
  }),
});

export const serializeLibraryItem = (libraryItem: any) => ({
  id: libraryItem.id,
  purchasedAt: libraryItem.purchasedAt,
  game: serializeGame(libraryItem.game),
});
