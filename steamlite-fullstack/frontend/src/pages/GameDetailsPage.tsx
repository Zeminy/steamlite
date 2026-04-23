import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { GameDetail, LibraryItem, Wishlist } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { StarRating } from "../components/StarRating";

export const GameDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const gameId = Number(id);
  const [game, setGame] = useState<GameDetail | null>(null);
  const [wishlistGameIds, setWishlistGameIds] = useState<number[]>([]);
  const [libraryGameIds, setLibraryGameIds] = useState<number[]>([]);
  const [reviewForm, setReviewForm] = useState({
    rating: "5",
    comment: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);

  const loadGame = async () => {
    if (Number.isNaN(gameId)) {
      setMessage("Invalid game id.");
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<{ game: GameDetail }>(`/games/${gameId}`);
      setGame(response.game);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load game details.");
    } finally {
      setLoading(false);
    }
  };

  const loadUserGameState = async () => {
    if (!user || Number.isNaN(gameId)) {
      setWishlistGameIds([]);
      setLibraryGameIds([]);
      return;
    }

    try {
      const [wishlistResponse, libraryResponse] = await Promise.all([
        apiRequest<{ wishlist: Wishlist }>("/wishlist"),
        apiRequest<{ library: LibraryItem[] }>("/library/me"),
      ]);

      setWishlistGameIds(wishlistResponse.wishlist.items.map((item) => item.game.id));
      setLibraryGameIds(libraryResponse.library.map((item) => item.game.id));
    } catch (_error) {
      setWishlistGameIds([]);
      setLibraryGameIds([]);
    }
  };

  useEffect(() => {
    loadGame();
  }, [gameId]);

  useEffect(() => {
    setCoverFailed(false);
  }, [game?.coverImageUrl, game?.id]);

  useEffect(() => {
    loadUserGameState();
  }, [user?.id, gameId]);

  useEffect(() => {
    if (game && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("review-highlight");
          setTimeout(() => element.classList.remove("review-highlight"), 3000);
        }
      }, 500);
    }
  }, [game, window.location.hash]);

  useEffect(() => {
    if (!game || !user) {
      setReviewForm({
        rating: "5",
        comment: "",
      });
      return;
    }

    const existingReview = game.reviews.find((review) => review.userId === user.id);

    setReviewForm({
      rating: String(existingReview?.rating || 5),
      comment: existingReview?.comment || "",
    });
  }, [game, user?.id]);

  const ownReview = useMemo(
    () => game?.reviews.find((review) => review.userId === user?.id),
    [game, user?.id]
  );
  const canBuy = user?.role === "CUSTOMER" || user?.role === "DEVELOPER";
  const displayPrice = game?.finalPrice ?? game?.price ?? 0;
  const basePrice = game?.basePrice ?? game?.price ?? 0;

  const isOwned = libraryGameIds.includes(gameId);
  const hasFullAccess = Boolean(
    user && (user.role === "ADMIN" || (user.role === "DEVELOPER" && game?.developerUserId === user.id))
  );
  const canReview = Boolean(user);
  const isWishlisted = wishlistGameIds.includes(gameId);
  const wishlistLabel = isOwned ? "In library" : isWishlisted ? "In wishlist" : "Add to wishlist";

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setBusy("cart");
    setMessage("");

    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          gameId,
          quantity: 1,
        }),
      });

      await refreshCart();
      setMessage("Game added to cart.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to add game to cart.");
    } finally {
      setBusy(null);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setBusy("wishlist");
    setMessage("");

    try {
      await apiRequest(`/wishlist/${gameId}`, {
        method: "POST",
      });

      await loadUserGameState();
      setMessage("Game added to wishlist.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update wishlist.");
    } finally {
      setBusy(null);
    }
  };

  const handleReviewSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      navigate("/auth");
      return;
    }

    setBusy("review");
    setMessage("");

    try {
      await apiRequest(`/games/${gameId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });

      await loadGame();
      setMessage(ownReview ? "Review updated successfully." : "Review submitted successfully.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to save review.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p>Loading game details...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="panel empty-state">
        <h3>Game not found.</h3>
        <p>This title does not exist or could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="hero-grid">
        <div className="panel detail-cover">
          {game.coverImageUrl && !coverFailed ? (
            <img
              className="detail-cover-media"
              src={game.coverImageUrl}
              alt={game.title}
              onError={() => setCoverFailed(true)}
            />
          ) : (
            <span>{game.title.slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="panel stack-gap">
          <div>
            <span className="eyebrow">{game.genre || "Game details"}</span>
            <h2>{game.title}</h2>
            <p className="muted">{game.developerCompany || "Independent studio"}</p>
          </div>

          <p>{game.description}</p>

          <div className="meta-row">
            <span>Release: {new Date(game.releaseDate).toLocaleDateString()}</span>
            <span>
              Rating: <StarRating rating={game.averageRating || 0} size="small" />
            </span>
            <span>{game.reviewCount || 0} review(s)</span>
          </div>

          <div className="detail-actions">
            <div className="price-block">
              <div className="price-tag">${displayPrice.toFixed(2)}</div>
              {game.isDiscounted && (
                <>
                  <div className="muted price-strike">${basePrice.toFixed(2)}</div>
                  <div className="discount-badge">{game.discountPercent}% OFF</div>
                </>
              )}
            </div>
            {canBuy && (
              <button
                className="button button-primary"
                disabled={busy !== null || isOwned || hasFullAccess}
                onClick={handleAddToCart}
              >
                {hasFullAccess ? "Full access" : isOwned ? "Owned" : "Add to cart"}
              </button>
            )}
            {canBuy && !isOwned && !hasFullAccess && (
              <button
                className="button button-secondary"
                disabled={busy !== null || isWishlisted}
                onClick={handleAddToWishlist}
              >
                {wishlistLabel}
              </button>
            )}
          </div>

          {isOwned && <div className="status-banner">You already own this game in your library.</div>}
          {hasFullAccess && !isOwned && (
            <div className="status-banner">
              You already have full access to this game through your current role.
            </div>
          )}
          {!user && (
            <div className="status-banner">
              <Link to="/auth">Log in</Link> to add this game to your wishlist, cart, or review it later.
            </div>
          )}
          {message && <div className="status-banner">{message}</div>}
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Player reviews</span>
              <h2>Community feedback</h2>
            </div>
          </div>

          {!game.reviews.length ? (
            <div className="empty-state">
              <h3>No reviews yet.</h3>
              <p>Be the first player to leave feedback after purchasing the game.</p>
            </div>
          ) : (
            <div className="stack-gap">
              {game.reviews.map((review) => (
                <article key={review.id} id={`review-${review.id}`} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>{review.username || "Player"}</strong>
                      <div className="muted">{new Date(review.createdAt).toLocaleString()}</div>
                    </div>
                    <StarRating rating={review.rating} size="small" />
                  </div>
                  <p>{review.comment || "No comment provided."}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Review</span>
              <h2>{ownReview ? "Update your review" : "Write a review"}</h2>
            </div>
          </div>

          {!user ? (
            <div className="empty-state">
              <h3>Log in to review.</h3>
              <p>You need a SteamLite account before leaving a review.</p>
            </div>
          ) : !canReview ? (
            <div className="empty-state">
              <h3>Access required.</h3>
              <p>Only authenticated users can submit a review.</p>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleReviewSubmit}>
              <label>
                Rating
                <div style={{ marginTop: "0.5rem" }}>
                  <StarRating
                    rating={Number(reviewForm.rating)}
                    interactive
                    size="large"
                    onChange={(val) =>
                      setReviewForm((current) => ({ ...current, rating: String(val) }))
                    }
                  />
                </div>
              </label>

              <label>
                Comment
                <textarea
                  rows={6}
                  value={reviewForm.comment}
                  onChange={(event) =>
                    setReviewForm((current) => ({ ...current, comment: event.target.value }))
                  }
                  placeholder="Share what you liked, disliked, or what future players should know."
                />
              </label>

              <button className="button button-primary" type="submit" disabled={busy === "review"}>
                {busy === "review" ? "Saving..." : ownReview ? "Update review" : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
