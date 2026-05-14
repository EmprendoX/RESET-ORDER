import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { joinChallengeFormAction } from "@/lib/actions/challenges";
import { isAdmin } from "@/lib/auth/roles";

export default async function ChallengesPage() {
  await requireSessionUser();
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const admin = await isAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Retos</h1>
        {admin ? <Button href="/admin/challenges">Nuevo reto</Button> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(challenges ?? []).map((c) => (
          <Card key={c.id} className="space-y-2">
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{c.description}</p>
            <div className="flex flex-wrap gap-2">
              <Button href={`/hub/challenges/${c.slug}`}>Ver reto</Button>
              <form action={joinChallengeFormAction}>
                <input type="hidden" name="slug" value={c.slug as string} />
                <Button type="submit" variant="secondary">
                  Unirme
                </Button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
