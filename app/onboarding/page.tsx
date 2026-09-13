import { redirect } from "next/navigation";
import { Megaphone, Store } from "lucide-react";
import { AuthAlert, AuthShell, AuthSteps } from "@/components/auth-shell";
import { SubmitButton, TextField } from "@/components/auth-fields";
import { areaForAccount, getAuthContext } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/server";
import { completeOnboarding } from "./actions";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");
  const existing = await getAuthContext();
  if (existing) redirect(areaForAccount(existing.organization.kind));
  const params = await searchParams;
  const metadata = (data.claims.user_metadata ?? {}) as { profile_name?: string; account_kind?: string };
  const partner = metadata.account_kind === "partner";

  return (
    <AuthShell>
      <div className="auth-form-wrap auth-onboarding">
        <AuthSteps active={2} />
        <h1>Complete seu perfil</h1>
        <p className="auth-intro">Precisamos destes dados para preparar sua área na rede VYOO.</p>
        <AuthAlert error={params.error} />
        <form className="auth-form" action={completeOnboarding}>
          <TextField id="profile_name" label="Nome completo" placeholder="Ex.: João da Silva" autoComplete="name" defaultValue={metadata.profile_name} />
          <TextField id="organization_name" label={partner ? "Nome do estabelecimento" : "Empresa ou marca"} placeholder={partner ? "Ex.: Academia Alpha" : "Ex.: Padaria Central"} autoComplete="organization" />
          <fieldset className="account-options compact">
            <legend>Como você usará a VYOO?</legend>
            <label><input type="radio" name="account_kind" value="advertiser" defaultChecked={!partner} /><span className="radio-mark" /><span><strong>Anunciante</strong><small>Quero anunciar nas telas da rede.</small></span><Megaphone /></label>
            <label><input type="radio" name="account_kind" value="partner" defaultChecked={partner} /><span className="radio-mark" /><span><strong>Parceiro</strong><small>Tenho um estabelecimento e quero receber uma tela.</small></span><Store /></label>
          </fieldset>
          <SubmitButton>Concluir configuração</SubmitButton>
        </form>
        <p className="auth-note">Acessos administrativos são liberados somente pela equipe VYOO.</p>
      </div>
    </AuthShell>
  );
}
