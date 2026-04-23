import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

const emailPattern = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,72}$/;

export const AuthPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    marketingEmails: true,
  });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Sign in with email" : "Create your SteamLite account"),
    [mode]
  );
  const showUsernameError = mode === "register" && Boolean(fieldErrors.username);
  const showEmailError = Boolean(fieldErrors.email);
  const showPasswordError = mode === "register" && Boolean(fieldErrors.password);
  const showConfirmPasswordError = mode === "register" && Boolean(fieldErrors.confirmPassword);

  useEffect(() => {
    if (searchParams.get("verified") !== "1") {
      return;
    }

    const verifiedEmail = searchParams.get("email") || "";
    const nextMessage = searchParams.get("message") || "Email verified. You can now sign in.";

    setMode("login");
    setSubmitted(false);
    setFieldErrors({});
    setMessageType("success");
    setMessage(nextMessage);
    setForm((current) => ({
      ...current,
      email: verifiedEmail || current.email,
      password: "",
      confirmPassword: "",
    }));
  }, [searchParams]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const validateRegisterFields = () => {
    const nextErrors: typeof fieldErrors = {};

    if (form.username.trim().length < 3 || form.username.trim().length > 32) {
      nextErrors.username = "Username must be between 3 and 32 characters.";
    }

    if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!passwordPattern.test(form.password)) {
      nextErrors.password =
        "Password must be 10+ characters and include uppercase, lowercase, number, and symbol.";
    }

    if (!form.confirmPassword || form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("error");
    setSubmitted(true);
    setFieldErrors({});

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        const nextErrors = validateRegisterFields();

        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors(nextErrors);
          return;
        }

        const response = await register(form.username, form.email, form.password, form.marketingEmails);
        navigate(
          `/auth/verify-code?email=${encodeURIComponent(response.email)}${
            response.verificationPreviewCode
              ? `&previewCode=${encodeURIComponent(response.verificationPreviewCode)}`
              : ""
          }`,
          {
            replace: true,
          }
        );
        return;
      }
    } catch (error) {
      const errorMessage =
        error instanceof ApiError || error instanceof Error ? error.message : "Authentication failed.";

      if (mode === "register") {
        const nextErrors: typeof fieldErrors = {};
        const normalizedError = errorMessage.toLowerCase();

        if (normalizedError.includes("username")) {
          nextErrors.username = errorMessage;
        }

        if (normalizedError.includes("email")) {
          nextErrors.email = errorMessage;
        }

        if (normalizedError.includes("password")) {
          nextErrors.password = errorMessage;
        }

        if (Object.keys(nextErrors).length > 0) {
          setFieldErrors((current) => ({
            ...current,
            ...nextErrors,
          }));
        }
      }

      setMessageType("error");
      setMessage(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="panel hero-panel">
        <span className="eyebrow">Secure access</span>
        <h2>{title}</h2>
        <p>
          SteamLite now verifies every account email with a one-time code before sign-in so receipts,
          confirmations, and account recovery always stay tied to the same inbox.
        </p>

        <div className="auth-feature-list">
          <div className="auth-feature-card">
            <strong>Email-based sign in</strong>
            <span>Receipts and account activity stay tied to one address.</span>
          </div>
          <div className="auth-feature-card">
            <strong>Stronger password rules</strong>
            <span>Uppercase, lowercase, number, and symbol are required.</span>
          </div>
          <div className="auth-feature-card">
            <strong>Transaction-safe access</strong>
            <span>Repeated failed logins trigger a temporary lock instead of endless retries.</span>
          </div>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="tab-row">
          <button
            className={mode === "login" ? "tab active-tab" : "tab"}
            onClick={() => {
              setMode("login");
              setSubmitted(false);
              setFieldErrors({});
              setMessage("");
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={mode === "register" ? "tab active-tab" : "tab"}
            onClick={() => {
              setMode("register");
              setSubmitted(false);
              setFieldErrors({});
              setMessage("");
            }}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Username
              <input
                className={showUsernameError ? "field-input field-input-error" : "field-input"}
                value={form.username}
                onChange={(event) => {
                  setForm((current) => ({ ...current, username: event.target.value }));
                  setFieldErrors((current) => ({ ...current, username: undefined }));
                }}
                placeholder="Pick a username"
                minLength={3}
                maxLength={32}
                required
              />
              {showUsernameError && (
                <small className="field-hint field-hint-error">{fieldErrors.username}</small>
              )}
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              className={showEmailError ? "field-input field-input-error" : "field-input"}
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              placeholder="you@example.com"
              required
            />
            {showEmailError && (
              <small className="field-hint field-hint-error">{fieldErrors.email}</small>
            )}
          </label>

          <label>
            Password
            <input
              type="password"
              className={showPasswordError ? "field-input field-input-error" : "field-input"}
              value={form.password}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }));
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
              placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
              required
            />
            {showPasswordError && (
              <small className="field-hint field-hint-error">{fieldErrors.password}</small>
            )}
          </label>

          {mode === "register" && (
            <>
              <label>
                Confirm password
                <input
                  type="password"
                  className={showConfirmPasswordError ? "field-input field-input-error" : "field-input"}
                  value={form.confirmPassword}
                  onChange={(event) => {
                    setForm((current) => ({ ...current, confirmPassword: event.target.value }));
                    setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter your password"
                  required
                />
                {showConfirmPasswordError && (
                  <small className="field-hint field-hint-error">{fieldErrors.confirmPassword}</small>
                )}
              </label>

              <label className="checkbox-line">
                <input
                  type="checkbox"
                  checked={form.marketingEmails}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, marketingEmails: event.target.checked }))
                  }
                />
                <span>Email me game drops, discounts, and SteamLite sale alerts.</span>
              </label>
            </>
          )}

          {message && (
            <div
              className={
                messageType === "success" ? "status-banner" : "status-banner status-error"
              }
            >
              <div className="status-banner-stack">
                <span>{message}</span>
                {mode === "login" && message.toLowerCase().includes("verify your email") ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={() =>
                      navigate(`/auth/verify-code?email=${encodeURIComponent(form.email.trim())}`)
                    }
                  >
                    Enter verification code
                  </button>
                ) : null}
              </div>
            </div>
          )}

          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting
              ? "Submitting..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
};
