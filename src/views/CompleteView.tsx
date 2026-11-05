import { useNavigate } from "react-router-dom";

function CompleteView() {
  const navigate = useNavigate();
  const surveyUrl = import.meta.env.VITE_END_SURVEY_URL?.trim();

  return (
    <main className="join-screen">
      <section className="join-card completion-card">
        <p className="eyebrow">Thank you for taking part</p>
        <h1>You’re all done.</h1>
        <p className="intro">
          Please complete the short survey about your experience.
        </p>
        {surveyUrl ? (
          <a className="primary-link" href={surveyUrl} target="_blank" rel="noreferrer">
            Open the end survey
          </a>
        ) : (
          <p className="survey-placeholder" role="status">
            The end-survey link has not been configured yet.
          </p>
        )}
        <button
          className="text-button"
          type="button"
          onClick={() => navigate("/vote")}
        >
          Return to voting
        </button>
      </section>
    </main>
  );
}

export default CompleteView;
