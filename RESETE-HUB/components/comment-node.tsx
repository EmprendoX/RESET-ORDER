"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { CommentForm } from "@/components/comment-form";
import { ReportForm } from "@/components/report-form";

type Props = {
  postId: string;
  commentId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  body: string;
  createdAt: string;
  isReply?: boolean;
  replyToName?: string;
};

export function CommentNode({
  postId,
  commentId,
  authorName,
  authorAvatarUrl,
  body,
  createdAt,
  isReply = false,
  replyToName,
}: Props) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={isReply ? "ml-6 border-l-2 border-[rgba(255,255,255,0.08)] pl-4" : ""}>
      <Card className="space-y-2 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Avatar url={authorAvatarUrl ?? null} name={authorName} size="sm" />
            <p className="text-xs text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text)]">{authorName}</span>
              {" · "}
              {new Date(createdAt).toLocaleString("es-MX")}
              {replyToName ? (
                <>
                  {" · respondiendo a "}
                  <span className="text-[var(--accent)]">@{replyToName}</span>
                </>
              ) : null}
            </p>
          </div>
          <ReportForm targetType="comment" targetId={commentId} />
        </div>
        <p className="whitespace-pre-wrap text-[var(--text)]">{body}</p>

        {!replying ? (
          <button
            type="button"
            onClick={() => setReplying(true)}
            className="text-xs text-[var(--text-secondary)] underline-offset-2 hover:underline hover:text-[var(--cta)]"
          >
            Responder
          </button>
        ) : (
          <div className="space-y-2 rounded-xl border border-[var(--border-accent)] p-3">
            <p className="text-xs text-[var(--text-secondary)]">
              Respondiendo a <span className="text-[var(--text)]">@{authorName}</span>
            </p>
            <CommentForm
              postId={postId}
              parentCommentId={commentId}
              onDone={() => setReplying(false)}
              autoFocus
              placeholder={`Escribe tu respuesta a @${authorName}...`}
              submitLabel="Responder"
            />
            <button
              type="button"
              onClick={() => setReplying(false)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text)]"
            >
              Cancelar
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
