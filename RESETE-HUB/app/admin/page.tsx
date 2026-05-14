import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    profiles,
    posts,
    comments,
    reportsOpen,
    challenges,
    events,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "reviewing"]),
    supabase.from("challenges").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  const tiles = [
    { label: "Perfiles", value: profiles.count ?? 0 },
    { label: "Posts", value: posts.count ?? 0 },
    { label: "Comentarios", value: comments.count ?? 0 },
    { label: "Reportes abiertos", value: reportsOpen.count ?? 0 },
    { label: "Retos activos", value: challenges.count ?? 0 },
    { label: "Eventos", value: events.count ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel administrativo</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Card key={t.label}>
            <p className="text-sm text-[var(--text-secondary)]">{t.label}</p>
            <p className="text-3xl font-bold">{t.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
