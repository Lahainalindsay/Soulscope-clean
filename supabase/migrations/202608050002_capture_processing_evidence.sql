-- SoulScope capture processing and Evidence Ledger persistence foundation.
-- Status: proposed backend infrastructure, not Canon.
-- Raw audio is not retained by default. Storage paths are private implementation details.
-- No public audio URL is stored, and signed authorization is not persisted.
-- The Evidence Ledger table does not define scientific meaning.
-- No scoring, dimension derivation, narrative, or rendering is implemented.
-- The instrument provides evidence. The individual provides meaning.

create table public.capture_artifacts (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  capture_id uuid not null references public.scan_prompt_captures(id) on delete restrict,
  artifact_kind text not null,
  audio_state text not null,
  storage_bucket text,
  storage_object_path text,
  mime_type text,
  byte_size bigint,
  checksum_sha256 text,
  deletion_requested_at timestamptz,
  deleted_at timestamptz,
  deletion_failure_code text,
  deletion_failure_detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint capture_artifacts_kind_check
    check (artifact_kind = 'raw_audio'),
  constraint capture_artifacts_audio_state_check
    check (
      audio_state in (
        'not_created',
        'uploading',
        'stored_private',
        'processing',
        'deletion_pending',
        'deleted',
        'deletion_failed'
      )
    ),
  constraint capture_artifacts_byte_size_check
    check (byte_size is null or byte_size >= 0),
  constraint capture_artifacts_checksum_sha256_check
    check (checksum_sha256 is null or checksum_sha256 ~ '^[0-9a-fA-F]{64}$'),
  constraint capture_artifacts_deleted_timestamp_check
    check (
      (audio_state = 'deleted' and deleted_at is not null)
      or (audio_state <> 'deleted' and deleted_at is null)
    ),
  constraint capture_artifacts_deletion_requested_check
    check (
      (audio_state in ('deletion_pending', 'deleted', 'deletion_failed') and deletion_requested_at is not null)
      or (audio_state not in ('deletion_pending', 'deleted', 'deletion_failed'))
    ),
  constraint capture_artifacts_deletion_failed_detail_check
    check (
      (audio_state = 'deletion_failed' and (deletion_failure_code is not null or deletion_failure_detail is not null))
      or (audio_state <> 'deletion_failed')
    ),
  constraint capture_artifacts_private_location_check
    check (
      (storage_bucket is null or storage_bucket !~* '^[a-z][a-z0-9+.-]*://')
      and (
        storage_object_path is null
        or (
          storage_object_path !~* '^[a-z][a-z0-9+.-]*://'
          and storage_object_path !~* '(^|[?&])(x-amz-signature|signature|token|expires)='
        )
      )
    ),
  constraint capture_artifacts_one_raw_audio_per_capture
    unique (capture_id, artifact_kind)
);

comment on table public.capture_artifacts is
  'Raw audio is not retained by default. This table stores private artifact metadata and deletion state only. Actual Supabase Storage bucket creation is deferred.';

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  capture_id uuid references public.scan_prompt_captures(id) on delete restrict,
  artifact_id uuid references public.capture_artifacts(id) on delete restrict,
  job_type text not null,
  status text not null,
  idempotency_key text not null,
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  started_at timestamptz,
  completed_at timestamptz,
  last_error_code text,
  last_error_detail text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint processing_jobs_type_check
    check (job_type in ('capture_processing', 'audio_deletion')),
  constraint processing_jobs_status_check
    check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  constraint processing_jobs_idempotency_unique
    unique (idempotency_key),
  constraint processing_jobs_attempts_check
    check (attempt_count >= 0 and max_attempts > 0 and attempt_count <= max_attempts),
  constraint processing_jobs_running_started_check
    check ((status = 'running' and started_at is not null) or status <> 'running'),
  constraint processing_jobs_completed_status_check
    check (
      (status in ('succeeded', 'failed', 'cancelled') and completed_at is not null)
      or (status in ('queued', 'running') and completed_at is null)
    ),
  constraint processing_jobs_payload_object_check
    check (jsonb_typeof(payload) = 'object'),
  constraint processing_jobs_required_references_check
    check (
      (job_type = 'audio_deletion' and artifact_id is not null)
      or (job_type = 'capture_processing' and capture_id is not null and artifact_id is not null)
    )
);

comment on table public.processing_jobs is
  'Idempotent backend processing job metadata only. This table does not implement extraction, scoring, interpretation, or object deletion.';

create table public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  capture_id uuid not null references public.scan_prompt_captures(id) on delete restrict,
  source_artifact_id uuid not null references public.capture_artifacts(id) on delete restrict,
  processing_job_id uuid not null references public.processing_jobs(id) on delete restrict,
  feature_id text not null,
  evidence_state text not null,
  raw_value jsonb,
  normalized_value jsonb,
  unit text,
  confidence numeric,
  coverage numeric,
  quality_state text not null,
  rejection_reason text,
  extractor_version text not null,
  normalization_version text not null,
  provenance jsonb not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  constraint evidence_records_state_check
    check (evidence_state in ('observed', 'missing', 'rejected')),
  constraint evidence_records_quality_state_check
    check (quality_state in ('acceptable', 'limited', 'rejected', 'not_available')),
  constraint evidence_records_idempotency_unique
    unique (idempotency_key),
  constraint evidence_records_feature_id_check
    check (btrim(feature_id) <> ''),
  constraint evidence_records_extractor_version_check
    check (btrim(extractor_version) <> ''),
  constraint evidence_records_normalization_version_check
    check (btrim(normalization_version) <> ''),
  constraint evidence_records_confidence_check
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  constraint evidence_records_coverage_check
    check (coverage is null or (coverage >= 0 and coverage <= 1)),
  constraint evidence_records_provenance_object_check
    check (jsonb_typeof(provenance) = 'object' and provenance <> '{}'::jsonb),
  constraint evidence_records_missing_value_check
    check (
      (evidence_state = 'missing' and raw_value is null and normalized_value is null)
      or evidence_state <> 'missing'
    ),
  constraint evidence_records_rejected_reason_check
    check (
      (evidence_state = 'rejected' and rejection_reason is not null)
      or evidence_state <> 'rejected'
    ),
  constraint evidence_records_observed_value_check
    check (
      (evidence_state = 'observed' and raw_value is not null and rejection_reason is null)
      or evidence_state <> 'observed'
    )
);

comment on table public.evidence_records is
  'Append-only Evidence Ledger persistence. It records evidence, missingness, rejection, versions, and provenance only; it does not define scientific meaning.';

create index capture_artifacts_scan_id_idx on public.capture_artifacts (scan_id);
create index capture_artifacts_capture_id_idx on public.capture_artifacts (capture_id);
create index capture_artifacts_audio_state_idx on public.capture_artifacts (audio_state);
create index processing_jobs_queue_idx on public.processing_jobs (status, available_at) where status = 'queued';
create index processing_jobs_scan_id_idx on public.processing_jobs (scan_id);
create index processing_jobs_capture_id_idx on public.processing_jobs (capture_id);
create index processing_jobs_artifact_id_idx on public.processing_jobs (artifact_id);
create index processing_jobs_type_status_idx on public.processing_jobs (job_type, status);
create index evidence_records_scan_id_idx on public.evidence_records (scan_id);
create index evidence_records_capture_id_idx on public.evidence_records (capture_id);
create index evidence_records_feature_id_idx on public.evidence_records (feature_id);
create index evidence_records_source_artifact_id_idx on public.evidence_records (source_artifact_id);
create index evidence_records_processing_job_id_idx on public.evidence_records (processing_job_id);
create index evidence_records_extractor_version_idx on public.evidence_records (extractor_version);

create trigger capture_artifacts_set_updated_at
before update on public.capture_artifacts
for each row execute function public.set_updated_at();

create trigger processing_jobs_set_updated_at
before update on public.processing_jobs
for each row execute function public.set_updated_at();

create or replace function public.validate_capture_artifact_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  capture_scan_id uuid;
begin
  select scan_id
    into capture_scan_id
    from public.scan_prompt_captures
   where id = new.capture_id;

  if capture_scan_id is null then
    raise exception 'capture not found for artifact %', new.id
      using errcode = '23503';
  end if;

  if capture_scan_id <> new.scan_id then
    raise exception 'artifact capture does not belong to artifact scan'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger capture_artifacts_validate_relationship
before insert or update of scan_id, capture_id
on public.capture_artifacts
for each row execute function public.validate_capture_artifact_relationship();

create or replace function public.validate_processing_job_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  capture_scan_id uuid;
  artifact_scan_id uuid;
  artifact_capture_id uuid;
begin
  if new.capture_id is not null then
    select scan_id
      into capture_scan_id
      from public.scan_prompt_captures
     where id = new.capture_id;

    if capture_scan_id is null then
      raise exception 'capture not found for processing job %', new.id
        using errcode = '23503';
    end if;

    if capture_scan_id <> new.scan_id then
      raise exception 'processing job capture does not belong to job scan'
        using errcode = '23514';
    end if;
  end if;

  if new.artifact_id is not null then
    select scan_id, capture_id
      into artifact_scan_id, artifact_capture_id
      from public.capture_artifacts
     where id = new.artifact_id;

    if artifact_scan_id is null then
      raise exception 'artifact not found for processing job %', new.id
        using errcode = '23503';
    end if;

    if artifact_scan_id <> new.scan_id then
      raise exception 'processing job artifact does not belong to job scan'
        using errcode = '23514';
    end if;

    if new.capture_id is not null and artifact_capture_id <> new.capture_id then
      raise exception 'processing job artifact does not belong to job capture'
        using errcode = '23514';
    end if;
  end if;

  return new;
end;
$$;

create trigger processing_jobs_validate_relationship
before insert or update of scan_id, capture_id, artifact_id
on public.processing_jobs
for each row execute function public.validate_processing_job_relationship();

create or replace function public.validate_evidence_record_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  capture_scan_id uuid;
  artifact_scan_id uuid;
  artifact_capture_id uuid;
  job_scan_id uuid;
  job_capture_id uuid;
  job_artifact_id uuid;
begin
  select scan_id
    into capture_scan_id
    from public.scan_prompt_captures
   where id = new.capture_id;

  if capture_scan_id is null then
    raise exception 'capture not found for evidence record %', new.id
      using errcode = '23503';
  end if;

  if capture_scan_id <> new.scan_id then
    raise exception 'evidence capture does not belong to evidence scan'
      using errcode = '23514';
  end if;

  select scan_id, capture_id
    into artifact_scan_id, artifact_capture_id
    from public.capture_artifacts
   where id = new.source_artifact_id;

  if artifact_scan_id is null then
    raise exception 'source artifact not found for evidence record %', new.id
      using errcode = '23503';
  end if;

  if artifact_scan_id <> new.scan_id or artifact_capture_id <> new.capture_id then
    raise exception 'evidence source artifact does not match evidence scan and capture'
      using errcode = '23514';
  end if;

  select scan_id, capture_id, artifact_id
    into job_scan_id, job_capture_id, job_artifact_id
    from public.processing_jobs
   where id = new.processing_job_id;

  if job_scan_id is null then
    raise exception 'processing job not found for evidence record %', new.id
      using errcode = '23503';
  end if;

  if job_scan_id <> new.scan_id then
    raise exception 'evidence processing job does not belong to evidence scan'
      using errcode = '23514';
  end if;

  if job_capture_id is not null and job_capture_id <> new.capture_id then
    raise exception 'evidence processing job does not match evidence capture'
      using errcode = '23514';
  end if;

  if job_artifact_id is not null and job_artifact_id <> new.source_artifact_id then
    raise exception 'evidence processing job does not match evidence artifact'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger evidence_records_validate_relationship
before insert or update of scan_id, capture_id, source_artifact_id, processing_job_id
on public.evidence_records
for each row execute function public.validate_evidence_record_relationship();

create or replace function public.prevent_evidence_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'evidence_records are append-only'
    using errcode = '42501';
end;
$$;

create trigger evidence_records_prevent_update
before update on public.evidence_records
for each row execute function public.prevent_evidence_mutation();

create trigger evidence_records_prevent_delete
before delete on public.evidence_records
for each row execute function public.prevent_evidence_mutation();

create or replace function public.request_audio_deletion(p_artifact_id uuid)
returns table (
  artifact_id uuid,
  scan_id uuid,
  capture_id uuid,
  audio_state text,
  deletion_requested_at timestamptz,
  job_id uuid,
  job_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_artifact public.capture_artifacts%rowtype;
  scan_owner_id uuid;
  previous_audio_state text;
  caller_user_id uuid := auth.uid();
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  deletion_job_key text;
begin
  select capture_artifacts.*
    into locked_artifact
    from public.capture_artifacts
    join public.scan_sessions on scan_sessions.id = capture_artifacts.scan_id
   where capture_artifacts.id = p_artifact_id
   for update of capture_artifacts;

  if not found then
    raise exception 'artifact not found'
      using errcode = '02000';
  end if;

  select user_id
    into scan_owner_id
    from public.scan_sessions
   where id = locked_artifact.scan_id;

  if not caller_is_service then
    if caller_user_id is null or caller_user_id <> scan_owner_id then
      raise exception 'not authorized to request audio deletion'
        using errcode = '42501';
    end if;
  end if;

  deletion_job_key := 'audio-deletion:' || locked_artifact.id::text;

  if locked_artifact.audio_state in ('deleted', 'deletion_pending') then
    select processing_jobs.id, processing_jobs.status
      into job_id, job_status
      from public.processing_jobs
     where processing_jobs.idempotency_key = deletion_job_key;

    artifact_id := locked_artifact.id;
    scan_id := locked_artifact.scan_id;
    capture_id := locked_artifact.capture_id;
    audio_state := locked_artifact.audio_state;
    deletion_requested_at := locked_artifact.deletion_requested_at;
    return next;
    return;
  end if;

  if locked_artifact.audio_state in ('not_created', 'uploading') then
    raise exception 'audio deletion cannot be requested from state %', locked_artifact.audio_state
      using errcode = '23514';
  end if;

  if locked_artifact.audio_state not in ('stored_private', 'processing', 'deletion_failed') then
    raise exception 'audio deletion cannot be requested from state %', locked_artifact.audio_state
      using errcode = '23514';
  end if;

  previous_audio_state := locked_artifact.audio_state;

  update public.capture_artifacts
     set audio_state = 'deletion_pending',
         deletion_requested_at = coalesce(deletion_requested_at, now()),
         deleted_at = null,
         deletion_failure_code = null,
         deletion_failure_detail = null
   where id = locked_artifact.id
   returning * into locked_artifact;

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
    locked_artifact.scan_id,
    locked_artifact.capture_id,
    locked_artifact.id,
    'audio_deletion',
    'queued',
    deletion_job_key,
    '{}'::jsonb
  )
  on conflict (idempotency_key) do update
    set status = 'queued',
        available_at = now(),
        started_at = null,
        completed_at = null,
        last_error_code = null,
        last_error_detail = null
  returning public.processing_jobs.id, public.processing_jobs.status into job_id, job_status;

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
    locked_artifact.scan_id,
    'audio.deletion_requested',
    case when caller_is_service then 'service'::public.audit_actor_type else 'user'::public.audit_actor_type end,
    case when caller_is_service then null else caller_user_id end,
    jsonb_build_object(
      'artifact_id', locked_artifact.id,
      'capture_id', locked_artifact.capture_id,
      'previous_audio_state', previous_audio_state,
      'next_audio_state', locked_artifact.audio_state
    )
  );

  artifact_id := locked_artifact.id;
  scan_id := locked_artifact.scan_id;
  capture_id := locked_artifact.capture_id;
  audio_state := locked_artifact.audio_state;
  deletion_requested_at := locked_artifact.deletion_requested_at;
  return next;
end;
$$;

create or replace function public.record_audio_deletion_result(
  p_artifact_id uuid,
  p_succeeded boolean,
  p_failure_code text default null,
  p_failure_detail text default null
)
returns table (
  artifact_id uuid,
  scan_id uuid,
  capture_id uuid,
  audio_state text,
  deletion_requested_at timestamptz,
  deleted_at timestamptz,
  job_id uuid,
  job_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_artifact public.capture_artifacts%rowtype;
  locked_job public.processing_jobs%rowtype;
  scan_owner_id uuid;
  previous_audio_state text;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  deletion_job_key text;
begin
  if not caller_is_service then
    raise exception 'service role is required to record audio deletion results'
      using errcode = '42501';
  end if;

  if not p_succeeded and p_failure_code is null and p_failure_detail is null then
    raise exception 'failure code or detail is required when deletion fails'
      using errcode = '22023';
  end if;

  select capture_artifacts.*
    into locked_artifact
    from public.capture_artifacts
    join public.scan_sessions on scan_sessions.id = capture_artifacts.scan_id
   where capture_artifacts.id = p_artifact_id
   for update of capture_artifacts;

  if not found then
    raise exception 'artifact not found'
      using errcode = '02000';
  end if;

  deletion_job_key := 'audio-deletion:' || locked_artifact.id::text;

  select *
    into locked_job
    from public.processing_jobs
   where idempotency_key = deletion_job_key
   for update;

  if not found then
    raise exception 'audio deletion job not found for artifact %', locked_artifact.id
      using errcode = '02000';
  end if;

  select user_id
    into scan_owner_id
    from public.scan_sessions
   where id = locked_artifact.scan_id;

  if locked_artifact.audio_state = 'deleted' and p_succeeded then
    artifact_id := locked_artifact.id;
    scan_id := locked_artifact.scan_id;
    capture_id := locked_artifact.capture_id;
    audio_state := locked_artifact.audio_state;
    deletion_requested_at := locked_artifact.deletion_requested_at;
    deleted_at := locked_artifact.deleted_at;
    job_id := locked_job.id;
    job_status := locked_job.status;
    return next;
    return;
  end if;

  if locked_artifact.audio_state not in ('deletion_pending', 'deletion_failed') then
    raise exception 'audio deletion result cannot be recorded from state %', locked_artifact.audio_state
      using errcode = '23514';
  end if;

  previous_audio_state := locked_artifact.audio_state;

  if p_succeeded then
    update public.capture_artifacts
       set audio_state = 'deleted',
           deleted_at = now(),
           deletion_failure_code = null,
           deletion_failure_detail = null,
           storage_bucket = null,
           storage_object_path = null
     where id = locked_artifact.id
     returning * into locked_artifact;

    update public.processing_jobs
       set status = 'succeeded',
           completed_at = now(),
           last_error_code = null,
           last_error_detail = null
     where id = locked_job.id
     returning * into locked_job;

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
      locked_artifact.scan_id,
      'audio.deletion_succeeded',
      'service',
      null,
      jsonb_build_object(
        'artifact_id', locked_artifact.id,
        'capture_id', locked_artifact.capture_id,
        'previous_audio_state', previous_audio_state,
        'next_audio_state', locked_artifact.audio_state
      )
    );
  else
    update public.capture_artifacts
       set audio_state = 'deletion_failed',
           deleted_at = null,
           deletion_failure_code = p_failure_code,
           deletion_failure_detail = p_failure_detail
     where id = locked_artifact.id
     returning * into locked_artifact;

    update public.processing_jobs
       set status = 'failed',
           completed_at = now(),
           last_error_code = p_failure_code,
           last_error_detail = p_failure_detail
     where id = locked_job.id
     returning * into locked_job;

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
      locked_artifact.scan_id,
      'audio.deletion_failed',
      'service',
      null,
      jsonb_build_object(
        'artifact_id', locked_artifact.id,
        'capture_id', locked_artifact.capture_id,
        'previous_audio_state', previous_audio_state,
        'next_audio_state', locked_artifact.audio_state,
        'failure_code', p_failure_code
      )
    );
  end if;

  artifact_id := locked_artifact.id;
  scan_id := locked_artifact.scan_id;
  capture_id := locked_artifact.capture_id;
  audio_state := locked_artifact.audio_state;
  deletion_requested_at := locked_artifact.deletion_requested_at;
  deleted_at := locked_artifact.deleted_at;
  job_id := locked_job.id;
  job_status := locked_job.status;
  return next;
end;
$$;

comment on function public.request_audio_deletion(uuid) is
  'Requests raw-audio deletion without exposing storage paths. This function does not delete storage objects.';

comment on function public.record_audio_deletion_result(uuid, boolean, text, text) is
  'Service-only raw-audio deletion result recorder. This function records deletion outcome metadata only.';

alter table public.capture_artifacts enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.evidence_records enable row level security;

alter table public.capture_artifacts force row level security;
alter table public.processing_jobs force row level security;
alter table public.evidence_records force row level security;

create policy "capture_artifacts_select_own_scan"
on public.capture_artifacts
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = capture_artifacts.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "processing_jobs_select_own_scan"
on public.processing_jobs
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = processing_jobs.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

create policy "evidence_records_select_own_scan"
on public.evidence_records
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = evidence_records.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on public.capture_artifacts from public, anon, authenticated;
revoke all on public.processing_jobs from public, anon, authenticated;
revoke all on public.evidence_records from public, anon, authenticated;
revoke all on function public.validate_capture_artifact_relationship() from public, anon, authenticated;
revoke all on function public.validate_processing_job_relationship() from public, anon, authenticated;
revoke all on function public.validate_evidence_record_relationship() from public, anon, authenticated;
revoke all on function public.prevent_evidence_mutation() from public, anon, authenticated;
revoke all on function public.request_audio_deletion(uuid) from public, anon, authenticated;
revoke all on function public.record_audio_deletion_result(uuid, boolean, text, text) from public, anon, authenticated;

grant select (
  id,
  scan_id,
  capture_id,
  artifact_kind,
  audio_state,
  mime_type,
  byte_size,
  checksum_sha256,
  deletion_requested_at,
  deleted_at,
  deletion_failure_code,
  created_at,
  updated_at
) on public.capture_artifacts to authenticated;

grant select (
  id,
  scan_id,
  capture_id,
  artifact_id,
  job_type,
  status,
  attempt_count,
  max_attempts,
  available_at,
  locked_at,
  started_at,
  completed_at,
  last_error_code,
  created_at,
  updated_at
) on public.processing_jobs to authenticated;

grant select on public.evidence_records to authenticated;
grant execute on function public.request_audio_deletion(uuid) to authenticated, service_role;
grant execute on function public.record_audio_deletion_result(uuid, boolean, text, text) to service_role;

grant all on public.capture_artifacts to service_role;
grant all on public.processing_jobs to service_role;
grant insert, select on public.evidence_records to service_role;
