"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/slugify";

export function CreateSpaceForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const previewSlug = slug || slugify(name);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={120}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug("");
          }}
          placeholder="Ej. Bienvenida"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="slug">
          Slug <span className="text-[var(--text-secondary)]">(opcional, se genera del nombre)</span>
        </Label>
        <Input
          id="slug"
          name="slug"
          maxLength={80}
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugTouched(true);
          }}
          placeholder={slugify(name) || "ej. bienvenida"}
        />
        {previewSlug ? (
          <p className="text-xs text-[var(--text-secondary)]">
            URL: <code className="text-[var(--accent)]">/hub/spaces/{previewSlug}</code>
          </p>
        ) : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" maxLength={2000} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="onlyAdminPosts" className="accent-[var(--cta)]" />
        Solo admins pueden publicar
      </label>
      <Button type="submit">Crear espacio</Button>
    </form>
  );
}
