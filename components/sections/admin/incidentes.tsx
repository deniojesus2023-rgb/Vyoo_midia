import { context, loadState } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import { resolveTicketAction } from "@/lib/actions";

export default async function AdminIncidentes({ path }: { path: string }) {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Incidentes" sub="Chamados abertos pela rede." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os incidentes agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  const open = state.tickets.filter((t) => t.status === "Aberto");
  const resolved = state.tickets.filter((t) => t.status !== "Aberto");
  return (
    <>
      <PageHeader
        title="Incidentes"
        sub={`${open.length} chamados abertos · ${resolved.length} resolvidos.`}
      />
      <div className="panel">
        <div className="place-list">
          {open.map((t) => (
            <div className="inventory-row" key={t.id}>
              <span>
                <b>{t.title}</b>
                <small>
                  {state.screens.find((s) => s.id === t.screenId)?.name ?? t.screenId}
                </small>
              </span>
              <Status value={t.status} />
              <form action={resolveTicketAction}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="path" value={path} />
                <button className="vy-button" type="submit">
                  Marcar resolvido
                </button>
              </form>
            </div>
          ))}
        </div>
        {!open.length && <Empty text="Nenhum incidente aberto no momento." />}
      </div>
      {resolved.length > 0 && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Resolvidos recentemente</h3>
            </div>
          </div>
          <div className="place-list">
            {resolved.slice(0, 10).map((t) => (
              <div className="inventory-row" key={t.id}>
                <span>
                  <b>{t.title}</b>
                  <small>
                    {state.screens.find((s) => s.id === t.screenId)?.name ?? t.screenId}
                  </small>
                </span>
                <Status value={t.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
