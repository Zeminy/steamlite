import { useEffect, useState } from "react";
import { Game, User } from "../types";
import { Link } from "react-router-dom";
import { StarRating } from "./StarRating";

type GameCardProps = {
  game: Game;
  currentUser: User | null;
  isWishlisted: boolean;
  isOwned: boolean;
  hasFullAccess: boolean;
  busy?: boolean;
  onAddToCart: (gameId: number) => void;
  onAddToWishlist: (gameId: number) => void;
};

export const GameCard = ({
  game,
  currentUser,
  isWishlisted,
  isOwned,
  hasFullAccess,
  busy,
  onAddToCart,
  onAddToWishlist,
}: GameCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const canBuy = currentUser?.role === "CUSTOMER" || currentUser?.role === "DEVELOPER";
  const addToCartLabel = hasFullAccess ? "Full access" : isOwned ? "Owned" : "Add to cart";
  const wishlistLabel = hasFullAccess
    ? "Full access"
    : isOwned
    ? "In library"
    : isWishlisted
    ? "In wishlist"
    : "Add to wishlist";
  const displayPrice = game.finalPrice ?? game.price;
  const basePrice = game.basePrice ?? game.price;

  useEffect(() => {
    setImageFailed(false);
  }, [game.coverImageUrl, game.id]);

  return (
    <article className="game-card">
      <Link
        to={`/games/${game.id}`}
        className={game.coverImageUrl && !imageFailed ? "game-banner game-banner-image" : "game-banner"}
        style={game.coverImageUrl && !imageFailed ? { backgroundImage: `url(${game.coverImageUrl})` } : undefined}
      >
        {game.coverImageUrl && !imageFailed ? (
          <img
            className="visually-hidden-image-probe"
            src={game.coverImageUrl}
            alt=""
            aria-hidden="true"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span>{game.title.slice(0, 2).toUpperCase()}</span>
        )}
      </Link>

      <div className="game-card-body">
        <div className="game-card-top">
          <div>
            <h3>
              <Link to={`/games/${game.id}`}>{game.title}</Link>
            </h3>
            <p className="muted">{game.developerCompany || "Independent studio"}</p>
          </div>
          <div className="price-block">
            <div className="price-tag">${displayPrice.toFixed(2)}</div>
            {game.isDiscounted && <div className="muted price-strike">${basePrice.toFixed(2)}</div>}
          </div>
        </div>

        <p className="game-description">{game.description}</p>

        <div className="meta-row">
          <span>Release: {new Date(game.releaseDate).toLocaleDateString()}</span>
          <span>
            Rating: <StarRating rating={game.averageRating || 0} size="small" />
          </span>
          <span>{game.reviewCount || 0} review(s)</span>
        </div>

        <div className="actions-row">
          <Link className="button button-secondary button-link" to={`/games/${game.id}`}>
            View details
          </Link>

          {canBuy && (
            <button
              className="button button-primary"
              disabled={busy || hasFullAccess || isOwned}
              onClick={() => onAddToCart(game.id)}
            >
              {addToCartLabel}
            </button>
          )}

          {canBuy && !hasFullAccess && !isOwned && (
            <button
              className="button button-secondary"
              disabled={busy || isWishlisted}
              onClick={() => onAddToWishlist(game.id)}
            >
              {wishlistLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
