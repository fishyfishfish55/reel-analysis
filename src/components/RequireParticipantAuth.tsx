import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useParticipantAuth } from "../hooks/useParticipantAuth";

export function RequireParticipantAuth() {
  const { session, isLoading, error } = useParticipantAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <main className="join-screen">
        <p role="status">Checking your participant session…</p>
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
    return <Navigate to="/join" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
