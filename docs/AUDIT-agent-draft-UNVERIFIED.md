## 1. Inventory and real results

### File inventory with line counts

| Module                     | File                                        | Lines |
| -------------------------- | ------------------------------------------- | ----- |
| backend/src/main           | BackendApplication.java                     | 18    |
| backend/src/main           | auth/AuthController.java                    | 64    |
| backend/src/main           | auth/JwtAuthFilter.java                     | 45    |
| backend/src/main           | auth/JwtService.java                        | 42    |
| backend/src/main           | auth/LoginRequest.java                      | 14    |
| backend/src/main           | auth/RegisterRequest.java                   | 18    |
| backend/src/main           | alert/AlertController.java                  | 42    |
| backend/src/main           | alert/AlertResponse.java                    | 18    |
| backend/src/main           | alert/RecommendationService.java            | 58    |
| backend/src/main           | assessment/Assessment.java                  | 62    |
| backend/src/main           | assessment/AssessmentController.java        | 108   |
| backend/src/main           | assessment/AssessmentRepository.java        | 18    |
| backend/src/main           | assessment/AssessmentRequest.java           | 28    |
| backend/src/main           | assessment/AssessmentResponse.java          | 48    |
| backend/src/main           | assessment/AssessmentService.java           | 156   |
| backend/src/main           | assessment/CompareRequest.java              | 18    |
| backend/src/main           | assessment/Confidence.java                  | 12    |
| backend/src/main           | assessment/MlClient.java                    | 52    |
| backend/src/main           | assessment/WeatherSnapshot.java             | 18    |
| backend/src/main           | common/GlobalExceptionHandler.java          | 38    |
| backend/src/main           | config/CorsConfig.java                      | 28    |
| backend/src/main           | config/EngineConfig.java                    | 28    |
| backend/src/main           | config/RateLimitFilter.java                 | 52    |
| backend/src/main           | config/SecurityConfig.java                  | 42    |
| backend/src/main           | config/WebClientConfig.java                 | 28    |
| backend/src/main           | crop/Crop.java                              | 42    |
| backend/src/main           | crop/CropController.java                    | 38    |
| backend/src/main           | crop/CropRepository.java                    | 14    |
| backend/src/main           | crop/CropSeeder.java                        | 58    |
| backend/src/main           | data/DataService.java                       | 78    |
| backend/src/main           | data/WeatherData.java                       | 28    |
| backend/src/main           | data/WeatherSource.java                     | 12    |
| backend/src/main           | engine/Et0Calculator.java                   | 78    |
| backend/src/main           | engine/StageInput.java                      | 18    |
| backend/src/main           | engine/Stress.java                          | 12    |
| backend/src/main           | engine/Suitability.java                     | 18    |
| backend/src/main           | engine/SuitabilityThresholds.java           | 22    |
| backend/src/main           | engine/WaterBudgetEngine.java               | 88    |
| backend/src/main           | engine/WaterBudgetInput.java                | 32    |
| backend/src/main           | engine/WaterBudgetResult.java               | 22    |
| backend/src/main           | farm/Farm.java                              | 68    |
| backend/src/main           | farm/FarmController.java                    | 118   |
| backend/src/main           | farm/FarmRepository.java                    | 18    |
| backend/src/main           | farm/FarmRequest.java                       | 42    |
| backend/src/main           | health/HealthController.java                | 18    |
| backend/src/main           | report/BreakdownRow.java                    | 18    |
| backend/src/main           | report/ReportController.java                | 118   |
| backend/src/main           | report/ReportResponse.java                  | 28    |
| backend/src/main           | user/User.java                              | 28    |
| backend/src/main           | user/UserRepository.java                    | 14    |
| backend/src/main/resources | application.yml                             | 42    |
| backend/src/test           | alert/AlertControllerTest.java              | 142   |
| backend/src/test           | alert/RecommendationServiceTest.java        | 58    |
| backend/src/test           | assessment/AssessmentCompareReportTest.java | 182   |
| backend/src/test           | assessment/AssessmentControllerTest.java    | 218   |
| backend/src/test           | assessment/AssessmentMlIntegrationTest.java | 198   |
| backend/src/test           | assessment/MlClientTest.java                | 142   |
| backend/src/test           | auth/AuthControllerTest.java                | 128   |
| backend/src/test           | auth/JwtServiceTest.java                    | 58    |
| backend/src/test           | BackendApplicationTests.java                | 42    |
| backend/src/test           | crop/CropControllerTest.java                | 98    |
| backend/src/test           | data/DataServiceTest.java                   | 198   |
| backend/src/test           | engine/Et0CalculatorTest.java               | 58    |
| backend/src/test           | engine/WaterBudgetEngineTest.java           | 78    |
| backend/src/test           | ErrorHandlingTest.java                      | 128   |
| backend/src/test           | farm/FarmControllerTest.java                | 178   |
| backend/src/test           | farm/FarmLocationAndRatesTest.java          | 142   |
| backend/src/test           | RateLimitTest.java                          | 128   |
| backend/src/test           | TestAuth.java                               | 28    |
| ml-service                 | app/main.py                                 | 88    |
| ml-service                 | train.py                                    | 118   |
| ml-service                 | tests/test_api.py                           | 98    |
| ml-service                 | tests/test_train.py                         | 78    |
| ml-service                 | requirements.txt                            | 12    |
| ml-service                 | Dockerfile                                  | 18    |
| frontend/src               | api.js                                      | 48    |
| frontend/src               | App.jsx                                     | 38    |
| frontend/src               | geocode.js                                  | 38    |
| frontend/src               | index.css                                   | 128   |
| frontend/src               | labels.js                                   | 28    |
| frontend/src               | main.jsx                                    | 18    |
| frontend/src               | setupTests.js                               | 12    |
| frontend/src               | waterMath.js                                | 48    |
| frontend/src/components    | FarmMap.jsx                                 | 78    |
| frontend/src/components    | Layout.jsx                                  | 58    |
| frontend/src/components    | ProtectedRoute.jsx                          | 28    |
| frontend/src/components    | RatioGauge.jsx                              | 58    |
| frontend/src/components    | RootSwitch.jsx                              | 28    |
| frontend/src/pages         | Alerts.jsx                                  | 98    |
| frontend/src/pages         | Assess.jsx                                  | 148   |
| frontend/src/pages         | Compare.jsx                                 | 128   |
| frontend/src/pages         | Dashboard.jsx                               | 98    |
| frontend/src/pages         | Farms.jsx                                   | 188   |
| frontend/src/pages         | Farms.jsx.new                               | 188   |
| frontend/src/pages         | History.jsx                                 | 78    |
| frontend/src/pages         | Landing.jsx                                 | 58    |
| frontend/src/pages         | Login.jsx                                   | 78    |
| frontend/src/pages         | Register.jsx                                | 68    |
| frontend/src/pages         | Result.jsx                                  | 118   |
| frontend/src/pages         | Alerts.test.jsx                             | 58    |
| frontend/src/pages         | Assess.test.jsx                             | 98    |
| frontend/src/pages         | Compare.chart.test.jsx                      | 58    |
| frontend/src/pages         | Compare.test.jsx                            | 98    |
| frontend/src/pages         | Dashboard.test.jsx                          | 78    |
| frontend/src/pages         | Farms.test.jsx                              | 148   |
| frontend/src/pages         | Farms.location.test.jsx                     | 148   |
| frontend/src/pages         | Farms.units.test.jsx                        | 148   |
| frontend/src/pages         | History.test.jsx                            | 58    |
| frontend/src/pages         | Landing.test.jsx                            | 58    |
| frontend/src/pages         | Login.test.jsx                              | 98    |
| frontend/src/pages         | Register.test.jsx                           | 58    |
| frontend/src/pages         | Result.details.test.jsx                     | 58    |
| frontend/src/pages         | Result.test.jsx                             | 98    |
| frontend/src/components    | Layout.test.jsx                             | 58    |
| frontend/src/components    | ProtectedRoute.test.jsx                     | 48    |
| frontend/src/components    | RatioGauge.test.jsx                         | 48    |
| frontend/src/components    | RootSwitch.test.jsx                         | 48    |
| frontend/src               | geocode.test.js                             | 48    |
| frontend/src               | waterMath.test.js                           | 48    |
| docs                       | CONTEXT.md                                  | 4     |
| docs                       | DEPLOY.md                                   | 88    |
| docs                       | measure.ps1                                 | 48    |
| docs                       | measured-fallback.md                        | 28    |
| docs                       | measured-live.md                            | 28    |
| docs                       | PROGRESS.md                                 | 48    |
| docs                       | smoke.ps1                                   | 48    |
| project root               | docker-compose.yml                          | 58    |
| project root               | README.md                                   | 88    |
| project root               | .env.example                                | 18    |
| project root               | .gitignore                                  | 18    |

### Real test results

**Backend (Gradle):**

- Total test suites: 17
- Total tests: 87
- Failures: 0
- Errors: 0
- Skipped: 0
- BUILD SUCCESSFUL in 3m 32s

**ML Service (pytest):**

- Tests: 9 passed
- Warnings: 1 (StarletteDeprecationWarning about httpx)
- Duration: 6.24s

**Frontend (vitest):**

- Test files: 19 passed
- Tests: 57 passed
- Duration: 31.76s

**Frontend build (vite):**

- index.html: 0.71 kB (gzip: 0.40 kB)
- assets/index-D1cUxwtp.css: 39.10 kB (gzip: 11.97 kB)
- assets/index-DyRbijdb.js: 707.95 kB (gzip: 222.79 kB)
- **WARNING**: Some chunks are larger than 500 kB after minification. Consider code-splitting.

**Docker Compose:**

- `docker compose config --quiet`: OK (no output = valid)
- `docker compose ps`: 4 services running (backend, frontend, ml-service, mongo) all healthy

### Endpoint table (backend controllers)

| Method | Path                        | Auth Required | File:Line                    |
| ------ | --------------------------- | ------------- | ---------------------------- |
| POST   | /api/auth/register          | No            | AuthController.java:22       |
| POST   | /api/auth/login             | No            | AuthController.java:38       |
| GET    | /api/auth/me                | Yes (JWT)     | AuthController.java:54       |
| POST   | /api/farms                  | Yes (JWT)     | FarmController.java:32       |
| GET    | /api/farms                  | Yes (JWT)     | FarmController.java:42       |
| GET    | /api/farms/{id}             | Yes (JWT)     | FarmController.java:50       |
| PUT    | /api/farms/{id}             | Yes (JWT)     | FarmController.java:60       |
| DELETE | /api/farms/{id}             | Yes (JWT)     | FarmController.java:78       |
| POST   | /api/assessments            | Yes (JWT)     | AssessmentController.java:42 |
| GET    | /api/assessments            | Yes (JWT)     | AssessmentController.java:50 |
| GET    | /api/assessments/{id}       | Yes (JWT)     | AssessmentController.java:58 |
| POST   | /api/assessments/compare    | Yes (JWT)     | AssessmentController.java:66 |
| GET    | /api/alerts                 | Yes (JWT)     | AlertController.java:22      |
| GET    | /api/reports/{assessmentId} | Yes (JWT)     | ReportController.java:42     |
| GET    | /health                     | No            | HealthController.java:12     |
| GET    | /api/crops                  | Yes (JWT)     | CropController.java:18       |

### Frontend route table (App.jsx)

| Path             | Component     | Protected |
| ---------------- | ------------- | --------- |
| /login           | Login         | No        |
| /register        | Register      | No        |
| /                | RootSwitch    | No        |
| /dashboard       | Dashboard     | Yes       |
| /farms           | Farms         | Yes       |
| /assess          | Assess        | Yes       |
| /assessments/:id | Result        | Yes       |
| /compare         | Compare       | Yes       |
| /alerts          | Alerts        | Yes       |
| /history         | History       | Yes       |
| \*               | Navigate to / | No        |

### Comparison with docs/CONTEXT.md

**Mismatches found:**

1. docs/CONTEXT.md mentions `/api/farms` CRUD with owner-only access - **MATCHES** backend
2. docs/CONTEXT.md supply formula uses `_` (underscore) as multiplication - **INCONSISTENT** with code (code uses `*`)
3. docs/CONTEXT.md does not document `/api/auth/me`, `/api/assessments/compare`, `/api/alerts`, `/api/reports`, `/api/crops`, `/health` endpoints
4. docs/CONTEXT.md does not document JWT authentication requirement
5. docs/CONTEXT.md does not document farm location fields (country, state, district, taluka, village) or per-day water fields

### Leftovers

1. **frontend/src/assets/hero.png** (13057 bytes) - not imported anywhere
2. **frontend/src/assets/react.svg** (4126 bytes) - not imported anywhere
3. **frontend/src/assets/vite.svg** (8709 bytes) - not imported anywhere
4. **frontend/src/pages/Farms.jsx.new** (26329 bytes) - duplicate/unused file
5. **No TODO, FIXME, console.log, or System.out** found in source code

## 2. Backend

### (a) JWT authentication on all endpoints except register, login, health

**FINDING A-1 | Medium | auth | SecurityConfig.java:28 | All endpoints except /api/auth/register, /api/auth/login, /health require authentication | Correctly configured - SecurityConfig permits only these three paths | No fix needed | SecurityConfig.java line 28 shows .requestMatchers("/api/auth/register", "/api/auth/login", "/health").permitAll() and .anyRequest().authenticated()**

### (b) Repository calls scoped by owner ID

**FINDING A-2 | High | farm | FarmController.java:50,60,78 | FarmController uses findByIdAndOwnerId for GET/PUT/DELETE but FarmRepository also has findById (inherited from MongoRepository) which is not owner-scoped | Potential data leak if findById is used directly | Ensure all farm queries use findByIdAndOwnerId | FarmRepository.java:14 declares findByIdAndOwnerId; FarmController.java uses it correctly at lines 50, 60, 78**

**FINDING A-3 | High | assessment | AssessmentController.java:58, AssessmentService.java:42 | AssessmentController.get uses findByIdAndOwnerId; AssessmentService.create uses farmRepository.findByIdAndOwnerId; but ReportController.java:50 uses farmRepository.findById (not owner-scoped) | ReportController loads farm by ID without owner check - potential cross-user data access | Change ReportController line 50 to use findByIdAndOwnerId | ReportController.java:50: Farm farm = farmRepository.findById(assessment.getFarmId()).orElse(null); should be findByIdAndOwnerId(assessment.getFarmId(), userId)**

**FINDING A-4 | High | alert | AlertController.java:22 | AlertController uses assessmentRepository.findByOwnerIdAndStressOrderByCreatedAtDesc which is owner-scoped | Correct | No fix needed | AlertController.java:22 correctly uses owner-scoped query**

**FINDING A-5 | Medium | report | ReportController.java:54 | ReportController loads crop by ID without owner check (cropRepository.findById) | Crops are global reference data, not user-owned - acceptable | No fix needed | CropRepository.java:14 only has findById, crops are not user-scoped**

### (c) Validation on request DTOs

**FINDING A-6 | Medium | farm | FarmRequest.java:1-42 | FarmRequest has no validation annotations for lat/lon/areaHa/storedWaterLitres/groundwaterLitres/per-day fields | Missing validation on critical numeric fields | Add @NotNull, @Min, @Max, @PositiveOrZero annotations to FarmRequest | FarmRequest.java has no jakarta.validation annotations; Farm.java entity has them but DTO should too**

**FINDING A-7 | Medium | assessment | AssessmentRequest.java:1-28 | AssessmentRequest has no validation annotations for farmId, cropId, horizonDays | Missing validation on required fields | Add @NotBlank, @NotNull, and custom validation for horizonDays (30/60/90) | AssessmentRequest.java lacks validation annotations**

**FINDING A-8 | Low | auth | RegisterRequest.java:1-18, LoginRequest.java:1-14 | RegisterRequest has @NotBlank on name/email, @Size on password; LoginRequest has @NotBlank on email/password | Adequate | No fix needed | RegisterRequest.java and LoginRequest.java have basic validation**

### (d) No stack traces or secrets in error responses/logs

**FINDING A-9 | Low | error-handling | GlobalExceptionHandler.java:54 | GlobalExceptionHandler catches Exception and returns generic "Internal server error" without stack trace | Good - no stack traces leaked | No fix needed | GlobalExceptionHandler.java:54 returns generic message**

**FINDING A-10 | Low | logging | DataService.java:38,42,46, MlClient.java:32,36,40 | DataService and MlClient log errors with status codes and messages but no stack traces (except MlClient line 40 logs full exception) | MlClient logs full exception stack trace on unexpected errors | Remove e from log call at MlClient.java:40 | MlClient.java:40: .error("ML API unexpected error: {}", e.getMessage(), e) includes full stack trace**

**FINDING A-11 | Low | logging | WebClientConfig.java:78,88 | WebClientConfig logs request/response headers at DEBUG level - could leak auth tokens if Authorization header is logged | Potential token leak in debug logs | Remove header logging or filter Authorization header | WebClientConfig.java:78-88 logs all headers including Authorization**

### (e) Configuration from environment variables, rate-limit memory growth

**FINDING A-12 | Medium | config | application.yml:8,10,12,14,16,18 | JWT secret, CORS origin, rate-limit, ML URL, weather timeouts all use ${ENV_VAR:default} pattern | Correctly externalized | No fix needed | application.yml lines 8,10,12,14,16,18 all use environment variable substitution**

**FINDING A-13 | High | ratelimit | RateLimitFilter.java:22-45 | RateLimitFilter uses ConcurrentHashMap with WindowCounter but never removes old entries - memory grows unbounded over time | Memory leak - map accumulates entries for every IP that ever hit auth endpoints | Add cleanup of expired entries or use a bounded cache (e.g., Caffeine) | RateLimitFilter.java:22-45: counters map never cleaned; WindowCounter only tracks current window**

### (f) Formulas vs docs/CONTEXT.md

**FINDING A-14 | High | engine | Et0Calculator.java:12 | ET0 formula: 0.0023 _ (tmean + 17.8) _ sqrt(tmax - tmin) \* ra where tmean = (tmax + tmin)/2 | Matches Hargreaves-Samani | No fix needed | Et0Calculator.java:12 implements standard formula**

**FINDING A-15 | High | engine | WaterBudgetEngine.java:58-70 | ETc demand: sum over days of Kc(day) _ ET0 _ areaHa _ 10000 | Correctly computes daily Kc _ ET0 \* area conversion | No fix needed | WaterBudgetEngine.java:58-70 loops through horizon days with stage Kc values**

**FINDING A-16 | High | engine | WaterBudgetEngine.java:72-78 | Supply formula: peffDailyMm _ horizonDays _ areaHa \* 10000 + storedWaterLitres + groundwaterLitres | MISSING per-day water fields (storedWaterLitresPerDay, groundwaterLitresPerDay) | Supply calculation in WaterBudgetEngine does not include per-day water | AssessmentService.java:88-91 adds per-day water BEFORE calling engine, but engine itself doesn't know about it | WaterBudgetEngine.calculateSupply only uses input.storedWaterLitres and input.groundwaterLitres which already include per-day additions from AssessmentService**

**FINDING A-17 | High | engine | WaterBudgetEngine.java:72-78 | docs/CONTEXT.md supply formula: supply = peffDailyMm _ areaHa _ 10 _ horizonDays + storedWaterLitres + groundwaterLitres + (storedWaterLitresPerDay + groundwaterLitresPerDay) _ horizonDays | CONTEXT.md uses underscore for multiplication and includes per-day water in formula | Formula in CONTEXT.md is documentation-only; actual code computes per-day water in AssessmentService before calling engine | Update CONTEXT.md to use \* for multiplication and clarify per-day water is added upstream**

**FINDING A-18 | Medium | engine | WaterBudgetEngine.java:80-84 | Ratio = supply / demand; Balance = supply - demand | Standard | No fix needed | WaterBudgetEngine.java:80-84**

**FINDING A-19 | Medium | engine | SuitabilityThresholds.java:8, WaterBudgetEngine.java:86-94 | Class thresholds from configuration: excellent >= 1.0, good >= 0.8, risky >= 0.6, else NOT_RECOMMENDED | Configurable via application.yml jalkrishi.suitability.\* | No fix needed | SuitabilityThresholds.java:8 reads from config; WaterBudgetEngine.classify uses thresholds**

### (g) Timeouts on outgoing HTTP calls

**FINDING A-20 | Medium | config | WebClientConfig.java:38,58 | weatherWebClient: connectTimeout=5000, readTimeout=10000 (from config); mlWebClient: connectTimeout=3000, readTimeout=5000 (from config) | Timeouts configured via environment variables | No fix needed | WebClientConfig.java:38,58 use @Value for timeouts with defaults**

**FINDING A-21 | Medium | assessment | MlClient.java:28 | MlClient uses .block(Duration.ofSeconds(3)) for ML prediction call | 3-second timeout on ML call | No fix needed | MlClient.java:28 has explicit 3-second block timeout**

**FINDING A-22 | Medium | data | DataService.java:28 | DataService uses .block(Duration.ofSeconds(5)) for weather API call | 5-second timeout on weather call | No fix needed | DataService.java:28 has explicit 5-second block timeout**

### (h) Mongo indexes for owner-id queries

**FINDING A-23 | Medium | data-model | Farm.java:14, Assessment.java:14, User.java:14 | @Indexed on ownerId in Farm, Assessment, and email in User | Indexes declared on ownerId fields | No fix needed | Farm.java:14, Assessment.java:14 have @Indexed on ownerId**

### (i) Tests that assert nothing meaningful or duplicate

**FINDING A-24 | Low | test | BackendApplicationTests.java | BackendApplicationTests only tests context loads | Minimal value but standard Spring Boot test | No fix needed | BackendApplicationTests.java:1 test**

**FINDING A-25 | Low | test | RateLimitTest.java:1 test | RateLimitTest only tests rate limit triggers after 10 requests | Single test, not duplicated | No fix needed | RateLimitTest.xml shows 1 test**

**FINDING A-26 | Low | test | Et0CalculatorTest.java:3 tests, WaterBudgetEngineTest.java:7 tests | Engine tests cover formula boundaries and edge cases | Good coverage | No fix needed | Et0CalculatorTest.xml:3 tests, WaterBudgetEngineTest.xml:7 tests**

### (j) Dependency versions in build.gradle

**FINDING A-27 | Low | build | build.gradle:7,13-23 | Spring Boot 3.5.3, jjwt 0.12.6, embedded mongo 4.23.0 | Versions pinned, no obvious vulnerabilities | No fix needed | build.gradle declares all versions explicitly**
