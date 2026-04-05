import { FormEvent, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";

export const AuthPage = () => {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your SteamLite account"),
    [mode]
  );

  if (user) {
    return <Navigate to="/" replace />;
  }

  const fillDemo = (type: "admin" | "user") => {
    if (type === "admin") {
      setForm({
        username: "admin",
        email: "admin@steamlite.local",
        password: "Admin123!",
      });
      setMode("login");
      return;
    }

    setForm({
      username: "playerone",
      email: "user@steamlite.local",
      password: "User123!",
    });
    setMode("login");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <section className="panel hero-panel">
        <span className="eyebrow">SteamLite access</span>
        <h2>{title}</h2>
        <p>
          This screen covers the report's login use case and also includes registration so the
          project is easier to demo and expand.
        </p>

        <div className="button-row">
          <button className="button button-secondary" onClick={() => fillDemo("user")}>
            Fill customer demo
          </button>
          <button className="button button-secondary" onClick={() => fillDemo("admin")}>
            Fill admin demo
          </button>
        </div>
      </section>

      <section className="panel auth-panel">
        <div className="tab-row">
          <button
            className={mode === "login" ? "tab active-tab" : "tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "register" ? "tab active-tab" : "tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "register" && (
            <label>
              Username
              <input
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          {message && <div className="status-banner status-error">{message}</div>}

          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </div>
  );
};
