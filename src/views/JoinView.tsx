import { useState, type SyntheticEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useParticipantAuth } from "../hooks/useParticipantAuth";

function JoinView() {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    session,
    isLoading,
    error: authError,
    signInAnonymously,
  } = useParticipantAuth();

  async function joinEvent(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await signInAnonymously(email);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to join the event. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }
    navigate("/vote");
  }

  if (session) {
    return <Navigate to="/vote" replace />;
  }

  return (
    <main className="join-screen">
      <section className="join-card">
        <p className="eyebrow">Collective feed</p>
        <h1>Join the room.</h1>
        <p className="intro">
          Enter your email and confirm your consent to take part.
        </p>
        <form className="join-form" onSubmit={joinEvent}>
          <label htmlFor="participant-email">Email address</label>
          <input
            id="participant-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="consent-option">
            <input
              type="checkbox"
              checked={hasConsent}
              onChange={(event) => setHasConsent(event.target.checked)}
              required
            />
            <span>
              I agree to participate in this event and understand my responses
              may be recorded.
            </span>
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={isLoading || isSubmitting}
          >
            {isSubmitting ? "Joining..." : "Join the event"}
          </button>
        </form>
        {(formError ?? authError) && (
          <p className="form-error" role="alert">
            {formError ?? authError}
          </p>
        )}
        <p className="prototype-notice">
          Your email is stored as metadata on your anonymous participant
          account.
        </p>
      </section>
    </main>
  );
}

export default JoinView;
