-- Adds Language v1 only at creation of a new sealed result. No historical rows
-- are updated. Scientific finalization, scoring, state and pattern rules stay intact.
create function public.seal_unresolved_reflection_v1()
returns trigger language plpgsql security invoker
set search_path = public, pg_temp as $$
declare
  report_decision text;
  reflection jsonb;
  reason text;
begin
  if new.semantic_schema_version <> '0.2' or new.dimension_result_id is null then
    return new;
  end if;
  -- Current Canon calibration does not permit READY meaning publication.
  -- A future validated producer needs its own reviewed version, not a flag.
  if new.status not in ('unresolved_abstained','invalid')
     or new.result_report->>'status' <> 'UNAVAILABLE' then
    raise exception 'Language v1 requires explicit scientific abstention in current model'
      using errcode='23514';
  end if;
  report_decision := new.dimension_result_id::text || ':report';
  if not exists (select 1 from jsonb_array_elements(new.decision_ledger) x
    where x->>'decisionId'=report_decision and x->>'stage'='NARRATIVE'
      and x->>'outcome'='UNAVAILABLE') then
    raise exception 'missing immutable narrative decision' using errcode='23514';
  end if;
  reason := case when new.status='invalid' then 'RECORDING_QUALITY_INELIGIBLE'
    else 'MEANING_CALIBRATION_REQUIRED' end;
  reflection := jsonb_build_object(
    'schemaVersion','reflection-narrative.v1','languageVersion','1.0.0','canonVersion','2.0',
    'sourceResultId',new.id::text,'status','UNRESOLVED',
    'strongestObservation',null,'overview','[]'::jsonb,'dailyLife','[]'::jsonb,
    'questionToSitWith',null,'alternatives','[]'::jsonb,'evidenceRefs','[]'::jsonb,
    'decisionRefs',jsonb_build_array(report_decision),'meaningUnitRefs','[]'::jsonb,
    'unresolved',jsonb_build_object('reasonCodes',jsonb_build_array(reason),
      'explanation',jsonb_build_object(
        'text',case when new.status='invalid'
          then 'A reliable personal reflection is unavailable because these recordings did not pass the recording quality checks.'
          else 'Your recordings are saved, but a dependable personal reflection is not available for this moment yet.' end,
        'evidenceRefs','[]'::jsonb,'decisionRefs',jsonb_build_array(report_decision),
        'meaningUnitRefs','[]'::jsonb)));
  new.result_report := new.result_report || jsonb_build_object(
    'reflectionNarrative',reflection,'selectedMeaningUnitIds','[]'::jsonb,
    'meaningPublication',jsonb_build_object('status','CALIBRATION_REQUIRED',
      'registryVersion','meaning-publication.v1','selected','[]'::jsonb,
      'suppressionReasons',jsonb_build_array(reason)));
  new.version_manifest := new.version_manifest || jsonb_build_object(
    'languageSystem','1.0.0','reflectionContract','reflection-narrative.v1',
    'canonAuthority','2.0','meaningPublication','meaning-publication.v1');
  return new;
end;
$$;
revoke all on function public.seal_unresolved_reflection_v1() from public, anon, authenticated;
create trigger seal_unresolved_reflection_v1
  before insert on public.semantic_result_records
  for each row execute function public.seal_unresolved_reflection_v1();
comment on function public.seal_unresolved_reflection_v1() is
  'Canon v2.0: immutable Language v1 projection at result creation; no score-derived meaning, no READY claims without approved calibration, no historic updates.';
