import { useEffect, useState } from "react";
import { apiRequest, ApiError } from "../api/client";
import { AdminOverview, AdminUser, Game, GamePayload, Order, Role } from "../types";
import { AdminGameForm } from "../components/AdminGameForm";

export const AdminDashboardPage = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    setMessage("");

    try {
      const [overviewResponse, usersResponse, gamesResponse, ordersResponse] = await Promise.all([
        apiRequest<{ overview: AdminOverview }>("/admin/overview"),
        apiRequest<{ users: AdminUser[] }>("/admin/users"),
        apiRequest<{ games: Game[] }>("/games"),
        apiRequest<{ orders: Order[] }>("/admin/orders"),
      ]);

      setOverview(overviewResponse.overview);
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
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to save game.");
    }
  };

  const deleteGame = async (gameId: number) => {
    try {
      await apiRequest(`/games/${gameId}`, {
        method: "DELETE",
      });
      setMessage("Game deleted successfully.");
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
      await loadData();
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
      await loadData();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update role.");
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
          <button className="button button-secondary" onClick={loadData}>
            Refresh dashboard
          </button>
        </div>

        {message && <div className="status-banner">{message}</div>}

        {overview && (
          <div className="stat-grid">
            <article className="stat-card">
              <span>Total users</span>
              <strong>{overview.usersCount}</strong>
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
              <span>Total revenue</span>
              <strong>${overview.revenue.toFixed(2)}</strong>
            </article>
          </div>
        )}
      </section>

      <section className="dashboard-grid">
        <AdminGameForm
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
            <h3>User management</h3>
            <span className="muted">{users.length} user(s)</span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Reviews</th>
                  <th>Change role</th>
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
                    <td>{entry.orderCount}</td>
                    <td>{entry.reviewCount}</td>
                    <td>
                      <select
                        value={entry.role}
                        onChange={(event) => updateRole(entry.id, event.target.value as Role)}
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="DEVELOPER">DEVELOPER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="section-header">
            <h3>Recent orders</h3>
            <span className="muted">{orders.length} total order(s)</span>
          </div>

          <div className="stack-gap">
            {orders.slice(0, 6).map((order) => (
              <article key={order.id} className="order-item-row">
                <div>
                  <strong>
                    #{order.id} · {order.user?.username || "Customer"}
                  </strong>
                  <div className="muted">
                    {new Date(order.orderDate).toLocaleString()} · {order.payment?.paymentMethod}
                  </div>
                </div>
                <div className="price-tag">${order.totalAmount.toFixed(2)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
