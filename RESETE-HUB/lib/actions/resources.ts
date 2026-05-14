"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

export async function toggleSavedResourceAction(resourceId: string) {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("saved_resources")
    .select("resource_id")
    .eq("user_id", user.id)
    .eq("resource_id", resourceId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from("saved_resources")
      .delete()
      .eq("user_id", user.id)
      .eq("resource_id", resourceId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("saved_resources").insert({
      user_id: user.id,
      resource_id: resourceId,
    });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/hub/resources");
}

export async function toggleSavedResourceFormAction(formData: FormData) {
  const resourceId = String(formData.get("resourceId") ?? "");
  if (!resourceId) throw new Error("Recurso inválido.");
  await toggleSavedResourceAction(resourceId);
}

const resourceSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(80),
  url: z.string().url().optional().or(z.literal("")),
});

export async function createResourceAction(input: unknown) {
  await requireSessionUser();
  const payload = resourceSchema.parse(input);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Sesión inválida.");
  const { error } = await supabase.from("resources").insert({
    title: payload.title,
    description: payload.description || null,
    category: payload.category,
    url: payload.url || null,
    created_by: uid,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/hub/resources");
  revalidatePath("/admin/resources");
}

export async function createResourceFormAction(formData: FormData) {
  await createResourceAction({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    url: String(formData.get("url") ?? ""),
  });
}
