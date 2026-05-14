# RESETE-HUB

Comunidad oficial **RESET-ORDER** (MVP): Next.js App Router + Supabase + Netlify (según arquitectura del repo).

## Requisitos

- Node 22 (recomendado)
- Proyecto en [Supabase](https://supabase.com/) con Auth por email/contraseña
- Variables de entorno (copia `.env.example` → `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # servidor: notificaciones a moderadores y ops admin
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

En Supabase Auth → URL Configuration, añade:

- Site URL: tu dominio Netlify o `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback/**`, previews Netlify, etc.

## Base de datos

1. Instala la CLI de Supabase si la quieres usar en local: [documentación](https://supabase.com/docs/guides/cli).
2. Aplica migraciones desde [`supabase/migrations/20260508000000_init.sql`](supabase/migrations/20260508000000_init.sql) al proyecto (SQL Editor o `supabase db push`).
3. Ejecuta [`supabase/seed.sql`](supabase/seed.sql) para espacios y reglas iniciales.

**Promover al primer admin:** tras registrarte, en SQL Editor:

```sql
update public.user_roles set role = 'owner' where user_id = 'TU_UUID_DE_AUTH_USERS';
```

(Solo en entorno controlado.)

## Scripts

```bash
npm run dev        # desarrollo (Turbopack)
npm run build      # producción
npm run lint
npm run typecheck
npm run supabase:types   # requiere SUPABASE_PROJECT_ID y CLI
```

## Seguimiento del proyecto

Checklist operativo: [`docs/SEGUIMIENTO-RESETE-HUB.md`](docs/SEGUIMIENTO-RESETE-HUB.md).

## Notas

- La seguridad efectiva está en **RLS** de Postgres; el UI solo oculta acciones.
- Sin `SUPABASE_SERVICE_ROLE_KEY`, las notificaciones automáticas a moderadores no se insertan (se ignora el error).
- Revisa textos legales en `/terms` y `/privacy` antes de producción.
