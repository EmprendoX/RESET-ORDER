import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed && profile.rules_accepted_at) {
    redirect("/hub");
  }
  if (profile?.onboarding_completed && !profile.rules_accepted_at) {
    redirect("/rules");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Onboarding</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Cuéntanos tus intereses y tu objetivo. Luego revisarás y aceptarás las reglas de la
            comunidad.
          </p>
        </div>
        <OnboardingForm />
      </Card>
    </main>
  );
}
