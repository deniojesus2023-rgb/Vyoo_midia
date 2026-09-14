import { createClient } from "@/lib/supabase/server";
import { num } from "@/lib/model";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/vyoo-ui";

export default async function AdsLocais() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("venues")
    .select("id,name,category,neighborhood,daily_flow_estimate,screens(device_code,status,operating_hours_per_day)")
    .eq("approval_status", "approved")
    .order("name");

  return (
    <>
      <PageHeader
        title="Locais"
        sub="Estabelecimentos disponíveis na rede para veiculação de mídia."
      />
      <div className="panel table-panel">
        {error ? (
          <p style={{ padding: 20 }}>Não foi possível carregar os locais agora.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Bairro</TableHead>
                  <TableHead>Fluxo estimado</TableHead>
                  <TableHead>Telas</TableHead>
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
                    <TableCell>{num(Number(v.daily_flow_estimate))} pessoas/dia</TableCell>
                    <TableCell>{(v.screens ?? []).length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!data?.length && <Empty text="Nenhum local disponível no momento." />}
          </>
        )}
      </div>
    </>
  );
}
