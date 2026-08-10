-- SoulScope result history and personal baseline persistence foundation.
-- Status: proposed backend infrastructure, not Canon.
-- Finalized results are immutable. Reprocessing creates a new result version.
-- Manifests record evidence membership and provenance references only.
-- Missing evidence remains missing and is not converted to zero.
-- A personal baseline is optional. No baseline remains no baseline.
-- A population reference is not a personal baseline.
-- Change does not automatically mean improvement or decline.
-- No scoring, dimension derivation, narrative, or rendering is implemented.
-- The instrument provides evidence. The individual provides meaning.

create table public.scan_result_versions (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  version_number integer not null,
  status text not null,
  idempotency_key text not null unique,
  result_schema_version text not null,
  prompt_set_version text not null,
  extractor_version text not null,
  normalization_version text not null,
  contract_version text not null,
  dimension_engine_version text,
  narrative_version text,
  supersedes_result_id uuid references public.scan_result_versions(id) on delete restrict,
  created_at timestamptz not null default now(),
  finalized_at timestamptz,
  constraint scan_result_versions_status_check
    check (status in ('draft', 'finalized')),
  constraint scan_result_versions_version_number_check
    check (version_number > 0),
  constraint scan_result_versions_scan_version_unique
    unique (scan_id, version_number),
  constraint scan_result_versions_required_versions_check
    check (
      btrim(result_schema_version) <> ''
      and btrim(prompt_set_version) <> ''
      and btrim(extractor_version) <> ''
      and btrim(normalization_version) <> ''
      and btrim(contract_version) <> ''
    ),
  constraint scan_result_versions_finalized_at_check
    check (
      (status = 'draft' and finalized_at is null)
      or (status = 'finalized' and finalized_at is not null)
    ),
  constraint scan_result_versions_not_self_superseding
    check (supersedes_result_id is null or supersedes_result_id <> id)
);

comment on table public.scan_result_versions is
  'Immutable scan result version metadata only. Finalized result versions cannot be rewritten; reprocessing creates another version.';

create table public.result_manifests (
  id uuid primary key default gen_random_uuid(),
  result_version_id uuid not null unique references public.scan_result_versions(id) on delete restrict,
  manifest_schema_version text not null,
  created_at timestamptz not null default now(),
  constraint result_manifests_schema_version_check
    check (btrim(manifest_schema_version) <> '')
);

comment on table public.result_manifests is
  'One manifest per result version. Manifests contain no arbitrary result JSON, scores, interpretation, story, or rendering fields.';

create table public.result_manifest_evidence (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.result_manifests(id) on delete restrict,
  evidence_record_id uuid not null references public.evidence_records(id) on delete restrict,
  evidence_order integer not null,
  created_at timestamptz not null default now(),
  constraint result_manifest_evidence_order_check
    check (evidence_order > 0),
  constraint result_manifest_evidence_manifest_record_unique
    unique (manifest_id, evidence_record_id),
  constraint result_manifest_evidence_manifest_order_unique
    unique (manifest_id, evidence_order)
);

comment on table public.result_manifest_evidence is
  'Manifest evidence membership preserves observed, missing, and rejected evidence without weights, scores, or interpretation.';

create table public.personal_baselines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version_number integer not null,
  status text not null,
  label text,
  compatibility_contract_version text not null,
  compatibility_note text,
  supersedes_baseline_id uuid references public.personal_baselines(id) on delete restrict,
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint personal_baselines_status_check
    check (status in ('draft', 'active', 'archived')),
  constraint personal_baselines_version_number_check
    check (version_number > 0),
  constraint personal_baselines_user_version_unique
    unique (user_id, version_number),
  constraint personal_baselines_contract_version_check
    check (btrim(compatibility_contract_version) <> ''),
  constraint personal_baselines_label_check
    check (label is null or btrim(label) <> ''),
  constraint personal_baselines_timestamp_state_check
    check (
      (status = 'draft' and activated_at is null and archived_at is null)
      or (status = 'active' and activated_at is not null and archived_at is null)
      or (status = 'archived' and archived_at is not null)
    ),
  constraint personal_baselines_not_self_superseding
    check (supersedes_baseline_id is null or supersedes_baseline_id <> id)
);

comment on table public.personal_baselines is
  'Versioned optional personal baseline metadata only. No population reference, scoring, trend judgment, improvement, decline, or automatic compatibility logic is stored.';

create table public.baseline_scan_members (
  id uuid primary key default gen_random_uuid(),
  baseline_id uuid not null references public.personal_baselines(id) on delete restrict,
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  result_version_id uuid not null references public.scan_result_versions(id) on delete restrict,
  member_order integer not null,
  included_at timestamptz not null default now(),
  constraint baseline_scan_members_order_check
    check (member_order > 0),
  constraint baseline_scan_members_baseline_scan_unique
    unique (baseline_id, scan_id),
  constraint baseline_scan_members_baseline_order_unique
    unique (baseline_id, member_order)
);

comment on table public.baseline_scan_members is
  'Explicit baseline scan membership stores the exact finalized result version used. No aggregation, scoring, compatibility calculation, trend, improvement, or decline is computed.';

create index scan_result_versions_scan_version_idx on public.scan_result_versions (scan_id, version_number desc);
create index scan_result_versions_status_idx on public.scan_result_versions (status);
create index scan_result_versions_finalized_at_idx on public.scan_result_versions (finalized_at);
create index scan_result_versions_supersedes_idx on public.scan_result_versions (supersedes_result_id);
create index scan_result_versions_prompt_set_version_idx on public.scan_result_versions (prompt_set_version);
create index scan_result_versions_contract_version_idx on public.scan_result_versions (contract_version);
create index result_manifest_evidence_manifest_id_idx on public.result_manifest_evidence (manifest_id);
create index result_manifest_evidence_evidence_record_id_idx on public.result_manifest_evidence (evidence_record_id);
create index result_manifest_evidence_order_idx on public.result_manifest_evidence (manifest_id, evidence_order);
create index personal_baselines_user_id_idx on public.personal_baselines (user_id);
create index personal_baselines_status_idx on public.personal_baselines (status);
create index personal_baselines_supersedes_idx on public.personal_baselines (supersedes_baseline_id);
create index baseline_scan_members_baseline_id_idx on public.baseline_scan_members (baseline_id);
create index baseline_scan_members_scan_id_idx on public.baseline_scan_members (scan_id);
create index baseline_scan_members_result_version_id_idx on public.baseline_scan_members (result_version_id);
create index baseline_scan_members_order_idx on public.baseline_scan_members (baseline_id, member_order);

create trigger personal_baselines_set_updated_at
before update on public.personal_baselines
for each row execute function public.set_updated_at();

create or replace function public.validate_scan_result_version()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  scan_prompt_set_version text;
  superseded_scan_id uuid;
  superseded_status text;
begin
  select prompt_sets.version
    into scan_prompt_set_version
    from public.scan_sessions
    join public.prompt_sets on prompt_sets.id = scan_sessions.prompt_set_id
   where scan_sessions.id = new.scan_id;

  if scan_prompt_set_version is null then
    raise exception 'scan not found for result version %', new.id
      using errcode = '23503';
  end if;

  if scan_prompt_set_version <> new.prompt_set_version then
    raise exception 'result prompt_set_version does not match scan prompt set'
      using errcode = '23514';
  end if;

  if new.supersedes_result_id is not null then
    select scan_id, status
      into superseded_scan_id, superseded_status
      from public.scan_result_versions
     where id = new.supersedes_result_id;

    if superseded_scan_id is null then
      raise exception 'superseded result not found for result version %', new.id
        using errcode = '23503';
    end if;

    if superseded_scan_id <> new.scan_id then
      raise exception 'superseded result must belong to the same scan'
        using errcode = '23514';
    end if;

    if superseded_status <> 'finalized' then
      raise exception 'superseded result must already be finalized'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger scan_result_versions_validate_relationship
before insert or update of scan_id, prompt_set_version, supersedes_result_id
on public.scan_result_versions
for each row execute function public.validate_scan_result_version();

create or replace function public.prevent_finalized_result_version_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'finalized' then
      raise exception 'finalized result versions cannot be deleted'
        using errcode = '42501';
    end if;
    return old;
  end if;

  if old.status = 'finalized' then
    raise exception 'finalized result versions cannot be updated'
      using errcode = '42501';
  end if;

  if old.finalized_at is not null and new.finalized_at is distinct from old.finalized_at then
    raise exception 'finalized_at cannot be changed after it is set'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger scan_result_versions_prevent_finalized_update
before update on public.scan_result_versions
for each row execute function public.prevent_finalized_result_version_mutation();

create trigger scan_result_versions_prevent_finalized_delete
before delete on public.scan_result_versions
for each row execute function public.prevent_finalized_result_version_mutation();

create or replace function public.result_version_is_finalized(p_result_version_id uuid)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.scan_result_versions
     where id = p_result_version_id
       and status = 'finalized'
  );
$$;

create or replace function public.manifest_parent_is_finalized(p_manifest_id uuid)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
      from public.result_manifests
      join public.scan_result_versions on scan_result_versions.id = result_manifests.result_version_id
     where result_manifests.id = p_manifest_id
       and scan_result_versions.status = 'finalized'
  );
$$;

create or replace function public.prevent_finalized_manifest_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  checked_result_version_id uuid;
begin
  checked_result_version_id := case when tg_op = 'DELETE' then old.result_version_id else new.result_version_id end;

  if public.result_version_is_finalized(checked_result_version_id) then
    raise exception 'result manifest cannot change after parent result finalization'
      using errcode = '42501';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger result_manifests_prevent_finalized_update
before update on public.result_manifests
for each row execute function public.prevent_finalized_manifest_mutation();

create trigger result_manifests_prevent_finalized_delete
before delete on public.result_manifests
for each row execute function public.prevent_finalized_manifest_mutation();

create or replace function public.validate_result_manifest_evidence()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  manifest_scan_id uuid;
  evidence_scan_id uuid;
begin
  select scan_result_versions.scan_id
    into manifest_scan_id
    from public.result_manifests
    join public.scan_result_versions on scan_result_versions.id = result_manifests.result_version_id
   where result_manifests.id = new.manifest_id;

  if manifest_scan_id is null then
    raise exception 'manifest not found for evidence membership %', new.id
      using errcode = '23503';
  end if;

  select scan_id
    into evidence_scan_id
    from public.evidence_records
   where id = new.evidence_record_id;

  if evidence_scan_id is null then
    raise exception 'evidence record not found for evidence membership %', new.id
      using errcode = '23503';
  end if;

  if evidence_scan_id <> manifest_scan_id then
    raise exception 'manifest evidence must belong to the same scan as the result'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger result_manifest_evidence_validate_relationship
before insert or update of manifest_id, evidence_record_id
on public.result_manifest_evidence
for each row execute function public.validate_result_manifest_evidence();

create or replace function public.prevent_finalized_manifest_evidence_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  checked_manifest_id uuid;
begin
  checked_manifest_id := case when tg_op = 'DELETE' then old.manifest_id else new.manifest_id end;

  if public.manifest_parent_is_finalized(checked_manifest_id) then
    raise exception 'result manifest evidence cannot change after result finalization'
      using errcode = '42501';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger result_manifest_evidence_prevent_finalized_insert
before insert on public.result_manifest_evidence
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create trigger result_manifest_evidence_prevent_finalized_update
before update on public.result_manifest_evidence
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create trigger result_manifest_evidence_prevent_finalized_delete
before delete on public.result_manifest_evidence
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create or replace function public.validate_personal_baseline()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  superseded_user_id uuid;
begin
  if new.supersedes_baseline_id is not null then
    select user_id
      into superseded_user_id
      from public.personal_baselines
     where id = new.supersedes_baseline_id;

    if superseded_user_id is null then
      raise exception 'superseded baseline not found for baseline %', new.id
        using errcode = '23503';
    end if;

    if superseded_user_id <> new.user_id then
      raise exception 'superseded baseline must belong to the same user'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger personal_baselines_validate_relationship
before insert or update of user_id, supersedes_baseline_id
on public.personal_baselines
for each row execute function public.validate_personal_baseline();

create or replace function public.enforce_personal_baseline_state()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.status = 'archived' then
    raise exception 'archived baselines cannot be changed'
      using errcode = '42501';
  end if;

  if old.status = 'active' and new.status <> 'archived' then
    raise exception 'active baselines may only move to archived'
      using errcode = '42501';
  end if;

  if old.status = 'active'
    and new.status = 'archived'
    and (
      new.user_id is distinct from old.user_id
      or new.version_number is distinct from old.version_number
      or new.label is distinct from old.label
      or new.compatibility_contract_version is distinct from old.compatibility_contract_version
      or new.compatibility_note is distinct from old.compatibility_note
      or new.supersedes_baseline_id is distinct from old.supersedes_baseline_id
      or new.created_at is distinct from old.created_at
      or new.activated_at is distinct from old.activated_at
    )
  then
    raise exception 'active baselines can only be archived without rewriting metadata'
      using errcode = '42501';
  end if;

  if old.status = 'draft' and new.status = 'archived' then
    raise exception 'draft baselines cannot move directly to archived'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger personal_baselines_enforce_state
before update on public.personal_baselines
for each row execute function public.enforce_personal_baseline_state();

create or replace function public.validate_baseline_scan_member()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  baseline_user_id uuid;
  baseline_status text;
  scan_user_id uuid;
  result_scan_id uuid;
  result_status text;
begin
  select user_id, status
    into baseline_user_id, baseline_status
    from public.personal_baselines
   where id = new.baseline_id;

  if baseline_user_id is null then
    raise exception 'baseline not found for baseline member %', new.id
      using errcode = '23503';
  end if;

  if baseline_status <> 'draft' then
    raise exception 'baseline membership can change only while baseline is draft'
      using errcode = '42501';
  end if;

  select user_id
    into scan_user_id
    from public.scan_sessions
   where id = new.scan_id;

  if scan_user_id is null then
    raise exception 'scan not found for baseline member %', new.id
      using errcode = '23503';
  end if;

  if scan_user_id <> baseline_user_id then
    raise exception 'baseline owner must own member scan'
      using errcode = '23514';
  end if;

  select scan_id, status
    into result_scan_id, result_status
    from public.scan_result_versions
   where id = new.result_version_id;

  if result_scan_id is null then
    raise exception 'result version not found for baseline member %', new.id
      using errcode = '23503';
  end if;

  if result_scan_id <> new.scan_id then
    raise exception 'baseline member result version must belong to member scan'
      using errcode = '23514';
  end if;

  if result_status <> 'finalized' then
    raise exception 'baseline member result version must be finalized'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger baseline_scan_members_validate_relationship
before insert or update
on public.baseline_scan_members
for each row execute function public.validate_baseline_scan_member();

create or replace function public.prevent_baseline_scan_member_update_when_old_not_draft()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  baseline_status text;
begin
  select status
    into baseline_status
    from public.personal_baselines
   where id = old.baseline_id;

  if baseline_status is null then
    raise exception 'baseline not found for baseline member %', old.id
      using errcode = '23503';
  end if;

  if baseline_status <> 'draft' then
    raise exception 'baseline membership can change only while baseline is draft'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger baseline_scan_members_prevent_update_when_old_not_draft
before update on public.baseline_scan_members
for each row execute function public.prevent_baseline_scan_member_update_when_old_not_draft();

create or replace function public.prevent_baseline_scan_member_delete_when_not_draft()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  baseline_status text;
begin
  select status
    into baseline_status
    from public.personal_baselines
   where id = old.baseline_id;

  if baseline_status is null then
    raise exception 'baseline not found for baseline member %', old.id
      using errcode = '23503';
  end if;

  if baseline_status <> 'draft' then
    raise exception 'baseline membership can change only while baseline is draft'
      using errcode = '42501';
  end if;

  return old;
end;
$$;

create trigger baseline_scan_members_prevent_delete_when_not_draft
before delete on public.baseline_scan_members
for each row execute function public.prevent_baseline_scan_member_delete_when_not_draft();

create or replace function public.create_scan_result_version(
  p_scan_id uuid,
  p_idempotency_key text,
  p_result_schema_version text,
  p_prompt_set_version text,
  p_extractor_version text,
  p_normalization_version text,
  p_contract_version text,
  p_manifest_schema_version text,
  p_supersedes_result_id uuid default null,
  p_dimension_engine_version text default null,
  p_narrative_version text default null
)
returns table (
  result_version_id uuid,
  manifest_id uuid,
  scan_id uuid,
  version_number integer,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_scan public.scan_sessions%rowtype;
  scan_owner_id uuid;
  existing_result public.scan_result_versions%rowtype;
  existing_manifest_id uuid;
  existing_manifest_schema_version text;
  next_version_number integer;
  inserted_result public.scan_result_versions%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to create scan result versions'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  select *
    into locked_scan
    from public.scan_sessions as ss
   where ss.id = p_scan_id
   for update;

  if not found then
    raise exception 'scan not found'
      using errcode = '02000';
  end if;

  if locked_scan.lifecycle_state not in ('evidence_ready', 'finalizing') then
    raise exception 'scan must be evidence_ready or finalizing to create result version'
      using errcode = '23514';
  end if;

  scan_owner_id := locked_scan.user_id;

  select *
    into existing_result
    from public.scan_result_versions as srv
   where srv.idempotency_key = p_idempotency_key;

  if found then
    select rm.id, rm.manifest_schema_version
      into existing_manifest_id, existing_manifest_schema_version
      from public.result_manifests as rm
     where rm.result_version_id = existing_result.id;

    if existing_result.scan_id <> p_scan_id
      or existing_result.result_schema_version <> p_result_schema_version
      or existing_result.prompt_set_version <> p_prompt_set_version
      or existing_result.extractor_version <> p_extractor_version
      or existing_result.normalization_version <> p_normalization_version
      or existing_result.contract_version <> p_contract_version
      or existing_result.supersedes_result_id is distinct from p_supersedes_result_id
      or existing_result.dimension_engine_version is distinct from p_dimension_engine_version
      or existing_result.narrative_version is distinct from p_narrative_version
      or existing_manifest_id is null
      or existing_manifest_schema_version <> p_manifest_schema_version
    then
      raise exception 'idempotency key reused with incompatible result metadata'
        using errcode = '23505';
    end if;

    result_version_id := existing_result.id;
    manifest_id := existing_manifest_id;
    scan_id := existing_result.scan_id;
    version_number := existing_result.version_number;
    status := existing_result.status;
    return next;
    return;
  end if;

  perform 1
    from public.prompt_sets as ps
   where ps.id = locked_scan.prompt_set_id
     and ps.version = p_prompt_set_version;

  if not found then
    raise exception 'prompt_set_version does not match scan prompt set'
      using errcode = '23514';
  end if;

  if p_supersedes_result_id is not null then
    perform 1
      from public.scan_result_versions as srv
     where srv.id = p_supersedes_result_id
       and srv.scan_id = p_scan_id
       and srv.status = 'finalized';

    if not found then
      raise exception 'superseded result must belong to scan and be finalized'
        using errcode = '23514';
    end if;
  end if;

  select coalesce(max(srv.version_number), 0) + 1
    into next_version_number
    from public.scan_result_versions as srv
   where srv.scan_id = p_scan_id;

  insert into public.scan_result_versions (
    scan_id,
    version_number,
    status,
    idempotency_key,
    result_schema_version,
    prompt_set_version,
    extractor_version,
    normalization_version,
    contract_version,
    dimension_engine_version,
    narrative_version,
    supersedes_result_id
  )
  values (
    p_scan_id,
    next_version_number,
    'draft',
    p_idempotency_key,
    p_result_schema_version,
    p_prompt_set_version,
    p_extractor_version,
    p_normalization_version,
    p_contract_version,
    p_dimension_engine_version,
    p_narrative_version,
    p_supersedes_result_id
  )
  returning * into inserted_result;

  insert into public.result_manifests (
    result_version_id,
    manifest_schema_version
  )
  values (
    inserted_result.id,
    p_manifest_schema_version
  )
  returning result_manifests.id into manifest_id;

  insert into public.audit_events (
    user_id,
    scan_id,
    event_type,
    actor_type,
    actor_id,
    details
  )
  values (
    scan_owner_id,
    p_scan_id,
    'result.version_created',
    'service',
    null,
    jsonb_build_object(
      'result_version_id', inserted_result.id,
      'version_number', inserted_result.version_number
    )
  );

  result_version_id := inserted_result.id;
  scan_id := inserted_result.scan_id;
  version_number := inserted_result.version_number;
  status := inserted_result.status;
  return next;
end;
$$;

create or replace function public.add_result_manifest_evidence(
  p_result_version_id uuid,
  p_evidence_record_id uuid,
  p_evidence_order integer
)
returns table (
  membership_id uuid,
  manifest_id uuid,
  evidence_record_id uuid,
  evidence_order integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_result public.scan_result_versions%rowtype;
  locked_manifest_id uuid;
  evidence_scan_id uuid;
  existing_membership public.result_manifest_evidence%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to add result manifest evidence'
      using errcode = '42501';
  end if;

  if p_evidence_order <= 0 then
    raise exception 'evidence_order must be greater than zero'
      using errcode = '23514';
  end if;

  select *
    into locked_result
    from public.scan_result_versions as srv
   where srv.id = p_result_version_id
   for update;

  if not found then
    raise exception 'result version not found'
      using errcode = '02000';
  end if;

  if locked_result.status <> 'draft' then
    raise exception 'manifest evidence can be added only to draft results'
      using errcode = '23514';
  end if;

  select rm.id
    into locked_manifest_id
    from public.result_manifests as rm
   where rm.result_version_id = locked_result.id;

  if locked_manifest_id is null then
    raise exception 'result manifest not found'
      using errcode = '02000';
  end if;

  select er.scan_id
    into evidence_scan_id
    from public.evidence_records as er
   where er.id = p_evidence_record_id;

  if evidence_scan_id is null then
    raise exception 'evidence record not found'
      using errcode = '02000';
  end if;

  if evidence_scan_id <> locked_result.scan_id then
    raise exception 'evidence must belong to the same scan as the result'
      using errcode = '23514';
  end if;

  select *
    into existing_membership
    from public.result_manifest_evidence
   where result_manifest_evidence.manifest_id = locked_manifest_id
     and result_manifest_evidence.evidence_record_id = p_evidence_record_id;

  if found then
    if existing_membership.evidence_order <> p_evidence_order then
      raise exception 'evidence already exists in manifest with a different order'
        using errcode = '23505';
    end if;

    membership_id := existing_membership.id;
    manifest_id := existing_membership.manifest_id;
    evidence_record_id := existing_membership.evidence_record_id;
    evidence_order := existing_membership.evidence_order;
    return next;
    return;
  end if;

  perform 1
    from public.result_manifest_evidence
   where result_manifest_evidence.manifest_id = locked_manifest_id
     and result_manifest_evidence.evidence_order = p_evidence_order;

  if found then
    raise exception 'manifest evidence order already used'
      using errcode = '23505';
  end if;

  insert into public.result_manifest_evidence (
    manifest_id,
    evidence_record_id,
    evidence_order
  )
  values (
    locked_manifest_id,
    p_evidence_record_id,
    p_evidence_order
  )
  returning id, result_manifest_evidence.manifest_id, result_manifest_evidence.evidence_record_id, result_manifest_evidence.evidence_order
  into membership_id, manifest_id, evidence_record_id, evidence_order;

  return next;
end;
$$;

create or replace function public.finalize_scan_result_version(
  p_result_version_id uuid
)
returns table (
  result_version_id uuid,
  scan_id uuid,
  version_number integer,
  status text,
  finalized_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_result public.scan_result_versions%rowtype;
  locked_scan public.scan_sessions%rowtype;
  locked_manifest_id uuid;
  manifest_evidence_count integer;
  scan_owner_id uuid;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to finalize scan result versions'
      using errcode = '42501';
  end if;

  select *
    into locked_result
    from public.scan_result_versions as srv
   where srv.id = p_result_version_id
   for update;

  if not found then
    raise exception 'result version not found'
      using errcode = '02000';
  end if;

  select *
    into locked_scan
    from public.scan_sessions as ss
   where ss.id = locked_result.scan_id
   for update;

  if not found then
    raise exception 'scan not found for result version'
      using errcode = '02000';
  end if;

  scan_owner_id := locked_scan.user_id;

  if locked_result.status = 'finalized' then
    if locked_scan.lifecycle_state = 'finalized' then
      result_version_id := locked_result.id;
      scan_id := locked_result.scan_id;
      version_number := locked_result.version_number;
      status := locked_result.status;
      finalized_at := locked_result.finalized_at;
      return next;
      return;
    end if;

    raise exception 'result is finalized but scan is not finalized'
      using errcode = '23514';
  end if;

  if locked_scan.lifecycle_state <> 'finalizing' then
    raise exception 'scan must be finalizing to finalize result version'
      using errcode = '23514';
  end if;

  select rm.id
    into locked_manifest_id
    from public.result_manifests as rm
   where rm.result_version_id = locked_result.id;

  if locked_manifest_id is null then
    raise exception 'result manifest is required before finalization'
      using errcode = '23514';
  end if;

  select count(*)
    into manifest_evidence_count
    from public.result_manifest_evidence
    join public.evidence_records on evidence_records.id = result_manifest_evidence.evidence_record_id
   where result_manifest_evidence.manifest_id = locked_manifest_id
     and evidence_records.scan_id = locked_result.scan_id;

  if manifest_evidence_count < 1 then
    raise exception 'at least one manifest evidence membership is required before finalization'
      using errcode = '23514';
  end if;

  perform 1
    from public.result_manifest_evidence
    join public.evidence_records on evidence_records.id = result_manifest_evidence.evidence_record_id
   where result_manifest_evidence.manifest_id = locked_manifest_id
     and evidence_records.scan_id <> locked_result.scan_id;

  if found then
    raise exception 'all manifest evidence must belong to result scan'
      using errcode = '23514';
  end if;

  update public.scan_result_versions
     set status = 'finalized',
         finalized_at = now()
   where scan_result_versions.id = locked_result.id
   returning * into locked_result;

  perform *
    from public.transition_scan_lifecycle(
      locked_result.scan_id,
      'finalized'::public.scan_lifecycle_state,
      jsonb_build_object(
        'result_version_id', locked_result.id,
        'version_number', locked_result.version_number
      )
    );

  insert into public.audit_events (
    user_id,
    scan_id,
    event_type,
    actor_type,
    actor_id,
    details
  )
  values (
    scan_owner_id,
    locked_result.scan_id,
    'result.version_finalized',
    'service',
    null,
    jsonb_build_object(
      'result_version_id', locked_result.id,
      'version_number', locked_result.version_number
    )
  );

  result_version_id := locked_result.id;
  scan_id := locked_result.scan_id;
  version_number := locked_result.version_number;
  status := locked_result.status;
  finalized_at := locked_result.finalized_at;
  return next;
end;
$$;

comment on function public.create_scan_result_version(uuid, text, text, text, text, text, text, text, uuid, text, text) is
  'Service-only result version and manifest creation. It stores version metadata only and does not transition scan lifecycle.';

comment on function public.add_result_manifest_evidence(uuid, uuid, integer) is
  'Service-only manifest evidence membership insertion. It does not modify evidence and does not store weights or scores.';

comment on function public.finalize_scan_result_version(uuid) is
  'Service-only result finalization. It uses the existing scan lifecycle transition function and does not bypass lifecycle enforcement.';

alter table public.scan_result_versions enable row level security;
alter table public.result_manifests enable row level security;
alter table public.result_manifest_evidence enable row level security;
alter table public.personal_baselines enable row level security;
alter table public.baseline_scan_members enable row level security;

alter table public.scan_result_versions force row level security;
alter table public.result_manifests force row level security;
alter table public.result_manifest_evidence force row level security;
alter table public.personal_baselines force row level security;
alter table public.baseline_scan_members force row level security;

create policy "scan_result_versions_select_own_finalized"
on public.scan_result_versions
for select
to authenticated
using (
  status = 'finalized'
  and exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_result_versions.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "result_manifests_select_own_finalized"
on public.result_manifests
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_result_versions
      join public.scan_sessions on scan_sessions.id = scan_result_versions.scan_id
     where scan_result_versions.id = result_manifests.result_version_id
       and scan_result_versions.status = 'finalized'
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "result_manifest_evidence_select_own_finalized"
on public.result_manifest_evidence
for select
to authenticated
using (
  exists (
    select 1
      from public.result_manifests
      join public.scan_result_versions on scan_result_versions.id = result_manifests.result_version_id
      join public.scan_sessions on scan_sessions.id = scan_result_versions.scan_id
     where result_manifests.id = result_manifest_evidence.manifest_id
       and scan_result_versions.status = 'finalized'
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "personal_baselines_select_own"
on public.personal_baselines
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "baseline_scan_members_select_own"
on public.baseline_scan_members
for select
to authenticated
using (
  exists (
    select 1
      from public.personal_baselines
     where personal_baselines.id = baseline_scan_members.baseline_id
       and personal_baselines.user_id = (select auth.uid())
  )
);

revoke all on public.scan_result_versions from public, anon, authenticated;
revoke all on public.result_manifests from public, anon, authenticated;
revoke all on public.result_manifest_evidence from public, anon, authenticated;
revoke all on public.personal_baselines from public, anon, authenticated;
revoke all on public.baseline_scan_members from public, anon, authenticated;

revoke all on function public.validate_scan_result_version() from public, anon, authenticated;
revoke all on function public.prevent_finalized_result_version_mutation() from public, anon, authenticated;
revoke all on function public.result_version_is_finalized(uuid) from public, anon, authenticated;
revoke all on function public.manifest_parent_is_finalized(uuid) from public, anon, authenticated;
revoke all on function public.prevent_finalized_manifest_mutation() from public, anon, authenticated;
revoke all on function public.validate_result_manifest_evidence() from public, anon, authenticated;
revoke all on function public.prevent_finalized_manifest_evidence_mutation() from public, anon, authenticated;
revoke all on function public.validate_personal_baseline() from public, anon, authenticated;
revoke all on function public.enforce_personal_baseline_state() from public, anon, authenticated;
revoke all on function public.validate_baseline_scan_member() from public, anon, authenticated;
revoke all on function public.prevent_baseline_scan_member_update_when_old_not_draft() from public, anon, authenticated;
revoke all on function public.prevent_baseline_scan_member_delete_when_not_draft() from public, anon, authenticated;
revoke all on function public.create_scan_result_version(uuid, text, text, text, text, text, text, text, uuid, text, text) from public, anon, authenticated;
revoke all on function public.add_result_manifest_evidence(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.finalize_scan_result_version(uuid) from public, anon, authenticated;

grant select on public.scan_result_versions to authenticated;
grant select on public.result_manifests to authenticated;
grant select on public.result_manifest_evidence to authenticated;
grant select on public.personal_baselines to authenticated;
grant select on public.baseline_scan_members to authenticated;

grant execute on function public.create_scan_result_version(uuid, text, text, text, text, text, text, text, uuid, text, text) to service_role;
grant execute on function public.add_result_manifest_evidence(uuid, uuid, integer) to service_role;
grant execute on function public.finalize_scan_result_version(uuid) to service_role;

grant all on public.scan_result_versions to service_role;
grant all on public.result_manifests to service_role;
grant all on public.result_manifest_evidence to service_role;
grant all on public.personal_baselines to service_role;
grant all on public.baseline_scan_members to service_role;
