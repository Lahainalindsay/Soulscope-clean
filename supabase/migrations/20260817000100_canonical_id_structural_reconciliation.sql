-- Milestone 5.1: Canonical ID and structural mapping reconciliation.
-- This forward migration preserves historical rows while making the active
-- Evidence Ledger path canonical for future semantic inference.

comment on table public.evidence_records is
  'LEGACY compatibility evidence rows from the pre-ledger backend foundation. Historical rows are retained and immutable/readable under existing RLS, but this table is not the active canonical Evidence write path for MeasurementRecord -> Evidence -> Dimension processing.';

comment on table public.evidence_ledgers is
  'Canonical immutable Evidence Ledger generated from one immutable MeasurementRecord. Future semantic inference consumes this table, with canonical EV_* marker IDs, source components, missing/rejected/insufficient states, provenance, and versions.';

alter table public.evidence_ledgers
  add constraint evidence_ledgers_registry_version_canonical_check
  check (evidence_registry_version = '0.1');

create or replace function public.validate_canonical_evidence_ledger_entries()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  entry jsonb;
begin
  for entry in select * from jsonb_array_elements(new.entries)
  loop
    if coalesce(entry ->> 'marker_id', '') !~ '^EV_(PRO|ENG|TIM|PHO|SPE|DYN)_[0-9]{3}$' then
      raise exception 'Evidence Ledger entries must use canonical EV_* marker IDs'
        using errcode = '23514';
    end if;

    if coalesce(entry #>> '{version,evidenceRegistry}', new.evidence_registry_version) <> new.evidence_registry_version then
      raise exception 'Evidence Ledger entry registry version mismatch'
        using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

create trigger evidence_ledgers_validate_canonical_entries
before insert or update of entries, evidence_registry_version
on public.evidence_ledgers
for each row execute function public.validate_canonical_evidence_ledger_entries();

create table public.result_manifest_evidence_ledgers (
  id uuid primary key default gen_random_uuid(),
  manifest_id uuid not null references public.result_manifests(id) on delete restrict,
  evidence_ledger_id uuid not null references public.evidence_ledgers(id) on delete restrict,
  evidence_order integer not null,
  created_at timestamptz not null default now(),
  constraint result_manifest_evidence_ledgers_order_check
    check (evidence_order > 0),
  constraint result_manifest_evidence_ledgers_manifest_ledger_unique
    unique (manifest_id, evidence_ledger_id),
  constraint result_manifest_evidence_ledgers_manifest_order_unique
    unique (manifest_id, evidence_order)
);

comment on table public.result_manifest_evidence_ledgers is
  'Canonical result-manifest membership for immutable Evidence Ledgers. The older result_manifest_evidence table remains only for legacy evidence_records compatibility.';

create index result_manifest_evidence_ledgers_manifest_id_idx
on public.result_manifest_evidence_ledgers (manifest_id);

create index result_manifest_evidence_ledgers_evidence_ledger_id_idx
on public.result_manifest_evidence_ledgers (evidence_ledger_id);

create or replace function public.validate_result_manifest_evidence_ledger()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  manifest_scan_id uuid;
  ledger_scan_id uuid;
begin
  select scan_result_versions.scan_id
    into manifest_scan_id
    from public.result_manifests
    join public.scan_result_versions on scan_result_versions.id = result_manifests.result_version_id
   where result_manifests.id = new.manifest_id;

  if manifest_scan_id is null then
    raise exception 'manifest not found for evidence ledger membership %', new.id
      using errcode = '23503';
  end if;

  select scan_id
    into ledger_scan_id
    from public.evidence_ledgers
   where id = new.evidence_ledger_id;

  if ledger_scan_id is null then
    raise exception 'evidence ledger not found for evidence ledger membership %', new.id
      using errcode = '23503';
  end if;

  if ledger_scan_id <> manifest_scan_id then
    raise exception 'manifest evidence ledger must belong to the same scan as the result'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger result_manifest_evidence_ledgers_validate_relationship
before insert or update of manifest_id, evidence_ledger_id
on public.result_manifest_evidence_ledgers
for each row execute function public.validate_result_manifest_evidence_ledger();

create trigger result_manifest_evidence_ledgers_prevent_finalized_insert
before insert on public.result_manifest_evidence_ledgers
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create trigger result_manifest_evidence_ledgers_prevent_finalized_update
before update on public.result_manifest_evidence_ledgers
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create trigger result_manifest_evidence_ledgers_prevent_finalized_delete
before delete on public.result_manifest_evidence_ledgers
for each row execute function public.prevent_finalized_manifest_evidence_mutation();

create or replace function public.add_result_manifest_evidence_ledger(
  p_result_version_id uuid,
  p_evidence_ledger_id uuid,
  p_evidence_order integer
)
returns table (
  membership_id uuid,
  manifest_id uuid,
  evidence_ledger_id uuid,
  evidence_order integer
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  locked_result public.scan_result_versions%rowtype;
  locked_manifest_id uuid;
  ledger_scan_id uuid;
  existing_membership public.result_manifest_evidence_ledgers%rowtype;
  caller_is_service boolean := coalesce(auth.jwt() ->> 'role', '') = 'service_role';
begin
  if not caller_is_service then
    raise exception 'service role is required to add result manifest evidence ledgers'
      using errcode = '42501';
  end if;

  if p_evidence_order <= 0 then
    raise exception 'evidence_order must be greater than zero'
      using errcode = '23514';
  end if;

  select *
    into locked_result
    from public.scan_result_versions as srv
   where srv.id = p_result_version_id
   for update;

  if not found then
    raise exception 'result version not found'
      using errcode = '02000';
  end if;

  if locked_result.status <> 'draft' then
    raise exception 'manifest evidence ledgers can be added only to draft results'
      using errcode = '23514';
  end if;

  select rm.id
    into locked_manifest_id
    from public.result_manifests as rm
   where rm.result_version_id = locked_result.id;

  if locked_manifest_id is null then
    raise exception 'result manifest not found'
      using errcode = '02000';
  end if;

  select el.scan_id
    into ledger_scan_id
    from public.evidence_ledgers as el
   where el.id = p_evidence_ledger_id;

  if ledger_scan_id is null then
    raise exception 'evidence ledger not found'
      using errcode = '02000';
  end if;

  if ledger_scan_id <> locked_result.scan_id then
    raise exception 'evidence ledger must belong to the same scan as the result'
      using errcode = '23514';
  end if;

  select *
    into existing_membership
    from public.result_manifest_evidence_ledgers
   where result_manifest_evidence_ledgers.manifest_id = locked_manifest_id
     and result_manifest_evidence_ledgers.evidence_ledger_id = p_evidence_ledger_id;

  if found then
    if existing_membership.evidence_order <> p_evidence_order then
      raise exception 'evidence ledger already exists in manifest with a different order'
        using errcode = '23505';
    end if;

    membership_id := existing_membership.id;
    manifest_id := existing_membership.manifest_id;
    evidence_ledger_id := existing_membership.evidence_ledger_id;
    evidence_order := existing_membership.evidence_order;
    return next;
    return;
  end if;

  insert into public.result_manifest_evidence_ledgers (
    manifest_id,
    evidence_ledger_id,
    evidence_order
  )
  values (
    locked_manifest_id,
    p_evidence_ledger_id,
    p_evidence_order
  )
  returning id, result_manifest_evidence_ledgers.manifest_id, result_manifest_evidence_ledgers.evidence_ledger_id, result_manifest_evidence_ledgers.evidence_order
  into membership_id, manifest_id, evidence_ledger_id, evidence_order;

  return next;
end;
$$;

alter table public.result_manifest_evidence_ledgers enable row level security;
alter table public.result_manifest_evidence_ledgers force row level security;

create policy "result_manifest_evidence_ledgers_select_own_finalized"
on public.result_manifest_evidence_ledgers
for select
to authenticated
using (
  exists (
    select 1
      from public.result_manifests
      join public.scan_result_versions on scan_result_versions.id = result_manifests.result_version_id
      join public.scan_sessions on scan_sessions.id = scan_result_versions.scan_id
     where result_manifests.id = result_manifest_evidence_ledgers.manifest_id
       and scan_result_versions.status = 'finalized'
       and scan_sessions.user_id = (select auth.uid())
  )
);

revoke all on public.result_manifest_evidence_ledgers from public, anon, authenticated;
revoke all on function public.validate_canonical_evidence_ledger_entries() from public, anon, authenticated;
revoke all on function public.validate_result_manifest_evidence_ledger() from public, anon, authenticated;
revoke all on function public.add_result_manifest_evidence_ledger(uuid, uuid, integer) from public, anon, authenticated;

grant select on public.result_manifest_evidence_ledgers to authenticated;
grant execute on function public.add_result_manifest_evidence_ledger(uuid, uuid, integer) to service_role;
grant all on public.result_manifest_evidence_ledgers to service_role;
