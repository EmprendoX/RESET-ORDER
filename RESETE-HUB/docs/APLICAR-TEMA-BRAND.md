# Aplicar tema oscuro + gradiente de marca (red / purple / blue)

Cursor está en **Plan mode**: los cambios debes aplicarlos tú o cambiar a **Agent mode** y pedir “aplica docs/APLICAR-TEMA-BRAND.md”.

## 1. Reemplazar [`app/globals.css`](../app/globals.css)

Sustituye el archivo completo por el bloque **Anexo A** al final de este documento (no hace falta otro archivo; en Plan mode no se pudo crear `docs/snippets/*.css`).

Notas respecto a tu CSS original:

- **`body`**: no se usa `display: flex; justify-content: center` en global para no romper el ancho del hub/admin; el padding sí (`2.5rem 1.5rem`, responsive).
- **Fuentes**: Plus Jakarta / DM Sans siguen viniendo de `next/font` en [`app/layout.tsx`](../app/layout.tsx); en CSS se referencian como `var(--font-dm-sans)` y `var(--font-plus-jakarta)`.
- Se añaden **`--border-accent`** y **`--focus-ring`** para inputs React.
- **`.brand-accent-text`** = mismo efecto que `.brand-accent` (texto con gradiente).

## 2. Componentes UI

Usa los **Anexos B–E** al final de este documento (reemplazo completo de cada archivo).

## 3. Navegación y layouts

| Archivo | Cambio |
|---------|--------|
| [`components/hub-nav.tsx`](../components/hub-nav.tsx) | Header `surface-header border-b border-[rgba(176,38,255,0.15)]`; enlaces `nav-link`; logo `-HUB` con `brand-accent-text`; restaurar enlace **Avisos** → `/hub/notifications` si falta |
| [`app/admin/layout.tsx`](../app/admin/layout.tsx) | Header tipo `surface-header` + enlaces `nav-link` |
| [`app/mod/layout.tsx`](../app/mod/layout.tsx) | Igual |

## 4. Páginas: quitar dorados / slate duro

Buscar en `app/` y `components/`:

- `#c9a227`, `#b8922a`, `#e8c547`, `#7a6220`, `accent-[#c9a227]`
- Sustituir por `brand-accent-text`, `text-[var(--accent)]`, o `text-[var(--text-secondary)]`
- `border-amber-*`, `bg-amber-*`, `text-amber-*` → fondos/bordes con `rgba(176,38,255,...)` o `var(--accent-soft)`

Archivos típicos: `app/page.tsx`, `app/hub/page.tsx`, `app/hub/spaces/page.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/hub/notifications/page.tsx`, `components/onboarding-form.tsx`, `components/create-post-form.tsx`, `components/report-form.tsx`, `app/mod/page.tsx`, `app/admin/users/page.tsx`.

## 5. Landing opcional con `.app-shell`

En [`app/page.tsx`](../app/page.tsx) puedes envolver el contenido en:

```tsx
<main className="app-shell mx-auto">
```

Para centrar como prototipo sin romper el resto de rutas.

## 6. [`styles.css`](../styles.css) en la raíz

Opcional: sincroniza las mismas variables `:root` para mantener un único reference kit fuera de Next.

---

**Ejecución automática:** en Cursor, modo **Agent** → “Implementa el tema según `docs/APLICAR-TEMA-BRAND.md` (Anexos A–E).”

---

## Anexo A — Pegar en `app/globals.css`

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
  --brand-red: #ff1e1e;
  --brand-blue: #1e4dff;
  --brand-purple: #b026ff;
  --brand-gradient: linear-gradient(135deg, #ff1e1e 0%, #b026ff 50%, #1e4dff 100%);
  --surface: #111111;
  --surface-dark: #0a0a0a;
  --text: #ffffff;
  --text-secondary: #a0a0a0;
  --accent: #b026ff;
  --accent-bright: #b026ff;
  --accent-soft: rgba(176, 38, 255, 0.14);
  --danger: #ff1e1e;
  --bg-gradient: radial-gradient(circle at top, #111111 0%, #0a0a0a 50%, #000000 100%);
  --border-accent: rgba(176, 38, 255, 0.25);
  --focus-ring: rgba(176, 38, 255, 0.22);
  --background: #0a0a0a;
  --foreground: #ffffff;
  font-family: var(--font-dm-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-accent: var(--accent);
  --color-danger: var(--danger);
  --font-sans: var(--font-dm-sans), system-ui, sans-serif;
  --font-display: var(--font-plus-jakarta), system-ui, sans-serif;
}

body.dark {
  --surface: #111111;
  --text: #ffffff;
  --text-secondary: #a0a0a0;
  --bg-gradient: radial-gradient(circle at top, #111111 0%, #0a0a0a 50%, #000000 100%);
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg-gradient);
  padding: 2.5rem 1.5rem;
  color: var(--text);
  transition: background 0.3s ease;
}

@media (max-width: 840px) {
  body {
    padding: 1.5rem 1rem;
  }
}

a {
  color: inherit;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.app-shell {
  width: min(1100px, 100%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-header {
  background: var(--surface);
  border-radius: 22px;
  padding: 1.75rem 2rem;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(18px);
}

.app-header h1 {
  margin: 0;
  font-size: 2.1rem;
  letter-spacing: -0.03em;
  font-family: var(--font-plus-jakarta), var(--font-dm-sans), system-ui, sans-serif;
  font-weight: 700;
}

.brand-accent,
.brand-accent-text {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.tagline {
  margin: 0.35rem 0 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.layout {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.panel {
  background: var(--surface);
  border-radius: 22px;
  padding: 1.75rem;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.surface-header {
  background: var(--surface);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(18px);
}

.nav-link {
  border-radius: 999px;
  padding: 0.25rem 0.75rem;
  color: var(--text-secondary);
  transition: background 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

.display-card {
  border-radius: 18px;
  background: var(--accent-soft);
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.display-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 1px solid rgba(176, 38, 255, 0.3);
  pointer-events: none;
}

#affirmation-text {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.5;
  text-align: center;
  max-width: 28rem;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}

#affirmation-text.visible {
  opacity: 1;
  transform: translateY(0);
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.controls-panel h2,
.lists-panel h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.control {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.control strong {
  color: var(--text);
}

input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

select,
input[type="text"],
textarea {
  border-radius: 12px;
  border: 1px solid rgba(176, 38, 255, 0.25);
  padding: 0.65rem 0.85rem;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  font-family: inherit;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

select:focus,
input[type="text"]:focus,
textarea:focus {
  outline: none;
  border-color: rgba(176, 38, 255, 0.65);
  box-shadow: 0 0 0 3px rgba(176, 38, 255, 0.22);
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.primary-button,
.secondary-button,
.danger-button {
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}

.primary-button {
  background: var(--brand-gradient);
  color: #ffffff;
  box-shadow: 0 10px 24px rgba(176, 38, 255, 0.4);
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(176, 38, 255, 0.5);
  filter: brightness(1.06);
}

.secondary-button {
  background: var(--accent-soft);
  color: #ffffff;
}

.secondary-button:hover {
  background: rgba(176, 38, 255, 0.28);
}

body.dark .secondary-button {
  color: #ffffff;
}

.danger-button {
  background: rgba(255, 30, 30, 0.18);
  color: var(--danger);
}

.danger-button:hover {
  background: rgba(255, 30, 30, 0.28);
}

.new-list {
  display: flex;
  gap: 0.75rem;
}

.new-list input {
  flex: 1;
}

.editor header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
}

.helper-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.consent-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
  z-index: 20;
}

.consent-card {
  background: var(--surface);
  padding: 2rem;
  border-radius: 22px;
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
}

.consent-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.audio-panel h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.audio-controls {
  display: flex;
  gap: 0.75rem;
}

.audio-controls button {
  flex: 1;
}

.audio-status {
  padding: 0.75rem;
  background: var(--accent-soft);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-align: center;
  min-height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

#audio-status-text {
  margin: 0;
}

.binaural-programs-panel h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.binaural-programs-panel .helper-text {
  margin-bottom: 1.2rem;
}

.program-details-card {
  margin-top: 1rem;
  background: #0a0a0a;
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(176, 38, 255, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.program-objective {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.program-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.program-meta-item strong {
  color: var(--text);
}

.program-phases {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.program-phase {
  background: var(--accent-soft);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  border: 1px solid rgba(176, 38, 255, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.program-phase-header {
  font-weight: 600;
  color: var(--text);
}

.program-phase-description {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.program-phase-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 840px) {
  .app-header {
    padding: 1.5rem;
  }

  .panel {
    padding: 1.5rem;
  }

  .display-card {
    min-height: 120px;
    padding: 1.5rem;
  }

  #affirmation-text {
    font-size: 1.2rem;
  }
}
```

## Anexo B — `components/ui/button.tsx` (archivo completo)

```tsx
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";

const variants = {
  primary:
    "bg-[linear-gradient(135deg,#FF1E1E_0%,#B026FF_50%,#1E4DFF_100%)] text-white shadow-[0_10px_24px_rgba(176,38,255,0.4)] hover:-translate-y-px hover:shadow-[0_12px_30px_rgba(176,38,255,0.5)] hover:brightness-[1.06] focus-visible:outline-[#B026FF]",
  secondary:
    "bg-[var(--accent-soft)] text-white hover:bg-[rgba(176,38,255,0.28)] focus-visible:outline-[#B026FF]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text)] focus-visible:outline-[#B026FF]",
  danger:
    "bg-[rgba(255,30,30,0.18)] text-[var(--danger)] hover:bg-[rgba(255,30,30,0.28)] focus-visible:outline-[#FF1E1E]",
} as const;

type Variant = keyof typeof variants;

export function Button({
  className,
  variant = "primary",
  href,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children?: ReactNode;
}) {
  const styles = cn(base, variants[variant], className);
  if (href) {
    return (
      <Link className={styles} href={href}>
        {children}
      </Link>
    );
  }
  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
```

## Anexo C — `components/ui/card.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-[rgba(176,38,255,0.18)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-[0_16px_32px_rgba(0,0,0,0.4)] backdrop-blur-[18px]",
        className,
      )}
      {...props}
    />
  );
}
```

## Anexo D — `components/ui/input.tsx` y `textarea.tsx`

**input.tsx**

```tsx
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-3 py-2 text-sm text-[#111827] shadow-sm transition focus:border-[rgba(176,38,255,0.65)] focus:outline-none focus:ring-[3px] focus:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
```

**textarea.tsx** (archivo completo)

```tsx
import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full resize-y rounded-xl border border-[var(--border-accent)] bg-[rgba(255,255,255,0.95)] px-3 py-2 text-sm text-[#111827] shadow-sm transition focus:border-[rgba(176,38,255,0.65)] focus:outline-none focus:ring-[3px] focus:ring-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
```

## Anexo E — `components/ui/label.tsx`

```tsx
import { cn } from "@/lib/utils";
import type { LabelHTMLAttributes } from "react";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-[var(--text)]", className)}
      {...props}
    />
  );
}
```

## Anexo F — `components/hub-nav.tsx` (referencia)

Cabecera `surface-header`, enlaces `nav-link`, sufijo `-HUB` con `brand-accent-text`, enlace **Avisos** → `/hub/notifications`:

```tsx
import Link from "next/link";
import { getMyRole } from "@/lib/auth/roles";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export async function HubNav() {
  const role = await getMyRole();
  const isMod =
    role && ["moderator", "admin", "owner"].includes(role.role);
  const isAdm = role && ["admin", "owner"].includes(role.role);

  return (
    <header className="surface-header border-b border-[rgba(176,38,255,0.15)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/hub"
          className="font-semibold tracking-tight text-[var(--text)]"
          style={{
            fontFamily: "var(--font-plus-jakarta), var(--font-dm-sans), system-ui",
          }}
        >
          RESETE<span className="brand-accent-text">-HUB</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link className="nav-link" href="/hub">Inicio</Link>
          <Link className="nav-link" href="/hub/spaces">Espacios</Link>
          <Link className="nav-link" href="/hub/resources">Recursos</Link>
          <Link className="nav-link" href="/hub/challenges">Retos</Link>
          <Link className="nav-link" href="/hub/events">Eventos</Link>
          <Link className="nav-link" href="/hub/notifications">Avisos</Link>
          <Link className="nav-link" href="/hub/settings/profile">Perfil</Link>
          {isMod ? (
            <Link className="nav-link" href="/mod">Moderación</Link>
          ) : null}
          {isAdm ? (
            <Link className="nav-link" href="/admin">Admin</Link>
          ) : null}
        </nav>
        <form action={signOutAction}>
          <Button type="submit" variant="secondary">Salir</Button>
        </form>
      </div>
    </header>
  );
}
```
