import { context, loadState } from "@/lib/state";
import { money, num } from "@/lib/model";
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
import { approveCampaignAction, rejectCampaignAction } from "@/lib/actions";

export default async function AdminCampanhas({
  path,
  searchParams,
}: {
  path: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const ctx = await context();
  const statusFilter =
    (Array.isArray(searchParams?.status) ? searchParams?.status[0] : searchParams?.status) ??
    "Todas";
  if (!ctx)
    return (
      <>
        <PageHeader title="Campanhas" sub="Todas as campanhas da rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar as campanhas agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const statuses = [
    "Todas",
    ...Array.from(new Set(state.campaigns.map((c) => c.status))),
  ];
  const filtered =
    statusFilter === "Todas"
      ? state.campaigns
      : state.campaigns.filter((c) => c.status === statusFilter);
  return (
    <>
      <PageHeader
        title="Campanhas"
        sub={`${state.campaigns.length} campanhas de todos os anunciantes da rede.`}
      />
      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Todas as campanhas</h3>
            <span>{filtered.length} resultados</span>
          </div>
          <form method="get" className="inline-actions">
            <select className="vy-select" name="status" defaultValue={statusFilter}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </form>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Locais</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Exibições</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Período</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <b>{c.name}</b>
                  <small>{c.objective}</small>
                </TableCell>
                <TableCell>{c.advertiser}</TableCell>
                <TableCell>
                  <Status value={c.status} />
                </TableCell>
                <TableCell>{c.screenIds.length}</TableCell>
                <TableCell>{c.frequency}/h</TableCell>
                <TableCell>{num(c.plays)}</TableCell>
                <TableCell>{money(c.budget)}</TableCell>
                <TableCell>
                  {c.start}–{c.end}
                </TableCell>
                <TableCell>
                  {c.status === "Em análise" && (
                    <div className="inline-actions">
                      <form action={approveCampaignAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="path" value={path} />
                        <button className="vy-button" type="submit">
                          Aprovar
                        </button>
                      </form>
                      <form action={rejectCampaignAction}>
                        <input type="hidden" name="id" value={c.id} />
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
        {!filtered.length && <Empty text="Nenhuma campanha encontrada." />}
      </div>
    </>
  );
}
