import { Navigate, Outlet } from "react-router-dom";
import { useModerator } from "../hooks/useModerator";
import { useParticipantAuth } from "../hooks/useParticipantAuth";

export function RequireModeratorAuth() {
  const { signOut } = useParticipantAuth();
  const {
    isModerator,
    moderatorIdsConfigured,
    isLoading,
    error,
    session,
  } = useModerator();

  if (isLoading) {
    return (
      <main className="join-screen">
        <p role="status">Checking your moderator session…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="join-screen">
        <p role="alert">{error}</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/join" replace />;
  }

  if (!isModerator) {
    if (!moderatorIdsConfigured) {
      return (
        <main className="join-screen">
          <section className="join-card">
            <p className="eyebrow">Moderator access</p>
            <h1>Not configured</h1>
            <p className="intro" role="alert">
              Set <code>VITE_MODERATOR_USER_IDS</code> in <code>.env.local</code>
              and restart the Vite server.
            </p>
          </section>
        </main>
      );
    }

    return (
      <main className="join-screen">
        <section className="join-card">
          <p className="eyebrow">Moderator access</p>
          <h1>This ID is not listed</h1>
          <p className="intro">The current Supabase session user ID is:</p>
          <code className="moderator-id">{session.user.id}</code>
          <p className="prototype-notice">
            Add this exact ID to <code>VITE_MODERATOR_USER_IDS</code>, restart
            the Vite server, and sign in again.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => void signOut().then(() => window.location.assign("/join"))}
          >
            Sign out and return to join
          </button>
        </section>
      </main>
    );
  }

  return <Outlet />;
}
