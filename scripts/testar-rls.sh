#!/usr/bin/env bash
# Testa as migrações SQL e as regras de acesso (RLS) num Postgres descartável e local.
# Não toca em nenhum banco real. Precisa do Postgres instalado (pg_ctlcluster) e de sudo/root.
set -euo pipefail
cd "$(dirname "$0")/.."
DB="lucauto_teste_$$"
PSQL="runuser -u postgres -- psql -X -q -v ON_ERROR_STOP=1"
runuser -u postgres -- createdb "$DB"
trap 'runuser -u postgres -- dropdb --if-exists "$DB" >/dev/null 2>&1; runuser -u postgres -- psql -qc "drop role if exists anon" -c "drop role if exists authenticated" >/dev/null 2>&1 || true' EXIT
$PSQL -d "$DB" -f tests/sql/stub_supabase.sql
for f in supabase/migrations/*.sql; do echo "aplicando $f"; $PSQL -d "$DB" -f "$f"; done
runuser -u postgres -- psql -X -q -d "$DB" -f tests/sql/rls.test.sql
