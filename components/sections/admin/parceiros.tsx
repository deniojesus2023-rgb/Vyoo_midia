import { createClient } from "@/lib/supabase/server";
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
  pending: "Em análise",
  active: "Ativo",
  suspended: "Suspenso",
  rejected: "Reprovado",
};

export default async function AdminParceiros() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id,name,status,venues(name,category,approval_status)")
    .eq("kind", "partner")
    .order("id", { ascending: false });

  return (
    <>
      <PageHeader
        title="Parceiros"
        sub="Estabelecimentos e organizações parceiras da rede."
      />
      <div className="panel table-panel">
        {error ? (
          <p style={{ padding: 20 }}>Não foi possível carregar os parceiros agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Estabelecimentos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((org: any) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <b>{org.name}</b>
                    </TableCell>
                    <TableCell>
                      <Status value={statusLabel[org.status] ?? org.status} />
                    </TableCell>
                    <TableCell>
                      {(org.venues ?? []).map((v: any) => v.name).join(", ") || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data?.length && <Empty text="Nenhum parceiro cadastrado ainda." />}
          </>
        )}
      </div>
    </>
  );
}
