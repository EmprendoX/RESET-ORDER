import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/lib/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <Card className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Crear cuenta</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Usa un correo real para verificar tu acceso a RESETE-HUB.
          </p>
        </div>
        {sp.error ? (
          <p className="rounded-xl bg-[rgba(255,30,30,0.18)] px-3 py-2 text-sm text-[var(--danger)]">
            {decodeURIComponent(sp.error)}
          </p>
        ) : null}
        <form action={signUpAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="displayName">Nombre visible</Label>
            <Input id="displayName" name="displayName" minLength={2} maxLength={80} />
          </div>
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
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Registrarme
          </Button>
        </form>
        <p className="text-center text-sm text-[var(--text-secondary)]">
          ¿Ya tienes cuenta? <Link href="/login" className="brand-accent-text">Entrar</Link>
        </p>
      </Card>
    </main>
  );
}
