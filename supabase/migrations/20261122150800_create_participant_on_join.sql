create or replace function public.create_participant_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'participant_join' = 'true' then
    insert into public.participants (
      participant_id,
      email,
      consent_status,
      join_time
    )
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'email', ''),
      coalesce(new.raw_user_meta_data ->> 'consent_status' = 'true', false),
      now()
    )
    on conflict (participant_id) do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.create_participant_from_auth_user()
  from public, anon, authenticated;

drop trigger if exists create_participant_after_auth_signup on auth.users;

create trigger create_participant_after_auth_signup
after insert on auth.users
for each row
execute function public.create_participant_from_auth_user();
