import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Card className="space-y-4 text-sm leading-relaxed text-[var(--text-secondary)]">
        <h1 className="text-2xl font-bold text-[var(--text)]">Aviso de privacidad</h1>
        <p>
          Este aviso es un marcador de posición. Para operación en México, el tratamiento de datos
          personales debe cumplir la LFPDPPP y contar con revisión legal del texto final.
        </p>
        <p>
          Solo solicitamos los datos necesarios para operar la comunidad (correo, nombre visible y
          opcionales como bio o ubicación).
        </p>
        <Link href="/" className="brand-accent-text">
          Volver al inicio
        </Link>
      </Card>
    </main>
  );
}
