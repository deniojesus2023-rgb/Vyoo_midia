import { context, loadState } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import UploadCreativeForm from "@/components/sections/upload-creative-form";

export default async function ParceiroMeuConteudo() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Meu conteúdo" sub="Comunicação do seu estabelecimento." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar seu conteúdo agora.</p>
        </div>
      </>
    );
  const state = await loadState(ctx);
  return (
    <>
      <PageHeader title="Meu conteúdo" sub="Comunicação do seu estabelecimento exibida na sua tela." />
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Enviar novo conteúdo</h3>
          </div>
        </div>
        <div style={{ padding: "0 16px 16px" }}>
          <UploadCreativeForm />
        </div>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Seus conteúdos</h3>
            <span>{state.contents.length}</span>
          </div>
        </div>
        <div className="place-list">
          {state.contents.map((c) => (
            <div className="inventory-row" key={c.id}>
              <span>
                <b>{c.name}</b>
                <small>{c.type === "video" ? "Vídeo" : "Imagem"} · conteúdo próprio</small>
              </span>
              <Status value={c.status} />
            </div>
          ))}
        </div>
        {!state.contents.length && (
          <Empty text="Envie a comunicação do seu estabelecimento." />
        )}
      </div>
    </>
  );
}
