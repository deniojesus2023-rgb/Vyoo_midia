import { context, loadState } from "@/lib/state";
import { num } from "@/lib/model";
import { PageHeader } from "@/components/page-header";

export default async function AdminRelatorios() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Relatórios" sub="Métricas agregadas da rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os relatórios agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const totalPlays = state.campaigns.reduce((n, c) => n + c.plays, 0);
  const totalReach = state.campaigns.reduce((n, c) => n + (c.reach ?? 0), 0);
  const avgOccupancy = state.screens.length
    ? Math.round(
        state.screens.reduce((n, s) => n + s.occupancy, 0) / state.screens.length,
      )
    : 0;
  const online = state.screens.filter((s) => s.status === "Online").length;
  const activeCampaigns = state.campaigns.filter((c) => c.status === "Ativa").length;
  return (
    <>
      <PageHeader title="Relatórios" sub="Métricas agregadas da rede VYOO." />
      <div className="stat-row">
        <div className="stat panel">
          <div>
            <small>Exibições totais</small>
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
            <small>Ocupação média da rede</small>
            <strong>{avgOccupancy}%</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Telas online</small>
            <strong>
              {online}/{state.screens.length}
            </strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Campanhas ativas</small>
            <strong>{activeCampaigns}</strong>
          </div>
        </div>
        <div className="stat panel">
          <div>
            <small>Incidentes abertos</small>
            <strong>
              {state.tickets.filter((t) => t.status === "Aberto").length}
            </strong>
          </div>
        </div>
      </div>
    </>
  );
}
