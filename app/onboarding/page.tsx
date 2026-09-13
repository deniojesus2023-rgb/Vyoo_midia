import { redirect } from "next/navigation";
import { areaForAccount, getAuthContext } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "./actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");
  const existing = await getAuthContext();
  if (existing) redirect(areaForAccount(existing.organization.kind));
  const params = await searchParams;

  return (
    <main className="auth-shell onboarding-shell">
      <section className="auth-story">
        <img src="/vyoo-logo-reverse.svg" alt="VYOO" className="auth-logo" />
        <div>
          <span className="auth-kicker">CONFIGURAÇÃO INICIAL</span>
          <h1>Um acesso.<br />A operação<br /><em>certa para você.</em></h1>
          <p>As permissões e informações exibidas serão organizadas conforme o seu perfil.</p>
        </div>
        <small>Infraestrutura local, gestão profissional.</small>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap onboarding-form-wrap">
          <span className="auth-eyebrow">ÚLTIMA ETAPA</span>
          <h2>Configure seu acesso</h2>
          <p className="auth-intro">Informe quem você representa dentro da rede VYOO.</p>
          {params.error && <p className="auth-alert auth-alert-error">{params.error}</p>}

          <form className="auth-form" action={completeOnboarding}>
            <label htmlFor="profile_name">Seu nome</label>
            <input id="profile_name" name="profile_name" minLength={2} maxLength={120} required />
            <label htmlFor="organization_name">Empresa ou estabelecimento</label>
            <input id="organization_name" name="organization_name" minLength={2} maxLength={120} required />
            <fieldset className="account-options">
              <legend>Como você usará a VYOO?</legend>
              <label><input type="radio" name="account_kind" value="advertiser" defaultChecked /><span><strong>Anunciante</strong><small>Quero anunciar nas telas da rede.</small></span></label>
              <label><input type="radio" name="account_kind" value="partner" /><span><strong>Parceiro</strong><small>Tenho um estabelecimento e quero receber uma tela.</small></span></label>
            </fieldset>
            <button className="auth-primary" type="submit">Concluir configuração</button>
          </form>
          <p className="auth-note">Acessos administrativos são liberados somente pela equipe VYOO.</p>
        </div>
      </section>
    </main>
  );
}
