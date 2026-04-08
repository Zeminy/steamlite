import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { Order } from "../types";

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const orderId = Number(id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadOrderConfirmation = async () => {
      if (Number.isNaN(orderId)) {
        setMessage("Invalid order confirmation.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ order: Order }>(`/orders/${orderId}/confirmation`);
        setOrder(response.order);
      } catch (error) {
        setMessage(error instanceof ApiError ? error.message : "Unable to load order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    loadOrderConfirmation();
  }, [orderId]);

  if (loading) {
    return (
      <div className="panel">
        <p>Loading order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="panel empty-state">
        <h3>Order confirmation unavailable.</h3>
        <p>{message || "We could not find the order confirmation for this purchase."}</p>
      </div>
    );
  }

  const latestEmail = order.emailDeliveries?.[0] || null;

  return (
    <div className="stack-gap">
      <section className="panel order-confirmation-shell">
        <div className="order-confirmation-hero">
          <div className="success-orb">OK</div>
          <div>
            <span className="eyebrow">Purchase complete</span>
            <h2>Thanks for your order.</h2>
            <p>
              Your payment was accepted, your games were added to the library, and a receipt email
              was queued to your SteamLite account inbox.
            </p>
          </div>
        </div>

        <div className="checkout-mini-grid">
          <div className="checkout-confirm-card">
            <strong>Order ID</strong>
            <span>#{order.id}</span>
          </div>
          <div className="checkout-confirm-card">
            <strong>Confirmation code</strong>
            <span>{order.confirmationCode || "Pending"}</span>
          </div>
          <div className="checkout-confirm-card">
            <strong>Total charged</strong>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <div className="checkout-confirm-card">
            <strong>Receipt email</strong>
            <span>{order.receiptEmail || "Not available"}</span>
          </div>
        </div>

        <div className="receipt-box">
          <div className="summary-row">
            <span>Email delivery</span>
            <strong>{latestEmail ? `${latestEmail.status} via ${latestEmail.provider}` : "Not available"}</strong>
          </div>
          <div className="summary-row">
            <span>Payment method</span>
            <strong>
              {order.payment?.paymentMethod.replace(/_/g, " ") || "Unknown"}
              {order.payment?.last4 ? ` **** ${order.payment.last4}` : ""}
            </strong>
          </div>
          <div className="summary-row">
            <span>Confirmed at</span>
            <strong>{new Date(order.confirmedAt || order.orderDate).toLocaleString()}</strong>
          </div>
        </div>

        <div className="stack-gap">
          <h3>Games added to your library</h3>
          <div className="order-list">
            {order.items.map((item) => (
              <div key={item.id} className="order-item-row">
                <div>
                  <strong>{item.game.title}</strong>
                  <div className="muted">{item.game.developerCompany}</div>
                </div>
                <div>${item.lineTotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="actions-row">
          <Link className="button button-primary button-link" to="/library">
            Open library
          </Link>
          <Link className="button button-secondary button-link" to="/orders">
            View orders
          </Link>
          <Link className="button button-secondary button-link" to="/">
            Back to store
          </Link>
        </div>
      </section>
    </div>
  );
};
