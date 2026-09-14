import { context } from "@/lib/state";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { Status } from "@/components/status-badge";

const statusLabel: Record<string, string> = {
  online: "Online",
  offline: "Offline",
  unstable: "Instável",
  maintenance: "Manutenção",
  awaiting_activation: "Aguardando ativação",
  disabled: "Desativada",
};

function formatSync(value: string | null) {
  if (!value) return "Nunca";
  const d = new Date(value);
  return Number.isNaN(d.valueOf())
    ? value
    : d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default async function ParceiroMinhaTela() {
  const ctx = await context();
  if (!ctx)
    return (
      <>
        <PageHeader title="Minha tela" sub="Status e programação da sua tela." />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar sua tela agora.</p>
        </div>
      </>
    );
  const { data: venues, error } = await ctx.db
    .from("venues")
    .select(
      "id,name,screens(device_code,status,last_sync_at,operating_hours_per_day,ad_slots_per_hour)",
    )
    .eq("partner_organization_id", ctx.orgId);
  const screens = (venues ?? []).flatMap((v: any) =>
    (v.screens ?? []).map((s: any) => ({ ...s, venueName: v.name })),
  );
  return (
    <>
      <PageHeader title="Minha tela" sub="Status e programação da sua tela." />
      {error ? (
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar sua tela agora.</p>
        </div>
      ) : screens.length ? (
        screens.map((s: any) => (
          <div className="panel screen-stage" key={s.device_code}>
            <div className="screen-copy">
              <span>{s.venueName}</span>
              <h2>{s.device_code}</h2>
              <Status value={statusLabel[s.status] ?? s.status} />
              <dl>
                <div>
                  <dt>Última sincronização</dt>
                  <dd>{formatSync(s.last_sync_at)}</dd>
                </div>
                <div>
                  <dt>Horas de operação/dia</dt>
                  <dd>{s.operating_hours_per_day}h</dd>
                </div>
                <div>
                  <dt>Slots de anúncio/hora</dt>
                  <dd>{s.ad_slots_per_hour}</dd>
                </div>
                <div>
                  <dt>Programação de hoje</dt>
                  <dd>06:00 – 23:00</dd>
                </div>
              </dl>
            </div>
          </div>
        ))
      ) : (
        <div className="panel">
          <Empty text="Aguardando instalação da sua tela." />
        </div>
      )}
    </>
  );
}
