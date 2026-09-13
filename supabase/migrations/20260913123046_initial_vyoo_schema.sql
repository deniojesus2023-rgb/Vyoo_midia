-- VYOO Mídia — schema inicial multiempresa
-- PostgreSQL / Supabase

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create table public.organizations (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  kind text not null check (kind in ('vyoo', 'advertiser', 'partner')),
  document text,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id bigint not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'manager', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.venues (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  partner_organization_id bigint not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  category text not null,
  address_line text not null,
  neighborhood text not null,
  city text not null,
  state_code text not null check (state_code ~ '^[A-Z]{2}$'),
  postal_code text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  weekday_open time,
  weekday_close time,
  daily_flow_estimate integer not null default 0 check (daily_flow_estimate >= 0),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.screens (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  venue_id bigint not null references public.venues(id) on delete restrict,
  device_code text not null unique check (device_code ~ '^VYOO-[A-Z]{2,6}-[A-Z0-9]{3,12}$'),
  name text not null,
  orientation text not null default 'landscape' check (orientation in ('landscape', 'portrait')),
  resolution_width integer not null default 1920 check (resolution_width > 0),
  resolution_height integer not null default 1080 check (resolution_height > 0),
  operating_hours_per_day numeric(4,1) not null default 10 check (operating_hours_per_day > 0 and operating_hours_per_day <= 24),
  ad_slots_per_hour smallint not null default 12 check (ad_slots_per_hour between 1 and 240),
  status text not null default 'awaiting_activation' check (status in ('awaiting_activation', 'online', 'offline', 'unstable', 'maintenance', 'disabled')),
  last_seen_at timestamptz,
  last_sync_at timestamptz,
  player_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creatives (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  advertiser_organization_id bigint not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  media_type text not null check (media_type in ('image', 'video')),
  storage_path text not null,
  mime_type text not null,
  width integer check (width > 0),
  height integer check (height > 0),
  duration_seconds numeric(6,2) check (duration_seconds > 0),
  file_size_bytes bigint not null check (file_size_bytes > 0),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (media_type = 'video' or duration_seconds is null)
);

create table public.campaigns (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  advertiser_organization_id bigint not null references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 120),
  objective text not null check (objective in ('brand_awareness', 'launch', 'institutional', 'promotion', 'event', 'other')),
  status text not null default 'draft' check (status in ('draft', 'awaiting_payment', 'in_review', 'scheduled', 'active', 'paused', 'changes_requested', 'rejected', 'ended', 'cancelled')),
  start_date date not null,
  end_date date not null,
  budget_amount numeric(12,2) not null default 0 check (budget_amount >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  paid_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table public.campaign_creatives (
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  creative_id bigint not null references public.creatives(id) on delete restrict,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (campaign_id, creative_id)
);

create table public.campaign_screens (
  id bigint generated always as identity primary key,
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  screen_id bigint not null references public.screens(id) on delete restrict,
  plays_per_hour smallint not null check (plays_per_hour between 1 and 60),
  contracted_plays bigint not null default 0 check (contracted_plays >= 0),
  unit_price numeric(12,4) not null default 0 check (unit_price >= 0),
  created_at timestamptz not null default now(),
  unique (campaign_id, screen_id)
);

create table public.moderation_reviews (
  id bigint generated always as identity primary key,
  creative_id bigint not null references public.creatives(id) on delete cascade,
  reviewer_id uuid references auth.users(id) on delete set null,
  decision text not null check (decision in ('approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.device_heartbeats (
  id bigint generated always as identity primary key,
  screen_id bigint not null references public.screens(id) on delete cascade,
  received_at timestamptz not null default now(),
  is_online boolean not null,
  player_version text,
  downloaded_content_count integer not null default 0 check (downloaded_content_count >= 0),
  free_storage_bytes bigint check (free_storage_bytes >= 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object')
);

create table public.play_events (
  id bigint generated always as identity primary key,
  event_id uuid not null default gen_random_uuid() unique,
  screen_id bigint not null references public.screens(id) on delete restrict,
  campaign_id bigint not null references public.campaigns(id) on delete restrict,
  creative_id bigint not null references public.creatives(id) on delete restrict,
  played_at timestamptz not null,
  duration_seconds numeric(6,2) not null check (duration_seconds > 0),
  proof_hash text,
  received_at timestamptz not null default now()
);

create table public.campaign_daily_stats (
  campaign_id bigint not null references public.campaigns(id) on delete cascade,
  screen_id bigint not null references public.screens(id) on delete cascade,
  stat_date date not null,
  plays bigint not null default 0 check (plays >= 0),
  online_minutes integer not null default 0 check (online_minutes between 0 and 1440),
  estimated_reach bigint not null default 0 check (estimated_reach >= 0),
  updated_at timestamptz not null default now(),
  primary key (campaign_id, screen_id, stat_date)
);

create table public.payments (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  advertiser_organization_id bigint not null references public.organizations(id) on delete restrict,
  campaign_id bigint references public.campaigns(id) on delete set null,
  provider text not null,
  provider_reference text unique,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  status text not null check (status in ('pending', 'paid', 'failed', 'refunded', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partner_statements (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  partner_organization_id bigint not null references public.organizations(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  gross_media_revenue numeric(12,2) not null default 0 check (gross_media_revenue >= 0),
  partner_share_amount numeric(12,2) not null default 0 check (partner_share_amount >= 0),
  status text not null default 'open' check (status in ('open', 'processing', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (partner_organization_id, period_start, period_end)
);

create table public.support_tickets (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  organization_id bigint not null references public.organizations(id) on delete restrict,
  screen_id bigint references public.screens(id) on delete set null,
  opened_by uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 2 and 120),
  description text not null check (char_length(description) between 2 and 4000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id bigint references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_public_id uuid,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

-- Índices: FKs, filtros do produto e séries temporais.
create index organization_members_user_id_idx on public.organization_members (user_id, organization_id);
create index venues_partner_org_idx on public.venues (partner_organization_id);
create index venues_network_filter_idx on public.venues (approval_status, state_code, city, category);
create index screens_venue_id_idx on public.screens (venue_id);
create index screens_status_last_seen_idx on public.screens (status, last_seen_at desc);
create index creatives_advertiser_status_idx on public.creatives (advertiser_organization_id, moderation_status, created_at desc);
create index creatives_created_by_idx on public.creatives (created_by) where created_by is not null;
create index campaigns_advertiser_status_dates_idx on public.campaigns (advertiser_organization_id, status, start_date, end_date);
create index campaigns_delivery_queue_idx on public.campaigns (status, start_date, end_date)
  where status in ('in_review', 'scheduled', 'active', 'paused');
create index campaigns_created_by_idx on public.campaigns (created_by) where created_by is not null;
create index campaign_creatives_creative_id_idx on public.campaign_creatives (creative_id);
create index campaign_screens_screen_id_idx on public.campaign_screens (screen_id, campaign_id);
create index moderation_reviews_creative_id_idx on public.moderation_reviews (creative_id, created_at desc);
create index moderation_reviews_reviewer_id_idx on public.moderation_reviews (reviewer_id) where reviewer_id is not null;
create index device_heartbeats_screen_time_idx on public.device_heartbeats (screen_id, received_at desc);
create index play_events_campaign_time_idx on public.play_events (campaign_id, played_at desc);
create index play_events_screen_time_idx on public.play_events (screen_id, played_at desc);
create index play_events_creative_id_idx on public.play_events (creative_id);
create index campaign_daily_stats_screen_date_idx on public.campaign_daily_stats (screen_id, stat_date desc);
create index payments_advertiser_status_idx on public.payments (advertiser_organization_id, status, created_at desc);
create index payments_campaign_id_idx on public.payments (campaign_id) where campaign_id is not null;
create index partner_statements_partner_period_idx on public.partner_statements (partner_organization_id, period_start desc);
create index support_tickets_org_status_idx on public.support_tickets (organization_id, status, created_at desc);
create index support_tickets_screen_id_idx on public.support_tickets (screen_id) where screen_id is not null;
create index support_tickets_opened_by_idx on public.support_tickets (opened_by) where opened_by is not null;
create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_actor_id_idx on public.audit_logs (actor_id) where actor_id is not null;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.has_org_access(target_organization_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_org_role(target_organization_id bigint, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role = any(allowed_roles)
  );
$$;

create or replace function private.is_vyoo_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1
    from public.organization_members membership
    join public.organizations organization on organization.id = membership.organization_id
    where membership.user_id = (select auth.uid())
      and organization.kind = 'vyoo'
      and organization.status = 'active'
      and membership.role in ('owner', 'admin', 'manager')
  );
$$;

create or replace function private.can_read_campaign(target_campaign_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_vyoo_admin()
    or exists (
      select 1 from public.campaigns campaign
      where campaign.id = target_campaign_id
        and private.has_org_access(campaign.advertiser_organization_id)
    )
    or exists (
      select 1
      from public.campaign_screens campaign_screen
      join public.screens screen on screen.id = campaign_screen.screen_id
      join public.venues venue on venue.id = screen.venue_id
      where campaign_screen.campaign_id = target_campaign_id
        and private.has_org_access(venue.partner_organization_id)
    );
$$;

create or replace function private.validate_screen_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  campaign_start date;
  campaign_end date;
  campaign_status text;
  screen_capacity smallint;
  reserved_slots integer;
begin
  select start_date, end_date, status
    into campaign_start, campaign_end, campaign_status
  from public.campaigns
  where id = new.campaign_id;

  select ad_slots_per_hour into screen_capacity
  from public.screens
  where id = new.screen_id
  for update;

  if campaign_status not in ('in_review', 'scheduled', 'active', 'paused') then
    return new;
  end if;

  select coalesce(sum(existing.plays_per_hour), 0)
    into reserved_slots
  from public.campaign_screens existing
  join public.campaigns other_campaign on other_campaign.id = existing.campaign_id
  where existing.screen_id = new.screen_id
    and existing.id <> coalesce(new.id, 0)
    and other_campaign.status in ('in_review', 'scheduled', 'active', 'paused')
    and daterange(other_campaign.start_date, other_campaign.end_date, '[]')
        && daterange(campaign_start, campaign_end, '[]');

  if reserved_slots + new.plays_per_hour > screen_capacity then
    raise exception 'Capacidade publicitária indisponível para a tela % no período informado.', new.screen_id
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function private.validate_campaign_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_screen record;
  reserved_slots integer;
begin
  if new.status not in ('in_review', 'scheduled', 'active', 'paused') then
    return new;
  end if;

  for selected_screen in
    select campaign_screen.screen_id, campaign_screen.plays_per_hour, screen.ad_slots_per_hour
    from public.campaign_screens campaign_screen
    join public.screens screen on screen.id = campaign_screen.screen_id
    where campaign_screen.campaign_id = new.id
    order by campaign_screen.screen_id
    for update of screen
  loop
    select coalesce(sum(existing.plays_per_hour), 0)
      into reserved_slots
    from public.campaign_screens existing
    join public.campaigns other_campaign on other_campaign.id = existing.campaign_id
    where existing.screen_id = selected_screen.screen_id
      and existing.campaign_id <> new.id
      and other_campaign.status in ('in_review', 'scheduled', 'active', 'paused')
      and daterange(other_campaign.start_date, other_campaign.end_date, '[]')
          && daterange(new.start_date, new.end_date, '[]');

    if reserved_slots + selected_screen.plays_per_hour > selected_screen.ad_slots_per_hour then
      raise exception 'Capacidade publicitária indisponível para a tela % no período informado.', selected_screen.screen_id
        using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

create or replace function private.validate_screen_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  peak_reserved integer;
begin
  if new.ad_slots_per_hour >= old.ad_slots_per_hour then
    return new;
  end if;

  select coalesce(max(daily_usage.reserved_slots), 0)
    into peak_reserved
  from (
    select active_day.day, sum(campaign_screen.plays_per_hour) as reserved_slots
    from generate_series(
      (select min(campaign.start_date)
       from public.campaign_screens campaign_screen
       join public.campaigns campaign on campaign.id = campaign_screen.campaign_id
       where campaign_screen.screen_id = new.id
         and campaign.status in ('in_review', 'scheduled', 'active', 'paused')),
      (select max(campaign.end_date)
       from public.campaign_screens campaign_screen
       join public.campaigns campaign on campaign.id = campaign_screen.campaign_id
       where campaign_screen.screen_id = new.id
         and campaign.status in ('in_review', 'scheduled', 'active', 'paused')),
      interval '1 day'
    ) as active_day(day)
    join public.campaign_screens campaign_screen on campaign_screen.screen_id = new.id
    join public.campaigns campaign on campaign.id = campaign_screen.campaign_id
      and campaign.status in ('in_review', 'scheduled', 'active', 'paused')
      and active_day.day::date between campaign.start_date and campaign.end_date
    group by active_day.day
  ) as daily_usage;

  if peak_reserved > new.ad_slots_per_hour then
    raise exception 'A capacidade não pode ser menor que as % inserções por hora já reservadas.', peak_reserved
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create or replace function private.validate_resource_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  organization_kind text;
begin
  if tg_table_name = 'venues' then
    select kind into organization_kind from public.organizations where id = new.partner_organization_id;
    if organization_kind is distinct from 'partner' then
      raise exception 'O estabelecimento deve pertencer a uma organização parceira.' using errcode = '23514';
    end if;
  elsif tg_table_name in ('creatives', 'campaigns') then
    select kind into organization_kind from public.organizations where id = new.advertiser_organization_id;
    if organization_kind is distinct from 'advertiser' then
      raise exception 'O recurso deve pertencer a uma organização anunciante.' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.validate_campaign_creative_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  campaign_organization_id bigint;
  creative_organization_id bigint;
begin
  select advertiser_organization_id into campaign_organization_id
  from public.campaigns where id = new.campaign_id;
  select advertiser_organization_id into creative_organization_id
  from public.creatives where id = new.creative_id;

  if campaign_organization_id is distinct from creative_organization_id then
    raise exception 'Campanha e criativo devem pertencer ao mesmo anunciante.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.protect_venue_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role') and not private.is_vyoo_admin() then
    if tg_op = 'INSERT' and new.approval_status <> 'pending' then
      raise exception 'Novos estabelecimentos devem aguardar aprovação da VYOO.' using errcode = '42501';
    elsif tg_op = 'UPDATE' and (
       new.partner_organization_id is distinct from old.partner_organization_id
       or new.approval_status is distinct from old.approval_status) then
      raise exception 'Somente a VYOO pode alterar vínculo e aprovação do estabelecimento.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.protect_creative_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role') and not private.is_vyoo_admin() then
    if tg_op = 'INSERT' and (new.moderation_status <> 'pending' or new.rejection_reason is not null) then
      raise exception 'Novos criativos devem aguardar moderação da VYOO.' using errcode = '42501';
    elsif tg_op = 'UPDATE' and (
       new.advertiser_organization_id is distinct from old.advertiser_organization_id
       or new.moderation_status is distinct from old.moderation_status
       or new.rejection_reason is distinct from old.rejection_reason) then
      raise exception 'Somente a VYOO pode alterar vínculo e moderação do criativo.' using errcode = '42501';
    end if;
    if tg_op = 'UPDATE' and old.moderation_status = 'approved' then
      raise exception 'Um criativo aprovado não pode ser alterado; envie uma nova versão.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create or replace function private.protect_campaign_admin_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role') and not private.is_vyoo_admin() then
    if tg_op = 'INSERT' and (
       new.status <> 'draft' or new.budget_amount <> 0 or new.paid_at is not null
       or new.submitted_at is not null or new.approved_at is not null) then
      raise exception 'Novas campanhas devem começar como rascunho, sem aprovação ou pagamento.' using errcode = '42501';
    elsif tg_op = 'UPDATE' and (
       new.advertiser_organization_id is distinct from old.advertiser_organization_id
       or new.budget_amount is distinct from old.budget_amount
       or new.paid_at is distinct from old.paid_at
       or new.approved_at is distinct from old.approved_at) then
      raise exception 'Somente a VYOO pode alterar vínculo, preço, pagamento ou aprovação.' using errcode = '42501';
    end if;

    if tg_op = 'UPDATE' and new.status is distinct from old.status then
      if (old.status in ('draft', 'changes_requested') and new.status = 'in_review') then
        new.submitted_at = now();
      elsif (old.status in ('scheduled', 'active') and new.status = 'paused')
         or (old.status = 'paused' and new.status = 'scheduled') then
        null;
      else
        raise exception 'Transição de status não permitida para o anunciante.' using errcode = '42501';
      end if;
    elsif tg_op = 'UPDATE' and old.status not in ('draft', 'changes_requested') then
      raise exception 'A campanha só pode ser editada enquanto estiver em rascunho ou ajustes.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger organizations_set_updated_at before update on public.organizations for each row execute function private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger venues_set_updated_at before update on public.venues for each row execute function private.set_updated_at();
create trigger screens_set_updated_at before update on public.screens for each row execute function private.set_updated_at();
create trigger creatives_set_updated_at before update on public.creatives for each row execute function private.set_updated_at();
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function private.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function private.set_updated_at();
create trigger partner_statements_set_updated_at before update on public.partner_statements for each row execute function private.set_updated_at();
create trigger support_tickets_set_updated_at before update on public.support_tickets for each row execute function private.set_updated_at();
create trigger campaign_screens_validate_inventory before insert or update on public.campaign_screens for each row execute function private.validate_screen_inventory();
create trigger campaigns_validate_inventory before update of start_date, end_date, status on public.campaigns for each row execute function private.validate_campaign_inventory();
create trigger screens_validate_capacity before update of ad_slots_per_hour on public.screens for each row execute function private.validate_screen_capacity();
create trigger venues_validate_organization before insert or update of partner_organization_id on public.venues for each row execute function private.validate_resource_organization();
create trigger creatives_validate_organization before insert or update of advertiser_organization_id on public.creatives for each row execute function private.validate_resource_organization();
create trigger campaigns_validate_organization before insert or update of advertiser_organization_id on public.campaigns for each row execute function private.validate_resource_organization();
create trigger campaign_creatives_validate_owner before insert or update on public.campaign_creatives for each row execute function private.validate_campaign_creative_owner();
create trigger venues_protect_admin_fields before insert or update on public.venues for each row execute function private.protect_venue_admin_fields();
create trigger creatives_protect_admin_fields before insert or update on public.creatives for each row execute function private.protect_creative_admin_fields();
create trigger campaigns_protect_admin_fields before insert or update on public.campaigns for each row execute function private.protect_campaign_admin_fields();

revoke execute on all functions in schema private from public, anon;
grant execute on function private.set_updated_at() to authenticated, service_role;
grant execute on function private.has_org_access(bigint) to authenticated, service_role;
grant execute on function private.has_org_role(bigint, text[]) to authenticated, service_role;
grant execute on function private.is_vyoo_admin() to authenticated, service_role;
grant execute on function private.can_read_campaign(bigint) to authenticated, service_role;
grant execute on function private.protect_venue_admin_fields() to authenticated, service_role;
grant execute on function private.protect_creative_admin_fields() to authenticated, service_role;
grant execute on function private.protect_campaign_admin_fields() to authenticated, service_role;
grant execute on function private.validate_screen_inventory() to service_role;
grant execute on function private.validate_campaign_inventory() to service_role;
grant execute on function private.validate_screen_capacity() to service_role;
grant execute on function private.validate_resource_organization() to service_role;
grant execute on function private.validate_campaign_creative_owner() to service_role;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.venues enable row level security;
alter table public.screens enable row level security;
alter table public.creatives enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_creatives enable row level security;
alter table public.campaign_screens enable row level security;
alter table public.moderation_reviews enable row level security;
alter table public.device_heartbeats enable row level security;
alter table public.play_events enable row level security;
alter table public.campaign_daily_stats enable row level security;
alter table public.payments enable row level security;
alter table public.partner_statements enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs enable row level security;

create policy organizations_select on public.organizations for select to authenticated
  using (private.has_org_access(id) or private.is_vyoo_admin());
create policy organizations_admin_all on public.organizations for all to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());

create policy profiles_select on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or private.is_vyoo_admin());
create policy profiles_insert_self on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy profiles_update_self on public.profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy memberships_select on public.organization_members for select to authenticated
  using (private.has_org_access(organization_id) or private.is_vyoo_admin());
create policy memberships_manage on public.organization_members for all to authenticated
  using (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']))
  with check (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']));

create policy venues_select on public.venues for select to authenticated
  using (approval_status = 'approved' or private.has_org_access(partner_organization_id) or private.is_vyoo_admin());
create policy venues_insert on public.venues for insert to authenticated
  with check (private.has_org_role(partner_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());
create policy venues_update on public.venues for update to authenticated
  using (private.has_org_role(partner_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  with check (private.has_org_role(partner_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());

create policy screens_select on public.screens for select to authenticated
  using (
    private.is_vyoo_admin() or exists (
      select 1 from public.venues venue
      where venue.id = screens.venue_id
        and (venue.approval_status = 'approved' or private.has_org_access(venue.partner_organization_id))
    )
  );
create policy screens_admin_write on public.screens for all to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());

create policy creatives_select on public.creatives for select to authenticated
  using (private.has_org_access(advertiser_organization_id) or private.is_vyoo_admin());
create policy creatives_insert on public.creatives for insert to authenticated
  with check (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());
create policy creatives_update on public.creatives for update to authenticated
  using (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  with check (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());

create policy campaigns_select on public.campaigns for select to authenticated
  using (private.can_read_campaign(id));
create policy campaigns_insert on public.campaigns for insert to authenticated
  with check (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());
create policy campaigns_update on public.campaigns for update to authenticated
  using (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  with check (private.has_org_role(advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());

create policy campaign_creatives_select on public.campaign_creatives for select to authenticated
  using (private.can_read_campaign(campaign_id));
create policy campaign_creatives_write on public.campaign_creatives for all to authenticated
  using (exists (select 1 from public.campaigns campaign where campaign.id = campaign_creatives.campaign_id and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())))
  with check (exists (select 1 from public.campaigns campaign where campaign.id = campaign_creatives.campaign_id and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())));

create policy campaign_screens_select on public.campaign_screens for select to authenticated
  using (private.can_read_campaign(campaign_id));
create policy campaign_screens_write on public.campaign_screens for all to authenticated
  using (exists (select 1 from public.campaigns campaign where campaign.id = campaign_screens.campaign_id and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())))
  with check (exists (select 1 from public.campaigns campaign where campaign.id = campaign_screens.campaign_id and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())));

create policy moderation_reviews_select on public.moderation_reviews for select to authenticated
  using (private.is_vyoo_admin() or exists (select 1 from public.creatives creative where creative.id = moderation_reviews.creative_id and private.has_org_access(creative.advertiser_organization_id)));
create policy moderation_reviews_admin_write on public.moderation_reviews for all to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());

create policy device_heartbeats_select on public.device_heartbeats for select to authenticated
  using (private.is_vyoo_admin() or exists (select 1 from public.screens screen join public.venues venue on venue.id = screen.venue_id where screen.id = device_heartbeats.screen_id and private.has_org_access(venue.partner_organization_id)));

create policy play_events_select on public.play_events for select to authenticated
  using (private.can_read_campaign(campaign_id));

create policy campaign_daily_stats_select on public.campaign_daily_stats for select to authenticated
  using (private.can_read_campaign(campaign_id));

create policy payments_select on public.payments for select to authenticated
  using (private.has_org_access(advertiser_organization_id) or private.is_vyoo_admin());
create policy payments_admin_write on public.payments for all to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());

create policy partner_statements_select on public.partner_statements for select to authenticated
  using (private.has_org_access(partner_organization_id) or private.is_vyoo_admin());
create policy partner_statements_admin_write on public.partner_statements for all to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());

create policy support_tickets_select on public.support_tickets for select to authenticated
  using (private.has_org_access(organization_id) or private.is_vyoo_admin());
create policy support_tickets_insert on public.support_tickets for insert to authenticated
  with check (private.has_org_access(organization_id) and opened_by = (select auth.uid()));
create policy support_tickets_update on public.support_tickets for update to authenticated
  using (private.has_org_role(organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  with check (private.has_org_role(organization_id, array['owner','admin','manager']) or private.is_vyoo_admin());

create policy audit_logs_select on public.audit_logs for select to authenticated
  using ((organization_id is not null and private.has_org_access(organization_id)) or private.is_vyoo_admin());

-- Exposição explícita à Data API. O acesso às linhas continua protegido por RLS.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant all on sequences to service_role;

insert into public.organizations (name, slug, kind, status)
values ('VYOO', 'vyoo', 'vyoo', 'active');
