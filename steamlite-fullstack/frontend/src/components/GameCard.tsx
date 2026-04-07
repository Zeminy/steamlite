import { Game, User } from "../types";
import { Link } from "react-router-dom";

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
  const addToCartLabel = hasFullAccess ? "Full access" : isOwned ? "Owned" : "Add to cart";
  const displayPrice = game.finalPrice ?? game.price;
  const basePrice = game.basePrice ?? game.price;

  return (
    <article className="game-card">
      <Link
        to={`/games/${game.id}`}
        className={game.coverImageUrl ? "game-banner game-banner-image" : "game-banner"}
        style={game.coverImageUrl ? { backgroundImage: `url(${game.coverImageUrl})` } : undefined}
      >
        {!game.coverImageUrl && <span>{game.title.slice(0, 2).toUpperCase()}</span>}
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
          <span>Rating: {game.averageRating || 0} / 5</span>
          <span>{game.reviewCount || 0} review(s)</span>
        </div>

        <div className="actions-row">
          <Link className="button button-secondary button-link" to={`/games/${game.id}`}>
            View details
          </Link>

          <button
            className="button button-primary"
            disabled={busy || hasFullAccess || isOwned}
            onClick={() => onAddToCart(game.id)}
          >
            {addToCartLabel}
          </button>

          {currentUser && (
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => onAddToWishlist(game.id)}
            >
              {isWishlisted ? "In wishlist" : "Add to wishlist"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
