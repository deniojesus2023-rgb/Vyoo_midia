import { createClient } from "@/lib/supabase/server";
import { getAuthContext, roleLabel } from "@/lib/auth-context";
import { PageHeader } from "@/components/page-header";
import { Empty } from "@/components/empty-state";
import { renameOrganizationAction } from "@/lib/actions";

export default async function SettingsPage({
  path,
  sub,
}: {
  path: string;
  sub: string;
}) {
  const auth = await getAuthContext();
  if (!auth)
    return (
      <>
        <PageHeader title="Configurações" sub={sub} />
        <div className="panel">
          <p style={{ padding: 20 }}>Não foi possível carregar os dados da organização.</p>
        </div>
      </>
    );
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id,role,profiles(full_name)")
    .order("role");
  const canManage = ["owner", "admin"].includes(auth.role);
  return (
    <>
      <PageHeader title="Configurações" sub={sub} />
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Dados da organização</h3>
            <span>{auth.organization.name}</span>
          </div>
        </div>
        <form action={renameOrganizationAction} className="section-form" style={{ padding: "0 16px 16px" }}>
          <input type="hidden" name="path" value={path} />
          <label className="field">
            <span>Nome da organização</span>
            <input
              className="vy-input"
              name="name"
              defaultValue={auth.organization.name}
              maxLength={120}
              disabled={!canManage}
            />
          </label>
          {canManage && (
            <button className="vy-button" type="submit" style={{ alignSelf: "flex-start" }}>
              Salvar
            </button>
          )}
        </form>
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Membros da equipe</h3>
          </div>
        </div>
        <div className="place-list">
          {(members ?? []).map((m: any) => (
            <div className="inventory-row" key={m.user_id}>
              <span>
                <b>{m.profiles?.full_name ?? "Sem nome"}</b>
              </span>
              <span className="tag-pill">{roleLabel(m.role)}</span>
            </div>
          ))}
        </div>
        {!members?.length && <Empty text="Nenhum membro cadastrado." />}
      </div>
    </>
  );
}
