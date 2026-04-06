import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { Game, Wishlist } from "../types";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { GameCard } from "../components/GameCard";

export const StorePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [games, setGames] = useState<Game[]>([]);
  const [wishlistGameIds, setWishlistGameIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyGameId, setBusyGameId] = useState<number | null>(null);

  const loadGames = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ games: Game[] }>(
        `/games?q=${encodeURIComponent(search)}&sort=${encodeURIComponent(sort)}`
      );
      setGames(response.games);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load games.");
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user) {
      setWishlistGameIds([]);
      return;
    }

    try {
      const response = await apiRequest<{ wishlist: Wishlist }>("/wishlist");
      setWishlistGameIds(response.wishlist.items.map((item) => item.game.id));
    } catch (_error) {
      setWishlistGameIds([]);
    }
  };

  useEffect(() => {
    loadGames();
  }, [search, sort]);

  useEffect(() => {
    loadWishlist();
  }, [user?.id]);

  const handleAddToCart = async (gameId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setBusyGameId(gameId);
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
      setMessage(error instanceof ApiError ? error.message : "Failed to add game to cart.");
    } finally {
      setBusyGameId(null);
    }
  };

  const handleToggleWishlist = async (gameId: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setBusyGameId(gameId);
    setMessage("");

    try {
      const isWishlisted = wishlistGameIds.includes(gameId);

      if (isWishlisted) {
        await apiRequest(`/wishlist/${gameId}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest(`/wishlist/${gameId}`, {
          method: "POST",
        });
      }

      await loadWishlist();
      setMessage(isWishlisted ? "Game removed from wishlist." : "Game added to wishlist.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Failed to update wishlist.");
    } finally {
      setBusyGameId(null);
    }
  };

  const summary = useMemo(
    () => ({
      count: games.length,
      cheapest: games.length ? Math.min(...games.map((game) => game.price)).toFixed(2) : "0.00",
    }),
    [games]
  );

  return (
    <div className="stack-gap">
      <section className="hero-grid">
        <div className="panel">
          <span className="eyebrow">Storefront</span>
          <h2>Browse and search games</h2>
          <p>
            This page implements the report's main customer flow: find games, inspect the catalog,
            add items to cart, and save them to a wishlist.
          </p>
          <div className="stats-inline">
            <div className="mini-stat">
              <strong>{summary.count}</strong>
              <span>Games loaded</span>
            </div>
            <div className="mini-stat">
              <strong>${summary.cheapest}</strong>
              <span>Lowest price</span>
            </div>
          </div>
        </div>

        <div className="panel filter-panel">
          <label>
            Search title, developer, genre or description
            <input
              placeholder="Try: tactics, racing, indieforge, story..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <label>
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest release</option>
              <option value="priceAsc">Price: low to high</option>
              <option value="priceDesc">Price: high to low</option>
              <option value="title">Title A-Z</option>
            </select>
          </label>

          {!user && (
            <div className="status-banner">
              Log in to use wishlist, cart and checkout features.
            </div>
          )}
        </div>
      </section>

      {message && <div className="status-banner">{message}</div>}

      {loading ? (
        <div className="panel">
          <p>Loading games...</p>
        </div>
      ) : games.length ? (
        <section className="game-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              currentUser={user}
              isWishlisted={wishlistGameIds.includes(game.id)}
              busy={busyGameId === game.id}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </section>
      ) : (
        <div className="panel empty-state">
          <h3>No games matched your filters.</h3>
          <p>Change the keyword or sort option and try again.</p>
        </div>
      )}
    </div>
  );
};
