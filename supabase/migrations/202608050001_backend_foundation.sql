-- SoulScope backend foundation migration.
-- Status: proposed architecture implementation scaffold, not Canon.
-- This migration implements ownership, account policy acceptance history,
-- prompts, scan lifecycle, prompt captures, audit events, and RLS only.
-- Raw audio is not retained by default; audio storage buckets are not created here.
-- No scientific inference, scoring, narrative generation, or Resonance Signature rendering is implemented.

create extension if not exists pgcrypto;

create type public.policy_type as enum (
  'terms_of_service',
  'privacy_policy'
);

create type public.prompt_set_status as enum (
  'draft',
  'active',
  'retired'
);

create type public.prompt_canonical_key as enum (
  'opening_reference',
  'demanding_reflection',
  'hope_future_orientation'
);

create type public.scan_lifecycle_state as enum (
  'created',
  'capturing',
  'capture_complete',
  'queued',
  'extracting',
  'evidence_ready',
  'finalizing',
  'finalized',
  'failed',
  'cancelled',
  'deleted'
);

create type public.capture_status as enum (
  'pending',
  'recording',
  'uploaded',
  'processed',
  'rejected',
  'failed',
  'cancelled'
);

create type public.capture_upload_status as enum (
  'not_started',
  'uploading',
  'uploaded',
  'failed',
  'deleted'
);

create type public.signal_quality_status as enum (
  'not_checked',
  'acceptable',
  'limited',
  'rejected'
);

create type public.audit_actor_type as enum (
  'user',
  'service',
  'system'
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'User-owned profile data only. Passwords and authentication secrets are never stored here.';

create table public.policy_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_type public.policy_type not null,
  policy_version text not null,
  accepted_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint policy_acceptances_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint policy_acceptances_unique_version
    unique (user_id, policy_type, policy_version)
);

comment on table public.policy_acceptances is
  'Append-only account-level policy acceptance history. Account creation and policy-enforcement APIs will use this table later; this migration only stores versioned acceptance history.';

create table public.prompt_sets (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  status public.prompt_set_status not null,
  name text not null,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

comment on table public.prompt_sets is
  'Versioned prompt-set metadata. Prompt wording and order are versioned and controlled by backend governance.';

create table public.prompt_definitions (
  id uuid primary key default gen_random_uuid(),
  prompt_set_id uuid not null references public.prompt_sets(id) on delete restrict,
  canonical_key public.prompt_canonical_key not null,
  prompt_order integer not null,
  title text not null,
  prompt_text text not null,
  expected_duration_seconds integer not null,
  created_at timestamptz not null default now(),
  constraint prompt_definitions_order_check
    check (prompt_order between 1 and 3),
  constraint prompt_definitions_expected_duration_check
    check (expected_duration_seconds > 0),
  constraint prompt_definitions_order_unique
    unique (prompt_set_id, prompt_order),
  constraint prompt_definitions_key_unique
    unique (prompt_set_id, canonical_key),
  constraint prompt_definitions_id_order_unique
    unique (id, prompt_order)
);

comment on table public.prompt_definitions is
  'Three launch prompt definitions only: opening reference, demanding reflection, and hope/future orientation.';

comment on column public.prompt_definitions.prompt_text is
  'Placeholder wording is not production wording. Owner-approved wording is required before production.';

create table public.scan_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_set_id uuid not null references public.prompt_sets(id) on delete restrict,
  lifecycle_state public.scan_lifecycle_state not null default 'created',
  current_prompt_order integer,
  failure_code text,
  failure_detail text,
  created_at timestamptz not null default now(),
  capture_completed_at timestamptz,
  finalized_at timestamptz,
  cancelled_at timestamptz,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint scan_sessions_current_prompt_order_check
    check (current_prompt_order is null or current_prompt_order between 1 and 3)
);

comment on table public.scan_sessions is
  'User-owned scan sessions. Lifecycle state is server-controlled through transition functions and audit events.';

comment on column public.scan_sessions.lifecycle_state is
  'Server-controlled state. Clients request transitions; clients must not assign arbitrary lifecycle states.';

create table public.scan_prompt_captures (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete cascade,
  prompt_definition_id uuid not null,
  prompt_order integer not null,
  capture_status public.capture_status not null default 'pending',
  duration_ms integer,
  upload_status public.capture_upload_status not null default 'not_started',
  signal_quality_status public.signal_quality_status not null default 'not_checked',
  rejection_reason text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint scan_prompt_captures_prompt_fk
    foreign key (prompt_definition_id, prompt_order)
    references public.prompt_definitions(id, prompt_order)
    on delete restrict,
  constraint scan_prompt_captures_one_per_prompt_order
    unique (scan_id, prompt_order),
  constraint scan_prompt_captures_prompt_order_check
    check (prompt_order between 1 and 3),
  constraint scan_prompt_captures_duration_check
    check (duration_ms is null or duration_ms >= 0),
  constraint scan_prompt_captures_completion_check
    check (
      (capture_status in ('pending', 'recording') and completed_at is null)
      or (capture_status in ('uploaded', 'processed', 'rejected', 'failed', 'cancelled') and completed_at is not null)
    ),
  constraint scan_prompt_captures_rejection_reason_check
    check (
      (capture_status = 'rejected' and rejection_reason is not null)
      or (capture_status <> 'rejected' and rejection_reason is null)
    )
);

comment on table public.scan_prompt_captures is
  'User-owned prompt capture workflow rows. Processing and rejection outcomes are privileged and not client-controlled.';

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  scan_id uuid references public.scan_sessions(id) on delete set null,
  event_type text not null,
  actor_type public.audit_actor_type not null,
  actor_id uuid,
  previous_state public.scan_lifecycle_state,
  next_state public.scan_lifecycle_state,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_events_details_object_check
    check (jsonb_typeof(details) = 'object')
);

comment on table public.audit_events is
  'Append-only audit history for ownership, lifecycle, capture, and deletion events.';

create index policy_acceptances_user_id_idx on public.policy_acceptances (user_id);
create index scan_sessions_user_id_idx on public.scan_sessions (user_id);
create index scan_sessions_prompt_set_id_idx on public.scan_sessions (prompt_set_id);
create index scan_sessions_lifecycle_state_idx on public.scan_sessions (lifecycle_state);
create index scan_prompt_captures_scan_id_idx on public.scan_prompt_captures (scan_id);
create index scan_prompt_captures_prompt_definition_id_idx on public.scan_prompt_captures (prompt_definition_id);
create index audit_events_scan_id_idx on public.audit_events (scan_id);
create index audit_events_user_id_idx on public.audit_events (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger scan_sessions_set_updated_at
before update on public.scan_sessions
for each row execute function public.set_updated_at();

create trigger scan_prompt_captures_set_updated_at
before update on public.scan_prompt_captures
for each row execute function public.set_updated_at();

create function public.validate_scan_prompt_capture()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  scan_prompt_set_id uuid;
  definition_prompt_set_id uuid;
  definition_order integer;
begin
  select prompt_set_id
    into scan_prompt_set_id
    from public.scan_sessions
   where id = new.scan_id;

  if scan_prompt_set_id is null then
    raise exception 'scan not found for capture %', new.id
      using errcode = '23503';
  end if;

  select prompt_set_id, prompt_order
    into definition_prompt_set_id, definition_order
    from public.prompt_definitions
   where id = new.prompt_definition_id;

  if definition_prompt_set_id is null then
    raise exception 'prompt definition not found for capture %', new.id
      using errcode = '23503';
  end if;

  if definition_prompt_set_id <> scan_prompt_set_id then
    raise exception 'prompt definition does not belong to scan prompt set'
      using errcode = '23514';
  end if;

  if definition_order <> new.prompt_order then
    raise exception 'prompt order does not match prompt definition'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger scan_prompt_captures_validate_prompt
before insert or update of scan_id, prompt_definition_id, prompt_order
on public.scan_prompt_captures
for each row execute function public.validate_scan_prompt_capture();

create function public.transition_scan_lifecycle(
  requested_scan_id uuid,
  requested_next_state public.scan_lifecycle_state,
  transition_details jsonb default '{}'::jsonb
)
returns public.scan_sessions
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_scan public.scan_sessions%rowtype;
  previous_lifecycle_state public.scan_lifecycle_state;
  caller_user_id uuid := auth.uid();
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  transition_allowed boolean := false;
begin
  if jsonb_typeof(transition_details) <> 'object' then
    raise exception 'transition details must be a JSON object'
      using errcode = '22023';
  end if;

  select *
    into locked_scan
    from public.scan_sessions
   where id = requested_scan_id
   for update;

  if not found then
    raise exception 'scan not found'
      using errcode = '02000';
  end if;

  if locked_scan.lifecycle_state = 'deleted' then
    raise exception 'deleted scans cannot transition'
      using errcode = '23514';
  end if;

  previous_lifecycle_state := locked_scan.lifecycle_state;

  if not caller_is_service then
    if caller_user_id is null or caller_user_id <> locked_scan.user_id then
      raise exception 'not authorized to transition this scan'
        using errcode = '42501';
    end if;
  end if;

  transition_allowed :=
    (locked_scan.lifecycle_state = 'created' and requested_next_state in ('capturing', 'cancelled', 'deleted'))
    or (locked_scan.lifecycle_state = 'capturing' and requested_next_state in ('capture_complete', 'failed', 'cancelled', 'deleted'))
    or (locked_scan.lifecycle_state = 'capture_complete' and requested_next_state in ('queued', 'failed', 'cancelled', 'deleted'))
    or (locked_scan.lifecycle_state = 'queued' and requested_next_state in ('extracting', 'failed', 'cancelled', 'deleted'))
    or (locked_scan.lifecycle_state = 'extracting' and requested_next_state in ('evidence_ready', 'failed', 'deleted'))
    or (locked_scan.lifecycle_state = 'evidence_ready' and requested_next_state in ('finalizing', 'failed', 'deleted'))
    or (locked_scan.lifecycle_state = 'finalizing' and requested_next_state in ('finalized', 'failed', 'deleted'))
    or (locked_scan.lifecycle_state = 'finalized' and requested_next_state = 'deleted')
    or (locked_scan.lifecycle_state in ('failed', 'cancelled') and requested_next_state = 'deleted');

  if not transition_allowed then
    raise exception 'invalid scan lifecycle transition from % to %',
      locked_scan.lifecycle_state,
      requested_next_state
      using errcode = '23514';
  end if;

  update public.scan_sessions
     set lifecycle_state = requested_next_state,
         capture_completed_at = case
           when requested_next_state = 'capture_complete' and capture_completed_at is null then now()
           else capture_completed_at
         end,
         finalized_at = case
           when requested_next_state = 'finalized' and finalized_at is null then now()
           else finalized_at
         end,
         cancelled_at = case
           when requested_next_state = 'cancelled' and cancelled_at is null then now()
           else cancelled_at
         end,
         deleted_at = case
           when requested_next_state = 'deleted' and deleted_at is null then now()
           else deleted_at
         end
   where id = requested_scan_id
   returning * into locked_scan;

  insert into public.audit_events (
    user_id,
    scan_id,
    event_type,
    actor_type,
    actor_id,
    previous_state,
    next_state,
    details
  )
  values (
    locked_scan.user_id,
    locked_scan.id,
    'scan.lifecycle_transition',
    case when caller_is_service then 'service'::public.audit_actor_type else 'user'::public.audit_actor_type end,
    case when caller_is_service then null else caller_user_id end,
    previous_lifecycle_state,
    requested_next_state,
    transition_details
  );

  return locked_scan;
end;
$$;

comment on function public.transition_scan_lifecycle(uuid, public.scan_lifecycle_state, jsonb) is
  'Server-controlled scan lifecycle transition function. It validates ownership, locks the scan row, applies bounded transitions, and appends audit events.';

alter table public.profiles enable row level security;
alter table public.policy_acceptances enable row level security;
alter table public.prompt_sets enable row level security;
alter table public.prompt_definitions enable row level security;
alter table public.scan_sessions enable row level security;
alter table public.scan_prompt_captures enable row level security;
alter table public.audit_events enable row level security;

alter table public.profiles force row level security;
alter table public.policy_acceptances force row level security;
alter table public.prompt_sets force row level security;
alter table public.prompt_definitions force row level security;
alter table public.scan_sessions force row level security;
alter table public.scan_prompt_captures force row level security;
alter table public.audit_events force row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "policy_acceptances_select_own"
on public.policy_acceptances
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "policy_acceptances_insert_own"
on public.policy_acceptances
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "prompt_sets_select_authenticated"
on public.prompt_sets
for select
to authenticated
using (true);

create policy "prompt_definitions_select_authenticated"
on public.prompt_definitions
for select
to authenticated
using (true);

create policy "scan_sessions_select_own"
on public.scan_sessions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "scan_sessions_insert_own_created"
on public.scan_sessions
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and lifecycle_state = 'created'
  and current_prompt_order is null
  and failure_code is null
  and failure_detail is null
  and exists (
    select 1
      from public.prompt_sets
     where prompt_sets.id = scan_sessions.prompt_set_id
       and prompt_sets.status = 'active'
  )
  and capture_completed_at is null
  and finalized_at is null
  and cancelled_at is null
  and deleted_at is null
);

create policy "scan_prompt_captures_select_own_scan"
on public.scan_prompt_captures
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_prompt_captures.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "scan_prompt_captures_insert_safe_client_workflow"
on public.scan_prompt_captures
for insert
to authenticated
with check (
  capture_status in ('pending', 'recording', 'uploaded', 'failed', 'cancelled')
  and signal_quality_status = 'not_checked'
  and rejection_reason is null
  and exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_prompt_captures.scan_id
       and scan_sessions.user_id = (select auth.uid())
       and scan_sessions.lifecycle_state in ('created', 'capturing')
  )
);

create policy "scan_prompt_captures_update_safe_client_workflow"
on public.scan_prompt_captures
for update
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_prompt_captures.scan_id
       and scan_sessions.user_id = (select auth.uid())
       and scan_sessions.lifecycle_state not in ('finalized', 'deleted')
  )
)
with check (
  capture_status in ('pending', 'recording', 'uploaded', 'failed', 'cancelled')
  and signal_quality_status = 'not_checked'
  and rejection_reason is null
  and exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_prompt_captures.scan_id
       and scan_sessions.user_id = (select auth.uid())
       and scan_sessions.lifecycle_state not in ('finalized', 'deleted')
  )
);

create policy "audit_events_select_own_scan"
on public.audit_events
for select
to authenticated
using (
  scan_id is not null
  and exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = audit_events.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on function public.transition_scan_lifecycle(uuid, public.scan_lifecycle_state, jsonb) from public;
revoke all on function public.set_updated_at() from public;
revoke all on function public.validate_scan_prompt_capture() from public;
grant execute on function public.transition_scan_lifecycle(uuid, public.scan_lifecycle_state, jsonb) to authenticated, service_role;

grant usage on schema public to authenticated, service_role;
grant usage on type public.policy_type to authenticated, service_role;
grant usage on type public.prompt_set_status to authenticated, service_role;
grant usage on type public.prompt_canonical_key to authenticated, service_role;
grant usage on type public.scan_lifecycle_state to authenticated, service_role;
grant usage on type public.capture_status to authenticated, service_role;
grant usage on type public.capture_upload_status to authenticated, service_role;
grant usage on type public.signal_quality_status to authenticated, service_role;
grant usage on type public.audit_actor_type to authenticated, service_role;

grant select, insert, update (display_name, timezone, updated_at) on public.profiles to authenticated;
grant select, insert on public.policy_acceptances to authenticated;
grant select on public.prompt_sets to authenticated;
grant select on public.prompt_definitions to authenticated;
grant select on public.scan_sessions to authenticated;
grant insert (user_id, prompt_set_id) on public.scan_sessions to authenticated;
grant select on public.scan_prompt_captures to authenticated;
grant insert (
  scan_id,
  prompt_definition_id,
  prompt_order,
  capture_status,
  duration_ms,
  upload_status,
  completed_at
) on public.scan_prompt_captures to authenticated;
grant update (
  capture_status,
  duration_ms,
  upload_status,
  completed_at
) on public.scan_prompt_captures to authenticated;
grant select on public.audit_events to authenticated;

grant all on public.profiles to service_role;
grant all on public.policy_acceptances to service_role;
grant all on public.prompt_sets to service_role;
grant all on public.prompt_definitions to service_role;
grant all on public.scan_sessions to service_role;
grant all on public.scan_prompt_captures to service_role;
grant all on public.audit_events to service_role;

-- Placeholder wording below preserves the approved canonical intent only.
-- Owner-approved production prompt wording is required before production use.
with launch_prompt_set as (
  insert into public.prompt_sets (version, status, name, activated_at)
  values ('launch-v1', 'active', 'Launch prompt set v1 - placeholder wording requires owner approval', now())
  on conflict (version) do update
    set status = excluded.status,
        name = excluded.name,
        activated_at = coalesce(public.prompt_sets.activated_at, excluded.activated_at)
  returning id
)
insert into public.prompt_definitions (
  prompt_set_id,
  canonical_key,
  prompt_order,
  title,
  prompt_text,
  expected_duration_seconds
)
select id, canonical_key, prompt_order, title, prompt_text, expected_duration_seconds
from launch_prompt_set
cross join (
  values
    (
      'opening_reference'::public.prompt_canonical_key,
      1,
      'Opening / within-session reference',
      'PLACEHOLDER - owner-approved wording required before production: Opening / within-session reference.',
      60
    ),
    (
      'demanding_reflection'::public.prompt_canonical_key,
      2,
      'Emotionally demanding reflection',
      'PLACEHOLDER - owner-approved wording required before production: Emotionally demanding reflection.',
      60
    ),
    (
      'hope_future_orientation'::public.prompt_canonical_key,
      3,
      'Hope / future orientation',
      'PLACEHOLDER - owner-approved wording required before production: Hope / future orientation.',
      60
    )
) as prompts(canonical_key, prompt_order, title, prompt_text, expected_duration_seconds)
on conflict (prompt_set_id, canonical_key) do update
  set prompt_order = excluded.prompt_order,
      title = excluded.title,
      prompt_text = excluded.prompt_text,
      expected_duration_seconds = excluded.expected_duration_seconds;
