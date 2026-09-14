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
import { approveVenueAction, rejectVenueAction } from "@/lib/actions";

const approvalLabel: Record<string, string> = {
  pending: "Em análise",
  approved: "Aprovado",
  rejected: "Reprovado",
  suspended: "Suspenso",
};

export default async function AdminEstabelecimentos({ path }: { path: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select(
      "id,public_id,name,category,neighborhood,approval_status,organizations(name,status),screens(device_code,status)",
    )
    .order("id", { ascending: false });

  return (
    <>
      <PageHeader
        title="Estabelecimentos"
        sub="Locais parceiros cadastrados na rede VYOO."
      />
      <div className="panel table-panel">
        {error ? (
          <p style={{ padding: 20 }}>
            Não foi possível carregar os estabelecimentos agora.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Parceiro</TableHead>
                  <TableHead>Telas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data ?? []).map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <b>{v.name}</b>
                    </TableCell>
                    <TableCell>{v.category}</TableCell>
                    <TableCell>{v.neighborhood}</TableCell>
                    <TableCell>{v.organizations?.name ?? "—"}</TableCell>
                    <TableCell>{(v.screens ?? []).length}</TableCell>
                    <TableCell>
                      <Status
                        value={approvalLabel[v.approval_status] ?? v.approval_status}
                      />
                    </TableCell>
                    <TableCell>
                      {v.approval_status === "pending" && (
                        <div className="inline-actions">
                          <form action={approveVenueAction}>
                            <input type="hidden" name="id" value={v.public_id} />
                            <input type="hidden" name="path" value={path} />
                            <button className="vy-button" type="submit">
                              Aprovar
                            </button>
                          </form>
                          <form action={rejectVenueAction}>
                            <input type="hidden" name="id" value={v.public_id} />
                            <input type="hidden" name="path" value={path} />
                            <button className="vy-button outline" type="submit">
                              Reprovar
                            </button>
                          </form>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data?.length && <Empty text="Nenhum estabelecimento cadastrado." />}
          </>
        )}
      </div>
    </>
  );
}
