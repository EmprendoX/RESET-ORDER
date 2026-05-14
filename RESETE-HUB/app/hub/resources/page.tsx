import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { toggleSavedResourceFormAction } from "@/lib/actions/resources";
import { isAdmin } from "@/lib/auth/roles";

export default async function ResourcesPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: saved } = await supabase
    .from("saved_resources")
    .select("resource_id")
    .eq("user_id", user.id);
  const savedSet = new Set((saved ?? []).map((s) => s.resource_id));

  const admin = await isAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Recursos</h1>
        {admin ? (
          <Button href="/admin/resources">Gestionar</Button>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(resources ?? []).map((r) => (
          <Card key={r.id} className="space-y-2">
            <p className="text-xs uppercase text-[var(--text-secondary)]">{r.category}</p>
            <h2 className="text-lg font-semibold">{r.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{r.description}</p>
            <div className="flex flex-wrap gap-2">
              {r.url ? (
                <Button href={r.url as string} variant="secondary">
                  Abrir enlace
                </Button>
              ) : null}
              <form action={toggleSavedResourceFormAction}>
                <input type="hidden" name="resourceId" value={r.id as string} />
                <Button type="submit" variant="secondary">
                  {savedSet.has(r.id as string) ? "Quitar guardado" : "Guardar"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
