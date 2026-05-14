"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { challengeCheckInAction } from "@/lib/actions/challenges";

export function CheckInForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const note = String(fd.get("note") ?? "");
    start(async () => {
      try {
        await challengeCheckInAction({ slug, isDone: true, note });
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea name="note" placeholder="Nota opcional del día" maxLength={1000} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Registrar check-in de hoy"}
      </Button>
    </form>
  );
}
