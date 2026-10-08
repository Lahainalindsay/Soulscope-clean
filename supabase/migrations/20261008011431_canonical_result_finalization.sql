-- Append-only, calibration-gated completion of the canonical semantic chain.
-- Historic 0.1 placeholders stay immutable. New results require persisted v2
-- evidence and dimensions; no client-provided scores or narratives are accepted.
alter table public.semantic_result_records
  add column evidence_ledger_id uuid references public.evidence_ledgers(id) on delete restrict,
  add column dimension_result_id uuid references public.dimension_results(id) on delete restrict,
  add column result_report jsonb,
  add constraint semantic_result_upstream_pair check (
    (dimension_result_id is null and evidence_ledger_id is null and result_report is null)
    or (dimension_result_id is not null and evidence_ledger_id is not null
        and semantic_schema_version = '0.2' and jsonb_typeof(result_report) = 'object')),
  add constraint semantic_result_dimension_unique unique (dimension_result_id);

create function public.finalize_canonical_result(p_dimension_result_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  d public.dimension_results%rowtype;
  e public.evidence_ledgers%rowtype;
  m public.measurement_records%rowtype;
  s public.scan_sessions%rowtype;
  r public.semantic_result_records%rowtype;
  geometry jsonb;
  states jsonb;
  candidates jsonb;
  decisions jsonb;
  manifest jsonb;
  report jsonb;
  target_state public.scan_lifecycle_state;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  select * into d from public.dimension_results where id = p_dimension_result_id;
  if not found then raise exception 'dimension result not found' using errcode = '02000'; end if;
  -- Serializes completion and retries for this scan, including differing inputs.
  select * into s from public.scan_sessions where id = d.scan_id for update;
  if s.lifecycle_state in ('deleted', 'failed', 'cancelled') then
    raise exception 'invalid terminal scan state' using errcode = '23514';
  end if;
  select * into r from public.semantic_result_records where dimension_result_id = d.id;
  if r.id is not null then
    return jsonb_build_object('semantic_result_id', r.id, 'scan_id', r.scan_id,
      'dimension_result_id', d.id, 'evidence_ledger_id', d.evidence_ledger_id,
      'measurement_record_id', d.measurement_record_id, 'status', r.status,
      'lifecycle_state', s.lifecycle_state);
  end if;
  if s.lifecycle_state not in ('extracting', 'evidence_ready', 'finalizing') then
    raise exception 'invalid scan state for result finalization' using errcode = '23514';
  end if;
  select * into e from public.evidence_ledgers where id = d.evidence_ledger_id;
  select * into m from public.measurement_records where id = d.measurement_record_id;
  if e.scan_id <> d.scan_id or e.processing_run_id <> d.processing_run_id
     or e.measurement_record_id <> m.id or m.scan_id <> d.scan_id
     or m.processing_run_id <> d.processing_run_id then
    raise exception 'invalid canonical upstream chain' using errcode = '23514';
  end if;
  if d.dimension_engine_version <> 'soulscope-dimension-engine-0.2.0'
     or e.evidence_engine_version <> 'soulscope-evidence-engine-0.2.0'
     or m.protocol_version <> '1.3' or d.dimension_registry_version <> '0.1'
     or e.evidence_registry_version <> '0.1'
     or e.evidence_rule_version <> 'evidence-canonical-structural-v2'
     or e.ledger_schema_version <> '0.1' or d.result_schema_version <> '0.1'
     or d.dimension_scoring_version <> 'CALIBRATION_REQUIRED' then
    raise exception 'invalid or unsupported canonical versions' using errcode = '23514';
  end if;
  if (select count(distinct x->>'dimensionId') from jsonb_array_elements(d.dimensions) x
       where x->>'dimensionId' = any(array[
         'COG-P1','COG-P2','COG-P3','COG-P4','REG-P1','REG-P2','REG-P3','REG-P4',
         'CAP-P1','CAP-P2','CAP-P3','CAP-P4','EXP-P1','EXP-P2','EXP-P3','EXP-P4'])) <> 16
    or exists (select 1 from jsonb_array_elements(d.dimensions) x
      where coalesce(x->>'resolutionStatus', '') not in ('UNRESOLVED','ABSTAINED','INVALID')
        or coalesce(x->>'scoreProduced','false') <> 'false'
        or coalesce(x->>'confidenceProduced','false') <> 'false'
        or exists (select 1 from unnest(array['posteriorMean','posteriorLower','posteriorUpper',
          'confidence','evidenceCoverage','baselineTrust','contradiction','coherence','momentum']) k
          where x ? k and x->k <> 'null'::jsonb)) then
    raise exception 'invalid calibration-gated dimension payload' using errcode = '23514';
  end if;
  -- Geometry cannot be estimated without posteriors. Null is never zero.
  select jsonb_agg(jsonb_build_object('constellationId', c, 'resolutionStatus','UNRESOLVED',
    'coordinates',null,'confidence',null,'resolutionReason','REQUIRED_DIMENSION_UNRESOLVED',
    'dimensionResultId',d.id) order by ord) into geometry
    from unnest(array['COG','REG','CAP','EXP']) with ordinality t(c,ord);
  select jsonb_agg(jsonb_build_object('constellationId', c, 'outcomeType','UNRESOLVED',
    'stateId',null,'blend',null,'confidence',null,
    'candidateStates',jsonb_build_array(c||'-S01',c||'-S02'),
    'requiredDimensions',required,'resolutionReasons',jsonb_build_array(
      'REQUIRED_DIMENSION_UNRESOLVED','STATE_MODEL_NOT_VALIDATED')) order by ord) into states
    from (values ('COG',1,'["COG-P1","COG-P3"]'::jsonb),
      ('REG',2,'["REG-P2"]'::jsonb),('CAP',3,'["CAP-P4"]'::jsonb),
      ('EXP',4,'["EXP-P1"]'::jsonb)) t(c,ord,required);
  -- Every registered pattern is retained as rejected; fit/confidence are unknown.
  select jsonb_agg(jsonb_build_object('patternId',pid,'scientificStatus','RESEARCH_ONLY','eligible',false,'fit',null,
    'confidence',null,'requiredDimensions',required,'requiredInteractions',interaction,
    'maintainedFunctionDimensions',case when pid='PTN-S03' then '["COG-P1","COG-P3","REG-P2","CAP-P4"]'::jsonb else '[]'::jsonb end,
    'requiredStructuralConditions',case pid
      when 'PTN-S03' then '["MAINTAINED_FUNCTION","INDEPENDENTLY_ELEVATED_EFFORT_COST"]'::jsonb
      when 'PTN-S04' then '["EV_CONTEXT_RECONFIGURATION","CONTEXT_SENSITIVE_CHANGE_WITH_COHERENCE"]'::jsonb
      when 'PTN-S05' then '["SUBSTANTIAL_DYN_VOLATILITY","MEANINGFUL_MULTI_DOMAIN_MOVEMENT"]'::jsonb
      when 'PTN-S06' then '["TWO_OR_MORE_WELL_RESOLVED_DOMAINS_DIFFERENT_DIRECTIONS","INDEPENDENT_EVIDENCE_CHAINS"]'::jsonb
      when 'PTN-S07' then '["TWO_DISTINGUISHABLE_RELATION_REGIMES"]'::jsonb else '[]'::jsonb end,
    'rejectionReasons',jsonb_build_array('PATTERN_MODEL_NOT_VALIDATED',reason)) order by pid)
    into candidates from (values
      ('PTN-S01','["COG-P1","COG-P3","REG-P2","CAP-P4"]'::jsonb,'[]'::jsonb,'REQUIRED_DIMENSION_UNRESOLVED'),
      ('PTN-S02','["REG-P1","CAP-P1","COG-P1","COG-P3","CAP-P4"]'::jsonb,'[]'::jsonb,'REQUIRED_DIMENSION_UNRESOLVED'),
      ('PTN-S03','["CAP-P3"]'::jsonb,'[]'::jsonb,'REQUIRED_DIMENSION_UNRESOLVED'),
      ('PTN-S04','["REG-P3"]'::jsonb,'[]'::jsonb,'REQUIRED_DIMENSION_UNRESOLVED'),
      ('PTN-S05','["REG-P2"]'::jsonb,'[]'::jsonb,'REQUIRED_DIMENSION_UNRESOLVED'),
      ('PTN-S06','[]'::jsonb,'[]'::jsonb,'INSUFFICIENT_CONSTELLATION_COVERAGE'),
      ('PTN-S07','[]'::jsonb,'["SHIFTS"]'::jsonb,'REQUIRED_INTERACTION_UNRESOLVED')
    ) t(pid,required,interaction,reason);
  decisions := jsonb_build_array(
    jsonb_build_object('decisionId',d.id||':quality','stage','QUALITY',
      'semanticEligibility',m.semantic_eligibility,'measurementStatus',m.measurement_status,
      'qualitySummary',m.quality_summary,'measurementRecordId',m.id),
    jsonb_build_object('decisionId',d.id||':geometry','stage','CONSTELLATION_GEOMETRY',
      'outcome','UNRESOLVED','reason','REQUIRED_DIMENSION_UNRESOLVED','dimensionResultId',d.id),
    jsonb_build_object('decisionId',d.id||':states','stage','STATES','outcome','UNRESOLVED',
      'reason','STATE_MODEL_NOT_VALIDATED','dimensionResultId',d.id),
    jsonb_build_object('decisionId',d.id||':interactions','stage','INTERACTIONS',
      'outcome','NO_INTERACTION_PUBLISHED','reason','REQUIRED_STATE_UNRESOLVED','dimensionResultId',d.id),
    jsonb_build_object('decisionId',d.id||':pattern','stage','PATTERN','outcome','NO_PATTERN_PUBLISHED',
      'reason','PATTERN_MODEL_NOT_VALIDATED','dimensionResultId',d.id),
    jsonb_build_object('decisionId',d.id||':report','stage','NARRATIVE','outcome','UNAVAILABLE',
      'reason','NO_PUBLISHABLE_SEMANTIC_FINDINGS','evidenceLedgerId',e.id));
  manifest := jsonb_build_object('protocol',m.protocol_version,'extractor',m.extractor_version,
    'featureRegistry','0.1','qualityRules',m.quality_rules_version,'evidenceRegistry',e.evidence_registry_version,
    'dimensionRegistry',d.dimension_registry_version,'inferenceRules','0.1','stateRegistry','0.1',
    'interactionRegistry','0.1','patternRegistry','0.1','narrativeRegistry','0.1',
    'modelRegistry','CALIBRATION_REQUIRED','rendererRegistry','NOT_IMPLEMENTED',
    'evidenceEngine',e.evidence_engine_version,'dimensionEngine',d.dimension_engine_version,
    'dimensionScoring',d.dimension_scoring_version,'semanticEngine','canonical-completion-0.1');
  -- This is an availability report, not a personal narrative or an LLM prompt.
  select jsonb_build_object('schemaVersion','0.1','status','UNAVAILABLE',
    'reason','NO_PUBLISHABLE_SEMANTIC_FINDINGS','sections',jsonb_agg(jsonb_build_object(
      'sectionId',section,'status','UNAVAILABLE','sentences',jsonb_build_array(),
      'decisionIds',jsonb_build_array(d.id||':report'),'evidenceLedgerId',e.id) order by ord),
    'rendering',jsonb_build_object('status','UNAVAILABLE','reason','RENDERER_NOT_IMPLEMENTED',
      'semanticInputsPermitted',false)) into report
    from unnest(array['what_feels_most_present','how_this_may_show_up_in_daily_life',
      'what_may_be_happening_underneath','something_worth_noticing','a_question_to_sit_with'])
      with ordinality t(section,ord);
  insert into public.semantic_result_records (scan_id,processing_run_id,measurement_record_id,
    semantic_schema_version,status,evidence_ledger,dimensions,constellation_geometry,states_or_blends,
    interactions,pattern_result,decision_ledger,version_manifest,idempotency_key,
    evidence_ledger_id,dimension_result_id,result_report)
    values (d.scan_id,d.processing_run_id,m.id,'0.2',case when not m.semantic_eligibility then 'invalid' else d.status end,e.entries,d.dimensions,geometry,states,
      '[]',jsonb_build_object('scanId',d.scan_id,'outcomeType','NO_PATTERN_PUBLISHED',
        'publicationStatus','NO_PATTERN_PUBLISHED','candidatePatterns',candidates,
        'supportingConstellations','[]'::jsonb,'supportingDimensions','[]'::jsonb,
        'supportingInteractions','[]'::jsonb,'contradictingStructures','[]'::jsonb,
        'coverage',null,'independence',null,'uncertainty',null,'temporalScope','WHOLE_SCAN',
        'patternDecisionRecord',d.id||':pattern','registryVersions',jsonb_build_object('patternRegistry','0.1')),
      decisions,manifest,'canonical-result:'||d.id,e.id,d.id,report) returning * into r;
  -- All three transitions and the immutable insert commit atomically.
  foreach target_state in array array['evidence_ready','finalizing','finalized']::public.scan_lifecycle_state[] loop
    if (s.lifecycle_state = 'extracting' and target_state = 'evidence_ready')
      or (s.lifecycle_state = 'evidence_ready' and target_state = 'finalizing')
      or (s.lifecycle_state = 'finalizing' and target_state = 'finalized') then
      s := public.transition_scan_lifecycle(s.id,target_state,
        jsonb_build_object('source','finalize_canonical_result','semantic_result_id',r.id));
    end if;
  end loop;
  update public.scan_processing_runs set status='semantic_abstained',completed_at=coalesce(completed_at,now())
    where id=d.processing_run_id;
  return jsonb_build_object('semantic_result_id',r.id,'scan_id',r.scan_id,
    'dimension_result_id',d.id,'evidence_ledger_id',e.id,'measurement_record_id',m.id,
    'status',r.status,'lifecycle_state',s.lifecycle_state);
end;
$$;
revoke all on function public.finalize_canonical_result(uuid) from public, anon, authenticated;
grant execute on function public.finalize_canonical_result(uuid) to service_role;
comment on function public.finalize_canonical_result(uuid) is
  'Service-only atomic canonical completion with immutable upstream lineage, explicit calibration abstentions, narrative availability, and audited lifecycle. No calibrated interpretations or renderer.';

-- Allow exact retries after downstream finalization without reopening a run.
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

  if locked_scan.lifecycle_state in ('deleted','failed','cancelled') then
    raise exception 'invalid terminal scan state' using errcode='23514';
  end if;
  select * into inserted_run from public.scan_processing_runs as existing
    where existing.idempotency_key=p_idempotency_key;
  if inserted_run.id is not null then
    if inserted_run.scan_id <> p_scan_id or inserted_run.extractor_version <> p_extractor_version
      or inserted_run.renderer_registry_version <> p_renderer_registry_version then
      raise exception 'idempotency key reused with incompatible processing run metadata' using errcode='23505';
    end if;
    processing_run_id := inserted_run.id;
    scan_id := inserted_run.scan_id;
    status := inserted_run.status;
    return next;
    return;
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

  select * into inserted_measurement from public.measurement_records as existing
    where existing.idempotency_key=p_idempotency_key;
  if inserted_measurement.id is not null then
    if inserted_measurement.processing_run_id <> p_processing_run_id
      or inserted_measurement.measurement_status <> p_measurement_status
      or inserted_measurement.prompt_measurements <> p_prompt_measurements
      or inserted_measurement.prompt_contrasts <> p_prompt_contrasts
      or inserted_measurement.quality_summary <> p_quality_summary
      or inserted_measurement.extractor_provenance <> p_extractor_provenance
      or inserted_measurement.semantic_eligibility <> p_semantic_eligibility
      or inserted_measurement.renderer_eligibility <> p_renderer_eligibility then
      raise exception 'idempotency key reused with incompatible measurement metadata' using errcode='23505';
    end if;
    measurement_record_id := inserted_measurement.id;
    scan_id := inserted_measurement.scan_id;
    processing_run_id := inserted_measurement.processing_run_id;
    measurement_status := inserted_measurement.measurement_status;
    semantic_eligibility := inserted_measurement.semantic_eligibility;
    renderer_eligibility := inserted_measurement.renderer_eligibility;
    return next;
    return;
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
