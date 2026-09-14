import { context, loadState } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import { approveCreativeAction, rejectCreativeAction } from "@/lib/actions";

export default async function AdminCriativos({ path }: { path: string }) {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Criativos" sub="Fila de moderação." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os criativos agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  return (
    <>
      <PageHeader
        title="Criativos"
        sub={`${state.creatives.length} criativos enviados por anunciantes.`}
      />
      <div className="panel">
        <div className="place-list">
          {state.creatives.map((c) => (
            <div className="inventory-row" key={c.id}>
              <span>
                <b>{c.name}</b>
                <small>{c.type === "video" ? "Vídeo" : "Imagem"}</small>
              </span>
              <Status value={c.status} />
              {c.status === "Em análise" && (
                <div className="inline-actions">
                  <form action={approveCreativeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="path" value={path} />
                    <button className="vy-button" type="submit">
                      Aprovar
                    </button>
                  </form>
                  <form action={rejectCreativeAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="reason" value="Ajustes necessários" />
                    <input type="hidden" name="path" value={path} />
                    <button className="vy-button outline" type="submit">
                      Reprovar
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
        {!state.creatives.length && <Empty text="Nenhum criativo enviado ainda." />}
      </div>
    </>
  );
}
