import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

type VoteAction = "like" | "scroll";
type VotePayload = {
  action?: VoteAction;
  participant_id?: string;
  vote?: boolean;
};
type PresenceMetadata = {
  participant_id?: string;
  role?: string;
};

export function useModeratorRealtime() {
  const [participantCount, setParticipantCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [scrollCount, setScrollCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelsRef = useRef<{
    likes?: RealtimeChannel;
    scrolls?: RealtimeChannel;
    reset?: RealtimeChannel;
    room?: RealtimeChannel;
  }>({});
  const votesRef = useRef<Record<VoteAction, Map<string, boolean>>>({
    like: new Map(),
    scroll: new Map(),
  });

  useEffect(() => {
    let active = true;
    const subscribed = new Set<string>();

    const likes = supabase.channel("likes", {
      config: { broadcast: { ack: true }, private: true },
    });
    const scrolls = supabase.channel("scrolls", {
      config: { broadcast: { ack: true }, private: true },
    });
    const reset = supabase.channel("reset", {
      config: { broadcast: { ack: true }, private: true },
    });
    const room = supabase.channel("room", { config: { private: true } });
    channelsRef.current = { likes, scrolls, reset, room };

    const handleStatus = (name: string, status: string) => {
      if (!active) return;
      if (status === "SUBSCRIBED") {
        subscribed.add(name);
        setError(null);
      } else {
        subscribed.delete(name);
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setError(`Unable to connect to the ${name} channel. Please retry.`);
        }
      }
      setIsReady(subscribed.size === 4);
    };

    const syncPresence = () => {
      if (!active) return;
      const participantIds = new Set<string>();
      const presenceState = room.presenceState<PresenceMetadata>();

      for (const [presenceKey, presences] of Object.entries(presenceState)) {
        for (const presence of presences) {
          if (presence.role === "participant" && presence.participant_id) {
            participantIds.add(presence.participant_id);
          } else if (
            presence.role === undefined &&
            presence.participant_id === undefined
          ) {
            participantIds.add(presenceKey);
          }
        }
      }

      setParticipantCount(participantIds.size);

      for (const action of ["like", "scroll"] as const) {
        const voteMap = votesRef.current[action];
        for (const participantId of [...voteMap.keys()]) {
          if (!participantIds.has(participantId)) {
            voteMap.delete(participantId);
          }
        }
      }

      setLikeCount(votesRef.current.like.size);
      setScrollCount(votesRef.current.scroll.size);
    };

    const handleVote = (action: VoteAction, payload: VotePayload) => {
      if (!payload.participant_id || typeof payload.vote !== "boolean") return;
      const voteMap = votesRef.current[action];
      if (payload.vote) {
        voteMap.set(payload.participant_id, true);
      } else {
        voteMap.delete(payload.participant_id);
      }
      if (action === "like") {
        setLikeCount(voteMap.size);
      } else {
        setScrollCount(voteMap.size);
      }
    };

    room
      .on("presence", { event: "sync" }, syncPresence)
      .subscribe((status) => handleStatus("room", status));

    likes
      .on("broadcast", { event: "vote" }, ({ payload }) =>
        handleVote("like", payload as VotePayload),
      )
      .subscribe((status) => handleStatus("likes", status));

    scrolls
      .on("broadcast", { event: "vote" }, ({ payload }) =>
        handleVote("scroll", payload as VotePayload),
      )
      .subscribe((status) => handleStatus("scrolls", status));

    reset.subscribe((status) => handleStatus("reset", status));

    return () => {
      active = false;
      channelsRef.current = {};
      void Promise.all([likes, scrolls, reset, room].map((channel) =>
        supabase.removeChannel(channel),
      ));
    };
  }, []);

  const resetVotes = useCallback(async () => {
    const reset = channelsRef.current.reset;
    if (!reset) {
      setError("The reset channel is not connected.");
      return false;
    }

    setIsResetting(true);
    setError(null);
    try {
      const status = await reset.send({
        type: "broadcast",
        event: "reset",
        payload: { timestamp: new Date().toISOString() },
      });
      if (status !== "ok") {
        setError(`The vote reset could not be sent (${status}).`);
        return false;
      }

      votesRef.current.like.clear();
      votesRef.current.scroll.clear();
      setLikeCount(0);
      setScrollCount(0);
      return true;
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The vote reset could not be sent.",
      );
      return false;
    } finally {
      setIsResetting(false);
    }
  }, []);

  const likeThresholdReached =
    participantCount > 0 && likeCount / participantCount > 0.25;
  const scrollThresholdReached =
    participantCount > 0 && scrollCount / participantCount > 0.5;

  return {
    participantCount,
    likeCount,
    scrollCount,
    likeThresholdReached,
    scrollThresholdReached,
    isResetting,
    isReady,
    error,
    resetVotes,
  };
}
