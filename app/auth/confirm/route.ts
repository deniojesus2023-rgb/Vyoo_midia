import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/onboarding";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/onboarding";
  const supabase = await createClient();
  let error: unknown = null;

  if (tokenHash && type) {
    ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
  } else if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    error = new Error("Link inválido");
  }

  return NextResponse.redirect(new URL(error ? "/login?error=Link+inválido+ou+expirado." : next, url.origin));
}
