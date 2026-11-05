import { useContext } from "react";
import { ParticipantAuthContext } from "./participantAuthContext";

export function useParticipantAuth() {
  const context = useContext(ParticipantAuthContext);
  if (!context) {
    throw new Error(
      "useParticipantAuth must be used within a ParticipantAuthProvider",
    );
  }
  return context;
}
