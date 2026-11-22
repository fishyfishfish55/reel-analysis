import { useModeratorRealtime } from "../hooks/useModeratorRealtime";

function ModeratorView() {
  const {
    participantCount,
    likeCount,
    scrollCount,
    likeThresholdReached,
    scrollThresholdReached,
    isResetting,
    isReady,
    error,
    resetVotes,
  } = useModeratorRealtime();

  const likePercent =
    participantCount === 0 ? 0 : Math.round((likeCount / participantCount) * 100);
  const scrollPercent =
    participantCount === 0
      ? 0
      : Math.round((scrollCount / participantCount) * 100);

  return (
    <main className="moderator-screen">
      <header className="moderator-header">
        <div>
          <p className="eyebrow">Moderator control</p>
          <h1>Live votes</h1>
        </div>
        <p className="participant-count">
          <strong>{participantCount}</strong>
          <span>participants present</span>
        </p>
      </header>

      <section className="threshold-grid" aria-label="Vote thresholds">
        <article
          className={`threshold-card threshold-card--scroll${
            scrollThresholdReached ? " threshold-reached" : ""
          }`}
          aria-live="polite"
        >
          <div className="threshold-heading">
            <span>Scroll</span>
            <strong>{scrollPercent}%</strong>
          </div>
          <div
            className="threshold-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={scrollPercent}
          >
            <span style={{ width: `${Math.min(scrollPercent, 100)}%` }} />
          </div>
          <p>
            {scrollCount} of {participantCount} votes · threshold above 50%
          </p>
          {scrollThresholdReached && (
            <p className="threshold-alert" role="alert">
              Scroll threshold reached
            </p>
          )}
        </article>

        <article
          className={`threshold-card threshold-card--like${
            likeThresholdReached ? " threshold-reached" : ""
          }`}
          aria-live="polite"
        >
          <div className="threshold-heading">
            <span>Like</span>
            <strong>{likePercent}%</strong>
          </div>
          <div
            className="threshold-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={likePercent}
          >
            <span style={{ width: `${Math.min(likePercent, 100)}%` }} />
          </div>
          <p>
            {likeCount} of {participantCount} votes · threshold above 25%
          </p>
          {likeThresholdReached && (
            <p className="threshold-alert" role="alert">
              Like threshold reached
            </p>
          )}
        </article>
      </section>

      <button
        className="reset-button"
        type="button"
        disabled={!isReady || isResetting}
        onClick={() => void resetVotes()}
      >
        {isResetting ? "Resetting..." : "Reset for next video"}
      </button>

      <p className="moderator-status" role={error ? "alert" : "status"}>
        {error ??
          (isReady
            ? "Connected to live votes"
            : "Connecting to live vote channels…")}
      </p>
    </main>
  );
}

export default ModeratorView;
