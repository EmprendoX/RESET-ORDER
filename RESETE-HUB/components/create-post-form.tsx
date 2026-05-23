"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichEditor } from "@/components/rich-editor";
import { createPostAction } from "@/lib/actions/posts";

type Space = { id: string; name: string };

export function CreatePostForm({
  spaces,
  defaultSpaceId,
}: {
  spaces: Space[];
  defaultSpaceId?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [body, setBody] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const spaceId = String(fd.get("spaceId"));
    const title = String(fd.get("title"));
    const postType = String(fd.get("postType") ?? "discussion");
    const cleanedBody = body.trim();
    if (cleanedBody.length === 0 || cleanedBody === "<p></p>") {
      alert("El cuerpo del post no puede estar vacío.");
      return;
    }
    start(async () => {
      try {
        await createPostAction({ spaceId, title, body: cleanedBody, postType });
        router.push("/hub");
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error");
      }
    });
  }

  const selectClasses =
    "w-full rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-3 py-2 text-sm text-[#111827]";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="spaceId">Espacio (opcional)</Label>
        <select
          id="spaceId"
          name="spaceId"
          defaultValue={defaultSpaceId ?? spaces[0]?.id}
          className={selectClasses}
          required
        >
          {spaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="postType">Tipo</Label>
        <select
          id="postType"
          name="postType"
          defaultValue="discussion"
          className={selectClasses}
        >
          <option value="discussion">Discusión</option>
          <option value="question">Pregunta</option>
          <option value="progress">Avance</option>
          <option value="resource">Recurso</option>
          <option value="reflection">Reflexión</option>
          <option value="challenge">Reto</option>
          <option value="help">Ayuda</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required minLength={3} maxLength={160} />
      </div>
      <div className="space-y-1">
        <Label>Contenido</Label>
        <RichEditor value={body} onChange={setBody} />
        <p className="text-xs text-[var(--text-secondary)]">
          Usa la barra para dar formato. Puedes subir imágenes (hasta 5MB) y pegar links de YouTube
          para insertar el video.
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Publicando..." : "Publicar"}
      </Button>
    </form>
  );
}
