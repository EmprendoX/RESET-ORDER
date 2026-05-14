"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

export async function joinChallengeAction(slug: string) {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: ch } = await supabase
    .from("challenges")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();
  if (!ch) throw new Error("Reto no encontrado.");
  const { error } = await supabase.from("challenge_members").insert({
    challenge_id: ch.id,
    user_id: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/hub/challenges/${slug}`);
}

export async function joinChallengeFormAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  if (!slug) throw new Error("Slug inválido.");
  await joinChallengeAction(slug);
}

const checkInSchema = z.object({
  slug: z.string().min(1),
  isDone: z.boolean(),
  note: z.string().trim().max(1000).optional(),
});

export async function challengeCheckInAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = checkInSchema.parse(input);
  const supabase = await createClient();
  const { data: ch } = await supabase
    .from("challenges")
    .select("id")
    .eq("slug", payload.slug)
    .maybeSingle();
  if (!ch) throw new Error("Reto no encontrado.");
  const checkinDate = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("challenge_checkins").upsert(
    {
      challenge_id: ch.id,
      user_id: user.id,
      checkin_date: checkinDate,
      is_done: payload.isDone,
      note: payload.note || null,
    },
    { onConflict: "challenge_id,user_id,checkin_date" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/hub/challenges/${payload.slug}`);
}

const eventSchema = z.object({
  eventId: z.string().uuid(),
  status: z.enum(["going", "maybe", "not_going"]),
});

export async function rsvpEventAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = eventSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("event_rsvps").upsert(
    {
      event_id: payload.eventId,
      user_id: user.id,
      status: payload.status,
    },
    { onConflict: "event_id,user_id" },
  );
  if (error) throw new Error(error.message);
  revalidatePath("/hub/events");
}

export async function rsvpEventFormAction(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const status = formData.get("status") as "going" | "maybe" | "not_going";
  await rsvpEventAction({ eventId, status });
}

const eventCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional(),
  startsAt: z.string().min(1),
  externalUrl: z.string().url().optional().or(z.literal("")),
});

export async function createEventAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = eventCreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("events").insert({
    title: payload.title,
    description: payload.description || null,
    starts_at: payload.startsAt,
    external_url: payload.externalUrl || null,
    created_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/hub/events");
  revalidatePath("/admin/events");
}

const challengeCreateSchema = z.object({
  title: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().min(1).max(8000),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

export async function createChallengeAction(input: unknown) {
  const user = await requireSessionUser();
  const payload = challengeCreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("challenges").insert({
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    starts_at: payload.startsAt || null,
    ends_at: payload.endsAt || null,
    created_by: user.id,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/hub/challenges");
  revalidatePath("/admin/challenges");
}

export async function createChallengeFormAction(formData: FormData) {
  await createChallengeAction({
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? "") || undefined,
    endsAt: String(formData.get("endsAt") ?? "") || undefined,
  });
}

export async function createEventFormAction(formData: FormData) {
  await createEventAction({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    externalUrl: String(formData.get("externalUrl") ?? ""),
  });
}
