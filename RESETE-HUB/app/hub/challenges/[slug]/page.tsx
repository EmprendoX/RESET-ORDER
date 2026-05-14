import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { CheckInForm } from "@/components/check-in-form";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: ch } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!ch) notFound();

  const { data: membership } = await supabase
    .from("challenge_members")
    .select("*")
    .eq("challenge_id", ch.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: checkins } = await supabase
    .from("challenge_checkins")
    .select("*")
    .eq("challenge_id", ch.id)
    .eq("user_id", user.id)
    .order("checkin_date", { ascending: false })
    .limit(14);

  const doneDays = (checkins ?? []).filter((c) => c.is_done).length;

  return (
    <div className="space-y-4">
      <Link href="/hub/challenges" className="text-sm text-[var(--text-secondary)]">
        ← Volver a retos
      </Link>
      <Card className="space-y-3">
        <h1 className="text-3xl font-bold">{ch.title}</h1>
        <p className="whitespace-pre-wrap text-[var(--text)]">{ch.description}</p>
        {!membership ? (
          <p className="text-sm text-[var(--accent)]">
            Únete desde la lista de retos para registrar tu progreso.
          </p>
        ) : (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Días completados (últimos registros): {doneDays}+
            </p>
            <CheckInForm slug={slug} />
          </>
        )}
      </Card>
      {membership ? (
        <Card className="space-y-2">
          <h2 className="font-semibold">Historial reciente</h2>
          <ul className="space-y-1 text-sm text-[var(--text-secondary)]">
            {(checkins ?? []).map((c) => (
              <li key={c.id}>
                {c.checkin_date as string}: {c.is_done ? "Hecho" : "No hecho"}
                {c.note ? ` — ${c.note}` : ""}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
