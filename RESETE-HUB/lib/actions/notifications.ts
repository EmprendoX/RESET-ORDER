"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

export async function markNotificationReadAction(id: string) {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/hub/notifications");
}

export async function markNotificationReadFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Notificación inválida.");
  await markNotificationReadAction(id);
}
