import { context } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";

const approvalLabel: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Reprovado",
  suspended: "Suspenso",
};

export default async function ParceiroEstabelecimento() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Estabelecimento" sub="Dados do seu ponto de mídia." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os dados agora.</p>
        </div>
      </>
    );
  const { data: venue, error } = await ctx.db
    .from("venues")
    .select(
      "name,category,address_line,neighborhood,city,state_code,weekday_open,weekday_close,daily_flow_estimate,approval_status",
    )
    .eq("partner_organization_id", ctx.orgId)
    .maybeSingle();
  return (
    <>
      <PageHeader title="Estabelecimento" sub="Dados do seu ponto de mídia." />
      <div className="panel">
        {error || !venue ? (
          <Empty text="Nenhum estabelecimento cadastrado ainda." />
        ) : (
          <div className="detail-list">
            <p>
              <span>Nome</span>
              <b>{venue.name}</b>
            </p>
            <p>
              <span>Categoria</span>
              <b>{venue.category}</b>
            </p>
            <p>
              <span>Endereço</span>
              <b>
                {venue.address_line} · {venue.neighborhood} · {venue.city}/{venue.state_code}
              </b>
            </p>
            <p>
              <span>Horário de funcionamento</span>
              <b>
                {venue.weekday_open ?? "—"} às {venue.weekday_close ?? "—"}
              </b>
            </p>
            <p>
              <span>Fluxo estimado</span>
              <b>{venue.daily_flow_estimate} pessoas/dia</b>
            </p>
            <p>
              <span>Status de aprovação</span>
              <Status value={approvalLabel[venue.approval_status] ?? venue.approval_status} />
            </p>
          </div>
        )}
      </div>
    </>
  );
}
