import { redirect } from "next/navigation";
import { areaForAccount, getAuthContext } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/login");

  const context = await getAuthContext();
  if (!context) redirect("/onboarding");
  redirect(areaForAccount(context.organization.kind));
}
