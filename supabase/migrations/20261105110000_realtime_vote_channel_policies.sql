create policy "Authenticated participants can receive vote and reset broadcasts"
on realtime.messages
for select
to authenticated
using (realtime.topic() in ('likes', 'scrolls', 'reset'));

create policy "Authenticated participants can publish vote broadcasts"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() in ('likes', 'scrolls'));

create policy "Moderators can publish vote resets"
on realtime.messages
for insert
to authenticated
with check (
  realtime.topic() = 'reset'
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'moderator'
);
