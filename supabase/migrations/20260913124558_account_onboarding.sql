create or replace function public.bootstrap_my_account(
  account_kind text,
  organization_name text,
  profile_name text
)
returns table (
  organization_public_id uuid,
  organization_kind text,
  organization_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  new_organization_id bigint;
  normalized_name text := btrim(organization_name);
  normalized_profile_name text := btrim(profile_name);
begin
  if current_user_id is null then
    raise exception 'Autenticação necessária.' using errcode = '42501';
  end if;

  if account_kind not in ('advertiser', 'partner') then
    raise exception 'Tipo de conta inválido.' using errcode = '22023';
  end if;

  if char_length(normalized_name) not between 2 and 120
     or char_length(normalized_profile_name) not between 2 and 120 then
    raise exception 'Informe nomes entre 2 e 120 caracteres.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.organization_members
    where user_id = current_user_id
  ) then
    raise exception 'Este usuário já pertence a uma organização.' using errcode = '23505';
  end if;

  insert into public.organizations (name, slug, kind, status)
  values (
    normalized_name,
    'conta-' || replace(gen_random_uuid()::text, '-', ''),
    account_kind,
    case when account_kind = 'advertiser' then 'active' else 'pending' end
  )
  returning id into new_organization_id;

  insert into public.profiles (user_id, full_name)
  values (current_user_id, normalized_profile_name)
  on conflict (user_id) do update
    set full_name = excluded.full_name;

  insert into public.organization_members (organization_id, user_id, role)
  values (new_organization_id, current_user_id, 'owner');

  return query
  select organization.public_id, organization.kind, organization.status
  from public.organizations organization
  where organization.id = new_organization_id;
end;
$$;

revoke execute on function public.bootstrap_my_account(text, text, text) from public, anon;
grant execute on function public.bootstrap_my_account(text, text, text) to authenticated;
