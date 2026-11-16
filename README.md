# Can I Grow This Crop?

A water-budget crop suitability tool that evaluates whether a given crop can be grown on a specific farm. Given a farm location, size, water resources, and a crop type, the application computes the water budget, comparing supply (effective rainfall, stored water, groundwater) against crop demand (evapotranspiration over a specified horizon), and returns a suitability assessment with confidence levels.

## How it works

The application computes a water budget using the Hargreaves-Samani method for reference evapotranspiration:

- **ET0** (reference evapotranspiration, mm/day): `ET0 = 0.0023 * (Tmean + 17.8) * sqrt(Tmax - Tmin) * Ra` where `Tmean = (Tmax + Tmin) / 2`
- **ETc** (crop evapotranspiration): `ETc(d) = Kc(stage of day d) * ET0`
- **S** (supply, litres): `S = (peffMm + deltaSmMm) * areaHa * 10000 + storedWaterLitres + groundwaterLitres`
- **D** (demand, litres): `D = sum over d=1..horizon of ETc(d) * areaHa * 10000`
- **B** (balance): `B = S - D`
- **R** (ratio): `R = S / D`

Suitability classes (thresholds from application.yml):

| Class           | Ratio R        | Stress       |
| --------------- | -------------- | ------------ |
| EXCELLENT       | R >= 1.0       | LOW          |
| GOOD            | 0.8 <= R < 1.0 | LOW_MODERATE |
| RISKY           | 0.6 <= R < 0.8 | MODERATE     |
| NOT_RECOMMENDED | R < 0.6        | HIGH         |

## Architecture

```
browser -> frontend (React/Vite) -> backend (Spring Boot) -> mongo
                                   -> ml-service (FastAPI)
                                   -> weather API (Open-Meteo)
```

- **frontend**: React application with Vite, handles user interface and API calls
- **backend**: Spring Boot 3 application with MongoDB, JWT authentication, and business logic
- **ml-service**: FastAPI service that provides ML-based suitability predictions
- **mongo**: MongoDB 7 database for persistent storage

## Run with Docker

```powershell
docker compose up -d --build
```

| Service    | Host Port        |
| ---------- | ---------------- |
| mongo      | 27017 (internal) |
| ml-service | 8000             |
| backend    | 8080             |
| frontend   | 5173             |

Open http://localhost:5173 in your browser.

To stop:

```powershell
docker compose down
```

To stop and delete all data:

```powershell
docker compose down -v
```

## Environment variables

| Name                            | Purpose                      | Default                                  |
| ------------------------------- | ---------------------------- | ---------------------------------------- |
| SPRING_DATA_MONGODB_URI         | MongoDB connection string    | mongodb://mongo:27017                    |
| JWT_SECRET                      | Secret key for JWT tokens    | dev-only-secret-dev-only-secret-32bytes! |
| CORS_ORIGIN                     | Allowed CORS origin          | http://localhost:5173                    |
| ML_URL                          | ML service URL               | http://ml-service:8000                   |
| AUTH_RATE_LIMIT                 | Auth requests per minute     | 10                                       |
| VITE_API_URL                    | Backend API URL for frontend | http://localhost:8080                    |
| PORT                            | Server port                  | 8080                                     |
| JWT_EXPIRY_MINUTES              | JWT token expiry             | 120                                      |
| JALKRISHI_SUITABILITY_EXCELLENT | Excellent threshold          | 1.0                                      |
| JALKRISHI_SUITABILITY_GOOD      | Good threshold               | 0.8                                      |
| JALKRISHI_SUITABILITY_RISKY     | Risky threshold              | 0.6                                      |

## Run the tests

| Module     | Tests passed |
| ---------- | ------------ |
| backend    | 66           |
| ml-service | 9            |
| frontend   | 34           |

Commands:

- Backend: `cd backend; .\gradlew.bat test`
- ML: `cd ml-service; .\.venv\Scripts\python.exe -m pytest -q`
- Frontend: `cd frontend; npm test`

## API

| Method | Path                     | Auth | Purpose                 |
| ------ | ------------------------ | ---- | ----------------------- |
| GET    | /health                  | No   | Health check            |
| POST   | /api/auth/register       | No   | Register new user       |
| POST   | /api/auth/login          | No   | Login and receive token |
| GET    | /api/auth/me             | Yes  | Get current user        |
| POST   | /api/farms               | Yes  | Create farm             |
| GET    | /api/farms               | Yes  | List user's farms       |
| GET    | /api/farms/{id}          | Yes  | Get farm by id          |
| PUT    | /api/farms/{id}          | Yes  | Update farm             |
| DELETE | /api/farms/{id}          | Yes  | Delete farm             |
| GET    | /api/crops               | Yes  | List all crops          |
| POST   | /api/assessments         | Yes  | Create assessment       |
| GET    | /api/assessments         | Yes  | List user's assessments |
| GET    | /api/assessments/{id}    | Yes  | Get assessment by id    |
| POST   | /api/assessments/compare | Yes  | Compare multiple crops  |
| GET    | /api/alerts              | Yes  | Get user's alerts       |
| GET    | /api/reports/{id}        | Yes  | Get detailed report     |
| POST   | /predict                 | No   | ML prediction           |

## Smoke test and measurements

Run the smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File docs\smoke.ps1
```

Run measurements:

```powershell
powershell -ExecutionPolicy Bypass -File docs\measure.ps1
```

See measured results at [docs/measured-live.md](docs/measured-live.md).

## Limitations

- Weather is a 16-day forecast average applied to the horizon and Ra is fixed at 15.0
- The ML model is trained on synthetic labels derived from the rule model, so its accuracy is not a real-world estimate
- Crop coefficients are plausible FAO-56 style values, not locally calibrated
- The app has no password reset or email verification
