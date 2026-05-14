"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { notifyUser } from "@/lib/notifications";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { ALLOWED_REACTIONS } from "@/lib/reactions";

const createPostSchema = z.object({
  spaceId: z.string().uuid(),
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(50000),
  postType: z
    .enum([
      "discussion",
      "question",
      "progress",
      "resource",
      "reflection",
      "challenge",
      "help",
    ])
    .default("discussion"),
});

export async function createPostAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = createPostSchema.parse(input);
  const cleanBody = sanitizePostHtml(payload.body);
  if (cleanBody.trim().length === 0) {
    throw new Error("El contenido del post está vacío tras la limpieza.");
  }
  const supabase = await createClient();
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();
  if (pErr || !profile?.onboarding_completed || !profile?.rules_accepted_at) {
    throw new Error("Completa onboarding y acepta las reglas antes de publicar.");
  }
  const { error } = await supabase.from("posts").insert({
    space_id: payload.spaceId,
    author_id: user.id,
    title: payload.title,
    body: cleanBody,
    post_type: payload.postType,
    status: "published",
    pinned: false,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/hub");
  revalidatePath("/hub/spaces");
}

const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadPostImageAction(formData: FormData): Promise<{ url: string }> {
  const user = await requireSessionUser();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Archivo inválido.");
  }
  if (!ALLOWED_IMAGE_MIME.includes(file.type)) {
    throw new Error("Solo PNG, JPEG, WebP o GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen excede 5MB.");
  }
  const extFromName = file.name.split(".").pop()?.toLowerCase() ?? "";
  const ext = ["png", "jpg", "jpeg", "webp", "gif"].includes(extFromName)
    ? extFromName
    : file.type.split("/")[1] ?? "png";
  const path = `posts/${user.id}/${crypto.randomUUID()}.${ext}`;
  const supabase = await createClient();
  const { error: upErr } = await supabase.storage
    .from("post-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);
  const { data } = supabase.storage.from("post-media").getPublicUrl(path);
  return { url: data.publicUrl };
}

const commentSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
  parentCommentId: z.string().uuid().optional(),
});

export async function createCommentAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = commentSchema.parse(input);
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, title")
    .eq("id", payload.postId)
    .maybeSingle();
  if (!post) throw new Error("Post no encontrado.");

  const { error } = await supabase.from("comments").insert({
    post_id: payload.postId,
    author_id: user.id,
    parent_comment_id: payload.parentCommentId ?? null,
    body: payload.body,
    status: "published",
  });
  if (error) throw new Error(error.message);

  if (post.author_id !== user.id) {
    await notifyUser(
      post.author_id,
      "Nuevo comentario",
      `Alguien comentó en «${post.title}».`,
      `/hub/posts/${payload.postId}`,
    );
  }

  revalidatePath(`/hub/posts/${payload.postId}`);
}

const reactionSchema = z.object({
  targetType: z.enum(["post", "comment"]),
  targetId: z.string().uuid(),
  emoji: z.enum(ALLOWED_REACTIONS),
});

export async function toggleReactionAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = reactionSchema.parse(input);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", payload.targetType)
    .eq("target_id", payload.targetId)
    .eq("emoji", payload.emoji)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("reactions").insert({
      user_id: user.id,
      target_type: payload.targetType,
      target_id: payload.targetId,
      emoji: payload.emoji,
    });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/hub");
}
