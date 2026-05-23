import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";

export default async function HubHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireSessionUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, rules_accepted_at, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const canPost = profile?.onboarding_completed && profile.rules_accepted_at;

  let postsQuery = supabase
    .from("posts")
    .select("id, title, post_type, created_at, pinned, space_id, author_id")
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(40);

  if (q) {
    const safe = q.replace(/%/g, "").replace(/,/g, "");
    postsQuery = postsQuery.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
  }

  const { data: posts } = await postsQuery;
  const authorIds = Array.from(new Set((posts ?? []).map((p) => p.author_id as string)));
  const [{ data: spaces }, authorsRes] = await Promise.all([
    supabase.from("spaces").select("id, name, slug"),
    authorIds.length
      ? supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", authorIds)
      : Promise.resolve({
          data: [] as { id: string; display_name: string; avatar_url: string | null }[],
        }),
  ]);
  const authors = authorsRes.data;

  const spaceMap = Object.fromEntries((spaces ?? []).map((s) => [s.id, s]));
  const authorMap = Object.fromEntries((authors ?? []).map((a) => [a.id, a]));

  // Publicar fácil: por defecto al espacio "General" (si existe); si no, sin preseleccionar.
  const generalId = (spaces ?? []).find((s) => s.slug === "general")?.id as string | undefined;
  const createHref = generalId ? `/hub/create?space=${generalId}` : "/hub/create";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {profile?.display_name}</h1>
          <p className="text-[var(--text-secondary)]">
            Feed reciente de la comunidad RESET-ORDER.
          </p>
        </div>
        <form className="flex gap-2" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar en títulos o cuerpo..."
            className="w-full min-w-[200px] rounded-full border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-4 py-2 text-sm text-[#111827]"
          />
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
      </div>

      {canPost ? (
        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">¿Qué quieres compartir hoy?</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Publica en General o, si quieres, elige un espacio.
            </p>
          </div>
          <Button href={createHref}>Comparte algo</Button>
        </Card>
      ) : null}

      {!canPost ? (
        <Card className="border-[rgba(255,30,30,0.3)] bg-[var(--accent-soft)] text-sm text-[var(--text)]">
          Completa{" "}
          <Link className="font-semibold underline" href="/onboarding">
            onboarding
          </Link>{" "}
          y{" "}
          <Link className="font-semibold underline" href="/rules">
            acepta las reglas
          </Link>{" "}
          para publicar o comentar.
        </Card>
      ) : null}

      {(() => {
        type P = NonNullable<typeof posts>[number];
        const list = (posts ?? []) as P[];
        const pinned = list.filter((p) => p.pinned);
        const regular = list.filter((p) => !p.pinned);

        const renderCard = (p: P) => {
          const space = spaceMap[p.space_id as string];
          const author = authorMap[p.author_id as string];
          return (
            <Card key={p.id} className="flex gap-3">
              <Avatar
                url={author?.avatar_url ?? null}
                name={author?.display_name ?? "Miembro"}
                size="md"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text)]">
                    {author?.display_name ?? "Miembro"}
                  </span>
                  <span>·</span>
                  <span>{space?.name ?? "Espacio"}</span>
                  <span>·</span>
                  <span>{new Date(p.created_at as string).toLocaleString("es-MX")}</span>
                  <span>·</span>
                  <span className="uppercase">{p.post_type}</span>
                </div>
                <Link href={`/hub/posts/${p.id}`} className="block text-lg font-semibold">
                  {p.title}
                </Link>
                {space?.slug ? (
                  <p className="text-xs text-[var(--text-secondary)]">
                    <Link href={`/hub/spaces/${space.slug}`}>Ver espacio</Link>
                  </p>
                ) : null}
              </div>
            </Card>
          );
        };

        if (list.length === 0) {
          return (
            <Card>No hay publicaciones todavía. Sé el primero en compartir en un espacio.</Card>
          );
        }

        return (
          <div className="space-y-6">
            {pinned.length > 0 ? (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
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
