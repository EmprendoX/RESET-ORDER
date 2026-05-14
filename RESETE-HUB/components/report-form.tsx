"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReportAction } from "@/lib/actions/moderation";

const REASONS = [
  ["spam", "Spam"],
  ["harassment", "Acoso"],
  ["disrespect", "Falta de respeto"],
  ["private_information", "Información personal"],
  ["off_topic", "Fuera de tema"],
  ["scam", "Estafa / enlace sospechoso"],
  ["other", "Otro"],
] as const;

export function ReportForm({
  targetType,
  targetId,
}: {
  targetType: "post" | "comment" | "user";
  targetId: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const reason = String(fd.get("reason")) as (typeof REASONS)[number][0];
    const details = String(fd.get("details") ?? "");
    start(async () => {
      try {
        await createReportAction({ targetType, targetId, reason, details });
        alert("Reporte enviado. Gracias por cuidar la comunidad.");
        form.reset();
        setOpen(false);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--text-secondary)] underline-offset-2 hover:underline hover:text-[var(--danger)]"
      >
        Reportar
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-2xl border border-[var(--border-accent)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Reportar contenido</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)]"
        >
          Cancelar
        </button>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`reason-${targetId}`}>Motivo</Label>
        <select
          id={`reason-${targetId}`}
          name="reason"
          required
          className="w-full rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-3 py-2 text-sm text-[#111827]"
        >
          {REASONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <Textarea name="details" maxLength={1000} placeholder="Detalle opcional" />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Enviando..." : "Enviar reporte"}
      </Button>
    </form>
  );
}
