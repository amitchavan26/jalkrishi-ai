# Project Overview

## Project Introduction and Purpose

**JalKrishi AI** ("Can I Grow This Crop?") is a water-budget crop suitability tool that helps farmers and agricultural advisors evaluate whether a given crop can be grown on a specific farm based on water availability. The application computes a water budget by comparing water supply (effective rainfall, stored water, groundwater) against crop demand (evapotranspiration over a specified horizon) and returns a suitability assessment with confidence levels.

## Problem Statement and Solution

### Problem
Farmers often lack data-driven tools to determine if their water resources are sufficient for specific crops before planting. This leads to crop failures, wasted resources, and financial losses.

### Solution
JalKrishi AI provides a scientific, data-driven assessment by:
1. **Collecting farm data**: Location, area, soil type, water resources (stored water, groundwater)
2. **Fetching weather data**: Live 16-day forecast from Open-Meteo API (with fallback to typical values)
3. **Computing water budget**: Using the Hargreaves-Samani method for reference evapotranspiration (ET0) and FAO-56 crop coefficients (Kc)
4. **Delivering suitability assessment**: Ratio-based classification with confidence levels and actionable advice

## Main Features and Functionalities

| Feature | Description |
|---------|-------------|
| **User Authentication** | JWT-based registration and login with rate limiting |
| **Farm Management** | Create, list, view, update, delete farms with location, area, soil type, water resources |
| **Crop Catalog** | Pre-seeded database of 8 crops with growth stages and Kc values |
| **Water Budget Assessment** | Compute supply vs demand for 30/60/90-day horizons |
| **Crop Comparison** | Compare multiple crops on the same farm to find the best fit |
| **Detailed Reports** | Breakdown by horizon (30/60/90 days), charts, CSV export, print |
| **Alerts** | High-stress assessments flagged with hide/snooze functionality |
| **History** | Paginated, filterable, sortable assessment history |
| **ML Enhancement** | Optional ML-based suitability prediction (FastAPI service) |
| **Dark/Light Theme** | Persisted theme preference |
| **Responsive UI** | Mobile-first design with Tailwind CSS |

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| React Router | 6.x | Client-side routing |
| Tailwind CSS | 3.x | Utility-first styling |
| Chart.js | 4.x | Data visualization (doughnut, line, bar charts) |
| Axios | 1.x | HTTP client with interceptors |
| Lucide React | 0.x | Icon library |
| Vitest | 1.x | Unit testing |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 3.x | Application framework |
| Java | 17+ | Programming language |
| Spring Data MongoDB | 3.x | MongoDB integration |
| Spring Security | 6.x | Authentication and authorization |
| JWT (jjwt) | 0.12.x | Token-based authentication |
| WebClient | 6.x | Reactive HTTP client for external APIs |
| Gradle | 8.x | Build tool |
| JUnit 5 | 5.x | Unit testing |
| Embedded MongoDB | 6.x | Test database |

### ML Service
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.109.x | Python web framework |
| scikit-learn | 1.3.x | Machine learning |
| joblib | 1.3.x | Model serialization |
| pytest | 7.x | Testing |
| Uvicorn | 0.27.x | ASGI server |

### Database & Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| MongoDB | 7.x | Primary database |
| Docker | 24.x | Containerization |
| Docker Compose | 2.x | Multi-container orchestration |
| Nginx | Latest | Frontend production server |
| Open-Meteo API | - | Weather data (free, no auth) |

## System Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Frontend   │────▶│  Backend    │
│  (React)    │     │  (Vite)     │     │ (Spring Boot)│
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐             │
                    │  ML Service │◀────────────┤
                    │  (FastAPI)  │             │
                    └─────────────┘             │
                                               ▼
                    ┌─────────────┐     ┌─────────────┐
                    │   MongoDB   │◀────│  Weather    │
                    │   (7.x)     │     │  (Open-Meteo)│
                    └─────────────┘     └─────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **Frontend** | User interface, state management, API integration, charting, form validation |
| **Backend** | Business logic, authentication, data persistence, water budget computation, external API orchestration |
| **ML Service** | ML-based suitability prediction (fallback to rule-based if model unavailable) |
| **MongoDB** | Persistent storage for users, farms, crops, assessments |
| **Open-Meteo** | Live weather data (temperature, precipitation) |

## Major Modules and Their Responsibilities

### Backend Modules

| Module | Package | Responsibility |
|--------|---------|----------------|
| **Authentication** | `com.jalkrishi.auth` | JWT token generation/validation, login, registration, user context |
| **User Management** | `com.jalkrishi.user` | User entity, repository |
| **Farm Management** | `com.jalkrishi.farm` | Farm CRUD, ownership validation, location data |
| **Crop Management** | `com.jalkrishi.crop` | Crop catalog, growth stages, Kc values, database seeding |
| **Assessment** | `com.jalkrishi.assessment` | Water budget computation, ML integration, assessment persistence |
| **Engine** | `com.jalkrishi.engine` | Core water budget calculations (ET0, supply, demand, classification) |
| **Data Service** | `com.jalkrishi.data` | Weather API integration (Open-Meteo), fallback handling |
| **Alerts** | `com.jalkrishi.alert` | High-stress assessment alerts, recommendation generation |
| **Reports** | `com.jalkrishi.report` | Detailed multi-horizon breakdown reports |
| **Configuration** | `com.jalkrishi.config` | Security, CORS, WebClient, rate limiting, engine properties |
| **Common** | `com.jalkrishi.common` | Global exception handling |

### Frontend Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **Pages** | `src/pages/` | Route-level components (Dashboard, Farms, Assess, Result, Compare, Alerts, History, Login, Register, Landing) |
| **Components** | `src/components/` | Reusable UI components (AppShell, ProtectedRoute, FarmMap, RatioGauge, UI primitives) |
| **API** | `src/api.js` | Axios instance, token management, interceptors |
| **Theme** | `src/theme/` | Dark/light theme context and toggle |
| **Utils** | `src/*.js` | Water math, geocoding, labels, CSV export, farm info helpers |

### ML Service Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **API** | `app/main.py` | FastAPI endpoints (/health, /predict), model loading, rule fallback |
| **Training** | `train.py` | Model training script (generates model.joblib) |
| **Tests** | `tests/` | API and training tests |