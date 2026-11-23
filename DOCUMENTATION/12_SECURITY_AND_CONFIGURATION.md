# Security and Configuration

## Authentication and Authorization

### JWT-Based Authentication

**Implementation**: Stateless JWT tokens with HS256 signing

**Token Generation** (`JwtService.java`):
```java
public String generate(String userId, String email) {
    long expiryMs = expiryMinutes * 60 * 1000;  // Default: 120 minutes
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + expiryMs);
    
    return Jwts.builder()
        .subject(userId)                    // MongoDB ObjectId as string
        .claim("email", email)              // Additional claim
        .issuedAt(now)
        .expiration(expiryDate)
        .signWith(key)                      // HS256 with secret
        .compact();
}
```

**Token Structure**:
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "sub": "65a1b2c3d4e5f6789012345",
    "email": "user@example.com",
    "iat": 1705312200,
    "exp": 1705319400
  },
  "signature": "..."
}
```

**Token Validation** (`JwtAuthFilter.java`):
```java
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
```

### Authorization Rules

| Endpoint | Access | Implementation |
|----------|--------|----------------|
| `/api/auth/register` | Public | `permitAll()` |
| `/api/auth/login` | Public | `permitAll()` |
| `/health` | Public | `permitAll()` |
| `/api/**` | Authenticated | `anyRequest().authenticated()` |
| Farm/Assessment/Crop/Alert/Report | Owner only | Controller-level ownership checks |

### Ownership Verification Pattern

```java
// In every controller method
private String getUserId(Authentication authentication) {
    return (String) authentication.getPrincipal();  // JWT subject
}

// Farm example
@GetMapping("/{id}")
public ResponseEntity<?> get(@PathVariable String id, Authentication authentication) {
    String userId = getUserId(authentication);
    Farm farm = farmRepository.findByIdAndOwnerId(id, userId);  // Ownership check
    if (farm == null) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Farm not found");
    }
    return ResponseEntity.ok(toResponse(farm));
}
```

---

## Password Handling

### BCrypt Hashing

**Configuration** (`SecurityConfig.java`):
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();  // Default strength 10
}
```

**Registration** (`AuthController.java`):
```java
@PostMapping("/register")
public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
    Optional<User> existing = userRepository.findByEmail(request.getEmail());
    if (existing.isPresent()) {
        return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
    }
    
    String passwordHash = passwordEncoder.encode(request.getPassword());  // BCrypt hash
    User user = new User(request.getName(), request.getEmail(), passwordHash);
    User savedUser = userRepository.save(user);
    // ...
}
```

**Login Verification**:
```java
@PostMapping("/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
    Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
    if (userOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }
    
    User user = userOpt.get();
    if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }
    // Generate token...
}
```

### Password Requirements

| Rule | Implementation |
|------|----------------|
| Minimum 8 characters | `@Size(min = 8)` on `RegisterRequest.password` |
| BCrypt cost factor | Default (10) - ~100ms per hash |
| No password reset | Not implemented |
| No email verification | Not implemented |

---

## Token/Session Management

### JWT Configuration

**application.yml**:
```yaml
jalkrishi:
  jwt:
    secret: ${JWT_SECRET:dev-only-secret-dev-only-secret-32bytes!}
    expiryMinutes: 120
```

**Security Considerations**:
- Secret must be ≥32 characters (256 bits for HS256)
- Expiry: 120 minutes (configurable)
- No refresh token mechanism
- Tokens invalidated only by expiry or client-side deletion

### Token Storage (Frontend)

```javascript
// src/api.js
export const TOKEN_KEY = 'jk_token'

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

export function setToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch {}
}

export function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
}
```

### Automatic Token Cleanup

```javascript
// Axios response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearToken()  // Remove invalid/expired token
    }
    return Promise.reject(error)
  }
)
```

---

## Input Validation

### Bean Validation (Backend)

**Annotations Used**:
```java
// FarmRequest.java
@NotBlank(message = "name must not be blank")
private String name;

@NotNull(message = "lat must not be null")
@Min(value = -90, message = "lat must be >= -90")
@Max(value = 90, message = "lat must be <= 90")
private Double lat;

@NotNull(message = "areaHa must not be null")
@Positive(message = "areaHa must be > 0")
private Double areaHa;

@Size(max = 100, message = "country must be at most 100 characters")
private String country;
```

**Validation Error Handling** (`GlobalExceptionHandler.java`):
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .map(e -> e.getField() + ": " + e.getDefaultMessage())
        .reduce((a, b) -> a + "; " + b)
        .orElse("Validation failed");
    return ResponseEntity.badRequest().body(buildError(HttpStatus.BAD_REQUEST, message));
}
```

### Client-Side Validation (Frontend)

```javascript
// Login.jsx
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleSubmit(e) {
  e.preventDefault();
  setError(""); setEmailError(""); setPasswordError("");
  
  let hasError = false;
  if (!email) { setEmailError("Enter a valid email address"); hasError = true; }
  else if (!validateEmail(email)) { setEmailError("Enter a valid email address"); hasError = true; }
  if (!password) { setPasswordError("Enter your password"); hasError = true; }
  if (hasError) return;
  // ... API call
}
```

---

## Sensitive Information Management

### Environment Variables

**Never commit secrets** - use `.env` files (gitignored) or platform secret managers.

| Secret | Used By | Storage |
|--------|---------|---------|
| `JWT_SECRET` | Backend (JwtService) | Environment variable |
| `SPRING_DATA_MONGODB_URI` | Backend | Environment variable |
| `ML_URL` | Backend (MlClient) | Environment variable |
| `CORS_ORIGIN` | Backend (CorsConfig) | Environment variable |
| `VITE_API_URL` | Frontend (api.js) | Build-time env (Vite) |
| `AUTH_RATE_LIMIT` | Backend (RateLimitFilter) | Environment variable |

### Docker Secrets (Production)

```yaml
# docker-compose.prod.yml
services:
  backend:
    secrets:
      - jwt_secret
      - mongo_uri
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      SPRING_DATA_MONGODB_URI_FILE: /run/secrets/mongo_uri

secrets:
  jwt_secret:
    external: true
  mongo_uri:
    external: true
```

### .gitignore Protection

```gitignore
# Root .gitignore
.env
.env.local
.env.*.local

# Backend
backend/.env

# Frontend
frontend/.env

# ML Service
ml-service/.env
```

---

## CORS and Security Headers

### CORS Configuration (`CorsConfig.java`)

```java
@Configuration
public class CorsConfig {
    @Value("${jalkrishi.cors.allowed-origin:http://localhost:5173}")
    private String allowedOrigin;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin));  // Single origin
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);  // Allow cookies/auth headers

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### Security Headers (Spring Security Defaults)

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS protection |
| `Referrer-Policy` | `no-referrer` | Privacy |
| `Content-Security-Policy` | Not set | Consider adding |

### Additional Security Config (`SecurityConfig.java`)

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())  // Stateless API, no CSRF needed
        .cors(Customizer.withDefaults())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)  // No sessions
        )
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
```

---

## Rate Limiting

### Auth Endpoint Rate Limiting (`RateLimitFilter.java`)

```java
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    @Value("${jalkrishi.ratelimit.auth-per-minute:10}")
    private int limit;

    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        
        // Only apply to auth endpoints
        boolean isLogin = "/api/auth/login".equals(path) && "POST".equals(method);
        boolean isRegister = "/api/auth/register".equals(path) && "POST".equals(method);
        if (!isLogin && !isRegister) {
            filterChain.doFilter(request, response);
            return;
        }

        // Sliding window per IP
        String ip = request.getRemoteAddr();
        long windowStart = System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(1);
        
        counters.compute(ip, (k, v) -> {
            if (v == null || v.windowStart < windowStart) {
                return new WindowCounter(System.currentTimeMillis(), 1);
            }
            v.count++;
            return v;
        });

        WindowCounter counter = counters.get(ip);
        if (counter != null && counter.count > limit) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write("{\"timestamp\":\"...\",\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
```

**Configuration**:
```yaml
jalkrishi:
  ratelimit:
    auth-per-minute: ${AUTH_RATE_LIMIT:10}
```

**Limitations**:
- In-memory (not distributed)
- Per IP only (can be bypassed with proxy)
- Only on auth endpoints
- Resets on backend restart

---

## Potential Security Weaknesses

### Known Issues

| Issue | Severity | Description | Mitigation |
|-------|----------|-------------|------------|
| **No password reset** | Medium | Users cannot recover accounts | Implement email-based reset flow |
| **No email verification** | Medium | Fake emails can register | Add email verification on register |
| **JWT no refresh** | Low | Users logged out after 2h | Implement refresh token rotation |
| **Rate limit in-memory** | Medium | Not distributed, resets on restart | Use Redis for distributed rate limiting |
| **No CSP header** | Low | XSS risk if content injection | Add Content-Security-Policy header |
| **No audit logging** | Low | No trail of sensitive actions | Add audit log for auth, data changes |
| **Secrets in env** | Medium | .env files can leak | Use Docker secrets / vault in prod |
| **No MFA** | Low | Single factor only | Add TOTP/WebAuthn support |
| **Password min 8 chars only** | Low | Weak passwords allowed | Add strength meter, breach check |
| **No account lockout** | Medium | Brute force possible | Add failed attempt tracking |

### Security Checklist for Production

- [ ] Generate strong `JWT_SECRET` (64+ random chars)
- [ ] Enable MongoDB authentication
- [ ] Use TLS/SSL everywhere (terminate at load balancer)
- [ ] Set secure `CORS_ORIGIN` (exact domain, no wildcards)
- [ ] Configure Content-Security-Policy header
- [ ] Implement distributed rate limiting (Redis)
- [ ] Add password reset flow with secure tokens
- [ ] Add email verification
- [ ] Implement audit logging
- [ ] Use Docker secrets for sensitive config
- [ ] Regular dependency vulnerability scanning
- [ ] Penetration testing before launch

---

## Configuration Reference

### Complete application.yml

```yaml
spring:
  application:
    name: backend
  data:
    mongodb:
      database: jalkrishi
      uri: ${SPRING_DATA_MONGODB_URI:mongodb://localhost:27017}
  port: ${PORT:8080}

de:
  flapdoodle:
    mongodb:
      embedded:
        version: 6.0.5

jalkrishi:
  jwt:
    secret: ${JWT_SECRET:dev-only-secret-dev-only-secret-32bytes!}
    expiryMinutes: 120
  suitability:
    excellent: 1.0
    good: 0.8
    risky: 0.6
  ratelimit:
    auth-per-minute: ${AUTH_RATE_LIMIT:10}
  cors:
    allowed-origin: ${CORS_ORIGIN:http://localhost:5173}
  ml:
    url: ${ML_URL:http://localhost:8000}
  weather:
    base-url: https://api.open-meteo.com
    connect-timeout: 5000
    read-timeout: 10000
```

### Environment Variable Defaults

| Variable | Default | Required in Prod |
|----------|---------|------------------|
| `JWT_SECRET` | `dev-only-secret-dev-only-secret-32bytes!` | **YES** - Must change |
| `SPRING_DATA_MONGODB_URI` | `mongodb://localhost:27017` | **YES** - Use auth |
| `CORS_ORIGIN` | `http://localhost:5173` | **YES** - Exact domain |
| `VITE_API_URL` | `http://localhost:8080` | **YES** - API domain |
| `ML_URL` | `http://localhost:8000` | Internal Docker |
| `AUTH_RATE_LIMIT` | `10` | Tune for traffic |
| `PORT` | `8080` | Usually fine |
| `JWT_EXPIRY_MINUTES` | `120` | Tune for UX/security |

### Frontend Build-Time Config

```env
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com
```

**Note**: Vite embeds `import.meta.env.VITE_*` at build time. Rebuild frontend for changes.

---

## Security Testing

### Manual Tests

```bash
# 1. Test CORS
curl -H "Origin: http://evil.com" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization" -X OPTIONS \
  http://localhost:8080/api/farms -v

# 2. Test rate limit
for i in {1..15}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done

# 3. Test JWT validation
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:8080/api/farms

# 4. Test expired token (wait 120 min or reduce expiry)
# 5. Test ownership enforcement
# Create user A, create farm, try access with user B token
```

### Automated Security Scans

```bash
# Dependency check (OWASP)
./gradlew dependencyCheckAnalyze

# Frontend audit
cd frontend && npm audit

# Python audit
cd ml-service && pip-audit
```

---

## Compliance Considerations

| Regulation | Applicability | Status |
|------------|---------------|--------|
| **GDPR** | If EU users | Not implemented (no data export/delete) |
| **CCPA** | If CA users | Not implemented |
| **HIPAA** | Health data | N/A (agricultural data) |
| **PCI DSS** | Payments | N/A (no payments) |
| **SOC 2** | Enterprise | Not certified |

**Data Privacy Notes**:
- Personal data: name, email, password hash
- Farm data: location, water resources (potentially sensitive)
- No third-party data sharing except Open-Meteo (weather) and Nominatim (geocoding)
- No analytics/tracking implemented