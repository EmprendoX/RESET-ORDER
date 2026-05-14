import { Card } from "@/components/ui/card";
import { createSpaceFormAction } from "@/lib/actions/admin";
import { CreateSpaceForm } from "@/components/create-space-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSpacesPage() {
  const supabase = await createClient();
  const { data: spaces } = await supabase
    .from("spaces")
    .select("id, name, slug, only_admin_posts, is_archived")
    .order("name");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Espacios</h1>

      <Card className="space-y-3">
        <h2 className="font-semibold">Nuevo espacio</h2>
        <CreateSpaceForm action={createSpaceFormAction} />
      </Card>

      <Card className="space-y-2">
        <h2 className="font-semibold">Espacios existentes</h2>
        <ul className="divide-y divide-[var(--border-accent)] text-sm">
          {(spaces ?? []).map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  /{s.slug}
                  {s.only_admin_posts ? " · solo admins" : ""}
                  {s.is_archived ? " · archivado" : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
