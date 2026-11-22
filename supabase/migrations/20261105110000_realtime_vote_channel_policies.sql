create policy "Authenticated participants can receive vote, reset, and room broadcasts"
on realtime.messages
for select
to authenticated
using (realtime.topic() in ('likes', 'scrolls', 'reset', 'room'));

create policy "Authenticated participants can publish vote broadcasts"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() in ('likes', 'scrolls'));

create policy "Authenticated users can publish vote resets"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() = 'reset');

create policy "Authenticated users can publish room presence"
on realtime.messages
for insert
to authenticated
with check (realtime.topic() = 'room');
