\set ON_ERROR_STOP on
\pset pager off

select set_config('request.jwt.claim.sub', '', false);
select set_config('request.jwt.claims', '{}', false);

do $$
declare
  expected_tables text[] := array[
    'profiles',
    'policy_acceptances',
    'prompt_sets',
    'prompt_definitions',
    'scan_sessions',
    'scan_prompt_captures',
    'audit_events',
    'capture_artifacts',
    'processing_jobs',
    'evidence_records',
    'scan_result_versions',
    'result_manifests',
    'result_manifest_evidence',
    'personal_baselines',
    'baseline_scan_members',
    'scan_processing_runs',
    'measurement_records',
    'semantic_result_records',
    'evidence_ledgers',
    'dimension_results',
    'dimension_calibration_specs'
  ];
  expected_privileged_functions text[] := array[
    'transition_scan_lifecycle',
    'request_audio_deletion',
    'record_audio_deletion_result',
    'create_scan_result_version',
    'add_result_manifest_evidence',
    'finalize_scan_result_version',
    'register_uploaded_capture_artifact',
    'start_scan_processing_run',
    'create_measurement_record',
    'create_unresolved_semantic_result',
    'create_evidence_ledger',
    'create_dimension_result',
    'create_dimension_calibration_spec'
  ];
  expected_policy_names text[] := array[
    'profiles_select_own',
    'profiles_insert_own',
    'profiles_update_own',
    'policy_acceptances_select_own',
    'policy_acceptances_insert_own',
    'prompt_sets_select_authenticated',
    'prompt_definitions_select_authenticated',
    'scan_sessions_select_own',
    'scan_sessions_insert_own_created',
    'scan_prompt_captures_select_own_scan',
    'scan_prompt_captures_insert_safe_client_workflow',
    'scan_prompt_captures_update_safe_client_workflow',
    'audit_events_select_own_scan',
    'capture_artifacts_select_own_scan',
    'processing_jobs_select_own_scan',
    'evidence_records_select_own_scan',
    'scan_result_versions_select_own_finalized',
    'result_manifests_select_own_finalized',
    'result_manifest_evidence_select_own_finalized',
    'personal_baselines_select_own',
    'baseline_scan_members_select_own',
    'scan_processing_runs_select_own_scan',
    'measurement_records_select_own_scan',
    'semantic_result_records_select_own_scan',
    'evidence_ledgers_select_own_scan',
    'dimension_results_select_own_scan'
  ];
  missing_count integer;
  bad_count integer;
begin
  select count(*)
    into missing_count
    from unnest(expected_tables) as expected(table_name)
   where to_regclass('public.' || expected.table_name) is null;

  if missing_count <> 0 then
    raise exception 'ASSERTION_FAILED: expected all backend tables to exist; missing count %', missing_count;
  end if;
  raise notice 'PASS: all backend tables exist';

  select count(*)
    into bad_count
    from unnest(expected_tables) as expected(table_name)
    left join pg_class c on c.oid = to_regclass('public.' || expected.table_name)
   where not (c.relrowsecurity and c.relforcerowsecurity);

  if bad_count <> 0 then
    raise exception 'ASSERTION_FAILED: expected RLS enabled and forced on all backend tables; bad count %', bad_count;
  end if;
  raise notice 'PASS: RLS is enabled and forced on all backend tables';

  if not exists (
    select 1
      from public.prompt_sets
     where version = 'launch-v1'
       and status = 'draft'
       and activated_at is null
  ) then
    raise exception 'ASSERTION_FAILED: launch-v1 must exist as draft with null activated_at';
  end if;
  raise notice 'PASS: launch-v1 exists as draft and activated_at is null';

  if (
    select count(*)
      from public.prompt_definitions
      join public.prompt_sets on prompt_sets.id = prompt_definitions.prompt_set_id
     where prompt_sets.version = 'launch-v1'
  ) <> 3 then
    raise exception 'ASSERTION_FAILED: launch-v1 must have exactly 3 prompt definitions';
  end if;

  if exists (
    select 1
      from (
        select prompt_definitions.canonical_key::text as canonical_key,
               prompt_definitions.prompt_order
          from public.prompt_definitions
          join public.prompt_sets on prompt_sets.id = prompt_definitions.prompt_set_id
         where prompt_sets.version = 'launch-v1'
      ) actual
      full join (
        values
          ('P1_OPEN_REFERENCE', 1),
          ('P2_TROUBLING_CONTEXT', 2),
          ('P3_FUTURE_CONTEXT', 3)
      ) expected(canonical_key, prompt_order)
        on expected.canonical_key = actual.canonical_key
       and expected.prompt_order = actual.prompt_order
     where actual.canonical_key is null or expected.canonical_key is null
  ) then
    raise exception 'ASSERTION_FAILED: launch-v1 canonical prompt keys or orders are incorrect';
  end if;
  raise notice 'PASS: launch-v1 has exactly 3 canonical prompt definitions in the expected order';

  if exists (
    select 1
      from public.prompt_definitions
      join public.prompt_sets on prompt_sets.id = prompt_definitions.prompt_set_id
     where prompt_sets.version = 'launch-v1'
       and (
         (canonical_key = 'P1_OPEN_REFERENCE' and prompt_text ~* 'neutral')
         or (canonical_key = 'P2_TROUBLING_CONTEXT' and prompt_text ~* 'negative emotion|stress|anxiety|distress')
         or (canonical_key = 'P3_FUTURE_CONTEXT' and prompt_text ~* 'positive emotion|optimism|recovery')
       )
  ) then
    raise exception 'ASSERTION_FAILED: launch-v1 prompt text includes prohibited prompt assumptions';
  end if;
  raise notice 'PASS: launch-v1 prompt wording preserves Canon v1.3 prompt semantics';

  select count(*)
    into bad_count
    from unnest(expected_privileged_functions) as expected(function_name)
    left join pg_proc p on p.pronamespace = 'public'::regnamespace and p.proname = expected.function_name
   where p.oid is null or not p.prosecdef;

  if bad_count <> 0 then
    raise exception 'ASSERTION_FAILED: expected all 6 privileged functions to exist as SECURITY DEFINER; bad count %', bad_count;
  end if;
  raise notice 'PASS: all 6 privileged functions exist and are SECURITY DEFINER';

  select count(*)
    into missing_count
    from unnest(expected_policy_names) as expected(policy_name)
   where not exists (
     select 1
       from pg_policies
      where schemaname = 'public'
        and policyname = expected.policy_name
        and 'authenticated' = any(roles)
   );

  if missing_count <> 0 then
    raise exception 'ASSERTION_FAILED: expected authenticated RLS policies are missing; missing count %', missing_count;
  end if;
  raise notice 'PASS: expected authenticated RLS policies exist';

  if exists (
    select 1
      from pg_policies
     where schemaname = 'public'
       and 'anon' = any(roles)
  ) then
    raise exception 'ASSERTION_FAILED: no anon RLS policies may exist';
  end if;
  raise notice 'PASS: no anon RLS policies exist';
end;
$$;

do $$
declare
  spec_count integer;
begin
  select count(*)
    into spec_count
    from public.dimension_calibration_specs
   where calibration_version = 'dimension-calibration-foundation-v0.1'
     and status = 'CALIBRATION_REQUIRED'
     and eligible_evidence_marker_ids = '[]'::jsonb
     and required_evidence_marker_ids = '[]'::jsonb
     and weights is null
     and normalization is null
     and thresholds is null
     and confidence_model is null
     and posterior_model is null
     and reference_dataset is null
     and validation_criteria is null
     and activated_at is null;

  if spec_count <> 16 then
    raise exception 'ASSERTION_FAILED: expected 16 calibration-required Dimension specs without fake science; found %', spec_count;
  end if;
  raise notice 'PASS: calibration foundation seeds 16 CALIBRATION_REQUIRED specs without scoring constants';
end;
$$;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000101', false);
select set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-000000000101", "role": "authenticated"}', false);

do $$
begin
  begin
    perform * from public.create_dimension_calibration_spec(
      'runtime:calibration:user-denied',
      'dimension-calibration-foundation-v0.1',
      'COG-P1',
      '0.1',
      'soulscope-evidence-engine-0.1.0',
      'evidence-structural-v1',
      '0.1',
      'soulscope-dimension-engine-0.1.0',
      'CALIBRATION_REQUIRED',
      '[]'::jsonb,
      '[]'::jsonb,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      jsonb_build_object('source', 'runtime-denied')
    );
    raise exception 'ASSERTION_FAILED: authenticated user created dimension calibration spec';
  exception
    when insufficient_privilege then
      raise notice 'PASS: dimension calibration spec creation is service-only';
  end;
end;
$$;

set role service_role;
select set_config('request.jwt.claim.sub', '', false);
select set_config('request.jwt.claims', '{"role": "service_role"}', false);

select * from public.create_dimension_calibration_spec(
  'COG-P1:calibration-required',
  'dimension-calibration-foundation-v0.1',
  'COG-P1',
  '0.1',
  'soulscope-evidence-engine-0.1.0',
  'evidence-structural-v1',
  '0.1',
  'soulscope-dimension-engine-0.1.0',
  'CALIBRATION_REQUIRED',
  '[]'::jsonb,
  '[]'::jsonb,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'source', 'dimension_calibration_foundation',
    'contract_version', '0.1',
    'scientific_status', 'CALIBRATION_REQUIRED',
    'note', 'No repository-approved calibrated Dimension scoring specification exists.'
  )
)
\gset calibration_seed_repeat_

select set_config('test.calibration_seed_repeat_id', :'calibration_seed_repeat_calibration_spec_id', false);

do $$
declare
  affected_count integer;
begin
  begin
    update public.dimension_calibration_specs
       set status = 'CALIBRATION_VALIDATED'
     where id = current_setting('test.calibration_seed_repeat_id')::uuid;
    get diagnostics affected_count = row_count;
    if affected_count <> 0 then
      raise exception 'ASSERTION_FAILED: immutable dimension calibration spec update was accepted';
    end if;
    raise notice 'PASS: dimension calibration specs are immutable';
  exception
    when insufficient_privilege then
      raise notice 'PASS: dimension calibration specs are immutable';
  end;
end;
$$;

reset role;

begin;

insert into auth.users (id)
values
  ('00000000-0000-4000-8000-000000000101'),
  ('00000000-0000-4000-8000-000000000202'),
  ('00000000-0000-4000-8000-000000000303');

select id as prompt_set_id
from public.prompt_sets
where version = 'launch-v1'
\gset

select set_config('test.owner_user_id', '00000000-0000-4000-8000-000000000101', true);
select set_config('test.other_user_id', '00000000-0000-4000-8000-000000000202', true);
select set_config('test.third_user_id', '00000000-0000-4000-8000-000000000303', true);
select set_config('test.prompt_set_id', :'prompt_set_id', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    insert into public.scan_sessions (user_id, prompt_set_id)
    values (
      current_setting('test.owner_user_id')::uuid,
      current_setting('test.prompt_set_id')::uuid
    );
    raise exception 'ASSERTION_FAILED: launch-v1 allowed authenticated scan creation while draft';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'PASS: launch-v1 rejects authenticated scan creation while draft';
  end;
end;
$$;

reset role;
update public.prompt_sets
   set status = 'active',
       activated_at = now()
 where id = current_setting('test.prompt_set_id')::uuid;
do $$ begin raise notice 'PASS: launch-v1 temporarily activated inside transaction'; end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

insert into public.scan_sessions (user_id, prompt_set_id)
values (
  current_setting('test.owner_user_id')::uuid,
  current_setting('test.prompt_set_id')::uuid
)
returning id as scan_id
\gset

select set_config('test.scan_id', :'scan_id', true);
do $$ begin raise notice 'PASS: owner can create a scan'; end $$;

do $$
begin
  begin
    perform public.transition_scan_lifecycle(
      current_setting('test.scan_id')::uuid,
      'finalized'::public.scan_lifecycle_state,
      '{"test": "invalid created to finalized"}'::jsonb
    );
    raise exception 'ASSERTION_FAILED: invalid created -> finalized transition was accepted';
  exception
    when check_violation then
      raise notice 'PASS: invalid created -> finalized transition is rejected';
  end;
end;
$$;

select * from public.transition_scan_lifecycle(
  current_setting('test.scan_id')::uuid,
  'capturing'::public.scan_lifecycle_state,
  '{"test": "created to capturing"}'::jsonb
);
do $$ begin raise notice 'PASS: valid created -> capturing succeeds'; end $$;

select id as prompt_definition_id
from public.prompt_definitions
where prompt_set_id = current_setting('test.prompt_set_id')::uuid
  and prompt_order = 1
\gset

insert into public.scan_prompt_captures (
  scan_id,
  prompt_definition_id,
  prompt_order,
  capture_status,
  duration_ms,
  upload_status,
  completed_at
)
values (
  current_setting('test.scan_id')::uuid,
  :'prompt_definition_id',
  1,
  'uploaded',
  61000,
  'uploaded',
  now()
)
returning id as capture_id
\gset

select set_config('test.capture_id', :'capture_id', true);

select set_config('request.jwt.claim.sub', current_setting('test.other_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.other_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if exists (
    select 1
      from public.scan_sessions
     where id = current_setting('test.scan_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: another authenticated user can see owner scan';
  end if;
  raise notice 'PASS: another authenticated user cannot see the scan';
end;
$$;

reset role;
insert into public.capture_artifacts (
  scan_id,
  capture_id,
  artifact_kind,
  audio_state,
  storage_bucket,
  storage_object_path,
  mime_type,
  byte_size,
  checksum_sha256
)
values (
  current_setting('test.scan_id')::uuid,
  current_setting('test.capture_id')::uuid,
  'raw_audio',
  'stored_private',
  'private-audio',
  'runtime/owner.raw',
  'audio/webm',
  4096,
  repeat('a', 64)
)
returning id as artifact_id
\gset

select set_config('test.artifact_id', :'artifact_id', true);

insert into public.processing_jobs (
  scan_id,
  capture_id,
  artifact_id,
  job_type,
  status,
  idempotency_key,
  completed_at,
  payload
)
values (
  current_setting('test.scan_id')::uuid,
  current_setting('test.capture_id')::uuid,
  current_setting('test.artifact_id')::uuid,
  'capture_processing',
  'succeeded',
  'runtime:capture-processing:owner',
  now(),
  '{"test": true}'::jsonb
)
returning id as processing_job_id
\gset

select set_config('test.processing_job_id', :'processing_job_id', true);

insert into public.evidence_records (
  scan_id,
  capture_id,
  source_artifact_id,
  processing_job_id,
  feature_id,
  evidence_state,
  raw_value,
  normalized_value,
  unit,
  confidence,
  coverage,
  quality_state,
  extractor_version,
  normalization_version,
  provenance,
  idempotency_key
)
values (
  current_setting('test.scan_id')::uuid,
  current_setting('test.capture_id')::uuid,
  current_setting('test.artifact_id')::uuid,
  current_setting('test.processing_job_id')::uuid,
  'runtime.energy',
  'observed',
  '{"value": 0.42}'::jsonb,
  '{"value": 0.52}'::jsonb,
  'ratio',
  0.91,
  0.88,
  'acceptable',
  'extractor-runtime',
  'normalizer-runtime',
  '{"source": "runtime"}'::jsonb,
  'runtime:evidence:observed'
)
returning id as evidence_record_id
\gset

select set_config('test.evidence_record_id', :'evidence_record_id', true);
do $$ begin raise notice 'PASS: processed capture, private artifact, succeeded job, and observed evidence record created'; end $$;

do $$
begin
  begin
    update public.evidence_records
       set confidence = 0.1
     where id = current_setting('test.evidence_record_id')::uuid;
    raise exception 'ASSERTION_FAILED: evidence UPDATE was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: evidence UPDATE is rejected';
  end;

  begin
    delete from public.evidence_records
     where id = current_setting('test.evidence_record_id')::uuid;
    raise exception 'ASSERTION_FAILED: evidence DELETE was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: evidence DELETE is rejected';
  end;

  begin
    insert into public.evidence_records (
      scan_id,
      capture_id,
      source_artifact_id,
      processing_job_id,
      feature_id,
      evidence_state,
      raw_value,
      normalized_value,
      quality_state,
      extractor_version,
      normalization_version,
      provenance,
      idempotency_key
    )
    values (
      current_setting('test.scan_id')::uuid,
      current_setting('test.capture_id')::uuid,
      current_setting('test.artifact_id')::uuid,
      current_setting('test.processing_job_id')::uuid,
      'runtime.missing.bad',
      'missing',
      '0'::jsonb,
      '0'::jsonb,
      'not_available',
      'extractor-runtime',
      'normalizer-runtime',
      '{"source": "runtime"}'::jsonb,
      'runtime:evidence:missing-bad'
    );
    raise exception 'ASSERTION_FAILED: missing evidence accepted zero values';
  exception
    when check_violation then
      raise notice 'PASS: missing evidence requires null values rather than zero';
  end;
end;
$$;

insert into public.scan_sessions (user_id, prompt_set_id)
values (
  current_setting('test.other_user_id')::uuid,
  current_setting('test.prompt_set_id')::uuid
)
returning id as other_scan_id
\gset

select set_config('test.other_scan_id', :'other_scan_id', true);

do $$
begin
  begin
    insert into public.evidence_records (
      scan_id,
      capture_id,
      source_artifact_id,
      processing_job_id,
      feature_id,
      evidence_state,
      raw_value,
      quality_state,
      extractor_version,
      normalization_version,
      provenance,
      idempotency_key
    )
    values (
      current_setting('test.other_scan_id')::uuid,
      current_setting('test.capture_id')::uuid,
      current_setting('test.artifact_id')::uuid,
      current_setting('test.processing_job_id')::uuid,
      'runtime.cross_scan',
      'observed',
      '{"value": 1}'::jsonb,
      'acceptable',
      'extractor-runtime',
      'normalizer-runtime',
      '{"source": "runtime"}'::jsonb,
      'runtime:evidence:cross-scan'
    );
    raise exception 'ASSERTION_FAILED: cross-scan evidence relationship was accepted';
  exception
    when check_violation then
      raise notice 'PASS: cross-scan evidence relationships are rejected where validators enforce them';
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.other_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.other_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    perform * from public.request_audio_deletion(current_setting('test.artifact_id')::uuid);
    raise exception 'ASSERTION_FAILED: non-owner requested deletion';
  exception
    when insufficient_privilege then
      raise notice 'PASS: non-owner cannot request deletion';
  end;
end;
$$;

select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

select * from public.request_audio_deletion(current_setting('test.artifact_id')::uuid)
\gset audio_request_one_

select * from public.request_audio_deletion(current_setting('test.artifact_id')::uuid)
\gset audio_request_two_

select set_config('test.audio_request_one_artifact_id', :'audio_request_one_artifact_id', true);
select set_config('test.audio_request_one_job_id', :'audio_request_one_job_id', true);
select set_config('test.audio_request_two_artifact_id', :'audio_request_two_artifact_id', true);
select set_config('test.audio_request_two_job_id', :'audio_request_two_job_id', true);

do $$
begin
  if current_setting('test.audio_request_one_artifact_id')::uuid <> current_setting('test.audio_request_two_artifact_id')::uuid
    or current_setting('test.audio_request_one_job_id')::uuid <> current_setting('test.audio_request_two_job_id')::uuid
  then
    raise exception 'ASSERTION_FAILED: repeated deletion request did not return same artifact/job';
  end if;
  raise notice 'PASS: owner can request deletion and repeated request returns the same artifact/job';

  if (
    select count(*)
      from public.processing_jobs
     where artifact_id = current_setting('test.artifact_id')::uuid
       and job_type = 'audio_deletion'
  ) <> 1 then
    raise exception 'ASSERTION_FAILED: expected exactly one audio_deletion processing job';
  end if;
  raise notice 'PASS: exactly one audio_deletion processing job exists';

  if (
    select count(*)
      from public.audit_events
     where scan_id = current_setting('test.scan_id')::uuid
       and event_type = 'audio.deletion_requested'
  ) <> 1 then
    raise exception 'ASSERTION_FAILED: repeated deletion request created extra audit event';
  end if;
  raise notice 'PASS: repeated request creates no extra audit event';
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.record_audio_deletion_result(current_setting('test.artifact_id')::uuid, true, null, null)
\gset audio_result_one_

select * from public.record_audio_deletion_result(current_setting('test.artifact_id')::uuid, true, null, null)
\gset audio_result_two_

select set_config('test.audio_result_one_artifact_id', :'audio_result_one_artifact_id', true);
select set_config('test.audio_result_one_job_id', :'audio_result_one_job_id', true);
select set_config('test.audio_result_two_artifact_id', :'audio_result_two_artifact_id', true);
select set_config('test.audio_result_two_job_id', :'audio_result_two_job_id', true);

reset role;

do $$
begin
  if current_setting('test.audio_result_one_artifact_id')::uuid <> current_setting('test.audio_result_two_artifact_id')::uuid
    or current_setting('test.audio_result_one_job_id')::uuid <> current_setting('test.audio_result_two_job_id')::uuid
  then
    raise exception 'ASSERTION_FAILED: repeated successful deletion result was not idempotent';
  end if;
  raise notice 'PASS: service_role can record successful deletion and repeated result is idempotent';

  if not exists (
    select 1
      from public.capture_artifacts
     where id = current_setting('test.artifact_id')::uuid
       and audio_state = 'deleted'
       and deleted_at is not null
       and storage_bucket is null
       and storage_object_path is null
  ) then
    raise exception 'ASSERTION_FAILED: deleted artifact did not clear storage state correctly';
  end if;
  raise notice 'PASS: artifact reaches deleted, deleted_at is populated, and storage location is cleared';

  if not exists (
    select 1
      from public.processing_jobs
     where id = current_setting('test.audio_result_one_job_id')::uuid
       and job_type = 'audio_deletion'
       and status = 'succeeded'
  ) then
    raise exception 'ASSERTION_FAILED: deletion job did not reach succeeded';
  end if;
  raise notice 'PASS: deletion job reaches succeeded';

  if (
    select count(*)
      from public.audit_events
     where scan_id = current_setting('test.scan_id')::uuid
       and event_type = 'audio.deletion_succeeded'
  ) <> 1 then
    raise exception 'ASSERTION_FAILED: repeated successful result created extra audit event';
  end if;
  raise notice 'PASS: repeated result creates no extra audit event';
end;
$$;

select * from public.transition_scan_lifecycle(current_setting('test.scan_id')::uuid, 'capture_complete', '{"test": true}'::jsonb);
select * from public.transition_scan_lifecycle(current_setting('test.scan_id')::uuid, 'queued', '{"test": true}'::jsonb);
select * from public.transition_scan_lifecycle(current_setting('test.scan_id')::uuid, 'extracting', '{"test": true}'::jsonb);
select * from public.transition_scan_lifecycle(current_setting('test.scan_id')::uuid, 'evidence_ready', '{"test": true}'::jsonb);
do $$ begin raise notice 'PASS: scan advanced through capture_complete, queued, extracting, and evidence_ready'; end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    perform * from public.create_scan_result_version(
      current_setting('test.scan_id')::uuid,
      'runtime:result:auth-denied',
      'result-schema-v1',
      'launch-v1',
      'extractor-runtime',
      'normalizer-runtime',
      'contract-runtime',
      'manifest-runtime',
      null,
      null,
      null
    );
    raise exception 'ASSERTION_FAILED: authenticated user created result version';
  exception
    when insufficient_privilege then
      raise notice 'PASS: result creation is service-only';
  end;
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.create_scan_result_version(
  current_setting('test.scan_id')::uuid,
  'runtime:result:owner',
  'result-schema-v1',
  'launch-v1',
  'extractor-runtime',
  'normalizer-runtime',
  'contract-runtime',
  'manifest-runtime',
  null,
  null,
  null
)
\gset result_one_

select * from public.create_scan_result_version(
  current_setting('test.scan_id')::uuid,
  'runtime:result:owner',
  'result-schema-v1',
  'launch-v1',
  'extractor-runtime',
  'normalizer-runtime',
  'contract-runtime',
  'manifest-runtime',
  null,
  null,
  null
)
\gset result_two_

select set_config('test.result_one_result_version_id', :'result_one_result_version_id', true);
select set_config('test.result_two_result_version_id', :'result_two_result_version_id', true);

select * from public.add_result_manifest_evidence(
  :'result_one_result_version_id',
  current_setting('test.evidence_record_id')::uuid,
  1
)
\gset membership_one_

select * from public.add_result_manifest_evidence(
  :'result_one_result_version_id',
  current_setting('test.evidence_record_id')::uuid,
  1
)
\gset membership_two_

select set_config('test.membership_one_membership_id', :'membership_one_membership_id', true);
select set_config('test.membership_two_membership_id', :'membership_two_membership_id', true);

do $$
begin
  if current_setting('test.result_one_result_version_id')::uuid <> current_setting('test.result_two_result_version_id')::uuid then
    raise exception 'ASSERTION_FAILED: same result idempotency key created multiple result versions';
  end if;
  raise notice 'PASS: same result idempotency key returns one result version';

  if current_setting('test.membership_one_membership_id')::uuid <> current_setting('test.membership_two_membership_id')::uuid then
    raise exception 'ASSERTION_FAILED: same evidence membership request created multiple memberships';
  end if;
  raise notice 'PASS: same evidence membership request returns one membership';
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if exists (
    select 1
      from public.scan_result_versions
     where id = current_setting('test.result_one_result_version_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: draft result is visible to authenticated owner';
  end if;
  raise notice 'PASS: draft result is hidden from authenticated owner';
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);
select * from public.transition_scan_lifecycle(current_setting('test.scan_id')::uuid, 'finalizing', '{"test": true}'::jsonb);
do $$ begin raise notice 'PASS: scan transitions to finalizing'; end $$;

select * from public.finalize_scan_result_version(:'result_one_result_version_id')
\gset finalized_one_

select * from public.finalize_scan_result_version(:'result_one_result_version_id')
\gset finalized_two_

select set_config('test.finalized_one_result_version_id', :'finalized_one_result_version_id', true);
select set_config('test.finalized_two_result_version_id', :'finalized_two_result_version_id', true);

reset role;

do $$
begin
  if current_setting('test.finalized_one_result_version_id')::uuid <> current_setting('test.finalized_two_result_version_id')::uuid then
    raise exception 'ASSERTION_FAILED: repeated finalization did not return same result';
  end if;

  if not exists (
    select 1
      from public.scan_sessions
     where id = current_setting('test.scan_id')::uuid
       and lifecycle_state = 'finalized'
  ) then
    raise exception 'ASSERTION_FAILED: scan did not reach finalized';
  end if;
  raise notice 'PASS: result finalization succeeds, scan reaches finalized, and repeated finalization is idempotent';

  if (
    select count(*)
      from public.audit_events
     where scan_id = current_setting('test.scan_id')::uuid
       and event_type = 'result.version_finalized'
  ) <> 1 then
    raise exception 'ASSERTION_FAILED: repeated finalization created extra audit event';
  end if;
  raise notice 'PASS: repeated finalization creates no extra audit event';

  begin
    update public.scan_result_versions
       set contract_version = 'mutated'
     where id = current_setting('test.result_one_result_version_id')::uuid;
    raise exception 'ASSERTION_FAILED: finalized result mutation was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: finalized result mutation is rejected';
  end;

  begin
    update public.result_manifest_evidence
       set evidence_order = 2
     where id = current_setting('test.membership_one_membership_id')::uuid;
    raise exception 'ASSERTION_FAILED: finalized manifest membership mutation was accepted';
  exception
    when insufficient_privilege or unique_violation then
      raise notice 'PASS: finalized manifest membership mutation is rejected';
  end;
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if not exists (
    select 1
      from public.scan_result_versions
     where id = current_setting('test.result_one_result_version_id')::uuid
       and status = 'finalized'
  ) then
    raise exception 'ASSERTION_FAILED: owner cannot read finalized result';
  end if;
  raise notice 'PASS: owner can read finalized result';
end;
$$;

select set_config('request.jwt.claim.sub', current_setting('test.other_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.other_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if exists (
    select 1
      from public.scan_result_versions
     where id = current_setting('test.result_one_result_version_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: another user can read finalized result';
  end if;
  raise notice 'PASS: another user cannot read finalized result';
end;
$$;

reset role;
insert into public.scan_sessions (user_id, prompt_set_id, lifecycle_state)
values (
  current_setting('test.third_user_id')::uuid,
  current_setting('test.prompt_set_id')::uuid,
  'finalized'
)
returning id as third_scan_id
\gset

select set_config('test.third_scan_id', :'third_scan_id', true);

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
  finalized_at
)
values (
  current_setting('test.third_scan_id')::uuid,
  1,
  'finalized',
  'runtime:third:result',
  'result-schema-v1',
  'launch-v1',
  'extractor-runtime',
  'normalizer-runtime',
  'contract-runtime',
  now()
)
returning id as third_result_id
\gset

select set_config('test.third_result_id', :'third_result_id', true);

insert into public.personal_baselines (
  user_id,
  version_number,
  status,
  label,
  compatibility_contract_version
)
values
  (current_setting('test.owner_user_id')::uuid, 1, 'draft', 'Runtime owner draft', 'contract-runtime'),
  (current_setting('test.other_user_id')::uuid, 1, 'draft', 'Runtime other draft', 'contract-runtime');

select id as owner_baseline_id
from public.personal_baselines
where user_id = current_setting('test.owner_user_id')::uuid
  and version_number = 1
\gset

select id as other_baseline_id
from public.personal_baselines
where user_id = current_setting('test.other_user_id')::uuid
  and version_number = 1
\gset

select set_config('test.owner_baseline_id', :'owner_baseline_id', true);
select set_config('test.other_baseline_id', :'other_baseline_id', true);
do $$ begin raise notice 'PASS: finalized scan/result fixture and draft baselines for two users created'; end $$;

do $$
begin
  begin
    insert into public.baseline_scan_members (
      baseline_id,
      scan_id,
      result_version_id,
      member_order
    )
    values (
      current_setting('test.owner_baseline_id')::uuid,
      current_setting('test.third_scan_id')::uuid,
      current_setting('test.third_result_id')::uuid,
      1
    );
    raise exception 'ASSERTION_FAILED: baseline membership accepted scan owned by different user';
  exception
    when check_violation then
      raise notice 'PASS: baseline membership must reference a scan owned by the baseline owner';
  end;
end;
$$;

insert into public.baseline_scan_members (
  baseline_id,
  scan_id,
  result_version_id,
  member_order
)
values (
  current_setting('test.owner_baseline_id')::uuid,
  current_setting('test.scan_id')::uuid,
  current_setting('test.result_one_result_version_id')::uuid,
  1
)
returning id as owner_baseline_member_id
\gset

select set_config('test.owner_baseline_member_id', :'owner_baseline_member_id', true);
do $$ begin raise notice 'PASS: draft membership may be created'; end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if not exists (
    select 1 from public.personal_baselines where id = current_setting('test.owner_baseline_id')::uuid
  ) or not exists (
    select 1 from public.baseline_scan_members where id = current_setting('test.owner_baseline_member_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: owner cannot read own baseline or membership';
  end if;
  raise notice 'PASS: owner can read their baseline and membership';

  begin
    insert into public.personal_baselines (
      user_id,
      version_number,
      status,
      label,
      compatibility_contract_version
    )
    values (
      current_setting('test.owner_user_id')::uuid,
      2,
      'draft',
      'Client write',
      'contract-runtime'
    );
    raise exception 'ASSERTION_FAILED: authenticated user directly wrote baseline';
  exception
    when insufficient_privilege then
      raise notice 'PASS: authenticated users cannot directly write baselines';
  end;
end;
$$;

select set_config('request.jwt.claim.sub', current_setting('test.other_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.other_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if exists (
    select 1 from public.personal_baselines where id = current_setting('test.owner_baseline_id')::uuid
  ) or exists (
    select 1 from public.baseline_scan_members where id = current_setting('test.owner_baseline_member_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: another user can read baseline or membership';
  end if;
  raise notice 'PASS: another user cannot read the baseline or membership';
end;
$$;

reset role;
update public.personal_baselines
   set status = 'active',
       activated_at = now()
 where id = current_setting('test.owner_baseline_id')::uuid;

do $$
begin
  begin
    update public.baseline_scan_members
       set member_order = 2
     where id = current_setting('test.owner_baseline_member_id')::uuid;
    raise exception 'ASSERTION_FAILED: active membership update was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: active membership update is rejected';
  end;

  begin
    delete from public.baseline_scan_members
     where id = current_setting('test.owner_baseline_member_id')::uuid;
    raise exception 'ASSERTION_FAILED: active membership deletion was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: active membership deletion is rejected';
  end;

  begin
    update public.personal_baselines
       set label = 'Mutated active baseline'
     where id = current_setting('test.owner_baseline_id')::uuid;
    raise exception 'ASSERTION_FAILED: active baseline metadata mutation was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: active baseline metadata mutation is rejected';
  end;
end;
$$;

update public.personal_baselines
   set status = 'archived',
       archived_at = now()
 where id = current_setting('test.owner_baseline_id')::uuid;
do $$ begin raise notice 'PASS: active baseline may move to archived'; end $$;

do $$
begin
  begin
    update public.personal_baselines
       set status = 'draft',
           activated_at = null,
           archived_at = null
     where id = current_setting('test.owner_baseline_id')::uuid;
    raise exception 'ASSERTION_FAILED: archived baseline returned to draft';
  exception
    when insufficient_privilege then
      raise notice 'PASS: archived baseline cannot return to draft';
  end;

  begin
    insert into public.personal_baselines (
      user_id,
      version_number,
      status,
      label,
      compatibility_contract_version,
      supersedes_baseline_id
    )
    values (
      current_setting('test.owner_user_id')::uuid,
      3,
      'draft',
      'Invalid supersedes',
      'contract-runtime',
      current_setting('test.other_baseline_id')::uuid
    );
    raise exception 'ASSERTION_FAILED: baseline ownership validator accepted cross-owner supersedes';
  exception
    when check_violation then
      raise notice 'PASS: baseline ownership validator rejects invalid relationships';
  end;

  begin
    insert into public.baseline_scan_members (
      baseline_id,
      scan_id,
      result_version_id,
      member_order
    )
    values (
      current_setting('test.other_baseline_id')::uuid,
      current_setting('test.third_scan_id')::uuid,
      current_setting('test.result_one_result_version_id')::uuid,
      1
    );
    raise exception 'ASSERTION_FAILED: baseline/result compatibility validator accepted mismatched result scan';
  exception
    when check_violation then
      raise notice 'PASS: baseline/result compatibility validators reject invalid relationships';
  end;
end;
$$;

reset role;
insert into public.scan_sessions (user_id, prompt_set_id)
values (
  current_setting('test.owner_user_id')::uuid,
  current_setting('test.prompt_set_id')::uuid
)
returning id as pipeline_scan_id
\gset

select set_config('test.pipeline_scan_id', :'pipeline_scan_id', true);

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.transition_scan_lifecycle(
  current_setting('test.pipeline_scan_id')::uuid,
  'capturing'::public.scan_lifecycle_state,
  '{"test": "pipeline scan created to capturing"}'::jsonb
);

reset role;

insert into public.scan_prompt_captures (
  scan_id,
  prompt_definition_id,
  prompt_order,
  capture_status,
  duration_ms,
  upload_status,
  completed_at
)
select
  current_setting('test.pipeline_scan_id')::uuid,
  prompt_definitions.id,
  prompt_definitions.prompt_order,
  'uploaded'::public.capture_status,
  30000,
  'uploaded'::public.capture_upload_status,
  now()
from public.prompt_definitions
where prompt_definitions.prompt_set_id = current_setting('test.prompt_set_id')::uuid
order by prompt_definitions.prompt_order;

select id as pipeline_capture_one_id
from public.scan_prompt_captures
where scan_id = current_setting('test.pipeline_scan_id')::uuid
  and prompt_order = 1
\gset

select id as pipeline_capture_two_id
from public.scan_prompt_captures
where scan_id = current_setting('test.pipeline_scan_id')::uuid
  and prompt_order = 2
\gset

select id as pipeline_capture_three_id
from public.scan_prompt_captures
where scan_id = current_setting('test.pipeline_scan_id')::uuid
  and prompt_order = 3
\gset

select set_config('test.pipeline_capture_one_id', :'pipeline_capture_one_id', true);
select set_config('test.pipeline_capture_two_id', :'pipeline_capture_two_id', true);
select set_config('test.pipeline_capture_three_id', :'pipeline_capture_three_id', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    perform * from public.register_uploaded_capture_artifact(
      current_setting('test.pipeline_capture_one_id')::uuid,
      'private-audio',
      'runtime/pipeline-p1.webm',
      'audio/webm',
      2048,
      repeat('b', 64),
      'runtime:pipeline:artifact:p1'
    );
    raise exception 'ASSERTION_FAILED: authenticated user registered capture artifact';
  exception
    when insufficient_privilege then
      raise notice 'PASS: artifact registration is service-only';
  end;
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.register_uploaded_capture_artifact(
  current_setting('test.pipeline_capture_one_id')::uuid,
  'private-audio',
  'runtime/pipeline-p1.webm',
  'audio/webm',
  2048,
  repeat('b', 64),
  'runtime:pipeline:artifact:p1'
)
\gset pipeline_artifact_one_

select * from public.register_uploaded_capture_artifact(
  current_setting('test.pipeline_capture_two_id')::uuid,
  'private-audio',
  'runtime/pipeline-p2.webm',
  'audio/webm',
  2049,
  repeat('c', 64),
  'runtime:pipeline:artifact:p2'
)
\gset pipeline_artifact_two_

select * from public.register_uploaded_capture_artifact(
  current_setting('test.pipeline_capture_three_id')::uuid,
  'private-audio',
  'runtime/pipeline-p3.webm',
  'audio/webm',
  2050,
  repeat('d', 64),
  'runtime:pipeline:artifact:p3'
)
\gset pipeline_artifact_three_

select * from public.transition_scan_lifecycle(
  current_setting('test.pipeline_scan_id')::uuid,
  'capture_complete'::public.scan_lifecycle_state,
  '{"test": "pipeline capture complete"}'::jsonb
);

select * from public.transition_scan_lifecycle(
  current_setting('test.pipeline_scan_id')::uuid,
  'queued'::public.scan_lifecycle_state,
  '{"test": "pipeline queued"}'::jsonb
);

select * from public.start_scan_processing_run(
  current_setting('test.pipeline_scan_id')::uuid,
  'runtime:pipeline:run',
  'extractor-calibration-required',
  'CALIBRATION_REQUIRED'
)
\gset pipeline_run_

select set_config('test.pipeline_run_id', :'pipeline_run_processing_run_id', true);

select * from public.create_measurement_record(
  current_setting('test.pipeline_run_id')::uuid,
  'runtime:pipeline:measurement',
  'limited',
  jsonb_build_array(
    jsonb_build_object('promptId', 'P1_OPEN_REFERENCE', 'measurements', jsonb_build_array()),
    jsonb_build_object('promptId', 'P2_TROUBLING_CONTEXT', 'measurements', jsonb_build_array()),
    jsonb_build_object('promptId', 'P3_FUTURE_CONTEXT', 'measurements', jsonb_build_array())
  ),
  jsonb_build_array(),
  jsonb_build_object('overallQuality', 'limited', 'calibrationStatus', 'CALIBRATION_REQUIRED'),
  jsonb_build_object('extractor', 'adapter-placeholder', 'version', 'extractor-calibration-required'),
  false,
  true
)
\gset pipeline_measurement_

select set_config('test.pipeline_measurement_id', :'pipeline_measurement_measurement_record_id', true);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    perform * from public.create_evidence_ledger(
      current_setting('test.pipeline_measurement_id')::uuid,
      'runtime:pipeline:evidence-ledger:authenticated-denied',
      'soulscope-evidence-engine-0.1.0',
      'evidence-structural-v1',
      '0.1',
      '0.1',
      jsonb_build_array(jsonb_build_object(
        'evidence_id', 'ev_denied',
        'evidence_status', 'supported',
        'marker_id', 'EV_TIM_008',
        'source_measurement_ids', jsonb_build_array('m_denied')
      )),
      jsonb_build_object('supported', 1, 'contradicted', 0, 'unavailable', 0, 'rejected', 0, 'insufficient', 0),
      jsonb_build_object('raw_audio_consumed', false, 'acoustic_extraction_rerun', false)
    );
    raise exception 'ASSERTION_FAILED: authenticated user created evidence ledger';
  exception
    when insufficient_privilege then
      raise notice 'PASS: evidence ledger creation is service-only';
  end;
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.create_evidence_ledger(
  current_setting('test.pipeline_measurement_id')::uuid,
  'runtime:pipeline:evidence-ledger',
  'soulscope-evidence-engine-0.1.0',
  'evidence-structural-v1',
  '0.1',
  '0.1',
  jsonb_build_array(
    jsonb_build_object(
      'evidence_id', 'ev_runtime_supported',
      'evidence_status', 'supported',
        'marker_id', 'EV_TIM_008',
      'marker_version', '0.1',
      'scan_id', current_setting('test.pipeline_scan_id'),
      'prompt_scope', jsonb_build_array('P1_OPEN_REFERENCE'),
      'source_measurement_ids', jsonb_build_array('runtime_measurement_supported'),
      'source_feature_families', jsonb_build_array('TIM'),
      'direction', 'NONE',
      'supporting_components', jsonb_build_array('SS_PAUSE_LOAD', 'Q_VOICED_RATIO'),
      'contradicting_components', jsonb_build_array(),
      'missing_components', jsonb_build_array(),
      'confound_flags', jsonb_build_array(),
      'status', 'RESOLVED'
    ),
    jsonb_build_object(
      'evidence_id', 'ev_runtime_unavailable',
      'evidence_status', 'unavailable',
      'marker_id', 'EV_PHO_004',
      'marker_version', '0.1',
      'scan_id', current_setting('test.pipeline_scan_id'),
      'prompt_scope', jsonb_build_array('P1_OPEN_REFERENCE'),
      'source_measurement_ids', jsonb_build_array(),
      'source_feature_families', jsonb_build_array('PHO'),
      'direction', 'UNRESOLVED',
      'supporting_components', jsonb_build_array(),
      'contradicting_components', jsonb_build_array(),
      'missing_components', jsonb_build_array('SS_CPP_MEAN', 'AC_LLD_HNR'),
      'confound_flags', jsonb_build_array(),
      'status', 'UNRESOLVED',
      'resolution_reason', 'MISSING_REQUIRED_EVIDENCE'
    )
  ),
  jsonb_build_object('supported', 1, 'contradicted', 0, 'unavailable', 1, 'rejected', 0, 'insufficient', 0),
  jsonb_build_object(
    'source', 'measurement_record',
    'measurement_record_id', current_setting('test.pipeline_measurement_id'),
    'raw_audio_consumed', false,
    'acoustic_extraction_rerun', false
  )
)
\gset pipeline_evidence_

select set_config('test.pipeline_evidence_ledger_id', :'pipeline_evidence_evidence_ledger_id', true);

select * from public.create_evidence_ledger(
  current_setting('test.pipeline_measurement_id')::uuid,
  'runtime:pipeline:evidence-ledger',
  'soulscope-evidence-engine-0.1.0',
  'evidence-structural-v1',
  '0.1',
  '0.1',
  jsonb_build_array(
    jsonb_build_object(
      'evidence_id', 'ev_runtime_supported',
      'evidence_status', 'supported',
      'marker_id', 'EV_TIM_008',
      'marker_version', '0.1',
      'scan_id', current_setting('test.pipeline_scan_id'),
      'prompt_scope', jsonb_build_array('P1_OPEN_REFERENCE'),
      'source_measurement_ids', jsonb_build_array('runtime_measurement_supported'),
      'source_feature_families', jsonb_build_array('TIM'),
      'direction', 'NONE',
      'supporting_components', jsonb_build_array('SS_PAUSE_LOAD', 'Q_VOICED_RATIO'),
      'contradicting_components', jsonb_build_array(),
      'missing_components', jsonb_build_array(),
      'confound_flags', jsonb_build_array(),
      'status', 'RESOLVED'
    ),
    jsonb_build_object(
      'evidence_id', 'ev_runtime_unavailable',
      'evidence_status', 'unavailable',
      'marker_id', 'EV_PHO_004',
      'marker_version', '0.1',
      'scan_id', current_setting('test.pipeline_scan_id'),
      'prompt_scope', jsonb_build_array('P1_OPEN_REFERENCE'),
      'source_measurement_ids', jsonb_build_array(),
      'source_feature_families', jsonb_build_array('PHO'),
      'direction', 'UNRESOLVED',
      'supporting_components', jsonb_build_array(),
      'contradicting_components', jsonb_build_array(),
      'missing_components', jsonb_build_array('SS_CPP_MEAN', 'AC_LLD_HNR'),
      'confound_flags', jsonb_build_array(),
      'status', 'UNRESOLVED',
      'resolution_reason', 'MISSING_REQUIRED_EVIDENCE'
    )
  ),
  jsonb_build_object('supported', 1, 'contradicted', 0, 'unavailable', 1, 'rejected', 0, 'insufficient', 0),
  jsonb_build_object(
    'source', 'measurement_record',
    'measurement_record_id', current_setting('test.pipeline_measurement_id'),
    'raw_audio_consumed', false,
    'acoustic_extraction_rerun', false
  )
)
\gset pipeline_evidence_repeat_

select set_config('test.pipeline_evidence_repeat_ledger_id', :'pipeline_evidence_repeat_evidence_ledger_id', true);

do $$
begin
  if current_setting('test.pipeline_evidence_ledger_id') <> current_setting('test.pipeline_evidence_repeat_ledger_id') then
    raise exception 'ASSERTION_FAILED: duplicate evidence ledger request was not idempotent';
  end if;
  raise notice 'PASS: evidence ledger creation is idempotent';
end;
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  begin
    perform * from public.create_dimension_result(
      current_setting('test.pipeline_evidence_ledger_id')::uuid,
      'runtime:pipeline:dimension-result:authenticated-denied',
      'soulscope-dimension-engine-0.1.0',
      '0.1',
      'CALIBRATION_REQUIRED',
      '0.1',
      (
        select jsonb_agg(jsonb_build_object(
          'dimensionId', dimension_id,
          'resolutionStatus', 'UNRESOLVED',
          'resolutionReason', 'CONSTRUCT_MODEL_NOT_VALIDATED',
          'posteriorMean', null,
          'confidence', null
        ) order by ord)
        from unnest(array[
          'COG-P1','COG-P2','COG-P3','COG-P4',
          'REG-P1','REG-P2','REG-P3','REG-P4',
          'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
          'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
        ]) with ordinality as dims(dimension_id, ord)
      ),
      jsonb_build_object('unresolved', 16, 'resolved', 0, 'invalid', 0),
      jsonb_build_object(
        'source', 'evidence_ledger',
        'evidence_ledger_id', current_setting('test.pipeline_evidence_ledger_id'),
        'raw_audio_consumed', false,
        'measurement_record_consumed_directly', false,
        'downstream_state_generated', false,
        'downstream_pattern_generated', false,
        'narrative_generated', false,
        'resonance_generated', false
      )
    );
    raise exception 'ASSERTION_FAILED: authenticated user created dimension result';
  exception
    when insufficient_privilege then
      raise notice 'PASS: dimension result creation is service-only';
  end;
end;
$$;

set local role service_role;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '{"role": "service_role"}', true);

select * from public.create_dimension_result(
  current_setting('test.pipeline_evidence_ledger_id')::uuid,
  'runtime:pipeline:dimension-result',
  'soulscope-dimension-engine-0.1.0',
  '0.1',
  'CALIBRATION_REQUIRED',
  '0.1',
  (
    select jsonb_agg(jsonb_build_object(
      'dimensionId', dimension_id,
      'resolutionStatus', 'UNRESOLVED',
      'resolutionReason',
        case dimension_id
          when 'REG-P4' then 'NO_RECOVERY_COMPATIBLE_CONDITION'
          when 'CAP-P2' then 'NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL'
          when 'EXP-P4' then 'NO_RELATIONAL_OBSERVATION'
          else 'CONSTRUCT_MODEL_NOT_VALIDATED'
        end,
      'posteriorMean', null,
      'confidence', null,
      'scoreProduced', false,
      'confidenceProduced', false
    ) order by ord)
    from unnest(array[
      'COG-P1','COG-P2','COG-P3','COG-P4',
      'REG-P1','REG-P2','REG-P3','REG-P4',
      'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
      'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
    ]) with ordinality as dims(dimension_id, ord)
  ),
  jsonb_build_object('unresolved', 16, 'resolved', 0, 'invalid', 0),
  jsonb_build_object(
    'source', 'evidence_ledger',
    'evidence_ledger_id', current_setting('test.pipeline_evidence_ledger_id'),
    'raw_audio_consumed', false,
    'measurement_record_consumed_directly', false,
    'downstream_state_generated', false,
    'downstream_pattern_generated', false,
    'narrative_generated', false,
    'resonance_generated', false
  )
)
\gset pipeline_dimension_

select set_config('test.pipeline_dimension_result_id', :'pipeline_dimension_dimension_result_id', true);

select * from public.create_dimension_result(
  current_setting('test.pipeline_evidence_ledger_id')::uuid,
  'runtime:pipeline:dimension-result',
  'soulscope-dimension-engine-0.1.0',
  '0.1',
  'CALIBRATION_REQUIRED',
  '0.1',
  (
    select jsonb_agg(jsonb_build_object(
      'dimensionId', dimension_id,
      'resolutionStatus', 'UNRESOLVED',
      'resolutionReason',
        case dimension_id
          when 'REG-P4' then 'NO_RECOVERY_COMPATIBLE_CONDITION'
          when 'CAP-P2' then 'NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL'
          when 'EXP-P4' then 'NO_RELATIONAL_OBSERVATION'
          else 'CONSTRUCT_MODEL_NOT_VALIDATED'
        end,
      'posteriorMean', null,
      'confidence', null,
      'scoreProduced', false,
      'confidenceProduced', false
    ) order by ord)
    from unnest(array[
      'COG-P1','COG-P2','COG-P3','COG-P4',
      'REG-P1','REG-P2','REG-P3','REG-P4',
      'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
      'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
    ]) with ordinality as dims(dimension_id, ord)
  ),
  jsonb_build_object('unresolved', 16, 'resolved', 0, 'invalid', 0),
  jsonb_build_object(
    'source', 'evidence_ledger',
    'evidence_ledger_id', current_setting('test.pipeline_evidence_ledger_id'),
    'raw_audio_consumed', false,
    'measurement_record_consumed_directly', false,
    'downstream_state_generated', false,
    'downstream_pattern_generated', false,
    'narrative_generated', false,
    'resonance_generated', false
  )
)
\gset pipeline_dimension_repeat_

select set_config('test.pipeline_dimension_repeat_result_id', :'pipeline_dimension_repeat_dimension_result_id', true);

do $$
begin
  if current_setting('test.pipeline_dimension_result_id') <> current_setting('test.pipeline_dimension_repeat_result_id') then
    raise exception 'ASSERTION_FAILED: duplicate dimension result request was not idempotent';
  end if;
  raise notice 'PASS: dimension result creation is idempotent';
end;
$$;

select * from public.create_dimension_result(
  current_setting('test.pipeline_evidence_ledger_id')::uuid,
  'runtime:pipeline:dimension-result-second-key',
  'soulscope-dimension-engine-0.1.0',
  '0.1',
  'CALIBRATION_REQUIRED',
  '0.1',
  (
    select jsonb_agg(jsonb_build_object(
      'dimensionId', dimension_id,
      'resolutionStatus', 'UNRESOLVED',
      'resolutionReason',
        case dimension_id
          when 'REG-P4' then 'NO_RECOVERY_COMPATIBLE_CONDITION'
          when 'CAP-P2' then 'NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL'
          when 'EXP-P4' then 'NO_RELATIONAL_OBSERVATION'
          else 'CONSTRUCT_MODEL_NOT_VALIDATED'
        end,
      'posteriorMean', null,
      'confidence', null,
      'scoreProduced', false,
      'confidenceProduced', false
    ) order by ord)
    from unnest(array[
      'COG-P1','COG-P2','COG-P3','COG-P4',
      'REG-P1','REG-P2','REG-P3','REG-P4',
      'CAP-P1','CAP-P2','CAP-P3','CAP-P4',
      'EXP-P1','EXP-P2','EXP-P3','EXP-P4'
    ]) with ordinality as dims(dimension_id, ord)
  ),
  jsonb_build_object('unresolved', 16, 'resolved', 0, 'invalid', 0),
  jsonb_build_object(
    'source', 'evidence_ledger',
    'evidence_ledger_id', current_setting('test.pipeline_evidence_ledger_id'),
    'raw_audio_consumed', false,
    'measurement_record_consumed_directly', false,
    'downstream_state_generated', false,
    'downstream_pattern_generated', false,
    'narrative_generated', false,
    'resonance_generated', false
  )
)
\gset pipeline_dimension_second_key_

select set_config('test.pipeline_dimension_second_key_result_id', :'pipeline_dimension_second_key_dimension_result_id', true);

do $$
begin
  if current_setting('test.pipeline_dimension_result_id') <> current_setting('test.pipeline_dimension_second_key_result_id') then
    raise exception 'ASSERTION_FAILED: duplicate logical dimension result with a different retry key created a second row';
  end if;
  raise notice 'PASS: dimension result logical uniqueness is database-enforced';
end;
$$;

select * from public.create_unresolved_semantic_result(
  current_setting('test.pipeline_measurement_id')::uuid,
  'runtime:pipeline:semantic-unresolved'
)
\gset pipeline_semantic_

select set_config('test.pipeline_semantic_id', :'pipeline_semantic_semantic_result_id', true);

reset role;

do $$
declare
  semantic_record public.semantic_result_records%rowtype;
begin
  select *
    into semantic_record
    from public.semantic_result_records
   where id = current_setting('test.pipeline_semantic_id')::uuid;

  if semantic_record.pattern_result ->> 'publicationStatus' <> 'NO_PATTERN_PUBLISHED' then
    raise exception 'ASSERTION_FAILED: unresolved semantic result forced a Pattern';
  end if;

  if not (
    semantic_record.dimensions @> '[{"dimensionId":"REG-P4","resolutionStatus":"UNRESOLVED","resolutionReason":"NO_RECOVERY_COMPATIBLE_CONDITION"}]'::jsonb
    and semantic_record.dimensions @> '[{"dimensionId":"CAP-P2","resolutionStatus":"UNRESOLVED","resolutionReason":"NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL"}]'::jsonb
    and semantic_record.dimensions @> '[{"dimensionId":"EXP-P4","resolutionStatus":"UNRESOLVED","resolutionReason":"NO_RELATIONAL_OBSERVATION"}]'::jsonb
  ) then
    raise exception 'ASSERTION_FAILED: unresolved semantic result did not preserve D3 hard abstentions';
  end if;

  if not exists (
    select 1
      from public.scan_sessions
     where id = current_setting('test.pipeline_scan_id')::uuid
       and lifecycle_state = 'evidence_ready'
  ) then
    raise exception 'ASSERTION_FAILED: pipeline scan did not reach evidence_ready';
  end if;

  raise notice 'PASS: real-scan pipeline foundation creates measurement and unresolved semantic records without forced Pattern or D3 leakage';

  begin
    update public.measurement_records
       set measurement_status = 'qualified'
     where id = current_setting('test.pipeline_measurement_id')::uuid;
    raise exception 'ASSERTION_FAILED: immutable measurement record update was accepted';
  exception
    when insufficient_privilege then
      raise notice 'PASS: measurement records are immutable';
  end;

  begin
    update public.semantic_result_records
       set status = 'invalid'
     where id = current_setting('test.pipeline_semantic_id')::uuid;
    raise exception 'ASSERTION_FAILED: immutable semantic result update was accepted';
	  exception
	    when insufficient_privilege then
	      raise notice 'PASS: semantic result records are immutable';
	  end;

	  begin
	    update public.evidence_ledgers
	       set status = 'invalid'
	     where id = current_setting('test.pipeline_evidence_ledger_id')::uuid;
	    raise exception 'ASSERTION_FAILED: immutable evidence ledger update was accepted';
	  exception
	    when insufficient_privilege then
	      raise notice 'PASS: evidence ledgers are immutable';
	  end;

	  begin
	    update public.dimension_results
	       set status = 'invalid'
	     where id = current_setting('test.pipeline_dimension_result_id')::uuid;
	    raise exception 'ASSERTION_FAILED: immutable dimension result update was accepted';
	  exception
	    when insufficient_privilege then
	      raise notice 'PASS: dimension results are immutable';
	  end;
	end;
	$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.owner_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.owner_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if not exists (
    select 1 from public.measurement_records where id = current_setting('test.pipeline_measurement_id')::uuid
  ) or not exists (
    select 1 from public.semantic_result_records where id = current_setting('test.pipeline_semantic_id')::uuid
  ) or not exists (
    select 1 from public.evidence_ledgers where id = current_setting('test.pipeline_evidence_ledger_id')::uuid
  ) or not exists (
    select 1 from public.dimension_results where id = current_setting('test.pipeline_dimension_result_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: owner cannot read pipeline measurement, evidence, dimension, and semantic records';
  end if;
  raise notice 'PASS: owner can read their pipeline measurement, evidence, dimension, and semantic records';
end;
$$;

select set_config('request.jwt.claim.sub', current_setting('test.other_user_id'), true);
select set_config('request.jwt.claims', jsonb_build_object('sub', current_setting('test.other_user_id'), 'role', 'authenticated')::text, true);

do $$
begin
  if exists (
    select 1 from public.measurement_records where id = current_setting('test.pipeline_measurement_id')::uuid
  ) or exists (
    select 1 from public.semantic_result_records where id = current_setting('test.pipeline_semantic_id')::uuid
  ) or exists (
    select 1 from public.evidence_ledgers where id = current_setting('test.pipeline_evidence_ledger_id')::uuid
  ) or exists (
    select 1 from public.dimension_results where id = current_setting('test.pipeline_dimension_result_id')::uuid
  ) then
    raise exception 'ASSERTION_FAILED: another user can read pipeline measurement, evidence, dimension, or semantic records';
  end if;
  raise notice 'PASS: another user cannot read pipeline measurement, evidence, dimension, or semantic records';
end;
$$;

rollback;

do $$
begin
  if not exists (
    select 1
      from public.prompt_sets
     where version = 'launch-v1'
       and status = 'draft'
       and activated_at is null
  ) then
    raise exception 'ASSERTION_FAILED: launch-v1 did not remain draft after rollback';
  end if;
  raise notice 'PASS: launch-v1 remains draft after rollback';

  if exists (
    select 1
      from auth.users
     where id in (
       '00000000-0000-4000-8000-000000000101',
       '00000000-0000-4000-8000-000000000202',
       '00000000-0000-4000-8000-000000000303'
     )
  ) then
    raise exception 'ASSERTION_FAILED: disposable auth users remain after rollback';
  end if;
  raise notice 'PASS: no disposable auth users remain';

  if exists (
    select 1
      from public.personal_baselines
     where label like 'Runtime %'
  ) then
    raise exception 'ASSERTION_FAILED: runtime fixture baselines remain after rollback';
  end if;
  raise notice 'PASS: no runtime fixture baselines remain';

  if exists (
    select 1
      from public.scan_sessions
     where id in (
       '00000000-0000-4000-8000-000000000101',
       '00000000-0000-4000-8000-000000000202',
       '00000000-0000-4000-8000-000000000303'
     )
  ) then
    raise exception 'ASSERTION_FAILED: runtime fixture scans remain after rollback';
  end if;

  if exists (
    select 1
      from public.scan_sessions
     where user_id in (
       '00000000-0000-4000-8000-000000000101',
       '00000000-0000-4000-8000-000000000202',
       '00000000-0000-4000-8000-000000000303'
     )
  ) then
    raise exception 'ASSERTION_FAILED: runtime fixture scans remain after rollback';
  end if;
  raise notice 'PASS: no runtime fixture scans remain';
end;
$$;
