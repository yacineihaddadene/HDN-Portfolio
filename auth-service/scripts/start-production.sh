#!/bin/sh
# Production startup script for DigitalOcean App Platform
# Database tables should already exist from initial setup

echo "🚀 Starting auth-service (Production Mode)..."
echo "📊 Database: ${DATABASE_URL:0:30}..."
echo "🔌 Port: ${PORT:-3001}"
echo ""

# Skip db:push - tables already exist, and this causes connection timeouts
# If you need to update schema, run migrations manually or use a separate job
echo "📊 Skipping schema push (tables already exist)"
echo ""

echo "🔧 Starting Next.js application..."
exec npm start
