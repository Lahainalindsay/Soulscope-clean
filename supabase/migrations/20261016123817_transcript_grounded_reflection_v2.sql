-- Additive transcript-grounded interpretation. Existing semantic results remain sealed.
alter table public.scan_sessions
  add column transcription_consent boolean not null default false,
  add column transcription_consent_version text,
  add column transcription_consented_at timestamptz,
  add constraint transcription_consent_explicit check (
    (transcription_consent and transcription_consent_version = 'transcript-reflection-v1' and transcription_consented_at is not null)
    or (not transcription_consent and transcription_consent_version is null and transcription_consented_at is null)
  );
grant insert (transcription_consent, transcription_consent_version, transcription_consented_at)
  on public.scan_sessions to authenticated;

create table public.capture_transcripts (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scan_sessions(id) on delete cascade,
  capture_id uuid not null references public.scan_prompt_captures(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) <= 12000),
  provider text not null,
  model_version text not null,
  created_at timestamptz not null default now(),
  unique (capture_id), unique (scan_id, capture_id)
);
create function public.validate_capture_transcript_insert() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from public.scan_sessions s where s.id = new.scan_id
    and s.user_id = new.user_id and s.transcription_consent)
    or not exists (select 1 from public.scan_prompt_captures c where c.id = new.capture_id
      and c.scan_id = new.scan_id) then
    raise exception 'transcript requires matching consented capture';
  end if;
  return new;
end; $$;
create trigger transcript_source_gate before insert on public.capture_transcripts
  for each row execute function public.validate_capture_transcript_insert();
revoke all on function public.validate_capture_transcript_insert() from public, anon, authenticated;
alter table public.capture_transcripts enable row level security;
create policy "Owner reads own transcripts" on public.capture_transcripts for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.scan_sessions s where s.id = scan_id and s.user_id = (select auth.uid())
  ));
revoke all on public.capture_transcripts from anon, authenticated;
grant select on public.capture_transcripts to authenticated;
grant all on public.capture_transcripts to service_role;

create table public.reflection_results_v2 (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references public.scan_sessions(id) on delete cascade,
  semantic_result_id uuid not null unique references public.semantic_result_records(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('READY','UNRESOLVED')),
  narrative jsonb not null,
  model_version text not null,
  created_at timestamptz not null default now(),
  constraint v2_status_matches check (narrative->>'status' = status and narrative->>'schemaVersion' = 'reflection-narrative.v2')
);
alter table public.reflection_results_v2 enable row level security;
create policy "Owner reads own reflections" on public.reflection_results_v2 for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.scan_sessions s where s.id = scan_id and s.user_id = (select auth.uid())
  ));
revoke all on public.reflection_results_v2 from anon, authenticated;
grant select on public.reflection_results_v2 to authenticated;
grant all on public.reflection_results_v2 to service_role;

create table public.reflection_feedback_v2 (
  id uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references public.reflection_results_v2(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check (rating in ('accurate','partly','missed_me')),
  created_at timestamptz not null default now(),
  unique (reflection_id, user_id)
);
alter table public.reflection_feedback_v2 enable row level security;
create policy "Owner reads own feedback" on public.reflection_feedback_v2 for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.reflection_results_v2 r where r.id = reflection_id and r.user_id = (select auth.uid())
  ));
create policy "Owner inserts own feedback" on public.reflection_feedback_v2 for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.reflection_results_v2 r where r.id = reflection_id and r.user_id = (select auth.uid()) and r.status = 'READY'
  ));
create policy "Owner changes own feedback" on public.reflection_feedback_v2 for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.reflection_results_v2 r where r.id = reflection_id and r.user_id = (select auth.uid()) and r.status = 'READY'
  ));
revoke all on public.reflection_feedback_v2 from anon, authenticated;
grant select, insert, update on public.reflection_feedback_v2 to authenticated;
grant all on public.reflection_feedback_v2 to service_role;

-- A second database gate, independent of the model output and Python validator.
create function public.validate_reflection_v2_insert() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare sec text; item jsonb; span jsonb; body text; source_text text; count_sections integer := 0;
begin
  if not exists (select 1 from public.scan_sessions s where s.id = new.scan_id and s.user_id = new.user_id
      and s.transcription_consent and s.lifecycle_state = 'finalized')
    or not exists (select 1 from public.semantic_result_records r where r.id = new.semantic_result_id
      and r.scan_id = new.scan_id and r.status = 'unresolved_abstained') then
    raise exception 'invalid v2 source or consent';
  end if;
  if new.status = 'READY' then
    if jsonb_typeof(new.narrative->'sections') <> 'object' then raise exception 'invalid sections'; end if;
    if exists (select 1 from jsonb_object_keys(new.narrative->'sections') k
      where k not in ('overview','cognition','relationships','expression','question')) then
      raise exception 'unknown section';
    end if;
    foreach sec in array array['overview','cognition','relationships','expression','question'] loop
      if jsonb_typeof(new.narrative->'sections'->sec) <> 'array' then raise exception 'missing section'; end if;
      if sec = 'overview' and jsonb_array_length(new.narrative->'sections'->sec) = 0 then raise exception 'missing overview'; end if;
      if sec = 'question' and jsonb_array_length(new.narrative->'sections'->sec) > 1 then raise exception 'multiple questions'; end if;
      if jsonb_array_length(new.narrative->'sections'->sec) > 5 then raise exception 'section too long'; end if;
      for item in select value from jsonb_array_elements(new.narrative->'sections'->sec) loop
        body := item->>'text';
        if body is null or char_length(body) < 8 or char_length(body) > 500
          or jsonb_typeof(item->'sourceSpans') <> 'array'
          or jsonb_array_length(item->'sourceSpans') = 0 then raise exception 'unsupported sentence'; end if;
        for span in select value from jsonb_array_elements(item->'sourceSpans') loop
          select t.text into source_text from public.capture_transcripts t
            where t.scan_id = new.scan_id and t.user_id = new.user_id and t.capture_id::text = span->>'captureId';
          if source_text is null or (span->>'start') !~ '^[0-9]+$' or (span->>'end') !~ '^[0-9]+$'
            or (span->>'end')::integer <= (span->>'start')::integer
            or (span->>'end')::integer > char_length(source_text)
            or substr(source_text, (span->>'start')::integer + 1,
              (span->>'end')::integer - (span->>'start')::integer) is distinct from span->>'quote'
            then raise exception 'invalid transcript span'; end if;
        end loop;
        count_sections := count_sections + 1;
      end loop;
    end loop;
    if count_sections = 0 then raise exception 'empty reading'; end if;
  end if;
  return new;
end; $$;
create trigger reflection_v2_source_gate before insert on public.reflection_results_v2
  for each row execute function public.validate_reflection_v2_insert();
revoke all on function public.validate_reflection_v2_insert() from public, anon, authenticated;
