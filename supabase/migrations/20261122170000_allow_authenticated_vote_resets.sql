drop policy if exists "Moderators can publish vote resets"
  on realtime.messages;

drop policy if exists "Authenticated users can publish vote resets"
  on realtime.messages;

create policy "Authenticated users can publish vote resets"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() = 'reset');
