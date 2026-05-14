import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-4 text-center">
        <Image
          src="/Logot_Reset_Order.png"
          alt="RESET-ORDER"
          width={240}
          height={135}
          priority
          className="mx-auto h-auto w-40 sm:w-56"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          RESET-ORDER
        </p>
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui" }}
        >
          Bienvenido a RESETE<span className="brand-accent-text">-HUB</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)]">
          Espacio oficial para ordenar ideas, hábitos y comunidad con reglas claras y moderación
          humana.
        </p>
      </div>
      <Card className="mx-auto flex w-full max-w-xl flex-col gap-4 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          Crea tu cuenta, acepta las reglas y entra al hub cuando estés listo.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button href="/signup">Empezar mi reset</Button>
          <Button href="/login" variant="secondary">
            Ya tengo cuenta
          </Button>
        </div>
      </Card>
      <p className="text-center text-xs text-[var(--text-secondary)]">
        <Link href="/terms">Términos</Link> · <Link href="/privacy">Privacidad</Link>
      </p>
    </main>
  );
}
