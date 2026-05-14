"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500).optional(),
  country: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
});

export async function updateProfileAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = profileSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: payload.displayName,
      bio: payload.bio || null,
      country: payload.country || null,
      city: payload.city || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/hub");
  revalidatePath("/hub/settings/profile");
}

const onboardingSchema = z.object({
  interests: z.array(z.string()).min(1),
  goal: z.string().trim().min(1).max(500),
});

export async function completeOnboardingAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = onboardingSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      interests: payload.interests,
      goal: payload.goal,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/hub");
  redirect("/rules");
}

export async function acceptRulesAction() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      rules_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/hub");
  redirect("/hub");
}

export async function updateProfileFormAction(formData: FormData) {
  await updateProfileAction({
    displayName: String(formData.get("displayName") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    country: String(formData.get("country") ?? ""),
    city: String(formData.get("city") ?? ""),
  });
}

const ALLOWED_AVATAR_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function uploadAvatarFormAction(formData: FormData) {
  const user = await requireSessionUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Archivo inválido.");
  }
  if (!ALLOWED_AVATAR_MIME.includes(file.type)) {
    throw new Error("Solo PNG, JPEG, WebP o GIF.");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("La imagen excede 2MB.");
  }
  const extFromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = ["png", "jpg", "jpeg", "webp", "gif"].includes(extFromName)
    ? extFromName
    : file.type.split("/")[1] ?? "png";
  const path = `${user.id}/avatar.${ext}`;
  const supabase = await createClient();
  const { error: upErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  const cacheBustedUrl = `${pub.publicUrl}?v=${Date.now()}`;
  const { error: updErr } = await supabase
    .from("profiles")
    .update({ avatar_url: cacheBustedUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (updErr) throw new Error(updErr.message);

  revalidatePath("/hub");
  revalidatePath("/hub/settings/profile");
}
