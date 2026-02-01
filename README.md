# Portfolio Website

A modern full-stack portfolio website with authentication, admin dashboard, and dynamic content management.

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git

### Setup (First Time)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd HDN-Portfolio
   ```

2. **Environment variables are already configured**
   - The `.env` file is already set up with generated secrets
   - You can modify the values if needed

3. **Start all services**
   ```bash
   docker compose up --build -d
   ```
   
   This will start:
   - Frontend (port 3000)
   - Backend API (port 8080)
   - Auth Service (port 3001)
   - PostgreSQL databases (ports 5433, 5434)

4. **Wait for services to initialize** (2-3 minutes on first run)
   - Databases will be created and seeded automatically
   - Check status: `docker compose ps`

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Auth Service: http://localhost:3001

6. **Login with test credentials**
   - Admin: `admin@test.com` / `password123`
   - Customer: `customer@test.com` / `password123`

## 📁 Project Structure

```
HDN-Portfolio/
├── frontend/          # Next.js frontend (port 3000)
├── backend/           # Next.js backend API (port 8080)
├── auth-service/      # Better Auth service (port 3001)
├── docker-compose.yml # Docker orchestration
└── .env              # Environment variables
```

## 🛠️ Common Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up --build -d

# View logs
docker compose logs -f [service-name]

# Stop all services
docker compose down

# Stop and remove all data
docker compose down -v

# Restart a specific service
docker compose restart [service-name]
```

## 🔧 Development

### Running Individual Services

Each service can be run independently for development:

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Auth Service:**
```bash
cd auth-service
npm install
npm run dev
```

## 📊 Database Management

### Using pgAdmin (Optional)

Start pgAdmin:
```bash
docker compose --profile pgadmin up -d pgadmin
```

Access at http://localhost:5050
- Email: `admin@portfolio.com`
- Password: `admin123`

Add servers:
- **app-db**: `app-db:5432` (user: `app_user`, password: `app_pass`)
- **auth-db**: `auth-db:5432` (user: `auth_user`, password: `auth_pass`)

## 🔐 API Endpoints

### Backend API (port 8080)

**Public Endpoints (No Auth Required):**
- `GET /api/public/skills` - Get all skills
- `GET /api/public/projects` - Get all projects
- `GET /api/public/experience` - Get work experience
- `GET /api/public/education` - Get education
- `GET /api/public/hobbies` - Get hobbies
- `GET /api/public/testimonials` - Get approved testimonials
- `GET /api/public/resume` - Get current resume
- `GET /api/public/contact-info` - Get contact information
- `POST /api/public/messages` - Send a message

**Admin Endpoints (Require ADMIN Role):**
- `GET/POST /api/admin/skills` - Manage skills
- `PUT/DELETE /api/admin/skills/[id]` - Update/delete skill
- `GET /api/admin/messages` - Get all messages
- `PATCH /api/admin/messages/[id]/read` - Mark message as read

### Auth Service (port 3001)

- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-up` - Sign up
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/get-session` - Get current session
- `GET /api/auth/token` - Get JWT token for backend

## 🧪 Testing

### Health Checks

```bash
# Frontend
curl http://localhost:3000/api/health

# Backend
curl http://localhost:8080/api/health

# Auth Service
curl http://localhost:3001/api/health
```

### Test Users (Seeded Automatically)

| Email | Password | Role |
|-------|----------|------|
| admin@test.com | password123 | ADMIN |
| customer@test.com | password123 | CUSTOMER |

## 🐛 Troubleshooting

### Services not starting

1. Check if ports are already in use:
   ```bash
   lsof -i :3000
   lsof -i :8080
   lsof -i :3001
   ```

2. Check service logs:
   ```bash
   docker compose logs [service-name]
   ```

3. Restart services:
   ```bash
   docker compose down
   docker compose up --build -d
   ```

### Database issues

1. Check if databases are healthy:
   ```bash
   docker compose ps
   ```

2. Reset databases (⚠️ destroys all data):
   ```bash
   docker compose down -v
   docker compose up --build -d
   ```

### "Secret must be at least 32 characters" error

The `.env` file already has generated secrets. If you need new ones:
```bash
openssl rand -base64 32
```

## 📝 Environment Variables

See `.env` file for all configuration. Key variables:

- `BETTER_AUTH_SECRET` - Secret for Better Auth (min 32 chars)
- `AUTH_JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `FRONTEND_URL` - Frontend URL
- `NEXT_PUBLIC_API_URL` - Backend API URL (client-side)
- `NEXT_PUBLIC_AUTH_SERVICE_URL` - Auth service URL (client-side)

## 📚 Documentation

For detailed documentation, see `PROJECT_STRUCTURE_AND_SETUP.md`.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details