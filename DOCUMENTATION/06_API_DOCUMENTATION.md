# API Documentation

## Overview

The JalKrishi AI backend exposes a RESTful API over HTTP/JSON. All endpoints (except auth and health) require JWT authentication via the `Authorization: Bearer <token>` header.

**Base URL**: `http://localhost:8080` (configurable via `VITE_API_URL`)

**Content-Type**: `application/json`

**Authentication**: JWT Bearer token (120-minute expiry)

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Headers**: None required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules**:
- `name`: Required, not blank
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters

**Responses**:

| Status | Response |
|--------|----------|
| 201 Created | `{ "id": "userId", "name": "John Doe", "email": "john@example.com" }` |
| 400 Bad Request | `{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "Email already exists" }` |
| 400 Bad Request | `{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "Validation failed: password: size must be between 8 and 2147483647" }` |

**Controller**: `AuthController.register()`
**Service**: `UserRepository`, `PasswordEncoder`

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Headers**: None required

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Rate Limited**: 10 requests/minute per IP (configurable via `AUTH_RATE_LIMIT`)

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `{ "token": "eyJhbGciOiJIUzI1NiJ9..." }` |
| 401 Unauthorized | `{ "timestamp": "...", "status": 401, "error": "Unauthorized", "message": "Invalid credentials" }` |
| 429 Too Many Requests | `{ "timestamp": "...", "status": 429, "error": "Too Many Requests", "message": "Too many requests" }` |

**Controller**: `AuthController.login()`
**Service**: `UserRepository`, `PasswordEncoder`, `JwtService`

---

### GET /api/auth/me

Get current authenticated user profile.

**Headers**: `Authorization: Bearer <token>`

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `{ "id": "userId", "name": "John Doe", "email": "john@example.com" }` |
| 401 Unauthorized | Empty body, 401 status |

**Controller**: `AuthController.me()`
**Service**: `UserRepository`

---

## Farm Endpoints

### POST /api/farms

Create a new farm.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "North Field",
  "lat": 28.6139,
  "lon": 77.2090,
  "areaHa": 2.5,
  "soilType": "Loam",
  "storedWaterLitres": 50000,
  "groundwaterLitres": 100000,
  "country": "India",
  "state": "Delhi",
  "district": "New Delhi",
  "taluka": "Connaught Place",
  "village": "Central Delhi",
  "storedWaterLitresPerDay": 5000,
  "groundwaterLitresPerDay": 10000
}
```

**Validation Rules**:
| Field | Required | Constraints |
|-------|----------|-------------|
| name | Yes | Not blank |
| lat | Yes | -90 to 90 |
| lon | Yes | -180 to 180 |
| areaHa | Yes | > 0 |
| soilType | No | String |
| storedWaterLitres | Yes | >= 0 |
| groundwaterLitres | Yes | >= 0 |
| country/state/district/taluka/village | No | Max 100 chars each |
| storedWaterLitresPerDay | Yes | >= 0 (default 0) |
| groundwaterLitresPerDay | Yes | >= 0 (default 0) |

**Responses**:

| Status | Response |
|--------|----------|
| 201 Created | Farm object (see GET /api/farms/{id}) |
| 400 Bad Request | Validation error details |
| 401 Unauthorized | Missing/invalid token |

**Controller**: `FarmController.create()`
**Repository**: `FarmRepository.save()`

---

### GET /api/farms

List all farms owned by the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `[{ "id": "...", "ownerId": "...", "name": "...", "lat": 28.6139, "lon": 77.2090, "areaHa": 2.5, "soilType": "Loam", "storedWaterLitres": 50000, "groundwaterLitres": 100000, "country": "India", "state": "Delhi", "district": "New Delhi", "taluka": "Connaught Place", "village": "Central Delhi", "storedWaterLitresPerDay": 5000, "groundwaterLitresPerDay": 10000, "createdAt": "2024-01-15T11:00:00.000Z" }]` |
| 401 Unauthorized | Missing/invalid token |

**Controller**: `FarmController.list()`
**Repository**: `FarmRepository.findByOwnerId()`

---

### GET /api/farms/{id}

Get a specific farm by ID (must belong to authenticated user).

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` - Farm ObjectId

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | Farm object (same as list item) |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | `{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "Farm not found" }` |

**Controller**: `FarmController.get()`
**Repository**: `FarmRepository.findByIdAndOwnerId()`

---

### PUT /api/farms/{id}

Update a farm (must belong to authenticated user).

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` - Farm ObjectId

**Request Body**: Same as POST /api/farms (all fields optional for partial update)

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | Updated farm object |
| 400 Bad Request | Validation error |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Farm not found or not owned by user |

**Controller**: `FarmController.update()`
**Repository**: `FarmRepository.findByIdAndOwnerId()`, `save()`

---

### DELETE /api/farms/{id}

Delete a farm (must belong to authenticated user).

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` - Farm ObjectId

**Responses**:

| Status | Response |
|--------|----------|
| 204 No Content | Empty body |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Farm not found or not owned by user |

**Controller**: `FarmController.delete()`
**Repository**: `FarmRepository.findByIdAndOwnerId()`, `delete()`

---

## Crop Endpoints

### GET /api/crops

List all available crops with their growth stages.

**Headers**: `Authorization: Bearer <token>`

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `[{ "id": "...", "name": "Rice", "stages": [{ "name": "Initial", "days": 30, "kc": 1.05 }, { "name": "Development", "days": 30, "kc": 1.15 }, { "name": "Mid", "days": 60, "kc": 1.20 }, { "name": "Late", "days": 30, "kc": 0.90 }] }, ...]` |
| 401 Unauthorized | Missing/invalid token |

**Controller**: `CropController.list()`
**Repository**: `CropRepository.findAll()`

**Seeded Crops**: Rice, Wheat, Cotton, Sugarcane, Maize, Soybean, Tomato, Onion

---

## Assessment Endpoints

### POST /api/assessments

Create a new water budget assessment (saved to database).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "farmId": "65a1b2c3d4e5f6789012346",
  "cropId": "65a1b2c3d4e5f6789012347",
  "horizonDays": 60
}
```

**Validation Rules**:
- `farmId`: Required, must exist and belong to user
- `cropId`: Required, must exist
- `horizonDays`: Required, must be 30, 60, or 90

**Processing**:
1. Validates farm ownership
2. Loads crop stages
3. Fetches weather for farm location (Open-Meteo)
4. Computes water budget (ET0 → ETc → Supply/Demand)
5. Calls ML service for prediction
6. Generates advice
7. Saves assessment

**Responses**:

| Status | Response |
|--------|----------|
| 201 Created | AssessmentResponse object (see below) |
| 400 Bad Request | Validation error or invalid horizonDays |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Farm or crop not found |

**Controller**: `AssessmentController.create()`
**Service**: `AssessmentService.create()`

**Response Body** (AssessmentResponse):
```json
{
  "id": "65a1b2c3d4e5f6789012348",
  "farmId": "65a1b2c3d4e5f6789012346",
  "cropId": "65a1b2c3d4e5f6789012347",
  "horizonDays": 60,
  "supplyLitres": 1500000.0,
  "demandLitres": 1200000.0,
  "balanceLitres": 300000.0,
  "ratio": 1.25,
  "suitability": "EXCELLENT",
  "stress": "LOW",
  "confidence": "HIGH",
  "advice": "EXCELLENT: water ratio is 1.25, driven by water supply covers crop demand.",
  "mlUsed": true,
  "mlSuitability": "EXCELLENT",
  "weather": {
    "tmax": 32.5,
    "tmin": 21.0,
    "ra": 15.0,
    "peffDailyMm": 2.1,
    "source": "LIVE"
  },
  "createdAt": "2024-01-15T11:30:00.000Z"
}
```

---

### GET /api/assessments

List all assessments for the authenticated user, sorted by creation date descending.

**Headers**: `Authorization: Bearer <token>`

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | Array of AssessmentResponse objects |
| 401 Unauthorized | Missing/invalid token |

**Controller**: `AssessmentController.list()`
**Repository**: `AssessmentRepository.findByOwnerIdOrderByCreatedAtDesc()`

---

### GET /api/assessments/{id}

Get a specific assessment by ID (must belong to authenticated user).

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` - Assessment ObjectId

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | AssessmentResponse object |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Assessment not found or not owned by user |

**Controller**: `AssessmentController.get()`
**Repository**: `AssessmentRepository.findByIdAndOwnerId()`

---

### POST /api/assessments/compare

Compare multiple crops on the same farm (not saved to database).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "farmId": "65a1b2c3d4e5f6789012346",
  "cropIds": ["cropId1", "cropId2", "cropId3"],
  "horizonDays": 60
}
```

**Validation Rules**:
- `farmId`: Required, must exist and belong to user
- `cropIds`: Required, array of crop IDs, all must exist
- `horizonDays`: Required, must be 30, 60, or 90

**Processing**:
1. Validates farm ownership
2. Loads all crops
3. Fetches weather ONCE for farm location
4. Computes assessment for each crop (not saved)
5. Sorts by ratio descending
6. Returns sorted list

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | Array of AssessmentResponse objects (sorted by ratio desc) |
| 400 Bad Request | Validation error or invalid horizonDays |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Farm or any crop not found |

**Controller**: `AssessmentController.compare()`
**Service**: `AssessmentService.compute()` (called for each crop)

---

## Alert Endpoints

### GET /api/alerts

Get high-stress assessments for the authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Processing**:
- Queries assessments with `stress = HIGH` for current user
- Client-side filters hidden/snoozed alerts (stored in localStorage)

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `[{ "assessmentId": "...", "farmId": "...", "cropId": "...", "message": "NOT_RECOMMENDED: water ratio is 0.45, driven by low effective rainfall.", "createdAt": "2024-01-15T11:30:00.000Z" }]` |
| 401 Unauthorized | Missing/invalid token |

**Controller**: `AlertController.getAlerts()`
**Repository**: `AssessmentRepository.findByOwnerIdAndStressOrderByCreatedAtDesc(userId, Stress.HIGH)`

**Response Body** (AlertResponse):
```json
{
  "assessmentId": "65a1b2c3d4e5f6789012348",
  "farmId": "65a1b2c3d4e5f6789012346",
  "cropId": "65a1b2c3d4e5f6789012347",
  "message": "NOT_RECOMMENDED: water ratio is 0.45, driven by low effective rainfall.",
  "createdAt": "2024-01-15T11:30:00.000Z"
}
```

---

## Report Endpoints

### GET /api/reports/{assessmentId}

Get detailed multi-horizon breakdown report for an assessment.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `assessmentId` - Assessment ObjectId

**Processing**:
1. Loads assessment (ownership check)
2. Loads farm and crop
3. Reconstructs WeatherData from stored snapshot
4. Recomputes water budget for 30, 60, 90 days
5. Returns assessment + breakdown

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | ReportResponse object (see below) |
| 401 Unauthorized | Missing/invalid token |
| 404 Not Found | Assessment, farm, or crop not found |

**Controller**: `ReportController.getReport()`

**Response Body** (ReportResponse):
```json
{
  "assessment": {
    "id": "65a1b2c3d4e5f6789012348",
    "farmId": "65a1b2c3d4e5f6789012346",
    "cropId": "65a1b2c3d4e5f6789012347",
    "horizonDays": 60,
    "supplyLitres": 1500000.0,
    "demandLitres": 1200000.0,
    "balanceLitres": 300000.0,
    "ratio": 1.25,
    "suitability": "EXCELLENT",
    "stress": "LOW",
    "confidence": "HIGH",
    "advice": "EXCELLENT: water ratio is 1.25, driven by water supply covers crop demand.",
    "mlUsed": true,
    "mlSuitability": "EXCELLENT",
    "weather": {
      "tmax": 32.5,
      "tmin": 21.0,
      "ra": 15.0,
      "peffDailyMm": 2.1,
      "source": "LIVE"
    },
    "createdAt": "2024-01-15T11:30:00.000Z"
  },
  "breakdown": [
    {
      "horizonDays": 30,
      "supplyLitres": 800000.0,
      "demandLitres": 600000.0,
      "ratio": 1.33,
      "suitability": "EXCELLENT"
    },
    {
      "horizonDays": 60,
      "supplyLitres": 1500000.0,
      "demandLitres": 1200000.0,
      "ratio": 1.25,
      "suitability": "EXCELLENT"
    },
    {
      "horizonDays": 90,
      "supplyLitres": 2100000.0,
      "demandLitres": 1900000.0,
      "ratio": 1.11,
      "suitability": "EXCELLENT"
    }
  ]
}
```

---

## Health Endpoint

### GET /health

Health check endpoint (no authentication required).

**Headers**: None required

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `{ "status": "UP" }` |

**Controller**: `HealthController`

---

## ML Service Endpoints

### GET /health

ML service health check.

**Base URL**: `http://localhost:8000` (internal: `http://ml-service:8000`)

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `{ "status": "UP" }` |

---

### POST /predict

Get ML-based suitability prediction.

**Request Body**:
```json
{
  "ratio": 1.25,
  "tmax": 32.5,
  "tmin": 21.0,
  "peffDailyMm": 2.1
}
```

**Responses**:

| Status | Response |
|--------|----------|
| 200 OK | `{ "suitability": "EXCELLENT", "probability": 0.92, "source": "model" }` |
| 200 OK (fallback) | `{ "suitability": "EXCELLENT", "probability": 1.0, "source": "rules" }` |
| 422 Unprocessable Entity | Validation error |

**Model**: RandomForestClassifier (scikit-learn)
**Fallback**: Rule-based classification using same thresholds as backend

---

## Complete API Reference Table

| Method | Endpoint | Auth | Controller | Purpose |
|--------|----------|------|------------|---------|
| GET | /health | No | HealthController | Health check |
| POST | /api/auth/register | No | AuthController | Register user |
| POST | /api/auth/login | No | AuthController | Login, get token |
| GET | /api/auth/me | Yes | AuthController | Get current user |
| POST | /api/farms | Yes | FarmController | Create farm |
| GET | /api/farms | Yes | FarmController | List user's farms |
| GET | /api/farms/{id} | Yes | FarmController | Get farm by ID |
| PUT | /api/farms/{id} | Yes | FarmController | Update farm |
| DELETE | /api/farms/{id} | Yes | FarmController | Delete farm |
| GET | /api/crops | Yes | CropController | List all crops |
| POST | /api/assessments | Yes | AssessmentController | Create assessment |
| GET | /api/assessments | Yes | AssessmentController | List user's assessments |
| GET | /api/assessments/{id} | Yes | AssessmentController | Get assessment by ID |
| POST | /api/assessments/compare | Yes | AssessmentController | Compare crops |
| GET | /api/alerts | Yes | AlertController | Get high-stress alerts |
| GET | /api/reports/{id} | Yes | ReportController | Get detailed report |
| GET | /health (ML) | No | FastAPI | ML service health |
| POST | /predict (ML) | No | FastAPI | ML prediction |

---

## Error Response Format

All error responses follow a consistent format:

```json
{
  "timestamp": "2024-01-15T11:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: name must not be blank; areaHa must be > 0"
}
```

### Common HTTP Status Codes

| Code | Meaning | When Returned |
|------|---------|---------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure, invalid input |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 404 | Not Found | Resource not found or not owned by user |
| 422 | Unprocessable Entity | ML service validation error |
| 429 | Too Many Requests | Auth rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Validation Error Details

### Bean Validation (MethodArgumentNotValidException)
```json
{
  "timestamp": "2024-01-15T11:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "name: name must not be blank; areaHa: areaHa must be > 0"
}
```

### IllegalArgumentException (Business Logic)
```json
{
  "timestamp": "2024-01-15T11:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "horizonDays must be 30, 60, or 90"
}
```

### ResponseStatusException (Controller-Level)
```json
{
  "timestamp": "2024-01-15T11:30:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Farm not found"
}
```

---

## Rate Limiting

### Auth Endpoints Only
- **Endpoints**: `POST /api/auth/login`, `POST /api/auth/register`
- **Limit**: 10 requests/minute per IP (configurable via `AUTH_RATE_LIMIT`)
- **Implementation**: `RateLimitFilter` (sliding window, in-memory)
- **Response**: 429 with JSON error

### Other Endpoints
- No rate limiting applied
- Relies on infrastructure (nginx, cloud load balancer) for DDoS protection

---

## CORS Configuration

```yaml
# application.yml
jalkrishi:
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
```

**Allowed**:
- Origin: Configured frontend URL (default: http://localhost:5173)
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type
- Credentials: true

---

## Request/Response Examples

### Complete Assessment Flow

**1. Login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
# Response: {"token":"eyJhbGciOiJIUzI1NiJ9..."}
```

**2. Create Farm**
```bash
curl -X POST http://localhost:8080/api/farms \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name":"North Field",
    "lat":28.6139,
    "lon":77.2090,
    "areaHa":2.5,
    "soilType":"Loam",
    "storedWaterLitres":50000,
    "groundwaterLitres":100000,
    "storedWaterLitresPerDay":5000,
    "groundwaterLitresPerDay":10000
  }'
```

**3. Run Assessment**
```bash
curl -X POST http://localhost:8080/api/assessments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "farmId":"65a1b2c3d4e5f6789012346",
    "cropId":"65a1b2c3d4e5f6789012347",
    "horizonDays":60
  }'
```

**4. Get Detailed Report**
```bash
curl -X GET http://localhost:8080/api/reports/65a1b2c3d4e5f6789012348 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

**5. Compare Crops**
```bash
curl -X POST http://localhost:8080/api/assessments/compare \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "farmId":"65a1b2c3d4e5f6789012346",
    "cropIds":["crop1","crop2","crop3"],
    "horizonDays":60
  }'
```

---

## API Versioning

Currently **no formal versioning** - all endpoints at root path `/api/`.

**Future Recommendation**: Use URL versioning (`/api/v1/`) for breaking changes.

---

## OpenAPI/Swagger Documentation

**Not currently implemented**. To add:
1. Add `springdoc-openapi-starter-webmvc-ui` dependency
2. Access at `http://localhost:8080/swagger-ui.html`
3. OpenAPI spec at `http://localhost:8080/v3/api-docs`