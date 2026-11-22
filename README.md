# Collective Feed

A participant-facing prototype for a live, audience-voted short-form media event.

## Participant routes

- `/join` — enter an email and provide consent.
- `/vote` — toggle scroll and like votes independently.
- `/complete` — open the configured end survey.
- `/moderator` — monitor Presence and vote thresholds, then reset the round.

The root path (`/`) redirects to `/join`.

## Run locally

```sh
npm install
npm run dev
```

Set `VITE_END_SURVEY_URL` in your local environment to configure the link shown on
the completion screen. Without it, the app displays a message that the survey
link is not configured.

Enable anonymous sign-ins in the Supabase project's Auth settings. Participant
emails are attached to the anonymous user's metadata and are not verified email
identities. The `/vote` and `/complete` routes require a Supabase session. Set
`VITE_MODERATOR_USER_IDS` to a comma-separated allowlist of Supabase Auth UUIDs
that may access `/moderator`. Optionally set `VITE_MODERATOR_REDIRECT_URL` to
an exact callback URL such as `https://your-app.vercel.app/moderator`; without
it, the app uses the current browser origin plus `/moderator`. Moderators can use
**Sign in as moderator** on `/join` to receive a Supabase magic link. Anonymous participant sessions are
not moderator accounts.

The vote view subscribes to the `likes`, `scrolls`, and `reset` Realtime
broadcast channels. It sends `vote` events with `action`, `participant_id`,
`vote`, and `timestamp` on the corresponding vote channel. A `reset` event on
the `reset` channel clears both local vote states.

Apply `supabase/migrations/20261105110000_realtime_vote_channel_policies.sql`
to enable private-channel access. Authenticated participants can read the
channels and publish vote updates. The migration currently allows authenticated
users to publish resets and room Presence; keep server-side moderator controls
if this moves beyond a prototype. Disable **Allow public access** in the
Supabase project's Realtime settings to enforce private channels.
Apply `supabase/migrations/20261122163900_add_room_presence_policies.sql` to
grant authenticated participants access to the `room` Presence channel.
Apply `supabase/migrations/20261122170000_allow_authenticated_vote_resets.sql`
if the original moderator-only reset policy was already applied remotely.

Participant clients join the `room` channel with Presence metadata identifying
them as participants. The moderator view counts unique participant Presence
entries as the denominator. Scroll requires strictly more than 50%, and like
requires strictly more than 25%.

Vote state is currently broadcast live but is not persisted to a database. The
moderator interface, questionnaires, and spreadsheet export are not connected
in this prototype. When deploying, configure the host to serve `index.html` for
the participant routes so direct navigation and refreshes work.
