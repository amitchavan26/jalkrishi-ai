# Application Flow

## Application Startup

### Backend Startup Sequence

```mermaid
sequenceDiagram
    participant Gradle
    participant SpringBoot
    participant Config
    participant MongoDB
    participant CropSeeder
    participant WebClient

    Gradle->>SpringBoot: java -jar backend.jar
    SpringBoot->>Config: Load application.yml
    Config->>SpringBoot: Environment properties
    SpringBoot->>MongoDB: Connect (spring.data.mongodb.uri)
    SpringBoot->>WebClient: Initialize weatherWebClient & mlWebClient
    SpringBoot->>CropSeeder: CommandLineRunner.run()
    CropSeeder->>MongoDB: Check crop count
    alt Crops empty
        CropSeeder->>MongoDB: Insert 8 default crops
    end
    SpringBoot->>SpringBoot: Start Tomcat on port 8080
    SpringBoot-->>Gradle: Application ready
```

### Frontend Startup Sequence

```mermaid
sequenceDiagram
    participant Browser
    participant Nginx
    participant ReactApp
    participant ThemeProvider
    participant ToastProvider
    participant RootSwitch
    participant API

    Browser->>Nginx: GET /
    Nginx->>Browser: index.html + assets
    Browser->>ReactApp: Load React
    ReactApp->>ThemeProvider: Initialize theme from localStorage
    ReactApp->>ToastProvider: Initialize toast context
    ReactApp->>RootSwitch: Check auth token
    RootSwitch->>API: getToken() from localStorage
    alt Token exists
        RootSwitch->>Browser: Navigate to /dashboard
    else No token
        RootSwitch->>Browser: Render Landing page
    end
```

### ML Service Startup Sequence

```mermaid
sequenceDiagram
    participant Docker
    participant Uvicorn
    participant FastAPI
    participant ModelLoader

    Docker->>Uvicorn: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
    Uvicorn->>FastAPI: Create app instance
    FastAPI->>ModelLoader: Load model.joblib on first /predict request
    alt Model file exists
        ModelLoader->>FastAPI: Load RandomForest model
    else Model file missing
        ModelLoader->>FastAPI: Model = null (will use rule fallback)
    end
    FastAPI-->>Uvicorn: App ready
```

## User Registration and Login

### Registration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB

    User->>Frontend: Navigate to /register
    Frontend->>User: Render Register form
    User->>Frontend: Fill name, email, password
    User->>Frontend: Click "Create account"
    Frontend->>Frontend: Client-side validation
    Frontend->>Backend: POST /api/auth/register {name, email, password}
    Backend->>Backend: Validate request (Bean Validation)
    Backend->>MongoDB: findByEmail(email)
    alt Email exists
        MongoDB-->>Backend: User found
        Backend-->>Frontend: 400 {message: "Email already exists"}
        Frontend->>User: Show error
    else Email available
        Backend->>Backend: BCrypt hash password
        Backend->>MongoDB: save(User)
        MongoDB-->>Backend: Saved user with ID
        Backend-->>Frontend: 201 {id, name, email}
        Frontend->>Frontend: setToken() - NO (registration doesn't return token)
        Frontend->>User: Navigate to /login
    end
```

### Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB
    participant JwtService

    User->>Frontend: Navigate to /login
    Frontend->>User: Render Login form
    User->>Frontend: Fill email, password
    User->>Frontend: Click "Log in"
    Frontend->>Frontend: Client-side validation
    Frontend->>Backend: POST /api/auth/login {email, password}
    Backend->>Backend: Rate limit check (RateLimitFilter)
    Backend->>MongoDB: findByEmail(email)
    alt User not found
        MongoDB-->>Backend: null
        Backend-->>Frontend: 401 {message: "Invalid credentials"}
    else User found
        Backend->>Backend: passwordEncoder.matches(raw, hash)
        alt Password mismatch
            Backend-->>Frontend: 401 {message: "Invalid credentials"}
        else Password matches
            Backend->>JwtService: generate(userId, email)
            JwtService->>JwtService: Create JWT (HS256, 120 min expiry)
            JwtService-->>Backend: token string
            Backend-->>Frontend: 200 {token}
            Frontend->>Frontend: setToken(token) in localStorage
            Frontend->>User: Navigate to / (RootSwitch redirects to /dashboard)
        end
    end
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "userId",           // MongoDB ObjectId as string
    "email": "user@example.com",
    "iat": 1699999999,         // Issued at
    "exp": 1700007199          // Expires at (120 minutes)
  },
  "signature": "HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret)"
}
```

### Token Validation Flow (Per Request)

```mermaid
sequenceDiagram
    participant Frontend
    participant JwtAuthFilter
    participant JwtService
    participant SecurityContext

    Frontend->>Backend: Request + Authorization: Bearer <token>
    Backend->>JwtAuthFilter: doFilterInternal()
    JwtAuthFilter->>JwtAuthFilter: Extract token from header
    JwtAuthFilter->>JwtService: isValid(token)
    JwtService->>JwtService: Parse & verify signature
    alt Valid token
        JwtService-->>JwtAuthFilter: true
        JwtAuthFilter->>JwtService: userId(token)
        JwtService-->>JwtAuthFilter: userId string
        JwtAuthFilter->>SecurityContext: setAuthentication(UsernamePasswordAuthenticationToken)
        JwtAuthFilter->>Backend: Continue filter chain
    else Invalid token
        JwtService-->>JwtAuthFilter: false
        JwtAuthFilter->>Backend: Continue filter chain (no auth set)
        Backend->>Backend: SecurityConfig denies access
        Backend-->>Frontend: 401 Unauthorized
    end
```

## Major User Journeys

### Journey 1: Create a Farm

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click "Add farm" or Navigate to /farms]
    B --> C[Farms Page Loads]
    C --> D{Has Farms?}
    D -->|No| E[Empty State: "Add a farm first"]
    D -->|Yes| F[Show Farm Cards]
    E --> G[User fills Farm Form]
    F --> G
    G --> H[Optional: Search Place by Name]
    H --> I[Nominatim API Search]
    I --> J[Select Result -> Auto-fill Lat/Lon]
    G --> K[Optional: Click Map to Pick Location]
    K --> L[Leaflet Map Click -> Auto-fill Lat/Lon]
    G --> M[Optional: Calculate Water from Pump/Tank]
    M --> N[Water Math Calculations]
    G --> O[Submit Form]
    O --> P[POST /api/farms]
    P --> Q{Valid?}
    Q -->|No| R[Show Validation Errors]
    Q -->|Yes| S[Farm Saved]
    S --> T[Toast: "Farm added"]
    T --> U[Form Reset]
    U --> V[Farm List Updated]
```

**API Call**: `POST /api/farms`
```json
{
  "name": "North Field",
  "lat": 28.6139,
  "lon": 77.2090,
  "areaHa": 2.5,
  "soilType": "Loam",
  "storedWaterLitres": 0,
  "groundwaterLitres": 0,
  "storedWaterLitresPerDay": 5000,
  "groundwaterLitresPerDay": 10000,
  "country": "India",
  "state": "Delhi",
  "district": "New Delhi",
  "taluka": "Connaught Place",
  "village": "Central Delhi"
}
```

### Journey 2: Run an Assessment (3-Step Wizard)

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click "Assess a crop" or Navigate to /assess]
    B --> C[Assess Page Loads]
    C --> D[Step 1: Choose Farm]
    D --> E[GET /api/farms]
    E --> F[Select Farm from Dropdown]
    F --> G[Show Farm Summary: Area, Soil, Water Chips]
    G --> H[Click Next]
    H --> I[Step 2: Choose Crop & Period]
    I --> J[GET /api/crops]
    J --> K[Select Crop from Dropdown]
    K --> L[Show Crop Stages & Total Days]
    L --> M[Select Horizon: 30/60/90 days]
    M --> N[Click Next]
    N --> O[Step 3: Review & Run]
    O --> P[Show Summary: Farm, Area, Crop, Period, Water]
    P --> Q[Click "Run assessment"]
    Q --> R[POST /api/assessments]
    R --> S{Success?}
    S -->|No| T[Show Error]
    S -->|Yes| U[Navigate to /assessments/{id}]
    U --> V[Result Page Loads]
```

**API Call**: `POST /api/assessments`
```json
{
  "farmId": "654321abcdef",
  "cropId": "123456abcdef",
  "horizonDays": 60
}
```

**Backend Processing**:
1. Validate farm ownership
2. Validate crop exists
3. Validate horizonDays ∈ {30, 60, 90}
4. Fetch weather for farm location
5. Build WaterBudgetInput with farm water + crop stages
6. Compute water budget (ET0 → ETc → Supply/Demand → Ratio → Suitability)
7. Call ML service for prediction
8. Generate advice
9. Save assessment
10. Return assessment with ID

### Journey 3: View Assessment Result

```mermaid
flowchart TD
    A[User navigates to /assessments/{id}] --> B[Result Page Loads]
    B --> C[GET /api/reports/{id}]
    C --> D{Assessment exists & owned?}
    D -->|No| E[404 Error]
    D -->|Yes| F[Return ReportResponse]
    F --> G[Render Hero Card: Ratio Gauge, Suitability Badge]
    G --> H[Render Water Balance Card: Supply, Demand, Balance]
    H --> I[Render Weather Used Card]
    I --> J[Render Bar Chart: Supply vs Demand (30/60/90)]
    J --> K[Render Breakdown Table]
    K --> L[Render Advice Callout]
    L --> M[Show ML Suggestion if available]
    M --> N[Show Low Confidence Note if FALLBACK weather]
    N --> O[Action Buttons: Download CSV, Print, New Assessment, History, Dashboard]
```

**API Call**: `GET /api/reports/{assessmentId}`

**Response**:
```json
{
  "assessment": {
    "id": "...",
    "farmId": "...",
    "cropId": "...",
    "horizonDays": 60,
    "supplyLitres": 1500000,
    "demandLitres": 1200000,
    "balanceLitres": 300000,
    "ratio": 1.25,
    "suitability": "EXCELLENT",
    "stress": "LOW",
    "confidence": "HIGH",
    "advice": "EXCELLENT: water ratio is 1.25, driven by water supply covers crop demand.",
    "mlUsed": true,
    "mlSuitability": "EXCELLENT",
    "weather": {...},
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "breakdown": [
    {"horizonDays": 30, "supplyLitres": 800000, "demandLitres": 600000, "ratio": 1.33, "suitability": "EXCELLENT"},
    {"horizonDays": 60, "supplyLitres": 1500000, "demandLitres": 1200000, "ratio": 1.25, "suitability": "EXCELLENT"},
    {"horizonDays": 90, "supplyLitres": 2100000, "demandLitres": 1900000, "ratio": 1.11, "suitability": "EXCELLENT"}
  ]
}
```

### Journey 4: Compare Crops

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click "Compare crops" or Navigate to /compare]
    B --> C[Compare Page Loads]
    C --> D[GET /api/farms, GET /api/crops]
    D --> E[Select Farm]
    E --> F[Select Multiple Crops (checkboxes)]
    F --> G[Select Horizon: 30/60/90]
    G --> H[Click "Compare crops"]
    H --> I[POST /api/assessments/compare]
    I --> J{Valid?}
    J -->|No| K[Show Error]
    J -->|Yes| L[Return Sorted Assessments]
    L --> M[Render Cards: Ratio, Suitability, Stress, Bar]
    M --> N[Highlight Winner (Highest Ratio)]
    N --> O[Render Bar Chart Comparison]
    O --> P[Render Comparison Table]
    P --> Q[User can click "View result" for any crop]
```

**API Call**: `POST /api/assessments/compare`
```json
{
  "farmId": "654321abcdef",
  "cropIds": ["crop1", "crop2", "crop3"],
  "horizonDays": 60
}
```

**Key Difference from Single Assessment**: 
- Weather fetched ONCE for all crops
- Assessments NOT saved to database
- Results sorted by ratio descending
- Winner highlighted

### Journey 5: Check Alerts

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click "Alerts" or Navigate to /alerts]
    B --> C[Alerts Page Loads]
    C --> D[GET /api/alerts]
    D --> E[Filter by Stress=HIGH]
    E --> F[Load User Preferences from localStorage]
    F --> G[Filter out Hidden/Snoozed Alerts]
    G --> H[Render Alert Cards]
    H --> I[Each Card: Message, Date, Actions]
    I --> J[Actions: View Result, Hide, Snooze 1 Day]
    J --> K[Hide/Snooze -> Update localStorage]
    K --> L[Toast Confirmation]
    L --> M[UI Updates Immediately]
```

**API Call**: `GET /api/alerts`
- Returns assessments with `stress = HIGH` for current user
- Client-side filtering for hidden/snoozed (stored in localStorage)

### Journey 6: View History

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click "History" or Navigate to /history]
    B --> C[History Page Loads]
    C --> D[GET /api/assessments, /api/farms, /api/crops]
    D --> E[Merge Data: Farm Names, Crop Names]
    E --> F[Render Filter Dropdown: All/Excellent/Good/Risky/Not Recommended]
    F --> G[Render Sortable Table: Date, Farm, Crop, Horizon, Ratio, Suitability]
    G --> H[User can Sort by any column]
    H --> I[User can Filter by Suitability]
    I --> J[Pagination: 10 per page]
    J --> K[Click "View" -> Navigate to /assessments/{id}]
```

## Frontend Events and API Requests

### Event Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Hook/State
    participant API
    participant Backend

    User->>Component: Click/Submit/Change
    Component->>Hook/State: setLoading(true)
    Component->>API: api.get/post/put/delete()
    API->>API: Add Authorization header
    API->>Backend: HTTP Request
    Backend-->>API: HTTP Response
    API-->>Component: Response Data / Error
    alt Success
        Component->>Hook/State: setData(response.data)
        Component->>Hook/State: setLoading(false)
        Component->>User: Re-render with data
    else Error
        Component->>Hook/State: setError(error.message)
        Component->>Hook/State: setLoading(false)
        Component->>User: Show error message
    end
```

### Key API Integration Points

| Page/Component | API Calls | Trigger |
|----------------|-----------|---------|
| **Login** | `POST /api/auth/login` | Form submit |
| **Register** | `POST /api/auth/register` | Form submit |
| **Dashboard** | `GET /api/auth/me`, `GET /api/farms`, `GET /api/assessments`, `GET /api/alerts` | Mount |
| **Farms** | `GET /api/farms`, `POST /api/farms`, `DELETE /api/farms/{id}` | Mount, Form submit, Delete click |
| **Assess** | `GET /api/farms`, `GET /api/crops`, `POST /api/assessments` | Mount, Wizard complete |
| **Result** | `GET /api/reports/{id}` | Mount |
| **Compare** | `GET /api/farms`, `GET /api/crops`, `POST /api/assessments/compare` | Mount, Form submit |
| **Alerts** | `GET /api/alerts` | Mount |
| **History** | `GET /api/assessments`, `GET /api/farms`, `GET /api/crops` | Mount |

## Backend Processing Details

### Water Budget Computation Flow

```mermaid
flowchart TD
    A[WaterBudgetInput] --> B[Validate Inputs]
    B --> C{Valid?}
    C -->|No| D[Throw IllegalArgumentException]
    C -->|Yes| E[Calculate ET0]
    E --> F[Et0Calculator.et0(tmax, tmin, ra)]
    F --> G[Calculate Demand]
    G --> H[Iterate through crop stages for horizonDays]
    H --> I[Sum Kc * ET0 for each day]
    I --> J[Demand = TotalKcDays * ET0 * AreaHa * 10000]
    J --> K[Calculate Supply]
    K --> L[EffectiveRainfall = peffDailyMm * HorizonDays * AreaHa * 10000]
    L --> M[Supply = EffectiveRainfall + StoredWater + Groundwater]
    M --> N[Balance = Supply - Demand]
    N --> O[Ratio = Supply / Demand]
    O --> P[Classify Suitability]
    P --> Q[thresholds: excellent=1.0, good=0.8, risky=0.6]
    Q --> R[Determine Stress from Suitability]
    R --> S[Return WaterBudgetResult]
```

### ET0 Calculation (Hargreaves-Samani)

```java
// Et0Calculator.java
public static double et0(double tmax, double tmin, double ra) {
    if (tmax < tmin) throw new IllegalArgumentException("tmax must be >= tmin");
    if (tmax == tmin) return 0.0;
    double tmean = (tmax + tmin) / 2.0;
    return 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * ra;
}
```

**Formula**: `ET0 = 0.0023 × (Tmean + 17.8) × √(Tmax - Tmin) × Ra`
- `Tmean = (Tmax + Tmin) / 2`
- `Ra` = Extraterrestrial radiation (fixed at 15.0 mm/day equivalent)
- Result in mm/day

### Demand Calculation

```java
// WaterBudgetEngine.calculateDemand()
double totalKcDays = 0.0;
int day = 1;
int stageIndex = 0;
int daysInCurrentStage = 0;

while (day <= horizonDays) {
    if (stageIndex < stages.size()) {
        currentStage = stages.get(stageIndex);
        if (daysInCurrentStage >= currentStage.days()) {
            stageIndex++;
            daysInCurrentStage = 0;
            if (stageIndex < stages.size()) {
                currentStage = stages.get(stageIndex);
            }
        }
    }
    // After last stage, keep using the last stage
    totalKcDays += currentStage.kc();
    daysInCurrentStage++;
    day++;
}

return totalKcDays * et0 * areaHa * 10000;  // Litres
```

### Supply Calculation

```java
// WaterBudgetEngine.calculateSupply()
double effectiveRainfallLitres = (peffDailyMm * horizonDays) * areaHa * 10000;
return effectiveRainfallLitres + storedWaterLitres + groundwaterLitres;
```

### Suitability Classification

```java
// WaterBudgetEngine.classify()
if (ratio >= thresholds.excellent()) return Suitability.EXCELLENT;      // >= 1.0
else if (ratio >= thresholds.good()) return Suitability.GOOD;          // >= 0.8
else if (ratio >= thresholds.risky()) return Suitability.RISKY;        // >= 0.6
else return Suitability.NOT_RECOMMENDED;                               // < 0.6
```

### Stress Mapping

```java
// WaterBudgetEngine.stressFor()
switch (suitability) {
    case EXCELLENT -> Stress.LOW;
    case GOOD -> Stress.LOW_MODERATE;
    case RISKY -> Stress.MODERATE;
    case NOT_RECOMMENDED -> Stress.HIGH;
}
```

## Database Operations

### Assessment Creation (Write)

```mermaid
sequenceDiagram
    participant AssessS[AssessmentService]
    participant AssessR[AssessmentRepository]
    participant MongoDB

    AssessS->>AssessS: Build Assessment object
    AssessS->>AssessR: save(assessment)
    AssessR->>MongoDB: INSERT INTO assessments
    MongoDB-->>AssessR: Saved document with _id
    AssessR-->>AssessS: Assessment with ID
```

### Assessment Queries (Read)

| Query | Method | Use Case |
|-------|--------|----------|
| Find by owner, sort by createdAt desc | `findByOwnerIdOrderByCreatedAtDesc` | Dashboard, History |
| Find by ID and owner | `findByIdAndOwnerId` | Result, Report, Delete |
| Find by owner and stress=HIGH | `findByOwnerIdAndStressOrderByCreatedAtDesc` | Alerts |

## API Responses and Frontend Updates

### Response Format Standards

**Success Response** (2xx):
```json
{
  "id": "...",
  "name": "...",
  ...
}
```

**Error Response** (4xx, 5xx):
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: name must not be blank; areaHa must be > 0"
}
```

### Frontend Error Handling

```javascript
// In api.js interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken()  // Auto-logout on expired token
    }
    return Promise.reject(error)
  }
)

// In components
try {
  const res = await api.post("/api/assessments", data)
  navigate("/assessments/" + res.data.id)
} catch (err) {
  setSaveError(err.response?.data?.message || "Could not run assessment")
}
```

### Loading States

| State | Implementation |
|-------|----------------|
| **Page Load** | `useEffect` with `setLoading(true)`, skeleton screens |
| **Form Submit** | `setSaving(true)`, button disabled, loading spinner |
| **Data Fetch** | `Promise.all` for parallel requests, individual error handling |

## Authentication State Management

```mermaid
stateDiagram-v2
    [*] --> CheckingToken: App Mount
    CheckingToken --> Authenticated: Token in localStorage
    CheckingToken --> Unauthenticated: No token
    
    Authenticated --> Unauthenticated: Logout / 401 Response
    Unauthenticated --> Authenticated: Successful Login
    
    Authenticated --> Authenticated: Token Refresh (not implemented - fixed expiry)
    
    state Authenticated {
        [*] --> Dashboard
        Dashboard --> Farms
        Dashboard --> Assess
        Dashboard --> Compare
        Dashboard --> Alerts
        Dashboard --> History
        Dashboard --> Result
    }
    
    state Unauthenticated {
        [*] --> Landing
        Landing --> Login
        Landing --> Register
        Login --> Register
        Register --> Login
    }
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Where?}
    B -->|Backend| C[GlobalExceptionHandler]
    B -->|Frontend API| D[Axios Interceptor]
    B -->|Frontend UI| E[Component Error Boundary]
    
    C --> F{Exception Type}
    F -->|ResponseStatusException| G[Return status + reason]
    F -->|MethodArgumentNotValidException| H[Return field errors]
    F -->|IllegalArgumentException| I[Return 400 + message]
    F -->|HttpMessageNotReadableException| J[Return 400 Malformed body]
    F -->|Other| K[Return 500 Internal Server Error]
    
    D --> L{Status Code}
    L -->|401| M[Clear Token, Redirect to Login]
    L -->|429| N[Show Rate Limit Message]
    L -->|Other| O[Pass Error to Component]
    
    O --> P[Component Shows Error Message]
    M --> Q[RootSwitch Shows Login]
    N --> P
    K --> P
```