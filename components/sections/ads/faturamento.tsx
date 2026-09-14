import { createClient } from "@/lib/supabase/server";
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
  pending: "Pendente",
  paid: "Pago",
  failed: "Falhou",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
};

export default async function AdsFaturamento() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("public_id,amount,status,provider,created_at,campaigns(name)")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Faturamento" sub="Pagamentos das suas campanhas na rede VYOO." />
      <div className="panel table-panel">
        {error ? (
          <p style={{ padding: 20 }}>Não foi possível carregar o faturamento agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((p: any) => (
                  <TableRow key={p.public_id}>
                    <TableCell>{p.campaigns?.name ?? "—"}</TableCell>
                    <TableCell>{money(Number(p.amount))}</TableCell>
                    <TableCell>{p.provider}</TableCell>
                    <TableCell>
                      <Status value={statusLabel[p.status] ?? p.status} />
                    </TableCell>
                    <TableCell>{String(p.created_at).slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data?.length && <Empty text="Nenhum pagamento registrado ainda." />}
          </>
        )}
      </div>
    </>
  );
}
