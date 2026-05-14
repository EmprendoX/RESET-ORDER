import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { setUserRoleFormAction } from "@/lib/actions/admin";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role, status")
    .order("updated_at", { ascending: false })
    .limit(100);

  const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id as string)));
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, display_name").in("id", ids)
    : { data: [] as { id: string; display_name: string }[] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Usuarios y roles</h1>
      <div className="space-y-3">
        {(roles ?? []).map((r) => (
          <Card key={r.user_id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{profileMap[r.user_id as string] ?? r.user_id}</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Rol: {r.role} · Estado: {r.status}
              </p>
            </div>
            <form action={setUserRoleFormAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="userId" value={r.user_id as string} />
              <select
                name="role"
                defaultValue={r.role as string}
                className="rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-2 py-1 text-sm text-[#111827]"
              >
                <option value="member">member</option>
                <option value="verified">verified</option>
                <option value="mentor">mentor</option>
                <option value="moderator">moderator</option>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <Button type="submit" variant="secondary">
                Actualizar rol
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
