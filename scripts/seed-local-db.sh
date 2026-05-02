#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

MYSQL_BIN="${MYSQL_BIN:-mysql}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-eventflow}"
DB_USER="${DB_USER:-eventflow_app}"

SQL_FILES=(
  "$ROOT_DIR/src/main/resources/db/migration/V1__create_base_schema.sql"
  "$ROOT_DIR/src/main/resources/db/migration/V2__seed_auth_password_hashes.sql"
  "$ROOT_DIR/src/main/resources/db/migration/V3__add_task_required_skills.sql"
  "$ROOT_DIR/src/main/resources/db/migration/V4__add_student_recommendation_snapshots.sql"
  "$ROOT_DIR/src/main/resources/db/seed/V1__seed_preview_data.sql"
)

echo "Seeding EventFlow database '$DB_NAME' on ${DB_HOST}:${DB_PORT} as ${DB_USER}"

for sql_file in "${SQL_FILES[@]}"; do
  echo "Applying $(basename "$sql_file")"
  "$MYSQL_BIN" --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --password "$DB_NAME" < "$sql_file"
done

echo "Seed completed successfully."
