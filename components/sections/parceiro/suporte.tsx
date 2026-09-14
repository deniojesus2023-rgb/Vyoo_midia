import { context, loadState } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";
import { createTicketAction } from "@/lib/actions";

export default async function ParceiroSuporte({ path }: { path: string }) {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Suporte" sub="Chamados sobre a sua tela." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar o suporte agora.</p>
        </div>
      </>
    );
  const [state, { data: venues }] = await Promise.all([
    loadState(ctx),
    ctx.db
      .from("venues")
      .select("screens(device_code)")
      .eq("partner_organization_id", ctx.orgId),
  ]);
  const ownScreenIds = (venues ?? []).flatMap((v: any) =>
    (v.screens ?? []).map((s: any) => s.device_code),
  );
  const tickets = state.tickets.filter((t) => ownScreenIds.includes(t.screenId));
  return (
    <>
      <PageHeader title="Suporte" sub="Abra e acompanhe chamados sobre a sua tela." />
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Abrir chamado</h3>
          </div>
        </div>
        <form action={createTicketAction} className="section-form" style={{ padding: "0 16px 16px" }}>
          <input type="hidden" name="path" value={path} />
          <label className="field">
            <span>Tela</span>
            <select className="vy-select" name="screenId" defaultValue={ownScreenIds[0] ?? ""}>
              {ownScreenIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Assunto</span>
            <input className="vy-input" name="title" required maxLength={120} />
          </label>
          <label className="field">
            <span>Descrição</span>
            <textarea name="description" required minLength={2} maxLength={4000} />
          </label>
          <button className="vy-button" type="submit" style={{ alignSelf: "flex-start" }}>
            Abrir chamado
          </button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Seus chamados</h3>
          </div>
        </div>
        <div className="place-list">
          {tickets.map((t) => (
            <div className="inventory-row" key={t.id}>
              <span>
                <b>{t.title}</b>
                <small>{t.description}</small>
              </span>
              <Status value={t.status} />
            </div>
          ))}
        </div>
        {!tickets.length && <Empty text="Nenhum chamado aberto." />}
      </div>
    </>
  );
}
