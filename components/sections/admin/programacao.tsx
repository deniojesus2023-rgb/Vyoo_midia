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

export default async function AdminProgramacao() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Programação" sub="Grade de exibição da rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar a programação agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const scheduled = state.campaigns.filter((c) =>
    ["Ativa", "Agendada"].includes(c.status),
  );
  const rows = scheduled.flatMap((c) =>
    c.screenIds.map((screenId) => ({
      screenId,
      screenName: state.screens.find((s) => s.id === screenId)?.name ?? screenId,
      campaign: c,
    })),
  );
  return (
    <>
      <PageHeader
        title="Programação"
        sub="Campanhas ativas e agendadas por tela, com a frequência contratada."
      />
      <div className="panel table-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tela</TableHead>
              <TableHead>Campanha</TableHead>
              <TableHead>Anunciante</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={`${r.campaign.id}-${r.screenId}-${i}`}>
                <TableCell>
                  <b>{r.screenName}</b>
                  <small>{r.screenId}</small>
                </TableCell>
                <TableCell>{r.campaign.name}</TableCell>
                <TableCell>{r.campaign.advertiser}</TableCell>
                <TableCell>{r.campaign.frequency}/h</TableCell>
                <TableCell>
                  {r.campaign.start}–{r.campaign.end}
                </TableCell>
                <TableCell>
                  <Status value={r.campaign.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!rows.length && (
          <Empty text="Nenhuma campanha ativa ou agendada no momento." />
        )}
      </div>
    </>
  );
}
