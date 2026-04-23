import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, ApiError } from "../api/client";
import { Cart, CheckoutPreview, CheckoutResult } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type CheckoutStep = 1 | 2 | 3;

const paymentMethodMeta: Record<string, { label: string; hint: string }> = {
  CREDIT_CARD: {
    label: "Credit card",
    hint: "Save nothing sensitive, only validate cardholder, last four digits, and expiry.",
  },
  PAYPAL: {
    label: "PayPal",
    hint: "Use the PayPal email used for the purchase authorization.",
  },
  MOMO: {
    label: "MoMo",
    hint: "Enter the wallet phone number that will confirm the payment.",
  },
  BANK_TRANSFER: {
    label: "Bank transfer",
    hint: "Use account holder and bank name for the transfer record.",
  },
};

export const CartPage = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [step, setStep] = useState<CheckoutStep>(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    paypalEmail: "",
    phone: "",
    bankName: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadCart = async () => {
    setLoading(true);

    try {
      const [cartResponse, previewResponse] = await Promise.all([
        apiRequest<{ cart: Cart }>("/cart"),
        apiRequest<CheckoutPreview>("/orders/checkout/preview").catch(() => null),
      ]);
      setCart(cartResponse.cart);
      setPreview(previewResponse);
      setStep(1);
      setAcceptTerms(false);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (cartItemId: number) => {
    try {
      const response = await apiRequest<{ cart: Cart }>(`/cart/items/${cartItemId}`, {
        method: "DELETE",
      });
      setCart(response.cart);
      await refreshCart();
      if (response.cart.items.length === 0) {
        setPreview(null);
        setStep(1);
      } else {
        const previewResponse = await apiRequest<CheckoutPreview>("/orders/checkout/preview");
        setPreview(previewResponse);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Unable to remove item.");
    }
  };

  const formatCardNumber = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const paymentValidationMessage = useMemo(() => {
    if (paymentMethod === "CREDIT_CARD") {
      if (!paymentDetails.cardholderName.trim()) {
        return "Enter the cardholder name.";
      }

      if (paymentDetails.cardNumber.replace(/\s/g, "").length < 13) {
        return "Enter a valid card number.";
      }

      if (!paymentDetails.expiryMonth || !paymentDetails.expiryYear) {
        return "Card expiry month and year are required.";
      }

      if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
        return "Enter a valid security code.";
      }
    }

    if (paymentMethod === "PAYPAL" && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(paymentDetails.paypalEmail)) {
      return "Enter the PayPal email used for payment.";
    }

    if (paymentMethod === "MOMO" && paymentDetails.phone.replace(/\D/g, "").length < 10) {
      return "Enter the MoMo phone number used for payment.";
    }

    if (
      paymentMethod === "BANK_TRANSFER" &&
      (!paymentDetails.bankName.trim() || !paymentDetails.accountName.trim())
    ) {
      return "Enter both bank name and account holder for the transfer.";
    }

    return "";
  }, [paymentDetails, paymentMethod]);

  const paymentSummary = useMemo(() => {
    if (paymentMethod === "CREDIT_CARD") {
      const last4 = paymentDetails.cardNumber.replace(/\D/g, "").slice(-4) || "----";
      return `Credit card ending in ${last4}`;
    }

    if (paymentMethod === "PAYPAL") {
      return paymentDetails.paypalEmail ? `PayPal (${paymentDetails.paypalEmail})` : "PayPal";
    }

    if (paymentMethod === "MOMO") {
      return paymentDetails.phone ? `MoMo (${paymentDetails.phone})` : "MoMo wallet";
    }

    if (paymentMethod === "BANK_TRANSFER") {
      return paymentDetails.bankName
        ? `Bank transfer via ${paymentDetails.bankName}`
        : "Bank transfer";
    }

    return paymentMethodMeta[paymentMethod]?.label || paymentMethod;
  }, [paymentDetails, paymentMethod]);

  const checkout = async () => {
    if (!preview) {
      setMessage("Refresh your cart before checking out.");
      return;
    }

    if (paymentValidationMessage) {
      setMessage(paymentValidationMessage);
      return;
    }

    if (!acceptTerms) {
      setMessage("Please confirm the digital purchase notice before completing checkout.");
      return;
    }

    setProcessing(true);
    setMessage("");

    try {
      const response = await apiRequest<CheckoutResult>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod,
          paymentDetails,
        }),
      });
      await refreshCart();
      navigate(`/orders/${response.order.id}/confirmation`);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Checkout failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!preview) {
      setMessage("Refresh the checkout preview before continuing.");
      return;
    }

    setMessage("");
    setStep(2);
  };

  const handleContinueToConfirm = () => {
    if (paymentValidationMessage) {
      setMessage(paymentValidationMessage);
      return;
    }

    setMessage("");
    setStep(3);
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
              <div className="checkout-steps">
                <div className={step >= 1 ? "checkout-step-chip checkout-step-chip-active" : "checkout-step-chip"}>
                  1. Review
                </div>
                <div className={step >= 2 ? "checkout-step-chip checkout-step-chip-active" : "checkout-step-chip"}>
                  2. Payment
                </div>
                <div className={step >= 3 ? "checkout-step-chip checkout-step-chip-active" : "checkout-step-chip"}>
                  3. Confirm
                </div>
              </div>

              {step === 1 && (
                <div className="panel checkout-section stack-gap">
                  <div>
                    <h3>Review your order</h3>
                    <p className="muted">
                      These games will be delivered instantly to your library after payment.
                    </p>
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Game</th>
                        <th>Price</th>
                        <th>Access</th>
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
                          <td>
                            ${((item.game.finalPrice ?? item.game.price)).toFixed(2)}
                            {item.game.isDiscounted && (
                              <div className="muted price-strike">
                                ${((item.game.basePrice ?? item.game.price)).toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td>Single license</td>
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

                  <div className="checkout-note">
                    <strong>Receipt email</strong>
                    <span>{preview?.receiptEmail || user?.email || "Signed-in account email"}</span>
                  </div>

                  <div className="actions-row">
                    <button className="button button-primary" type="button" onClick={handleContinueToPayment}>
                      Continue to payment
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="panel checkout-section stack-gap">
                  <div>
                    <h3>Payment details</h3>
                    <p className="muted">
                      Pick a payment method and fill only the fields needed for that method.
                    </p>
                  </div>

                  <div className="checkout-method-grid">
                    {(preview?.paymentMethods || Object.keys(paymentMethodMeta)).map((method) => (
                      <button
                        key={method}
                        type="button"
                        className={
                          paymentMethod === method
                            ? "checkout-method-card checkout-method-card-active"
                            : "checkout-method-card"
                        }
                        onClick={() => setPaymentMethod(method)}
                      >
                        <strong>{paymentMethodMeta[method]?.label || method}</strong>
                        <span>{paymentMethodMeta[method]?.hint || "Use this payment flow."}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "CREDIT_CARD" && (
                    <div className="checkout-card-field-grid">
                      <label>
                        Cardholder name
                        <input
                          value={paymentDetails.cardholderName}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              cardholderName: event.target.value,
                            }))
                          }
                          placeholder="Name on card"
                        />
                      </label>

                      <label>
                        Card number
                        <input
                          value={paymentDetails.cardNumber}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              cardNumber: formatCardNumber(event.target.value),
                            }))
                          }
                          placeholder="1234 5678 9012 3456"
                        />
                      </label>

                      <label>
                        Expiry month
                        <input
                          value={paymentDetails.expiryMonth}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              expiryMonth: event.target.value.replace(/\D/g, "").slice(0, 2),
                            }))
                          }
                          placeholder="MM"
                        />
                      </label>

                      <label>
                        Expiry year
                        <input
                          value={paymentDetails.expiryYear}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              expiryYear: event.target.value.replace(/\D/g, "").slice(0, 4),
                            }))
                          }
                          placeholder="YYYY"
                        />
                      </label>

                      <label>
                        Security code
                        <input
                          value={paymentDetails.cvv}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              cvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                            }))
                          }
                          placeholder="CVV"
                        />
                      </label>
                    </div>
                  )}

                  {paymentMethod === "PAYPAL" && (
                    <label>
                      PayPal email
                      <input
                        type="email"
                        value={paymentDetails.paypalEmail}
                        onChange={(event) =>
                          setPaymentDetails((current) => ({
                            ...current,
                            paypalEmail: event.target.value,
                          }))
                        }
                        placeholder="paypal@example.com"
                      />
                    </label>
                  )}

                  {paymentMethod === "MOMO" && (
                    <label>
                      MoMo phone number
                      <input
                        value={paymentDetails.phone}
                        onChange={(event) =>
                          setPaymentDetails((current) => ({
                            ...current,
                            phone: event.target.value.replace(/[^\d]/g, "").slice(0, 11),
                          }))
                        }
                        placeholder="0xxxxxxxxx"
                      />
                    </label>
                  )}

                  {paymentMethod === "BANK_TRANSFER" && (
                    <div className="checkout-card-field-grid">
                      <label>
                        Bank name
                        <input
                          value={paymentDetails.bankName}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              bankName: event.target.value,
                            }))
                          }
                          placeholder="Techcombank, Vietcombank..."
                        />
                      </label>

                      <label>
                        Account holder
                        <input
                          value={paymentDetails.accountName}
                          onChange={(event) =>
                            setPaymentDetails((current) => ({
                              ...current,
                              accountName: event.target.value,
                            }))
                          }
                          placeholder="Account holder name"
                        />
                      </label>
                    </div>
                  )}

                  <div className="actions-row">
                    <button className="button button-secondary" type="button" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button className="button button-primary" type="button" onClick={handleContinueToConfirm}>
                      Review order
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="panel checkout-section stack-gap">
                  <div>
                    <h3>Confirm purchase</h3>
                    <p className="muted">
                      One last check before SteamLite charges the payment method and unlocks your games.
                    </p>
                  </div>

                  <div className="checkout-mini-grid">
                    <div className="checkout-confirm-card">
                      <strong>Receipt email</strong>
                      <span>{preview?.receiptEmail || user?.email}</span>
                    </div>
                    <div className="checkout-confirm-card">
                      <strong>Payment method</strong>
                      <span>{paymentSummary}</span>
                    </div>
                    <div className="checkout-confirm-card">
                      <strong>Items</strong>
                      <span>{preview?.cart.totalItems || cart.totalItems} digital game(s)</span>
                    </div>
                    <div className="checkout-confirm-card">
                      <strong>Total</strong>
                      <span>${preview?.cart.totalAmount.toFixed(2) || cart.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <label className="checkbox-line">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(event) => setAcceptTerms(event.target.checked)}
                    />
                    <span>
                      I understand this is a digital purchase. Games will be delivered immediately to my library
                      and the receipt will be sent to my SteamLite account email.
                    </span>
                  </label>

                  <div className="actions-row">
                    <button className="button button-secondary" type="button" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button className="button button-primary" onClick={checkout} disabled={processing}>
                      {processing ? "Processing payment..." : "Complete purchase"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="panel order-summary">
              <h3>Checkout summary</h3>
              <div className="summary-row">
                <span>Total items</span>
                <strong>{preview?.cart.totalItems || cart.totalItems}</strong>
              </div>
              <div className="summary-row">
                <span>Total amount</span>
                <strong>${(preview?.cart.totalAmount || cart.totalAmount).toFixed(2)}</strong>
              </div>
              <div className="summary-row">
                <span>Receipt email</span>
                <strong>{preview?.receiptEmail || user?.email || "Signed in"}</strong>
              </div>
              <div className="summary-row">
                <span>Payment</span>
                <strong>{paymentMethodMeta[paymentMethod]?.label || paymentMethod}</strong>
              </div>
              <p className="muted">
                SteamLite stores only safe payment metadata for receipts and confirmation.
              </p>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};
