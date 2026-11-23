# JalKrishi AI - Technical Documentation

Welcome to the comprehensive technical documentation for **JalKrishi AI** ("Can I Grow This Crop?") - a water-budget crop suitability tool for farmers and agricultural advisors.

## Documentation Index

| # | Document | Description | Recommended For |
|---|----------|-------------|-----------------|
| 01 | [PROJECT_OVERVIEW.md](01_PROJECT_OVERVIEW.md) | Project introduction, problem statement, features, tech stack, architecture | All developers - start here |
| 02 | [PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md) | Complete folder/file structure, purpose of each file, entry points | New team members |
| 03 | [SYSTEM_ARCHITECTURE.md](03_SYSTEM_ARCHITECTURE.md) | System architecture, component diagrams, communication patterns | Architects, senior devs |
| 04 | [APPLICATION_FLOW.md](04_APPLICATION_FLOW.md) | Complete application flows: startup, auth, user journeys, data flow | All developers |
| 05 | [DATABASE_DOCUMENTATION.md](05_DATABASE_DOCUMENTATION.md) | Database schema, collections, relationships, indexes, ER diagram | Backend devs, DBAs |
| 06 | [API_DOCUMENTATION.md](06_API_DOCUMENTATION.md) | Complete API reference: endpoints, requests, responses, errors | Frontend devs, API consumers |
| 07 | [BACKEND_DEEP_DIVE.md](07_BACKEND_DEEP_DIVE.md) | Backend internals: controllers, services, engines, repositories, DI | Backend developers |
| 08 | [FRONTEND_DEEP_DIVE.md](08_FRONTEND_DEEP_DIVE.md) | Frontend internals: pages, components, routing, state, API integration | Frontend developers |
| 09 | [INTEGRATIONS_AND_CONNECTIONS.md](09_INTEGRATIONS_AND_CONNECTIONS.md) | All external/internal connections: config, data flow, troubleshooting | DevOps, integration devs |
| 10 | [SETUP_AND_INSTALLATION.md](10_SETUP_AND_INSTALLATION.md) | Complete setup guide: prerequisites, Docker, local dev, troubleshooting | All developers |
| 11 | [TESTING_AND_DEBUGGING.md](11_TESTING_AND_DEBUGGING.md) | Test structure, running tests, debugging techniques, common errors | QA, all developers |
| 12 | [SECURITY_AND_CONFIGURATION.md](12_SECURITY_AND_CONFIGURATION.md) | Auth, passwords, tokens, validation, secrets, CORS, rate limiting | Security, backend devs |
| 13 | [TEAM_DEVELOPER_GUIDE.md](13_TEAM_DEVELOPER_GUIDE.md) | Practical guide: where to make changes, how to add features, conventions | All team members |
| 14 | [KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md](14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md) | Current limitations, technical debt, incomplete features, roadmap | Product, architects |
| 15 | [GLOSSARY.md](15_GLOSSARY.md) | Technical terms, project-specific terminology, abbreviations | All developers |

---

## Recommended Reading Order

### For New Team Members (Onboarding)
1. **Start here**: [01_PROJECT_OVERVIEW.md](01_PROJECT_OVERVIEW.md) - Understand what the project does
2. **Setup**: [10_SETUP_AND_INSTALLATION.md](10_SETUP_AND_INSTALLATION.md) - Get running locally
3. **Structure**: [02_PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md) - Navigate the codebase
4. **Architecture**: [03_SYSTEM_ARCHITECTURE.md](03_SYSTEM_ARCHITECTURE.md) - Understand the big picture
5. **Flows**: [04_APPLICATION_FLOW.md](04_APPLICATION_FLOW.md) - See how user actions flow through the system
6. **Your area**: 
   - Backend → [07_BACKEND_DEEP_DIVE.md](07_BACKEND_DEEP_DIVE.md)
   - Frontend → [08_FRONTEND_DEEP_DIVE.md](08_FRONTEND_DEEP_DIVE.md)
   - DevOps → [09_INTEGRATIONS_AND_CONNECTIONS.md](09_INTEGRATIONS_AND_CONNECTIONS.md)

### For Specific Tasks

| Task | Read |
|------|------|
| Add new API endpoint | [06_API_DOCUMENTATION.md](06_API_DOCUMENTATION.md) + [07_BACKEND_DEEP_DIVE.md](07_BACKEND_DEEP_DIVE.md) + [13_TEAM_DEVELOPER_GUIDE.md](13_TEAM_DEVELOPER_GUIDE.md) |
| Add new frontend page | [08_FRONTEND_DEEP_DIVE.md](08_FRONTEND_DEEP_DIVE.md) + [13_TEAM_DEVELOPER_GUIDE.md](13_TEAM_DEVELOPER_GUIDE.md) |
| Modify database schema | [05_DATABASE_DOCUMENTATION.md](05_DATABASE_DOCUMENTATION.md) + [13_TEAM_DEVELOPER_GUIDE.md](13_TEAM_DEVELOPER_GUIDE.md) |
| Debug production issue | [11_TESTING_AND_DEBUGGING.md](11_TESTING_AND_DEBUGGING.md) + [09_INTEGRATIONS_AND_CONNECTIONS.md](09_INTEGRATIONS_AND_CONNECTIONS.md) |
| Security review | [12_SECURITY_AND_CONFIGURATION.md](12_SECURITY_AND_CONFIGURATION.md) |
| Plan new feature | [14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md](14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md) + [13_TEAM_DEVELOPER_GUIDE.md](13_TEAM_DEVELOPER_GUIDE.md) |

---

## Documentation Coverage Checklist

### ✅ Fully Documented

| Area | Coverage | Details |
|------|----------|---------|
| **Project Overview** | 100% | Purpose, features, tech stack, architecture |
| **Project Structure** | 100% | Every folder/file explained |
| **System Architecture** | 100% | Diagrams, communication patterns, security boundaries |
| **Application Flows** | 100% | Startup, auth, all 6 user journeys, data flow |
| **Database** | 100% | All 4 collections, fields, indexes, relationships, ER diagram |
| **API Reference** | 100% | All 16 endpoints with examples, errors, auth |
| **Backend Internals** | 100% | Controllers, services, engines, repos, DI, middleware |
| **Frontend Internals** | 100% | Pages, components, routing, state, API, testing |
| **Integrations** | 100% | 5 external connections + Docker network |
| **Setup Guide** | 100% | Docker, local dev, env vars, troubleshooting |
| **Testing** | 100% | All 3 test suites, patterns, debugging, coverage |
| **Security** | 100% | Auth, passwords, tokens, validation, secrets, CORS |
| **Team Guide** | 100% | Where to change, how to add features, conventions |
| **Limitations** | 100% | 8 categories of verified limitations + roadmap |
| **Glossary** | 100% | 50+ terms, abbreviations, domain concepts |

### 📊 Coverage Statistics

| Metric | Count |
|--------|-------|
| **API Endpoints Documented** | 16/16 (100%) |
| **Database Collections Documented** | 4/4 (100%) |
| **Backend Modules Documented** | 12/12 (100%) |
| **Frontend Pages Documented** | 10/10 (100%) |
| **External Integrations Documented** | 5/5 (100%) |
| **Test Suites Documented** | 3/3 (100%) |
| **Mermaid Diagrams** | 25+ |

---

## Quick Reference

### Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS, Chart.js, React Router
- **Backend**: Spring Boot 3, Java 17, Spring Data MongoDB, JWT
- **ML Service**: FastAPI, scikit-learn, RandomForest
- **Database**: MongoDB 7
- **Infrastructure**: Docker, Docker Compose, Nginx

### Key Endpoints
```
Frontend:     http://localhost:5173
Backend API:  http://localhost:8080
ML Service:   http://localhost:8000
MongoDB:      mongodb://localhost:27017
```

### Default Credentials (Dev)
```
JWT Secret: dev-only-secret-dev-only-secret-32bytes!
CORS Origin: http://localhost:5173
Auth Rate Limit: 10/min/IP
```

### Run Commands
```bash
# Start all (Docker)
docker compose up -d --build

# Backend tests
cd backend && ./gradlew test

# Frontend tests
cd frontend && npm test

# ML tests
cd ml-service && pytest -q

# All tests
npm test  # from root
```

---

## Contributing to Documentation

### When to Update
- Adding new API endpoints → Update [06_API_DOCUMENTATION.md](06_API_DOCUMENTATION.md)
- New database fields → Update [05_DATABASE_DOCUMENTATION.md](05_DATABASE_DOCUMENTATION.md)
- New frontend pages → Update [08_FRONTEND_DEEP_DIVE.md](08_FRONTEND_DEEP_DIVE.md)
- Architecture changes → Update [03_SYSTEM_ARCHITECTURE.md](03_SYSTEM_ARCHITECTURE.md)
- New limitations found → Update [14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md](14_KNOWN_LIMITATIONS_AND_FUTURE_IMPROVEMENTS.md)

### Documentation Standards
- Use Mermaid diagrams for architecture/flows
- Include actual code references (file paths, class names)
- Provide practical examples (curl commands, JSON)
- Distinguish implemented vs recommended features
- Mark unverified items as `UNKNOWN` or `NOT FOUND`

---

## Version Information

| Document Version | Project Version | Date | Author |
|------------------|-----------------|------|--------|
| 1.0 | 1.0.0 | 2024 | AI Documentation Engineer |

---

## Support

For questions about this documentation:
- Check the relevant document first
- Search the codebase for implementation details
- Ask team members in #documentation channel
- Create an issue for documentation gaps

---

*Generated with comprehensive codebase analysis. All information verified against actual source code.*