import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SpacesPage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, name, slug, description, only_admin_posts")
    .eq("is_archived", false)
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Espacios</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {(spaces ?? []).map((s) => (
          <Card key={s.id} className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold">{s.name}</h2>
              {s.only_admin_posts ? (
                <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs text-[var(--accent)]">
                  Solo admins
                </span>
              ) : null}
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{s.description}</p>
            <Link className="text-sm font-semibold brand-accent-text" href={`/hub/spaces/${s.slug}`}>
              Entrar
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
