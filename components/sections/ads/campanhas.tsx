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
import CreateCampaignButton from "@/components/sections/ads/create-campaign-button";
import { pauseCampaignAction, resumeCampaignAction } from "@/lib/actions";

export default async function AdsCampanhas({ path }: { path: string }) {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Campanhas" sub="Suas campanhas na rede VYOO." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar suas campanhas agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  return (
    <>
      <PageHeader title="Campanhas" sub={`${state.campaigns.length} campanhas da sua conta.`}>
        <CreateCampaignButton />
      </PageHeader>
      <div className="panel table-panel">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
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
            {state.campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <b>{c.name}</b>
                  <small>{c.objective}</small>
                </TableCell>
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
                  {["Ativa", "Agendada"].includes(c.status) && (
                    <form action={pauseCampaignAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="path" value={path} />
                      <button className="vy-button outline" type="submit">
                        Pausar
                      </button>
                    </form>
                  )}
                  {c.status === "Pausada" && (
                    <form action={resumeCampaignAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="path" value={path} />
                      <button className="vy-button" type="submit">
                        Reativar
                      </button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!state.campaigns.length && (
          <Empty text="Crie sua primeira campanha para começar sua presença na cidade." />
        )}
      </div>
    </>
  );
}
