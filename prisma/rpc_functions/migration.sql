-- Drop old/new signatures to avoid conflicts when return/arg types change.
drop function if exists public.fn_area_create(text);
drop function if exists public.fn_area_update(uuid, text);
drop function if exists public.fn_area_update(text, text);
drop function if exists public.fn_area_delete(uuid);
drop function if exists public.fn_area_delete(text);
drop function if exists public.fn_area_get_by_id(uuid);
drop function if exists public.fn_area_get_by_id(text);
drop function if exists public.fn_area_list();
drop function if exists public.fn_area_get_with_projects(uuid);
drop function if exists public.fn_area_get_with_projects(text);

drop function if exists public.fn_project_create(text, uuid);
drop function if exists public.fn_project_create(text, text);
drop function if exists public.fn_project_update(uuid, text, uuid);
drop function if exists public.fn_project_update(text, text, text);
drop function if exists public.fn_project_delete(uuid);
drop function if exists public.fn_project_delete(text);
drop function if exists public.fn_project_get_by_id(uuid);
drop function if exists public.fn_project_get_by_id(text);
drop function if exists public.fn_project_list();
drop function if exists public.fn_project_get_with_blocks(uuid);
drop function if exists public.fn_project_get_with_blocks(text);

drop function if exists public.fn_block_create(text, boolean, uuid);
drop function if exists public.fn_block_create(text, boolean, text);
drop function if exists public.fn_block_update(uuid, text, boolean, uuid);
drop function if exists public.fn_block_update(text, text, boolean, text);
drop function if exists public.fn_block_delete(uuid);
drop function if exists public.fn_block_delete(text);
drop function if exists public.fn_block_get_by_id(uuid);
drop function if exists public.fn_block_get_by_id(text);
drop function if exists public.fn_block_list();
drop function if exists public.fn_block_get_by_project_id(uuid);
drop function if exists public.fn_block_get_by_project_id(text);

-- =========================
-- AREA FUNCTIONS
-- =========================

create or replace function public.fn_area_create(p_name text)
returns table (
  id text,
  name text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  insert into public.areas (name)
  values (p_name)
  returning id, name, "createdAt", "updatedAt";
$$;

create or replace function public.fn_area_update(p_id text, p_name text)
returns table (
  id text,
  name text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  update public.areas
  set name = p_name,
      "updatedAt" = now()
  where id = p_id
  returning id, name, "createdAt", "updatedAt";
$$;

create or replace function public.fn_area_delete(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.areas
  where id = p_id;
end;
$$;

create or replace function public.fn_area_get_by_id(p_id text)
returns table (
  id text,
  name text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select a.id, a.name, a."createdAt", a."updatedAt"
  from public.areas a
  where a.id = p_id;
$$;

create or replace function public.fn_area_list()
returns table (
  id text,
  name text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select a.id, a.name, a."createdAt", a."updatedAt"
  from public.areas a
  order by a."createdAt" desc;
$$;

create or replace function public.fn_area_get_with_projects(p_id text)
returns table (
  id text,
  name text,
  "createdAt" timestamp,
  "updatedAt" timestamp,
  projects jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.name,
    a."createdAt",
    a."updatedAt",
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'area_id', p.area_id,
          'createdAt', p."createdAt",
          'updatedAt', p."updatedAt"
        )
      ) filter (where p.id is not null),
      '[]'::jsonb
    ) as projects
  from public.areas a
  left join public.projects p on p.area_id = a.id
  where a.id = p_id
  group by a.id, a.name, a."createdAt", a."updatedAt";
$$;

-- =========================
-- PROJECT FUNCTIONS
-- =========================

create or replace function public.fn_project_create(p_name text, p_area_id text)
returns table (
  id text,
  name text,
  area_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  insert into public.projects (name, area_id)
  values (p_name, p_area_id)
  returning id, name, area_id, "createdAt", "updatedAt";
$$;

create or replace function public.fn_project_update(p_id text, p_name text, p_area_id text)
returns table (
  id text,
  name text,
  area_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  update public.projects
  set name = p_name,
      area_id = p_area_id,
      "updatedAt" = now()
  where id = p_id
  returning id, name, area_id, "createdAt", "updatedAt";
$$;

create or replace function public.fn_project_delete(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.projects
  where id = p_id;
end;
$$;

create or replace function public.fn_project_get_by_id(p_id text)
returns table (
  id text,
  name text,
  area_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.area_id, p."createdAt", p."updatedAt"
  from public.projects p
  where p.id = p_id;
$$;

create or replace function public.fn_project_list()
returns table (
  id text,
  name text,
  area_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.name, p.area_id, p."createdAt", p."updatedAt"
  from public.projects p
  order by p."createdAt" desc;
$$;

create or replace function public.fn_project_get_with_blocks(p_id text)
returns table (
  id text,
  name text,
  area_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp,
  blocks jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.area_id,
    p."createdAt",
    p."updatedAt",
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'title', b.title,
          'completed', b.completed,
          'project_id', b.project_id,
          'createdAt', b."createdAt",
          'updatedAt', b."updatedAt"
        )
      ) filter (where b.id is not null),
      '[]'::jsonb
    ) as blocks
  from public.projects p
  left join public.blocks b on b.project_id = p.id
  where p.id = p_id
  group by p.id, p.name, p.area_id, p."createdAt", p."updatedAt";
$$;

-- =========================
-- BLOCK FUNCTIONS
-- =========================

create or replace function public.fn_block_create(p_title text, p_completed boolean, p_project_id text)
returns table (
  id text,
  title text,
  completed boolean,
  project_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  insert into public.blocks (title, completed, project_id)
  values (p_title, p_completed, p_project_id)
  returning id, title, completed, project_id, "createdAt", "updatedAt";
$$;

create or replace function public.fn_block_update(
  p_id text,
  p_title text,
  p_completed boolean,
  p_project_id text
)
returns table (
  id text,
  title text,
  completed boolean,
  project_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  update public.blocks
  set title = p_title,
      completed = p_completed,
      project_id = p_project_id,
      "updatedAt" = now()
  where id = p_id
  returning id, title, completed, project_id, "createdAt", "updatedAt";
$$;

create or replace function public.fn_block_delete(p_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.blocks
  where id = p_id;
end;
$$;

create or replace function public.fn_block_get_by_id(p_id text)
returns table (
  id text,
  title text,
  completed boolean,
  project_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.title, b.completed, b.project_id, b."createdAt", b."updatedAt"
  from public.blocks b
  where b.id = p_id;
$$;

create or replace function public.fn_block_list()
returns table (
  id text,
  title text,
  completed boolean,
  project_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.title, b.completed, b.project_id, b."createdAt", b."updatedAt"
  from public.blocks b
  order by b."createdAt" desc;
$$;

create or replace function public.fn_block_get_by_project_id(p_project_id text)
returns table (
  id text,
  title text,
  completed boolean,
  project_id text,
  "createdAt" timestamp,
  "updatedAt" timestamp
)
language sql
security definer
set search_path = public
as $$
  select b.id, b.title, b.completed, b.project_id, b."createdAt", b."updatedAt"
  from public.blocks b
  where b.project_id = p_project_id
  order by b."createdAt" desc;
$$;

-- Ensure PostgREST picks up updated RPC signatures immediately.
notify pgrst, 'reload schema';
