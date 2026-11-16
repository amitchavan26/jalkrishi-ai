# Measured results (live)

Measured on 2026-11-08 07:00 against http://localhost:8080

## Sample assessment

Farm 2.5 ha (Loam, 100,000 L stored, 200,000 L groundwater), crop Rice, horizon 30 days.

| Item | Value |
|---|---|
| Supply S | 1110000 L |
| Demand D | 4104229 L |
| Balance B | -2994229 L |
| Ratio R | 0.270 |
| Suitability | NOT_RECOMMENDED |
| Stress | HIGH |
| Confidence | HIGH |
| ML used | True (NOT_RECOMMENDED) |
| Weather source | LIVE |
| Tmax / Tmin | 31.26666666666667 / 18.84 C |
| Rain per day | 1.08 mm |
| Advice | NOT_RECOMMENDED: water ratio is 0.27, driven by high evapotranspiration demand. |

## Latency of POST /api/assessments (50 sequential requests)

| Metric | Milliseconds |
|---|---|
| Average | 367.9 |
| p95 | 649.9 |
| Min | 236.5 |
| Max | 1618.6 |

Confidence counts: HIGH=50; ML used in 50 of 50 requests.

## Concurrent load (all requests fired at once)

| Concurrent users | Successful (201) | Total time (ms) |
|---|---|---|
| 20 | 20 / 20 | 4370 |
| 50 | 50 / 50 | 3982 |

## ML model (synthetic rule-learning baseline)

Samples: 5000. Split: 80/20 stratified, random_state=42. Accuracy: 1.0.

| Class | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| EXCELLENT | 1.0 | 1.0 | 1.0 | 491.0 |
| GOOD | 1.0 | 1.0 | 1.0 | 128.0 |
| RISKY | 1.0 | 1.0 | 1.0 | 124.0 |
| NOT_RECOMMENDED | 1.0 | 1.0 | 1.0 | 257.0 |

Note: labels come from the same rule thresholds the model sees, so the accuracy is not a real-world estimate.
