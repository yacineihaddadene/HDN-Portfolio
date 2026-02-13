#!/bin/sh
# Simplified startup script for production deployment
# Database schema is auto-created by Drizzle ORM on first connection

echo "🚀 Starting auth-service..."
echo "📊 Environment: ${NODE_ENV:-development}"
echo "🔌 Port: ${PORT:-3001}"

# For production, skip database setup script and let the app handle it
# The app will automatically create tables on first connection via Drizzle
if [ "${NODE_ENV}" = "production" ]; then
  echo "✅ Production mode: Database tables will be auto-created by Drizzle ORM"
  echo "� Starting auth-service..."
  exec npm start
else
  # Development mode: try to setup database if possible
  echo "📊 Development mode: Setting up database..."
  if [ -f ./scripts/setup-db.sh ]; then
    ./scripts/setup-db.sh || echo "⚠️  Database setup skipped (will be created by app)"
  fi
  
  # Start the service in background
  echo "🔧 Starting auth-service in background..."
  npm start &
  NPM_PID=$!
  
  # Wait for service to be ready
  echo "⏳ Waiting for auth-service to be ready..."
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
      echo "✅ Auth-service is ready!"
      break
    fi
    attempt=$((attempt + 1))
    if [ $((attempt % 5)) -eq 0 ]; then
      echo "   Still waiting... ($attempt/$max_attempts)"
    fi
    sleep 1
  done
  
  # Seed users in development
  if [ $attempt -lt $max_attempts ] && [ -f ./scripts/seed-users.sh ]; then
    echo "🌱 Seeding development users..."
    ./scripts/seed-users.sh || echo "⚠️  User seeding skipped"
  fi
  
  echo "✅ Setup complete!"
  echo "📝 Test users (if seeded):"
  echo "   Admin:    admin@test.com / password123"
  echo "   Customer: customer@test.com / password123"
  echo ""
  echo "🔧 Auth-service is running..."
  
  # Wait for npm process
  wait $NPM_PID
fi

