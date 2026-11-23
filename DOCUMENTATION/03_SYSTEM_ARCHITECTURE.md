# System Architecture

## Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Browser / Mobile]
    end

    subgraph "Frontend (React/Vite)"
        FE[Frontend App\nPort 5173/80]
        FE_Router[React Router]
        FE_State[State Management\nReact Context + Hooks]
        FE_API[API Client\nAxios + Interceptors]
        FE_Charts[Chart.js\nVisualizations]
    end

    subgraph "Backend (Spring Boot)"
        BE[Backend API\nPort 8080]
        BE_Auth[Authentication\nJWT + Spring Security]
        BE_Farm[Farm Management]
        BE_Crop[Crop Catalog]
        BE_Assess[Assessment Engine]
        BE_Engine[Water Budget Engine]
        BE_Data[Weather Data Service]
        BE_ML[ML Client]
        BE_Alert[Alerts]
        BE_Report[Reports]
        BE_Repo[MongoDB Repositories]
    end

    subgraph "ML Service (FastAPI)"
        ML[ML Service\nPort 8000]
        ML_Model[RandomForest Model]
        ML_Rules[Rule Fallback]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB 7\nDatabase: jalkrishi)]
        Weather[Open-Meteo API\nWeather Data]
    end

    Browser --> FE
    FE --> FE_Router
    FE_Router --> FE_State
    FE_State --> FE_API
    FE_API --> BE
    
    BE --> BE_Auth
    BE --> BE_Farm
    BE --> BE_Crop
    BE --> BE_Assess
    BE_Assess --> BE_Engine
    BE_Assess --> BE_Data
    BE_Assess --> BE_ML
    BE_Assess --> BE_Repo
    BE --> BE_Alert
    BE --> BE_Report
    BE_Report --> BE_Engine
    
    BE_Data --> Weather
    BE_ML --> ML
    BE_Repo --> MongoDB
    
    ML --> ML_Model
    ML --> ML_Rules
```

## Frontend-Backend Communication

### Protocol
- **HTTP/REST** over JSON
- **Base URL**: `http://localhost:8080` (configurable via `VITE_API_URL`)
- **Authentication**: Bearer JWT token in `Authorization` header

### Request Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MongoDB
    participant WeatherAPI
    participant MLService

    User->>Frontend: Interacts with UI
    Frontend->>Backend: HTTP Request + JWT
    Backend->>Backend: Validate JWT (JwtAuthFilter)
    Backend->>MongoDB: Query/Command
    alt Weather Data Needed
        Backend->>WeatherAPI: GET /v1/forecast
        WeatherAPI-->>Backend: Weather JSON
    end
    alt ML Prediction Needed
        Backend->>MLService: POST /predict
        MLService-->>Backend: Suitability + Probability
    end
    Backend-->>Frontend: JSON Response
    Frontend->>User: Update UI
```

### API Client Implementation (`frontend/src/api.js`)
```javascript
// Axios instance with base URL from env
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
})

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken()  // Clear invalid token
    }
    return Promise.reject(error)
  }
)
```

## Internal Module Connections

### Backend Module Dependency Graph

```mermaid
graph LR
    subgraph "Controllers"
        AuthC[AuthController]
        FarmC[FarmController]
        CropC[CropController]
        AssessC[AssessmentController]
        AlertC[AlertController]
        ReportC[ReportController]
        HealthC[HealthController]
    end

    subgraph "Services"
        AuthS[AuthService*]
        FarmS[FarmService*]
        AssessS[AssessmentService]
        RecS[RecommendationService]
        DataS[DataService]
        MlC[MlClient]
    end

    subgraph "Engines/Utils"
        WBE[WaterBudgetEngine]
        ET0[Et0Calculator]
        Thresh[SuitabilityThresholds]
    end

    subgraph "Repositories"
        UserR[UserRepository]
        FarmR[FarmRepository]
        CropR[CropRepository]
        AssessR[AssessmentRepository]
    end

    subgraph "Config"
        SecCfg[SecurityConfig]
        CorsCfg[CorsConfig]
        WCfg[WebClientConfig]
        RateL[RateLimitFilter]
        EngCfg[EngineConfig]
        ExcH[GlobalExceptionHandler]
    end

    AuthC --> UserR
    AuthC --> JwtS[JwtService]
    AuthC --> PwdEnc[PasswordEncoder]
    
    FarmC --> FarmR
    FarmC --> FarmReq[FarmRequest]
    
    CropC --> CropR
    
    AssessC --> AssessS
    AssessC --> AssessR
    AssessC --> FarmR
    AssessC --> CropR
    AssessC --> DataS
    
    AssessS --> FarmR
    AssessS --> CropR
    AssessS --> DataS
    AssessS --> WBE
    AssessS --> AssessR
    AssessS --> RecS
    AssessS --> MlC
    
    WBE --> ET0
    WBE --> Thresh
    EngCfg --> Thresh
    EngCfg --> WBE
    
    DataS --> WCfg[weatherWebClient]
    MlC --> WCfg[mlWebClient]
    
    AlertC --> AssessR
    AlertC --> RecS
    
    ReportC --> AssessR
    ReportC --> FarmR
    ReportC --> CropR
    ReportC --> WBE
    ReportC --> DataS
    
    SecCfg --> JwtAuthFilter
    JwtAuthFilter --> JwtS
    
    ExcH -.-> All[All Controllers]
```

*Services marked with * are implicit in controllers (no separate service class)

### Key Internal Flows

#### 1. Assessment Creation Flow
```mermaid
sequenceDiagram
    participant Client
    participant AssessC[AssessmentController]
    participant AssessS[AssessmentService]
    participant FarmR[FarmRepository]
    participant CropR[CropRepository]
    participant DataS[DataService]
    participant WBE[WaterBudgetEngine]
    participant MlC[MlClient]
    participant AssessR[AssessmentRepository]

    Client->>AssessC: POST /api/assessments {farmId, cropId, horizonDays}
    AssessC->>AssessS: create(userId, request)
    AssessS->>FarmR: findByIdAndOwnerId(farmId, userId)
    AssessS->>CropR: findById(cropId)
    AssessS->>DataS: getWeather(lat, lon)
    DataS-->>AssessS: WeatherData (LIVE or FALLBACK)
    AssessS->>WBE: compute(WaterBudgetInput)
    WBE-->>AssessS: WaterBudgetResult
    AssessS->>MlC: predict(ratio, tmax, tmin, peffDailyMm)
    MlC-->>AssessS: Optional<String> mlSuitability
    AssessS->>AssessR: save(Assessment)
    AssessS-->>AssessC: Assessment
    AssessC-->>Client: 201 AssessmentResponse
```

#### 2. Crop Comparison Flow
```mermaid
sequenceDiagram
    participant Client
    participant AssessC[AssessmentController]
    participant FarmR[FarmRepository]
    participant CropR[CropRepository]
    participant DataS[DataService]
    participant AssessS[AssessmentService]

    Client->>AssessC: POST /api/assessments/compare {farmId, cropIds[], horizonDays}
    AssessC->>FarmR: findByIdAndOwnerId(farmId, userId)
    AssessC->>CropR: findById for each cropId
    AssessC->>DataS: getWeather(lat, lon)  // ONCE for all crops
    DataS-->>AssessC: WeatherData
    loop For each crop
        AssessC->>AssessS: compute(userId, farm, crop, horizonDays, weather)
        AssessS->>WBE: compute(WaterBudgetInput)
        WBE-->>AssessS: WaterBudgetResult
        AssessS-->>AssessC: Assessment (not saved)
    end
    AssessC->>AssessC: Sort by ratio descending
    AssessC-->>Client: 200 List<AssessmentResponse>
```

## External Service Integrations

### 1. Open-Meteo Weather API
- **Purpose**: Live weather data (temperature max/min, precipitation)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Parameters**: latitude, longitude, daily=temperature_2m_max,temperature_2m_min,precipitation_sum, forecast_days=16
- **Authentication**: None required (free tier)
- **Timeout**: 5s connect, 10s read
- **Fallback**: Static values (tmax=32, tmin=21, ra=15, peffDailyMm=1.5)

```mermaid
sequenceDiagram
    participant DataS[DataService]
    participant OpenMeteo[Open-Meteo API]
    
    DataS->>OpenMeteo: GET /v1/forecast?lat=X&lon=Y&daily=...
    alt Success
        OpenMeteo-->>DataS: 200 JSON with daily arrays
        DataS->>DataS: Parse averages, compute peffDailyMm = 0.8 * precipitationAvg
        DataS-->>Caller: WeatherData(source=LIVE)
    else Failure (timeout, error, parse error)
        DataS-->>Caller: WeatherData(source=FALLBACK)
    end
```

### 2. ML Prediction Service
- **Purpose**: ML-enhanced suitability prediction
- **Endpoint**: `http://ml-service:8000/predict` (internal Docker network)
- **Request**: `{ratio, tmax, tmin, peffDailyMm}`
- **Response**: `{suitability, probability, source: "model"|"rules"}`
- **Timeout**: 3 seconds
- **Fallback**: Rule-based classification if model unavailable or error

```mermaid
sequenceDiagram
    participant MlC[MlClient]
    participant ML[ML Service]
    
    MlC->>ML: POST /predict {ratio, tmax, tmin, peffDailyMm}
    alt Model loaded
        ML->>ML: model.predict(X)
        ML-->>MlC: {suitability, probability, source: "model"}
    else Model not found / error
        ML->>ML: rule_label_for(ratio)
        ML-->>MlC: {suitability, probability: 1.0, source: "rules"}
    end
```

### 3. MongoDB
- **Purpose**: Primary data persistence
- **Connection**: `mongodb://mongo:27017` (Docker) or `mongodb://localhost:27017` (local)
- **Database**: `jalkrishi`
- **Collections**: users, farms, crops, assessments
- **ODM**: Spring Data MongoDB

### 4. Nominatim (OpenStreetMap) - Frontend Only
- **Purpose**: Geocoding for farm location search
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Parameters**: q (query), format=jsonv2, limit=5
- **Rate Limit**: 1 request/second (enforced by client-side delay)
- **Authentication**: None

## Architecture Diagrams

### Component Diagram (Deployment View)

```mermaid
graph TB
    subgraph "Docker Network"
        subgraph "Frontend Container"
            Nginx[Nginx :80]
            ReactApp[React SPA]
        end
        
        subgraph "Backend Container"
            SpringBoot[Spring Boot :8080]
        end
        
        subgraph "ML Container"
            FastAPI[FastAPI :8000]
            Model[model.joblib]
        end
        
        subgraph "Mongo Container"
            MongoDB[(MongoDB :27017)]
            Volume[(mongo_data volume)]
        end
    end
    
    User[User Browser] --> Nginx
    Nginx --> ReactApp
    ReactApp --> SpringBoot
    SpringBoot --> MongoDB
    SpringBoot --> FastAPI
    SpringBoot --> OpenMeteo[Open-Meteo API]
    ReactApp --> Nominatim[Nominatim API]
    MongoDB --> Volume
    FastAPI --> Model
```

### Data Flow Diagram

```mermaid
flowchart TD
    subgraph "User Actions"
        A1[Register/Login]
        A2[Create Farm]
        A3[Run Assessment]
        A4[Compare Crops]
        A5[View Report]
        A6[Check Alerts]
        A7[View History]
    end
    
    subgraph "Frontend State"
        S1[Auth Token\nlocalStorage]
        S2[Farms List]
        S3[Crops List]
        S4[Assessments List]
        S5[Alert Prefs\nlocalStorage]
        S6[Theme\nlocalStorage]
    end
    
    subgraph "Backend Processing"
        B1[Validate JWT]
        B2[Ownership Check]
        B3[Fetch Weather]
        B4[Compute Water Budget]
        B5[ML Prediction]
        B6[Persist Assessment]
        B7[Generate Advice]
        B8[Multi-Horizon Breakdown]
    end
    
    subgraph "Data Stores"
        D1[(Users)]
        D2[(Farms)]
        D3[(Crops)]
        D4[(Assessments)]
        D5[Weather Cache\n(In-Memory)]
    end
    
    A1 --> B1
    B1 --> D1
    D1 --> S1
    
    A2 --> B1
    B1 --> B2
    B2 --> D2
    D2 --> S2
    
    A3 --> B1
    B1 --> B2
    B2 --> D2
    B2 --> D3
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B5 --> B6
    B6 --> B7
    B6 --> D4
    D4 --> S4
    
    A4 --> B1
    B1 --> B2
    B2 --> D2
    B2 --> D3
    B2 --> B3
    B3 --> B4
    B4 --> D4
    D4 --> S4
    
    A5 --> B1
    B1 --> B2
    B2 --> D4
    B2 --> D2
    B2 --> D3
    B2 --> B8
    B8 --> S4
    
    A6 --> B1
    B1 --> D4
    D4 --> S4
    S5 --> S4
    
    A7 --> B1
    B1 --> D4
    D4 --> S4
```

## Communication Patterns

| Pattern | Used For | Implementation |
|---------|----------|----------------|
| **Request-Response** | All API calls | REST over HTTP/JSON |
| **Reactive Streams** | External API calls | Spring WebClient (Project Reactor) |
| **Stateless Auth** | Authentication | JWT in Authorization header |
| **Client-Side State** | UI state, preferences | React useState, useContext, localStorage |
| **Server-Side Sessions** | None (stateless) | N/A |
| **WebSockets** | None | N/A |
| **Event-Driven** | None | N/A |

## Security Boundaries

```mermaid
graph LR
    subgraph "Public Internet"
        User[User Browser]
        OpenMeteo[Open-Meteo API]
        Nominatim[Nominatim API]
    end
    
    subgraph "DMZ / Public"
        FE[Frontend :5173/80]
    end
    
    subgraph "Private Network (Docker)"
        BE[Backend :8080]
        ML[ML Service :8000]
        DB[(MongoDB :27017)]
    end
    
    User --> FE
    FE --> BE
    FE --> Nominatim
    BE --> ML
    BE --> DB
    BE --> OpenMeteo
    
    style FE fill:#e1f5fe
    style BE fill:#fff3e0
    style ML fill:#fff3e0
    style DB fill:#fce4ec
```

- **Frontend**: Served by Nginx, accessible publicly
- **Backend**: Only accessible via frontend (CORS restricted to frontend origin)
- **ML Service**: Internal only (no external exposure)
- **MongoDB**: Internal only (no external exposure)
- **External APIs**: Called from backend (weather) and frontend (geocoding)

## Scalability Considerations

| Component | Scaling Strategy |
|-----------|------------------|
| **Frontend** | Static files on CDN, horizontal scaling via load balancer |
| **Backend** | Stateless, horizontal scaling; connection pooling for MongoDB and HTTP clients |
| **ML Service** | Horizontal scaling; model loaded in memory per instance |
| **MongoDB** | Replica set for HA, sharding for large datasets |
| **Weather API** | Cached responses (16-day forecast), rate limiting respected |
| **Rate Limiting** | In-memory sliding window (per IP) for auth endpoints |

## Technology Choices Rationale

| Decision | Rationale |
|----------|-----------|
| **Spring Boot** | Mature ecosystem, strong MongoDB support, excellent security framework |
| **MongoDB** | Flexible schema for varying farm/assessment data, geospatial queries ready |
| **React + Vite** | Fast development, small bundle, modern tooling |
| **Tailwind CSS** | Rapid UI development, consistent design system, dark mode support |
| **Chart.js** | Lightweight, responsive charts, good React integration |
| **FastAPI** | High performance, automatic OpenAPI docs, easy ML model serving |
| **JWT** | Stateless, scalable, no server-side session storage |
| **Docker Compose** | Simple local development and production deployment |