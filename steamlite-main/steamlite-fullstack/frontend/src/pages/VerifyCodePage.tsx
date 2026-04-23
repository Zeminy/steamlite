import { FormEvent, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export const VerifyCodePage = () => {
  const { user, verifyRegistrationCode, resendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const previewCode = searchParams.get("previewCode") || "";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(previewCode ? "success" : "error");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const pageMessage = useMemo(() => {
    if (previewCode) {
      return `A verification code was sent to ${email}.`;
    }

    return message;
  }, [email, message, previewCode]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (!email) {
    return (
      <div className="stack-gap">
        <section className="panel empty-state">
          <h3>Verification email missing.</h3>
          <p>Register first so SteamLite knows which email should receive the code.</p>
          <Link className="button button-primary button-link" to="/auth">
            Back to register
          </Link>
        </section>
      </div>
    );
  }

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("error");

    try {
      if (code.trim().length !== 6) {
        throw new Error("Enter the 6-digit code sent to your email.");
      }

      const response = await verifyRegistrationCode(email, code);
      navigate(
        `/auth?verified=1&email=${encodeURIComponent(response.email)}&message=${encodeURIComponent(response.message)}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof ApiError || error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setMessageType("error");

    try {
      const response = await resendVerificationCode(email);
      navigate(
        `/auth/verify-code?email=${encodeURIComponent(response.email)}${
          response.verificationPreviewCode
            ? `&previewCode=${encodeURIComponent(response.verificationPreviewCode)}`
            : ""
        }`,
        { replace: true }
      );
      setMessageType("success");
      setMessage(response.message);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof ApiError || error instanceof Error ? error.message : "Unable to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="stack-gap">
      <section className="panel auth-panel">
        <span className="eyebrow">Email verification</span>
        <h2>Enter your 6-digit code</h2>
        <p>
          SteamLite sent a one-time verification code to <strong>{email}</strong>. Confirm it here to
          finish creating the account.
        </p>

        <form className="form-grid" onSubmit={handleVerify}>
          <label>
            Verification code
            <input
              className={messageType === "error" && message ? "field-input field-input-error" : "field-input"}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </label>

          {(pageMessage || message) && (
            <div className={messageType === "success" ? "status-banner" : "status-banner status-error"}>
              <div className="status-banner-stack">
                <span>{message || pageMessage}</span>
                {previewCode ? <strong>Preview code: {previewCode}</strong> : null}
              </div>
            </div>
          )}

          <div className="actions-row">
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Verifying..." : "Verify code"}
            </button>
            <button className="button button-secondary" type="button" onClick={handleResend} disabled={resending}>
              {resending ? "Sending..." : "Resend code"}
            </button>
            <Link className="button button-secondary button-link" to="/auth">
              Back to auth
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
};
