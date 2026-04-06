const toxicKeywords = [
  "trash",
  "garbage",
  "idiot",
  "stupid",
  "scam",
  "liar",
  "hate",
  "fraud",
  "kill",
  "toxic",
];

const negativeKeywords = [
  "bad",
  "boring",
  "weak",
  "bug",
  "broken",
  "grindy",
  "slow",
  "overpriced",
  "confusing",
  "repetitive",
  "unfinished",
];

const normalizeForModeration = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countKeywordHits = (text: string, keywords: string[]) =>
  keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);

export const getReviewModerationReasons = ({
  comment,
  rating,
}: {
  comment?: string | null;
  rating: number;
}) => {
  const normalizedComment = normalizeForModeration(comment || "");
  const reasons: string[] = [];

  if (countKeywordHits(normalizedComment, toxicKeywords) > 0) {
    reasons.push("contains hostile or toxic language");
  }

  if (rating <= 2 && countKeywordHits(normalizedComment, negativeKeywords) >= 2) {
    reasons.push("looks like aggressive score manipulation");
  }

  if (!normalizedComment && rating <= 2) {
    reasons.push("very low score with no explanation");
  }

  return reasons;
};
