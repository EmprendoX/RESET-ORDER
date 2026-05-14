import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { acceptRulesAction } from "@/lib/actions/profile";

export default async function RulesPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }
  if (profile.rules_accepted_at) {
    redirect("/hub");
  }

  const { data: rules } = await supabase
    .from("community_rules")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Card className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reglas de la comunidad</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Antes de participar, confirma que entiendes y aceptas estas normas. Así mantenemos
            RESETE-HUB seguro y útil.
          </p>
        </div>
        <ol className="space-y-4">
          {(rules ?? []).map((r) => (
            <li key={r.id} className="rounded-2xl border border-[var(--border-accent)] p-4">
              <p className="font-semibold text-[var(--text)]">{r.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{r.description}</p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Reporte asociado: {r.report_reason} · Severidad: {r.severity}
              </p>
            </li>
          ))}
        </ol>
        <form action={acceptRulesAction}>
          <Button type="submit">Acepto las reglas</Button>
        </form>
        <div className="flex flex-wrap gap-3">
          <Button href="/terms" variant="secondary">
            Ver términos
          </Button>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          <Link href="/privacy" className="brand-accent-text">Aviso de privacidad</Link>
        </p>
      </Card>
    </main>
  );
}
