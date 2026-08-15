-- SoulScope Evidence Engine v1 persistence.
-- Measurement Infrastructure v1 is frozen upstream. This migration adds an
-- immutable Evidence Ledger generated only from immutable MeasurementRecords.
-- It does not implement Dimensions, States, Constellations, Patterns,
-- Narrative, Resonance output, or calibrated psychological/scientific claims.

create table public.evidence_ledgers (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  processing_run_id uuid not null references public.scan_processing_runs(id) on delete restrict,
  measurement_record_id uuid not null references public.measurement_records(id) on delete restrict,
  ledger_schema_version text not null,
  evidence_engine_version text not null,
  evidence_rule_version text not null,
  evidence_registry_version text not null,
  status text not null,
  entries jsonb not null,
  status_counts jsonb not null,
  provenance jsonb not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  constraint evidence_ledgers_status_check
    check (status in ('complete', 'partial', 'invalid')),
  constraint evidence_ledgers_versions_check
    check (
      btrim(ledger_schema_version) <> ''
      and btrim(evidence_engine_version) <> ''
      and btrim(evidence_rule_version) <> ''
      and btrim(evidence_registry_version) <> ''
      and btrim(idempotency_key) <> ''
    ),
  constraint evidence_ledgers_json_shape_check
    check (
      jsonb_typeof(entries) = 'array'
      and jsonb_array_length(entries) > 0
      and jsonb_typeof(status_counts) = 'object'
      and jsonb_typeof(provenance) = 'object'
      and provenance <> '{}'::jsonb
    ),
  constraint evidence_ledgers_status_counts_check
    check (
      status_counts ? 'supported'
      and status_counts ? 'contradicted'
      and status_counts ? 'unavailable'
      and status_counts ? 'rejected'
      and status_counts ? 'insufficient'
    ),
  constraint evidence_ledgers_no_downstream_payload_check
    check (
      not (provenance ? 'dimensions')
      and not (provenance ? 'states')
      and not (provenance ? 'patterns')
      and not (provenance ? 'narrative')
      and not (provenance ? 'resonance')
    )
);

comment on table public.evidence_ledgers is
  'Immutable Evidence Engine v1 ledger generated from one immutable MeasurementRecord. It stores evidence facts, missingness, rejection, provenance, and versions only.';

create index evidence_ledgers_scan_id_idx on public.evidence_ledgers (scan_id);
create index evidence_ledgers_processing_run_id_idx on public.evidence_ledgers (processing_run_id);
create index evidence_ledgers_measurement_record_id_idx on public.evidence_ledgers (measurement_record_id);
create index evidence_ledgers_engine_version_idx on public.evidence_ledgers (evidence_engine_version, evidence_rule_version);

create unique index evidence_ledgers_measurement_engine_rule_unique
on public.evidence_ledgers (measurement_record_id, evidence_engine_version, evidence_rule_version);

create or replace function public.validate_evidence_ledger_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  measurement_scan_id uuid;
  measurement_run_id uuid;
  run_scan_id uuid;
begin
  select scan_id, processing_run_id
    into measurement_scan_id, measurement_run_id
    from public.measurement_records
   where id = new.measurement_record_id;

  if measurement_scan_id is null then
    raise exception 'measurement record not found for evidence ledger %', new.id
      using errcode = '23503';
  end if;

  select scan_id
    into run_scan_id
    from public.scan_processing_runs
   where id = new.processing_run_id;

  if run_scan_id is null then
    raise exception 'processing run not found for evidence ledger %', new.id
      using errcode = '23503';
  end if;

  if measurement_scan_id <> new.scan_id
    or measurement_run_id <> new.processing_run_id
    or run_scan_id <> new.scan_id
  then
    raise exception 'evidence ledger scan, run, and measurement relationships must match'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger evidence_ledgers_validate_relationship
before insert or update of scan_id, processing_run_id, measurement_record_id
on public.evidence_ledgers
for each row execute function public.validate_evidence_ledger_relationship();

create or replace function public.prevent_evidence_ledger_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'evidence_ledgers are immutable'
    using errcode = '42501';
end;
$$;

create trigger evidence_ledgers_prevent_update
before update on public.evidence_ledgers
for each row execute function public.prevent_evidence_ledger_mutation();

create trigger evidence_ledgers_prevent_delete
before delete on public.evidence_ledgers
for each row execute function public.prevent_evidence_ledger_mutation();

create or replace function public.create_evidence_ledger(
  p_measurement_record_id uuid,
  p_idempotency_key text,
  p_evidence_engine_version text,
  p_evidence_rule_version text,
  p_evidence_registry_version text,
  p_ledger_schema_version text,
  p_entries jsonb,
  p_status_counts jsonb,
  p_provenance jsonb
)
returns table (
  evidence_ledger_id uuid,
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
  inserted_ledger public.evidence_ledgers%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
  ledger_status text;
begin
  if not caller_is_service then
    raise exception 'service role is required to create evidence ledgers'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = ''
    or coalesce(btrim(p_evidence_engine_version), '') = ''
    or coalesce(btrim(p_evidence_rule_version), '') = ''
    or coalesce(btrim(p_evidence_registry_version), '') = ''
    or coalesce(btrim(p_ledger_schema_version), '') = ''
  then
    raise exception 'idempotency key and evidence versions are required'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) = 0 then
    raise exception 'evidence entries must be a non-empty JSON array'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_status_counts) <> 'object' or jsonb_typeof(p_provenance) <> 'object' then
    raise exception 'evidence status counts and provenance must be JSON objects'
      using errcode = '22023';
  end if;

  if coalesce((p_provenance ->> 'raw_audio_consumed')::boolean, false) then
    raise exception 'Evidence Engine may not consume raw audio'
      using errcode = '23514';
  end if;

  if coalesce((p_provenance ->> 'acoustic_extraction_rerun')::boolean, false) then
    raise exception 'Evidence Engine may not rerun acoustic extraction'
      using errcode = '23514';
  end if;

  select *
    into locked_measurement
    from public.measurement_records
   where id = p_measurement_record_id
   for share;

  if not found then
    raise exception 'measurement record not found'
      using errcode = '02000';
  end if;

  ledger_status := case
    when coalesce((p_status_counts ->> 'supported')::integer, 0) > 0 then 'complete'
    else 'partial'
  end;

  insert into public.evidence_ledgers (
    scan_id,
    processing_run_id,
    measurement_record_id,
    ledger_schema_version,
    evidence_engine_version,
    evidence_rule_version,
    evidence_registry_version,
    status,
    entries,
    status_counts,
    provenance,
    idempotency_key
  )
  values (
    locked_measurement.scan_id,
    locked_measurement.processing_run_id,
    locked_measurement.id,
    p_ledger_schema_version,
    p_evidence_engine_version,
    p_evidence_rule_version,
    p_evidence_registry_version,
    ledger_status,
    p_entries,
    p_status_counts,
    p_provenance,
    p_idempotency_key
  )
  on conflict (idempotency_key) do nothing
  returning * into inserted_ledger;

  if inserted_ledger.id is null then
    select *
      into inserted_ledger
      from public.evidence_ledgers
     where idempotency_key = p_idempotency_key;
  end if;

  if inserted_ledger.measurement_record_id <> locked_measurement.id
    or inserted_ledger.evidence_engine_version <> p_evidence_engine_version
    or inserted_ledger.evidence_rule_version <> p_evidence_rule_version
    or inserted_ledger.evidence_registry_version <> p_evidence_registry_version
    or inserted_ledger.ledger_schema_version <> p_ledger_schema_version
    or inserted_ledger.entries <> p_entries
    or inserted_ledger.status_counts <> p_status_counts
  then
    raise exception 'idempotency key reused with incompatible evidence ledger metadata'
      using errcode = '23505';
  end if;

  evidence_ledger_id := inserted_ledger.id;
  scan_id := inserted_ledger.scan_id;
  processing_run_id := inserted_ledger.processing_run_id;
  measurement_record_id := inserted_ledger.measurement_record_id;
  status := inserted_ledger.status;
  return next;
end;
$$;

comment on function public.create_evidence_ledger(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) is
  'Service-only immutable Evidence Ledger creator. It consumes one MeasurementRecord and persists structural evidence facts without downstream inference.';

alter table public.evidence_ledgers enable row level security;
alter table public.evidence_ledgers force row level security;

create policy "evidence_ledgers_select_own_scan"
on public.evidence_ledgers
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = evidence_ledgers.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on public.evidence_ledgers from public, anon, authenticated;
revoke all on function public.validate_evidence_ledger_relationship() from public, anon, authenticated;
revoke all on function public.prevent_evidence_ledger_mutation() from public, anon, authenticated;
revoke all on function public.create_evidence_ledger(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;

grant select on public.evidence_ledgers to authenticated;
grant execute on function public.create_evidence_ledger(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) to service_role;
grant all on public.evidence_ledgers to service_role;
