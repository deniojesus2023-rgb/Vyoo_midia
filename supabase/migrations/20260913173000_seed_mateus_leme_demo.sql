-- Rede demonstrativa idempotente para validar os três produtos VYOO de ponta a ponta.
do $$
declare
  advertiser_id bigint;
  academy_org_id bigint;
  network_org_id bigint;
  vyoo_org_id bigint;
  creative_approved_id bigint;
  creative_pending_id bigint;
  campaign_one_id bigint;
  campaign_two_id bigint;
  campaign_three_id bigint;
begin
  select id into advertiser_id from public.organizations where kind = 'advertiser' order by id limit 1;
  select id into vyoo_org_id from public.organizations where kind = 'vyoo' order by id limit 1;
  if advertiser_id is null then
    insert into public.organizations (name, slug, kind, status)
    values ('Padaria Central', 'padaria-central-demo', 'advertiser', 'active') returning id into advertiser_id;
  end if;

  insert into public.organizations (name, slug, kind, status)
  values ('Academia Alpha', 'academia-alpha-demo', 'partner', 'active')
  on conflict (slug) do update set status = 'active'
  returning id into academy_org_id;

  insert into public.organizations (name, slug, kind, status)
  values ('Parceiros VYOO Mateus Leme', 'parceiros-mateus-leme-demo', 'partner', 'active')
  on conflict (slug) do update set status = 'active'
  returning id into network_org_id;

  insert into public.venues (partner_organization_id,name,category,address_line,neighborhood,city,state_code,weekday_open,weekday_close,daily_flow_estimate,approval_status)
  select academy_org_id,'Academia Alpha','Academias','Rua Miguel Alves, 120','Centro','Mateus Leme','MG','06:00','23:00',350,'approved'
  where not exists (select 1 from public.venues where partner_organization_id=academy_org_id and name='Academia Alpha');

  insert into public.venues (partner_organization_id,name,category,address_line,neighborhood,city,state_code,weekday_open,weekday_close,daily_flow_estimate,approval_status)
  select network_org_id,v.name,v.category,v.address_line,v.neighborhood,'Mateus Leme','MG',v.opens_at::time,v.closes_at::time,v.flow,'approved'
  from (values
    ('Padaria Central','Padarias','Praça Benedito Valadares, 34','Centro','06:00','20:00',480),
    ('Mercado Avenida','Mercados','Av. Getúlio Vargas, 410','Centro','07:00','21:00',600),
    ('Clínica Central','Clínicas','Rua São Sebastião, 75','Centro','08:00','18:00',180),
    ('Supermercado União','Mercados','Rua das Acácias, 210','Azurita','07:00','21:00',720),
    ('Farmácia São Lucas','Farmácias','Av. Brasília, 88','Sítio Novo','07:00','22:00',380),
    ('Academia Movimento','Academias','Rua Minas Gerais, 51','Centro','06:00','22:00',300),
    ('Padaria São José','Padarias','Rua João XXIII, 19','Centro','06:00','20:00',320),
    ('Clínica Vida','Clínicas','Rua do Rosário, 144','Centro','08:00','18:00',150),
    ('Loja Aurora','Lojas','Av. Tiradentes, 300','Centro','09:00','19:00',210),
    ('Barbearia Centro','Barbearias','Rua Padre Vilaça, 27','Centro','09:00','20:00',100),
    ('Restaurante Sabor','Restaurantes','Rua Santa Cruz, 92','Centro','11:00','23:00',280)
  ) as v(name,category,address_line,neighborhood,opens_at,closes_at,flow)
  where not exists (select 1 from public.venues existing where existing.partner_organization_id=network_org_id and existing.name=v.name);

  insert into public.screens (venue_id,device_code,name,operating_hours_per_day,ad_slots_per_hour,status,last_seen_at,last_sync_at,player_version)
  select venue.id, mapping.code, 'Tela principal · '||venue.name, mapping.hours, 12, mapping.status, now()-mapping.seen_ago, now()-mapping.sync_ago, '1.4.2'
  from (values
    ('Academia Alpha','VYOO-ML-001',17::numeric,'online','1 minute'::interval,'1 minute'::interval),
    ('Padaria Central','VYOO-ML-002',14::numeric,'online','2 minutes'::interval,'2 minutes'::interval),
    ('Mercado Avenida','VYOO-ML-003',14::numeric,'online','1 minute'::interval,'1 minute'::interval),
    ('Clínica Central','VYOO-ML-004',10::numeric,'online','3 minutes'::interval,'3 minutes'::interval),
    ('Supermercado União','VYOO-ML-014',14::numeric,'offline','42 minutes'::interval,'42 minutes'::interval),
    ('Farmácia São Lucas','VYOO-ML-019',15::numeric,'unstable','8 minutes'::interval,'8 minutes'::interval),
    ('Academia Movimento','VYOO-ML-006',16::numeric,'online','1 minute'::interval,'1 minute'::interval),
    ('Padaria São José','VYOO-ML-008',14::numeric,'online','2 minutes'::interval,'2 minutes'::interval),
    ('Clínica Vida','VYOO-ML-009',10::numeric,'online','1 minute'::interval,'1 minute'::interval),
    ('Loja Aurora','VYOO-ML-010',10::numeric,'online','2 minutes'::interval,'2 minutes'::interval),
    ('Barbearia Centro','VYOO-ML-011',11::numeric,'online','1 minute'::interval,'1 minute'::interval),
    ('Restaurante Sabor','VYOO-ML-012',12::numeric,'online','3 minutes'::interval,'3 minutes'::interval)
  ) as mapping(venue_name,code,hours,status,seen_ago,sync_ago)
  join public.venues venue on venue.name=mapping.venue_name
  where not exists (select 1 from public.screens existing where existing.device_code=mapping.code);

  select id into creative_approved_id from public.creatives where advertiser_organization_id=advertiser_id and name='Café da manhã' limit 1;
  if creative_approved_id is null then
    insert into public.creatives (advertiser_organization_id,name,media_type,storage_path,mime_type,width,height,duration_seconds,file_size_bytes,moderation_status)
    values (advertiser_id,'Café da manhã','video','demo/cafe-da-manha-15s.mp4','video/mp4',1920,1080,15,1048576,'approved') returning id into creative_approved_id;
  end if;
  select id into creative_pending_id from public.creatives where advertiser_organization_id=advertiser_id and name='Sabores de outubro' limit 1;
  if creative_pending_id is null then
    insert into public.creatives (advertiser_organization_id,name,media_type,storage_path,mime_type,width,height,duration_seconds,file_size_bytes,moderation_status)
    values (advertiser_id,'Sabores de outubro','image','demo/sabores-outubro.webp','image/webp',1920,1080,null,524288,'pending') returning id into creative_pending_id;
  end if;

  select id into campaign_one_id from public.campaigns where advertiser_organization_id=advertiser_id and name='Café da manhã no Centro' limit 1;
  if campaign_one_id is null then
    insert into public.campaigns (advertiser_organization_id,name,status,start_date,end_date,budget_amount,objective,paid_at,approved_at,submitted_at)
    values (advertiser_id,'Café da manhã no Centro','active','2026-09-01','2026-09-30',1990,'brand_awareness','2026-08-28', '2026-08-29','2026-08-28') returning id into campaign_one_id;
    insert into public.campaign_creatives(campaign_id,creative_id,is_primary) values(campaign_one_id,creative_approved_id,true);
  end if;
  insert into public.campaign_screens(campaign_id,screen_id,plays_per_hour,contracted_plays,unit_price)
  select campaign_one_id,screen.id,4,screen.operating_hours_per_day::int*30*4,248.75 from public.screens screen
  where screen.device_code=any(array['VYOO-ML-001','VYOO-ML-002','VYOO-ML-003','VYOO-ML-004','VYOO-ML-006','VYOO-ML-008','VYOO-ML-009','VYOO-ML-019'])
  and not exists(select 1 from public.campaign_screens cs where cs.campaign_id=campaign_one_id and cs.screen_id=screen.id);

  select id into campaign_two_id from public.campaigns where advertiser_organization_id=advertiser_id and name='Encomendas da semana' limit 1;
  if campaign_two_id is null then
    insert into public.campaigns (advertiser_organization_id,name,status,start_date,end_date,budget_amount,objective,paid_at,approved_at,submitted_at)
    values (advertiser_id,'Encomendas da semana','active','2026-09-01','2026-09-30',1000,'promotion','2026-08-29','2026-08-30','2026-08-29') returning id into campaign_two_id;
    insert into public.campaign_creatives(campaign_id,creative_id,is_primary) values(campaign_two_id,creative_approved_id,true);
  end if;
  insert into public.campaign_screens(campaign_id,screen_id,plays_per_hour,contracted_plays,unit_price)
  select campaign_two_id,screen.id,2,screen.operating_hours_per_day::int*30*2,250 from public.screens screen
  where screen.device_code=any(array['VYOO-ML-001','VYOO-ML-010','VYOO-ML-011','VYOO-ML-012'])
  and not exists(select 1 from public.campaign_screens cs where cs.campaign_id=campaign_two_id and cs.screen_id=screen.id);

  select id into campaign_three_id from public.campaigns where advertiser_organization_id=advertiser_id and name='Sabores de outubro' limit 1;
  if campaign_three_id is null then
    insert into public.campaigns (advertiser_organization_id,name,status,start_date,end_date,budget_amount,objective,paid_at,submitted_at)
    values (advertiser_id,'Sabores de outubro','in_review','2026-10-01','2026-10-31',890,'launch','2026-09-12','2026-09-12') returning id into campaign_three_id;
    insert into public.campaign_creatives(campaign_id,creative_id,is_primary) values(campaign_three_id,creative_pending_id,true);
  end if;
  insert into public.campaign_screens(campaign_id,screen_id,plays_per_hour,contracted_plays,unit_price)
  select campaign_three_id,screen.id,2,screen.operating_hours_per_day::int*31*2,296.67 from public.screens screen
  where screen.device_code=any(array['VYOO-ML-001','VYOO-ML-002','VYOO-ML-003'])
  and not exists(select 1 from public.campaign_screens cs where cs.campaign_id=campaign_three_id and cs.screen_id=screen.id);

  insert into public.campaign_daily_stats(campaign_id,screen_id,stat_date,plays,online_minutes,estimated_reach)
  select cs.campaign_id,cs.screen_id,day::date,(cs.plays_per_hour*10+extract(day from day)::int%8),600,(cs.plays_per_hour*35+extract(day from day)::int%20)
  from public.campaign_screens cs cross join generate_series('2026-09-01'::date,'2026-09-13'::date,'1 day') day
  where cs.campaign_id in (campaign_one_id,campaign_two_id)
  on conflict (campaign_id,screen_id,stat_date) do nothing;

  insert into public.partner_statements(partner_organization_id,period_start,period_end,gross_media_revenue,partner_share_amount,status)
  values(academy_org_id,'2026-09-01','2026-09-30',2840,1136,'processing')
  on conflict(partner_organization_id,period_start,period_end) do nothing;

  if vyoo_org_id is not null then
    insert into public.support_tickets(organization_id,screen_id,title,description,status,priority)
    select vyoo_org_id,screen.id,'Sem sincronização','Sem sincronização há 42 minutos. Verificar a conexão com o estabelecimento.','open','high'
    from public.screens screen where screen.device_code='VYOO-ML-014'
    and not exists(select 1 from public.support_tickets where screen_id=screen.id and status='open');
    insert into public.support_tickets(organization_id,screen_id,title,description,status,priority)
    select vyoo_org_id,screen.id,'Conexão instável','Oscilações de conexão detectadas no player.','open','normal'
    from public.screens screen where screen.device_code='VYOO-ML-019'
    and not exists(select 1 from public.support_tickets where screen_id=screen.id and status='open');
  end if;
end $$;
