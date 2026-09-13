import { redirect } from "next/navigation";
import Vyoo from "../vyoo";
import { areaForAccount, getAuthContext } from "@/lib/auth-context";

export default async function Page({ params }: { params: Promise<{ area: string }> }) {
  const { area } = await params;
  const context = await getAuthContext();
  if (!context) redirect("/onboarding");

  const allowedPath = areaForAccount(context.organization.kind);
  if (`/${area}` !== allowedPath) redirect(allowedPath);
  return <Vyoo initialArea={area} />;
}
