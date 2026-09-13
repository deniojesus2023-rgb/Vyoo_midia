import { createClient } from "@/lib/supabase/server";

export type AccountKind = "vyoo" | "advertiser" | "partner";

export type AuthContext = {
  userId: string;
  role: "owner" | "admin" | "manager" | "viewer";
  organization: {
    publicId: string;
    name: string;
    kind: AccountKind;
    status: "pending" | "active" | "suspended" | "rejected";
  };
};

export function areaForAccount(kind: AccountKind) {
  if (kind === "vyoo") return "/admin";
  if (kind === "partner") return "/parceiro";
  return "/ads";
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) return null;

  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations!inner(public_id, name, kind, status)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const organization = data.organizations;
  const validRoles = ["owner", "admin", "manager", "viewer"] as const;
  const validKinds = ["vyoo", "advertiser", "partner"] as const;
  const validStatuses = ["pending", "active", "suspended", "rejected"] as const;
  if (!validRoles.includes(data.role as (typeof validRoles)[number])) return null;
  if (!validKinds.includes(organization.kind as (typeof validKinds)[number])) return null;
  if (!validStatuses.includes(organization.status as (typeof validStatuses)[number])) return null;

  return {
    userId,
    role: data.role as AuthContext["role"],
    organization: {
      publicId: organization.public_id,
      name: organization.name,
      kind: organization.kind as AccountKind,
      status: organization.status as AuthContext["organization"]["status"],
    },
  };
}
