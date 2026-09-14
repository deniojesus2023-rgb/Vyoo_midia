import { context, loadState } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import UploadCreativeForm from "@/components/sections/upload-creative-form";

export default async function AdsCriativos() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Criativos" sub="Biblioteca de anúncios da sua conta." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os criativos agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  return (
    <>
      <PageHeader title="Criativos" sub="Biblioteca de anúncios da sua conta." />
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Enviar novo criativo</h3>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          <UploadCreativeForm />
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Sua biblioteca</h3>
            <span>{state.creatives.length} criativos</span>
          </div>
        </div>
        <div className="place-list">
          {state.creatives.map((c) => (
            <div className="inventory-row" key={c.id}>
              <span>
                <b>{c.name}</b>
                <small>{c.type === "video" ? "Vídeo" : "Imagem"}</small>
              </span>
              <Status value={c.status} />
              {c.reason && <small>{c.reason}</small>}
            </div>
          ))}
        </div>
        {!state.creatives.length && (
          <Empty text="Envie o primeiro criativo da sua marca." />
        )}
      </div>
    </>
  );
}
