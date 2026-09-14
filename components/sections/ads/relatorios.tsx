import { context, loadState } from "@/lib/state";
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

export default async function AdsRelatorios() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Relatórios" sub="Desempenho das suas campanhas." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os relatórios agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const totalPlays = state.campaigns.reduce((n, c) => n + c.plays, 0);
  const totalReach = state.campaigns.reduce((n, c) => n + (c.reach ?? 0), 0);
  return (
    <>
      <PageHeader title="Relatórios" sub="Desempenho das suas campanhas na rede VYOO." />
      <div className="stat-row">
        <div className="stat panel">
          <div>
            <small>Exibições realizadas</small>
            <strong>{num(totalPlays)}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Alcance estimado</small>
            <strong>{num(totalReach)}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Campanhas ativas</small>
            <strong>{state.campaigns.filter((c) => c.status === "Ativa").length}</strong>
          </div>
        </div>
      </div>
      <div className="panel table-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Exibições</TableHead>
              <TableHead>Contratado</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Alcance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.campaigns.map((c) => {
              const contracted = c.contractedPlays || Math.max(c.plays, 1);
              const progress = Math.min(100, Math.round((c.plays / contracted) * 100));
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <b>{c.name}</b>
                  </TableCell>
                  <TableCell>{num(c.plays)}</TableCell>
                  <TableCell>{num(contracted)}</TableCell>
                  <TableCell>
                    <div className="occupancy">
                      <span>{progress}%</span>
                      <i>
                        <b style={{ width: `${progress}%` }} />
                      </i>
                    </div>
                  </TableCell>
                  <TableCell>{num(c.reach ?? 0)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {!state.campaigns.length && (
          <Empty text="Os relatórios aparecerão quando você tiver campanhas em veiculação." />
        )}
      </div>
    </>
  );
}
