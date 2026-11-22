import { useMemo } from "react";
import { useParticipantAuth } from "./useParticipantAuth";

export function isModeratorUserId(userId: string) {
  const moderatorIds = import.meta.env.VITE_MODERATOR_USER_IDS
    ?.split(",")
    .map((id) => id.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);

  return moderatorIds?.includes(userId) ?? false;
}

export function useModerator() {
  const { session, isLoading, error } = useParticipantAuth();

  const moderatorIdsConfigured = useMemo(
    () =>
      Boolean(
        import.meta.env.VITE_MODERATOR_USER_IDS
          ?.split(",")
          .map((id) => id.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean).length,
      ),
    [],
  );
  const isModerator = useMemo(
    () => (session ? isModeratorUserId(session.user.id) : false),
    [session],
  );

  return { isModerator, moderatorIdsConfigured, isLoading, error, session };
}
