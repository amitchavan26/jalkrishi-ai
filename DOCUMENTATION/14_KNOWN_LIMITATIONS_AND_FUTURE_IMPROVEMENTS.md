# Known Limitations and Future Improvements

## Existing Limitations (Verified from Implementation)

### 1. Weather Data Limitations
| Limitation | Details | Impact |
|------------|---------|--------|
| **16-day forecast only** | Open-Meteo provides 16-day forecast, applied to entire horizon | 30/60/90 day assessments use same forecast data |
| **Fixed Ra (extraterrestrial radiation)** | Hardcoded to 15.0 mm/day equivalent | No seasonal/latitudinal variation in ET0 |
| **No historical weather** | Only forecast, no observed historical data | Cannot validate against actual conditions |
| **Single weather source** | Only Open-Meteo, no fallback provider | Complete outage = fallback values |
| **No caching** | Fresh API call per assessment | Rate limits, slower responses |

**Code Reference**: `DataService.java` - `getWeather()`, `parse()`, `fallback()`

### 2. Crop Model Limitations
| Limitation | Details | Impact |
|------------|---------|--------|
| **Synthetic ML training data** | Model trained on rule-based labels, not real outcomes | ML predictions mirror rules, no independent value |
| **Generic Kc values** | FAO-56 style coefficients, not locally calibrated | Accuracy varies by region/climate |
| **Fixed growth stages** | 4 stages per crop, no variety-specific data | Cannot model short/long duration varieties |
| **No soil-crop interaction** | Soil type stored but not used in computation | Sandy/Loam/Clay has no effect on water budget |
| **8 crops only** | Hardcoded seeder, no extensibility | Limited crop selection |

**Code Reference**: `CropSeeder.java`, `ml-service/train.py`, `WaterBudgetEngine.java`

### 3. Water Budget Model Limitations
| Limitation | Details | Impact |
|------------|---------|--------|
| **Simplified supply model** | No infiltration, runoff, percolation losses | Overestimates available water |
| **No groundwater dynamics** | Static + daily rate, no aquifer modeling | Unrealistic for long horizons |
| **No irrigation scheduling** | Assumes continuous supply | Doesn't match real farming practice |
| **Single soil layer** | No root zone depth, no capillary rise | Simplified soil physics |
| **No salinity effects** | EC not considered | Missing constraint in arid regions |

**Code Reference**: `WaterBudgetEngine.java` - `calculateSupply()`, `calculateDemand()`

### 4. Authentication & User Management
| Limitation | Details | Impact |
|------------|---------|--------|
| **No password reset** | Forgot password not implemented | Users locked out permanently |
| **No email verification** | Fake emails can register | Spam accounts, no communication channel |
| **No account lockout** | Brute force possible (only rate limit) | Security risk |
| **Fixed JWT expiry** | 120 min, no refresh token | Frequent re-login, poor UX |
| **No MFA** | Single factor only | Lower security |
| **No session management** | Cannot revoke tokens server-side | Compromised token valid until expiry |

**Code Reference**: `AuthController.java`, `JwtService.java`, `SecurityConfig.java`

### 5. Data & Persistence
| Limitation | Details | Impact |
|------------|---------|--------|
| **No data export/delete (GDPR)** | User cannot download or delete all data | Compliance gap |
| **No audit logging** | No trail of who did what | Security/compliance gap |
| **No backup/restore UI** | Manual mongodump only | Operational burden |
| **Embedded MongoDB for tests only** | Production uses external MongoDB | Test/prod parity risk |
| **No migration system** | Schema changes manual | Risk of inconsistencies |

### 6. Frontend Limitations
| Limitation | Details | Impact |
|------------|---------|--------|
| **No offline support** | Service worker registered but not used | Cannot work offline |
| **No PWA install prompt** | Manifest exists but not promoted | Missed engagement |
| **Client-side only validation** | Server validates but UX better with both | Duplicate logic |
| **No internationalization** | English only | Limited accessibility |
| **Accessibility gaps** | Some ARIA, but not comprehensive | Screen reader issues |
| **Large bundle size** | Chart.js, Leaflet, Lucide all loaded | Slow initial load |

### 7. ML Service Limitations
| Limitation | Details | Impact |
|------------|---------|--------|
| **Model trained on synthetic data** | Labels from rule engine, not ground truth | No real predictive power |
| **Single model version** | No A/B testing, no model registry | Cannot compare versions |
| **No feature importance** | Black box predictions | No explainability |
| **No retraining pipeline** | Manual `train.py` run | Stale model over time |
| **Python dependencies not pinned** | `requirements.txt` without hashes | Supply chain risk |

### 8. Infrastructure & Operations
| Limitation | Details | Impact |
|------------|---------|--------|
| **No monitoring/alerting** | No Prometheus, Grafana, health endpoints only | Blind to production issues |
| **No distributed tracing** | Cannot trace request across services | Debugging difficult |
| **In-memory rate limiting** | Resets on restart, not distributed | Bypassable, inconsistent |
| **No CI/CD pipeline** | Manual docker compose deploy | Human error risk |
| **Secrets in environment variables** | Not using vault/secrets manager | Security risk |
| **Single replica each service** | No HA, no rolling updates | Downtime on deploy/failure |

---

## Technical Debt (Code Quality Issues)

### Backend
| Debt Item | Location | Effort to Fix |
|-----------|----------|---------------|
| **Blocking WebClient calls** | `DataService.java`, `MlClient.java` - `.block()` | Medium - Convert to reactive endpoints |
| **Duplicate water calculation** | `AssessmentService.compute()` and `ReportController` | Low - Extract to shared method |
| **No service layer for Farm/Crop** | Controllers directly use repositories | Low - Add FarmService, CropService |
| **Magic numbers in engine** | `Et0Calculator.java` - 0.0023, 17.8, 15.0 | Low - Move to config |
| **Large controller methods** | `FarmController.java`, `AssessmentController.java` | Medium - Extract to services |
| **Inconsistent error messages** | Various controllers | Low - Standardize |

### Frontend
| Debt Item | Location | Effort to Fix |
|-----------|----------|---------------|
| **Inline styles in components** | Many `.jsx` files - `style={{...}}` | Low - Move to Tailwind/classes |
| **Duplicate chart config** | `Dashboard.jsx`, `Result.jsx`, `Compare.jsx` | Medium - Create chart config hooks |
| **No React Query/SWR** | All `useEffect` data fetching | High - Add server state library |
| **Prop drilling** | `AppShell` → pages → components | Medium - Use context for user data |
| **Mixed validation approaches** | Some forms use HTML5, some custom | Low - Standardize |
| **Large page components** | `Farms.jsx` (500+ lines), `Assess.jsx` | Medium - Split into sub-components |

### ML Service
| Debt Item | Location | Effort to Fix |
|-----------|----------|---------------|
| **Model loading on each request** | `main.py` - `load_model()` called in predict | Low - Load at startup |
| **No input validation beyond Pydantic** | `PredictRequest` only | Low - Add range checks |
| **Training script not modular** | `train.py` - all in one file | Low - Separate data prep, training, eval |

---

## Incomplete Features

| Feature | Status | Missing Pieces |
|---------|--------|----------------|
| **Password Reset** | Not started | Email service, token generation, reset page, security |
| **Email Verification** | Not started | Email service, verification token, verified flag |
| **User Profile Management** | Partial (name only) | Avatar, preferences, notification settings |
| **Farm Editing** | Backend only | Frontend edit mode in Farms page |
| **Assessment Editing** | Not implemented | Would need recomputation |
| **Bulk Operations** | Not implemented | Multi-farm, multi-assessment actions |
| **Report Sharing** | Not implemented | Public link, PDF generation |
| **Mobile App** | Not started | React Native or PWA enhancement |

---

## Performance Considerations

### Current Bottlenecks
| Bottleneck | Location | Mitigation |
|------------|----------|------------|
| **Sequential weather + ML calls** | `AssessmentService.create()` | Parallelize with `CompletableFuture` |
| **No weather caching** | `DataService.getWeather()` | Add Redis/Caffeine cache (TTL: 1 hour) |
| **Full assessment recompute for report** | `ReportController.getReport()` | Store breakdown in assessment |
| **Blocking MongoDB driver** | Spring Data MongoDB (sync) | Consider reactive driver |
| **Large frontend bundle** | Chart.js, Leaflet, Lucide | Code splitting, lazy loading |

### Scalability Limits
| Component | Current Limit | Scaling Approach |
|-----------|---------------|------------------|
| **Backend** | ~1000 req/s (single instance) | Horizontal scaling, connection pooling |
| **MongoDB** | Single replica | Replica set, sharding by ownerId |
| **ML Service** | Model in memory per instance | Shared model server (TorchServe/TFServing) |
| **Rate Limiting** | In-memory, single instance | Redis-based distributed rate limiting |
| **Weather API** | 10,000 calls/day free tier | Caching, paid tier, multiple providers |

---

## Security Improvements (Priority Order)

### High Priority
1. **Implement password reset flow** - Secure token, expiry, rate limit
2. **Add email verification** - Required before full access
3. **Implement refresh tokens** - Short-lived access + long-lived refresh
4. **Add account lockout** - After 5 failed attempts, 15 min lockout
5. **Content Security Policy header** - Prevent XSS
6. **Audit logging** - Auth events, data modifications, admin actions

### Medium Priority
7. **Distributed rate limiting** - Redis-backed, per-user + per-IP
8. **Secrets management** - HashiCorp Vault / AWS Secrets Manager
9. **Dependency scanning** - Automated in CI (OWASP Dependency Check)
10. **Security headers** - HSTS, X-Frame-Options, Referrer-Policy
11. **Input sanitization** - XSS prevention on all text fields

### Low Priority
12. **Multi-factor authentication** - TOTP, WebAuthn
13. **API versioning** - `/api/v1/` for breaking changes
14. **Request signing** - For high-value operations
15. **Penetration testing** - Annual third-party assessment

---

## Recommended Future Enhancements

### Phase 1: Core Reliability (1-2 months)
| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **Weather caching** | Cache Open-Meteo responses for 1 hour | Low |
| **Parallel external calls** | Weather + ML concurrently in assessment | Low |
| **Refresh tokens** | JWT access (15min) + refresh (7 days) | Medium |
| **Password reset** | Email-based secure reset flow | Medium |
| **Email verification** | Verify on register, resend option | Medium |
| **Error monitoring** | Sentry/LogRocket integration | Low |
| **Health check enrichment** | Check MongoDB, ML, Weather connectivity | Low |

### Phase 2: Data Quality & Accuracy (2-3 months)
| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **Historical weather integration** | NASA POWER, ERA5 for validation | High |
| **Soil-crop interaction model** | Adjust Kc by soil type | Medium |
| **Irrigation scheduling** | Add irrigation events, efficiency | High |
| **Crop variety support** | Multiple varieties per crop | Medium |
| **Groundwater modeling** | Simple aquifer balance | High |
| **Salinity/EC constraints** | Crop salt tolerance | Medium |
| **Real ML training data** | Partner with agri universities | Very High |

### Phase 3: User Experience (2-3 months)
| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **PWA enhancements** | Offline support, install prompt, push notifications | Medium |
| **Internationalization** | i18n framework, Hindi/Marathi translations | Medium |
| **Accessibility audit** | WCAG 2.1 AA compliance | Medium |
| **Mobile-responsive improvements** | Touch gestures, bottom nav | Low |
| **Dashboard customization** | Widgets, date ranges, export options | Medium |
| **Comparison sharing** | Shareable links for crop comparisons | Low |
| **Notification system** | Email/SMS for alerts, seasonal reminders | High |

### Phase 4: Platform & Scale (3-6 months)
| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **Multi-tenancy** | Organizations, teams, roles | Very High |
| **API marketplace** | Public API with keys, quotas | High |
| **Mobile app** | React Native / Flutter | Very High |
| **Advanced analytics** | Trends, benchmarks, yield prediction | High |
| **IoT integration** | Soil moisture sensors, weather stations | Very High |
| **Marketplace** | Seeds, fertilizers, equipment links | High |
| **Carbon credits** | Water savings → carbon credits | Very High |

### Phase 5: Intelligence (6+ months)
| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **Yield prediction model** | ML model trained on real harvest data | Very High |
| **Pest/disease risk** | Weather-based disease models | High |
| **Economic optimization** | Profit maximization given water | High |
| **Climate adaptation** | Long-term climate projections | Very High |
| **Federated learning** | On-device model updates | Very High |

---

## Separation: Actual Issues vs Suggestions

### Actual Issues (Must Fix)
- [ ] No password reset
- [ ] No email verification
- [ ] Fixed Ra in ET0 calculation
- [ ] ML model trained on synthetic data
- [ ] No weather caching
- [ ] Blocking WebClient calls
- [ ] In-memory rate limiting
- [ ] No audit logging
- [ ] No GDPR data export/delete
- [ ] Secrets in environment variables

### Suggestions (Nice to Have)
- [ ] Historical weather integration
- [ ] Irrigation scheduling
- [ ] Crop variety support
- [ ] PWA offline support
- [ ] Internationalization
- [ ] Mobile app
- [ ] Yield prediction
- [ ] IoT integration
- [ ] Multi-tenancy
- [ ] Carbon credits

---

## Migration Path for Major Changes

### Authentication Overhaul
```
Current: JWT (120min) → Target: Access (15min) + Refresh (7d)
1. Add refresh token column to User
2. Modify JwtService to generate both
3. Add /api/auth/refresh endpoint
4. Update frontend to use refresh token
5. Add token revocation list (Redis)
6. Deploy with feature flag
7. Monitor, then remove old flow
```

### Weather Caching
```
1. Add Caffeine cache to DataService
2. Cache key: "weather:lat:lon" 
3. TTL: 1 hour (configurable)
4. Add cache stats to /health
5. Monitor hit rate
```

### Reactive Backend
```
1. Add spring-boot-starter-webflux
2. Convert repositories to ReactiveMongoRepository
3. Convert services to return Mono/Flux
4. Convert controllers to @RestController with reactive returns
5. Remove .block() calls
6. Load test reactive vs blocking
```

---

## Decision Log for Future Decisions

| Decision | Options | Chosen | Rationale |
|----------|---------|--------|-----------|
| **Weather provider** | Open-Meteo, WeatherAPI, Tomorrow.io | Open-Meteo | Free, no auth, good coverage |
| **ML framework** | scikit-learn, XGBoost, PyTorch | scikit-learn | Simple, fast, sufficient for tabular |
| **Frontend state** | Redux, Zustand, React Query | None (useState/useEffect) | Simplicity for small app |
| **Database** | PostgreSQL, MongoDB | MongoDB | Flexible schema, geospatial ready |
| **Auth** | Session, JWT, OAuth2 | JWT | Stateless, scalable |
| **Deployment** | K8s, Docker Compose, Serverless | Docker Compose | Simplicity for current scale |