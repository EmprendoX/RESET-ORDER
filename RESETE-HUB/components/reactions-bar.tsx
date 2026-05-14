"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleReactionAction } from "@/lib/actions/posts";
import { ALLOWED_REACTIONS, type ReactionEmoji } from "@/lib/reactions";

type Props = {
  targetType: "post" | "comment";
  targetId: string;
  counts: Partial<Record<ReactionEmoji, number>>;
  mine: ReactionEmoji[];
};

export function ReactionsBar({ targetType, targetId, counts, mine }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const mineSet = new Set(mine);

  function onClick(emoji: ReactionEmoji) {
    start(async () => {
      try {
        await toggleReactionAction({ targetType, targetId, emoji });
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ALLOWED_REACTIONS.map((emoji) => {
        const active = mineSet.has(emoji);
        const count = counts[emoji] ?? 0;
        return (
          <button
            key={emoji}
            type="button"
            disabled={pending}
            onClick={() => onClick(emoji)}
            className={
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm transition disabled:opacity-50 " +
              (active
                ? "border-[rgba(255,30,30,0.4)] bg-[var(--accent-soft)] text-[var(--text)]"
                : "border-[var(--border-accent)] bg-white/[0.03] text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text)]")
            }
            aria-pressed={active}
            aria-label={`Reaccionar con ${emoji}`}
          >
            <span>{emoji}</span>
            {count > 0 ? <span className="text-xs font-medium">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
