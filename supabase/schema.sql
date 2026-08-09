-- PREVIOUS VERSION. This is the schema for the branching lost-property story,
-- which is kept as a working fallback at /n/[id]. It is already applied.
--
-- The current product is the climbing tree: see supabase/tree.sql.
-- Do not run this file again; it would fail on tables that already exist.

create extension if not exists "pgcrypto";

create table objects (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  material          text,
  condition         text,
  mood              text not null,          -- enum, see art grid
  dominant_color    text not null,          -- enum, see art grid
  contributor_hash  text,                   -- salted IP hash; forensics only
  is_hidden         boolean not null default false,
  created_at        timestamptz not null default now()
);

create table nodes (
  id                   uuid primary key default gen_random_uuid(),
  parent_id            uuid references nodes(id) on delete cascade,
  slot_index           smallint,             -- which of parent's pending_choices this filled
  depth                integer not null default 0,
  prose                text not null,
  pending_choices      text[] not null,      -- exactly 2 labels for children not yet written
  object_id            uuid references objects(id),        -- object introduced here
  leaked_object_id     uuid references objects(id),        -- object that surfaced unexplained
  ancestor_object_ids  uuid[] not null default '{}',       -- for O(1) leak exclusion
  art_asset            text not null,        -- manifest key
  visit_count          integer not null default 0,
  is_hidden            boolean not null default false,
  created_at           timestamptz not null default now()
);

-- The race guard. Two simultaneous taps on the same unwritten choice
-- cannot produce two siblings.
create unique index nodes_parent_slot_uniq
  on nodes (parent_id, slot_index)
  where parent_id is not null;

create index nodes_parent_idx     on nodes (parent_id);
create index nodes_canon_idx      on nodes (parent_id, visit_count desc);
create index objects_created_idx  on objects (created_at desc);

create table rate_events (
  id         bigserial primary key,
  ip_hash    text not null,
  kind       text not null,        -- 'generate' | 'contribute'
  created_at timestamptz not null default now()
);
create index rate_events_lookup on rate_events (ip_hash, kind, created_at desc);

-- Everything goes through the service-role key server-side.
-- Lock the anon key out entirely.
alter table nodes       enable row level security;
alter table objects     enable row level security;
alter table rate_events enable row level security;
-- No policies created = deny all for anon/authenticated.

-- RLS and table privileges are two separate gates, and enabling the first does
-- not open the second. Without these grants every server-side query fails with
-- "permission denied for table nodes" — which looks nothing like an RLS denial
-- (that returns zero rows, not an error).
--
-- Granting to service_role ONLY is deliberate: anon and authenticated get no
-- privileges at all, so the anon key is locked out by both gates.
grant usage on schema public to service_role;

grant all privileges on table public.nodes, public.objects, public.rate_events
  to service_role;

-- rate_events.id is bigserial, so inserts need the sequence too.
grant usage, select on all sequences in schema public to service_role;
