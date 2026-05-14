import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

export type RoleRow = {
  role: string;
  status: string;
};

export async function getMyRole(): Promise<RoleRow | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();
  return data as RoleRow | null;
}

export async function isModerator(): Promise<boolean> {
  const row = await getMyRole();
  return !!row && ["moderator", "admin", "owner"].includes(row.role);
}

export async function isAdmin(): Promise<boolean> {
  const row = await getMyRole();
  return !!row && ["admin", "owner"].includes(row.role);
}
