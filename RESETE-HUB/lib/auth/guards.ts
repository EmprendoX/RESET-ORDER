import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isAdmin, isModerator } from "@/lib/auth/roles";

export async function requireModeratorRoute() {
  const ok = await isModerator();
  if (!ok) redirect("/hub");
}

export async function requireAdminRoute() {
  const ok = await isAdmin();
  if (!ok) redirect("/hub");
}

export async function requireOnboardingComplete() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed || !profile?.rules_accepted_at) {
    redirect("/onboarding");
  }
}

export async function requireCreateAccess() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const [{ data: profile }, { data: role }] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarding_completed, rules_accepted_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);
  const isAdmin = role && ["admin", "owner"].includes(role.role as string);
  const memberReady =
    profile?.onboarding_completed && profile.rules_accepted_at;
  if (!isAdmin && !memberReady) {
    redirect("/onboarding");
  }
}

export async function getProfileGate() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();
  return { user, profile };
}
