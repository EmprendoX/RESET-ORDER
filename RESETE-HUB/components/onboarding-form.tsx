"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { completeOnboardingAction } from "@/lib/actions/profile";

const OPTIONS = [
  { id: "orden_personal", label: "Orden personal" },
  { id: "habitos", label: "Hábitos" },
  { id: "productividad", label: "Productividad" },
  { id: "reset_mental", label: "Reset mental" },
  { id: "finanzas", label: "Finanzas / organización" },
  { id: "comunidad", label: "Comunidad y accountability" },
  { id: "recursos", label: "Recursos RESET-ORDER" },
];

export function OnboardingForm() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const selected = OPTIONS.map((o) => o.id).filter((id) => formData.get(id) === "on");
    const goal = String(formData.get("goal") ?? "").trim();
    start(async () => {
      try {
        await completeOnboardingAction({ interests: selected, goal });
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Intereses</Label>
        <p className="text-xs text-[var(--text-secondary)]">Selecciona al menos uno.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-accent)] px-3 py-2 text-sm text-[var(--text)]"
            >
              <input type="checkbox" name={o.id} className="accent-[var(--accent)]" />
              {o.label}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Tu objetivo ahora</Label>
        <Textarea id="goal" name="goal" required placeholder="Ej. Quiero ordenar mi rutina..." />
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Guardando..." : "Continuar a reglas"}
      </Button>
    </form>
  );
}
