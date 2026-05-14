"use client";

import { useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import Link from "@tiptap/extension-link";
import { uploadPostImageAction } from "@/lib/actions/posts";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={
        "rounded-md px-2 py-1 text-sm transition disabled:opacity-40 " +
        (active
          ? "bg-[var(--cta)] text-white"
          : "bg-white/[0.04] text-[var(--text-secondary)] hover:bg-white/[0.08] hover:text-[var(--text)]")
      }
    >
      {children}
    </button>
  );
}

export function RichEditor({ value, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl my-3 max-w-full h-auto" },
        allowBase64: false,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
        HTMLAttributes: { class: "rounded-xl my-3 w-full" },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "post-content min-h-[220px] focus:outline-none px-4 py-3",
      },
    },
  });

  const handleImage = useCallback(async (file: File, ed: Editor) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadPostImageAction(fd);
      ed.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }, []);

  if (!editor) {
    return (
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--text-secondary)]">
        Cargando editor...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--surface)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border-accent)] p-2">
        <ToolbarBtn
          title="Negrita"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn
          title="Itálica"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn
          title="Subrayado / tachado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <s>S</s>
        </ToolbarBtn>

        <span className="mx-1 h-5 w-px bg-white/10" />

        <ToolbarBtn
          title="Título 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarBtn>
        <ToolbarBtn
          title="Título 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarBtn>
        <ToolbarBtn
          title="Título 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarBtn>

        <span className="mx-1 h-5 w-px bg-white/10" />

        <ToolbarBtn
          title="Alinear izquierda"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ⬅
        </ToolbarBtn>
        <ToolbarBtn
          title="Centrar"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ⇔
        </ToolbarBtn>
        <ToolbarBtn
          title="Alinear derecha"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ➡
        </ToolbarBtn>

        <span className="mx-1 h-5 w-px bg-white/10" />

        <ToolbarBtn
          title="Lista con viñetas"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •—
        </ToolbarBtn>
        <ToolbarBtn
          title="Lista numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarBtn>
        <ToolbarBtn
          title="Cita"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          ❝
        </ToolbarBtn>

        <span className="mx-1 h-5 w-px bg-white/10" />

        <ToolbarBtn
          title="Enlace"
          active={editor.isActive("link")}
          onClick={() => {
            const previous = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("URL del enlace", previous ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          🔗
        </ToolbarBtn>
        <ToolbarBtn
          title="Subir imagen"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "..." : "🖼"}
        </ToolbarBtn>
        <ToolbarBtn
          title="Insertar video de YouTube"
          onClick={() => {
            const url = window.prompt("Pega el link del video de YouTube");
            if (!url) return;
            editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
          }}
        >
          ▶
        </ToolbarBtn>

        <span className="ml-auto flex gap-1">
          <ToolbarBtn
            title="Deshacer"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            ↶
          </ToolbarBtn>
          <ToolbarBtn
            title="Rehacer"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            ↷
          </ToolbarBtn>
        </span>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImage(f, editor);
          e.target.value = "";
        }}
      />
    </div>
  );
}
