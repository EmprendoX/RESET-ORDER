import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { createClient } from "@/lib/supabase/server";
import { requireSessionUser } from "@/lib/auth/session";
import { CommentForm } from "@/components/comment-form";
import { CommentNode } from "@/components/comment-node";
import { ReactionsBar } from "@/components/reactions-bar";
import { ReportForm } from "@/components/report-form";
import { sanitizePostHtml } from "@/lib/sanitize-html";
import { ALLOWED_REACTIONS, type ReactionEmoji } from "@/lib/reactions";

type DBComment = {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
  parent_comment_id: string | null;
};

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireSessionUser();
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!post || post.status !== "published") notFound();

  const [{ data: space }, { data: author }, { data: comments }] = await Promise.all([
    supabase.from("spaces").select("name, slug").eq("id", post.space_id).maybeSingle(),
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", post.author_id)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("*")
      .eq("post_id", id)
      .eq("status", "published")
      .order("created_at", { ascending: true }),
  ]);

  const authorIds = Array.from(
    new Set((comments ?? []).map((c) => c.author_id as string)),
  );
  const { data: commentAuthors } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", authorIds)
    : { data: [] as { id: string; display_name: string; avatar_url: string | null }[] };
  const authorMap = Object.fromEntries((commentAuthors ?? []).map((a) => [a.id, a]));

  const { data: allPostReactions } = await supabase
    .from("reactions")
    .select("emoji, user_id")
    .eq("target_type", "post")
    .eq("target_id", id);

  const postReactionCounts: Partial<Record<ReactionEmoji, number>> = {};
  const myPostReactions: ReactionEmoji[] = [];
  for (const r of allPostReactions ?? []) {
    const e = r.emoji as ReactionEmoji;
    if (!ALLOWED_REACTIONS.includes(e)) continue;
    postReactionCounts[e] = (postReactionCounts[e] ?? 0) + 1;
    if (r.user_id === user.id) myPostReactions.push(e);
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-[var(--text-secondary)]">
        <Link href="/hub">Hub</Link> /{" "}
        {space?.slug ? (
          <Link href={`/hub/spaces/${space.slug}`}>{space.name}</Link>
        ) : (
          "Espacio"
        )}
      </div>
      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            url={author?.avatar_url ?? null}
            name={author?.display_name ?? "Miembro"}
            size="md"
          />
          <div className="text-xs text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text)]">
              {author?.display_name ?? "Miembro"}
            </p>
            <p className="uppercase">
              {new Date(post.created_at as string).toLocaleString("es-MX")} · {post.post_type}
            </p>
          </div>
        </div>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <div
          className="post-content max-w-none text-base leading-relaxed text-[var(--text)]"
          dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.body as string) }}
        />
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <ReactionsBar
            targetType="post"
            targetId={id}
            counts={postReactionCounts}
            mine={myPostReactions}
          />
          <ReportForm targetType="post" targetId={id} />
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Deja tu comentario</h2>
        <Card>
          <CommentForm postId={id} />
        </Card>

        {(() => {
          const list = (comments ?? []) as DBComment[];
          if (list.length === 0) {
            return (
              <p className="text-sm text-[var(--text-secondary)]">
                Sé el primero en comentar.
              </p>
            );
          }

          const byId = new Map<string, DBComment>(list.map((c) => [c.id, c]));
          const findRootId = (c: DBComment): string => {
            let cursor: DBComment = c;
            while (cursor.parent_comment_id) {
              const parent = byId.get(cursor.parent_comment_id);
              if (!parent) break;
              cursor = parent;
            }
            return cursor.id;
          };
          const topLevel = list.filter((c) => !c.parent_comment_id);
          const repliesByRoot = new Map<string, DBComment[]>();
          for (const c of list) {
            if (!c.parent_comment_id) continue;
            const rootId = findRootId(c);
            if (rootId === c.id) continue;
            const arr = repliesByRoot.get(rootId) ?? [];
            arr.push(c);
            repliesByRoot.set(rootId, arr);
          }
          for (const arr of repliesByRoot.values()) {
            arr.sort(
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
          }

          const nameOf = (uid: string) =>
            authorMap[uid]?.display_name ?? "Miembro";
          const avatarOf = (uid: string) =>
            (authorMap[uid]?.avatar_url as string | null | undefined) ?? null;

          return (
            <>
              <h3 className="pt-2 text-base font-semibold text-[var(--text-secondary)]">
                {list.length} comentario{list.length === 1 ? "" : "s"}
              </h3>
              {topLevel.map((top) => (
                <div key={top.id} className="space-y-2">
                  <CommentNode
                    postId={id}
                    commentId={top.id}
                    authorName={nameOf(top.author_id)}
                    authorAvatarUrl={avatarOf(top.author_id)}
                    body={top.body}
                    createdAt={top.created_at}
                  />
                  {(repliesByRoot.get(top.id) ?? []).map((reply) => {
                    const parent = reply.parent_comment_id
                      ? byId.get(reply.parent_comment_id)
                      : undefined;
                    const replyToName =
                      parent && parent.id !== top.id ? nameOf(parent.author_id) : undefined;
                    return (
                      <CommentNode
                        key={reply.id}
                        postId={id}
                        commentId={reply.id}
                        authorName={nameOf(reply.author_id)}
                        authorAvatarUrl={avatarOf(reply.author_id)}
                        body={reply.body}
                        createdAt={reply.created_at}
                        isReply
                        replyToName={replyToName}
                      />
                    );
                  })}
                </div>
              ))}
            </>
          );
        })()}
      </div>
    </div>
  );
}
