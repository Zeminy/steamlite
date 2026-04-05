import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "../api/client";
import { Wishlist } from "../types";
import { useCart } from "../context/CartContext";

export const WishlistPage = () => {
  const { refreshCart } = useCart();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    setLoading(true);

    try {
      const response = await apiRequest<{ wishlist: Wishlist }>("/wishlist");
      setWishlist(response.wishlist);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeFromWishlist = async (gameId: number) => {
    try {
      const response = await apiRequest<{ wishlist: Wishlist }>(`/wishlist/${gameId}`, {
        method: "DELETE",
      });
      setWishlist(response.wishlist);
      setMessage("Game removed from wishlist.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update wishlist.");
    }
  };

  const addToCart = async (gameId: number) => {
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
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Wishlist</span>
            <h2>Saved games</h2>
          </div>
          <button className="button button-secondary" onClick={loadWishlist}>
            Refresh
          </button>
        </div>

        {message && <div className="status-banner">{message}</div>}

        {!wishlist || wishlist.items.length === 0 ? (
          <div className="empty-state">
            <h3>Your wishlist is empty.</h3>
            <p>Browse the store and save games to revisit them later.</p>
          </div>
        ) : (
          <div className="list-grid">
            {wishlist.items.map((item) => (
              <article key={item.id} className="panel list-card">
                <div>
                  <h3>{item.game.title}</h3>
                  <p className="muted">{item.game.developerCompany}</p>
                  <p>{item.game.description}</p>
                </div>

                <div className="list-card-actions">
                  <strong>${item.game.price.toFixed(2)}</strong>
                  <button className="button button-primary" onClick={() => addToCart(item.game.id)}>
                    Add to cart
                  </button>
                  <button
                    className="button button-secondary"
                    onClick={() => removeFromWishlist(item.game.id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
