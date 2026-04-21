import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "../api/client";
import { Game, GamePayload, DeveloperOverview } from "../types";
import { AdminGameForm } from "../components/AdminGameForm";

export const DeveloperGamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadGames = async (resetMessage = true) => {
    setLoading(true);
    if (resetMessage) {
      setMessage("");
    }

    try {
      const [gamesResponse, overviewResponse] = await Promise.all([
        apiRequest<{ games: Game[] }>("/games/mine"),
        apiRequest<{ overview: DeveloperOverview }>("/developer/overview"),
      ]);
      setGames(gamesResponse.games);
      setOverview(overviewResponse.overview);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load your games.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const submitGame = async (payload: GamePayload) => {
    try {
      if (selectedGame) {
        await apiRequest(`/games/mine/${selectedGame.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Game updated successfully.");
      } else {
        await apiRequest("/games", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Game created successfully.");
      }

      setSelectedGame(null);
      await loadGames(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to save your game.");
    }
  };

  const deleteGame = async (gameId: number) => {
    if (!window.confirm("Delete this game from your catalog? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/games/mine/${gameId}`, {
        method: "DELETE",
      });
      setMessage("Game deleted successfully.");
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
      await loadGames(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete your game.");
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p>Loading your games...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Developer</span>
            <h2>Manage your published games</h2>
          </div>
          <button className="button button-secondary" onClick={() => loadGames()}>
            Refresh
          </button>
        </div>

        <p className="muted">
          This screen covers the developer use case from the diagram: create, edit, and remove only
          the games that belong to your own developer profile.
        </p>

        {overview && (
          <div className="stat-grid">
            <article className="stat-card">
              <span>My games</span>
              <strong>{overview.gamesCount}</strong>
            </article>
            <article className="stat-card">
              <span>Total sales</span>
              <strong>{overview.totalSalesCount}</strong>
            </article>
            <article className="stat-card">
              <span>Gross revenue</span>
              <strong>${overview.grossRevenue.toFixed(2)}</strong>
            </article>
            <article className="stat-card">
              <span>Platform fee ({Math.round(overview.commissionRate * 100)}%)</span>
              <strong>${overview.platformRevenue.toFixed(2)}</strong>
            </article>
            <article className="stat-card">
              <span>My earnings</span>
              <strong>${overview.developerRevenue.toFixed(2)}</strong>
            </article>
          </div>
        )}

        {message && <div className="status-banner">{message}</div>}
      </section>

      <section className="dashboard-grid">
        <AdminGameForm
          developers={[]}
          heading={selectedGame ? "Edit your game" : "Create a new game"}
          showDeveloperField={false}
          showDiscountField={false}
          selectedGame={selectedGame}
          onSubmit={submitGame}
          onCancel={() => setSelectedGame(null)}
        />

        <div className="panel">
          <div className="section-header">
            <h3>Your catalog</h3>
            <span className="muted">{games.length} game(s)</span>
          </div>

          {!games.length ? (
            <div className="empty-state">
              <h3>No games yet.</h3>
              <p>Create your first title from the form on the left.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Release</th>
                    <th>Reviews</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr key={game.id}>
                      <td>{game.title}</td>
                      <td>{game.genre || "Uncategorized"}</td>
                      <td>
                        {game.isDiscounted ? (
                          <div>
                            <div>${(game.finalPrice || game.price).toFixed(2)}</div>
                            <div className="muted price-strike">${(game.basePrice || game.price).toFixed(2)}</div>
                          </div>
                        ) : (
                          `$${game.price.toFixed(2)}`
                        )}
                      </td>
                      <td>{game.discountPercent ? `${game.discountPercent}% by admin` : "-"}</td>
                      <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
                      <td>{game.reviewCount || 0}</td>
                      <td className="actions-inline">
                        <button
                          className="button button-secondary"
                          onClick={() => setSelectedGame(game)}
                        >
                          Edit
                        </button>
                        <button className="button button-secondary" onClick={() => deleteGame(game.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
