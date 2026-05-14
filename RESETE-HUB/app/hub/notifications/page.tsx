import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { markNotificationReadFormAction } from "@/lib/actions/notifications";

export default async function NotificationsPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Notificaciones</h1>
      <div className="space-y-2">
        {(items ?? []).map((n) => (
          <Card key={n.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{n.title}</p>
              {n.body ? <p className="text-sm text-[var(--text-secondary)]">{n.body}</p> : null}
              <p className="text-xs text-[var(--text-secondary)]">
                {new Date(n.created_at as string).toLocaleString("es-MX")}
                {n.read_at ? " · Leída" : ""}
              </p>
              {n.href ? (
                <Link href={n.href as string} className="text-sm brand-accent-text">
                  Abrir
                </Link>
              ) : null}
            </div>
            {!n.read_at ? (
              <form action={markNotificationReadFormAction}>
                <input type="hidden" name="id" value={n.id as string} />
                <Button type="submit" variant="secondary">
                  Marcar leída
                </Button>
              </form>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
