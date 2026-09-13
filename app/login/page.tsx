import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="auth-shell">
      <section className="auth-story">
        <img src="/vyoo-logo-reverse.svg" alt="VYOO" className="auth-logo" />
        <div>
          <span className="auth-kicker">REDE DE MÍDIA LOCAL</span>
          <h1>Sua cidade.<br />Sua audiência.<br /><em>Sua marca.</em></h1>
          <p>Gerencie campanhas, telas e resultados reais em uma única operação.</p>
        </div>
        <small>VYOO © 2026 · Mateus Leme, MG</small>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <span className="auth-eyebrow">VYOO PLATFORM</span>
          <h2>Acesse sua conta</h2>
          <p className="auth-intro">Use seu e-mail profissional para entrar ou criar um novo acesso.</p>

          {params.error && <p className="auth-alert auth-alert-error">{params.error}</p>}
          {params.message && <p className="auth-alert auth-alert-success">{params.message}</p>}

          <form className="auth-form">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com.br" required />
            <label htmlFor="password">Senha</label>
            <input id="password" name="password" type="password" autoComplete="current-password" minLength={8} placeholder="Mínimo de 8 caracteres" required />
            <button className="auth-primary" formAction={login}>Entrar na plataforma</button>
            <button className="auth-secondary" formAction={signup}>Criar uma conta</button>
          </form>

          <p className="auth-note">O tipo de acesso será definido com segurança após a confirmação do cadastro.</p>
        </div>
      </section>
    </main>
  );
}
