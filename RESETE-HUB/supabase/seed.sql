-- Seed espacios y reglas (ejecutar tras migraciones, p. ej. `supabase db reset` o SQL editor)
insert into public.spaces (name, slug, description, only_admin_posts)
values
  ('Bienvenida', 'bienvenida', 'Mensajes de bienvenida y orientación inicial.', false),
  ('Presentaciones', 'presentaciones', 'Cuéntanos quién eres y qué buscas en RESET-ORDER.', false),
  ('Guía para empezar', 'guia-para-empezar', 'Pasos y hábitos sugeridos para entrar en ritmo.', false),
  ('Preguntas frecuentes', 'preguntas-frecuentes', 'Dudas comunes y respuestas oficiales.', false),
  ('Anuncios oficiales', 'anuncios-oficiales', 'Comunicados del equipo RESET-ORDER.', true),
  ('Reset del día', 'reset-del-dia', 'Pregunta o check-in diario de la comunidad.', false),
  ('Retos RESET-ORDER', 'retos-reset-order', 'Retos de 7, 14 o 30 días y accountability.', false),
  ('Preguntas y ayuda', 'preguntas-y-ayuda', 'Dudas generales y apoyo entre miembros.', false),
  ('Recursos', 'recursos', 'Guías, plantillas y enlaces oficiales.', false),
  ('Feedback', 'feedback', 'Sugerencias para mejorar RESETE-HUB.', false)
on conflict (slug) do nothing;

insert into public.community_rules (title, description, report_reason, severity, sort_order)
values
  (
    'Respeto primero',
    'No ataques personales, burlas, insultos ni discriminación.',
    'Falta de respeto o discriminación',
    'high',
    1
  ),
  (
    'Cero spam',
    'No autopromoción, enlaces sospechosos ni captación sin permiso.',
    'Spam o autopromoción',
    'high',
    2
  ),
  (
    'Comparte desde tu experiencia',
    'No vendas consejos médicos, legales o financieros como verdad absoluta.',
    'Consejo no solicitado o riesgoso',
    'medium',
    3
  ),
  (
    'Privacidad',
    'No publiques datos personales tuyos ni de terceros.',
    'Información personal',
    'high',
    4
  ),
  (
    'Orden en los espacios',
    'Publica en el espacio correcto para que todos encuentren el contenido.',
    'Contenido fuera de tema',
    'low',
    5
  ),
  (
    'No contenido dañino',
    'Nada de acoso, amenazas, manipulación o contenido sexual explícito.',
    'Contenido dañino o acoso',
    'high',
    6
  ),
  (
    'Decisiones de moderación',
    'El equipo puede advertir, silenciar o expulsar según la gravedad.',
    'Incumple normas de moderación',
    'medium',
    7
  );
