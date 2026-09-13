"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useFormStatus } from "react-dom";

export function TextField({ id, label, type = "text", placeholder, autoComplete, icon = "user", required = true, defaultValue }: {
  id: string; label: string; type?: string; placeholder?: string; autoComplete?: string; icon?: "user" | "mail"; required?: boolean; defaultValue?: string;
}) {
  const Icon = icon === "mail" ? Mail : UserRound;
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div><Icon aria-hidden="true" /><input id={id} name={id} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required} defaultValue={defaultValue} /></div></label>;
}

export function PasswordField({ id = "password", label = "Senha", placeholder = "Digite sua senha", autoComplete = "current-password", onValue }: {
  id?: string; label?: string; placeholder?: string; autoComplete?: string; onValue?: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return <label className="auth-field" htmlFor={id}><span>{label}</span><div><LockKeyhole aria-hidden="true" /><input id={id} name={id} type={visible ? "text" : "password"} minLength={8} placeholder={placeholder} autoComplete={autoComplete} required onChange={e => onValue?.(e.target.value)} /><button className="auth-reveal" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>{visible ? <EyeOff /> : <Eye />}</button></div></label>;
}

export function SignupPasswords() {
  const [password, setPassword] = useState("");
  const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^\w]/.test(password)].filter(Boolean).length;
  return <div className="auth-passwords"><PasswordField label="Senha" placeholder="Mínimo de 8 caracteres" autoComplete="new-password" onValue={setPassword} /><PasswordField id="confirm_password" label="Confirmar senha" placeholder="Repita sua senha" autoComplete="new-password" /><div className="password-meter" aria-label={`Força da senha: ${score} de 4`}><span className={score > 0 ? "on" : ""} /><span className={score > 1 ? "on" : ""} /><span className={score > 2 ? "on" : ""} /><span className={score > 3 ? "on" : ""} /><small>{score < 2 ? "Use 8 caracteres, número e maiúscula" : score < 4 ? "Senha segura" : "Senha forte"}</small></div></div>;
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Aguarde..." : children}<span aria-hidden="true">→</span></button>;
}
