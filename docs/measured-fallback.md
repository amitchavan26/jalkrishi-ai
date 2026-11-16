# Measured results (fallback)

Measured on 2026-11-08 07:11 against http://localhost:8080

## Sample assessment

Farm 2.5 ha (Loam, 100,000 L stored, 200,000 L groundwater), crop Rice, horizon 30 days.

| Item | Value |
|---|---|
| Supply S | 1425000 L |
| Demand D | 3991809 L |
| Balance B | -2566809 L |
| Ratio R | 0.357 |
| Suitability | NOT_RECOMMENDED |
| Stress | HIGH |
| Confidence | LOW |
| ML used | True (NOT_RECOMMENDED) |
| Weather source | FALLBACK |
| Tmax / Tmin | 32.0 / 21.0 C |
| Rain per day | 1.5 mm |
| Advice | NOT_RECOMMENDED: water ratio is 0.36, driven by high evapotranspiration demand. |

## Latency of POST /api/assessments (50 sequential requests)

| Metric | Milliseconds |
|---|---|
| Average | 155.4 |
| p95 | 192.7 |
| Min | 82.4 |
| Max | 1596.3 |

Confidence counts: LOW=50; ML used in 50 of 50 requests.

## Concurrent load (all requests fired at once)

| Concurrent users | Successful (201) | Total time (ms) |
|---|---|---|
| 20 | 20 / 20 | 2314 |
| 50 | 50 / 50 | 3506 |

## ML model (synthetic rule-learning baseline)

Samples: 5000. Split: 80/20 stratified, random_state=42. Accuracy: 1.0.

| Class | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| EXCELLENT | 1.0 | 1.0 | 1.0 | 491.0 |
| GOOD | 1.0 | 1.0 | 1.0 | 128.0 |
| RISKY | 1.0 | 1.0 | 1.0 | 124.0 |
| NOT_RECOMMENDED | 1.0 | 1.0 | 1.0 | 257.0 |

Note: labels come from the same rule thresholds the model sees, so the accuracy is not a real-world estimate.
