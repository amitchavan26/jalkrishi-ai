# Project Structure

## Complete Folder and File Structure

```
jal-krishi-sample/
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Multi-container orchestration
├── package.json                    # Root package.json (for concurrent commands)
├── package-lock.json               # Root lock file
├── README.md                       # Project overview and quick start
├── DESIGN_SYSTEM.md                # Design system documentation
├── PROJECT_GUIDE_VIVA.md           # Viva/project guide
├── DOCUMENTATION/                  # This documentation folder
│   ├── 01_PROJECT_OVERVIEW.md
│   ├── 02_PROJECT_STRUCTURE.md
│   ├── 03_SYSTEM_ARCHITECTURE.md
│   ├── 04_APPLICATION_FLOW.md
│   ├── 05_DATABASE_DOCUMENTATION.md
│   ├── 06_API_DOCUMENTATION.md
│   ├── 07_BACKEND_DEEP_DIVE.md
│   ├── 08_FRONTEND_DEEP_DIVE.md
│   ├── 09_INTEGRATIONS_AND_CONNECTIONS.md
│   ├── 10_SETUP_AND_INSTALLATION.md
│   ├── 11_TESTING_AND_DEBUGGING.md
│   ├── 12_SECURITY_AND_CONFIGURATION.md
│   ├── 13_TEAM_DEVELOPER_GUIDE.md
│   ├── 14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md
│   ├── 15_GLOSSARY.md
│   └── README.md
├── backend/                        # Spring Boot backend
│   ├── .dockerignore
│   ├── .gitattributes
│   ├── .gitignore
│   ├── build.gradle                # Gradle build configuration
│   ├── Dockerfile                  # Backend container definition
│   ├── gradle/                     # Gradle wrapper
│   ├── gradlew                     # Gradle wrapper (Linux/Mac)
│   ├── gradlew.bat                 # Gradle wrapper (Windows)
│   ├── settings.gradle             # Gradle settings
│   └── src/
│       ├── main/
│       │   ├── java/
│       │   │   └── com/jalkrishi/
│       │   │       ├── BackendApplication.java      # Spring Boot entry point
│       │   │       ├── alert/                       # Alert module
│       │   │       │   ├── AlertController.java
│       │   │       │   ├── AlertResponse.java
│       │   │       │   └── RecommendationService.java
│       │   │       ├── assessment/                  # Assessment module
│       │   │       │   ├── Assessment.java
│       │   │       │   ├── AssessmentController.java
│       │   │       │   ├── AssessmentRepository.java
│       │   │       │   ├── AssessmentRequest.java
│       │   │       │   ├── AssessmentResponse.java
│       │   │       │   ├── AssessmentService.java
│       │   │       │   ├── CompareRequest.java
│       │   │       │   ├── Confidence.java
│       │   │       │   ├── MlClient.java
│       │   │       │   └── WeatherSnapshot.java
│       │   │       ├── auth/                        # Authentication module
│       │   │       │   ├── AuthController.java
│       │   │       │   ├── JwtAuthFilter.java
│       │   │       │   ├── JwtService.java
│       │   │       │   ├── LoginRequest.java
│       │   │       │   └── RegisterRequest.java
│       │   │       ├── backend/                     # Package marker
│       │   │       ├── common/                      # Shared utilities
│       │   │       │   └── GlobalExceptionHandler.java
│       │   │       ├── config/                      # Configuration classes
│       │   │       │   ├── CorsConfig.java
│       │   │       │   ├── EngineConfig.java
│       │   │       │   ├── RateLimitFilter.java
│       │   │       │   ├── SecurityConfig.java
│       │   │       │   └── WebClientConfig.java
│       │   │       ├── crop/                        # Crop module
│       │   │       │   ├── Crop.java
│       │   │       │   ├── CropController.java
│       │   │       │   ├── CropRepository.java
│       │   │       │   └── CropSeeder.java
│       │   │       ├── data/                        # Data service module
│       │   │       │   ├── DataService.java
│       │   │       │   ├── WeatherData.java
│       │   │       │   └── WeatherSource.java
│       │   │       ├── engine/                      # Core computation engine
│       │   │       │   ├── Et0Calculator.java
│       │   │       │   ├── StageInput.java
│       │   │       │   ├── Stress.java
│       │   │       │   ├── Suitability.java
│       │   │       │   ├── SuitabilityThresholds.java
│       │   │       │   ├── WaterBudgetEngine.java
│       │   │       │   ├── WaterBudgetInput.java
│       │   │       │   └── WaterBudgetResult.java
│       │   │       ├── farm/                        # Farm module
│       │   │       │   ├── Farm.java
│       │   │       │   ├── FarmController.java
│       │   │       │   ├── FarmRepository.java
│       │   │       │   └── FarmRequest.java
│       │   │       ├── health/                      # Health check
│       │   │       │   └── HealthController.java
│       │   │       ├── report/                      # Report module
│       │   │       │   ├── BreakdownRow.java
│       │   │       │   ├── ReportController.java
│       │   │       │   └── ReportResponse.java
│       │   │       └── user/                        # User module
│       │   │           ├── User.java
│       │   │           └── UserRepository.java
│       │   └── resources/
│       │       ├── application.yml                 # Main configuration
│       │       ├── static/                         # Static resources
│       │       └── templates/                      # Template files
│       └── test/
│           └── java/
│               └── com/jalkrishi/
│                   ├── BackendApplicationTests.java
│                   ├── ErrorHandlingTest.java
│                   ├── RateLimitTest.java
│                   ├── TestAuth.java
│                   ├── alert/
│                   │   ├── AlertControllerTest.java
│                   │   └── RecommendationServiceTest.java
│                   ├── assessment/
│                   │   ├── AssessmentCompareReportTest.java
│                   │   ├── AssessmentControllerTest.java
│                   │   ├── AssessmentMlIntegrationTest.java
│                   │   └── MlClientTest.java
│                   ├── auth/
│                   │   ├── AuthControllerTest.java
│                   │   └── JwtServiceTest.java
│                   ├── config/
│                   │   └── RateLimitCleanupTest.java
│                   ├── crop/
│                   │   └── CropControllerTest.java
│                   ├── data/
│                   │   └── DataServiceTest.java
│                   ├── engine/
│                   │   ├── Et0CalculatorTest.java
│                   │   └── WaterBudgetEngineTest.java
│                   ├── farm/
│                   │   ├── FarmControllerTest.java
│                   │   └── FarmLocationAndRatesTest.java
│                   └── report/
│                       └── ReportOwnerScopeTest.java
├── frontend/                       # React frontend
│   ├── .dockerignore
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── nginx.conf                  # Nginx configuration for production
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── README.md
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   ├── manifest.webmanifest
│   │   └── sw.js                   # Service worker
│   └── src/
│       ├── main.jsx                # Application entry point
│       ├── App.jsx                 # Root component with routing
│       ├── index.css               # Global styles + Tailwind imports
│       ├── api.js                  # Axios instance, token management
│       ├── alertPrefs.js           # Alert preferences (localStorage)
│       ├── chartTheme.js           # Chart.js theme colors
│       ├── farmInfo.js             # Farm display helpers
│       ├── geocode.js              # Nominatim geocoding
│       ├── labels.js               # Suitability/stress labels and colors
│       ├── reportCsv.js            # CSV export for reports
│       ├── setupTests.js           # Vitest setup
│       ├── utils.js                # Utility functions
│       ├── waterMath.js            # Water calculation helpers
│       ├── theme/
│       │   ├── ThemeProvider.jsx   # Theme context provider
│       │   ├── ThemeProvider.test.jsx
│       │   └── ThemeToggle.jsx     # Theme toggle button
│       ├── pages/
│       │   ├── Landing.jsx         # Public landing page
│       │   ├── Login.jsx           # Login page
│       │   ├── Register.jsx        # Registration page
│       │   ├── Dashboard.jsx       # User dashboard
│       │   ├── Farms.jsx           # Farm management
│       │   ├── Assess.jsx          # New assessment wizard
│       │   ├── Result.jsx          # Assessment result with charts
│       │   ├── Compare.jsx         # Crop comparison
│       │   ├── Alerts.jsx          # Alerts management
│       │   └── History.jsx         # Assessment history
│       └── components/
│           ├── AppShell.jsx        # Authenticated layout shell
│           ├── FarmMap.jsx         # Interactive map (Leaflet)
│           ├── Layout.jsx          # Page layout wrapper
│           ├── ProtectedRoute.jsx  # Auth guard component
│           ├── RatioGauge.jsx      # SVG ratio gauge
│           ├── RootSwitch.jsx      # Public/auth route switch
│           └── ui/                 # Primitive UI components
│               ├── index.js        # Barrel export
│               ├── Badge.jsx
│               ├── Button.jsx
│               ├── Card.jsx
│               ├── EmptyState.jsx
│               ├── Input.jsx
│               ├── ProgressRing.jsx
│               ├── Skeleton.jsx
│               ├── StatCard.jsx
│               └── Toast.jsx
├── ml-service/                     # FastAPI ML service
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── requirements.txt            # Python dependencies
│   ├── metrics.json                # Model metrics
│   ├── model.joblib                # Trained model (generated)
│   ├── train.py                    # Model training script
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py                 # FastAPI application
│   └── tests/
│       ├── test_api.py
│       └── test_train.py
└── docs/                           # Additional documentation
    ├── AUDIT-agent-draft-UNVERIFIED.md
    ├── CONTEXT.md
    ├── DEPLOY.md
    ├── DESIGN_BRIEF.md
    ├── measure.ps1
    ├── measured-fallback.md
    ├── measured-live.md
    ├── PROGRESS.md
    └── smoke.ps1
```

## Purpose of Important Folders and Files

### Root Level
| File/Folder | Purpose |
|-------------|---------|
| `docker-compose.yml` | Orchestrates 4 services: mongo, ml-service, backend, frontend |
| `.env.example` | Template for environment variables |
| `package.json` | Root scripts for running all tests concurrently |
| `README.md` | Project overview, architecture, run instructions, API reference |

### Backend (`backend/`)
| File/Folder | Purpose |
|-------------|---------|
| `build.gradle` | Dependencies: Spring Boot, MongoDB, Security, JWT, WebFlux, Validation, Lombok |
| `src/main/java/com/jalkrishi/BackendApplication.java` | Spring Boot entry point |
| `src/main/resources/application.yml` | Configuration: MongoDB, JWT, CORS, ML URL, weather API, rate limits, suitability thresholds |
| `src/main/java/com/jalkrishi/config/` | All configuration classes (Security, CORS, WebClient, Rate Limiting, Engine) |
| `src/main/java/com/jalkrishi/auth/` | JWT authentication (filter, service, controller) |
| `src/main/java/com/jalkrishi/user/` | User entity and repository |
| `src/main/java/com/jalkrishi/farm/` | Farm entity, repository, controller, request DTO |
| `src/main/java/com/jalkrishi/crop/` | Crop entity, repository, controller, seeder |
| `src/main/java/com/jalkrishi/engine/` | Core water budget computation (ET0, supply, demand, classification) |
| `src/main/java/com/jalkrishi/data/` | Weather data fetching from Open-Meteo |
| `src/main/java/com/jalkrishi/assessment/` | Assessment orchestration, ML client, persistence |
| `src/main/java/com/jalkrishi/alert/` | Alerts for high-stress assessments |
| `src/main/java/com/jalkrishi/report/` | Detailed multi-horizon reports |
| `src/main/java/com/jalkrishi/common/` | Global exception handler |
| `src/test/` | 66 unit/integration tests |

### Frontend (`frontend/`)
| File/Folder | Purpose |
|-------------|---------|
| `package.json` | Dependencies: React, Vite, React Router, Chart.js, Axios, Tailwind, Lucide, Vitest |
| `vite.config.js` | Vite configuration (plugins, proxy, build) |
| `tailwind.config.js` | Tailwind theme extension (colors, fonts, animations) |
| `nginx.conf` | Production nginx config (SPA routing, gzip, caching) |
| `src/main.jsx` | App entry: providers (Theme, Toast), router, service worker registration |
| `src/App.jsx` | Route definitions (public, protected, root switch) |
| `src/api.js` | Axios instance with auth interceptors, token management |
| `src/theme/ThemeProvider.jsx` | Dark/light theme context with localStorage persistence |
| `src/components/ProtectedRoute.jsx` | Redirects to login if no token |
| `src/components/RootSwitch.jsx` | Redirects to dashboard if authenticated, else landing |
| `src/pages/` | 10 page components with tests |
| `src/components/ui/` | 9 primitive reusable components (Button, Card, Badge, etc.) |

### ML Service (`ml-service/`)
| File/Folder | Purpose |
|-------------|---------|
| `requirements.txt` | Python deps: fastapi, uvicorn, scikit-learn, pandas, joblib, pytest |
| `app/main.py` | FastAPI app with /health and /predict endpoints, model loading, rule fallback |
| `train.py` | Trains RandomForestClassifier on synthetic data, saves model.joblib |
| `model.joblib` | Serialized model (generated by train.py) |
| `metrics.json` | Model performance metrics |
| `tests/` | 9 tests for API and training |

## Frontend and Backend Organization

### Backend Layered Architecture
```
Controller (REST endpoints)
    │
    ▼
Service (Business logic, orchestration)
    │
    ├──▶ Repository (Data access - MongoDB)
    ├──▶ Engine (Pure computation - no external deps)
    ├──▶ DataService (External API - Open-Meteo)
    ├──▶ MlClient (External API - ML Service)
    └──▶ RecommendationService (Advice generation)
```

### Frontend Component Hierarchy
```
App (Routes)
├── RootSwitch (Public: Landing | Authenticated: AppShell)
│   ├── Landing
│   ├── Login
│   ├── Register
│   └── AppShell (ProtectedRoute)
│       ├── Dashboard
│       ├── Farms
│       ├── Assess (3-step wizard)
│       ├── Result (Charts, tables, CSV export)
│       ├── Compare (Multi-crop comparison)
│       ├── Alerts (Hide/snooze)
│       └── History (Paginated, filterable, sortable)
```

## Entry Points and Important Configuration Files

| Component | Entry Point | Config Files |
|-----------|-------------|--------------|
| **Backend** | `BackendApplication.java` | `application.yml`, `EngineConfig.java`, `SecurityConfig.java`, `WebClientConfig.java`, `CorsConfig.java`, `RateLimitFilter.java` |
| **Frontend** | `main.jsx` → `App.jsx` | `vite.config.js`, `tailwind.config.js`, `nginx.conf`, `.env.example` |
| **ML Service** | `app/main.py` | `requirements.txt`, `train.py` |
| **Docker** | `docker-compose.yml` | Service-specific `Dockerfile`s |

## Configuration Files Detail

### Backend: `application.yml`
```yaml
spring:
  application:
    name: backend
  data:
    mongodb:
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

### Frontend: `.env.example`
```
VITE_API_URL=http://localhost:8080
```

### ML Service: No config file (uses environment via Docker)