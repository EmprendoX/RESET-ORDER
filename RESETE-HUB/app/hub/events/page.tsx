import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { rsvpEventFormAction } from "@/lib/actions/challenges";
import { isAdmin } from "@/lib/auth/roles";

export default async function EventsPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  const admin = await isAdmin();

  const rsvpRows =
    (events ?? []).length > 0
      ? await supabase
          .from("event_rsvps")
          .select("*")
          .eq("user_id", user.id)
          .in(
            "event_id",
            (events ?? []).map((e) => e.id as string),
          )
      : { data: [] as { event_id: string; status: string }[] };

  const rsvpMap = Object.fromEntries((rsvpRows.data ?? []).map((r) => [r.event_id, r.status]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Eventos</h1>
        {admin ? <Button href="/admin/events">Nuevo evento</Button> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(events ?? []).map((ev) => (
          <Card key={ev.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{ev.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{ev.description}</p>
            <p className="text-xs text-[var(--text-secondary)]">
              {new Date(ev.starts_at as string).toLocaleString("es-MX")}
            </p>
            {ev.external_url ? (
              <Button href={ev.external_url as string} variant="secondary">
                Enlace / streaming
              </Button>
            ) : null}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[var(--accent)]">
                Tu RSVP: {rsvpMap[ev.id as string] ?? "sin definir"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={rsvpEventFormAction}>
                <input type="hidden" name="eventId" value={ev.id as string} />
                <input type="hidden" name="status" value="going" />
                <Button type="submit" variant="secondary">
                  Asistiré
                </Button>
              </form>
              <form action={rsvpEventFormAction}>
                <input type="hidden" name="eventId" value={ev.id as string} />
                <input type="hidden" name="status" value="maybe" />
                <Button type="submit" variant="ghost">
                  Tal vez
                </Button>
              </form>
              <form action={rsvpEventFormAction}>
                <input type="hidden" name="eventId" value={ev.id as string} />
                <input type="hidden" name="status" value="not_going" />
                <Button type="submit" variant="ghost">
                  No asistiré
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
