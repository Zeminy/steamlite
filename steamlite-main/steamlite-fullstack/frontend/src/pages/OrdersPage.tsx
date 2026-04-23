import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { Order } from "../types";

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const response = await apiRequest<{ orders: Order[] }>("/orders/me");
      setOrders(response.orders);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="panel">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Purchase history</span>
            <h2>Your orders</h2>
          </div>
          <button className="button button-secondary" onClick={loadOrders}>
            Refresh
          </button>
        </div>

        {message && <div className="status-banner status-error">{message}</div>}

        {!orders.length ? (
          <div className="empty-state">
            <h3>No orders yet.</h3>
            <p>Complete a checkout from the cart page to create your first purchase.</p>
          </div>
        ) : (
          <div className="stack-gap">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p className="muted">
                      {new Date(order.orderDate).toLocaleString()} · {order.status}
                    </p>
                  </div>
                  <div className="price-tag">${order.totalAmount.toFixed(2)}</div>
                </div>

                <div className="order-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div>
                        <strong>{item.game.title}</strong>
                        <div className="muted">{item.game.developerCompany}</div>
                      </div>
                      <div>
                        ${item.lineTotal.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {order.payment && (
                  <div className="stack-gap">
                    <div className="payment-tag">
                      Payment: {order.payment.paymentMethod.replace(/_/g, " ")} · {order.payment.status}
                    </div>
                    <div className="summary-row">
                      <span className="muted">{order.receiptEmail || order.user?.email || "Receipt available"}</span>
                      <Link className="button button-secondary button-link" to={`/orders/${order.id}/confirmation`}>
                        View confirmation
                      </Link>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
