import { redirect } from "next/navigation";
import { AuthAlert, AuthShell } from "@/components/auth-shell";
import { SignupPasswords, SubmitButton } from "@/components/auth-fields";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "@/app/login/actions";

export default async function UpdatePasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login?error=Abra+novamente+o+link+de+recuperação+enviado+por+e-mail.");
  const params = await searchParams;
  return <AuthShell><div className="auth-form-wrap auth-login"><h1>Crie uma nova senha</h1><p className="auth-intro">Escolha uma senha segura para voltar à sua conta.</p><AuthAlert error={params.error} /><form className="auth-form" action={updatePassword}><SignupPasswords /><SubmitButton>Salvar nova senha</SubmitButton></form></div></AuthShell>;
}
