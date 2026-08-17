-- SoulScope Dimension Calibration Foundation.
-- This migration creates immutable calibration metadata needed before Dimension
-- scoring can ever be enabled. It intentionally seeds CALIBRATION_REQUIRED
-- records only. It does not implement or validate numeric Dimension scoring.

create table public.dimension_calibration_specs (
  id uuid primary key default gen_random_uuid(),
  calibration_id text not null,
  calibration_version text not null,
  dimension_id text not null,
  dimension_registry_version text not null,
  evidence_engine_version text not null,
  evidence_rule_version text not null,
  evidence_registry_version text not null,
  dimension_engine_version text not null,
  status text not null,
  eligible_evidence_marker_ids jsonb not null default '[]'::jsonb,
  required_evidence_marker_ids jsonb not null default '[]'::jsonb,
  directionality jsonb,
  weights jsonb,
  normalization jsonb,
  thresholds jsonb,
  minimum_evidence_rule jsonb,
  score_range jsonb,
  confidence_model jsonb,
  posterior_model jsonb,
  reference_dataset jsonb,
  validation_criteria jsonb,
  validation_metrics jsonb,
  provenance jsonb not null,
  activated_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  constraint dimension_calibration_specs_dimension_id_check
    check (dimension_id in (
      'COG-P1','COG-P2','COG-P3','COG-P4',
      'REG-P1','REG-P2','REG-P3','REG-P4',
      'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
      'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
    )),
  constraint dimension_calibration_specs_status_check
    check (status in (
      'CALIBRATION_REQUIRED',
      'CALIBRATION_DRAFT',
      'CALIBRATION_VALIDATED',
      'CALIBRATION_RETIRED'
    )),
  constraint dimension_calibration_specs_versions_check
    check (
      btrim(calibration_id) <> ''
      and btrim(calibration_version) <> ''
      and btrim(dimension_registry_version) <> ''
      and btrim(evidence_engine_version) <> ''
      and btrim(evidence_rule_version) <> ''
      and btrim(evidence_registry_version) <> ''
      and btrim(dimension_engine_version) <> ''
    ),
  constraint dimension_calibration_specs_json_shape_check
    check (
      jsonb_typeof(eligible_evidence_marker_ids) = 'array'
      and jsonb_typeof(required_evidence_marker_ids) = 'array'
      and jsonb_typeof(provenance) = 'object'
      and provenance <> '{}'::jsonb
      and (directionality is null or jsonb_typeof(directionality) = 'object')
      and (weights is null or jsonb_typeof(weights) = 'object')
      and (normalization is null or jsonb_typeof(normalization) = 'object')
      and (thresholds is null or jsonb_typeof(thresholds) = 'object')
      and (minimum_evidence_rule is null or jsonb_typeof(minimum_evidence_rule) = 'object')
      and (score_range is null or jsonb_typeof(score_range) = 'object')
      and (confidence_model is null or jsonb_typeof(confidence_model) = 'object')
      and (posterior_model is null or jsonb_typeof(posterior_model) = 'object')
      and (reference_dataset is null or jsonb_typeof(reference_dataset) = 'object')
      and (validation_criteria is null or jsonb_typeof(validation_criteria) = 'object')
      and (validation_metrics is null or jsonb_typeof(validation_metrics) = 'object')
    ),
  constraint dimension_calibration_required_has_no_fake_science_check
    check (
      status <> 'CALIBRATION_REQUIRED'
      or (
        eligible_evidence_marker_ids = '[]'::jsonb
        and required_evidence_marker_ids = '[]'::jsonb
        and directionality is null
        and weights is null
        and normalization is null
        and thresholds is null
        and minimum_evidence_rule is null
        and score_range is null
        and confidence_model is null
        and posterior_model is null
        and reference_dataset is null
        and validation_criteria is null
        and validation_metrics is null
        and activated_at is null
      )
    ),
  constraint dimension_calibration_validated_requires_science_check
    check (
      status <> 'CALIBRATION_VALIDATED'
      or (
        eligible_evidence_marker_ids <> '[]'::jsonb
        and required_evidence_marker_ids <> '[]'::jsonb
        and directionality is not null
        and weights is not null
        and normalization is not null
        and minimum_evidence_rule is not null
        and score_range is not null
        and confidence_model is not null
        and posterior_model is not null
        and reference_dataset is not null
        and validation_criteria is not null
        and validation_metrics is not null
        and activated_at is not null
      )
    )
);

comment on table public.dimension_calibration_specs is
  'Immutable versioned Dimension calibration metadata. Current records are CALIBRATION_REQUIRED only and contain no weights, thresholds, mappings, reference data, or validation claims.';

alter table public.dimension_calibration_specs
  add constraint dimension_calibration_specs_dimension_version_unique
  unique (dimension_id, calibration_version);

create unique index dimension_calibration_specs_calibration_id_unique
on public.dimension_calibration_specs (calibration_id);

create index dimension_calibration_specs_dimension_status_idx
on public.dimension_calibration_specs (dimension_id, status);

create or replace function public.prevent_dimension_calibration_spec_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'dimension_calibration_specs are immutable'
    using errcode = '42501';
end;
$$;

create trigger dimension_calibration_specs_prevent_update
before update on public.dimension_calibration_specs
for each row execute function public.prevent_dimension_calibration_spec_mutation();

create trigger dimension_calibration_specs_prevent_delete
before delete on public.dimension_calibration_specs
for each row execute function public.prevent_dimension_calibration_spec_mutation();

create or replace function public.create_dimension_calibration_spec(
  p_calibration_id text,
  p_calibration_version text,
  p_dimension_id text,
  p_dimension_registry_version text,
  p_evidence_engine_version text,
  p_evidence_rule_version text,
  p_evidence_registry_version text,
  p_dimension_engine_version text,
  p_status text,
  p_eligible_evidence_marker_ids jsonb,
  p_required_evidence_marker_ids jsonb,
  p_directionality jsonb,
  p_weights jsonb,
  p_normalization jsonb,
  p_thresholds jsonb,
  p_minimum_evidence_rule jsonb,
  p_score_range jsonb,
  p_confidence_model jsonb,
  p_posterior_model jsonb,
  p_reference_dataset jsonb,
  p_validation_criteria jsonb,
  p_validation_metrics jsonb,
  p_provenance jsonb
)
returns table (
  calibration_spec_id uuid,
  calibration_id text,
  calibration_version text,
  dimension_id text,
  status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  inserted_spec public.dimension_calibration_specs%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to create dimension calibration specs'
      using errcode = '42501';
  end if;

  insert into public.dimension_calibration_specs (
    calibration_id,
    calibration_version,
    dimension_id,
    dimension_registry_version,
    evidence_engine_version,
    evidence_rule_version,
    evidence_registry_version,
    dimension_engine_version,
    status,
    eligible_evidence_marker_ids,
    required_evidence_marker_ids,
    directionality,
    weights,
    normalization,
    thresholds,
    minimum_evidence_rule,
    score_range,
    confidence_model,
    posterior_model,
    reference_dataset,
    validation_criteria,
    validation_metrics,
    provenance,
    activated_at
  )
  values (
    p_calibration_id,
    p_calibration_version,
    p_dimension_id,
    p_dimension_registry_version,
    p_evidence_engine_version,
    p_evidence_rule_version,
    p_evidence_registry_version,
    p_dimension_engine_version,
    p_status,
    p_eligible_evidence_marker_ids,
    p_required_evidence_marker_ids,
    p_directionality,
    p_weights,
    p_normalization,
    p_thresholds,
    p_minimum_evidence_rule,
    p_score_range,
    p_confidence_model,
    p_posterior_model,
    p_reference_dataset,
    p_validation_criteria,
    p_validation_metrics,
    p_provenance,
    case when p_status = 'CALIBRATION_VALIDATED' then now() else null end
  )
  on conflict on constraint dimension_calibration_specs_dimension_version_unique do nothing
  returning * into inserted_spec;

  if inserted_spec.id is null then
    select *
      into inserted_spec
      from public.dimension_calibration_specs
     where dimension_calibration_specs.dimension_id = p_dimension_id
       and dimension_calibration_specs.calibration_version = p_calibration_version;
  end if;

  if inserted_spec.calibration_id <> p_calibration_id
    or inserted_spec.status <> p_status
    or inserted_spec.dimension_registry_version <> p_dimension_registry_version
    or inserted_spec.evidence_engine_version <> p_evidence_engine_version
    or inserted_spec.evidence_rule_version <> p_evidence_rule_version
    or inserted_spec.evidence_registry_version <> p_evidence_registry_version
    or inserted_spec.dimension_engine_version <> p_dimension_engine_version
    or inserted_spec.eligible_evidence_marker_ids <> p_eligible_evidence_marker_ids
    or inserted_spec.required_evidence_marker_ids <> p_required_evidence_marker_ids
    or inserted_spec.directionality is distinct from p_directionality
    or inserted_spec.weights is distinct from p_weights
    or inserted_spec.normalization is distinct from p_normalization
    or inserted_spec.thresholds is distinct from p_thresholds
    or inserted_spec.minimum_evidence_rule is distinct from p_minimum_evidence_rule
    or inserted_spec.score_range is distinct from p_score_range
    or inserted_spec.confidence_model is distinct from p_confidence_model
    or inserted_spec.posterior_model is distinct from p_posterior_model
    or inserted_spec.reference_dataset is distinct from p_reference_dataset
    or inserted_spec.validation_criteria is distinct from p_validation_criteria
    or inserted_spec.validation_metrics is distinct from p_validation_metrics
    or inserted_spec.provenance <> p_provenance
  then
    raise exception 'dimension calibration spec version reused with incompatible metadata'
      using errcode = '23505';
  end if;

  calibration_spec_id := inserted_spec.id;
  calibration_id := inserted_spec.calibration_id;
  calibration_version := inserted_spec.calibration_version;
  dimension_id := inserted_spec.dimension_id;
  status := inserted_spec.status;
  return next;
end;
$$;

comment on function public.create_dimension_calibration_spec(
  text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb
) is
  'Service-only immutable Dimension calibration metadata creator. It records calibration prerequisites and versions without enabling scores unless validation prerequisites are present.';

alter table public.dimension_calibration_specs enable row level security;
alter table public.dimension_calibration_specs force row level security;

revoke all on public.dimension_calibration_specs from public, anon, authenticated;
revoke all on function public.prevent_dimension_calibration_spec_mutation() from public, anon, authenticated;
revoke all on function public.create_dimension_calibration_spec(
  text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb
) from public, anon, authenticated;

grant all on public.dimension_calibration_specs to service_role;
grant execute on function public.create_dimension_calibration_spec(
  text, text, text, text, text, text, text, text, text, jsonb, jsonb, jsonb,
  jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb
) to service_role;

insert into public.dimension_calibration_specs (
  calibration_id,
  calibration_version,
  dimension_id,
  dimension_registry_version,
  evidence_engine_version,
  evidence_rule_version,
  evidence_registry_version,
  dimension_engine_version,
  status,
  eligible_evidence_marker_ids,
  required_evidence_marker_ids,
  provenance
)
select
  dimension_id || ':calibration-required',
  'dimension-calibration-foundation-v0.1',
  dimension_id,
  '0.1',
  'soulscope-evidence-engine-0.1.0',
  'evidence-structural-v1',
  '0.1',
  'soulscope-dimension-engine-0.1.0',
  'CALIBRATION_REQUIRED',
  '[]'::jsonb,
  '[]'::jsonb,
  jsonb_build_object(
    'source', 'dimension_calibration_foundation',
    'contract_version', '0.1',
    'scientific_status', 'CALIBRATION_REQUIRED',
    'note', 'No repository-approved calibrated Dimension scoring specification exists.'
  )
from unnest(array[
  'COG-P1','COG-P2','COG-P3','COG-P4',
  'REG-P1','REG-P2','REG-P3','REG-P4',
  'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
  'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
]) as dims(dimension_id);
