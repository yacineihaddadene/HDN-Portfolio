#!/bin/sh
# Production startup script for DigitalOcean App Platform
# This script pushes the schema to the database using Drizzle and then starts the app

echo "🚀 Starting auth-service (Production Mode)..."
echo "📊 Database: ${DATABASE_URL:0:30}..."
echo "🔌 Port: ${PORT:-3001}"
echo ""

# Push schema to database using Drizzle Kit
# This will create tables if they don't exist
echo "📊 Initializing database schema with Drizzle..."
npm run db:push -- --force

if [ $? -eq 0 ]; then
  echo "✅ Database schema is ready!"
else
  echo "⚠️  Schema push had warnings, but continuing..."
  echo "   Tables may already exist or connection may have issues"
fi

echo ""
echo "🔧 Starting Next.js application..."
exec npm start
