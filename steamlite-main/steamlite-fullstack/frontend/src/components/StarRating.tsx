import { useState } from "react";

type StarRatingProps = {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "small" | "medium" | "large";
};

export const StarRating = ({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = "medium",
}: StarRatingProps) => {
  const [hover, setHover] = useState(0);

  const stars = Array.from({ length: max }, (_, i) => i + 1);

  const getStarClass = (starValue: number) => {
    const value = interactive && hover > 0 ? hover : rating;
    let className = "star";
    if (starValue <= value) className += " star-filled";
    if (interactive) className += " star-interactive";
    className += ` star-${size}`;
    return className;
  };

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={getStarClass(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};
