import { context, loadState } from "@/lib/state";
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

export default async function AdminTelas({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const ctx = await context();
  const q = (Array.isArray(searchParams?.q) ? searchParams?.q[0] : searchParams?.q) ?? "";
  if (!ctx)
    return (
      <>
        <PageHeader title="Telas" sub="Monitoramento da rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar as telas agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const filtered = state.screens.filter((s) =>
    (s.name + s.id + s.category).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Telas"
        sub={`${state.screens.length} telas conectadas à rede VYOO.`}
      />
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Monitoramento</h3>
            <span>{filtered.length} resultados</span>
          </div>
          <form className="search" method="get">
            <input
              className="vy-input"
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar tela, local ou categoria"
            />
          </form>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Estabelecimento</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última sincronização</TableHead>
              <TableHead>Ocupação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="mono">{s.id}</TableCell>
                <TableCell>
                  <b>{s.name}</b>
                  <small>{s.neighborhood ?? "Mateus Leme · MG"}</small>
                </TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>
                  <Status value={s.status} />
                </TableCell>
                <TableCell>{s.sync}</TableCell>
                <TableCell>
                  <div className="occupancy">
                    <span>{s.occupancy}%</span>
                    <i>
                      <b style={{ width: `${s.occupancy}%` }} />
                    </i>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!filtered.length && <Empty text="Nenhuma tela encontrada." />}
      </div>
    </>
  );
}
