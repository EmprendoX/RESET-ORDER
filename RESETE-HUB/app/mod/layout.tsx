import Link from "next/link";
import { requireModeratorRoute } from "@/lib/auth/guards";

export default async function ModLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireModeratorRoute();
  return (
    <div className="min-h-screen">
      <header className="surface-header border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/mod"
            className="font-semibold text-[var(--text)]"
            style={{
              fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui",
            }}
          >
            Panel <span className="brand-accent-text">moderación</span>
          </Link>
          <Link className="nav-link" href="/hub">
            Volver al hub
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
