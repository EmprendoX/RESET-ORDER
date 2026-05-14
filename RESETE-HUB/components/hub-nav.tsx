import Image from "next/image";
import Link from "next/link";
import { getMyRole } from "@/lib/auth/roles";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";

export async function HubNav() {
  const role = await getMyRole();
  const isMod =
    role && ["moderator", "admin", "owner"].includes(role.role);
  const isAdm = role && ["admin", "owner"].includes(role.role);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: me } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <header className="surface-header border-b border-[rgba(255,255,255,0.06)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/hub"
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--text)]"
          style={{
            fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui",
          }}
        >
          <Image
            src="/Logot_Reset_Order.png"
            alt="RESET-ORDER"
            width={56}
            height={32}
            className="h-7 w-auto"
          />
          <span>RESETE<span className="brand-accent-text">-HUB</span></span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="nav-link" href="/hub">Inicio</Link>
          <Link className="nav-link" href="/hub/spaces">Espacios</Link>
          <Link className="nav-link" href="/hub/resources">Recursos</Link>
          <Link className="nav-link" href="/hub/challenges">Retos</Link>
          <Link className="nav-link" href="/hub/events">Eventos</Link>
          <Link className="nav-link" href="/hub/notifications">Avisos</Link>
          {isMod ? (
            <Link className="nav-link" href="/mod">Moderación</Link>
          ) : null}
          {isAdm ? (
            <Link className="nav-link" href="/admin">Admin</Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/hub/settings/profile"
            className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-white/[0.06]"
            title="Tu perfil"
          >
            <Avatar
              url={(me?.avatar_url as string | null) ?? null}
              name={(me?.display_name as string) ?? "Yo"}
              size="sm"
            />
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="secondary">Salir</Button>
          </form>
        </div>
      </div>
    </header>
  );
}
