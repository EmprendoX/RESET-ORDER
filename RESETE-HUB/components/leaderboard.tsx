import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { levelFromPoints } from "@/lib/levels";

const MEDALS = ["🥇", "🥈", "🥉"];

export async function Leaderboard() {
  const supabase = await createClient();
  const res = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, points")
    .order("points", { ascending: false })
    .limit(10);

  if (res.error) {
    return (
      <Card className="space-y-2 p-4 text-xs text-[var(--text-secondary)]">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          🏆 Top miembros
        </h3>
        <p>
          Sistema de puntos aún no aplicado. Aplica la migración{" "}
          <code>20260514100000_points.sql</code>.
        </p>
      </Card>
    );
  }

  const rows = (res.data ?? []).filter(
    (p) => ((p.points as number | null | undefined) ?? 0) > 0,
  );

  return (
    <Card className="space-y-3 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
        🏆 Top miembros
      </h3>
      {rows.length === 0 ? (
        <p className="text-xs text-[var(--text-secondary)]">
          Aún no hay actividad. Publica y reacciona para subir en el ranking.
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((p, i) => {
            const points = (p.points as number) ?? 0;
            const { level } = levelFromPoints(points);
            return (
              <li key={p.id as string} className="flex items-center gap-2 text-sm">
                <span className="w-5 text-center text-xs">
                  {MEDALS[i] ?? <span className="text-[var(--text-secondary)]">{i + 1}</span>}
                </span>
                <Avatar
                  url={(p.avatar_url as string | null) ?? null}
                  name={(p.display_name as string) ?? "Miembro"}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[var(--text)]">{p.display_name as string}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Nivel {level} · {points} pts
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
