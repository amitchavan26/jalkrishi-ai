# Backend Deep Dive

## Backend Architecture Overview

The backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Controllers (REST)                      │
│  AuthController │ FarmController │ CropController │ ...     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       Services (Business Logic)              │
│  AssessmentService │ RecommendationService │ MlClient       │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Repositories │ │    Engines    │ │ External APIs │
│ (Data Access) │ │ (Computation) │ │  (Clients)    │
└───────────────┘ └───────────────┘ └───────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐       ┌──────────┐       ┌──────────┐
   │ MongoDB │       │  Pure    │       │Open-Meteo│
   │         │       │  Java    │       │  ML Svc  │
   └─────────┘       └──────────┘       └──────────┘
```

---

## Controllers and Responsibilities

### AuthController (`/api/auth`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| POST | `/register` | Validate input, check email uniqueness, hash password, save user |
| POST | `/login` | Validate credentials, generate JWT token |
| GET | `/me` | Return current user from security context |

**Dependencies**: `UserRepository`, `PasswordEncoder`, `JwtService`

### FarmController (`/api/farms`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| POST | `/` | Create farm with ownership |
| GET | `/` | List user's farms |
| GET | `/{id}` | Get farm by ID (ownership check) |
| PUT | `/{id}` | Update farm (ownership check) |
| DELETE | `/{id}` | Delete farm (ownership check) |

**Dependencies**: `FarmRepository`

**Key Pattern**: All methods extract `userId` from `Authentication` principal and verify ownership via `findByIdAndOwnerId()`.

### CropController (`/api/crops`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| GET | `/` | Return all crops with stages |

**Dependencies**: `CropRepository`

### AssessmentController (`/api/assessments`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| POST | `/` | Create assessment (saved) |
| GET | `/` | List user's assessments |
| GET | `/{id}` | Get assessment by ID |
| POST | `/compare` | Compare crops (not saved) |

**Dependencies**: `AssessmentService`, `AssessmentRepository`, `FarmRepository`, `CropRepository`, `DataService`

### AlertController (`/api/alerts`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| GET | `/` | Get HIGH stress assessments for user |

**Dependencies**: `AssessmentRepository`

### ReportController (`/api/reports`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| GET | `/{assessmentId}` | Generate multi-horizon breakdown report |

**Dependencies**: `AssessmentRepository`, `FarmRepository`, `CropRepository`, `WaterBudgetEngine`, `DataService`

### HealthController (`/health`)
| Method | Endpoint | Responsibility |
|--------|----------|----------------|
| GET | `/health` | Return `{ "status": "UP" }` |

---

## Services and Business Logic

### AssessmentService
**Primary service for assessment orchestration**

```java
@Service
public class AssessmentService {
    // Dependencies injected via constructor
    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final DataService dataService;
    private final WaterBudgetEngine waterBudgetEngine;
    private final AssessmentRepository assessmentRepository;
    private final RecommendationService recommendationService;
    private final MlClient mlClient;
    
    // Two main methods:
    // 1. create() - Full flow with persistence and ML
    // 2. compute() - Pure computation (used by compare)
}
```

#### `create(userId, AssessmentRequest)` - Full Assessment Flow
```java
public Assessment create(String userId, AssessmentRequest req) {
    // 1. Validate farm ownership
    Farm farm = farmRepository.findByIdAndOwnerId(req.farmId(), userId);
    
    // 2. Validate crop exists
    Crop crop = cropRepository.findById(req.cropId()).orElse(null);
    
    // 3. Validate horizonDays (30, 60, 90)
    
    // 4. Fetch weather
    WeatherData weather = dataService.getWeather(farm.getLat(), farm.getLon());
    
    // 5. Compute assessment (delegates to compute())
    Assessment assessment = compute(userId, farm, crop, req.horizonDays(), weather);
    
    // 6. Call ML service (only in create, not compare)
    Optional<String> mlSuitabilityOpt = mlClient.predict(
        assessment.getRatio(), 
        weather.tmax(), 
        weather.tmin(), 
        weather.peffDailyMm()
    );
    if (mlSuitabilityOpt.isPresent()) {
        assessment.setMlUsed(true);
        assessment.setMlSuitability(mlSuitabilityOpt.get());
    }
    
    // 7. Save and return
    return assessmentRepository.save(assessment);
}
```

#### `compute(userId, farm, crop, horizonDays, weather)` - Pure Computation
```java
public Assessment compute(String userId, Farm farm, Crop crop, int horizonDays, WeatherData weather) {
    // 1. Build stage inputs from crop
    List<StageInput> stageInputs = crop.getStages().stream()
        .map(s -> new StageInput(s.getName(), s.getDays(), s.getKc()))
        .collect(Collectors.toList());
    
    // 2. Calculate total water (static + daily * horizon)
    double storedWaterLitres = farm.getStoredWaterLitres();
    double groundwaterLitres = farm.getGroundwaterLitres();
    storedWaterLitres += (farm.getStoredWaterLitresPerDay() ?? 0) * horizonDays;
    groundwaterLitres += (farm.getGroundwaterLitresPerDay() ?? 0) * horizonDays;
    
    // 3. Build WaterBudgetInput
    WaterBudgetInput input = new WaterBudgetInput(
        weather.tmax(), weather.tmin(), weather.ra(), weather.peffDailyMm(),
        farm.getAreaHa(), storedWaterLitres, groundwaterLitres,
        stageInputs, horizonDays
    );
    
    // 4. Compute water budget
    WaterBudgetResult result = waterBudgetEngine.compute(input);
    
    // 5. Determine confidence
    Confidence confidence = weather.source() == WeatherSource.LIVE ? Confidence.HIGH : Confidence.LOW;
    
    // 6. Build WeatherSnapshot
    WeatherSnapshot weatherSnapshot = new WeatherSnapshot(...);
    
    // 7. Create assessment (not saved)
    Assessment assessment = new Assessment(
        userId, farm.getId(), crop.getId(), horizonDays,
        result.supplyLitres(), result.demandLitres(), result.balanceLitres(), result.ratio(),
        result.suitability(), result.stress(), confidence,
        null, false, null, weatherSnapshot
    );
    
    // 8. Generate advice
    double storedPlusGroundwater = storedWaterLitres + groundwaterLitres;
    assessment.setAdvice(recommendationService.advice(result, storedPlusGroundwater));
    
    return assessment;
}
```

### RecommendationService
**Generates human-readable advice based on water budget result**

```java
@Service
public class RecommendationService {
    public String advice(WaterBudgetResult result, double storedPlusGroundwaterLitres) {
        String factor;
        double ratio = result.ratio();
        
        if (ratio >= 1.0) {
            factor = "water supply covers crop demand";
        } else if (result.et0() >= 5.0) {
            factor = "high evapotranspiration demand";
        } else if (storedPlusGroundwaterLitres < 0.2 * result.demandLitres()) {
            factor = "low stored water and groundwater";
        } else {
            factor = "low effective rainfall";
        }
        
        String suitability = result.suitability().name();
        String formattedRatio = String.format(Locale.ROOT, "%.2f", ratio);
        
        return suitability + ": water ratio is " + formattedRatio + ", driven by " + factor + ".";
    }
}
```

### MlClient
**Calls ML prediction service with resilience**

```java
@Component
public class MlClient {
    private final WebClient webClient; // Qualified as "mlWebClient"
    
    public Optional<String> predict(double ratio, double tmax, double tmin, double peffDailyMm) {
        try {
            Map<String, Object> requestBody = Map.of(
                "ratio", ratio, "tmax", tmax, "tmin", tmin, "peffDailyMm", peffDailyMm
            );
            
            Map<String, Object> response = webClient.post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block(Duration.ofSeconds(3)); // 3-second timeout
            
            if (response != null) {
                Object suitability = response.get("suitability");
                if (suitability instanceof String str && !str.isBlank()) {
                    return Optional.of(str);
                }
            }
            return Optional.empty();
        } catch (WebClientResponseException | WebClientRequestException e) {
            log.error("ML API error: {}", e.getMessage());
            return Optional.empty();
        } catch (Exception e) {
            log.error("ML API unexpected error: {}", e.getMessage(), e);
            return Optional.empty();
        }
    }
}
```

### DataService
**Fetches weather data from Open-Meteo with fallback**

```java
@Service
public class DataService {
    private final WebClient webClient; // Qualified as "weatherWebClient"
    
    public WeatherData getWeather(double lat, double lon) {
        try {
            String json = webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/v1/forecast")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("daily", "temperature_2m_max,temperature_2m_min,precipitation_sum")
                    .queryParam("forecast_days", 16)
                    .queryParam("timezone", "auto")
                    .build())
                .retrieve()
                .bodyToMono(String.class)
                .block(Duration.ofSeconds(5));
            return parse(json);
        } catch (Exception e) {
            log.error("Weather API error: {}", e.getMessage());
            return fallback();
        }
    }
    
    public static WeatherData parse(String json) {
        // Parses daily arrays, computes averages
        // peffDailyMm = 0.8 * precipitationAvg
        // ra = 15.0 (fixed)
        return new WeatherData(tmax, tmin, ra, peffDailyMm, WeatherSource.LIVE);
    }
    
    public static WeatherData fallback() {
        return new WeatherData(32.0, 21.0, 15.0, 1.5, WeatherSource.FALLBACK);
    }
}
```

---

## Repository/DAO Layer

All repositories extend `MongoRepository<Entity, String>` providing:
- `save(entity)` - Insert or update
- `findById(id)` - Find by ObjectId
- `findAll()` - All documents
- `delete(entity)` - Delete
- Custom query methods

### UserRepository
```java
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);  // Unique index lookup
}
```

### FarmRepository
```java
public interface FarmRepository extends MongoRepository<Farm, String> {
    List<Farm> findByOwnerId(String ownerId);           // User's farms
    Farm findByIdAndOwnerId(String id, String ownerId); // Ownership check
}
```

### CropRepository
```java
public interface CropRepository extends MongoRepository<Crop, String> {
    List<Crop> findAll();  // All crops (only 8)
}
```

### AssessmentRepository
```java
public interface AssessmentRepository extends MongoRepository<Assessment, String> {
    List<Assessment> findByOwnerIdOrderByCreatedAtDesc(String ownerId);  // History
    Assessment findByIdAndOwnerId(String id, String ownerId);             // Secure get
    List<Assessment> findByOwnerIdAndStressOrderByCreatedAtDesc(String ownerId, Stress stress); // Alerts
}
```

---

## Models and Entities

### Core Domain Models

#### User
```java
@Document(collection = "users")
public class User {
    @Id private String id;
    private String name;
    @Indexed(unique = true) private String email;
    private String passwordHash;
    private Instant createdAt = Instant.now();
    // Getters, setters, constructors
}
```

#### Farm
```java
@Document(collection = "farms")
public class Farm {
    @Id private String id;
    @Indexed private String ownerId;
    
    @NotBlank private String name;
    @NotNull @Min(-90) @Max(90) private Double lat;
    @NotNull @Min(-180) @Max(180) private Double lon;
    @NotNull @Positive private Double areaHa;
    private String soilType;
    @NotNull @PositiveOrZero private Double storedWaterLitres;
    @NotNull @PositiveOrZero private Double groundwaterLitres;
    @Size(max = 100) private String country, state, district, taluka, village;
    @NotNull @PositiveOrZero private Double storedWaterLitresPerDay = 0.0;
    @NotNull @PositiveOrZero private Double groundwaterLitresPerDay = 0.0;
    private Instant createdAt = Instant.now();
}
```

#### Crop
```java
@Document(collection = "crops")
public class Crop {
    @Id private String id;
    private String name;
    private List<Stage> stages;
    
    public static class Stage {
        private String name;
        private int days;
        private double kc;
    }
}
```

#### Assessment
```java
@Document(collection = "assessments")
public class Assessment {
    @Id private String id;
    @Indexed private String ownerId;
    private String farmId, cropId;
    private int horizonDays;
    private double supplyLitres, demandLitres, balanceLitres, ratio;
    private Suitability suitability;
    private Stress stress;
    private Confidence confidence;
    private String advice;
    private boolean mlUsed;
    private String mlSuitability;
    private WeatherSnapshot weather;
    private Instant createdAt = Instant.now();
}
```

### Enums

```java
public enum Suitability { EXCELLENT, GOOD, RISKY, NOT_RECOMMENDED }
public enum Stress { LOW, LOW_MODERATE, MODERATE, HIGH }
public enum Confidence { HIGH, LOW }
public enum WeatherSource { LIVE, FALLBACK }
```

### DTOs / Records

#### Request DTOs
```java
// FarmRequest - mirrors Farm fields with validation
public class FarmRequest { ... }

// AssessmentRequest - minimal input
public record AssessmentRequest(
    @NotBlank String farmId,
    @NotBlank String cropId,
    int horizonDays
) {}

// CompareRequest - for multi-crop comparison
public record CompareRequest(
    @NotBlank String farmId,
    @NotBlank List<String> cropIds,
    int horizonDays
) {}

// Auth DTOs
public record RegisterRequest(String name, String email, String password) {}
public record LoginRequest(String email, String password) {}
```

#### Response DTOs
```java
// AssessmentResponse - full assessment data for API
public record AssessmentResponse(
    String id, String farmId, String cropId, int horizonDays,
    double supplyLitres, double demandLitres, double balanceLitres, double ratio,
    Suitability suitability, Stress stress, Confidence confidence,
    String advice, boolean mlUsed, String mlSuitability,
    WeatherSnapshot weather, Instant createdAt
) {
    public static AssessmentResponse from(Assessment a) { ... }
}

// WeatherSnapshot - embedded in assessment
public record WeatherSnapshot(double tmax, double tmin, double ra, double peffDailyMm, String source) {}

// ReportResponse - assessment + multi-horizon breakdown
public record ReportResponse(AssessmentResponse assessment, List<BreakdownRow> breakdown) {}

// BreakdownRow - single horizon in report
public record BreakdownRow(int horizonDays, double supplyLitres, double demandLitres, double ratio, Suitability suitability) {}

// AlertResponse - for alerts endpoint
public record AlertResponse(String assessmentId, String farmId, String cropId, String message, Instant createdAt) {}
```

---

## Engine Layer (Pure Computation)

### WaterBudgetEngine
**Core water budget computation - no external dependencies**

```java
public class WaterBudgetEngine {
    private final SuitabilityThresholds thresholds;
    
    public WaterBudgetResult compute(WaterBudgetInput input) {
        // Validate inputs
        // Calculate ET0
        double et0 = Et0Calculator.et0(input.tmax(), input.tmin(), input.ra());
        
        // Calculate demand
        double demand = calculateDemand(input, et0);
        
        // Calculate supply
        double supply = calculateSupply(input);
        
        // Derive results
        double balance = supply - demand;
        double ratio = supply / demand;
        Suitability suitability = classify(ratio);
        Stress stress = stressFor(suitability);
        
        return new WaterBudgetResult(supply, demand, balance, ratio, suitability, stress, et0);
    }
    
    private double calculateDemand(WaterBudgetInput input, double et0) {
        // Iterate through days, cycling through crop stages
        // Sum Kc for each day
        // Demand = totalKcDays * et0 * areaHa * 10000
    }
    
    private double calculateSupply(WaterBudgetInput input) {
        // Supply = (peffDailyMm * horizonDays) * areaHa * 10000 + storedWater + groundwater
    }
    
    public Suitability classify(double ratio) {
        if (ratio >= thresholds.excellent()) return Suitability.EXCELLENT;
        else if (ratio >= thresholds.good()) return Suitability.GOOD;
        else if (ratio >= thresholds.risky()) return Suitability.RISKY;
        else return Suitability.NOT_RECOMMENDED;
    }
    
    public Stress stressFor(Suitability s) {
        return switch (s) {
            case EXCELLENT -> Stress.LOW;
            case GOOD -> Stress.LOW_MODERATE;
            case RISKY -> Stress.MODERATE;
            case NOT_RECOMMENDED -> Stress.HIGH;
        };
    }
}
```

### Et0Calculator
**Hargreaves-Samani reference evapotranspiration**

```java
public class Et0Calculator {
    /**
     * ET0 = 0.0023 * (Tmean + 17.8) * sqrt(Tmax - Tmin) * Ra
     * Tmean = (Tmax + Tmin) / 2
     * Ra = extraterrestrial radiation (mm/day equivalent)
     */
    public static double et0(double tmax, double tmin, double ra) {
        if (tmax < tmin) throw new IllegalArgumentException("tmax must be >= tmin");
        if (tmax == tmin) return 0.0;
        double tmean = (tmax + tmin) / 2.0;
        return 0.0023 * (tmean + 17.8) * Math.sqrt(tmax - tmin) * ra;
    }
}
```

### Configuration-Driven Thresholds
```java
@ConfigurationProperties(prefix = "jalkrishi.suitability")
public record SuitabilityThresholds(double excellent, double good, double risky) {}

// Default values in application.yml:
// jalkrishi.suitability.excellent: 1.0
// jalkrishi.suitability.good: 0.8
// jalkrishi.suitability.risky: 0.6
```

---

## Middleware and Filters

### JwtAuthFilter (OncePerRequestFilter)
```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isValid(token)) {
                String userId = jwtService.userId(token);
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

### RateLimitFilter (OncePerRequestFilter)
```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    @Value("${jalkrishi.ratelimit.auth-per-minute:10}") private int limit;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        // Only applies to POST /api/auth/login and POST /api/auth/register
        // Sliding window per IP
        // Returns 429 if limit exceeded
    }
}
```

### GlobalExceptionHandler (@RestControllerAdvice)
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(...) { ... }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(...) { ... }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(...) { ... }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(...) { ... }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(...) { ... }
}
```

**Error Response Format**:
```json
{
  "timestamp": "2024-01-15T11:30:00.123Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: name must not be blank"
}
```

---

## Authentication Implementation

### SecurityConfig
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/register", "/api/auth/login", "/health").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### JwtService
```java
@Service
public class JwtService {
    private final SecretKey key;
    private final long expiryMinutes;
    
    public JwtService(@Value("${jalkrishi.jwt.secret}") String secret, 
                      @Value("${jalkrishi.jwt.expiryMinutes}") long expiryMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMinutes = expiryMinutes;
    }
    
    public String generate(String userId, String email) {
        long expiryMs = expiryMinutes * 60 * 1000;
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiryMs);
        return Jwts.builder()
            .subject(userId)
            .claim("email", email)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(key)
            .compact();
    }
    
    public boolean isValid(String token) { ... }
    public String userId(String token) { ... }
}
```

**Token Claims**:
- `sub`: User ID (MongoDB ObjectId as string)
- `email`: User email
- `iat`: Issued at
- `exp`: Expiration (default 120 minutes)

---

## Dependency Injection

All dependencies wired via **constructor injection** (Spring best practice):

```java
// Controller example
@RestController
@RequestMapping("/api/farms")
public class FarmController {
    private final FarmRepository farmRepository;
    
    public FarmController(FarmRepository farmRepository) {
        this.farmRepository = farmRepository;
    }
    // ...
}

// Service example
@Service
public class AssessmentService {
    private final FarmRepository farmRepository;
    private final CropRepository cropRepository;
    private final DataService dataService;
    private final WaterBudgetEngine waterBudgetEngine;
    private final AssessmentRepository assessmentRepository;
    private final RecommendationService recommendationService;
    private final MlClient mlClient;
    
    public AssessmentService(FarmRepository farmRepository,
                            CropRepository cropRepository,
                            DataService dataService,
                            WaterBudgetEngine waterBudgetEngine,
                            AssessmentRepository assessmentRepository,
                            RecommendationService recommendationService,
                            MlClient mlClient) {
        this.farmRepository = farmRepository;
        this.cropRepository = cropRepository;
        this.dataService = dataService;
        this.waterBudgetEngine = waterBudgetEngine;
        this.assessmentRepository = assessmentRepository;
        this.recommendationService = recommendationService;
        this.mlClient = mlClient;
    }
}
```

**Configuration Classes** (in `com.jalkrishi.config`):
- `SecurityConfig` - Security filter chain, password encoder
- `CorsConfig` - CORS configuration
- `WebClientConfig` - Two WebClient beans (weather, ML) with connection pooling
- `EngineConfig` - WaterBudgetEngine bean with SuitabilityThresholds
- `RateLimitFilter` - Auth rate limiting filter

---

## Important Methods Execution Sequence

### Assessment Creation Sequence
```
1. AssessmentController.create()
   │
   ├─▶ AssessmentService.create(userId, request)
   │     │
   │     ├─▶ FarmRepository.findByIdAndOwnerId(farmId, userId)
   │     ├─▶ CropRepository.findById(cropId)
   │     ├─▶ DataService.getWeather(lat, lon)
   │     │     └─▶ WebClient → Open-Meteo API
   │     ├─▶ AssessmentService.compute() [private]
   │     │     ├─▶ Build StageInput list from Crop
   │     │     ├─▶ Calculate total water (static + daily * horizon)
   │     │     ├─▶ WaterBudgetEngine.compute(WaterBudgetInput)
   │     │     │     ├─▶ Et0Calculator.et0(tmax, tmin, ra)
   │     │     │     ├─▶ calculateDemand() - iterate days, sum Kc
   │     │     │     ├─▶ calculateSupply() - rainfall + stored + groundwater
   │     │     │     ├─▶ classify(ratio) → Suitability
   │     │     │     └─▶ stressFor(suitability) → Stress
   │     │     ├─▶ Determine Confidence (LIVE vs FALLBACK)
   │     │     ├─▶ Build WeatherSnapshot
   │     │     ├─▶ Create Assessment object
   │     │     └─▶ RecommendationService.advice(result, storedPlusGroundwater)
   │     ├─▶ MlClient.predict(ratio, tmax, tmin, peffDailyMm)
   │     │     └─▶ WebClient → ML Service /predict
   │     └─▶ AssessmentRepository.save(assessment)
   │
   └─▶ Return AssessmentResponse.from(assessment)
```

### Crop Comparison Sequence
```
1. AssessmentController.compare()
   │
   ├─▶ FarmRepository.findByIdAndOwnerId(farmId, userId)
   ├─▶ CropRepository.findById() for each cropId
   ├─▶ DataService.getWeather(lat, lon)  [ONCE]
   │
   ├─▶ For each crop:
   │     └─▶ AssessmentService.compute(userId, farm, crop, horizonDays, weather)
   │           └─▶ (Same as above but NO ML call, NO save)
   │
   ├─▶ Sort assessments by ratio descending
   └─▶ Return List<AssessmentResponse>
```

### Report Generation Sequence
```
1. ReportController.getReport(assessmentId)
   │
   ├─▶ AssessmentRepository.findByIdAndOwnerId(assessmentId, userId)
   ├─▶ FarmRepository.findByIdAndOwnerId(farmId, userId)
   ├─▶ CropRepository.findById(cropId)
   ├─▶ Reconstruct WeatherData from Assessment.weather snapshot
   │
   ├─▶ For horizon in [30, 60, 90]:
   │     ├─▶ Calculate total water for horizon
   │     ├─▶ Build WaterBudgetInput
   │     ├─▶ WaterBudgetEngine.compute(input)
   │     └─▶ Create BreakdownRow
   │
   └─▶ Return ReportResponse(assessment, breakdown)
```

---

## Layer Communication Summary

| From Layer | To Layer | Communication Pattern |
|------------|----------|----------------------|
| Controller | Service | Direct method call (sync) |
| Controller | Repository | Direct method call (sync) |
| Service | Repository | Direct method call (sync) |
| Service | Engine | Direct method call (sync, pure computation) |
| Service | DataService | Direct method call (blocks on WebClient) |
| Service | MlClient | Direct method call (blocks on WebClient) |
| DataService | Open-Meteo | Reactive HTTP (WebClient) → blocked to sync |
| MlClient | ML Service | Reactive HTTP (WebClient) → blocked to sync |
| Repository | MongoDB | Spring Data MongoDB (blocking driver) |

**Note**: WebClient calls are made synchronous via `.block()` for simplicity. For high throughput, consider reactive endpoints.