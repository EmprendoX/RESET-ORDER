import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Headphones, Users } from "lucide-react";
import { Card } from "@/components/ui/card";

// Home/dashboard de RESET-ORDER: punto de partida del producto completo.
// La tab "Inicio" del menú inferior apunta aquí. La página `/` queda como
// bienvenida de la comunidad RESET-HUB.

const cardClass =
  "flex h-full items-center gap-4 transition hover:-translate-y-px hover:border-[var(--border-accent)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-[var(--brand-blue)]";

export default function InicioPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3 text-center">
        <Image
          src="/Logot_Reset_Order.png"
          alt="RESET-ORDER"
          width={240}
          height={135}
          priority
          className="mx-auto h-auto w-32 sm:w-44"
        />
        <h1
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          style={{ fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui" }}
        >
          THE RESET <span className="brand-accent-text">ORDER</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)]">
          Tu punto de partida. Elige a dónde quieres ir.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* SPAs estáticas (/edu, /binaural): navegación de página completa con <a>. */}
        <a href="/edu/" className="group block focus:outline-none">
          <Card className={cardClass}>
            <GraduationCap className="h-7 w-7 shrink-0 text-[var(--brand-red)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold">Cursos</p>
              <p className="text-sm text-[var(--text-secondary)]">Aprende a tu ritmo.</p>
            </div>
          </Card>
        </a>

        <a href="/binaural/#audios" className="group block focus:outline-none">
          <Card className={cardClass}>
            <Headphones className="h-7 w-7 shrink-0 text-[var(--brand-red)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold">Audios</p>
              <p className="text-sm text-[var(--text-secondary)]">Afirmaciones, binaural y más.</p>
            </div>
          </Card>
        </a>

        {/* Ruta Next: navegación de cliente con Link. */}
        <Link href="/hub" className="group block focus:outline-none">
          <Card className={cardClass}>
            <Users className="h-7 w-7 shrink-0 text-[var(--brand-blue)]" aria-hidden />
            <div>
              <p className="text-lg font-semibold">Comunidad</p>
              <p className="text-sm text-[var(--text-secondary)]">El hub de RESET-ORDER.</p>
            </div>
          </Card>
        </Link>
      </div>
    </main>
  );
}
