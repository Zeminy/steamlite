import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { Cart } from "../types";
import { useCart } from "../context/CartContext";

const paymentMethods = ["CREDIT_CARD", "PAYPAL", "MOMO", "BANK_TRANSFER"];

export const CartPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState<Cart | null>(null);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadCart = async () => {
    setLoading(true);

    try {
      const response = await apiRequest<{ cart: Cart }>("/cart");
      setCart(response.cart);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      const response = await apiRequest<{ cart: Cart }>(`/cart/items/${cartItemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      setCart(response.cart);
      await refreshCart();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to update cart.");
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const response = await apiRequest<{ cart: Cart }>(`/cart/items/${cartItemId}`, {
        method: "DELETE",
      });
      setCart(response.cart);
      await refreshCart();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to remove item.");
    }
  };

  const checkout = async () => {
    setProcessing(true);
    setMessage("");

    try {
      await apiRequest("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      });
      await refreshCart();
      navigate("/orders");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Checkout failed.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Cart and checkout</span>
            <h2>Your shopping cart</h2>
          </div>
          <button className="button button-secondary" onClick={loadCart}>
            Refresh
          </button>
        </div>

        {message && <div className="status-banner status-error">{message}</div>}

        {!cart || cart.items.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty.</h3>
            <p>Add a game from the store to continue to checkout.</p>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Game</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Line total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.game.title}</strong>
                        <div className="muted">{item.game.developerCompany}</div>
                      </td>
                      <td>${item.game.price.toFixed(2)}</td>
                      <td>
                        <input
                          className="qty-input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                        />
                      </td>
                      <td>${item.lineTotal.toFixed(2)}</td>
                      <td>
                        <button className="button button-secondary" onClick={() => removeItem(item.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <aside className="panel order-summary">
              <h3>Summary</h3>
              <div className="summary-row">
                <span>Total items</span>
                <strong>{cart.totalItems}</strong>
              </div>
              <div className="summary-row">
                <span>Total amount</span>
                <strong>${cart.totalAmount.toFixed(2)}</strong>
              </div>

              <label>
                Payment method
                <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>

              <button className="button button-primary" onClick={checkout} disabled={processing}>
                {processing ? "Processing..." : "Checkout now"}
              </button>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};
