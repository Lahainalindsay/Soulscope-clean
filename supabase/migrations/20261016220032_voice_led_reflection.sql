-- Direct-listening reflections are participant-rated impressions, not Canon emotion results.
-- Existing immutable v1 and transcript-only v2 records are not rewritten.
create table public.voice_reflection_consents (
  scan_id uuid primary key references public.scan_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version text not null check (version = 'voice-reflection-v1'),
  created_at timestamptz not null default now()
);
alter table public.voice_reflection_consents enable row level security;
create policy "Owner reads voice consent" on public.voice_reflection_consents for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Owner gives voice consent" on public.voice_reflection_consents for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.scan_sessions s where s.id = scan_id and s.user_id = (select auth.uid())
      and s.transcription_consent and s.lifecycle_state <> 'deleted'
  ));
revoke all on public.voice_reflection_consents from anon, authenticated;
grant select, insert on public.voice_reflection_consents to authenticated;
grant all on public.voice_reflection_consents to service_role;

create table public.voice_observation_records (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references public.scan_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  observations jsonb not null check (jsonb_typeof(observations) = 'array'),
  source_artifacts jsonb not null check (jsonb_typeof(source_artifacts) = 'array'),
  model_version text not null,
  created_at timestamptz not null default now()
);
create index voice_reflection_consents_user_idx on public.voice_reflection_consents(user_id);
create index voice_observation_records_user_idx on public.voice_observation_records(user_id);
alter table public.voice_observation_records enable row level security;
create policy "Owner reads voice observations" on public.voice_observation_records for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.scan_sessions s where s.id = scan_id and s.user_id = (select auth.uid())
  ));
revoke all on public.voice_observation_records from anon, authenticated;
grant select on public.voice_observation_records to authenticated;
grant all on public.voice_observation_records to service_role;

create function public.validate_voice_observations_insert() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare a jsonb; o jsonb; c jsonb; source_ids text[]; observation_ids text[] := '{}'; covered text[] := '{}';
begin
  if not exists (select 1 from public.scan_sessions s join public.voice_reflection_consents v on v.scan_id = s.id
      where s.id = new.scan_id and s.user_id = new.user_id and v.user_id = new.user_id
        and s.lifecycle_state = 'finalized' and s.transcription_consent and v.version = 'voice-reflection-v1') then
    raise exception 'voice evidence requires owner consent and finalized source';
  end if;
  if jsonb_array_length(new.source_artifacts) <> 3 or jsonb_array_length(new.observations) not between 3 and 6 then
    raise exception 'incomplete voice evidence';
  end if;
  source_ids := array(select value->>'captureId' from jsonb_array_elements(new.source_artifacts));
  if (select count(distinct v) from unnest(source_ids) v) <> 3 then raise exception 'duplicate voice source'; end if;
  for a in select value from jsonb_array_elements(new.source_artifacts) loop
    if not exists (select 1 from public.capture_artifacts ca join public.scan_prompt_captures pc on pc.id = ca.capture_id
        where ca.id::text = a->>'artifactId' and ca.scan_id = new.scan_id and pc.scan_id = new.scan_id
          and ca.capture_id::text = a->>'captureId' and ca.checksum_sha256 = a->>'checksumSha256'
          and ca.audio_state in ('stored_private', 'processing')
          and (a->>'durationMs') ~ '^[0-9]+$' and (a->>'durationMs')::integer between 25000 and 35000) then
      raise exception 'invalid voice source artifact';
    end if;
  end loop;
  for o in select value from jsonb_array_elements(new.observations) loop
    if o->>'id' is null or (o->>'id') = any(observation_ids)
      or coalesce(char_length(o->>'delivery'),0) not between 12 and 800
      or o->>'impression' is null or char_length(o->>'impression') > 600
      or jsonb_typeof(o->'captureIds') is distinct from 'array'
      or jsonb_array_length(o->'captureIds') not between 1 and 3 then raise exception 'invalid listening observation'; end if;
    observation_ids := array_append(observation_ids, o->>'id');
    for c in select value from jsonb_array_elements(o->'captureIds') loop
      if jsonb_typeof(c) is distinct from 'string' or not coalesce((c #>> '{}') = any(source_ids),false)
        then raise exception 'unknown voice capture'; end if;
      covered := array_append(covered, c #>> '{}');
    end loop;
  end loop;
  if not source_ids <@ covered then raise exception 'incomplete listening coverage'; end if;
  return new;
end; $$;
create trigger voice_observation_source_gate before insert on public.voice_observation_records
  for each row execute function public.validate_voice_observations_insert();
revoke all on function public.validate_voice_observations_insert() from public, anon, authenticated;

create or replace function public.validate_reflection_v2_insert() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare sec text; item jsonb; span jsonb; ref jsonb; body text; source_text text;
  voice jsonb; uses_voice boolean := false; overview_voice boolean := false; expression_voice boolean := false;
begin
  if not exists (select 1 from public.scan_sessions s where s.id = new.scan_id and s.user_id = new.user_id
      and s.transcription_consent and s.lifecycle_state = 'finalized')
    or not exists (select 1 from public.semantic_result_records r where r.id = new.semantic_result_id
      and r.scan_id = new.scan_id and r.status = 'unresolved_abstained') then raise exception 'invalid v2 source or consent'; end if;
  if new.status <> 'READY' then return new; end if;
  if new.narrative ? 'mode' then
    if new.narrative->>'mode' <> 'VOICE_AND_WORDS' then raise exception 'unknown reading mode'; end if;
    select v.observations into voice from public.voice_observation_records v
      where v.id::text = new.narrative->>'voiceRecordId' and v.scan_id = new.scan_id and v.user_id = new.user_id;
    if voice is null then raise exception 'missing direct listening evidence'; end if;
    uses_voice := true;
  end if;
  if jsonb_typeof(new.narrative->'sections') is distinct from 'object'
    or (select count(*) from jsonb_object_keys(new.narrative->'sections')) <> 5
    or exists (select 1 from jsonb_object_keys(new.narrative->'sections') k
      where k not in ('overview','cognition','relationships','expression','question')) then raise exception 'invalid sections'; end if;
  foreach sec in array array['overview','cognition','relationships','expression','question'] loop
    if jsonb_typeof(new.narrative->'sections'->sec) is distinct from 'array'
      or jsonb_array_length(new.narrative->'sections'->sec) > 5 then raise exception 'invalid section'; end if;
    if sec = 'overview' and jsonb_array_length(new.narrative->'sections'->sec) = 0 then raise exception 'missing overview'; end if;
    if sec = 'question' and jsonb_array_length(new.narrative->'sections'->sec) > 1 then raise exception 'multiple questions'; end if;
    for item in select value from jsonb_array_elements(new.narrative->'sections'->sec) loop
      body := item->>'text';
      if body is null or char_length(body) not between 8 and 500
        or jsonb_typeof(item->'sourceSpans') is distinct from 'array'
        or jsonb_array_length(item->'sourceSpans') > 4 then raise exception 'unsupported sentence'; end if;
      if uses_voice then
        if jsonb_typeof(item->'audioRefs') is distinct from 'array' or jsonb_array_length(item->'audioRefs') > 4
          or jsonb_array_length(item->'sourceSpans') + jsonb_array_length(item->'audioRefs') = 0 then raise exception 'missing sentence evidence'; end if;
        if sec in ('cognition','relationships') and jsonb_array_length(item->'sourceSpans') = 0 then raise exception 'words required for domain'; end if;
        for ref in select value from jsonb_array_elements(item->'audioRefs') loop
          if jsonb_typeof(ref) <> 'string' or not exists (
            select 1 from jsonb_array_elements(voice) o where o->>'id' = ref #>> '{}') then raise exception 'unknown voice reference'; end if;
          if sec = 'overview' then overview_voice := true; end if;
          if sec = 'expression' then expression_voice := true; end if;
        end loop;
      elsif jsonb_array_length(item->'sourceSpans') = 0 or item ? 'audioRefs' then raise exception 'missing word evidence'; end if;
      for span in select value from jsonb_array_elements(item->'sourceSpans') loop
        select t.text into source_text from public.capture_transcripts t
          where t.scan_id = new.scan_id and t.user_id = new.user_id and t.capture_id::text = span->>'captureId';
        if source_text is null or coalesce(span->>'start','') !~ '^[0-9]+$' or coalesce(span->>'end','') !~ '^[0-9]+$'
          or (span->>'end')::integer <= (span->>'start')::integer
          or (span->>'end')::integer > char_length(source_text)
          or substr(source_text, (span->>'start')::integer + 1, (span->>'end')::integer - (span->>'start')::integer)
            is distinct from span->>'quote' then raise exception 'invalid transcript span'; end if;
      end loop;
    end loop;
  end loop;
  if uses_voice and (not overview_voice or (jsonb_array_length(new.narrative->'sections'->'expression') > 0 and not expression_voice))
    then raise exception 'voice-led reading requires voice evidence'; end if;
  return new;
end; $$;
