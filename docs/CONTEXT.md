# JalKrishi AI - CONTEXT (read first, every task)

Product: "Can I Grow This Crop?" Given a farm and a crop, compute a water budget and say if the crop is suitable. An "assessment" is that result. It is NOT a questionnaire.

## Environment rules

- Windows, PowerShell. Use `;` not `&&`. Use `.\gradlew.bat`. No `mkdir -p`, no `curl -L`, no bash scripts. Git is not installed.
- Python: use `.\.venv\Scripts\python.exe` inside ml-service.
- backend/: Spring Boot 3.5, Gradle, MongoDB, package com.jalkrishi, Java 17 source level. ml-service/: FastAPI. frontend/: React JavaScript (JSX), Vite, Tailwind v4.
- DB connection string env var is SPRING_DATA_MONGODB_URI. Never put a mongodb uri in application.yml.
- Do not create or edit gradlew, gradle/wrapper, or any existing test unless the task says so.
- Add a dependency only if the task names it. No Lombok. No secrets in the repo (env vars with a dev default).
- Backend tests use embedded MongoDB: @SpringBootTest + @AutoConfigureMockMvc with no explicit classes=, @MockitoBean, clean only the collections the test uses (never crops).
- Frontend tests: Vitest + Testing Library; mock '../api'; never change visible texts, labels or test ids of existing pages.
- A task is done only when its tests pass.
- Never overwrite docs/CONTEXT.md or docs/PROGRESS.md unless the task says so; edit single lines instead.

## Model (fixed)

Tmean = (Tmax+Tmin)/2
ET0 (mm/day) = 0.0023 _ (Tmean+17.8) _ sqrt(Tmax-Tmin) _ Ra (Tmax<Tmin -> IllegalArgumentException; Tmax==Tmin -> 0)
Stage for day d (1-based): walk the crop stages cumulating their days; after the last stage keep using the last stage.
ETc(d) = Kc(stage of d) _ ET0
Demand D (litres) = sum over d=1..horizon of ETc(d) _ areaHa _ 10000
Supply S (litres) = (peffDailyMm _ horizonDays + deltaSmMm) _ areaHa _ 10000 + storedWaterLitres + groundwaterLitres + (storedWaterLitresPerDay + groundwaterLitresPerDay) _ horizonDays (deltaSmMm = 0 in v1)
Per-day water is added in AssessmentService and in the report breakdown (horizon of each row) BEFORE the engine is called; WaterBudgetEngine itself is unchanged.
B = S - D ; R = S / D
areaHa <= 0 or D <= 0 -> IllegalArgumentException (API returns 400). Allowed horizonDays: 30, 60, 90.
Classes (thresholds in application.yml jalkrishi.suitability, never hardcoded):
R >= 1.0 EXCELLENT / stress LOW
0.8 <= R < 1.0 GOOD / LOW_MODERATE
0.6 <= R < 0.8 RISKY / MODERATE
R < 0.6 NOT_RECOMMENDED / HIGH
Confidence: HIGH if the weather source is LIVE, LOW if FALLBACK.

## Weather (DataService)

WeatherData{tmax,tmin,ra,peffDailyMm,source(LIVE|FALLBACK)}.
Live: Open-Meteo 16-day forecast averages (tmax, tmin, peffDailyMm = 0.8 \* mean precipitation), ra fixed 15.0.
Fallback (any failure, 5 s timeout): tmax 32, tmin 21, ra 15.0, peffDailyMm 1.5.

## Advice (RecommendationService)

Driving factor: R >= 1 -> "water supply covers crop demand"; else ET0 >= 5.0 -> "high evapotranspiration demand"; else (stored+groundwater) < 0.2\*D -> "low stored water and groundwater"; else "low effective rainfall".
Advice = "<SUITABILITY>: water ratio is <ratio 2 decimals>, driven by <factor>."
Alerts = the user's assessments with stress HIGH, newest first (no separate collection).

## API contract (field names are fixed; JWT needed except register, login, health)

POST /api/auth/register {name,email,password(min 8)} -> 201 {id,name,email}
POST /api/auth/login {email,password} -> {token}
GET /api/auth/me -> {id,name,email}
GET /health -> {"status":"UP"}
/api/farms CRUD (owner only; other user's farm -> 404). Farm {id,name,lat,lon,areaHa,soilType,storedWaterLitres,groundwaterLitres, optional country,state,district,taluka,village, storedWaterLitresPerDay,groundwaterLitresPerDay (default 0)}
GET /api/crops -> [{id,name,stages:[{name,days,kc}]}]
POST /api/assessments {farmId,cropId,horizonDays} -> 201 Assessment
GET /api/assessments (own, newest first)
GET /api/assessments/{id}
Assessment {id,farmId,cropId,horizonDays,supplyLitres,demandLitres,balanceLitres,ratio,suitability,stress,confidence,advice,mlUsed,mlSuitability,weather{tmax,tmin,ra,peffDailyMm,source},createdAt}
POST /api/assessments/compare {farmId,cropIds[],horizonDays} -> [Assessment] (not saved, sorted by ratio desc)
GET /api/alerts -> [{assessmentId,farmId,cropId,message,createdAt}]
GET /api/reports/{assessmentId} -> {assessment, breakdown:[{horizonDays(30|60|90),supplyLitres,demandLitres,ratio,suitability}]}
Errors: {timestamp,status,error,message}. 400 validation, 401 no/invalid token, 404 not found/not owner, 429 rate limit.
ML service: POST /predict {ratio,tmax,tmin,peffDailyMm} -> {suitability,probability,source("model"|"rules")}; GET /health. The model is trained on synthetic labels derived from the rule model.

## Frontend routes

Public: / (landing page, redirects to /dashboard when a token exists), /login, /register.
Protected (inside Layout): /dashboard, /farms, /assess, /assessments/:id, /compare, /alerts, /history.
Shared styles in src/index.css: app-bg, glass, lift, btn, btn-ghost, input-glass, row, glow-text, fade-up, pill, pill-active. Badge colors per class in src/labels.js.

## Backend packages (com.jalkrishi)

auth, user, farm, crop, engine, data, assessment, alert, report, config, common, health
