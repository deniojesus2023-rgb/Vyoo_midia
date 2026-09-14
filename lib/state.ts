import { createClient } from "@/lib/supabase/server";
import { cost, type State } from "@/lib/model";

export const statusLabel: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  unstable: "Instável",
  maintenance: "Manutenção",
  awaiting_activation: "Aguardando ativação",
  disabled: "Desativada",
  draft: "Rascunho",
  in_review: "Em análise",
  scheduled: "Agendada",
  active: "Ativa",
  paused: "Pausada",
  changes_requested: "Ajustes necessários",
  rejected: "Reprovada",
  ended: "Encerrada",
  cancelled: "Cancelada",
  pending: "Em análise",
  approved: "Aprovado",
  open: "Aberto",
  in_progress: "Em andamento",
  resolved: "Resolvido",
  closed: "Fechado",
};

export const objectiveToDb: Record<string, string> = {
  "Reconhecimento de marca": "brand_awareness",
  Lançamento: "launch",
  "Divulgação institucional": "institutional",
  "Promoção / oferta": "promotion",
  Evento: "event",
  Outro: "other",
};
export const objectiveFromDb = Object.fromEntries(
  Object.entries(objectiveToDb).map(([label, value]) => [value, label]),
);

export class ActionError extends Error {
  code: number;
  constructor(message: string, code = 400) {
    super(message);
    this.code = code;
  }
}

export async function context() {
  const db = await createClient();
  const { data: claims } = await db.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) return null;
  const { data: membership } = await db
    .from("organization_members")
    .select("organization_id,role,organizations!inner(name,kind,status)")
    .eq("user_id", uid)
    .limit(1)
    .maybeSingle();
  return membership
    ? {
        db,
        uid,
        orgId: membership.organization_id,
        role: membership.role,
        org: membership.organizations,
      }
    : null;
}

export type StateContext = NonNullable<Awaited<ReturnType<typeof context>>>;

export async function loadState(ctx: StateContext) {
  const { db, org } = ctx;
  const [
    screenQuery,
    creativeQuery,
    campaignQuery,
    ticketQuery,
    auditQuery,
    statementQuery,
  ] = await Promise.all([
    db
      .from("screens")
      .select(
        "id,device_code,status,last_sync_at,ad_slots_per_hour,operating_hours_per_day,venues!inner(name,category,neighborhood,daily_flow_estimate,approval_status)",
      ),
    db
      .from("creatives")
      .select(
        "id,public_id,name,media_type,storage_path,mime_type,file_size_bytes,moderation_status,rejection_reason",
      ),
    db
      .from("campaigns")
      .select(
        "id,public_id,name,status,start_date,end_date,budget_amount,objective,paid_at,organizations!inner(name),campaign_screens(screen_id,plays_per_hour,contracted_plays),campaign_creatives(creative_id),campaign_daily_stats(plays,estimated_reach)",
      ),
    db
      .from("support_tickets")
      .select("public_id,title,status,description,screen_id"),
    db
      .from("audit_logs")
      .select("created_at,action")
      .order("created_at", { ascending: false })
      .limit(200),
    db
      .from("partner_statements")
      .select("gross_media_revenue,partner_share_amount,status")
      .order("period_end", { ascending: false })
      .limit(12),
  ]);
  const rawScreens = (screenQuery.data ?? []) as any[];
  const rawCampaigns = (campaignQuery.data ?? []) as any[];
  const usedByScreen = new Map<number, number>();
  for (const campaign of rawCampaigns) {
    if (["cancelled", "ended"].includes(campaign.status)) continue;
    for (const item of campaign.campaign_screens ?? [])
      usedByScreen.set(
        item.screen_id,
        (usedByScreen.get(item.screen_id) ?? 0) + Number(item.plays_per_hour),
      );
  }
  const screens = rawScreens.map((screen) => ({
    id: screen.device_code,
    name: screen.venues.name,
    category: screen.venues.category,
    neighborhood: screen.venues.neighborhood,
    status: statusLabel[screen.status] ?? screen.status,
    sync: screen.last_sync_at ?? "Nunca",
    occupancy: Math.min(
      100,
      Math.round(
        ((usedByScreen.get(screen.id) ?? 0) /
          Math.max(1, Number(screen.ad_slots_per_hour))) *
          100,
      ),
    ),
    hours: Number(screen.operating_hours_per_day),
    flow: Number(screen.venues.daily_flow_estimate),
    approved: screen.venues.approval_status === "approved",
  }));
  const rawCreatives = (creativeQuery.data ?? []) as any[];
  const creatives = rawCreatives.map((creative) => ({
    id: creative.public_id,
    name: creative.name,
    status: statusLabel[creative.moderation_status] ?? creative.moderation_status,
    url: `/api/media/${creative.public_id}`,
    type: creative.media_type,
    reason: creative.rejection_reason ?? undefined,
  }));
  const screenById = new Map(
    rawScreens.map((screen) => [screen.id, screen.device_code]),
  );
  const creativeById = new Map(
    rawCreatives.map((creative) => [creative.id, creative.public_id]),
  );
  const campaigns = rawCampaigns.map((campaign) => ({
    id: campaign.public_id,
    name: campaign.name,
    advertiser: campaign.organizations.name,
    status: statusLabel[campaign.status] ?? campaign.status,
    screenIds: (campaign.campaign_screens ?? [])
      .map((item: any) => screenById.get(item.screen_id))
      .filter(Boolean),
    creativeId:
      creativeById.get(campaign.campaign_creatives?.[0]?.creative_id) ?? "",
    frequency: Number(campaign.campaign_screens?.[0]?.plays_per_hour ?? 0),
    contractedPlays: (campaign.campaign_screens ?? []).reduce(
      (sum: number, item: any) => sum + Number(item.contracted_plays),
      0,
    ),
    start: campaign.start_date,
    end: campaign.end_date,
    budget: Number(campaign.budget_amount),
    plays: (campaign.campaign_daily_stats ?? []).reduce(
      (sum: number, item: any) => sum + Number(item.plays),
      0,
    ),
    reach: (campaign.campaign_daily_stats ?? []).reduce(
      (sum: number, item: any) => sum + Number(item.estimated_reach),
      0,
    ),
    objective: objectiveFromDb[campaign.objective] ?? campaign.objective,
    paid: Boolean(campaign.paid_at),
  }));
  const tickets = ((ticketQuery.data ?? []) as any[]).map((ticket) => ({
    id: ticket.public_id,
    title: ticket.title,
    screenId: screenById.get(ticket.screen_id) ?? "",
    status: statusLabel[ticket.status] ?? ticket.status,
    description: ticket.description,
  }));
  const financial = ((statementQuery.data ?? []) as any[]).reduce(
    (total, item) => {
      const gross = Number(item.gross_media_revenue),
        share = Number(item.partner_share_amount);
      return {
        gross: total.gross + gross,
        share: total.share + share,
        paid: total.paid + (item.status === "paid" ? share : 0),
        available:
          total.available +
          (["open", "processing"].includes(item.status) ? share : 0),
      };
    },
    { gross: 0, share: 0, paid: 0, available: 0 },
  );
  const state: State = {
    screens,
    creatives: org.kind === "partner" ? [] : creatives,
    campaigns,
    tickets,
    audit: (auditQuery.data ?? []).map((item: any) => ({
      date: item.created_at,
      text: item.action,
    })),
    settings: { name: org.name, email: "" },
    contents:
      org.kind === "partner"
        ? creatives.map((item) => ({ ...item, own: true }))
        : [],
    financial,
  };
  return state;
}

export async function applyAction(
  ctx: StateContext,
  action: string,
  value: Record<string, any>,
): Promise<string> {
  const { db, uid, orgId, org, role } = ctx;
  const isAdmin =
    org.kind === "vyoo" && ["owner", "admin", "manager"].includes(role);
  if (action === "creative.create") {
    if (!["advertiser", "partner"].includes(org.kind))
      throw new ActionError("Este perfil não pode enviar conteúdo.", 403);
    const mediaId = String(value.url ?? "")
      .split("/")
      .pop();
    if (!mediaId) throw new ActionError("Arquivo inválido.");
    const mimeType = String(
      value.mimeType ?? (value.type === "video" ? "video/mp4" : "image/jpeg"),
    );
    const { error } = await db.from("creatives").insert({
      advertiser_organization_id: orgId,
      name: String(value.name).slice(0, 120),
      media_type: value.type === "video" ? "video" : "image",
      storage_path: `${uid}/${mediaId}`,
      mime_type: mimeType,
      file_size_bytes: Math.max(1, Number(value.fileSize ?? 1)),
      created_by: uid,
    });
    if (error) throw error;
    return "Conteúdo enviado para análise";
  }
  if (action === "campaign.create") {
    if (org.kind !== "advertiser")
      throw new ActionError("Somente anunciantes podem criar campanhas.", 403);
    const screenIds = Array.isArray(value.screenIds)
      ? value.screenIds.map(String)
      : [];
    const frequency = Number(value.frequency);
    if (
      !value.name ||
      !value.start ||
      !value.end ||
      !screenIds.length ||
      ![2, 4, 6].includes(frequency)
    )
      throw new ActionError("Revise os dados da campanha.");
    const { data: selectedScreens, error: screenError } = await db
      .from("screens")
      .select("id,device_code,operating_hours_per_day")
      .in("device_code", screenIds);
    if (screenError || selectedScreens?.length !== screenIds.length)
      throw new ActionError("Um ou mais locais não estão disponíveis.");
    const { data: creative, error: creativeError } = await db
      .from("creatives")
      .select("id")
      .eq("public_id", String(value.creativeId))
      .eq("moderation_status", "approved")
      .single();
    if (creativeError || !creative)
      throw new ActionError("Selecione um criativo aprovado.");
    const budget = cost(
      screenIds,
      frequency,
      String(value.start),
      String(value.end),
    );
    const days = Math.max(
      1,
      Math.round(
        (Date.parse(String(value.end)) - Date.parse(String(value.start))) /
          86400000,
      ) + 1,
    );
    const { data: campaign, error: campaignError } = await db
      .from("campaigns")
      .insert({
        advertiser_organization_id: orgId,
        name: String(value.name).slice(0, 120),
        objective: objectiveToDb[String(value.objective)] ?? "other",
        start_date: value.start,
        end_date: value.end,
        budget_amount: budget,
        created_by: uid,
      })
      .select("id")
      .single();
    if (campaignError || !campaign) throw campaignError;
    const { error: placementError } = await db.from("campaign_screens").insert(
      (selectedScreens ?? []).map((screen: any) => ({
        campaign_id: campaign.id,
        screen_id: screen.id,
        plays_per_hour: frequency,
        contracted_plays: Math.round(
          days * Number(screen.operating_hours_per_day) * frequency,
        ),
        unit_price: budget / Math.max(1, selectedScreens?.length ?? 1),
      })),
    );
    if (placementError) {
      await db.from("campaigns").delete().eq("id", campaign.id);
      throw placementError;
    }
    const { error: creativeLinkError } = await db
      .from("campaign_creatives")
      .insert({
        campaign_id: campaign.id,
        creative_id: creative.id,
        is_primary: true,
      });
    if (creativeLinkError) {
      await db.from("campaigns").delete().eq("id", campaign.id);
      throw creativeLinkError;
    }
    const { error: submitError } = await db
      .from("campaigns")
      .update({ status: "in_review", submitted_at: new Date().toISOString() })
      .eq("id", campaign.id);
    if (submitError) throw submitError;
    return "Campanha enviada para análise";
  }
  if (action === "screen.create") {
    if (!isAdmin) throw new ActionError("Ação restrita à equipe VYOO.", 403);
    const name = String(value.name ?? "")
        .trim()
        .slice(0, 120),
      category = String(value.category ?? "Lojas").slice(0, 80);
    if (name.length < 2) throw new ActionError("Informe o estabelecimento.");
    const slug = `parceiro-${crypto.randomUUID().replaceAll("-", "")}`;
    const { data: partner, error: partnerError } = await db
      .from("organizations")
      .insert({ name, slug, kind: "partner", status: "pending" })
      .select("id")
      .single();
    if (partnerError || !partner) throw partnerError;
    const { data: venue, error: venueError } = await db
      .from("venues")
      .insert({
        partner_organization_id: partner.id,
        name,
        category,
        address_line: "Cadastro inicial",
        neighborhood: "Centro",
        city: "Mateus Leme",
        state_code: "MG",
        approval_status: "pending",
      })
      .select("id")
      .single();
    if (venueError || !venue) {
      await db.from("organizations").delete().eq("id", partner.id);
      throw venueError;
    }
    const deviceCode = `VYOO-ML-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const { error: screenError } = await db.from("screens").insert({
      venue_id: venue.id,
      device_code: deviceCode,
      name: `Tela principal · ${name}`,
      status: "awaiting_activation",
    });
    if (screenError) {
      await db.from("venues").delete().eq("id", venue.id);
      await db.from("organizations").delete().eq("id", partner.id);
      throw screenError;
    }
    return "Tela cadastrada e aguardando ativação";
  }
  if (action === "partner.approve") {
    if (!isAdmin) throw new ActionError("Ação restrita à equipe VYOO.", 403);
    const { data: screen } = await db
      .from("screens")
      .select("venue_id,venues!inner(partner_organization_id)")
      .eq("device_code", String(value.id))
      .single();
    if (!screen) throw new ActionError("Tela não encontrada.", 404);
    const venue = screen.venues as unknown as {
      partner_organization_id: number;
    };
    const { error: venueError } = await db
      .from("venues")
      .update({ approval_status: "approved" })
      .eq("id", screen.venue_id);
    if (venueError) throw venueError;
    const { error: orgError } = await db
      .from("organizations")
      .update({ status: "active" })
      .eq("id", venue.partner_organization_id);
    if (orgError) throw orgError;
    return "Parceiro aprovado";
  }
  if (action === "venue.approve" || action === "venue.reject") {
    if (!isAdmin) throw new ActionError("Ação restrita à equipe VYOO.", 403);
    const approve = action === "venue.approve";
    const { data: venue, error: venueLookupError } = await db
      .from("venues")
      .select("id,partner_organization_id")
      .eq("public_id", String(value.id))
      .single();
    if (venueLookupError || !venue)
      throw new ActionError("Estabelecimento não encontrado.", 404);
    const { error: venueError } = await db
      .from("venues")
      .update({ approval_status: approve ? "approved" : "rejected" })
      .eq("id", venue.id);
    if (venueError) throw venueError;
    if (approve) {
      const { error: orgError } = await db
        .from("organizations")
        .update({ status: "active" })
        .eq("id", venue.partner_organization_id);
      if (orgError) throw orgError;
    }
    return approve ? "Estabelecimento aprovado" : "Estabelecimento reprovado";
  }
  if (action === "campaign.approve" || action === "campaign.reject") {
    if (!isAdmin) throw new ActionError("Ação restrita à equipe VYOO.", 403);
    const { data: campaign, error: campaignQueryError } = await db
      .from("campaigns")
      .select("id,start_date,campaign_creatives(creatives(moderation_status))")
      .eq("public_id", String(value.id))
      .eq("status", "in_review")
      .single();
    if (campaignQueryError || !campaign)
      throw new ActionError("Campanha em análise não encontrada.", 404);
    if (action === "campaign.approve") {
      const links = (campaign.campaign_creatives ?? []) as any[];
      const hasApprovedCreative = links.some(
        (link) => link.creatives?.moderation_status === "approved",
      );
      if (!hasApprovedCreative)
        throw new ActionError(
          "Aprove o criativo antes de programar a campanha.",
        );
    }
    const today = new Date().toISOString().slice(0, 10);
    const approved = action === "campaign.approve";
    const nextStatus = approved
      ? campaign.start_date > today
        ? "scheduled"
        : "active"
      : "rejected";
    const { error } = await db
      .from("campaigns")
      .update({
        status: nextStatus,
        approved_at: approved ? new Date().toISOString() : null,
      })
      .eq("id", campaign.id);
    if (error) throw error;
    return approved
      ? "Campanha aprovada e enviada para a programação"
      : "Campanha reprovada";
  }
  if (action === "campaign.pause" || action === "campaign.resume") {
    const { error } = await db
      .from("campaigns")
      .update({ status: action.endsWith("pause") ? "paused" : "scheduled" })
      .eq("public_id", value.id);
    if (error) throw error;
    return "Status da campanha atualizado";
  }
  if (action === "creative.approve" || action === "creative.reject") {
    if (!isAdmin) throw new ActionError("Ação restrita à equipe VYOO.", 403);
    const { error } = await db
      .from("creatives")
      .update({
        moderation_status: action.endsWith("approve") ? "approved" : "rejected",
        rejection_reason: value.reason || null,
      })
      .eq("public_id", value.id);
    if (error) throw error;
    return "Moderação atualizada";
  }
  if (action === "ticket.create") {
    const screen = await db
      .from("screens")
      .select("id")
      .eq("device_code", String(value.screenId))
      .maybeSingle();
    const { error } = await db.from("support_tickets").insert({
      organization_id: orgId,
      opened_by: uid,
      screen_id: screen.data?.id,
      title: String(value.title).slice(0, 120),
      description: String(value.description).slice(0, 4000),
    });
    if (error) throw error;
    return "Chamado aberto";
  }
  if (action === "ticket.resolve") {
    const { error } = await db
      .from("support_tickets")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("public_id", value.id);
    if (error) throw error;
    return "Chamado resolvido";
  }
  if (action === "organization.rename") {
    const canManage =
      isAdmin || ["owner", "admin"].includes(role);
    if (!canManage)
      throw new ActionError("Ação restrita a proprietários e administradores.", 403);
    const name = String(value.name ?? "").trim().slice(0, 120);
    if (name.length < 2) throw new ActionError("Informe um nome válido.");
    const { error } = await db
      .from("organizations")
      .update({ name })
      .eq("id", orgId);
    if (error) throw error;
    return "Dados da organização atualizados";
  }
  if (action === "settings.save") return "Preferências atualizadas";
  throw new ActionError("Ação ainda não disponível.");
}
