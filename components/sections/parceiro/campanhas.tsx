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

export default async function ParceiroCampanhas() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Campanhas" sub="Anunciantes exibidos na sua unidade." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar as campanhas agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const campaigns = state.campaigns.filter((c) =>
    ["Ativa", "Agendada"].includes(c.status),
  );
  return (
    <>
      <PageHeader title="Campanhas" sub="Anunciantes em veiculação na sua unidade." />
      <div className="panel table-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Exibições entregues</TableHead>
              <TableHead>Sua participação</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <b>{c.name}</b>
                </TableCell>
                <TableCell>{c.advertiser}</TableCell>
                <TableCell>
                  {c.start}–{c.end}
                </TableCell>
                <TableCell>
                  {num(Math.round(c.plays / Math.max(1, c.screenIds.length)))}
                </TableCell>
                <TableCell>
                  {money(
                    Math.round((c.budget / Math.max(1, c.screenIds.length)) * 0.3),
                  )}
                </TableCell>
                <TableCell>
                  <Status value={c.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!campaigns.length && (
          <Empty text="As campanhas aparecerão quando sua tela entrar na programação." />
        )}
      </div>
    </>
  );
}
