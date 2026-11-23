# Team Developer Guide

## Understanding the Codebase

### Architecture Mental Model

```
User Action → Frontend Component → API Call → Backend Controller
                                                    ↓
                                            Service Layer (Business Logic)
                                                    ↓
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                              Repository       Engine           External Client
                              (MongoDB)      (Computation)    (Weather, ML)
```

### Key Principles

1. **Controllers are thin** - Delegate to services
2. **Services contain business logic** - Orchestrate repositories, engines, external APIs
3. **Engines are pure** - No external dependencies, easily testable
4. **Repositories are simple** - Spring Data MongoDB, minimal custom queries
5. **DTOs at boundaries** - Request/Response records, not entities

---

## Where to Make Changes

### Adding a New Feature: Decision Tree

```
Is it a new API endpoint?
├── Yes → Add Controller method → Service method → Repository (if new data) → Tests
├── No → Is it a new computation?
│   ├── Yes → Add to Engine package → Service uses it → Tests
│   └── No → Is it a new UI page?
│       ├── Yes → Add Page component → Route in App.jsx → API integration → Tests
│       └── No → Is it a new data field?
│           ├── Yes → Update Entity + Repository + DTO + Controller + Frontend form
│           └── No → Is it a new external integration?
│               ├── Yes → Add WebClient config → Client service → Service integration
│               └── No → Ask for clarification
```

### Common Change Locations

| Change Type | Backend Files | Frontend Files |
|-------------|---------------|----------------|
| **New API endpoint** | `*Controller.java`, `*Service.java`, `*Repository.java` | `api.js` (if new pattern), page/component |
| **New data field** | Entity, Request/Response DTO, Repository, Controller, Service | Form, display components, types |
| **New computation** | `engine/` package, `EngineConfig.java` | None (unless new visualization) |
| **New external API** | `config/WebClientConfig.java`, new `*Client.java`, Service | None |
| **New page** | None (usually) | `pages/*.jsx`, `App.jsx` route, `components/` if reusable |
| **UI component** | None | `components/ui/` or `components/` |
| **Style/theme** | None | `tailwind.config.js`, `index.css`, `chartTheme.js` |
| **Auth change** | `auth/`, `config/SecurityConfig.java` | `api.js`, `ProtectedRoute.jsx`, auth pages |
| **Database index** | Entity `@Indexed`, Repository custom query | None |

---

## How to Add a New API Endpoint

### Step-by-Step Example: "Get Farm Statistics"

#### 1. Define Response DTO
```java
// backend/src/main/java/com/jalkrishi/farm/FarmStatsResponse.java
public record FarmStatsResponse(
    long totalFarms,
    double totalAreaHa,
    Map<String, Long> farmsBySoilType
) {}
```

#### 2. Add Repository Method
```java
// FarmRepository.java
public interface FarmRepository extends MongoRepository<Farm, String> {
    // ... existing
    
    @Query("{ 'ownerId': ?0 }")
    List<Farm> findByOwnerId(String ownerId);
    
    // Or use aggregation for stats
    @Aggregation(pipeline = {
        "{ $match: { ownerId: ?0 } }",
        "{ $group: { _id: '$soilType', count: { $sum: 1 } } }"
    })
    List<SoilTypeCount> countBySoilType(String ownerId);
}
```

#### 3. Add Service Method
```java
// FarmService.java (new) or FarmController directly
@Service
public class FarmService {
    private final FarmRepository farmRepository;
    
    public FarmStatsResponse getStats(String userId) {
        List<Farm> farms = farmRepository.findByOwnerId(userId);
        long totalFarms = farms.size();
        double totalAreaHa = farms.stream().mapToDouble(Farm::getAreaHa).sum();
        Map<String, Long> bySoilType = farms.stream()
            .collect(Collectors.groupingBy(Farm::getSoilType, Collectors.counting()));
        return new FarmStatsResponse(totalFarms, totalAreaHa, bySoilType);
    }
}
```

#### 4. Add Controller Endpoint
```java
// FarmController.java
@GetMapping("/stats")
public ResponseEntity<?> getStats(Authentication authentication) {
    String userId = getUserId(authentication);
    FarmStatsResponse stats = farmService.getStats(userId);
    return ResponseEntity.ok(stats);
}
```

#### 5. Add Frontend API Call
```javascript
// src/api.js (or in component)
export async function getFarmStats() {
  const res = await api.get("/api/farms/stats");
  return res.data;
}
```

#### 6. Write Tests
```java
// FarmControllerTest.java
@Test
void getStats_returnsFarmStatistics() throws Exception {
    String token = testAuth.registerAndGetToken("User", "user@test.com", "password123");
    
    // Create test farms
    testAuth.createFarm(token, "Farm 1", 28.6, 77.2, 2.0, "Loam");
    testAuth.createFarm(token, "Farm 2", 28.7, 77.3, 3.0, "Clay");
    
    mockMvc.perform(get("/api/farms/stats")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.totalFarms").value(2))
        .andExpect(jsonPath("$.totalAreaHa").value(5.0))
        .andExpect(jsonPath("$.farmsBySoilType.Loam").value(1))
        .andExpect(jsonPath("$.farmsBySoilType.Clay").value(1));
}
```

#### 7. Update Documentation
- Add to `06_API_DOCUMENTATION.md`
- Update `07_BACKEND_DEEP_DIVE.md` if new patterns

---

## How to Add a New Frontend Component/Page

### Step-by-Step Example: "Settings Page"

#### 1. Create Page Component
```jsx
// src/pages/Settings.jsx
import { useState } from "react";
import { api } from "../api";
import { Card } from "../components/ui";
import { Button } from "../components/ui";
import { Input } from "../components/ui";
import { useToast } from "../components/ui";

export default function Settings() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current user on mount
  useEffect(() => {
    api.get("/api/auth/me").then(res => {
      setName(res.data.name);
      setEmail(res.data.email);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming backend adds PUT /api/auth/me
      await api.put("/api/auth/me", { name });
      toast.success("Settings saved");
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen app-bg p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6">Settings</h1>
        <Card className="fade-up">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email" value={email} type="email" disabled />
            <Button type="submit" loading={loading} className="w-full">
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
```

#### 2. Add Route
```jsx
// src/App.jsx
import Settings from "./pages/Settings";

// Inside protected routes
<Route path="settings" element={<Settings />} />
```

#### 3. Add Navigation Link
```jsx
// src/components/AppShell.jsx
<NavLink to="/settings" className={({ isActive }) => ...}>
  Settings
</NavLink>
```

#### 4. Write Tests
```jsx
// src/pages/Settings.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from './Settings';
import { api } from '../api';
import { ToastProvider } from '../components/ui';

vi.mock('../api');

test('loads user data and saves', async () => {
  api.get.mockResolvedValue({ data: { name: 'John', email: 'john@test.com' } });
  api.put.mockResolvedValue({});

  render(
    <BrowserRouter>
      <ToastProvider>
        <Settings />
      </ToastProvider>
    </BrowserRouter>
  );

  expect(screen.getByDisplayValue('John')).toBeInTheDocument();
  expect(screen.getByDisplayValue('john@test.com')).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane' } });
  fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

  await waitFor(() => expect(api.put).toHaveBeenCalledWith('/api/auth/me', { name: 'Jane' }));
});
```

---

## How to Modify the Database

### Adding a New Field to Existing Entity

#### 1. Update Entity
```java
// Farm.java
@Document(collection = "farms")
public class Farm {
    // ... existing fields
    
    private String irrigationType;  // New field
    
    // Getter/setter
    public String getIrrigationType() { return irrigationType; }
    public void setIrrigationType(String irrigationType) { this.irrigationType = irrigationType; }
}
```

#### 2. Update Request/Response DTOs
```java
// FarmRequest.java
private String irrigationType;
// getter/setter

// FarmController.toResponse() - add to response map
map.put("irrigationType", farm.getIrrigationType());
```

#### 3. Update Frontend Form
```jsx
// Farms.jsx - add to form state and JSX
const [irrigationType, setIrrigationType] = useState("Drip");

// In form
<select value={irrigationType} onChange={e => setIrrigationType(e.target.value)}>
  <option value="Drip">Drip</option>
  <option value="Sprinkler">Sprinkler</option>
  <option value="Flood">Flood</option>
</select>

// In payload
irrigationType,
```

#### 4. Handle Existing Data
- New field will be `null` for existing documents
- Handle null in UI (show default or "Not specified")
- No migration needed for optional fields

#### 5. Add Validation (if required)
```java
// Farm.java
@NotBlank(message = "irrigationType is required")
private String irrigationType;
```

#### 6. Update Tests
```java
// FarmControllerTest.java - include in create/update tests
```

### Adding a New Collection

#### 1. Create Entity
```java
// NewEntity.java
@Document(collection = "new_entities")
public class NewEntity {
    @Id private String id;
    @Indexed private String ownerId;
    // ... fields
}
```

#### 2. Create Repository
```java
// NewEntityRepository.java
public interface NewEntityRepository extends MongoRepository<NewEntity, String> {
    List<NewEntity> findByOwnerId(String ownerId);
    NewEntity findByIdAndOwnerId(String id, String ownerId);
}
```

#### 3. Create Controller/Service
Follow existing patterns (FarmController as template)

#### 4. Add Indexes
```java
// In entity or via MongoDB shell
db.new_entities.createIndex({ "ownerId": 1 })
```

---

## How to Connect a New External Service

### Example: Adding Soil Data API

#### 1. Add Configuration
```yaml
# application.yml
jalkrishi:
  soil:
    url: ${SOIL_API_URL:https://api.soilgrids.org}
    connect-timeout: 5000
    read-timeout: 10000
```

#### 2. Add WebClient Bean
```java
// WebClientConfig.java
@Bean("soilWebClient")
public WebClient soilWebClient(HttpClient httpClient, 
                               @Value("${jalkrishi.soil.url}") String baseUrl,
                               @Value("${jalkrishi.soil.connect-timeout}") int connectTimeout,
                               @Value("${jalkrishi.soil.read-timeout}") int readTimeout) {
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .filter(logRequestResponse())
        .filter(errorHandlingFilter())
        .build();
}
```

#### 3. Create Client Service
```java
// data/SoilClient.java
@Component
public class SoilClient {
    private final WebClient webClient;
    
    public SoilClient(@Qualifier("soilWebClient") WebClient webClient) {
        this.webClient = webClient;
    }
    
    public Optional<SoilData> getSoilData(double lat, double lon) {
        try {
            return webClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/soil")
                    .queryParam("lat", lat)
                    .queryParam("lon", lon)
                    .build())
                .retrieve()
                .bodyToMono(SoilData.class)
                .block(Duration.ofSeconds(5));
        } catch (Exception e) {
            log.error("Soil API error: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
```

#### 4. Integrate in Service
```java
// AssessmentService.java
private final SoilClient soilClient;

public Assessment create(...) {
    // ... existing code
    Optional<SoilData> soilData = soilClient.getSoilData(farm.getLat(), farm.getLon());
    soilData.ifPresent(data -> {
        // Use soil data to adjust computation
        assessment.setSoilData(data);
    });
    // ...
}
```

#### 5. Add Error Handling & Fallback
```java
// Always have fallback for external services
public SoilData getSoilDataWithFallback(double lat, double lon) {
    return soilClient.getSoilData(lat, lon)
        .orElse(SoilData.defaultForRegion(lat, lon));
}
```

---

## Coding Conventions

### Java (Backend)

| Convention | Example |
|------------|---------|
| **Package structure** | `com.jalkrishi.<module>` |
| **Class names** | PascalCase: `WaterBudgetEngine` |
| **Method names** | camelCase: `computeWaterBudget()` |
| **Constants** | UPPER_SNAKE: `MAX_CONNECTIONS` |
| **Records for DTOs** | `public record AssessmentRequest(...)` |
| **Constructor injection** | `public FarmController(FarmRepository repo)` |
| **Validation annotations** | `@NotNull`, `@Positive`, `@Size` |
| **Exception handling** | `ResponseStatusException` for HTTP errors |
| **Logging** | `log.error("message", e)` with SLF4J |
| **Optional for nullable returns** | `Optional<User> findByEmail()` |

### JavaScript/React (Frontend)

| Convention | Example |
|------------|---------|
| **Component names** | PascalCase: `FarmMap.jsx` |
| **Hook names** | camelCase: `useTheme()` |
| **File names** | PascalCase for components, camelCase for utils |
| **Props destructuring** | `export default function Card({ children, className })` |
| **Custom hooks** | `use` prefix: `useToast()` |
| **Context names** | `XxxContext`, `useXxx()` |
| **Event handlers** | `handleXxx`: `handleSubmit`, `handleChange` |
| **Boolean props** | `isLoading`, `disabled`, `required` |
| **CSS classes** | Tailwind utilities, custom in `index.css` |
| **API calls** | `api.get/post/put/delete` from `api.js` |

### Git Workflow

#### Branching Strategy
```
main (protected)
  ├── develop (integration)
  │     ├── feature/farm-map-improvements
  │     ├── feature/ml-model-update
  │     └── bugfix/login-rate-limit
  ├── release/v1.2.0
  └── hotfix/security-patch
```

#### Commit Messages
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:
```
feat(assessment): add multi-horizon comparison endpoint

fix(auth): handle expired token gracefully on frontend

docs(api): update assessment endpoint documentation

refactor(engine): extract ET0 calculation to separate class
```

#### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with tests
3. Run all tests locally: `npm test` (root)
4. Push branch, create PR to `develop`
5. CI runs: backend tests, frontend tests, ML tests
6. Code review (1 approval minimum)
7. Squash merge to `develop`
8. Release: PR from `develop` to `main` with version tag

---

## How to Avoid Breaking Existing Functionality

### Before Making Changes

1. **Run full test suite**
   ```bash
   npm test  # From root - runs all modules
   ```

2. **Check affected areas**
   - Search for usages: `grep -r "MethodName" --include="*.java" --include="*.jsx"`
   - Check test files for related tests

3. **Review API contracts**
   - Don't change response structure without versioning
   - Add fields, don't remove/rename

### Safe Change Patterns

| Change | Safe Approach |
|--------|---------------|
| **Add field to response** | Add optional field, don't break existing clients |
| **Remove field** | Deprecate first, remove in next major version |
| **Change validation** | Relax only, tighten with new version |
| **Modify computation** | Add tests for edge cases, compare outputs |
| **Update dependency** | Check breaking changes, test thoroughly |
| **Refactor service** | Keep public interface, test behavior |

### Regression Testing Checklist

After changes, verify:
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual test critical paths (login, create farm, run assessment)
- [ ] Check error handling (401, 404, 500 scenarios)
- [ ] Verify frontend-backend integration
- [ ] Test with both LIVE and FALLBACK weather
- [ ] Test with and without ML service

---

## Development Environment Tips

### Hot Reload
- **Backend**: Spring Boot DevTools (add to build.gradle)
- **Frontend**: Vite HMR (automatic)
- **ML Service**: Uvicorn `--reload`

### Debugging in IDE
```bash
# Backend remote debug (add to Dockerfile)
ENV JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
EXPOSE 5005
```

### Database Inspection
```bash
# MongoDB shell
docker exec -it mongo mongosh jalkrishi

# Useful commands
db.farms.find().pretty()
db.assessments.find({ownerId: "..."}).sort({createdAt: -1}).limit(5)
db.crops.find()
```

### Log Filtering
```bash
# Backend logs for specific module
docker compose logs backend | grep "AssessmentService"

# Follow with filter
docker compose logs -f backend | grep -E "(Assessment|WaterBudget|ML)"
```

---

## Code Review Guidelines

### As Author
- Keep PRs small (< 400 lines changed)
- Write clear description of what and why
- Include test plan
- Self-review before requesting review

### As Reviewer
- Check: Tests added? Tests pass?
- Check: Breaking changes documented?
- Check: Security implications?
- Check: Performance implications?
- Check: Code style consistent?
- Approve or request changes with specific comments

### Review Checklist
- [ ] Tests pass (CI green)
- [ ] New code has tests
- [ ] No console.log/debug code left
- [ ] Error handling appropriate
- [ ] Validation on inputs
- [ ] Ownership checks on resources
- [ ] No hardcoded secrets
- [ ] Documentation updated if needed