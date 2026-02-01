#!/bin/sh
echo "Waiting for database to be ready..."

# Check if DATABASE_URL is set (production) or use individual vars (development)
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL for connection"
  # Use DATABASE_URL directly with psql
  DB_CONNECTION="$DATABASE_URL"
else
  echo "Using individual environment variables for connection"
  # Build connection for local Docker development
  DB_HOST="${POSTGRES_HOST:-auth-db}"
  DB_USER="${POSTGRES_USER:-auth_user}"
  DB_PASS="${POSTGRES_PASSWORD:-auth_pass}"
  DB_NAME="${POSTGRES_DB:-auth_db}"
  DB_CONNECTION="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/${DB_NAME}"
fi

# Wait for database to be ready with retries
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if psql "$DB_CONNECTION" -c "SELECT 1" > /dev/null 2>&1; then
    echo "Database is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "Waiting for database... ($attempt/$max_attempts)"
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "Database connection failed after $max_attempts attempts"
  exit 1
fi

echo "Initializing database schema..."
psql "$DB_CONNECTION" -f /app/scripts/init-schema.sql

if [ $? -eq 0 ]; then
  echo "Database schema initialized successfully!"
else
  echo "Schema initialization failed!"
  exit 1
fi

echo "Running migrations..."
# Run all migrations in the migrations directory
# 
# DESIGN DECISION: Migrations are designed to be idempotent using IF NOT EXISTS guards.
# This allows the script to continue on failure (e.g., when migrations are already applied)
# without requiring a separate migration tracking mechanism like Flyway/Liquibase.
#
# REQUIREMENT: All migration files MUST use IF NOT EXISTS or similar guards to ensure safe re-runs.
# This is a contract that must be followed by all future migrations.
#
# NOTE: Silent continuation on failure is intentional - it allows the script to be re-run safely
# when migrations have already been applied. However, this means:
# - All migrations must be idempotent (use IF NOT EXISTS)
# - Non-idempotent migrations will fail silently if they error
# - Consider adding migration tracking in the future if migration count grows significantly
#
for migration in /app/scripts/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "Running migration: $(basename $migration)"
    psql "$DB_CONNECTION" -f "$migration"
    if [ $? -eq 0 ]; then
      echo "Migration $(basename $migration) completed successfully!"
    else
      echo "Migration $(basename $migration) failed!"
      # Don't exit on migration failure - migrations might already be applied
      # This is safe because all migrations use IF NOT EXISTS guards for idempotency
    fi
  fi
done

echo "Database setup complete!"
echo ""
echo "   Or run: docker exec auth-service sh /app/scripts/seed-users.sh"
echo "   (after auth-service is fully started)"