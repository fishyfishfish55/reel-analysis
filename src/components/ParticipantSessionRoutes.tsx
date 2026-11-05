import { Navigate, Outlet } from "react-router-dom";
import { useParticipantAuth } from "../hooks/useParticipantAuth";
import { useRealtimeVotes } from "../hooks/useRealtimeVotes";
import type { RealtimeVotesContext } from "../hooks/useRealtimeVotes";

export function ParticipantSessionRoutes() {
  const { session } = useParticipantAuth();
  if (!session) {
    return <Navigate to="/join" replace />;
  }

  return <ActiveParticipantRoutes participantId={session.user.id} />;
}

function ActiveParticipantRoutes({ participantId }: { participantId: string }) {
  const votes = useRealtimeVotes(participantId);
  return <Outlet context={votes satisfies RealtimeVotesContext} />;
}
