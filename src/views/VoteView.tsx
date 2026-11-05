import { useNavigate, useOutletContext } from "react-router-dom";
import type { RealtimeVotesContext } from "../hooks/useRealtimeVotes";

function VoteView() {
  const navigate = useNavigate();
  const { votes, toggleVote, pendingActions, isReady, error } =
    useOutletContext<RealtimeVotesContext>();

  return (
    <main className="vote-screen" aria-label="Audience voting">
      <button
        className={`vote-button vote-button--scroll${votes.scroll ? " is-active" : ""}`}
        type="button"
        aria-pressed={votes.scroll}
        disabled={!isReady || pendingActions.scroll}
        onClick={() => void toggleVote("scroll")}
      >
        <span className="vote-action">{votes.scroll ? "Scroll vote added" : "Scroll"}</span>
        <span className="vote-hint">
          {votes.scroll ? "Tap to take your vote back" : "Vote to move to the next video"}
        </span>
      </button>
      <button
        className={`vote-button vote-button--like${votes.like ? " is-active" : ""}`}
        type="button"
        aria-pressed={votes.like}
        disabled={!isReady || pendingActions.like}
        onClick={() => void toggleVote("like")}
      >
        <span className="vote-action">{votes.like ? "Like vote added" : "Like"}</span>
        <span className="vote-hint">
          {votes.like ? "Tap to take your vote back" : "Vote to like this video"}
        </span>
      </button>
      <button
        className="finish-voting"
        type="button"
        onClick={() => navigate("/complete")}
      >
        Finish voting
      </button>
      <p className="prototype-notice" role={error ? "alert" : "status"}>
        {error ??
          (isReady
            ? "Connected. Vote updates are being sent live."
            : "Connecting to the live vote channels…")}
      </p>
    </main>
  );
}

export default VoteView;
