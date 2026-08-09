-- StoryTree: the climbing tree.
--
-- One shared tree. Everything about how it looks is derived from `idx` and the
-- total post count, so this table is the entire state of the product.
--
-- Run this in the Supabase SQL editor. It does not touch the existing story
-- tables — those stay in place as a fallback demo.

create table posts (
  id           uuid primary key default gen_random_uuid(),
  -- 1-based and gap-free. Drives branch position, tree height, the climber's
  -- height, the colour phase, and when a milestone fires.
  idx          integer not null,
  kind         text not null,              -- 'text' | 'photo'
  body         text,                       -- the note, or the photo's caption
  image_url    text,                       -- storage URL, photo posts only
  author_hash  text,                       -- salted IP hash; forensics only
  is_hidden    boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Two people posting at the same moment cannot take the same position on the
-- tree. The insert path catches 23505 and retries with the next index.
create unique index posts_idx_uniq on posts (idx);

create index posts_created_idx on posts (created_at desc);
create index posts_visible_idx on posts (is_hidden, idx desc);

alter table posts enable row level security;
-- No policies = anon and authenticated are denied. Server-side only.

grant usage on schema public to service_role;
grant all privileges on table public.posts to service_role;
grant usage, select on all sequences in schema public to service_role;
