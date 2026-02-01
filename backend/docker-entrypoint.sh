#!/bin/sh
set -e

echo "🚀 Starting backend service..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until wget --spider -q http://app-db:5432 2>/dev/null || nc -z app-db 5432; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run migrations
echo "🔧 Running migrations..."
npm run db:migrate || echo "⚠️  Custom migration failed or already applied"
npm run db:push || echo "⚠️  Drizzle push failed"

# Seed database
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed or already done"

echo "✅ Backend initialization complete!"

# Execute the CMD
exec "$@"
