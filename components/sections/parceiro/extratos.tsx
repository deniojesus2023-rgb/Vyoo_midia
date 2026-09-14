import { context } from "@/lib/state";
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

const statusLabel: Record<string, string> = {
  open: "Em aberto",
  processing: "Processando",
  paid: "Pago",
  cancelled: "Cancelado",
};

export default async function ParceiroExtratos() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Extratos" sub="Histórico completo de repasses." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os extratos agora.</p>
        </div>
      </>
    );
  const { data, error } = await ctx.db
    .from("partner_statements")
    .select("public_id,gross_media_revenue,partner_share_amount,status,period_start,period_end,paid_at")
    .eq("partner_organization_id", ctx.orgId)
    .order("period_end", { ascending: false });
  return (
    <>
      <PageHeader title="Extratos" sub="Histórico completo de repasses da sua unidade." />
      <div className="panel table-panel">
        {error ? (
          <p style={{ padding: 20 }}>Não foi possível carregar os extratos agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Receita bruta</TableHead>
                  <TableHead>Sua participação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pago em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((s: any) => (
                  <TableRow key={s.public_id}>
                    <TableCell>
                      {s.period_start}–{s.period_end}
                    </TableCell>
                    <TableCell>{money(Number(s.gross_media_revenue))}</TableCell>
                    <TableCell>{money(Number(s.partner_share_amount))}</TableCell>
                    <TableCell>
                      <Status value={statusLabel[s.status] ?? s.status} />
                    </TableCell>
                    <TableCell>{s.paid_at ? String(s.paid_at).slice(0, 10) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data?.length && <Empty text="Nenhum extrato disponível ainda." />}
          </>
        )}
      </div>
    </>
  );
}
