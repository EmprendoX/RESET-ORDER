"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const reportSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string().uuid(),
  reason: z.enum([
    "spam",
    "harassment",
    "disrespect",
    "private_information",
    "off_topic",
    "scam",
    "other",
  ]),
  ruleId: z.string().uuid().optional(),
  details: z.string().trim().max(1000).optional(),
});

export async function createReportAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = reportSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: payload.targetType,
    target_id: payload.targetId,
    rule_id: payload.ruleId ?? null,
    reason: payload.reason,
    details: payload.details ?? null,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  try {
    const admin = createAdminClient();
    const { data: mods } = await admin
      .from("user_roles")
      .select("user_id")
      .in("role", ["moderator", "admin", "owner"])
      .eq("status", "active");
    for (const m of mods ?? []) {
      await admin.from("notifications").insert({
        user_id: m.user_id,
        title: "Nuevo reporte",
        body: "Hay un reporte pendiente en la cola de moderación.",
        href: "/mod",
      });
    }
  } catch {
    // sin service role en local
  }

  revalidatePath("/mod");
}

const resolveSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["reviewing", "resolved", "dismissed"]),
});

export async function updateReportStatusAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = resolveSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({
      status: payload.status,
      resolved_at: payload.status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", payload.reportId);
  if (error) throw new Error(error.message);
  await supabase.from("moderation_actions").insert({
    moderator_id: user.id,
    target_type: "report",
    target_id: payload.reportId,
    action: `report_${payload.status}`,
    reason: "Actualización de cola",
  });
  revalidatePath("/mod");
}

export async function updateReportStatusFormAction(formData: FormData) {
  const reportId = String(formData.get("reportId") ?? "");
  const status = formData.get("status") as "reviewing" | "resolved" | "dismissed";
  await updateReportStatusAction({ reportId, status });
}

const modUserSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["active", "muted", "suspended", "banned"]),
  reason: z.string().trim().min(1).max(500),
});

export async function setUserStatusAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = modUserSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_roles")
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq("user_id", payload.userId);
  if (error) throw new Error(error.message);
  await supabase.from("moderation_actions").insert({
    moderator_id: user.id,
    target_type: "user",
    target_id: payload.userId,
    action: `user_${payload.status}`,
    reason: payload.reason,
  });
  revalidatePath("/mod");
  revalidatePath("/admin/users");
}

export async function setUserStatusFormAction(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const status = formData.get("status") as "active" | "muted" | "suspended" | "banned";
  const reason =
    String(formData.get("reason") ?? "").trim() || "Acción de moderación";
  await setUserStatusAction({ userId, status, reason });
}
