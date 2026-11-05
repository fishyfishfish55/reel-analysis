import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

export type VoteAction = "like" | "scroll";
export type VoteState = Record<VoteAction, boolean>;

const INITIAL_VOTES: VoteState = { like: false, scroll: false };
const CHANNEL_NAMES = ["likes", "scrolls", "reset"] as const;

export function useRealtimeVotes(participantId: string) {
  const [votes, setVotes] = useState<VoteState>(INITIAL_VOTES);
  const votesRef = useRef(votes);
  const resetVersionRef = useRef(0);
  const [pendingActions, setPendingActions] = useState<
    Partial<Record<VoteAction, boolean>>
  >({});
  const pendingRef = useRef(new Set<VoteAction>());
  const [readyChannels, setReadyChannels] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const channelsRef = useRef<Partial<Record<(typeof CHANNEL_NAMES)[number], RealtimeChannel>>>({});

  const updateVotes = useCallback((nextVotes: VoteState) => {
    votesRef.current = nextVotes;
    setVotes(nextVotes);
  }, []);

  useEffect(() => {
    let active = true;
    const subscribed = new Set<string>();
    const connectionFailures = new Map<string, string>();
    const channels = {
      likes: supabase.channel("likes", {
        config: { broadcast: { ack: true }, private: true },
      }),
      scrolls: supabase.channel("scrolls", {
        config: { broadcast: { ack: true }, private: true },
      }),
      reset: supabase.channel("reset", { config: { private: true } }),
    };
    channelsRef.current = channels;

    const handleStatus = (name: string, status: string) => {
      if (!active) return;
      if (status === "SUBSCRIBED") {
        subscribed.add(name);
        connectionFailures.delete(name);
        if (connectionFailures.size === 0) setError(null);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        subscribed.delete(name);
        const message = `Unable to connect to the ${name} vote channel. Please retry.`;
        connectionFailures.set(name, message);
        setError(message);
      } else if (status === "CLOSED") {
        subscribed.delete(name);
        const message = `The ${name} vote channel closed. Please retry.`;
        connectionFailures.set(name, message);
        setError(message);
      }
      setReadyChannels(new Set(subscribed));
    };

    channels.reset
      .on("broadcast", { event: "reset" }, () => {
        resetVersionRef.current += 1;
        updateVotes(INITIAL_VOTES);
      })
      .subscribe((status) => handleStatus("reset", status));

    channels.likes.subscribe((status) => handleStatus("likes", status));
    channels.scrolls.subscribe((status) => handleStatus("scrolls", status));

    return () => {
      active = false;
      channelsRef.current = {};
      void Promise.all(Object.values(channels).map((channel) => supabase.removeChannel(channel)));
    };
  }, [updateVotes]);

  const toggleVote = useCallback(
    async (action: VoteAction) => {
      const channelName = action === "like" ? "likes" : "scrolls";
      const channel = channelsRef.current[channelName];
      if (!readyChannels.has(channelName) || !channel || pendingRef.current.has(action)) {
        return;
      }

      const previousVote = votesRef.current[action];
      const nextVote = !previousVote;
      const resetVersion = resetVersionRef.current;
      updateVotes({ ...votesRef.current, [action]: nextVote });
      pendingRef.current.add(action);
      setPendingActions((current) => ({ ...current, [action]: true }));
      setError(null);

      try {
        const status = await channel.send({
          type: "broadcast",
          event: "vote",
          payload: {
            action,
            participant_id: participantId,
            vote: nextVote,
            timestamp: new Date().toISOString(),
          },
        });

        if (status !== "ok") {
          if (
            resetVersionRef.current === resetVersion &&
            votesRef.current[action] === nextVote
          ) {
            updateVotes({ ...votesRef.current, [action]: previousVote });
          }
          setError(`Your vote could not be sent (${status}). Please try again.`);
        }
      } catch (sendError) {
        if (
          resetVersionRef.current === resetVersion &&
          votesRef.current[action] === nextVote
        ) {
          updateVotes({ ...votesRef.current, [action]: previousVote });
        }
        setError(
          sendError instanceof Error
            ? sendError.message
            : "Your vote could not be sent. Please try again.",
        );
      } finally {
        pendingRef.current.delete(action);
        setPendingActions((current) => ({ ...current, [action]: false }));
      }
    },
    [participantId, readyChannels, updateVotes],
  );

  const isReady = CHANNEL_NAMES.every((name) => readyChannels.has(name));

  return { votes, toggleVote, pendingActions, isReady, error };
}

export type RealtimeVotesContext = ReturnType<typeof useRealtimeVotes>;
