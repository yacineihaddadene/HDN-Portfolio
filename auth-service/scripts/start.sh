#!/bin/sh
# Startup script that initializes DB, starts service, and seeds users

echo "🚀 Starting auth-service..."

# Step 1: Setup database schema
echo "📊 Setting up database..."
./scripts/setup-db.sh
if [ $? -ne 0 ]; then
  echo "❌ Database setup failed! Cannot start service."
  exit 1
fi

# Step 2: Start the service in background
echo "🔧 Starting auth-service in background..."
npm start &
NPM_PID=$!

# Step 3: Wait for service to be ready
echo "⏳ Waiting for auth-service to be ready..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Auth-service is ready!"
    break
  fi
  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "   Still waiting... ($attempt/$max_attempts)"
  fi
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Auth-service did not start in time, but continuing..."
else
  # Step 4: Seed users now that service is ready (development only)
  # SECURITY: Seeding is disabled in production - see seed-users.sh for details
  if [ "${NODE_ENV}" = "production" ] || [ "${SPRING_PROFILES_ACTIVE}" = "prod" ] || [ "${SPRING_PROFILES_ACTIVE}" = "production" ]; then
    echo "⏭️  Skipping user seeding (production mode)"
    echo "   To create admin accounts: sign up normally, then update role via SQL"
  else
    echo "🌱 Seeding users..."
    ./scripts/seed-users.sh
    if [ $? -ne 0 ]; then
      echo "⚠️  User seeding failed. Test users may not be available."
      echo "   You can create test users manually via the signup page"
    fi
  fi
fi

# Step 5: Keep service running in foreground
echo "✅ Setup complete!"
if [ "${NODE_ENV}" != "production" ] && [ "${SPRING_PROFILES_ACTIVE}" != "prod" ] && [ "${SPRING_PROFILES_ACTIVE}" != "production" ]; then
  echo "📝 Test users available:"
  echo "   Admin:    admin@test.com / password123 (ADMIN role)"
  echo "   Customer: customer@test.com / password123 (CUSTOMER role)"
  echo ""
fi
echo "🔧 Auth-service is running..."

# Wait for npm process to keep container alive
wait $NPM_PID

