import { useNavigate } from "react-router-dom";

type VoteViewProps = {
  scrollVote: boolean;
  likeVote: boolean;
  onScrollVoteChange: (value: boolean | ((current: boolean) => boolean)) => void;
  onLikeVoteChange: (value: boolean | ((current: boolean) => boolean)) => void;
};

function VoteView({
  scrollVote,
  likeVote,
  onScrollVoteChange,
  onLikeVoteChange,
}: VoteViewProps) {
  const navigate = useNavigate();

  return (
    <main className="vote-screen" aria-label="Audience voting">
      <button
        className={`vote-button vote-button--scroll${scrollVote ? " is-active" : ""}`}
        type="button"
        aria-pressed={scrollVote}
        onClick={() => onScrollVoteChange((current) => !current)}
      >
        <span className="vote-action">{scrollVote ? "Scroll vote added" : "Scroll"}</span>
        <span className="vote-hint">
          {scrollVote ? "Tap to take your vote back" : "Vote to move to the next video"}
        </span>
      </button>
      <button
        className={`vote-button vote-button--like${likeVote ? " is-active" : ""}`}
        type="button"
        aria-pressed={likeVote}
        onClick={() => onLikeVoteChange((current) => !current)}
      >
        <span className="vote-action">{likeVote ? "Like vote added" : "Like"}</span>
        <span className="vote-hint">
          {likeVote ? "Tap to take your vote back" : "Vote to like this video"}
        </span>
      </button>
      <button
        className="finish-voting"
        type="button"
        onClick={() => navigate("/complete")}
      >
        Finish voting
      </button>
      <p className="prototype-notice">
        Prototype: votes are not being saved yet.
      </p>
    </main>
  );
}

export default VoteView;
