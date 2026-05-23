-- Espacio "General": destino por defecto para publicar desde el home del hub,
-- para que los miembros no estén obligados a elegir un tema. Additivo e idempotente.
insert into public.spaces (name, slug, description, only_admin_posts)
values
  ('General', 'general', 'Conversación general de la comunidad — comparte lo que quieras.', false)
on conflict (slug) do nothing;
