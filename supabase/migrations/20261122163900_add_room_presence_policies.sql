drop policy if exists "Authenticated participants can receive room presence"
  on realtime.messages;

create policy "Authenticated participants can receive room presence"
on realtime.messages
for select
to authenticated
using (realtime.topic() = 'room');

drop policy if exists "Authenticated users can publish room presence"
  on realtime.messages;

create policy "Authenticated users can publish room presence"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() = 'room');
