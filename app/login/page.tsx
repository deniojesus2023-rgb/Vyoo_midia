import Link from "next/link";
import { AuthAlert, AuthShell } from "@/components/auth-shell";
import { PasswordField, SubmitButton, TextField } from "@/components/auth-fields";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell>
      <div className="auth-login auth-form-wrap">
        <h1>Bem-vindo de volta</h1>
        <p className="auth-intro">Entre para acompanhar sua operação na rede VYOO.</p>
        <AuthAlert error={params.error} message={params.message} />
        <form className="auth-form" action={login}>
          <TextField id="email" label="E-mail" type="email" icon="mail" placeholder="Ex.: joao@suaempresa.com.br" autoComplete="email" />
          <div className="password-heading"><span>Senha</span><Link href="/forgot-password">Esqueci minha senha</Link></div>
          <PasswordField label="" />
          <p className="session-note">Seu acesso permanece conectado com segurança neste dispositivo.</p>
          <SubmitButton>Entrar</SubmitButton>
        </form>
        <div className="auth-separator"><span>Ainda não tem uma conta?</span></div>
        <Link className="auth-secondary" href="/signup">Criar conta</Link>
        <p className="auth-note">Acesso seguro para anunciantes, parceiros e equipe VYOO.</p>
      </div>
    </AuthShell>
  );
}
