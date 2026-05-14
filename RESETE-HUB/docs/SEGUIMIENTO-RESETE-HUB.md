# Seguimiento RESETE-HUB (MVP v0.1)

**Qué es:** Centro de comunidad oficial de RESET-ORDER: registro, reglas, espacios, posts, moderación, retos, recursos y admin — según PRD y arquitectura técnica.

**Fuentes de verdad (local):**

- `PRD — RESETE-HUB.docx`
- `Arquitectura_RESET-HUB.docx`
- Código: este repo (`app/`, `supabase/migrations/`, `lib/`)

---

## Fases: objetivo y criterio de hecho

| Fase | Objetivo | Criterio de hecho |
|------|----------|-------------------|
| 0 | Fundaciones: Next, Supabase, RLS, deploy | `pnpm dev` / build OK; migraciones aplicables; clientes SSR |
| 1 | Auth, perfil, onboarding, reglas | Sin onboarding + reglas no se publica (`can_participate` + RLS) |
| 2 | Comunidad: espacios, posts, comentarios, reacciones | Miembro activo publica/interactúa; escalación bloqueada |
| 3 | Reglas estructuradas, reportes, moderación | Cola de reportes + bitácora; acciones solo mod/admin |
| 4 | Recursos, retos, eventos | Check-in, RSVP, biblioteca |
| 5 | Notificaciones, admin, métricas, launch | Dashboard admin; semilla; términos/privacidad enlazados |
| Opc. | Tokens desde `styles.css` | Tema Tailwind alineado a marca |

---

## Checklist — Fase 0

- [x] Next.js App Router + TypeScript + ESLint
- [x] Tailwind + shadcn (componentes base)
- [x] `supabase/migrations/` inicial + seed
- [x] RLS en tablas públicas + políticas para reactions, resources, challenges, events, notifications
- [x] Storage buckets + políticas avatares/recursos
- [x] `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- [x] `lib/database.types.ts` (tipos alineados al schema)
- [x] `netlify.toml` + `.env.example`
- [ ] Conectar proyecto Supabase remoto y `supabase gen types` (manual con `SUPABASE_PROJECT_ID`)

---

## Checklist — Fase 1

- [x] Rutas login / signup / callback / logout
- [x] Landing pública + enlaces términos / privacidad
- [x] Perfil editable (display_name, bio, avatar_url, ubicación opcional)
- [x] Intereses + objetivo en `profiles`
- [x] Onboarding multi-paso + aceptación de reglas (`rules_accepted_at`, `onboarding_completed`)
- [x] Middleware refresh sesión

---

## Checklist — Fase 2

- [x] `/hub` feed, `/hub/spaces`, `/hub/spaces/[slug]`, `/hub/posts/[id]`, `/hub/create`
- [x] Posts, comentarios (anidados), reacciones
- [x] Orden feed (recientes / fijados)
- [x] Semilla de espacios (SQL)
- [x] `post_type` ampliado + Zod

---

## Checklist — Fase 3

- [x] Tabla `community_rules` + UI reglas públicas
- [x] Reportes (post, comentario, usuario) + motivos
- [x] Panel `/mod` cola y resolución
- [x] Acciones moderación → `moderation_actions` + actualización `user_roles` / contenido

---

## Checklist — Fase 4

- [x] `/hub/resources` + guardados (`saved_resources`)
- [x] Retos: unirse, check-in, progreso básico
- [x] Eventos + RSVP

---

## Checklist — Fase 5

- [x] Notificaciones in-app (inserción en eventos clave)
- [x] `/admin` métricas básicas + gestión usuarios (roles)
- [x] `seed.sql` contenido semilla ampliado
- [x] README con variables y flujo local

---

## Backlog PRD (resumen)

### P0 — Imprescindible

- [x] Registro/login (Supabase Auth)
- [x] Perfil básico
- [x] Reglas + onboarding
- [x] Espacios + posts + comentarios + reacciones
- [x] Reportes + cola moderación
- [x] Roles miembro / mod / admin
- [x] Recursos
- [x] Panel admin básico
- [x] Notificaciones in-app (mínimo)
- [x] Términos + privacidad (páginas)
- [x] Logs moderación (`moderation_actions`)

### P1 — Muy importante (parcial / siguiente iteración)

- [ ] Email transaccional (Resend) + recordatorios check-in
- [ ] Búsqueda full-text dedicada
- [ ] Respuestas guardadas moderadores
- [ ] Badges
- [ ] PostHog / Sentry

### P2 — Post-MVP

- Chat 1:1, app nativa, IA moderación, LMS, pagos, etc.

---

## Decisiones abiertas

| Tema | Opciones | Estado |
|------|-----------|--------|
| `styles.css` | Tokens Tailwind vs solo referencia | Ver Fase opcional / `globals.css` |
| Texto legal México (LFPDPPP) | Revisión abogado antes de producción | Placeholder en `/terms`, `/privacy` |
| Proveedor email | Resend vs Postmark | Pendiente integración P1 |
| `getUser()` vs `getClaims()` | Alineado a `@supabase/ssr` actual | Implementado con `getUser()` en servidor |

---

## Riesgos

- **RLS:** cualquier nueva tabla debe tener políticas antes de exponer a producción.
- **Modelo vs PRD:** permisos por espacio “solo admin” pueden requerir `space_members` o flags en `spaces` en iteración futura.
- **Rate limiting:** reforzar en Edge/middleware para login y posts en producción.

---

## Log de hitos

| Fecha | Hito |
|-------|------|
| 2026-05-08 | Repo inicial Next + Supabase migrations + seguimiento MD |
| 2026-05-08 | Implementación MVP rutas hub/mod/admin, server actions, README |
