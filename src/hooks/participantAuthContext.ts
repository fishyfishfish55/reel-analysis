import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type ParticipantAuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signInAnonymously: (email: string) => Promise<void>;
};

export const ParticipantAuthContext =
  createContext<ParticipantAuthContextValue | null>(null);
