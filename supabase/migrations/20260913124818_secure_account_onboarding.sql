drop function public.bootstrap_my_account(text, text, text);

create table public.account_onboarding_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  account_kind text not null check (account_kind in ('advertiser', 'partner')),
  organization_name text not null check (char_length(btrim(organization_name)) between 2 and 120),
  profile_name text not null check (char_length(btrim(profile_name)) between 2 and 120),
  organization_id bigint not null references public.organizations(id) on delete restrict,
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index account_onboarding_org_idx on public.account_onboarding_requests (organization_id);

alter table public.account_onboarding_requests enable row level security;

create policy account_onboarding_select_self on public.account_onboarding_requests
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy account_onboarding_insert_self on public.account_onboarding_requests
  for insert to authenticated
  with check (user_id = (select auth.uid()));

grant select, insert on public.account_onboarding_requests to authenticated;
grant all on public.account_onboarding_requests to service_role;

create or replace function private.process_account_onboarding()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_organization_id bigint;
begin
  if current_user_id is null or new.user_id is distinct from current_user_id then
    raise exception 'Autenticação necessária.' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.organization_members
    where user_id = current_user_id
  ) then
    raise exception 'Este usuário já pertence a uma organização.' using errcode = '23505';
  end if;

  insert into public.organizations (name, slug, kind, status)
  values (
    btrim(new.organization_name),
    'conta-' || replace(gen_random_uuid()::text, '-', ''),
    new.account_kind,
    case when new.account_kind = 'advertiser' then 'active' else 'pending' end
  )
  returning id into new_organization_id;

  insert into public.profiles (user_id, full_name)
  values (current_user_id, btrim(new.profile_name))
  on conflict (user_id) do update
    set full_name = excluded.full_name;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_organization_id, current_user_id, 'owner');

  new.organization_id := new_organization_id;
  new.completed_at := now();
  return new;
end;
$$;

revoke execute on function private.process_account_onboarding() from public, anon, authenticated;
grant execute on function private.process_account_onboarding() to service_role;

create trigger account_onboarding_process
  before insert on public.account_onboarding_requests
  for each row execute function private.process_account_onboarding();
