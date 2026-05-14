-- RESETE-HUB MVP schema + RLS + storage
create extension if not exists citext;

create type public.app_role as enum (
  'member',
  'verified',
  'mentor',
  'moderator',
  'admin',
  'owner'
);

create type public.user_status as enum (
  'active',
  'under_review',
  'muted',
  'suspended',
  'banned'
);

create type public.content_status as enum (
  'published',
  'hidden',
  'removed'
);

create type public.report_status as enum (
  'pending',
  'reviewing',
  'resolved',
  'dismissed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext unique,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_url text,
  bio text check (char_length(coalesce(bio, '')) <= 500),
  country text,
  city text,
  interests text[] not null default '{}',
  goal text,
  onboarding_completed boolean not null default false,
  rules_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  status public.user_status not null default 'active',
  updated_at timestamptz not null default now()
);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  description text,
  only_admin_posts boolean not null default false,
  is_archived boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.community_rules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  report_reason text not null,
  severity text not null default 'medium',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 160),
  body text not null check (char_length(body) between 1 and 8000),
  post_type text not null default 'discussion' check (
    post_type in (
      'discussion',
      'question',
      'progress',
      'resource',
      'reflection',
      'challenge',
      'help'
    )
  ),
  status public.content_status not null default 'published',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  parent_comment_id uuid references public.comments(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment')),
  target_id uuid not null,
  emoji text not null check (char_length(emoji) <= 16),
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id, emoji)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id uuid not null,
  rule_id uuid references public.community_rules(id),
  reason text not null,
  details text,
  status public.report_status not null default 'pending',
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  moderator_id uuid not null references auth.users(id),
  target_type text not null check (target_type in ('post', 'comment', 'user', 'report')),
  target_id uuid not null,
  action text not null,
  reason text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  url text,
  storage_path text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.saved_resources (
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, resource_id)
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug citext not null unique,
  description text not null,
  starts_at date,
  ends_at date,
  created_by uuid references auth.users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.challenge_members (
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.challenge_checkins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null default (timezone('utc', now()))::date,
  is_done boolean not null default true,
  note text check (char_length(coalesce(note, '')) <= 1000),
  created_at timestamptz not null default now(),
  unique (challenge_id, user_id, checkin_date)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  external_url text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('going', 'maybe', 'not_going')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Permission helpers
create or replace function public.is_active(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and status in ('active', 'under_review')
  );
$$;

create or replace function public.is_moderator(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role in ('moderator', 'admin', 'owner')
      and status in ('active', 'under_review')
  );
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role in ('admin', 'owner')
      and status in ('active', 'under_review')
  );
$$;

create or replace function public.can_participate(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.user_roles r on r.user_id = p.id
    where p.id = _user_id
      and p.onboarding_completed = true
      and p.rules_accepted_at is not null
      and r.status = 'active'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    case
      when char_length(trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''))) >= 2
        then left(trim(new.raw_user_meta_data ->> 'display_name'), 80)
      when char_length(nullif(split_part(new.email, '@', 1), '')) >= 2
        then left(split_part(new.email, '@', 1), 80)
      else 'Miembro'
    end
  );

  insert into public.user_roles (user_id, role, status)
  values (new.id, 'member', 'active');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.spaces enable row level security;
alter table public.community_rules enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.resources enable row level security;
alter table public.saved_resources enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.challenge_checkins enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.notifications enable row level security;

-- profiles
create policy profiles_select_active_members
on public.profiles for select to authenticated
using (public.is_active(auth.uid()) or public.is_moderator(auth.uid()));

create policy profiles_update_self
on public.profiles for update to authenticated
using (id = auth.uid() and public.is_active(auth.uid()))
with check (id = auth.uid());

-- user_roles
create policy roles_select_self_or_mod
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.is_moderator(auth.uid()));

create policy roles_update_admin_only
on public.user_roles for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- community_rules
create policy community_rules_select
on public.community_rules for select to authenticated
using (public.is_active(auth.uid()));

create policy community_rules_insert_admin
on public.community_rules for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy community_rules_update_admin
on public.community_rules for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy community_rules_delete_admin
on public.community_rules for delete to authenticated
using (public.is_admin(auth.uid()));

-- spaces
create policy spaces_select_active_members
on public.spaces for select to authenticated
using (is_archived = false and public.is_active(auth.uid()));

create policy spaces_insert_admin
on public.spaces for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy spaces_update_admin
on public.spaces for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- posts
create policy posts_select_visible
on public.posts for select to authenticated
using (
  (status = 'published' and public.is_active(auth.uid()))
  or public.is_moderator(auth.uid())
);

create policy posts_insert_participating_user
on public.posts for insert to authenticated
with check (
  author_id = auth.uid()
  and status = 'published'
  and pinned = false
  and (public.can_participate(auth.uid()) or public.is_admin(auth.uid()))
  and exists (
    select 1 from public.spaces s
    where s.id = space_id
      and s.is_archived = false
      and (
        not s.only_admin_posts
        or public.is_admin(auth.uid())
      )
  )
);

create policy posts_update_own
on public.posts for update to authenticated
using (
  author_id = auth.uid()
  and (public.can_participate(auth.uid()) or public.is_admin(auth.uid()))
)
with check (
  author_id = auth.uid()
  and pinned = false
  and status in ('published', 'removed', 'hidden')
);

create policy posts_update_moderator
on public.posts for update to authenticated
using (public.is_moderator(auth.uid()))
with check (public.is_moderator(auth.uid()));

create policy posts_delete_own
on public.posts for delete to authenticated
using (
  author_id = auth.uid()
  and (public.can_participate(auth.uid()) or public.is_admin(auth.uid()))
);

-- comments
create policy comments_select_visible
on public.comments for select to authenticated
using (
  (status = 'published' and public.is_active(auth.uid()))
  or public.is_moderator(auth.uid())
);

create policy comments_insert_participating_user
on public.comments for insert to authenticated
with check (
  author_id = auth.uid()
  and status = 'published'
  and (public.can_participate(auth.uid()) or public.is_admin(auth.uid()))
);

create policy comments_update_own
on public.comments for update to authenticated
using (author_id = auth.uid() and status = 'published' and (public.can_participate(auth.uid()) or public.is_admin(auth.uid())))
with check (author_id = auth.uid() and status in ('published', 'removed', 'hidden'));

create policy comments_update_moderator
on public.comments for update to authenticated
using (public.is_moderator(auth.uid()))
with check (public.is_moderator(auth.uid()));

create policy comments_delete_own
on public.comments for delete to authenticated
using (author_id = auth.uid() and (public.can_participate(auth.uid()) or public.is_admin(auth.uid())));

-- reactions
create policy reactions_select
on public.reactions for select to authenticated
using (public.is_active(auth.uid()));

create policy reactions_insert_self
on public.reactions for insert to authenticated
with check (
  user_id = auth.uid()
  and (public.can_participate(auth.uid()) or public.is_admin(auth.uid()))
);

create policy reactions_delete_self
on public.reactions for delete to authenticated
using (user_id = auth.uid());

-- reports
create policy reports_insert_member
on public.reports for insert to authenticated
with check (reporter_id = auth.uid() and public.is_active(auth.uid()));

create policy reports_select_owner_or_mod
on public.reports for select to authenticated
using (reporter_id = auth.uid() or public.is_moderator(auth.uid()));

create policy reports_update_moderator
on public.reports for update to authenticated
using (public.is_moderator(auth.uid()))
with check (public.is_moderator(auth.uid()));

-- moderation_actions
create policy moderation_actions_select_moderator
on public.moderation_actions for select to authenticated
using (public.is_moderator(auth.uid()));

create policy moderation_actions_insert_moderator
on public.moderation_actions for insert to authenticated
with check (moderator_id = auth.uid() and public.is_moderator(auth.uid()));

-- resources
create policy resources_select
on public.resources for select to authenticated
using (public.is_active(auth.uid()));

create policy resources_write_admin
on public.resources for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy resources_update_admin
on public.resources for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

create policy resources_delete_admin
on public.resources for delete to authenticated
using (public.is_admin(auth.uid()));

-- saved_resources
create policy saved_select_own
on public.saved_resources for select to authenticated
using (user_id = auth.uid());

create policy saved_insert_own
on public.saved_resources for insert to authenticated
with check (user_id = auth.uid() and public.is_active(auth.uid()));

create policy saved_delete_own
on public.saved_resources for delete to authenticated
using (user_id = auth.uid());

-- challenges
create policy challenges_select
on public.challenges for select to authenticated
using (public.is_active(auth.uid()));

create policy challenges_write_admin
on public.challenges for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy challenges_update_admin
on public.challenges for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- challenge_members
create policy challenge_members_select
on public.challenge_members for select to authenticated
using (public.is_active(auth.uid()));

create policy challenge_members_insert_self
on public.challenge_members for insert to authenticated
with check (user_id = auth.uid() and (public.can_participate(auth.uid()) or public.is_admin(auth.uid())));

-- challenge_checkins
create policy challenge_checkins_select
on public.challenge_checkins for select to authenticated
using (
  user_id = auth.uid()
  or public.is_moderator(auth.uid())
);

create policy challenge_checkins_insert_self
on public.challenge_checkins for insert to authenticated
with check (user_id = auth.uid() and (public.can_participate(auth.uid()) or public.is_admin(auth.uid())));

create policy challenge_checkins_update_self
on public.challenge_checkins for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- events
create policy events_select
on public.events for select to authenticated
using (public.is_active(auth.uid()));

create policy events_write_admin
on public.events for insert to authenticated
with check (public.is_admin(auth.uid()));

create policy events_update_admin
on public.events for update to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- event_rsvps
create policy event_rsvps_select
on public.event_rsvps for select to authenticated
using (public.is_active(auth.uid()));

create policy event_rsvps_upsert_self
on public.event_rsvps for insert to authenticated
with check (user_id = auth.uid() and public.is_active(auth.uid()));

create policy event_rsvps_update_self
on public.event_rsvps for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- notifications (inserts via service role / admin client)
create policy notifications_select_own
on public.notifications for select to authenticated
using (user_id = auth.uid());

create policy notifications_update_own
on public.notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Storage
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resources', 'resources', false)
on conflict (id) do nothing;

create policy avatars_public_read
on storage.objects for select to public
using (bucket_id = 'avatars');

create policy avatars_insert_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatars_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy resources_files_select
on storage.objects for select to authenticated
using (bucket_id = 'resources' and public.is_active(auth.uid()));

create policy resources_files_insert_admin
on storage.objects for insert to authenticated
with check (bucket_id = 'resources' and public.is_admin(auth.uid()));

create policy resources_files_update_admin
on storage.objects for update to authenticated
using (bucket_id = 'resources' and public.is_admin(auth.uid()))
with check (bucket_id = 'resources' and public.is_admin(auth.uid()));

create policy resources_files_delete_admin
on storage.objects for delete to authenticated
using (bucket_id = 'resources' and public.is_admin(auth.uid()));
