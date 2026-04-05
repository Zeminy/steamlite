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

export const parseGamePrice = (value: unknown) => {
  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return Number(price.toFixed(2));
};

export const parseGameReleaseDate = (value: unknown) => {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const parseOptionalDeveloperId = (value: unknown) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const developerId = Number(value);

  if (!Number.isInteger(developerId) || developerId < 1) {
    return null;
  }

  return developerId;
};

export const parseOptionalText = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
};
