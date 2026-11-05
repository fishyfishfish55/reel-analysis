# Collective Feed

A participant-facing prototype for a live, audience-voted short-form media event.

## Participant routes

- `/join` — enter an email and provide consent.
- `/vote` — toggle scroll and like votes independently.
- `/complete` — open the configured end survey.

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
identities. The `/vote` and `/complete` routes require a Supabase session.

The vote view subscribes to the `likes`, `scrolls`, and `reset` Realtime
broadcast channels. It sends `vote` events with `action`, `participant_id`,
`vote`, and `timestamp` on the corresponding vote channel. A `reset` event on
the `reset` channel clears both local vote states.

Apply `supabase/migrations/20261105110000_realtime_vote_channel_policies.sql`
to enable private-channel access. Authenticated participants can read the
channels and publish vote updates; a reset can only be published by a session
whose trusted `app_metadata.role` is `moderator`. Disable **Allow public
access** in the Supabase project's Realtime settings to enforce private
channels. Set moderator metadata only from a trusted server, never from this
client application.

Vote state is currently broadcast live but is not persisted to a database. The
moderator interface, questionnaires, and spreadsheet export are not connected
in this prototype. When deploying, configure the host to serve `index.html` for
the participant routes so direct navigation and refreshes work.
