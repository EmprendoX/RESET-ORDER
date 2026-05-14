import { requireSessionUser } from "@/lib/auth/session";
import { HubNav } from "@/components/hub-nav";
import { Leaderboard } from "@/components/leaderboard";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSessionUser();
  return (
    <div className="min-h-screen">
      <HubNav />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <main className="min-w-0 flex-1">{children}</main>
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-6">
              <Leaderboard />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
