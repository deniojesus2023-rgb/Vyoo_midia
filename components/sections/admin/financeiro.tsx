import { createClient } from "@/lib/supabase/server";
import { context, loadState } from "@/lib/state";
import { money } from "@/lib/model";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vyoo-ui";

const statementLabel: Record<string, string> = {
  open: "Em aberto",
  processing: "Processando",
  paid: "Pago",
  cancelled: "Cancelado",
};

export default async function AdminFinanceiro() {
  const supabase = await createClient();
  const ctx = await context();
  const [{ data: payments, error: paymentsError }, { data: statements, error: statementsError }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("public_id,amount,status,provider,created_at,organizations:advertiser_organization_id(name)")
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("partner_statements")
        .select(
          "public_id,gross_media_revenue,partner_share_amount,status,period_start,period_end,organizations:partner_organization_id(name)",
        )
        .order("period_end", { ascending: false })
        .limit(25),
    ]);
  const state = ctx ? await loadState(ctx) : null;
  const revenuePaid = state
    ? state.campaigns.filter((c) => c.paid).reduce((n, c) => n + c.budget, 0)
    : 0;
  return (
    <>
      <PageHeader
        title="Financeiro"
        sub="Receita das campanhas, repasses a parceiros e pagamentos."
      />
      <div className="stat-row">
        <div className="stat panel">
          <div>
            <small>Receita contratada</small>
            <strong>{money(revenuePaid)}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Repasse bruto a parceiros</small>
            <strong>{state ? money(state.financial?.share ?? 0) : "—"}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Já pago a parceiros</small>
            <strong>{state ? money(state.financial?.paid ?? 0) : "—"}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Disponível a repassar</small>
            <strong>{state ? money(state.financial?.available ?? 0) : "—"}</strong>
          </div>
        </div>
      </div>
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Pagamentos de anunciantes</h3>
          </div>
        </div>
        {paymentsError ? (
          <p style={{ padding: 20 }}>Não foi possível carregar os pagamentos agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anunciante</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(payments ?? []).map((p: any) => (
                  <TableRow key={p.public_id}>
                    <TableCell>{p.organizations?.name}</TableCell>
                    <TableCell>{money(Number(p.amount))}</TableCell>
                    <TableCell>
                      <Status value={statementLabel[p.status] ?? p.status} />
                    </TableCell>
                    <TableCell>{String(p.created_at).slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!payments?.length && <Empty text="Nenhum pagamento registrado." />}
          </>
        )}
      </div>
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Repasses a parceiros</h3>
          </div>
        </div>
        {statementsError ? (
          <p style={{ padding: 20 }}>Não foi possível carregar os repasses agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Receita bruta</TableHead>
                  <TableHead>Participação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(statements ?? []).map((s: any) => (
                  <TableRow key={s.public_id}>
                    <TableCell>{s.organizations?.name}</TableCell>
                    <TableCell>
                      {s.period_start}–{s.period_end}
                    </TableCell>
                    <TableCell>{money(Number(s.gross_media_revenue))}</TableCell>
                    <TableCell>{money(Number(s.partner_share_amount))}</TableCell>
                    <TableCell>
                      <Status value={statementLabel[s.status] ?? s.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!statements?.length && <Empty text="Nenhum repasse registrado." />}
          </>
        )}
      </div>
    </>
  );
}
