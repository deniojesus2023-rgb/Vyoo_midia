"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function credentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    redirect("/login?error=Informe+um+e-mail+válido+e+uma+senha+com+8+caracteres.");
  }
  return { email, password };
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials(formData));
  if (error) redirect("/login?error=E-mail+ou+senha+inválidos.");
  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signup(formData: FormData) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...credentials(formData),
    options: origin ? { emailRedirectTo: `${origin}/auth/confirm` } : undefined,
  });
  if (error) redirect("/login?error=Não+foi+possível+criar+a+conta.");
  if (data.session) redirect("/onboarding");
  redirect("/login?message=Confira+seu+e-mail+para+confirmar+o+cadastro.");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
