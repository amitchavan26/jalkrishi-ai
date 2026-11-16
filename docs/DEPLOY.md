# Deployment Guide

## What you need

- A Docker-capable host or a container platform
- A managed MongoDB such as MongoDB Atlas

## Environment variables for production

| Name | Purpose |
|------|---------|
| SPRING_DATA_MONGODB_URI | The Atlas connection string (never commit) |
| JWT_SECRET | A random string of at least 32 characters; the repository default is for local use only |
| CORS_ORIGIN | The public frontend URL |
| ML_URL | The ML service URL |
| AUTH_RATE_LIMIT | Auth requests per minute |
| VITE_API_URL | The public backend URL (baked into frontend at build time; rebuild when changed) |

## Deployment order

1. ml-service
2. backend
3. frontend

## Health URLs

- Backend: `http://<backend-host>:8080/health`
- ML service: `http://<ml-service-host>:8000/health`

## Checklist

- [ ] No secrets in the repository
- [ ] JWT_SECRET changed from default
- [ ] CORS_ORIGIN set to public frontend URL
- [ ] Run `docs\smoke.ps1` with `$env:API_URL` set to the deployed backend URL