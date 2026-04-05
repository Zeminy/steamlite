export const serializeGame = (game: any) => {
  const ratings = (game.reviews || []).map((review: any) => review.rating);
  const averageRating = ratings.length
    ? Number(
        (ratings.reduce((total: number, rating: number) => total + rating, 0) / ratings.length).toFixed(1)
      )
    : 0;

  return {
    id: game.id,
    title: game.title,
    description: game.description,
    price: game.price,
    releaseDate: game.releaseDate,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
    developerId: game.developerId,
    developerCompany: game.developer?.company || "Independent",
    reviewCount: ratings.length,
    averageRating,
  };
};

export const serializeCart = (cart: any) => {
  const items = (cart.items || []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    game: serializeGame(item.game),
    lineTotal: Number((item.quantity * item.game.price).toFixed(2)),
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
  items: (order.items || []).map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    game: serializeGame(item.game),
    lineTotal: Number((item.quantity * item.game.price).toFixed(2)),
  })),
});
