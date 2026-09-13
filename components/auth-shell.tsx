import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-workspace">
        <header className="auth-brand-header">
          <img src="/vyoo-wordmark.svg" alt="VYOO" className="auth-logo" />
          <span>Conecta marcas<br />com a sua cidade.</span>
        </header>
        {children}
      </section>
      <AuthVisual />
    </main>
  );
}

function AuthVisual() {
  return (
    <aside className="auth-visual" aria-label="Rede de mídia local VYOO">
      <div className="auth-visual-shade" />
      <span className="auth-visual-kicker">REDE DE MÍDIA LOCAL</span>
      <div className="auth-tv-message">
        <img src="/vyoo-logo-reverse.svg" alt="VYOO" />
        <strong>SUA MARCA,<br /><em>PRESENTE</em><br />NA CIDADE.</strong>
      </div>
      <p className="auth-proof"><i />Telas reais. Presença local. Entrega comprovada.</p>
    </aside>
  );
}

export function AuthSteps({ active }: { active: 1 | 2 | 3 }) {
  return (
    <ol className="auth-steps" aria-label={`Etapa ${active} de 3`}>
      {[[1, "Conta"], [2, "Perfil"], [3, "Confirmação"]].map(([number, label]) => (
        <li className={Number(number) <= active ? "active" : ""} key={label}>
          <b>{number}</b><span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function AuthAlert({ error, message }: { error?: string; message?: string }) {
  return <>{error && <p className="auth-alert auth-alert-error">{error}</p>}{message && <p className="auth-alert auth-alert-success">{message}</p>}</>;
}
