import { context, loadState } from "@/lib/state";
import { available } from "@/lib/model";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";

export default async function AdminInventario() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Inventário" sub="Capacidade da rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar o inventário agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  return (
    <>
      <PageHeader
        title="Inventário"
        sub="Capacidade livre por tela nos próximos 30 dias (máx. 12 exibições/hora)."
      />
      <div className="panel">
        <div className="place-list">
          {state.screens.map((s) => {
            const free = available(state, s.id, today, in30);
            return (
              <div className="inventory-row" key={s.id}>
                <span>
                  <b>{s.name}</b>
                  <small>
                    {s.id} · {s.category}
                  </small>
                </span>
                <div className="occupancy">
                  <span>{s.occupancy}% ocupado agora</span>
                  <i>
                    <b style={{ width: `${s.occupancy}%` }} />
                  </i>
                </div>
                <span>
                  <b>{free}/h</b> <small>livres</small>
                </span>
              </div>
            );
          })}
        </div>
        {!state.screens.length && <Empty text="Nenhuma tela cadastrada." />}
      </div>
    </>
  );
}
