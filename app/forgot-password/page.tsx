import Link from "next/link";
import { AuthAlert, AuthShell } from "@/components/auth-shell";
import { SubmitButton, TextField } from "@/components/auth-fields";
import { requestPasswordReset } from "@/app/login/actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const params = await searchParams;
  return <AuthShell><div className="auth-form-wrap auth-login"><h1>Recupere sua senha</h1><p className="auth-intro">Informe seu e-mail para receber um link seguro de redefinição.</p><AuthAlert error={params.error} message={params.message} /><form className="auth-form" action={requestPasswordReset}><TextField id="email" label="E-mail" type="email" icon="mail" placeholder="voce@empresa.com.br" autoComplete="email" /><SubmitButton>Enviar link</SubmitButton></form><Link className="auth-back" href="/login">← Voltar para entrar</Link></div></AuthShell>;
}
