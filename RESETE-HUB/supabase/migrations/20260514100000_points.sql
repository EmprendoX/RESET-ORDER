-- Sistema de puntos: +1 al autor por post, +1 por comentario, +1 cuando recibe reacción de otro.

-- 1. Columna points en profiles
alter table public.profiles
  add column if not exists points int not null default 0;

-- 2. Helper para sumar/restar puntos
create or replace function public._add_points(target_user uuid, delta int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_user is null then return; end if;
  update public.profiles
    set points = greatest(0, points + delta)
    where id = target_user;
end;
$$;

-- 3. Trigger posts: +1 al crear, -1 al borrar
create or replace function public._post_points_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    perform public._add_points(new.author_id, 1);
  elsif (tg_op = 'DELETE') then
    perform public._add_points(old.author_id, -1);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_posts_points on public.posts;
create trigger trg_posts_points
  after insert or delete on public.posts
  for each row execute function public._post_points_trigger();

-- 4. Trigger comments: igual
create or replace function public._comment_points_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    perform public._add_points(new.author_id, 1);
  elsif (tg_op = 'DELETE') then
    perform public._add_points(old.author_id, -1);
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comments_points on public.comments;
create trigger trg_comments_points
  after insert or delete on public.comments
  for each row execute function public._comment_points_trigger();

-- 5. Trigger reactions: +1 al autor del contenido reaccionado (si no es el mismo usuario)
create or replace function public._reaction_points_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_owner uuid;
  acting_user uuid;
begin
  if (tg_op = 'INSERT') then
    acting_user := new.user_id;
    if new.target_type = 'post' then
      select author_id into target_owner from public.posts where id = new.target_id;
    elsif new.target_type = 'comment' then
      select author_id into target_owner from public.comments where id = new.target_id;
    end if;
    if target_owner is not null and target_owner <> acting_user then
      perform public._add_points(target_owner, 1);
    end if;
  elsif (tg_op = 'DELETE') then
    acting_user := old.user_id;
    if old.target_type = 'post' then
      select author_id into target_owner from public.posts where id = old.target_id;
    elsif old.target_type = 'comment' then
      select author_id into target_owner from public.comments where id = old.target_id;
    end if;
    if target_owner is not null and target_owner <> acting_user then
      perform public._add_points(target_owner, -1);
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_reactions_points on public.reactions;
create trigger trg_reactions_points
  after insert or delete on public.reactions
  for each row execute function public._reaction_points_trigger();

-- 6. Backfill puntos basados en contenido existente
update public.profiles p set points =
  (select count(*) from public.posts where author_id = p.id)
  + (select count(*) from public.comments where author_id = p.id)
  + (select count(*) from public.reactions r
     where (r.target_type = 'post' and exists (
              select 1 from public.posts po
              where po.id = r.target_id
                and po.author_id = p.id
                and po.author_id <> r.user_id))
        or (r.target_type = 'comment' and exists (
              select 1 from public.comments co
              where co.id = r.target_id
                and co.author_id = p.id
                and co.author_id <> r.user_id)));
