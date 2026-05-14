import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import {
  updateReportStatusFormAction,
  setUserStatusFormAction,
} from "@/lib/actions/moderation";

export default async function ModHomePage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Cola de reportes</h1>
      <div className="space-y-3">
        {(reports ?? []).map((r) => (
          <Card key={r.id} className="space-y-3 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">
                {r.target_type} · {r.reason}
              </p>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-xs uppercase text-[var(--accent)]">
                {r.status}
              </span>
            </div>
            {r.details ? <p className="text-[var(--text-secondary)]">{r.details}</p> : null}
            <p className="text-xs text-[var(--text-secondary)]">
              Creado: {new Date(r.created_at as string).toLocaleString("es-MX")}
            </p>
            <div className="flex flex-wrap gap-2">
              <form action={updateReportStatusFormAction}>
                <input type="hidden" name="reportId" value={r.id as string} />
                <input type="hidden" name="status" value="reviewing" />
                <Button type="submit" variant="secondary">
                  En revisión
                </Button>
              </form>
              <form action={updateReportStatusFormAction}>
                <input type="hidden" name="reportId" value={r.id as string} />
                <input type="hidden" name="status" value="resolved" />
                <Button type="submit" variant="primary">
                  Resolver
                </Button>
              </form>
              <form action={updateReportStatusFormAction}>
                <input type="hidden" name="reportId" value={r.id as string} />
                <input type="hidden" name="status" value="dismissed" />
                <Button type="submit" variant="ghost">
                  Descartar
                </Button>
              </form>
            </div>
            {r.target_type === "user" ? (
              <form action={setUserStatusFormAction} className="flex flex-wrap gap-2">
                <input type="hidden" name="userId" value={r.target_id as string} />
                <Input name="reason" placeholder="Motivo moderación" className="max-w-xs" />
                <select
                  name="status"
                  className="rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-2 py-1 text-sm text-[#111827]"
                >
                  <option value="muted">Silenciar</option>
                  <option value="suspended">Suspender</option>
                  <option value="banned">Banear</option>
                  <option value="active">Reactivar</option>
                </select>
                <Button type="submit" variant="danger">
                  Aplicar a usuario
                </Button>
              </form>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
