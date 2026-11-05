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

Participant entry and vote state currently remain in the browser session only.
Supabase persistence, the moderator interface, questionnaires, and spreadsheet
export are not connected in this prototype.
