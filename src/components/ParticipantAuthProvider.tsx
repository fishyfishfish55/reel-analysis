import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { ParticipantAuthContext } from "../hooks/participantAuthContext";

export function ParticipantAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setError(null);
      setIsLoading(false);
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) return;
      if (sessionError) {
        setError(`Unable to check your sign-in: ${sessionError.message}`);
      } else {
        setSession(data.session);
      }
      setIsLoading(false);
    }).catch((sessionError: unknown) => {
      if (!isMounted) return;
      setError(
        `Unable to check your sign-in: ${
          sessionError instanceof Error ? sessionError.message : "Please try again."
        }`,
      );
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAnonymously = useCallback(async (email: string) => {
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInAnonymously({
      options: { data: { email: email.trim() } },
    });

    if (signInError) {
      throw signInError;
    }

    if (!data.session) {
      throw new Error("Supabase did not return a participant session.");
    }

    setSession(data.session);
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, error, signInAnonymously }),
    [session, isLoading, error, signInAnonymously],
  );

  return (
    <ParticipantAuthContext.Provider value={value}>
      {children}
    </ParticipantAuthContext.Provider>
  );
}
