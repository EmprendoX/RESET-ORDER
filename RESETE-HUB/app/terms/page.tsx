import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Card className="space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        <h1 className="text-2xl font-bold text-[var(--text)]">Términos de uso</h1>
        <p>
          Este texto es un marcador de posición. Debe revisarse con asesoría legal antes del
          lanzamiento público de RESETE-HUB y alinearse con las políticas de RESET-ORDER.
        </p>
        <p>
          Al usar la comunidad aceptas participar con respeto, no publicar contenido ilegal y
          respetar las decisiones del equipo de moderación.
        </p>
        <Link href="/" className="brand-accent-text">
          Volver al inicio
        </Link>
      </Card>
    </main>
  );
}
