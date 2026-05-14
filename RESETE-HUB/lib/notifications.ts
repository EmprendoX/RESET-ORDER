"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  href?: string,
) {
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({
      user_id: userId,
      title,
      body,
      href: href ?? null,
    });
  } catch {
    // Sin SUPABASE_SERVICE_ROLE_KEY las notificaciones se omiten en local.
  }
}
