export const gameWithRelationsInclude = {
  developer: true,
  reviews: true,
} as const;

export const gameDetailInclude = {
  developer: true,
  reviews: {
    include: {
      user: {
        select: { username: true },
      },
    },
    orderBy: { createdAt: "desc" as const },
  },
} as const;

export const parseReviewRating = (value: unknown) => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return null;
  }

  return rating;
};
