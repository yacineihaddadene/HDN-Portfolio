#!/bin/sh
set -e

echo "🚀 Starting backend service..."
echo "📊 Environment: ${NODE_ENV:-development}"
echo "🔌 Port: ${PORT:-8080}"

# Run database migrations using Drizzle
echo "📊 Running database migrations..."
if npm run db:push; then
  echo "✅ Database schema is ready!"
else
  echo "⚠️  Schema push had warnings, continuing..."
fi

# Run custom migrations (education migration etc.)
echo "📊 Running custom migrations..."
if npm run db:migrate; then
  echo "✅ Custom migrations completed"
else
  echo "⚠️  Custom migrations had issues, continuing..."
fi

# Seed database (with timeout)
echo "🌱 Seeding database..."
npm run seed &
SEED_PID=$!
for i in $(seq 1 30); do
  if ! kill -0 $SEED_PID 2>/dev/null; then
    wait $SEED_PID
    SEED_EXIT=$?
    if [ $SEED_EXIT -eq 0 ]; then
      echo "✅ Seeding completed"
    else
      echo "⚠️  Seeding exited with code $SEED_EXIT, continuing..."
    fi
    break
  fi
  sleep 1
done
if kill -0 $SEED_PID 2>/dev/null; then
  echo "⚠️  Seeding timed out, killing and continuing..."
  kill $SEED_PID 2>/dev/null || true
  wait $SEED_PID 2>/dev/null || true
fi

echo "🔧 Starting Next.js server..."
exec node server.js
