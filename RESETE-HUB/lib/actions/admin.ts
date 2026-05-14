"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/roles";
import { slugify } from "@/lib/slugify";

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([
    "member",
    "verified",
    "mentor",
    "moderator",
    "admin",
    "owner",
  ]),
});

export async function setUserRoleAction(input: unknown) {
  await requireSessionUser();
  if (!(await isAdmin())) {
    throw new Error("Solo administradores pueden cambiar roles.");
  }
  const payload = roleSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("user_roles")
    .update({ role: payload.role, updated_at: new Date().toISOString() })
    .eq("user_id", payload.userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

const spaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(2000).optional(),
  onlyAdminPosts: z.boolean().optional(),
});

export async function createSpaceAction(input: unknown) {
  await requireSessionUser();
  if (!(await isAdmin())) {
    throw new Error("Solo administradores pueden crear espacios.");
  }
  const payload = spaceSchema.parse(input);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  const { error } = await supabase.from("spaces").insert({
    name: payload.name,
    slug: payload.slug,
    description: payload.description || null,
    only_admin_posts: payload.onlyAdminPosts ?? false,
    created_by: uid ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/hub/spaces");
  revalidatePath("/admin/spaces");
}

export async function createSpaceFormAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const rawSlug = String(formData.get("slug") ?? "").trim();
  const safeSlug = rawSlug ? slugify(rawSlug) : slugify(name);
  await createSpaceAction({
    name,
    slug: safeSlug,
    description: String(formData.get("description") ?? ""),
    onlyAdminPosts: formData.get("onlyAdminPosts") === "on",
  });
}

export async function setUserRoleFormAction(formData: FormData) {
  await setUserRoleAction({
    userId: String(formData.get("userId") ?? ""),
    role: formData.get("role") as
      | "member"
      | "verified"
      | "mentor"
      | "moderator"
      | "admin"
      | "owner",
  });
}
