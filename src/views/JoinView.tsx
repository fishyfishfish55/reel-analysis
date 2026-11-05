import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

function JoinView() {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);
  const navigate = useNavigate();

  function joinEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/vote");
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
          <button className="primary-button" type="submit">
            Join the event
          </button>
        </form>
        <p className="prototype-notice">
          Prototype: your email and votes are not being sent to or saved in a
          database yet.
        </p>
      </section>
    </main>
  );
}

export default JoinView;
