-- SoulScope Dimension Engine v1 persistence.
-- Measurement and Evidence v1 are frozen upstream. This migration adds an
-- immutable Dimension Result generated only from immutable Evidence Ledgers.
-- It does not implement State, Constellation, Pattern, Narrative, Resonance
-- output, or calibrated psychological/scientific scoring.

create table public.dimension_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete restrict,
  processing_run_id uuid not null references public.scan_processing_runs(id) on delete restrict,
  measurement_record_id uuid not null references public.measurement_records(id) on delete restrict,
  evidence_ledger_id uuid not null references public.evidence_ledgers(id) on delete restrict,
  result_schema_version text not null,
  dimension_engine_version text not null,
  dimension_registry_version text not null,
  dimension_scoring_version text not null,
  status text not null,
  dimensions jsonb not null,
  status_counts jsonb not null,
  provenance jsonb not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  constraint dimension_results_status_check
    check (status in ('unresolved_abstained', 'invalid')),
  constraint dimension_results_versions_check
    check (
      btrim(result_schema_version) <> ''
      and btrim(dimension_engine_version) <> ''
      and btrim(dimension_registry_version) <> ''
      and btrim(dimension_scoring_version) <> ''
      and btrim(idempotency_key) <> ''
    ),
  constraint dimension_results_json_shape_check
    check (
      jsonb_typeof(dimensions) = 'array'
      and jsonb_array_length(dimensions) = 16
      and jsonb_typeof(status_counts) = 'object'
      and jsonb_typeof(provenance) = 'object'
      and provenance <> '{}'::jsonb
    ),
  constraint dimension_results_status_counts_check
    check (
      status_counts ? 'unresolved'
      and status_counts ? 'resolved'
      and status_counts ? 'invalid'
    ),
  constraint dimension_results_scoring_version_check
    check (dimension_scoring_version = 'CALIBRATION_REQUIRED'),
  constraint dimension_results_no_downstream_payload_check
    check (
      not (provenance ? 'state')
      and not (provenance ? 'constellation')
      and not (provenance ? 'pattern')
      and not (provenance ? 'narrative')
      and not (provenance ? 'resonance')
    )
);

comment on table public.dimension_results is
  'Immutable Dimension Engine v1 result generated from one immutable Evidence Ledger. It preserves canonical dimensions, unresolved abstentions, provenance, and versions only; calibrated scoring is deferred.';

create index dimension_results_scan_id_idx on public.dimension_results (scan_id);
create index dimension_results_processing_run_id_idx on public.dimension_results (processing_run_id);
create index dimension_results_measurement_record_id_idx on public.dimension_results (measurement_record_id);
create index dimension_results_evidence_ledger_id_idx on public.dimension_results (evidence_ledger_id);
create index dimension_results_engine_version_idx on public.dimension_results (dimension_engine_version, dimension_scoring_version);

alter table public.dimension_results
  add constraint dimension_results_ledger_engine_scoring_unique
  unique (evidence_ledger_id, dimension_engine_version, dimension_registry_version, dimension_scoring_version);

create or replace function public.validate_dimension_result_relationship()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  ledger_scan_id uuid;
  ledger_run_id uuid;
  ledger_measurement_id uuid;
  run_scan_id uuid;
  measurement_scan_id uuid;
  measurement_run_id uuid;
begin
  select scan_id, processing_run_id, measurement_record_id
    into ledger_scan_id, ledger_run_id, ledger_measurement_id
    from public.evidence_ledgers
   where id = new.evidence_ledger_id;

  if ledger_scan_id is null then
    raise exception 'evidence ledger not found for dimension result %', new.id
      using errcode = '23503';
  end if;

  select scan_id
    into run_scan_id
    from public.scan_processing_runs
   where id = new.processing_run_id;

  select scan_id, processing_run_id
    into measurement_scan_id, measurement_run_id
    from public.measurement_records
   where id = new.measurement_record_id;

  if run_scan_id is null or measurement_scan_id is null then
    raise exception 'dimension result processing run or measurement record not found'
      using errcode = '23503';
  end if;

  if ledger_scan_id <> new.scan_id
    or ledger_run_id <> new.processing_run_id
    or ledger_measurement_id <> new.measurement_record_id
    or run_scan_id <> new.scan_id
    or measurement_scan_id <> new.scan_id
    or measurement_run_id <> new.processing_run_id
  then
    raise exception 'dimension result scan, run, measurement, and evidence ledger relationships must match'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger dimension_results_validate_relationship
before insert or update of scan_id, processing_run_id, measurement_record_id, evidence_ledger_id
on public.dimension_results
for each row execute function public.validate_dimension_result_relationship();

create or replace function public.prevent_dimension_result_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'dimension_results are immutable'
    using errcode = '42501';
end;
$$;

create trigger dimension_results_prevent_update
before update on public.dimension_results
for each row execute function public.prevent_dimension_result_mutation();

create trigger dimension_results_prevent_delete
before delete on public.dimension_results
for each row execute function public.prevent_dimension_result_mutation();

create or replace function public.create_dimension_result(
  p_evidence_ledger_id uuid,
  p_idempotency_key text,
  p_dimension_engine_version text,
  p_dimension_registry_version text,
  p_dimension_scoring_version text,
  p_result_schema_version text,
  p_dimensions jsonb,
  p_status_counts jsonb,
  p_provenance jsonb
)
returns table (
  dimension_result_id uuid,
  scan_id uuid,
  processing_run_id uuid,
  measurement_record_id uuid,
  evidence_ledger_id uuid,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_ledger public.evidence_ledgers%rowtype;
  inserted_result public.dimension_results%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to create dimension results'
      using errcode = '42501';
  end if;

  if coalesce(btrim(p_idempotency_key), '') = ''
    or coalesce(btrim(p_dimension_engine_version), '') = ''
    or coalesce(btrim(p_dimension_registry_version), '') = ''
    or coalesce(btrim(p_dimension_scoring_version), '') = ''
    or coalesce(btrim(p_result_schema_version), '') = ''
  then
    raise exception 'idempotency key and dimension versions are required'
      using errcode = '22023';
  end if;

  if p_dimension_scoring_version <> 'CALIBRATION_REQUIRED' then
    raise exception 'Dimension Engine v1 cannot persist calibrated scores'
      using errcode = '23514';
  end if;

  if jsonb_typeof(p_dimensions) <> 'array' or jsonb_array_length(p_dimensions) <> 16 then
    raise exception 'dimension result must contain exactly 16 dimension entries'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_status_counts) <> 'object' or jsonb_typeof(p_provenance) <> 'object' then
    raise exception 'dimension status counts and provenance must be JSON objects'
      using errcode = '22023';
  end if;

  if coalesce((p_provenance ->> 'raw_audio_consumed')::boolean, false) then
    raise exception 'Dimension Engine may not consume raw audio'
      using errcode = '23514';
  end if;

  if coalesce((p_provenance ->> 'measurement_record_consumed_directly')::boolean, false) then
    raise exception 'Dimension Engine must consume Evidence Ledger, not MeasurementRecord directly'
      using errcode = '23514';
  end if;

  if coalesce((p_provenance ->> 'downstream_state_generated')::boolean, false)
    or coalesce((p_provenance ->> 'downstream_pattern_generated')::boolean, false)
    or coalesce((p_provenance ->> 'narrative_generated')::boolean, false)
    or coalesce((p_provenance ->> 'resonance_generated')::boolean, false)
  then
    raise exception 'Dimension Engine v1 may not generate downstream outputs'
      using errcode = '23514';
  end if;

  select *
    into locked_ledger
    from public.evidence_ledgers
   where id = p_evidence_ledger_id
   for share;

  if not found then
    raise exception 'evidence ledger not found'
      using errcode = '02000';
  end if;

  select *
    into inserted_result
    from public.dimension_results
   where idempotency_key = p_idempotency_key;

  if inserted_result.id is not null then
    if inserted_result.evidence_ledger_id <> locked_ledger.id
      or inserted_result.dimension_engine_version <> p_dimension_engine_version
      or inserted_result.dimension_registry_version <> p_dimension_registry_version
      or inserted_result.dimension_scoring_version <> p_dimension_scoring_version
      or inserted_result.result_schema_version <> p_result_schema_version
      or inserted_result.dimensions <> p_dimensions
      or inserted_result.status_counts <> p_status_counts
    then
      raise exception 'idempotency key reused with incompatible dimension result metadata'
        using errcode = '23505';
    end if;

    dimension_result_id := inserted_result.id;
    scan_id := inserted_result.scan_id;
    processing_run_id := inserted_result.processing_run_id;
    measurement_record_id := inserted_result.measurement_record_id;
    evidence_ledger_id := inserted_result.evidence_ledger_id;
    status := inserted_result.status;
    return next;
    return;
  end if;

  insert into public.dimension_results (
    scan_id,
    processing_run_id,
    measurement_record_id,
    evidence_ledger_id,
    result_schema_version,
    dimension_engine_version,
    dimension_registry_version,
    dimension_scoring_version,
    status,
    dimensions,
    status_counts,
    provenance,
    idempotency_key
  )
  values (
    locked_ledger.scan_id,
    locked_ledger.processing_run_id,
    locked_ledger.measurement_record_id,
    locked_ledger.id,
    p_result_schema_version,
    p_dimension_engine_version,
    p_dimension_registry_version,
    p_dimension_scoring_version,
    'unresolved_abstained',
    p_dimensions,
    p_status_counts,
    p_provenance,
    p_idempotency_key
  )
  on conflict on constraint dimension_results_ledger_engine_scoring_unique do nothing
  returning * into inserted_result;

  if inserted_result.id is null then
    select *
      into inserted_result
      from public.dimension_results
     where dimension_results.evidence_ledger_id = locked_ledger.id
       and dimension_results.dimension_engine_version = p_dimension_engine_version
       and dimension_results.dimension_registry_version = p_dimension_registry_version
       and dimension_results.dimension_scoring_version = p_dimension_scoring_version;
  end if;

  if inserted_result.evidence_ledger_id <> locked_ledger.id
    or inserted_result.dimension_engine_version <> p_dimension_engine_version
    or inserted_result.dimension_registry_version <> p_dimension_registry_version
    or inserted_result.dimension_scoring_version <> p_dimension_scoring_version
    or inserted_result.result_schema_version <> p_result_schema_version
    or inserted_result.dimensions <> p_dimensions
    or inserted_result.status_counts <> p_status_counts
  then
    raise exception 'idempotency key reused with incompatible dimension result metadata'
      using errcode = '23505';
  end if;

  dimension_result_id := inserted_result.id;
  scan_id := inserted_result.scan_id;
  processing_run_id := inserted_result.processing_run_id;
  measurement_record_id := inserted_result.measurement_record_id;
  evidence_ledger_id := inserted_result.evidence_ledger_id;
  status := inserted_result.status;
  return next;
end;
$$;

comment on function public.create_dimension_result(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) is
  'Service-only immutable Dimension Result creator. It consumes one Evidence Ledger and persists canonical unresolved dimension results without downstream inference.';

alter table public.dimension_results enable row level security;
alter table public.dimension_results force row level security;

create policy "dimension_results_select_own_scan"
on public.dimension_results
for select
to authenticated
using (
  exists (
    select 1
      from public.scan_sessions
     where scan_sessions.id = dimension_results.scan_id
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on public.dimension_results from public, anon, authenticated;
revoke all on function public.validate_dimension_result_relationship() from public, anon, authenticated;
revoke all on function public.prevent_dimension_result_mutation() from public, anon, authenticated;
revoke all on function public.create_dimension_result(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;

grant select on public.dimension_results to authenticated;
grant execute on function public.create_dimension_result(uuid, text, text, text, text, text, jsonb, jsonb, jsonb) to service_role;
grant all on public.dimension_results to service_role;
