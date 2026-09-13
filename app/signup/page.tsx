import Link from "next/link";
import { Megaphone, Store } from "lucide-react";
import { AuthAlert, AuthShell, AuthSteps } from "@/components/auth-shell";
import { SignupPasswords, SubmitButton, TextField } from "@/components/auth-fields";
import { signup } from "@/app/login/actions";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string; created?: string }> }) {
  const params = await searchParams;
  if (params.created) return <AuthShell><div className="auth-form-wrap auth-confirmation"><AuthSteps active={3} /><span className="confirmation-mark">✓</span><h1>Confirme seu e-mail</h1><p>Enviamos um link de confirmação. Abra sua caixa de entrada para ativar a conta e continuar o cadastro.</p><Link className="auth-secondary" href="/login">Voltar para entrar</Link></div></AuthShell>;

  return (
    <AuthShell>
      <div className="auth-form-wrap auth-signup">
        <AuthSteps active={1} />
        <h1>Crie sua conta</h1>
        <p className="auth-intro">Comece escolhendo como você quer usar a VYOO.</p>
        <AuthAlert error={params.error} />
        <form className="auth-form" action={signup}>
          <fieldset className="account-options compact">
            <legend className="sr-only">Tipo de conta</legend>
            <label><input type="radio" name="account_kind" value="advertiser" defaultChecked /><span className="radio-mark" /><span><strong>Anunciante</strong><small>Quero anunciar nas telas da rede.</small></span><Megaphone /></label>
            <label><input type="radio" name="account_kind" value="partner" /><span className="radio-mark" /><span><strong>Parceiro</strong><small>Tenho um estabelecimento e quero receber uma tela.</small></span><Store /></label>
          </fieldset>
          <TextField id="profile_name" label="Nome completo" placeholder="Ex.: João da Silva" autoComplete="name" />
          <TextField id="email" label="E-mail profissional" type="email" icon="mail" placeholder="Ex.: joao@minhaempresa.com.br" autoComplete="email" />
          <SignupPasswords />
          <label className="terms-check"><input type="checkbox" name="terms" value="accepted" required /><span>Li e aceito os <u>Termos de Uso</u> e a <u>Política de Privacidade</u>.</span></label>
          <SubmitButton>Continuar</SubmitButton>
        </form>
        <p className="auth-note">Já tem uma conta? <Link href="/login">Entrar</Link></p>
      </div>
    </AuthShell>
  );
}
