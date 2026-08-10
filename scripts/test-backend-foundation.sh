#!/usr/bin/env bash
set -euo pipefail

# Local PostgreSQL compatibility and behavior harness for the backend foundation.
# This validates migration compatibility and core invariants on PostgreSQL 15.
# It does not validate the complete hosted Supabase stack and never deploys.

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

db_name="${SOULSCOPE_TEST_DB:-soulscope_migration_test}"

if [[ ! "$db_name" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
  echo "Unsafe database name: $db_name" >&2
  exit 1
fi

if [[ ! "$db_name" =~ ^soulscope_ ]]; then
  echo "Refusing to touch database '$db_name': SOULSCOPE_TEST_DB must begin with soulscope_" >&2
  exit 1
fi

for cmd in psql createdb dropdb sudo; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Required command not found: $cmd" >&2
    exit 1
  fi
done

psql_postgres=(sudo -u postgres psql -X -v ON_ERROR_STOP=1)
createdb_postgres=(sudo -u postgres createdb)
dropdb_postgres=(sudo -u postgres dropdb)

echo "Preparing disposable local PostgreSQL database: $db_name"

"${psql_postgres[@]}" -d postgres -c "do \$\$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin;
  end if;
end
\$\$;"

"${dropdb_postgres[@]}" --if-exists "$db_name"
"${createdb_postgres[@]}" "$db_name"

echo "Applying local auth compatibility scaffold"
"${psql_postgres[@]}" -d "$db_name" -f supabase/tests/local_auth_compatibility.sql

echo "Applying backend foundation migrations"
"${psql_postgres[@]}" -d "$db_name" -f supabase/migrations/202608050001_backend_foundation.sql
"${psql_postgres[@]}" -d "$db_name" -f supabase/migrations/202608050002_capture_processing_evidence.sql
"${psql_postgres[@]}" -d "$db_name" -f supabase/migrations/202608050003_result_history_baseline.sql

echo "Running backend foundation runtime assertions"
"${psql_postgres[@]}" -d "$db_name" -f supabase/tests/backend_foundation_runtime.sql

echo "PASS: backend foundation migrations and runtime invariants validated on local PostgreSQL"
