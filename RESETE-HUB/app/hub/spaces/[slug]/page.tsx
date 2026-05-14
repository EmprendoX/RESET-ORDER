import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireSessionUser();
  const supabase = await createClient();
  const { data: space } = await supabase
    .from("spaces")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!space || space.is_archived) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at")
    .eq("id", user.id)
    .maybeSingle();
  const memberReady =
    profile?.onboarding_completed && profile.rules_accepted_at;

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const isAdmin = role && ["admin", "owner"].includes(role.role as string);
  const allowCreate =
    (space.only_admin_posts && !!isAdmin) ||
    (!space.only_admin_posts && (!!memberReady || !!isAdmin));

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, post_type, created_at, pinned, author_id")
    .eq("space_id", space.id)
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  const authorIds = Array.from(new Set((posts ?? []).map((p) => p.author_id as string)));
  const { data: authors } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", authorIds)
    : { data: [] as { id: string; display_name: string; avatar_url: string | null }[] };

  const authorMap = Object.fromEntries((authors ?? []).map((a) => [a.id, a]));

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">Espacio</p>
          <h1 className="text-3xl font-bold">{space.name}</h1>
          <p className="text-[var(--text-secondary)]">{space.description}</p>
        </div>
        {allowCreate ? (
          <Button href={`/hub/create?space=${space.id}`}>Nuevo post</Button>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            {space.only_admin_posts && !isAdmin
              ? "Solo el equipo puede publicar aquí."
              : "Completa onboarding y reglas para publicar (salvo admins)."}
          </p>
        )}
      </div>
      {(() => {
        type P = NonNullable<typeof posts>[number];
        const list = (posts ?? []) as P[];
        const pinned = list.filter((p) => p.pinned);
        const regular = list.filter((p) => !p.pinned);

        const renderCard = (p: P) => {
          const author = authorMap[p.author_id as string];
          return (
            <Card key={p.id} className="flex gap-3">
              <Avatar
                url={author?.avatar_url ?? null}
                name={author?.display_name ?? "Miembro"}
                size="md"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text)]">
                    {author?.display_name ?? "Miembro"}
                  </span>
                  {" · "}
                  {new Date(p.created_at as string).toLocaleString("es-MX")}
                </div>
                <Link href={`/hub/posts/${p.id}`} className="text-lg font-semibold">
                  {p.title}
                </Link>
              </div>
            </Card>
          );
        };

        if (list.length === 0) {
          return (
            <Card>Sé el primero en publicar en este espacio.</Card>
          );
        }

        return (
          <div className="space-y-6">
            {pinned.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
                  📌 Fijados
                </h2>
                <div className="space-y-3">{pinned.map(renderCard)}</div>
              </section>
            ) : null}
            {regular.length > 0 ? (
              <section className="space-y-3">
                {pinned.length > 0 ? (
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Recientes
                  </h2>
                ) : null}
                <div className="space-y-3">{regular.map(renderCard)}</div>
              </section>
            ) : null}
          </div>
        );
      })()}
    </div>
  );
}
