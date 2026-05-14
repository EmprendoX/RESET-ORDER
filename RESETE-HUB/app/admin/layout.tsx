import Link from "next/link";
import { requireAdminRoute } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRoute();
  return (
    <div className="min-h-screen">
      <header className="surface-header border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <Link
            href="/admin"
            className="font-semibold text-[var(--text)]"
            style={{
              fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui",
            }}
          >
            Admin <span className="brand-accent-text">RESETE-HUB</span>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link className="nav-link" href="/admin/users">Usuarios</Link>
            <Link className="nav-link" href="/admin/spaces">Espacios</Link>
            <Link className="nav-link" href="/admin/resources">Recursos</Link>
            <Link className="nav-link" href="/admin/challenges">Retos</Link>
            <Link className="nav-link" href="/admin/events">Eventos</Link>
          </nav>
          <Link className="nav-link ml-auto" href="/hub">
            Volver al hub
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
