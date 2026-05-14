"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCommentAction } from "@/lib/actions/posts";

export function CommentForm({
  postId,
  parentCommentId,
  onDone,
  autoFocus = false,
  placeholder = "Escribe un comentario...",
  submitLabel = "Comentar",
}: {
  postId: string;
  parentCommentId?: string;
  onDone?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = String(fd.get("body") ?? "").trim();
    if (!body) return;
    start(async () => {
      try {
        await createCommentAction({ postId, body, parentCommentId });
        form.reset();
        onDone?.();
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <Textarea
        name="body"
        required
        minLength={1}
        maxLength={4000}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : submitLabel}
      </Button>
    </form>
  );
}
