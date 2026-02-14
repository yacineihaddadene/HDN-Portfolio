#!/bin/sh
set -e

# Forward SIGTERM to the server so the container can shut down gracefully
SERVER_PID=""
trap 'if [ -n "$SERVER_PID" ]; then kill -TERM "$SERVER_PID" 2>/dev/null; fi; exit 143' TERM

# Use DATABASE_URL (App Platform / production) or fall back to Docker Compose host (app-db)
if [ -z "$DATABASE_URL" ]; then
  echo "Waiting for database to be ready (Docker: app-db)..."
  TIMEOUT=60
  ELAPSED=0
  until pg_isready -h app-db -U app_user -d portfolio_app 2>/dev/null || [ $ELAPSED -ge $TIMEOUT ]; do
    echo "Database is unavailable - sleeping (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
  done
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "ERROR: Database did not become ready within ${TIMEOUT} seconds"
    exit 1
  fi
else
  echo "Waiting for database to be ready (DATABASE_URL)..."
  TIMEOUT=60
  ELAPSED=0
  until psql "$DATABASE_URL" -c "SELECT 1" >/dev/null 2>&1 || [ $ELAPSED -ge $TIMEOUT ]; do
    echo "Database is unavailable - sleeping (${ELAPSED}s/${TIMEOUT}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
  done
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "ERROR: Database did not become ready within ${TIMEOUT} seconds"
    exit 1
  fi
fi

echo "Database is ready!"

# Start the server in the background so the process listens on PORT and readiness probes pass.
# Migrations run after the server is up to avoid health-check timeout (migrate + push can take 60s+).
echo "Starting Next.js server on port ${PORT:-8080}..."
npm start &
SERVER_PID=$!

# Give the server a moment to bind to the port
sleep 5

echo "Running database migrations..."
if npm run db:migrate; then
  echo "Custom migrations completed"
fi
if npm run db:push; then
  echo "Migrations completed successfully"
else
  echo "WARNING: db:push failed or timed out, continuing with existing schema..."
fi

# Wait for the server (keeps container running; trap above forwards SIGTERM to it)
wait $SERVER_PID
