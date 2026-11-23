# Glossary

## Technical Terms

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - Set of rules allowing software components to communicate |
| **BCrypt** | Password hashing algorithm based on Blowfish cipher, designed to be slow and resistant to brute-force |
| **CI/CD** | Continuous Integration / Continuous Deployment - Automated testing and deployment pipeline |
| **CORS** | Cross-Origin Resource Sharing - Browser security feature controlling cross-domain requests |
| **DTO** | Data Transfer Object - Simple object carrying data between processes/layers |
| **ET0** | Reference Evapotranspiration - Evapotranspiration from a standardized grass reference surface (mm/day) |
| **ETc** | Crop Evapotranspiration - Actual crop water use = ET0 × Kc (mm/day) |
| **FAO-56** | UN Food and Agriculture Organization Paper 56 - Standard for crop water requirements |
| **Hargreaves-Samani** | Empirical equation for estimating ET0 using only temperature data |
| **HS256** | HMAC with SHA-256 - Algorithm for signing JWT tokens |
| **JWT** | JSON Web Token - Compact, URL-safe token format for stateless authentication |
| **Kc** | Crop Coefficient - Ratio of crop ET to reference ET, varies by growth stage |
| **MongoDB** | Document-oriented NoSQL database storing JSON-like documents |
| **MVC** | Model-View-Controller - Architectural pattern separating data, UI, and logic |
| **NoSQL** | Non-relational database not using SQL for queries |
| **ODM** | Object Document Mapper - Maps objects to MongoDB documents (like ORM for SQL) |
| **Open-Meteo** | Free weather API providing forecast and historical data |
| **PWA** | Progressive Web App - Web app with native-like capabilities (offline, install) |
| **Ra** | Extraterrestrial Radiation - Solar radiation at top of atmosphere (MJ/m²/day) |
| **REST** | Representational State Transfer - Architectural style for web APIs using HTTP verbs |
| **SPA** | Single Page Application - Web app loading once, dynamically updating content |
| **Spring Boot** | Java framework for building production-ready Spring applications |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development |
| **Vite** | Next-generation frontend build tool with fast HMR |
| **WebClient** | Spring's reactive HTTP client for non-blocking external API calls |

---

## Project-Specific Terminology

| Term | Definition |
|------|------------|
| **Assessment** | A water budget computation for a specific farm, crop, and time horizon |
| **Balance** | Water supply minus demand (litres); positive = surplus, negative = deficit |
| **Breakdown** | Multi-horizon (30/60/90 day) water budget analysis in a report |
| **Confidence** | Assessment reliability: HIGH (live weather) or LOW (fallback weather) |
| **Crop Stage** | Growth phase with duration (days) and crop coefficient (Kc) |
| **Demand** | Total crop water requirement over horizon (litres) |
| **Effective Rainfall** | Portion of rainfall usable by crop (80% of total in this model) |
| **Farm** | User-defined agricultural plot with location, area, soil, and water resources |
| **Groundwater** | Water available from wells/boreholes (static + daily recharge) |
| **Horizon** | Assessment period: 30, 60, or 90 days |
| **ML Suitability** | Machine learning model's suitability prediction (EXCELLENT/GOOD/RISKY/NOT_RECOMMENDED) |
| **Nominatim** | OpenStreetMap geocoding service for place name search |
| **Owner** | User who created a farm/assessment; enforced ownership checks |
| **peffDailyMm** | Effective daily rainfall in millimeters (0.8 × average daily precipitation) |
| **Ratio** | Supply / Demand ratio; ≥1.0 = sufficient water |
| **Rule-based Suitability** | Deterministic classification using ratio thresholds |
| **Suitability** | Crop-water match classification: EXCELLENT, GOOD, RISKY, NOT_RECOMMENDED |
| **Stored Water** | Water in tanks/ponds (static + daily inflow) |
| **Stress** | Water stress level derived from suitability: LOW, LOW_MODERATE, MODERATE, HIGH |
| **Supply** | Total water available: effective rainfall + stored water + groundwater (litres) |
| **Threshold** | Ratio boundaries for suitability classes (configurable) |

---

## Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| **API** | Application Programming Interface |
| **BCrypt** | Blowfish Crypt |
| **CI** | Continuous Integration |
| **CD** | Continuous Deployment |
| **CORS** | Cross-Origin Resource Sharing |
| **CRUD** | Create, Read, Update, Delete |
| **DTO** | Data Transfer Object |
| **ET0** | Reference Evapotranspiration |
| **ETc** | Crop Evapotranspiration |
| **FAO** | Food and Agriculture Organization |
| **HA** | High Availability |
| **HMR** | Hot Module Replacement |
| **HTTP** | Hypertext Transfer Protocol |
| **HTTPS** | HTTP Secure |
| **ID** | Identifier |
| **IoT** | Internet of Things |
| **IP** | Internet Protocol |
| **JWT** | JSON Web Token |
| **Kc** | Crop Coefficient |
| **ML** | Machine Learning |
| **MVC** | Model-View-Controller |
| **NoSQL** | Not Only SQL |
| **ODM** | Object Document Mapper |
| **PWA** | Progressive Web App |
| **Ra** | Extraterrestrial Radiation |
| **RAM** | Random Access Memory |
| **REST** | Representational State Transfer |
| **SDK** | Software Development Kit |
| **SPA** | Single Page Application |
| **SQL** | Structured Query Language |
| **SSD** | Solid State Drive |
| **SSH** | Secure Shell |
| **SSL** | Secure Sockets Layer |
| **TLS** | Transport Layer Security |
| **TTL** | Time To Live |
| **UI** | User Interface |
| **URL** | Uniform Resource Locator |
| **UTC** | Coordinated Universal Time |
| **UUID** | Universally Unique Identifier |
| **UX** | User Experience |
| **VM** | Virtual Machine |
| **WS** | WebSocket |
| **YAML** | YAML Ain't Markup Language |

---

## Domain Concepts (Agriculture/Water)

| Concept | Explanation |
|---------|-------------|
| **Evapotranspiration (ET)** | Combined process of evaporation from soil and transpiration from plants |
| **Reference Crop** | Hypothetical grass crop (0.12m height, 70s/m resistance) used as ET0 baseline |
| **Crop Coefficient (Kc)** | Factor adjusting ET0 for specific crop and growth stage |
| **Growth Stages** | Initial, Development, Mid-season, Late-season - each with distinct Kc |
| **Effective Rainfall** | Rainfall that infiltrates and is available to crop (not runoff/deep percolation) |
| **Field Capacity** | Maximum water soil can hold against gravity |
| **Wilting Point** | Soil moisture level where plants can no longer extract water |
| **Available Water** | Water between field capacity and wilting point |
| **Irrigation Efficiency** | Ratio of water used by crop to water applied (typically 60-90%) |
| **Water Productivity** | Crop yield per unit of water consumed (kg/m³) |
| **Deficit Irrigation** | Intentionally applying less water than full ETc to save water |
| **Rainfed Agriculture** | Farming relying solely on rainfall, no irrigation |
| **Supplemental Irrigation** | Limited irrigation to supplement rainfall in critical stages |

---

## File/Path Conventions

| Pattern | Meaning |
|---------|---------|
| `src/main/java/...` | Backend production code |
| `src/test/java/...` | Backend test code |
| `src/main/resources/` | Backend config, static files |
| `src/pages/` | Frontend route-level components |
| `src/components/` | Frontend reusable components |
| `src/components/ui/` | Frontend primitive UI components |
| `src/theme/` | Frontend theming (dark/light) |
| `app/main.py` | ML service FastAPI application |
| `train.py` | ML model training script |
| `model.joblib` | Serialized ML model |
| `docker-compose.yml` | Multi-container orchestration |
| `application.yml` | Spring Boot configuration |
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `nginx.conf` | Nginx web server configuration |

---

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Backend | Secret key for signing JWT tokens (min 32 chars) |
| `SPRING_DATA_MONGODB_URI` | Backend | MongoDB connection string |
| `CORS_ORIGIN` | Backend | Allowed frontend origin for CORS |
| `ML_URL` | Backend | ML service base URL |
| `AUTH_RATE_LIMIT` | Backend | Auth requests per minute per IP |
| `VITE_API_URL` | Frontend | Backend API base URL (build-time) |
| `PORT` | All | Server port (default varies by service) |

---

## HTTP Status Codes Used

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 404 | Not Found | Resource not found or not owned |
| 422 | Unprocessable Entity | ML service validation error |
| 429 | Too Many Requests | Auth rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## MongoDB Collections

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `users` | User accounts | `_id`, `email` (unique), `passwordHash`, `name` |
| `farms` | Farm definitions | `_id`, `ownerId`, `name`, `lat`, `lon`, `areaHa`, water fields |
| `crops` | Crop catalog | `_id`, `name`, `stages[]` |
| `assessments` | Assessment results | `_id`, `ownerId`, `farmId`, `cropId`, `ratio`, `suitability`, `stress` |

---

## Suitability Thresholds (Configurable)

| Class | Ratio Range | Stress Level |
|-------|-------------|--------------|
| EXCELLENT | R ≥ 1.0 | LOW |
| GOOD | 0.8 ≤ R < 1.0 | LOW_MODERATE |
| RISKY | 0.6 ≤ R < 0.8 | MODERATE |
| NOT_RECOMMENDED | R < 0.6 | HIGH |

**Defaults in `application.yml`**:
```yaml
jalkrishi:
  suitability:
    excellent: 1.0
    good: 0.8
    risky: 0.6
```

---

## Water Budget Formulas

| Formula | Description |
|---------|-------------|
| `ET0 = 0.0023 × (Tmean + 17.8) × √(Tmax - Tmin) × Ra` | Hargreaves-Samani reference ET |
| `Tmean = (Tmax + Tmin) / 2` | Mean daily temperature |
| `ETc(d) = Kc(stage of day d) × ET0` | Daily crop ET |
| `Demand = Σ ETc(d) × Area(ha) × 10000` | Total demand in litres |
| `Supply = (peffDailyMm × HorizonDays) × Area(ha) × 10000 + StoredWater + Groundwater` | Total supply in litres |
| `Balance = Supply - Demand` | Water balance in litres |
| `Ratio = Supply / Demand` | Suitability ratio |

---

## Default Values (Fallbacks)

| Parameter | Fallback Value | Source |
|-----------|----------------|--------|
| `tmax` | 32.0 °C | `DataService.fallback()` |
| `tmin` | 21.0 °C | `DataService.fallback()` |
| `ra` | 15.0 mm/day | Fixed in `DataService.parse()` |
| `peffDailyMm` | 1.5 mm/day | `DataService.fallback()` |
| `weather.source` | FALLBACK | When Open-Meteo fails |
| `ML source` | rules | When model.joblib missing |
| `JWT expiry` | 120 minutes | `application.yml` |
| `Auth rate limit` | 10/min/IP | `application.yml` |