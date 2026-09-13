"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { areaForAccount, getAuthContext, type AccountKind } from "@/lib/auth-context";

export async function completeOnboarding(formData: FormData) {
  const existing = await getAuthContext();
  if (existing) redirect(areaForAccount(existing.organization.kind));

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (claimsError || !userId) redirect("/login");

  const accountKind = String(formData.get("account_kind") ?? "") as AccountKind;
  const organizationName = String(formData.get("organization_name") ?? "").trim();
  const profileName = String(formData.get("profile_name") ?? "").trim();
  if (!["advertiser", "partner"].includes(accountKind) || organizationName.length < 2 || profileName.length < 2) {
    redirect("/onboarding?error=Revise+os+dados+informados.");
  }

  const { error } = await supabase.from("account_onboarding_requests").insert({
    user_id: userId,
    account_kind: accountKind,
    organization_name: organizationName,
    profile_name: profileName,
    organization_id: 0,
    completed_at: new Date(0).toISOString(),
  });

  if (error) redirect("/onboarding?error=Não+foi+possível+finalizar+o+cadastro.");
  redirect(areaForAccount(accountKind));
}
