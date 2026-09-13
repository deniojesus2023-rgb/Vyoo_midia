"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData, page: "/login" | "/signup") {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    redirect(`${page}?error=Informe+um+e-mail+válido+e+uma+senha+com+8+caracteres.`);
  }
  return { email, password };
}

async function siteOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL;
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData, "/login"));
  if (error) redirect("/login?error=E-mail+ou+senha+inválidos.");
  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signup(formData: FormData) {
  const { email, password } = credentials(formData, "/signup");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const profileName = String(formData.get("profile_name") ?? "").trim();
  const accountKind = String(formData.get("account_kind") ?? "");
  const acceptedTerms = formData.get("terms") === "accepted";
  if (password !== confirmPassword) redirect("/signup?error=As+senhas+não+coincidem.");
  if (profileName.length < 2 || !["advertiser", "partner"].includes(accountKind) || !acceptedTerms) {
    redirect("/signup?error=Revise+seus+dados+e+aceite+os+termos+para+continuar.");
  }
  const origin = await siteOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/confirm?next=/onboarding` : undefined,
      data: { profile_name: profileName, account_kind: accountKind },
    },
  });
  if (error) redirect("/signup?error=Não+foi+possível+criar+a+conta.+Talvez+o+e-mail+já+esteja+em+uso.");
  if (data.session) redirect("/onboarding");
  redirect("/signup?created=1");
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) redirect("/forgot-password?error=Informe+um+e-mail+válido.");
  const origin = await siteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/confirm?next=/update-password` : undefined,
  });
  if (error) redirect("/forgot-password?error=Não+foi+possível+enviar+o+link.+Tente+novamente.");
  redirect("/forgot-password?message=Se+o+e-mail+estiver+cadastrado,+você+receberá+um+link+de+recuperação.");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  if (password.length < 8) redirect("/update-password?error=Use+uma+senha+com+pelo+menos+8+caracteres.");
  if (password !== confirmPassword) redirect("/update-password?error=As+senhas+não+coincidem.");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/update-password?error=O+link+expirou+ou+a+senha+não+pôde+ser+alterada.");
  await supabase.auth.signOut();
  redirect("/login?message=Senha+alterada.+Entre+com+sua+nova+senha.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
