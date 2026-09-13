-- Evita políticas SELECT permissivas duplicadas: operações de escrita ficam separadas.

drop policy organizations_admin_all on public.organizations;
create policy organizations_admin_insert on public.organizations for insert to authenticated
  with check (private.is_vyoo_admin());
create policy organizations_admin_update on public.organizations for update to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());
create policy organizations_admin_delete on public.organizations for delete to authenticated
  using (private.is_vyoo_admin());

drop policy memberships_manage on public.organization_members;
create policy memberships_insert on public.organization_members for insert to authenticated
  with check (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']));
create policy memberships_update on public.organization_members for update to authenticated
  using (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']))
  with check (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']));
create policy memberships_delete on public.organization_members for delete to authenticated
  using (private.is_vyoo_admin() or private.has_org_role(organization_id, array['owner','admin']));

drop policy screens_admin_write on public.screens;
create policy screens_admin_insert on public.screens for insert to authenticated
  with check (private.is_vyoo_admin());
create policy screens_admin_update on public.screens for update to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());
create policy screens_admin_delete on public.screens for delete to authenticated
  using (private.is_vyoo_admin());

drop policy campaign_creatives_write on public.campaign_creatives;
create policy campaign_creatives_insert on public.campaign_creatives for insert to authenticated
  with check (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_creatives.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));
create policy campaign_creatives_update on public.campaign_creatives for update to authenticated
  using (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_creatives.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ))
  with check (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_creatives.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));
create policy campaign_creatives_delete on public.campaign_creatives for delete to authenticated
  using (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_creatives.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));

drop policy campaign_screens_write on public.campaign_screens;
create policy campaign_screens_insert on public.campaign_screens for insert to authenticated
  with check (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_screens.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));
create policy campaign_screens_update on public.campaign_screens for update to authenticated
  using (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_screens.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ))
  with check (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_screens.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));
create policy campaign_screens_delete on public.campaign_screens for delete to authenticated
  using (exists (
    select 1 from public.campaigns campaign
    where campaign.id = campaign_screens.campaign_id
      and (private.has_org_role(campaign.advertiser_organization_id, array['owner','admin','manager']) or private.is_vyoo_admin())
  ));

drop policy moderation_reviews_admin_write on public.moderation_reviews;
create policy moderation_reviews_admin_insert on public.moderation_reviews for insert to authenticated
  with check (private.is_vyoo_admin());
create policy moderation_reviews_admin_update on public.moderation_reviews for update to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());
create policy moderation_reviews_admin_delete on public.moderation_reviews for delete to authenticated
  using (private.is_vyoo_admin());

drop policy payments_admin_write on public.payments;
create policy payments_admin_insert on public.payments for insert to authenticated
  with check (private.is_vyoo_admin());
create policy payments_admin_update on public.payments for update to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());
create policy payments_admin_delete on public.payments for delete to authenticated
  using (private.is_vyoo_admin());

drop policy partner_statements_admin_write on public.partner_statements;
create policy partner_statements_admin_insert on public.partner_statements for insert to authenticated
  with check (private.is_vyoo_admin());
create policy partner_statements_admin_update on public.partner_statements for update to authenticated
  using (private.is_vyoo_admin()) with check (private.is_vyoo_admin());
create policy partner_statements_admin_delete on public.partner_statements for delete to authenticated
  using (private.is_vyoo_admin());
