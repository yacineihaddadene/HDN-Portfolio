#!/bin/sh
set -e

echo "Waiting for database to be ready..."
# Wait for PostgreSQL to be ready (max 60 seconds)
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

echo "Database is ready!"

echo "Running database migrations..."
if npm run db:migrate; then
  echo "Custom migrations completed"
fi
if npm run db:push; then
  echo "Migrations completed successfully"
else
  echo "WARNING: Migrations failed, but continuing..."
fi

echo "Seeding database..."
# Run seed in background and wait with timeout
npm run seed &
SEED_PID=$!
# Wait up to 30 seconds for seed to complete
for i in $(seq 1 30); do
  if ! kill -0 $SEED_PID 2>/dev/null; then
    # Process finished
    wait $SEED_PID
    SEED_EXIT=$?
    if [ $SEED_EXIT -eq 0 ]; then
      echo "Seeding completed successfully"
    else
      echo "WARNING: Seeding exited with code $SEED_EXIT, but continuing..."
    fi
    break
  fi
  sleep 1
done
# If still running, kill it and continue
if kill -0 $SEED_PID 2>/dev/null; then
  echo "WARNING: Seeding timed out, killing process and continuing..."
  kill $SEED_PID 2>/dev/null || true
  wait $SEED_PID 2>/dev/null || true
fi

echo "Starting Next.js server..."
exec node server.js
