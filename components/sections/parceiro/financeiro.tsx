import { context } from "@/lib/state";
import { money } from "@/lib/model";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";

const statusLabel: Record<string, string> = {
  open: "Em aberto",
  processing: "Processando",
  paid: "Pago",
  cancelled: "Cancelado",
};

export default async function ParceiroFinanceiro() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Financeiro" sub="Seu repasse da rede VYOO." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar seu financeiro agora.</p>
        </div>
      </>
    );
  const { data: statements, error } = await ctx.db
    .from("partner_statements")
    .select("public_id,gross_media_revenue,partner_share_amount,status,period_start,period_end")
    .eq("partner_organization_id", ctx.orgId)
    .order("period_end", { ascending: false })
    .limit(6);
  const current = statements?.[0];
  const available = (statements ?? [])
    .filter((s) => ["open", "processing"].includes(s.status))
    .reduce((n, s) => n + Number(s.partner_share_amount), 0);
  return (
    <>
      <PageHeader title="Financeiro" sub="Resumo do seu repasse da rede VYOO." />
      {error ? (
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar seu financeiro agora.</p>
        </div>
      ) : (
        <>
          <div className="stat-row">
            <div className="stat panel">
              <div>
                <small>Disponível a receber</small>
                <strong>{money(available)}</strong>
              </div>
            </div>
            <div className="stat panel">
              <div>
                <small>Receita bruta (competência atual)</small>
                <strong>{current ? money(Number(current.gross_media_revenue)) : "—"}</strong>
              </div>
            </div>
            <div className="stat panel">
              <div>
                <small>Sua participação (competência atual)</small>
                <strong>{current ? money(Number(current.partner_share_amount)) : "—"}</strong>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Últimas competências</h3>
              </div>
            </div>
            <div className="place-list">
              {(statements ?? []).map((s) => (
                <div className="inventory-row" key={s.public_id}>
                  <span>
                    <b>
                      {s.period_start}–{s.period_end}
                    </b>
                    <small>Bruto {money(Number(s.gross_media_revenue))}</small>
                  </span>
                  <b>{money(Number(s.partner_share_amount))}</b>
                  <Status value={statusLabel[s.status] ?? s.status} />
                </div>
              ))}
            </div>
            {!statements?.length && (
              <Empty text="Nenhuma competência registrada ainda." />
            )}
          </div>
        </>
      )}
    </>
  );
}
