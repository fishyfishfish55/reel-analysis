import { useState, type SyntheticEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useParticipantAuth } from "../hooks/useParticipantAuth";
import { isModeratorUserId, useModerator } from "../hooks/useModerator";

function JoinView() {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderatorSignIn, setModeratorSignIn] = useState(false);
  const [moderatorSent, setModeratorSent] = useState(false);
  const moderatorRedirectUrl =
    import.meta.env.VITE_MODERATOR_REDIRECT_URL?.trim() ||
    `${window.location.origin}/moderator`;
  const navigate = useNavigate();
  const {
    session,
    isLoading,
    error: authError,
    signInAnonymously,
    sendMagicLink,
    signOut,
  } = useParticipantAuth();
  const { isModerator } = useModerator();

  async function joinEvent(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    let participantUserId: string | undefined;
    try {
      if (session) {
        participantUserId = session.user.id;
      } else {
        participantUserId = await signInAnonymously(email);
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to join the event. Please try again.",
      );
      setIsSubmitting(false);
      return;
    }

    if (participantUserId && isModeratorUserId(participantUserId)) {
      navigate("/moderator");
      return;
    }

    if (!session || session.user.is_anonymous) {
      navigate("/vote");
    }
  }

  async function sendModeratorLink() {
    setFormError(null);
    setIsSubmitting(true);
    try {
      if (session) await signOut();
      await sendMagicLink(email);
      setModeratorSent(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to send the moderator sign-in link.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (session && isModerator) {
    return <Navigate to="/moderator" replace />;
  }

  return (
    <main className="join-screen">
      <section className="join-card">
        <p className="eyebrow">Collective feed</p>
        <h1>Join the room.</h1>
        <p className="intro">
          Enter your email and confirm your consent to take part.
        </p>
        {moderatorSignIn ? (
          <div className="join-form">
            <label htmlFor="moderator-email">Moderator email</label>
            <input
              id="moderator-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="moderator@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button
              className="primary-button"
              type="button"
              disabled={isLoading || isSubmitting || !email}
              onClick={() => void sendModeratorLink()}
            >
              {isSubmitting ? "Sending..." : "Send sign-in link"}
            </button>
            <p className="prototype-notice">
              Sign-in callback: <code>{moderatorRedirectUrl}</code>
            </p>
            {moderatorSent && (
              <p className="prototype-notice" role="status">
                Check your email for the sign-in link. It will return to the
                moderator view.
              </p>
            )}
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setModeratorSignIn(false);
                setModeratorSent(false);
                setFormError(null);
              }}
            >
              Continue as participant
            </button>
          </div>
        ) : (
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
        )}
        {!moderatorSignIn && (
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setModeratorSignIn(true);
              setFormError(null);
            }}
          >
            Sign in as moderator
          </button>
        )}
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
