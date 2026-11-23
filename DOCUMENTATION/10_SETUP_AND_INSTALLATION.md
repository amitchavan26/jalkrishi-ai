# Setup and Installation Guide

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Docker** | 24.x+ | Container runtime |
| **Docker Compose** | 2.x+ | Multi-container orchestration |
| **Git** | 2.x+ | Version control |
| **Node.js** | 18.x+ | Frontend development (optional, for local dev) |
| **Java** | 17+ | Backend development (optional, for local dev) |
| **Python** | 3.11+ | ML service development (optional, for local dev) |
| **Gradle** | 8.x | Backend build (wrapper included) |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| Disk | 5 GB | 10 GB+ |
| CPU | 2 cores | 4+ cores |

### Ports Required

| Port | Service | Note |
|------|---------|------|
| 27017 | MongoDB | Internal only in Docker |
| 8000 | ML Service | Internal + host access |
| 8080 | Backend | Host access |
| 5173 | Frontend | Host access (Nginx in prod, Vite in dev) |

---

## Quick Start (Docker - Recommended)

### 1. Clone Repository
```bash
git clone <repository-url>
cd jal-krishi-sample
```

### 2. Configure Environment (Optional)
```bash
# Copy example env file
cp .env.example .env

# Edit if needed (defaults work for local development)
# .env contents:
# JWT_SECRET=your-secure-32-char-secret
# CORS_ORIGIN=http://localhost:5173
# VITE_API_URL=http://localhost:8080
# AUTH_RATE_LIMIT=10
# ML_URL=http://ml-service:8000
```

### 3. Start All Services
```bash
# Build and start in background
docker compose up -d --build

# Or watch logs
docker compose up --build
```

### 4. Verify Services
```bash
# Check all containers running
docker compose ps

# Expected output:
# NAME                    STATUS
# jal-krishi-sample-mongo-1       Up (healthy)
# jal-krishi-sample-ml-service-1  Up (healthy)
# jal-krishi-sample-backend-1     Up (healthy)
# jal-krishi-sample-frontend-1    Up (healthy)
```

### 5. Access Application
Open browser: **http://localhost:5173**

### 6. Stop Services
```bash
# Stop (preserves data)
docker compose down

# Stop and delete all data (including MongoDB)
docker compose down -v
```

---

## Detailed Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:8080 | REST API |
| **Backend Health** | http://localhost:8080/health | Health check |
| **ML Service** | http://localhost:8000 | ML predictions |
| **ML Health** | http://localhost:8000/health | Health check |
| **MongoDB** | mongodb://localhost:27017 | Database (direct access) |

---

## Local Development Setup (Without Docker)

### Backend (Spring Boot)

#### Prerequisites
- Java 17+
- MongoDB running locally on port 27017
- ML service running on port 8000 (or update config)

#### Steps
```bash
cd backend

# Make gradlew executable (Linux/Mac)
chmod +x gradlew

# Run with local MongoDB and ML service
./gradlew bootRun

# Or with custom config
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017 \
JWT_SECRET=dev-only-secret-dev-only-secret-32bytes! \
ML_URL=http://localhost:8000 \
./gradlew bootRun
```

#### Verify
```bash
curl http://localhost:8080/health
# {"status":"UP"}
```

### Frontend (Vite + React)

#### Prerequisites
- Node.js 18+
- Backend running on port 8080

#### Steps
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Runs on http://localhost:5173 with HMR
```

#### Build for Production
```bash
npm run build
# Output in dist/
```

### ML Service (FastAPI)

#### Prerequisites
- Python 3.11+
- pip

#### Steps
```bash
cd ml-service

# Create virtual environment
python -m venv .venv

# Activate
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train model (generates model.joblib)
python train.py

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Verify
```bash
curl http://localhost:8000/health
# {"status":"UP"}

curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"ratio":1.2,"tmax":32,"tmin":21,"peffDailyMm":1.5}'
```

---

## Environment Variables Reference

### Root `.env` (for Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `dev-only-secret-dev-only-secret-32bytes!` | JWT signing key (min 32 chars) |
| `CORS_ORIGIN` | `http://localhost:5173` | Frontend origin for CORS |
| `VITE_API_URL` | `http://localhost:8080` | Backend URL for frontend |
| `AUTH_RATE_LIMIT` | `10` | Auth requests per minute per IP |
| `ML_URL` | `http://ml-service:8000` | ML service URL (internal Docker) |
| `WEATHER_BASE_URL` | `https://api.open-meteo.com` | Weather API base URL |

### Backend `application.yml` (Spring Boot)

```yaml
spring:
  data:
    mongodb:
      uri: ${SPRING_DATA_MONGODB_URI:mongodb://localhost:27017}
      database: jalkrishi
  port: ${PORT:8080}

jalkrishi:
  jwt:
    secret: ${JWT_SECRET:dev-only-secret-dev-only-secret-32bytes!}
    expiryMinutes: 120
  suitability:
    excellent: 1.0
    good: 0.8
    risky: 0.6
  ratelimit:
    auth-per-minute: ${AUTH_RATE_LIMIT:10}
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
  ml:
    url: ${ML_URL:http://localhost:8000}
  weather:
    base-url: https://api.open-meteo.com
    connect-timeout: 5000
    read-timeout: 10000
```

### Frontend `.env` (Vite)

```env
VITE_API_URL=http://localhost:8080
```

### ML Service (No config file - uses env via Docker)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8000` | Server port |

---

## Database Setup

### Automatic (Docker)
- MongoDB starts with `mongo:7` image
- Database `jalkrishi` created automatically
- Collections created on first write
- Crops seeded on backend startup via `CropSeeder`

### Manual (Local MongoDB)
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or Docker only MongoDB
docker run -d -p 27017:27017 -v mongo_data:/data/db mongo:7

# Verify
mongosh --eval "db.adminCommand('ping')"
```

### Seed Data
Crops are automatically seeded on backend startup if collection is empty:
- Rice, Wheat, Cotton, Sugarcane, Maize, Soybean, Tomato, Onion

To re-seed:
```bash
# Drop crops collection
mongosh jalkrishi --eval "db.crops.drop()"

# Restart backend
```

---

## Running Tests

### All Tests (Root)
```bash
# From project root
npm test  # Runs all test suites via package.json scripts
```

### Backend Tests
```bash
cd backend
./gradlew test

# Expected: 66 tests passed
# Reports: build/reports/tests/test/index.html
```

### Frontend Tests
```bash
cd frontend
npm test

# Expected: 34 tests passed
# Run with UI: npm run test:ui
# CI mode: npm run test:run
```

### ML Service Tests
```bash
cd ml-service
source .venv/bin/activate  # or .venv\Scripts\activate
pytest -q

# Expected: 9 tests passed
```

---

## Common Setup Errors and Solutions

### Docker Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `port 5173 already in use` | Another service on 5173 | Stop other service or change port in `docker-compose.yml` |
| `port 8080 already in use` | Backend port conflict | Change host port mapping in `docker-compose.yml` |
| `mongo:27017 connection refused` | MongoDB not healthy | Wait for healthcheck; check `docker compose logs mongo` |
| `ml-service healthcheck failed` | Model not trained | Check `docker compose logs ml-service`; may need to run `train.py` |
| `backend healthcheck failed` | Backend startup error | Check `docker compose logs backend` |
| `Permission denied: gradlew` | Not executable | `chmod +x backend/gradlew` |

### Backend Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `Could not connect to MongoDB` | Wrong URI | Check `SPRING_DATA_MONGODB_URI` |
| `JWT_SECRET too short` | Secret < 32 chars | Use 32+ character secret |
| `CORS error in browser` | Origin mismatch | Set `CORS_ORIGIN` to exact frontend URL |
| `ML service connection refused` | ML not running | Start ML service or check `ML_URL` |
| `Rate limit exceeded` | Too many login attempts | Wait 1 minute or increase `AUTH_RATE_LIMIT` |

### Frontend Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `npm install fails` | Node version | Use Node 18+; delete `node_modules` and `package-lock.json` |
| `Vite dev server won't start` | Port in use | Kill process on 5173 or change port in `vite.config.js` |
| `API calls fail with 401` | Token expired | Log out and log in again |
| `Charts not rendering` | Chart.js version | Check `package.json` for compatible versions |
| `Tailwind styles not applied` | Build issue | Restart dev server; check `tailwind.config.js` content paths |

### ML Service Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `ModuleNotFoundError` | Dependencies not installed | `pip install -r requirements.txt` |
| `model.joblib not found` | Not trained | Run `python train.py` |
| `sklearn version mismatch` | Model trained with different version | Retrain with current environment |
| `Port 8000 in use` | Conflict | Change port in `docker-compose.yml` or `uvicorn` command |

---

## Production Deployment

### Build Production Images
```bash
# Build all production images
docker compose -f docker-compose.yml build

# Or individually
docker build -t jalkrishi-backend ./backend
docker build -t jalkrishi-frontend ./frontend
docker build -t jalkrishi-ml ./ml-service
```

### Production Environment Variables
```bash
# Required for production
JWT_SECRET=<generate-secure-64-char-random-string>
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
SPRING_DATA_MONGODB_URI=mongodb://mongo:27017  # Internal
ML_URL=http://ml-service:8000  # Internal
```

### Nginx Configuration (Frontend)
The frontend Dockerfile uses `nginx.conf` for production:
- Serves static files from `/usr/share/nginx/html`
- SPA routing fallback to `index.html`
- Gzip compression
- Cache headers for assets
- Proxy API calls (if needed)

### SSL/TLS
Terminate at load balancer (AWS ALB, Cloudflare, Nginx Proxy Manager):
```
Internet → Load Balancer (HTTPS) → Frontend (HTTP) → Backend (HTTP)
```

### Database Backup
```bash
# Backup
docker exec mongo mongodump --db jalkrishi --out /data/backup
docker cp mongo:/data/backup ./backup

# Restore
docker cp ./backup/jalkrishi mongo:/data/restore
docker exec mongo mongorestore --db jalkrishi /data/restore/jalkrishi
```

---

## Development Workflow

### Code Changes
```bash
# Backend: Hot reload via Spring Boot DevTools (if configured)
# Or restart: ./gradlew bootRun

# Frontend: Vite HMR automatic
# Just edit files in frontend/src/

# ML Service: Uvicorn --reload automatic
# Just edit files in ml-service/app/
```

### Adding Dependencies

**Backend** (`backend/build.gradle`):
```groovy
dependencies {
    implementation 'group:artifact:version'
}
./gradlew build
```

**Frontend** (`frontend/package.json`):
```bash
npm install package-name
npm install -D dev-package-name
```

**ML Service** (`ml-service/requirements.txt`):
```txt
package-name==version
```
```bash
pip install -r requirements.txt
```

---

## Verification Checklist

After setup, verify:

- [ ] `docker compose ps` shows all 4 services healthy
- [ ] http://localhost:5173 loads landing page
- [ ] http://localhost:8080/health returns `{"status":"UP"}`
- [ ] http://localhost:8000/health returns `{"status":"UP"}`
- [ ] Can register new user at `/register`
- [ ] Can login at `/login`
- [ ] Can create farm at `/farms`
- [ ] Can run assessment at `/assess`
- [ ] Can view result at `/assessments/:id`
- [ ] Can compare crops at `/compare`
- [ ] Can view alerts at `/alerts`
- [ ] Can view history at `/history`
- [ ] Theme toggle works (dark/light)
- [ ] All tests pass (`npm test` from root)