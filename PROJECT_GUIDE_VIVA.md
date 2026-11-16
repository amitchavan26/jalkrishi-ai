# JALKRISHI - "Can I Grow This Crop?" 
## Project Guide for Viva Voce

---

## 1. PROJECT OVERVIEW

### 1.1 Project Title
**JALKRISHI: A Water-Budget Crop Suitability Tool**

### 1.2 Problem Statement
Farmers often lack scientific tools to determine whether a specific crop can be sustainably grown on their land given available water resources. This project provides a decision-support system that computes a water budget comparing water supply against crop water demand, returning a suitability assessment with confidence levels.

### 1.3 Objective
Build a full-stack web application that:
- Accepts farm location, size, water resources, and crop type
- Computes water budget using the Hargreaves-Samani method for reference evapotranspiration (ET₀)
- Compares supply (effective rainfall, stored water, groundwater) against demand (crop evapotranspiration over specified horizon)
- Returns suitability assessment: EXCELLENT, GOOD, RISKY, NOT_RECOMMENDED
- Provides ML-based secondary prediction as a cross-check
- Offers actionable advice based on results

### 1.4 Key Innovation
- **Physics-based core**: Uses Hargreaves-Samani equation for ET₀ calculation (temperature-based, no radiation data needed)
- **Dual prediction**: Rule-based water budget + ML model trained on synthetic labels from the rule model
- **Confidence-aware**: Distinguishes between live weather data and fallback estimates
- **Multi-horizon analysis**: Shows water balance for 30, 60, and 90-day periods simultaneously

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│  Frontend    │────▶│  Backend    │
│  (React)    │     │  (Vite)      │     │ (Spring     │
│  Port 5173  │     │              │     │  Boot 3)    │
└─────────────┘     └──────────────┘     │  Port 8080  │
                                          └──────┬──────┘
                                                 │
                    ┌──────────────┐             │
                    │   ML Service │◀────────────┤
                    │  (FastAPI)   │             │
                    │  Port 8000   │             │
                    └──────────────┘             │
                                                 ▼
                                          ┌─────────────┐
                                          │   MongoDB   │
                                          │   Port 27017│
                                          └─────────────┘
                                                 │
                                                 ▼
                                          ┌─────────────┐
                                          │  Weather    │
                                          │  API        │
                                          │ (Open-Meteo)│
                                          └─────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React + Vite | React 18, Vite 5 |
| **Styling** | Tailwind CSS | v3 |
| **Charts** | Chart.js + react-chartjs-2 | v4 |
| **Routing** | React Router | v6 |
| **Backend** | Spring Boot | 3.x |
| **Database** | MongoDB | 7.x |
| **Auth** | JWT (HS256) | - |
| **ML Service** | FastAPI + scikit-learn | Python 3.11 |
| **Weather API** | Open-Meteo | Free tier |
| **Containerization** | Docker + Docker Compose | - |
| **Testing** | JUnit, pytest, Vitest | - |

### 2.3 Service Communication
- **Frontend → Backend**: REST API over HTTP (JWT Bearer token auth)
- **Backend → ML Service**: Internal HTTP call to `/predict` endpoint
- **Backend → Weather API**: Open-Meteo forecast API (16-day)
- **Backend → MongoDB**: Spring Data MongoDB reactive/blocking

---

## 3. CORE ALGORITHM - WATER BUDGET ENGINE

### 3.1 Mathematical Formulation

#### Reference Evapotranspiration (ET₀) - Hargreaves-Samani Method
```
ET₀ = 0.0023 × (T_mean + 17.8) × √(T_max - T_min) × R_a

Where:
- T_mean = (T_max + T_min) / 2  [°C]
- T_max = Daily maximum temperature [°C]
- T_min = Daily minimum temperature [°C]
- R_a = Extraterrestrial radiation [MJ/m²/day] (fixed at 15.0)
- ET₀ = Reference evapotranspiration [mm/day]
```

#### Crop Evapotranspiration (ETc)
```
ETc(d) = Kc(stage of day d) × ET₀

Where:
- Kc = Crop coefficient for the growth stage on day d
- Stage progression: Initial → Development → Mid-season → Late-season
```

#### Water Supply (S) - Litres
```
S = (P_eff_daily_mm + ΔS_m_mm) × Area_ha × 10,000 + Stored_Water_L + Groundwater_L

Where:
- P_eff_daily_mm = Effective rainfall per day = 0.8 × Precipitation_avg [mm/day]
- ΔS_m_mm = Soil moisture change (currently 0, not modeled)
- Area_ha = Farm area in hectares
- 10,000 = Conversion factor (1 ha = 10,000 m²; 1 mm = 1 L/m²)
- Stored_Water_L = Tank/reservoir storage [L]
- Groundwater_L = Available groundwater [L]
```

#### Water Demand (D) - Litres
```
D = Σ[d=1 to horizon] ETc(d) × Area_ha × 10,000
```

#### Water Balance & Ratio
```
Balance (B) = S - D
Ratio (R) = S / D
```

### 3.2 Suitability Classification Thresholds

| Class | Ratio (R) | Stress Level | Color |
|-------|-----------|--------------|-------|
| **EXCELLENT** | R ≥ 1.0 | LOW | Green |
| **GOOD** | 0.8 ≤ R < 1.0 | LOW_MODERATE | Light Green |
| **RISKY** | 0.6 ≤ R < 0.8 | MODERATE | Yellow/Orange |
| **NOT_RECOMMENDED** | R < 0.6 | HIGH | Red |

*Thresholds configurable via `application.yml` environment variables*

### 3.3 Confidence Levels
- **HIGH**: Live weather data from Open-Meteo API (16-day forecast average)
- **LOW**: Fallback values (T_max=32°C, T_min=21°C, R_a=15.0, P_eff=1.5 mm/day)

### 3.4 Crop Growth Stages (FAO-56 Style)
Each crop defines stages with:
- **Name**: e.g., "Initial", "Development", "Mid-season", "Late-season"
- **Days**: Duration in days
- **Kc**: Crop coefficient for that stage

Example (Wheat):
| Stage | Days | Kc |
|-------|------|-----|
| Initial | 20 | 0.4 |
| Development | 30 | 0.8 |
| Mid-season | 40 | 1.15 |
| Late-season | 20 | 0.7 |

---

## 4. BACKEND DETAILS (Spring Boot)

### 4.1 Package Structure
```
com.jalkrishi
├── alert/           # Alert/notification system
├── assessment/      # Core assessment logic
│   ├── Assessment.java           # Entity
│   ├── AssessmentController.java # REST endpoints
│   ├── AssessmentService.java    # Business logic
│   ├── AssessmentRepository.java # MongoDB repository
│   ├── MlClient.java             # ML service client
│   ├── WeatherSnapshot.java      # Weather data DTO
│   └── Confidence.java           # HIGH/LOW enum
├── auth/            # JWT authentication
├── common/          # Shared utilities
├── config/          # Spring configuration
├── crop/            # Crop management
├── data/            # Weather data service
├── engine/          # Water budget computation
│   ├── WaterBudgetEngine.java    # Core computation
│   ├── WaterBudgetInput.java     # Input DTO
│   ├── WaterBudgetResult.java    # Output DTO
│   ├── Et0Calculator.java        # Hargreaves-Samani
│   ├── Suitability.java          # Enum
│   ├── Stress.java               # Enum
│   ├── SuitabilityThresholds.java# Configurable thresholds
│   └── StageInput.java           # Crop stage DTO
├── farm/            # Farm management
├── health/          # Health checks
├── report/          # Detailed reports
└── user/            # User management
```

### 4.2 Key API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/farms` | Yes | Create farm |
| GET | `/api/farms` | Yes | List user farms |
| GET | `/api/farms/{id}` | Yes | Get farm |
| PUT | `/api/farms/{id}` | Yes | Update farm |
| DELETE | `/api/farms/{id}` | Yes | Delete farm |
| GET | `/api/crops` | Yes | List all crops |
| POST | `/api/assessments` | Yes | Create assessment |
| GET | `/api/assessments` | Yes | List assessments |
| GET | `/api/assessments/{id}` | Yes | Get assessment |
| POST | `/api/assessments/compare` | Yes | Compare crops |
| GET | `/api/alerts` | Yes | User alerts |
| GET | `/api/reports/{id}` | Yes | Detailed report |

### 4.3 Assessment Flow
```
1. User submits: farmId, cropId, horizonDays (30/60/90)
2. Backend validates farm ownership & crop existence
3. Fetch weather: Open-Meteo API (16-day forecast) → avg Tmax, Tmin, Precip
4. Build WaterBudgetInput:
   - Weather: tmax, tmin, ra=15.0, peffDailyMm=0.8×precip_avg
   - Farm: areaHa, storedWaterL, groundwaterL (including per-day × horizon)
   - Crop: stages → StageInput(name, days, kc)
   - Horizon: horizonDays
5. WaterBudgetEngine.compute(input):
   - Calculate ET₀ via Hargreaves-Samani
   - Calculate demand: Σ Kc(d) × ET₀ × area × 10000
   - Calculate supply: (peff × horizon × area × 10000) + stored + groundwater
   - Compute balance, ratio, classify suitability, determine stress
6. Call ML Service (/predict) with ratio, tmax, tmin, peffDailyMm
7. Generate advice via RecommendationService
8. Save Assessment to MongoDB
9. Return AssessmentResponse
```

### 4.4 Data Models

#### Farm
```java
- id: String
- ownerId: String
- name: String
- areaHa: double
- lat: double
- lon: double
- soilType: String (SANDY, LOAMY, CLAY, SILTY)
- storedWaterLitres: double
- groundwaterLitres: double
- storedWaterLitresPerDay: Double (optional)
- groundwaterLitresPerDay: Double (optional)
```

#### Crop
```java
- id: String
- name: String
- stages: List<CropStage>
  - name: String
  - days: int
  - kc: double
```

#### Assessment
```java
- id: String
- userId: String
- farmId: String
- cropId: String
- horizonDays: int
- supplyLitres: double
- demandLitres: double
- balanceLitres: double
- ratio: double
- suitability: Suitability (EXCELLENT/GOOD/RISKY/NOT_RECOMMENDED)
- stress: Stress (LOW/LOW_MODERATE/MODERATE/HIGH)
- confidence: Confidence (HIGH/LOW)
- advice: String
- mlUsed: boolean
- mlSuitability: String
- weatherSnapshot: WeatherSnapshot
- createdAt: Instant
```

---

## 5. ML SERVICE DETAILS (FastAPI)

### 5.1 Purpose
Provides a secondary ML-based suitability prediction as a cross-check against the rule-based engine. The model is trained on synthetic labels generated from the rule engine itself.

### 5.2 Model Details
- **Algorithm**: Random Forest Classifier (scikit-learn)
- **Features**: ratio, tmax, tmin, peffDailyMm (4 features)
- **Target**: Suitability class (4 classes)
- **Training Data**: Synthetic - generated by running rule engine on random inputs
- **Model File**: `model.joblib` (pre-trained, committed to repo)

### 5.3 API Endpoint
```
POST /predict
Content-Type: application/json

Request:
{
  "ratio": 0.85,
  "tmax": 32.5,
  "tmin": 21.0,
  "peffDailyMm": 1.2
}

Response (model available):
{
  "suitability": "GOOD",
  "probability": 0.92,
  "source": "model"
}

Response (model unavailable - fallback to rules):
{
  "suitability": "GOOD",
  "probability": 1.0,
  "source": "rules"
}
```

### 5.4 Important Limitation
> **The ML model is trained on synthetic labels derived from the rule model, so its accuracy is not a real-world estimate.** It serves only as a consistency check, not an independent validation.

---

## 6. FRONTEND DETAILS (React + Vite)

### 6.1 Page Structure
```
src/pages/
├── Landing.jsx           # Public landing page
├── Login.jsx             # Authentication
├── Register.jsx          # User registration
├── Dashboard.jsx         # User dashboard (bento grid)
├── Farms.jsx             # Farm management (CRUD)
├── Assess.jsx            # 3-step assessment wizard
├── Result.jsx            # Detailed assessment result
├── Compare.jsx           # Multi-crop comparison
├── History.jsx           # Assessment history table
├── Alerts.jsx            # Alert preferences & list
└── components/           # Reusable UI components
```

### 6.2 Key User Flows

#### Assessment Wizard (Assess.jsx) - 3 Steps
1. **Step 1 - Farm Selection**: Dropdown of user's farms, shows summary (area, soil, water chips)
2. **Step 2 - Crop & Period**: Crop dropdown (shows stages & total days), horizon selector (30/60/90)
3. **Step 3 - Review & Run**: Summary of all selections, "Run assessment" button

#### Result Page (Result.jsx)
- **Hero Card**: Ratio gauge (SVG), suitability badge, stress, confidence
- **Water Balance Card**: Supply, Demand, Balance (color-coded)
- **Weather Card**: Tmax, Tmin, Rain/day, Source (Live/Fallback)
- **Bar Chart**: Supply vs Demand for 30/60/90 days (Chart.js)
- **Table**: Detailed breakdown by period with suitability badges
- **Advice Callout**: Contextual recommendation
- **Actions**: Download CSV, Print/PDF, Run another, View history

### 6.3 State Management
- **Authentication**: JWT in localStorage, attached via axios interceptor
- **API Layer**: Centralized `api.js` with base URL from `VITE_API_URL`
- **Theme**: Context-based (light/dark) with Tailwind CSS variables
- **Forms**: Controlled components with validation

### 6.4 Testing
- **Unit/Integration**: Vitest + React Testing Library (34 tests)
- **Coverage**: Components, hooks, utilities, API layer
- **Run**: `cd frontend && npm test`

---

## 7. DATA FLOW EXAMPLE

### 7.1 Sample Assessment Request
```
Farm: "North Field" (5 ha, lat=28.6, lon=77.2)
- Stored water: 50,000 L
- Groundwater: 100,000 L/day
- Soil: LOAMY

Crop: "Wheat" (4 stages, 110 days total)
- Initial: 20 days, Kc=0.4
- Development: 30 days, Kc=0.8
- Mid-season: 40 days, Kc=1.15
- Late-season: 20 days, Kc=0.7

Horizon: 60 days
```

### 7.2 Weather Data (Live from Open-Meteo)
```
T_max (16-day avg): 31.2°C
T_min (16-day avg): 19.8°C
Precipitation (16-day avg): 2.1 mm/day
P_eff = 0.8 × 2.1 = 1.68 mm/day
R_a = 15.0 (fixed)
```

### 7.3 Computation
```
ET₀ = 0.0023 × (25.5 + 17.8) × √(31.2 - 19.8) × 15.0
    = 0.0023 × 43.3 × √11.4 × 15.0
    = 0.0023 × 43.3 × 3.376 × 15.0
    = 5.03 mm/day

Demand (60 days):
Days 1-20: Kc=0.4  → 20 × 0.4 × 5.03 = 40.24 Kc-days
Days 21-50: Kc=0.8 → 30 × 0.8 × 5.03 = 120.72 Kc-days
Days 51-60: Kc=1.15 → 10 × 1.15 × 5.03 = 57.85 Kc-days
Total Kc-days = 218.81

Demand = 218.81 × 5.03 × 5 × 10000 = 55,030,715 L

Supply:
Rainfall = 1.68 × 60 × 5 × 10000 = 5,040,000 L
Stored = 50,000 L
Groundwater = 100,000 × 60 = 6,000,000 L
Total Supply = 11,090,000 L

Ratio = 11,090,000 / 55,030,715 = 0.20
Balance = -43,940,715 L
Suitability = NOT_RECOMMENDED (R < 0.6)
Stress = HIGH
```

---

## 8. DEPLOYMENT & OPERATIONS

### 8.1 Docker Compose Services
```yaml
services:
  mongo:        # MongoDB 7, port 27017 (internal)
  ml-service:   # FastAPI, port 8000
  backend:      # Spring Boot, port 8080
  frontend:     # Nginx + React, port 5173
```

### 8.2 Environment Variables (Key)
| Variable | Purpose | Default |
|----------|---------|---------|
| `SPRING_DATA_MONGODB_URI` | MongoDB connection | `mongodb://mongo:27017` |
| `JWT_SECRET` | JWT signing key | dev secret (32+ bytes) |
| `CORS_ORIGIN` | Frontend origin | `http://localhost:5173` |
| `ML_URL` | ML service URL | `http://ml-service:8000` |
| `JALKRISHI_SUITABILITY_EXCELLENT` | Threshold | 1.0 |
| `JALKRISHI_SUITABILITY_GOOD` | Threshold | 0.8 |
| `JALKRISHI_SUITABILITY_RISKY` | Threshold | 0.6 |

### 8.3 Running Locally
```bash
# Start all services
docker compose up -d --build

# Access
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# ML Service: http://localhost:8000
# MongoDB: localhost:27017

# Stop
docker compose down

# Stop + delete data
docker compose down -v
```

### 8.4 Testing Commands
```bash
# Backend tests (66 tests)
cd backend && ./gradlew.bat test

# ML tests (9 tests)
cd ml-service && .\.venv\Scripts\python.exe -m pytest -q

# Frontend tests (34 tests)
cd frontend && npm test
```

---

## 9. LIMITATIONS & FUTURE WORK

### 9.1 Known Limitations
1. **Weather**: 16-day forecast average applied to entire horizon; R_a fixed at 15.0
2. **ML Model**: Trained on synthetic labels from rule engine - not real-world validated
3. **Crop Coefficients**: Plausible FAO-56 style values, not locally calibrated
4. **Soil Moisture**: ΔS_m not modeled (assumed zero)
5. **Auth**: No password reset, no email verification
6. **Groundwater**: Simple per-day rate, no aquifer dynamics
7. **Single Location**: Point coordinates, no spatial variability

### 9.2 Potential Enhancements
- [ ] Integrate NASA POWER or IMD for historical weather normals
- [ ] Add soil water balance model (FAO-56 dual crop coefficient)
- [ ] Calibrate Kc values for local agro-climatic zones
- [ ] Add password reset via email
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Offline-first PWA for field use
- [ ] Satellite-derived ET (OpenET, MODIS) for validation
- [ ] Farmer feedback loop to improve ML labels

---

## 10. VIVA PREPARATION - KEY QUESTIONS & ANSWERS

### Q1: Why Hargreaves-Samani over Penman-Monteith?
**A**: Hargreaves-Samani requires only temperature data (Tmax, Tmin), which is widely available from weather APIs. Penman-Monteith needs radiation, humidity, wind speed - not all available from free APIs like Open-Meteo. It's a reasonable trade-off for a decision-support tool.

### Q2: How is effective rainfall calculated?
**A**: `P_eff = 0.8 × Precipitation_avg`. The 0.8 factor accounts for runoff, deep percolation, and evaporation losses - a standard approximation when detailed soil data isn't available.

### Q3: What does the ML service actually add if it's trained on rule outputs?
**A**: It serves as a consistency check. If the rule engine and ML disagree significantly, it flags potential edge cases. In production, the ML would be retrained on real farmer outcomes.

### Q4: How do you handle the "horizon longer than crop cycle" case?
**A**: The engine continues using the last stage's Kc for days beyond the defined crop stages. This is handled in `WaterBudgetEngine.calculateDemand()` - after the last stage, `currentStage` remains the final stage.

### Q5: Why is R_a (extraterrestrial radiation) fixed at 15.0?
**A**: R_a varies by latitude and day of year. For simplicity and because Open-Meteo doesn't provide it, we use a mid-latitude annual average (~15 MJ/m²/day). This introduces error but keeps the model usable without astronomical calculations.

### Q6: How is groundwater modeled?
**A**: As a simple daily rate (`groundwaterLitresPerDay`) multiplied by horizon days, added to static `groundwaterLitres`. No aquifer drawdown, recharge, or sustainability checks - a deliberate simplification.

### Q7: What happens if the weather API fails?
**A**: The `DataService.getWeather()` catches all exceptions and returns a `fallback()` WeatherData with typical values (Tmax=32, Tmin=21, Peff=1.5) and `WeatherSource.FALLBACK`, which sets `Confidence.LOW` on the assessment.

### Q8: How is the water balance chart generated for 30/60/90 days?
**A**: The `/api/reports/{id}` endpoint re-runs the water budget engine for all three horizons (30, 60, 90) using the same farm/crop/weather, returning a `breakdown` array. The frontend renders this as a grouped bar chart.

### Q9: Explain the JWT authentication flow.
**A**: 
1. User registers/logs in → Backend returns JWT (HS256, 120 min expiry)
2. Frontend stores JWT in localStorage
3. Axios interceptor attaches `Authorization: Bearer <token>` to all API calls
4. Backend `JwtFilter` validates token, extracts userId, sets in request context
5. Controllers use `@AuthenticationPrincipal` or service-layer userId

### Q10: How are crops seeded in the database?
**A**: `CropSeeder` (implements `CommandLineRunner`) runs on startup, checks if crops collection is empty, and inserts predefined crops (Wheat, Rice, Maize, Cotton, Sugarcane, etc.) with FAO-56 style stages.

---

## 11. PROJECT METRICS

| Metric | Value |
|--------|-------|
| Backend Tests | 66 passed |
| ML Service Tests | 9 passed |
| Frontend Tests | 34 passed |
| Total Test Coverage | ~85% (estimated) |
| Docker Image Sizes | Backend ~200MB, ML ~500MB, Frontend ~50MB |
| Startup Time (Docker) | ~60-90 seconds |
| API Response Time (assessment) | ~500-1500ms (weather API dependent) |

---

## 12. TEAM & CONTRIBUTIONS

*[Add your team details here]*

---

## 13. REFERENCES

1. **FAO Irrigation and Drainage Paper 56** - Crop Evapotranspiration (Allen et al., 1998)
2. **Hargreaves & Samani (1985)** - Reference crop evapotranspiration from temperature
3. **Open-Meteo API Documentation** - https://open-meteo.com/
4. **Spring Boot Reference Documentation** - https://spring.io/projects/spring-boot
5. **FastAPI Documentation** - https://fastapi.tiangolo.com/
6. **React Documentation** - https://react.dev/

---

*Document prepared for Viva Voce Examination*
*Project: JALKRISHI - Water Budget Crop Suitability Tool*