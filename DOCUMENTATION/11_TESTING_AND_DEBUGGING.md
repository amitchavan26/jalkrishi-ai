# Testing and Debugging

## Test Structure Overview

```
Project Tests
├── Backend (66 tests)          → ./gradlew test
├── Frontend (34 tests)         → npm test
├── ML Service (9 tests)        → pytest -q
└── Integration (Manual)        → docs/smoke.ps1
```

---

## Backend Tests

### Test Organization

```
backend/src/test/java/com/jalkrishi/
├── BackendApplicationTests.java          # Context loads
├── ErrorHandlingTest.java                # Global exception handler
├── RateLimitTest.java                    # Rate limit filter
├── TestAuth.java                         # Test helper for auth
├── auth/
│   ├── AuthControllerTest.java           # Register, login, me
│   └── JwtServiceTest.java               # Token generation/validation
├── config/
│   └── RateLimitCleanupTest.java         # Rate limit window cleanup
├── crop/
│   └── CropControllerTest.java           # Crop listing
├── data/
│   └── DataServiceTest.java              # Weather parsing, fallback
├── engine/
│   ├── Et0CalculatorTest.java            # ET0 calculation
│   └── WaterBudgetEngineTest.java        # Water budget computation
├── farm/
│   ├── FarmControllerTest.java           # Farm CRUD
│   └── FarmLocationAndRatesTest.java     # Location, water rates
├── assessment/
│   ├── AssessmentControllerTest.java     # Assessment endpoints
│   ├── AssessmentCompareReportTest.java  # Compare + report
│   ├── AssessmentMlIntegrationTest.java  # ML integration
│   └── MlClientTest.java                 # ML client resilience
├── alert/
│   ├── AlertControllerTest.java          # Alerts endpoint
│   └── RecommendationServiceTest.java    # Advice generation
└── report/
    └── ReportOwnerScopeTest.java         # Report access control
```

### Running Backend Tests

```bash
cd backend

# All tests
./gradlew test

# Specific test class
./gradlew test --tests "com.jalkrishi.auth.AuthControllerTest"

# Specific test method
./gradlew test --tests "com.jalkrishi.auth.AuthControllerTest.registerSuccess"

# With verbose output
./gradlew test --info

# Generate report only (no re-run)
./gradlew test jacocoTestReport

# View HTML report
open build/reports/tests/test/index.html
```

### Test Configuration

**Embedded MongoDB** (for tests):
```gradle
// build.gradle
testImplementation 'de.flapdoodle.embed:de.flapdoodle.embed.mongo:4.0.0'
```

**application.yml** (test profile auto-configured):
```yaml
de:
  flapdoodle:
    mongodb:
      embedded:
        version: 6.0.5
```

### Key Test Patterns

#### 1. Controller Tests (MockMvc)
```java
@SpringBootTest(classes = BackendApplication.class)
@AutoConfigureMockMvc
public class AuthControllerTest {
    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    
    @BeforeEach void setUp() { userRepository.deleteAll(); }
    
    @Test void registerSuccess() throws Exception {
        Map<String, String> request = Map.of(
            "name", "Test User", "email", "test@example.com", "password", "password123"
        );
        
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Test User"));
    }
}
```

#### 2. Service Tests (Unit)
```java
@ExtendWith(MockitoExtension.class)
public class WaterBudgetEngineTest {
    @Mock SuitabilityThresholds thresholds;
    @InjectMocks WaterBudgetEngine engine;
    
    @Test void compute_excellentRatio_returnsExcellent() {
        when(thresholds.excellent()).thenReturn(1.0);
        when(thresholds.good()).thenReturn(0.8);
        when(thresholds.risky()).thenReturn(0.6);
        
        WaterBudgetInput input = new WaterBudgetInput(...);
        WaterBudgetResult result = engine.compute(input);
        
        assertEquals(Suitability.EXCELLENT, result.suitability());
    }
}
```

#### 3. Integration Tests (TestContainers - Not Used)
Currently uses embedded MongoDB. For full integration, consider TestContainers.

#### 4. Test Helper (TestAuth.java)
```java
public class TestAuth {
    private final MockMvc mockMvc;
    private final ObjectMapper objectMapper;
    
    public String registerAndGetToken(String name, String email, String password) throws Exception {
        // Register
        mockMvc.perform(post("/api/auth/register")...).andExpect(status().isCreated());
        // Login
        MvcResult result = mockMvc.perform(post("/api/auth/login")...).andExpect(status().isOk()).andReturn();
        return objectMapper.readValue(result.getResponse().getContentAsString(), Map.class).get("token");
    }
}
```

---

## Frontend Tests

### Test Organization

```
frontend/src/
├── setupTests.js                    # Vitest setup, mocks
├── *.test.js                        # Utility tests
│   ├── alertPrefs.test.js
│   ├── farmInfo.test.js
│   ├── geocode.test.js
│   ├── reportCsv.test.js
│   ├── waterMath.test.js
│   └── waterMath.area.test.js
├── components/
│   ├── ui/
│   │   ├── Button.test.jsx
│   │   ├── ProgressRing.test.jsx
│   │   ├── StatCard.test.jsx
│   │   └── Toast.test.jsx
│   ├── AppShell.test.jsx
│   ├── FarmMap.test.jsx
│   ├── Layout.test.jsx
│   ├── ProtectedRoute.test.jsx
│   ├── RatioGauge.test.jsx
│   └── RootSwitch.test.jsx
├── pages/
│   ├── Landing.test.jsx
│   ├── Login.test.jsx
│   ├── Login.extra.test.jsx
│   ├── Register.test.jsx
│   ├── Dashboard.test.jsx
│   ├── Dashboard.bento.test.jsx
│   ├── Farms.test.jsx
│   ├── Farms.location.test.jsx
│   ├── Farms.tiles.test.jsx
│   ├── Farms.toast.test.jsx
│   ├── Farms.units.test.jsx
│   ├── Assess.test.jsx
│   ├── Compare.test.jsx
│   ├── Compare.cards.test.jsx
│   ├── Compare.chart.test.jsx
│   ├── Result.test.jsx
│   ├── Result.details.test.jsx
│   ├── Result.polish.test.jsx
│   ├── History.test.jsx
│   ├── History.table.test.jsx
│   └── Alerts.test.jsx
│   └── Alerts.manage.test.jsx
└── theme/
    ├── ThemeProvider.test.jsx
    └── ThemeToggle.test.jsx
```

### Running Frontend Tests

```bash
cd frontend

# Watch mode (default)
npm test

# CI mode (run once, exit)
npm run test:run

# With UI
npm run test:ui

# Specific test file
npm test -- Login.test.jsx

# Coverage
npm run test:coverage
```

### Test Setup (`setupTests.js`)

```javascript
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

afterEach(() => { cleanup(); });

// Mock ResizeObserver for Chart.js
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn()
}));

// Mock matchMedia for ThemeProvider
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
  }))
});
```

### Key Test Patterns

#### 1. Component Rendering
```jsx
// Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { api } from '../api';

vi.mock('../api');

test('renders login form', () => {
  render(<BrowserRouter><Login /></BrowserRouter>);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});
```

#### 2. Form Validation
```jsx
test('shows validation errors', async () => {
  render(<BrowserRouter><Login /></BrowserRouter>);
  
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  
  expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  expect(screen.getByText('Enter your password')).toBeInTheDocument();
});
```

#### 3. API Mocking
```jsx
test('navigates on successful login', async () => {
  api.post.mockResolvedValue({ data: { token: 'fake-token' } });
  
  render(<BrowserRouter><Login /></BrowserRouter>);
  
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));
  
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
    email: 'test@example.com', password: 'password123'
  }));
});
```

#### 4. Theme Provider Testing
```jsx
// ThemeProvider.test.jsx
test('toggles theme and persists', () => {
  const { rerender } = render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
  
  // Initial render
  expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Switch to dark mode');
  
  // Click toggle
  fireEvent.click(screen.getByRole('button'));
  
  // Theme changed
  expect(document.documentElement).toHaveClass('dark');
});
```

---

## ML Service Tests

### Test Organization

```
ml-service/tests/
├── test_api.py        # API endpoint tests
└── test_train.py      # Training script tests
```

### Running ML Tests

```bash
cd ml-service
source .venv/bin/activate  # or .venv\Scripts\activate

# All tests
pytest -q

# Verbose
pytest -v

# Specific test
pytest tests/test_api.py::test_predict_excellent_with_model -v

# Coverage
pytest --cov=app --cov-report=html
```

### Test Examples

```python
# test_api.py
def test_predict_excellent_with_model():
    response = client.post("/predict", json={
        "ratio": 1.2, "tmax": 32.0, "tmin": 21.0, "peffDailyMm": 1.5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["suitability"] == "EXCELLENT"
    assert data["source"] == "model"
    assert isinstance(data["probability"], float)

def test_predict_falls_back_to_rules_when_model_missing(monkeypatch, tmp_path):
    nope = tmp_path / "nope.joblib"
    monkeypatch.setattr("app.main.MODEL_PATH", nope)
    response = client.post("/predict", json={...})
    assert response.json()["source"] == "rules"
```

---

## Integration Testing

### Smoke Test (`docs/smoke.ps1`)

```powershell
# PowerShell script for end-to-end verification
# Run after docker compose up

$baseUrl = "http://localhost:8080"
$frontendUrl = "http://localhost:5173"

# 1. Health checks
Invoke-RestMethod "$baseUrl/health" | Should -Be @{status="UP"}
Invoke-RestMethod "http://localhost:8000/health" | Should -Be @{status="UP"}

# 2. Register user
$register = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/register" -Body (@{name="Test";email="test@test.com";password="password123"} | ConvertTo-Json) -ContentType "application/json"

# 3. Login
$login = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -Body (@{email="test@test.com";password="password123"} | ConvertTo-Json) -ContentType "application/json"
$token = $login.token

# 4. Create farm
$farm = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/farms" -Headers @{Authorization="Bearer $token"} -Body (farmJson | ConvertTo-Json) -ContentType "application/json"

# 5. Run assessment
$assessment = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/assessments" -Headers @{Authorization="Bearer $token"} -Body (@{farmId=$farm.id;cropId="crop1";horizonDays=60} | ConvertTo-Json) -ContentType "application/json"

# 6. Verify result
$assessment.suitability | Should -Not -BeNullOrEmpty
```

### Run Smoke Test
```bash
powershell -ExecutionPolicy Bypass -File docs/smoke.ps1
```

---

## Debugging Techniques

### Backend Debugging

#### 1. Logging
```yaml
# application.yml - add for debugging
logging:
  level:
    com.jalkrishi: DEBUG
    org.springframework.web.reactive.function.client: DEBUG
    reactor.netty.http.client: DEBUG
```

#### 2. Remote Debugging (IDE)
```dockerfile
# Dockerfile - add debug port
ENV JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
EXPOSE 5005
```

#### 3. Common Debug Points

| Location | What to Check |
|----------|---------------|
| `JwtAuthFilter.doFilterInternal()` | Token extraction, validation |
| `AssessmentService.create()` | Farm/crop loading, weather fetch, computation |
| `DataService.getWeather()` | Open-Meteo response, parsing, fallback |
| `MlClient.predict()` | ML service response, timeout |
| `WaterBudgetEngine.compute()` | Input values, ET0, demand/supply calc |
| `GlobalExceptionHandler` | Exception types, response format |

#### 4. Debug Commands
```bash
# View backend logs
docker compose logs -f backend

# View specific logger
docker compose logs backend | grep "WaterBudgetEngine"

# Test endpoint manually
curl -X POST http://localhost:8080/api/assessments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"farmId":"...","cropId":"...","horizonDays":60}' -v
```

### Frontend Debugging

#### 1. React DevTools
- Install React DevTools browser extension
- Inspect component tree, props, state
- Profile renders

#### 2. Network Tab
- Monitor API requests/responses
- Check Authorization header
- Verify request/response payloads

#### 3. Console Logging
```javascript
// In component
useEffect(() => {
  console.log('Assessments:', assessments);
}, [assessments]);

// In api.js interceptor
api.interceptors.request.use(config => {
  console.log('Request:', config.method, config.url, config.data);
  return config;
});
```

#### 4. Common Issues

| Issue | Debug Approach |
|-------|----------------|
| Blank page | Check console for errors; verify root renders |
| 401 on API | Check localStorage token; verify JWT not expired |
| Chart not rendering | Check Chart.js registration; verify data format |
| Map not loading | Check Leaflet CSS import; verify container size |
| Form not submitting | Check validation state; verify onSubmit handler |

#### 5. Vite Dev Server Proxy
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### ML Service Debugging

#### 1. Logs
```bash
docker compose logs -f ml-service
```

#### 2. Test Model Directly
```python
# In ml-service directory
python -c "
import joblib
import pandas as pd
model = joblib.load('model.joblib')
X = pd.DataFrame([{'ratio':1.2,'tmax':32,'tmin':21,'peffDailyMm':1.5}])
print(model.predict(X))
print(model.predict_proba(X))
"
```

#### 3. Retrain Model
```bash
cd ml-service
python train.py
# Check metrics.json for performance
```

---

## Common Errors and Troubleshooting

### Backend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid/expired JWT | Re-login; check JWT_SECRET |
| `403 Forbidden` | CORS mismatch | Verify CORS_ORIGIN |
| `404 Not Found` | Wrong endpoint | Check API docs; verify path |
| `400 Bad Request` | Validation failed | Check request body; see error message |
| `429 Too Many Requests` | Rate limit | Wait 1 min; check AUTH_RATE_LIMIT |
| `500 Internal Server Error` | Unhandled exception | Check backend logs; GlobalExceptionHandler |
| `Could not connect to MongoDB` | Mongo down | Start MongoDB; check URI |
| `Connection to ML service refused` | ML down | Start ML service; check ML_URL |
| `Weather API timeout` | Network/Open-Meteo slow | Increase timeout; fallback activates |

### Frontend Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Network Error` | Backend not running | Start backend; check VITE_API_URL |
| `CORS error` | Backend CORS config | Check CORS_ORIGIN matches frontend |
| `Token expired` | JWT 120 min expiry | Auto-logout on 401; re-login |
| `Chart.js error` | Missing registration | Register Chart.js components |
| `Leaflet map blank` | CSS not loaded | Import leaflet.css |
| `Hydration mismatch` | SSR/client mismatch | Check for date formatting differences |

### ML Service Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Model not found` | model.joblib missing | Run `python train.py` |
| `Prediction fails` | Input validation | Check request format |
| `sklearn version mismatch` | Model trained with different version | Retrain model |
| `Port 8000 in use` | Conflict | Change port |

---

## Logging Locations

### Backend Logs
```bash
# Docker
docker compose logs -f backend

# Local
./gradlew bootRun  # Console output

# Log files (if configured)
# Spring Boot defaults to console only
```

### Frontend Logs
```bash
# Browser DevTools Console
# Vite dev server terminal
npm run dev
```

### ML Service Logs
```bash
# Docker
docker compose logs -f ml-service

# Local
uvicorn app.main:app --reload  # Console output
```

### MongoDB Logs
```bash
docker compose logs mongo
# Or
docker exec mongo mongosh --eval "db.getLog('global')"
```

---

## Performance Testing

### Load Testing (Manual)
```bash
# Backend health under load
for i in {1..100}; do curl -s http://localhost:8080/health; done

# Assessment creation load
for i in {1..50}; do
  curl -X POST http://localhost:8080/api/assessments \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"farmId":"...","cropId":"...","horizonDays":60}' &
done
wait
```

### Measurement Scripts (`docs/measure.ps1`)
```powershell
# Measures API response times
# Run after smoke test
```

### Benchmark Results
See `docs/measured-live.md` and `docs/measured-fallback.md` for recorded measurements.

---

## Test Coverage Goals

| Module | Current Coverage | Target |
|--------|------------------|--------|
| Backend Controllers | ~80% | 90% |
| Backend Services | ~70% | 85% |
| Backend Engine | ~90% | 95% |
| Frontend Components | ~60% | 80% |
| Frontend Pages | ~50% | 75% |
| ML Service | ~80% | 90% |

### Coverage Reports
```bash
# Backend
./gradlew jacocoTestReport
open build/reports/jacoco/test/html/index.html

# Frontend
npm run test:coverage
open coverage/index.html

# ML Service
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

---

## Recommended Additional Tests

### Not Yet Implemented (Future Work)

| Test Type | Description | Priority |
|-----------|-------------|----------|
| **E2E Tests** | Cypress/Playwright for full user flows | High |
| **Contract Tests** | Pact for API contracts | Medium |
| **Performance Tests** | k6/JMeter for load testing | Medium |
| **Security Tests** | OWASP ZAP scan | High |
| **Accessibility Tests** | axe-core integration | Medium |
| **Visual Regression** | Chromatic/Percy for UI | Low |
| **Mutation Testing** | Pitest for backend | Low |
| **Property-Based Tests** | jqwik for engine | Medium |

---

## Debugging Checklist

When something breaks:

1. **Check logs** - `docker compose logs -f <service>`
2. **Verify health** - `curl /health` on all services
3. **Check network** - Browser DevTools Network tab
4. **Verify config** - Environment variables, application.yml
5. **Check database** - MongoDB collections, indexes
6. **Test isolation** - Call APIs directly with curl
7. **Review recent changes** - Git diff, commit history
8. **Check dependencies** - Version conflicts, missing packages