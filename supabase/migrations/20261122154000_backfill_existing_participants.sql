insert into public.participants (
  participant_id,
  email,
  consent_status,
  join_time
)
select
  users.id,
  nullif(users.raw_user_meta_data ->> 'email', ''),
  case
    when users.raw_user_meta_data ? 'consent_status'
      then users.raw_user_meta_data ->> 'consent_status' = 'true'
    else true
  end,
  users.created_at
from auth.users as users
where nullif(users.raw_user_meta_data ->> 'email', '') is not null
on conflict (participant_id) do nothing;
