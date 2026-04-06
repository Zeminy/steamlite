import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "../api/client";
import {
  AdminDeveloper,
  AdminOverview,
  AdminUser,
  Game,
  GamePayload,
  Order,
  Role,
} from "../types";
import { AdminGameForm } from "../components/AdminGameForm";

export const AdminDashboardPage = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [developers, setDevelopers] = useState<AdminDeveloper[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async (resetMessage = true) => {
    setLoading(true);
    if (resetMessage) {
      setMessage("");
    }

    try {
      const [
        overviewResponse,
        developersResponse,
        usersResponse,
        gamesResponse,
        ordersResponse,
      ] = await Promise.all([
        apiRequest<{ overview: AdminOverview }>("/admin/overview"),
        apiRequest<{ developers: AdminDeveloper[] }>("/admin/developers"),
        apiRequest<{ users: AdminUser[] }>("/admin/users"),
        apiRequest<{ games: Game[] }>("/games"),
        apiRequest<{ orders: Order[] }>("/admin/orders"),
      ]);

      setOverview(overviewResponse.overview);
      setDevelopers(developersResponse.developers);
      setUsers(usersResponse.users);
      setGames(gamesResponse.games);
      setOrders(ordersResponse.orders);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitGame = async (payload: GamePayload) => {
    try {
      if (selectedGame) {
        await apiRequest(`/games/${selectedGame.id}`, {
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
      await loadData(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to save game.");
    }
  };

  const deleteGame = async (gameId: number) => {
    if (!window.confirm("Delete this game from the catalog? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/games/${gameId}`, {
        method: "DELETE",
      });
      setMessage("Game deleted successfully.");
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
      await loadData(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete game.");
    }
  };

  const updateRole = async (userId: number, role: Role) => {
    try {
      await apiRequest(`/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setMessage("User role updated.");
      await loadData(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update role.");
    }
  };

  const toggleBan = async (userId: number, isBanned: boolean) => {
    try {
      await apiRequest(`/admin/users/${userId}/${isBanned ? "unban" : "ban"}`, {
        method: "PATCH",
      });
      setMessage(isBanned ? "User unbanned." : "User banned.");
      await loadData(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update user status.");
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm("Delete this user account? This action cannot be undone.")) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      setMessage("User deleted.");
      await loadData(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Admin dashboard</span>
            <h2>Manage platform operations</h2>
          </div>
          <button className="button button-secondary" onClick={() => loadData()}>
            Refresh dashboard
          </button>
        </div>

        {message && <div className="status-banner">{message}</div>}

        {overview && (
          <div className="stat-grid">
            <article className="stat-card">
              <span>Active users</span>
              <strong>{overview.usersCount}</strong>
            </article>
            <article className="stat-card">
              <span>Deleted users</span>
              <strong>{overview.deletedUsersCount}</strong>
            </article>
            <article className="stat-card">
              <span>Total games</span>
              <strong>{overview.gamesCount}</strong>
            </article>
            <article className="stat-card">
              <span>Total orders</span>
              <strong>{overview.ordersCount}</strong>
            </article>
            <article className="stat-card">
              <span>Gross revenue</span>
              <strong>${overview.grossRevenue.toFixed(2)}</strong>
            </article>
            <article className="stat-card">
              <span>Platform share</span>
              <strong>${overview.platformRevenue.toFixed(2)}</strong>
            </article>
            <article className="stat-card">
              <span>Developer share</span>
              <strong>${overview.developerRevenue.toFixed(2)}</strong>
            </article>
            <article className="stat-card">
              <span>Flagged reviews</span>
              <strong>{overview.flaggedReviewCount}</strong>
            </article>
            <article className="stat-card">
              <span>Platform commission</span>
              <strong>{Math.round(overview.commissionRate * 100)}%</strong>
            </article>
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <AdminGameForm
          developers={developers.filter((developer) => !developer.isBanned && !developer.deletedAt)}
          selectedGame={selectedGame}
          onSubmit={submitGame}
          onCancel={() => setSelectedGame(null)}
        />

        <div className="panel">
          <div className="section-header">
            <h3>Game catalog</h3>
            <span className="muted">{games.length} game(s)</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Developer</th>
                  <th>Price</th>
                  <th>Release</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>{game.title}</td>
                    <td>{game.genre || "Uncategorized"}</td>
                    <td>{game.developerCompany}</td>
                    <td>${game.price.toFixed(2)}</td>
                    <td>{new Date(game.releaseDate).toLocaleDateString()}</td>
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
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-header">
            <h3>Flagged reviews</h3>
            <span className="muted">{overview?.flaggedReviewCount || 0} flagged review(s)</span>
          </div>

          <div className="stack-gap">
            {overview?.flaggedReviews.length ? (
              overview.flaggedReviews.map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-header">
                    <div>
                      <strong>{review.user.username}</strong>
                      <div className="muted">
                        {review.game.title} - {new Date(review.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="price-tag">{review.rating}/5</div>
                  </div>

                  <p>{review.comment || "No written comment was left for this low review."}</p>
                  <div className="flagged-review-reasons">
                    {review.reasons.map((reason) => (
                      <span key={`${review.id}-${reason}`} className="flagged-review-chip">
                        {reason}
                      </span>
                    ))}
                  </div>
                  <div className="actions-row">
                    <button
                      className="button button-secondary"
                      disabled={Boolean(review.user.deletedAt)}
                      onClick={() => toggleBan(review.user.id, review.user.isBanned)}
                    >
                      {review.user.isBanned ? "Unban user" : "Ban user"}
                    </button>
                    <button
                      className="button button-secondary"
                      disabled={Boolean(review.user.deletedAt)}
                      onClick={() => deleteUser(review.user.id)}
                    >
                      {review.user.deletedAt ? "Deleted" : "Delete user"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>No toxic reviews flagged</h3>
                <p>The dashboard did not detect any clearly suspicious or hostile reviews right now.</p>
              </div>
            )}
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>User management</h3>
            <span className="muted">{users.length} user(s)</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Developer</th>
                  <th>Orders</th>
                  <th>Reviews</th>
                  <th>Change role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.username}</strong>
                      <div className="muted">{entry.email}</div>
                    </td>
                    <td>{entry.role}</td>
                    <td>{entry.deletedAt ? "Deleted" : entry.isBanned ? "Banned" : "Active"}</td>
                    <td>{entry.developerCompany || "-"}</td>
                    <td>{entry.orderCount}</td>
                    <td>{entry.reviewCount}</td>
                    <td>
                      <select
                        value={entry.role}
                        disabled={Boolean(entry.deletedAt)}
                        onChange={(event) => updateRole(entry.id, event.target.value as Role)}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="actions-inline">
                      <button
                        className="button button-secondary"
                        disabled={Boolean(entry.deletedAt)}
                        onClick={() => toggleBan(entry.id, entry.isBanned)}
                      >
                        {entry.isBanned ? "Unban" : "Ban"}
                      </button>
                      <button
                        className="button button-secondary"
                        disabled={Boolean(entry.deletedAt)}
                        onClick={() => deleteUser(entry.id)}
                      >
                        {entry.deletedAt ? "Deleted" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-header">
          <h3>Recent orders</h3>
          <span className="muted">{orders.length} total order(s)</span>
        </div>

        <div className="stack-gap">
          {orders.slice(0, 6).map((order) => (
            <article key={order.id} className="order-item-row">
              <div>
                <strong>
                  #{order.id} - {order.user?.username || "Customer"}
                </strong>
                <div className="muted">
                  {new Date(order.orderDate).toLocaleString()} - {order.payment?.paymentMethod}
                </div>
              </div>
              <div className="price-tag">${order.totalAmount.toFixed(2)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
