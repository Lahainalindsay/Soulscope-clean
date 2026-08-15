-- SoulScope real-scan processing foundation.
-- Status: backend execution scaffold, calibration pending.
-- This migration adds service-owned intake and processing records needed to run
-- the real scan workflow from uploaded prompt audio to immutable measurement
-- and unresolved semantic result skeletons.
-- It does not implement calibrated acoustic extraction, Dimension scoring,
-- Pattern publication, Narrative generation, or Resonance rendering.

alter table public.capture_artifacts
  add column registration_idempotency_key text,
  add constraint capture_artifacts_registration_idempotency_unique
    unique (registration_idempotency_key),
  add constraint capture_artifacts_registration_idempotency_check
    check (registration_idempotency_key is null or btrim(registration_idempotency_key) <> '');

create table public.scan_processing_runs (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  status text not null,
  protocol_version text not null,
  extractor_version text not null,
  quality_rules_version text not null,
  evidence_registry_version text not null,
  dimension_registry_version text not null,
  inference_rules_version text not null,
  state_registry_version text not null,
  interaction_registry_version text not null,
  pattern_registry_version text not null,
  narrative_registry_version text not null,
  renderer_registry_version text not null,
  idempotency_key text not null unique,
  started_at timestamptz,
  completed_at timestamptz,
  failure_code text,
  failure_detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scan_processing_runs_status_check
    check (status in ('queued', 'running', 'measurement_recorded', 'semantic_abstained', 'failed')),
  constraint scan_processing_runs_required_versions_check
    check (
      btrim(protocol_version) <> ''
      and btrim(extractor_version) <> ''
      and btrim(quality_rules_version) <> ''
      and btrim(evidence_registry_version) <> ''
      and btrim(dimension_registry_version) <> ''
      and btrim(inference_rules_version) <> ''
      and btrim(state_registry_version) <> ''
      and btrim(interaction_registry_version) <> ''
      and btrim(pattern_registry_version) <> ''
      and btrim(narrative_registry_version) <> ''
      and btrim(renderer_registry_version) <> ''
      and btrim(idempotency_key) <> ''
    ),
  constraint scan_processing_runs_running_started_check
    check ((status = 'running' and started_at is not null) or status <> 'running'),
  constraint scan_processing_runs_completed_check
    check (
      (status in ('semantic_abstained', 'failed') and completed_at is not null)
      or (status in ('queued', 'running', 'measurement_recorded') and completed_at is null)
    ),
  constraint scan_processing_runs_failed_detail_check
    check (
      (status = 'failed' and (failure_code is not null or failure_detail is not null))
      or status <> 'failed'
    )
);

comment on table public.scan_processing_runs is
  'Service-owned real-scan processing run metadata. It records material versions and status only; it does not contain scientific scores or narrative.';

create table public.measurement_records (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  processing_run_id uuid not null references public.scan_processing_runs(id) on delete restrict,
  measurement_schema_version text not null,
  protocol_version text not null,
  extractor_version text not null,
  quality_rules_version text not null,
  measurement_status text not null,
  prompt_measurements jsonb not null,
  prompt_contrasts jsonb not null,
  quality_summary jsonb not null,
  extractor_provenance jsonb not null,
  semantic_eligibility boolean not null,
  renderer_eligibility boolean not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  constraint measurement_records_status_check
    check (measurement_status in ('qualified', 'limited', 'rejected')),
  constraint measurement_records_versions_check
    check (
      btrim(measurement_schema_version) <> ''
      and btrim(protocol_version) <> ''
      and btrim(extractor_version) <> ''
      and btrim(quality_rules_version) <> ''
      and btrim(idempotency_key) <> ''
    ),
  constraint measurement_records_json_shape_check
    check (
      jsonb_typeof(prompt_measurements) = 'array'
      and jsonb_typeof(prompt_contrasts) = 'array'
      and jsonb_typeof(quality_summary) = 'object'
      and jsonb_typeof(extractor_provenance) = 'object'
      and extractor_provenance <> '{}'::jsonb
    ),
  constraint measurement_records_rejected_eligibility_check
    check (
      (measurement_status = 'rejected' and semantic_eligibility = false and renderer_eligibility = false)
      or measurement_status <> 'rejected'
    )
);

comment on table public.measurement_records is
  'Immutable Acoustic Measurement Record persistence. Measurements are descriptive, versioned, and quality-gated; missing or rejected information must remain explicit.';

create table public.semantic_result_records (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  processing_run_id uuid not null references public.scan_processing_runs(id) on delete restrict,
  measurement_record_id uuid not null references public.measurement_records(id) on delete restrict,
  semantic_schema_version text not null,
  status text not null,
  evidence_ledger jsonb not null,
  dimensions jsonb not null,
  constellation_geometry jsonb not null,
  states_or_blends jsonb not null,
  interactions jsonb not null,
  pattern_result jsonb not null,
  decision_ledger jsonb not null,
  version_manifest jsonb not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  constraint semantic_result_records_status_check
    check (status in ('unresolved_abstained', 'invalid')),
  constraint semantic_result_records_versions_check
    check (btrim(semantic_schema_version) <> '' and btrim(idempotency_key) <> ''),
  constraint semantic_result_records_json_shape_check
    check (
      jsonb_typeof(evidence_ledger) = 'array'
      and jsonb_typeof(dimensions) = 'array'
      and jsonb_typeof(constellation_geometry) = 'array'
      and jsonb_typeof(states_or_blends) = 'array'
      and jsonb_typeof(interactions) = 'array'
      and jsonb_typeof(pattern_result) = 'object'
      and jsonb_typeof(decision_ledger) = 'array'
      and jsonb_typeof(version_manifest) = 'object'
    ),
  constraint semantic_result_records_no_forced_pattern_check
    check (pattern_result ->> 'publicationStatus' = 'NO_PATTERN_PUBLISHED'),
  constraint semantic_result_records_pattern_outcome_check
    check (pattern_result ->> 'outcomeType' = 'NO_PATTERN_PUBLISHED'),
  constraint semantic_result_records_manifest_pattern_version_check
    check (version_manifest ->> 'patternRegistry' = '0.1')
);

comment on table public.semantic_result_records is
  'Immutable semantic result skeleton. Until calibrated engines exist, this table preserves explicit unresolved/abstained outcomes and version provenance.';

create index scan_processing_runs_scan_id_idx on public.scan_processing_runs (scan_id);
create index scan_processing_runs_status_idx on public.scan_processing_runs (status);
create index measurement_records_scan_id_idx on public.measurement_records (scan_id);
create index measurement_records_processing_run_id_idx on public.measurement_records (processing_run_id);
create index semantic_result_records_scan_id_idx on public.semantic_result_records (scan_id);
create index semantic_result_records_processing_run_id_idx on public.semantic_result_records (processing_run_id);
create index semantic_result_records_measurement_record_id_idx on public.semantic_result_records (measurement_record_id);

create trigger scan_processing_runs_set_updated_at
before update on public.scan_processing_runs
for each row execute function public.set_updated_at();

create or replace function public.validate_measurement_record_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  run_scan_id uuid;
begin
  select scan_id
    into run_scan_id
    from public.scan_processing_runs
   where id = new.processing_run_id;

  if run_scan_id is null then
    raise exception 'processing run not found for measurement record %', new.id
      using errcode = '23503';
  end if;

  if run_scan_id <> new.scan_id then
    raise exception 'measurement processing run does not belong to measurement scan'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger measurement_records_validate_relationship
before insert or update of scan_id, processing_run_id
on public.measurement_records
for each row execute function public.validate_measurement_record_relationship();

create or replace function public.validate_semantic_result_record_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  run_scan_id uuid;
  measurement_scan_id uuid;
  measurement_run_id uuid;
begin
  select scan_id
    into run_scan_id
    from public.scan_processing_runs
   where id = new.processing_run_id;

  if run_scan_id is null then
    raise exception 'processing run not found for semantic result %', new.id
      using errcode = '23503';
  end if;

  select scan_id, processing_run_id
    into measurement_scan_id, measurement_run_id
    from public.measurement_records
   where id = new.measurement_record_id;

  if measurement_scan_id is null then
    raise exception 'measurement record not found for semantic result %', new.id
      using errcode = '23503';
  end if;

  if run_scan_id <> new.scan_id
    or measurement_scan_id <> new.scan_id
    or measurement_run_id <> new.processing_run_id
  then
    raise exception 'semantic result scan, run, and measurement relationships must match'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger semantic_result_records_validate_relationship
before insert or update of scan_id, processing_run_id, measurement_record_id
on public.semantic_result_records
for each row execute function public.validate_semantic_result_record_relationship();

create or replace function public.prevent_measurement_record_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'measurement_records are immutable'
    using errcode = '42501';
end;
$$;

create trigger measurement_records_prevent_update
before update on public.measurement_records
for each row execute function public.prevent_measurement_record_mutation();

create trigger measurement_records_prevent_delete
before delete on public.measurement_records
for each row execute function public.prevent_measurement_record_mutation();

create or replace function public.prevent_semantic_result_record_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'semantic_result_records are immutable'
    using errcode = '42501';
end;
$$;

create trigger semantic_result_records_prevent_update
before update on public.semantic_result_records
for each row execute function public.prevent_semantic_result_record_mutation();

create trigger semantic_result_records_prevent_delete
before delete on public.semantic_result_records
for each row execute function public.prevent_semantic_result_record_mutation();

create or replace function public.register_uploaded_capture_artifact(
  p_capture_id uuid,
  p_storage_bucket text,
  p_storage_object_path text,
  p_mime_type text,
  p_byte_size bigint,
  p_checksum_sha256 text,
  p_idempotency_key text
)
returns table (
  artifact_id uuid,
  scan_id uuid,
  capture_id uuid,
  processing_job_id uuid,
  processing_job_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_capture public.scan_prompt_captures%rowtype;
  inserted_artifact public.capture_artifacts%rowtype;
  inserted_job public.processing_jobs%rowtype;
  job_key text;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to register uploaded capture artifacts'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  select *
    into locked_capture
    from public.scan_prompt_captures
   where id = p_capture_id
   for update;

  if not found then
    raise exception 'capture not found'
      using errcode = '02000';
  end if;

  if locked_capture.capture_status not in ('uploaded', 'processed') then
    raise exception 'capture must be uploaded before artifact registration'
      using errcode = '23514';
  end if;

  insert into public.capture_artifacts (
    scan_id,
    capture_id,
    artifact_kind,
    audio_state,
    storage_bucket,
    storage_object_path,
    mime_type,
    byte_size,
    checksum_sha256,
    registration_idempotency_key
  )
  values (
    locked_capture.scan_id,
    locked_capture.id,
    'raw_audio',
    'stored_private',
    p_storage_bucket,
    p_storage_object_path,
    p_mime_type,
    p_byte_size,
    p_checksum_sha256,
    p_idempotency_key
  )
  on conflict (registration_idempotency_key) do update
    set registration_idempotency_key = excluded.registration_idempotency_key
  returning * into inserted_artifact;

  if inserted_artifact.capture_id <> locked_capture.id then
    raise exception 'idempotency key reused for another capture artifact'
      using errcode = '23505';
  end if;

  job_key := 'capture-processing:' || inserted_artifact.id::text;

  insert into public.processing_jobs (
    scan_id,
    capture_id,
    artifact_id,
    job_type,
    status,
    idempotency_key,
    payload
  )
  values (
    inserted_artifact.scan_id,
    inserted_artifact.capture_id,
    inserted_artifact.id,
    'capture_processing',
    'queued',
    job_key,
    jsonb_build_object(
      'artifact_id', inserted_artifact.id,
      'capture_id', inserted_artifact.capture_id,
      'scan_id', inserted_artifact.scan_id,
      'phase', 'awaiting_acoustic_extraction'
    )
  )
  on conflict (idempotency_key) do update
    set available_at = public.processing_jobs.available_at
  returning * into inserted_job;

  insert into public.audit_events (
    user_id,
    scan_id,
    event_type,
    actor_type,
    details
  )
  select
    scan_sessions.user_id,
    inserted_artifact.scan_id,
    'capture.artifact_registered',
    'service'::public.audit_actor_type,
    jsonb_build_object(
      'artifact_id', inserted_artifact.id,
      'capture_id', inserted_artifact.capture_id,
      'processing_job_id', inserted_job.id
    )
  from public.scan_sessions
  where scan_sessions.id = inserted_artifact.scan_id
    and not exists (
      select 1
        from public.audit_events
       where audit_events.scan_id = inserted_artifact.scan_id
         and audit_events.event_type = 'capture.artifact_registered'
         and audit_events.details ->> 'artifact_id' = inserted_artifact.id::text
    );

  artifact_id := inserted_artifact.id;
  scan_id := inserted_artifact.scan_id;
  capture_id := inserted_artifact.capture_id;
  processing_job_id := inserted_job.id;
  processing_job_status := inserted_job.status;
  return next;
end;
$$;

create or replace function public.start_scan_processing_run(
  p_scan_id uuid,
  p_idempotency_key text,
  p_extractor_version text,
  p_renderer_registry_version text default 'CALIBRATION_REQUIRED'
)
returns table (
  processing_run_id uuid,
  scan_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_scan public.scan_sessions%rowtype;
  inserted_run public.scan_processing_runs%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  ready_capture_count integer;
begin
  if not caller_is_service then
    raise exception 'service role is required to start scan processing'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = '' or coalesce(btrim(p_extractor_version), '') = '' then
    raise exception 'idempotency key and extractor version are required'
      using errcode = '22023';
  end if;

  select *
    into locked_scan
    from public.scan_sessions
   where id = p_scan_id
   for update;

  if not found then
    raise exception 'scan not found'
      using errcode = '02000';
  end if;

  if locked_scan.lifecycle_state not in ('queued', 'extracting') then
    raise exception 'scan must be queued or extracting to start processing'
      using errcode = '23514';
  end if;

  select count(*)
    into ready_capture_count
    from public.scan_prompt_captures
    join public.capture_artifacts on capture_artifacts.capture_id = scan_prompt_captures.id
   where scan_prompt_captures.scan_id = p_scan_id
     and scan_prompt_captures.capture_status in ('uploaded', 'processed')
     and capture_artifacts.artifact_kind = 'raw_audio'
     and capture_artifacts.audio_state in ('stored_private', 'processing');

  if ready_capture_count <> 3 then
    raise exception 'all three prompt captures must have private raw-audio artifacts before scan processing starts'
      using errcode = '23514';
  end if;

  if locked_scan.lifecycle_state = 'queued' then
    update public.scan_sessions
       set lifecycle_state = 'extracting'
     where id = locked_scan.id
     returning * into locked_scan;

    insert into public.audit_events (
      user_id,
      scan_id,
      event_type,
      actor_type,
      previous_state,
      next_state,
      details
    )
    values (
      locked_scan.user_id,
      locked_scan.id,
      'scan.lifecycle_transition',
      'service'::public.audit_actor_type,
      'queued'::public.scan_lifecycle_state,
      'extracting'::public.scan_lifecycle_state,
      jsonb_build_object('source', 'start_scan_processing_run')
    );
  end if;

  insert into public.scan_processing_runs (
    scan_id,
    status,
    protocol_version,
    extractor_version,
    quality_rules_version,
    evidence_registry_version,
    dimension_registry_version,
    inference_rules_version,
    state_registry_version,
    interaction_registry_version,
    pattern_registry_version,
    narrative_registry_version,
    renderer_registry_version,
    idempotency_key,
    started_at
  )
  values (
    p_scan_id,
    'running',
    '1.3',
    p_extractor_version,
    '0.1',
    '0.1',
    '0.1',
    '0.1',
    '0.1',
    '0.1',
    '0.1',
    '0.1',
    p_renderer_registry_version,
    p_idempotency_key,
    now()
  )
  on conflict (idempotency_key) do update
    set idempotency_key = excluded.idempotency_key
  returning * into inserted_run;

  if inserted_run.scan_id <> p_scan_id
    or inserted_run.extractor_version <> p_extractor_version
    or inserted_run.renderer_registry_version <> p_renderer_registry_version
  then
    raise exception 'idempotency key reused with incompatible processing run metadata'
      using errcode = '23505';
  end if;

  processing_run_id := inserted_run.id;
  scan_id := inserted_run.scan_id;
  status := inserted_run.status;
  return next;
end;
$$;

create or replace function public.create_measurement_record(
  p_processing_run_id uuid,
  p_idempotency_key text,
  p_measurement_status text,
  p_prompt_measurements jsonb,
  p_prompt_contrasts jsonb,
  p_quality_summary jsonb,
  p_extractor_provenance jsonb,
  p_semantic_eligibility boolean,
  p_renderer_eligibility boolean
)
returns table (
  measurement_record_id uuid,
  scan_id uuid,
  processing_run_id uuid,
  measurement_status text,
  semantic_eligibility boolean,
  renderer_eligibility boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_run public.scan_processing_runs%rowtype;
  inserted_measurement public.measurement_records%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to create measurement records'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  select *
    into locked_run
    from public.scan_processing_runs
   where id = p_processing_run_id
   for update;

  if not found then
    raise exception 'processing run not found'
      using errcode = '02000';
  end if;

  if locked_run.status not in ('running', 'measurement_recorded') then
    raise exception 'processing run must be running to create a measurement record'
      using errcode = '23514';
  end if;

  insert into public.measurement_records (
    scan_id,
    processing_run_id,
    measurement_schema_version,
    protocol_version,
    extractor_version,
    quality_rules_version,
    measurement_status,
    prompt_measurements,
    prompt_contrasts,
    quality_summary,
    extractor_provenance,
    semantic_eligibility,
    renderer_eligibility,
    idempotency_key
  )
  values (
    locked_run.scan_id,
    locked_run.id,
    '0.1',
    locked_run.protocol_version,
    locked_run.extractor_version,
    locked_run.quality_rules_version,
    p_measurement_status,
    p_prompt_measurements,
    p_prompt_contrasts,
    p_quality_summary,
    p_extractor_provenance,
    p_semantic_eligibility,
    p_renderer_eligibility,
    p_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning * into inserted_measurement;

  if inserted_measurement.id is null then
    select *
      into inserted_measurement
      from public.measurement_records
     where idempotency_key = p_idempotency_key;
  end if;

  if inserted_measurement.processing_run_id <> locked_run.id
    or inserted_measurement.measurement_status <> p_measurement_status
    or inserted_measurement.semantic_eligibility <> p_semantic_eligibility
    or inserted_measurement.renderer_eligibility <> p_renderer_eligibility
  then
    raise exception 'idempotency key reused with incompatible measurement metadata'
      using errcode = '23505';
  end if;

  update public.scan_processing_runs
     set status = 'measurement_recorded'
   where id = locked_run.id
     and status = 'running';

  measurement_record_id := inserted_measurement.id;
  scan_id := inserted_measurement.scan_id;
  processing_run_id := inserted_measurement.processing_run_id;
  measurement_status := inserted_measurement.measurement_status;
  semantic_eligibility := inserted_measurement.semantic_eligibility;
  renderer_eligibility := inserted_measurement.renderer_eligibility;
  return next;
end;
$$;

create or replace function public.create_unresolved_semantic_result(
  p_measurement_record_id uuid,
  p_idempotency_key text
)
returns table (
  semantic_result_id uuid,
  scan_id uuid,
  processing_run_id uuid,
  measurement_record_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_measurement public.measurement_records%rowtype;
  locked_run public.scan_processing_runs%rowtype;
  inserted_semantic public.semantic_result_records%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  dimension_payload jsonb;
  pattern_payload jsonb;
  version_manifest_payload jsonb;
  current_scan_state public.scan_lifecycle_state;
  scan_owner_id uuid;
begin
  if not caller_is_service then
    raise exception 'service role is required to create semantic result records'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = '' then
    raise exception 'idempotency key is required'
      using errcode = '22023';
  end if;

  select *
    into locked_measurement
    from public.measurement_records
   where id = p_measurement_record_id
   for update;

  if not found then
    raise exception 'measurement record not found'
      using errcode = '02000';
  end if;

  select *
    into locked_run
    from public.scan_processing_runs
   where id = locked_measurement.processing_run_id
   for update;

  if not found then
    raise exception 'processing run not found for measurement record'
      using errcode = '02000';
  end if;

  if locked_run.status not in ('measurement_recorded', 'semantic_abstained') then
    raise exception 'processing run must have a measurement record before semantic abstention'
      using errcode = '23514';
  end if;

  dimension_payload := jsonb_build_array(
    jsonb_build_object('dimensionId', 'COG-P1', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'COG-P2', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'COG-P3', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'COG-P4', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'REG-P1', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'REG-P2', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'REG-P3', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'REG-P4', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'NO_RECOVERY_COMPATIBLE_CONDITION'),
    jsonb_build_object('dimensionId', 'CAP-P1', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'CAP-P2', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL'),
    jsonb_build_object('dimensionId', 'CAP-P3', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'CAP-P4', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'EXP-P1', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'EXP-P2', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'EXP-P3', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE'),
    jsonb_build_object('dimensionId', 'EXP-P4', 'resolutionStatus', 'UNRESOLVED', 'resolutionReason', 'NO_RELATIONAL_OBSERVATION')
  );

  pattern_payload := jsonb_build_object(
    'scanId', locked_measurement.scan_id,
    'outcomeType', 'NO_PATTERN_PUBLISHED',
    'candidatePatterns', jsonb_build_array(),
    'supportingConstellations', jsonb_build_array(),
    'supportingDimensions', jsonb_build_array(),
    'supportingInteractions', jsonb_build_array(),
    'contradictingStructures', jsonb_build_array(),
    'coverage', 'INSUFFICIENT_CONSTELLATION_COVERAGE',
    'independence', 'INSUFFICIENT_EVIDENCE_INDEPENDENCE',
    'uncertainty', 'PATTERN_MODEL_NOT_VALIDATED',
    'temporalScope', 'SINGLE_SCAN',
    'publicationStatus', 'NO_PATTERN_PUBLISHED',
    'resolutionReason', 'PATTERN_MODEL_NOT_VALIDATED',
    'patternDecisionRecord', jsonb_build_object(
      'eligiblePatterns', jsonb_build_array(),
      'rejectedPatterns', jsonb_build_array(),
      'primaryReason', 'PATTERN_MODEL_NOT_VALIDATED'
    )
  );

  version_manifest_payload := jsonb_build_object(
    'protocol', locked_run.protocol_version,
    'extractor', locked_run.extractor_version,
    'featureRegistry', '0.1',
    'qualityRules', locked_run.quality_rules_version,
    'evidenceRegistry', locked_run.evidence_registry_version,
    'dimensionRegistry', locked_run.dimension_registry_version,
    'inferenceRules', locked_run.inference_rules_version,
    'stateRegistry', locked_run.state_registry_version,
    'interactionRegistry', locked_run.interaction_registry_version,
    'patternRegistry', locked_run.pattern_registry_version,
    'narrativeRegistry', locked_run.narrative_registry_version,
    'modelRegistry', 'CALIBRATION_REQUIRED',
    'rendererRegistry', locked_run.renderer_registry_version
  );

  insert into public.semantic_result_records (
    scan_id,
    processing_run_id,
    measurement_record_id,
    semantic_schema_version,
    status,
    evidence_ledger,
    dimensions,
    constellation_geometry,
    states_or_blends,
    interactions,
    pattern_result,
    decision_ledger,
    version_manifest,
    idempotency_key
  )
  values (
    locked_measurement.scan_id,
    locked_run.id,
    locked_measurement.id,
    '0.1',
    'unresolved_abstained',
    jsonb_build_array(),
    dimension_payload,
    jsonb_build_array(),
    jsonb_build_array(jsonb_build_object('outcomeType', 'UNRESOLVED', 'resolutionReason', 'MISSING_REQUIRED_EVIDENCE')),
    jsonb_build_array(),
    pattern_payload,
    jsonb_build_array(jsonb_build_object('ruleId', 'SEMANTIC_ABSTENTION_CALIBRATION_REQUIRED', 'resolutionStatus', 'UNRESOLVED')),
    version_manifest_payload,
    p_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning * into inserted_semantic;

  if inserted_semantic.id is null then
    select *
      into inserted_semantic
      from public.semantic_result_records
     where idempotency_key = p_idempotency_key;
  end if;

  if inserted_semantic.measurement_record_id <> locked_measurement.id then
    raise exception 'idempotency key reused with incompatible semantic result metadata'
      using errcode = '23505';
  end if;

  update public.scan_processing_runs as spr
     set status = 'semantic_abstained',
         completed_at = coalesce(completed_at, now())
   where spr.id = locked_run.id
     and spr.status <> 'semantic_abstained';

  select lifecycle_state, user_id
    into current_scan_state, scan_owner_id
    from public.scan_sessions
   where id = locked_measurement.scan_id
   for update;

  if current_scan_state in ('queued', 'extracting') then
    update public.scan_sessions
       set lifecycle_state = 'evidence_ready'
     where id = locked_measurement.scan_id;

    insert into public.audit_events (
      user_id,
      scan_id,
      event_type,
      actor_type,
      previous_state,
      next_state,
      details
    )
    values (
      scan_owner_id,
      locked_measurement.scan_id,
      'scan.lifecycle_transition',
      'service'::public.audit_actor_type,
      current_scan_state,
      'evidence_ready'::public.scan_lifecycle_state,
      jsonb_build_object(
        'source', 'create_unresolved_semantic_result',
        'semantic_result_id', inserted_semantic.id
      )
    );
  end if;

  semantic_result_id := inserted_semantic.id;
  scan_id := inserted_semantic.scan_id;
  processing_run_id := inserted_semantic.processing_run_id;
  measurement_record_id := inserted_semantic.measurement_record_id;
  status := inserted_semantic.status;
  return next;
end;
$$;

comment on function public.register_uploaded_capture_artifact(uuid, text, text, text, bigint, text, text) is
  'Service-only audio artifact intake registration. It stores private raw-audio metadata and queues capture processing without exposing storage URLs.';

comment on function public.start_scan_processing_run(uuid, text, text, text) is
  'Service-only scan processing run starter. It requires all three prompt artifacts and transitions queued scans into extracting.';

comment on function public.create_measurement_record(uuid, text, text, jsonb, jsonb, jsonb, jsonb, boolean, boolean) is
  'Service-only immutable measurement record creator. It stores qualified measurements and quality summaries without semantic scoring.';

comment on function public.create_unresolved_semantic_result(uuid, text) is
  'Service-only semantic abstention creator. It preserves D3 hard abstentions and no-pattern publication until calibrated engines exist.';

alter table public.scan_processing_runs enable row level security;
alter table public.measurement_records enable row level security;
alter table public.semantic_result_records enable row level security;

alter table public.scan_processing_runs force row level security;
alter table public.measurement_records force row level security;
alter table public.semantic_result_records force row level security;

create policy "scan_processing_runs_select_own_scan"
on public.scan_processing_runs
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = scan_processing_runs.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "measurement_records_select_own_scan"
on public.measurement_records
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = measurement_records.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "semantic_result_records_select_own_scan"
on public.semantic_result_records
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = semantic_result_records.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on public.scan_processing_runs from public, anon, authenticated;
revoke all on public.measurement_records from public, anon, authenticated;
revoke all on public.semantic_result_records from public, anon, authenticated;

revoke all on function public.validate_measurement_record_relationship() from public, anon, authenticated;
revoke all on function public.validate_semantic_result_record_relationship() from public, anon, authenticated;
revoke all on function public.prevent_measurement_record_mutation() from public, anon, authenticated;
revoke all on function public.prevent_semantic_result_record_mutation() from public, anon, authenticated;
revoke all on function public.register_uploaded_capture_artifact(uuid, text, text, text, bigint, text, text) from public, anon, authenticated;
revoke all on function public.start_scan_processing_run(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.create_measurement_record(uuid, text, text, jsonb, jsonb, jsonb, jsonb, boolean, boolean) from public, anon, authenticated;
revoke all on function public.create_unresolved_semantic_result(uuid, text) from public, anon, authenticated;

grant select (
  id,
  scan_id,
  status,
  protocol_version,
  extractor_version,
  quality_rules_version,
  evidence_registry_version,
  dimension_registry_version,
  inference_rules_version,
  state_registry_version,
  interaction_registry_version,
  pattern_registry_version,
  narrative_registry_version,
  renderer_registry_version,
  started_at,
  completed_at,
  failure_code,
  created_at,
  updated_at
) on public.scan_processing_runs to authenticated;

grant select on public.measurement_records to authenticated;
grant select on public.semantic_result_records to authenticated;

grant execute on function public.register_uploaded_capture_artifact(uuid, text, text, text, bigint, text, text) to service_role;
grant execute on function public.start_scan_processing_run(uuid, text, text, text) to service_role;
grant execute on function public.create_measurement_record(uuid, text, text, jsonb, jsonb, jsonb, jsonb, boolean, boolean) to service_role;
grant execute on function public.create_unresolved_semantic_result(uuid, text) to service_role;

grant all on public.scan_processing_runs to service_role;
grant all on public.measurement_records to service_role;
grant all on public.semantic_result_records to service_role;
