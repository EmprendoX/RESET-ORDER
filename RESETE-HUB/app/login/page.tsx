import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Accede con el correo de tu cuenta RESET-ORDER.
          </p>
        </div>
        {sp.error ? (
          <p className="rounded-xl bg-[rgba(255,30,30,0.18)] px-3 py-2 text-sm text-[var(--danger)]">
            {decodeURIComponent(sp.error)}
          </p>
        ) : null}
        {sp.message ? (
          <p className="rounded-xl bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--accent)]">
            {decodeURIComponent(sp.message)}
          </p>
        ) : null}
        <form action={signInAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Continuar
          </Button>
        </form>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          ¿No tienes cuenta? <Link href="/signup" className="brand-accent-text">Crear cuenta</Link>
        </p>
        <p className="text-center text-xs text-[var(--text-secondary)]">
          <Link href="/">Volver al inicio</Link>
        </p>
      </Card>
    </main>
  );
}
