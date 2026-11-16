# JalKrishi AI - DESIGN BRIEF (read before every UI task)

## Rules for every UI task

- Keep every route, API call, request/response shape, auth flow and every existing visible text, label, role and data-testid. A task may change them only where it lists the exact change.
- Do not edit existing test files unless the task names the file and the assertions that change. New components get new tests.
- Tailwind is v4: there is NO tailwind.config.js. Tokens live in src/index.css (`@theme inline`, CSS variables). Dark mode is the class `dark` on <html>.
- Charts stay Chart.js + react-chartjs-2 (the tests mock it). Shared chart colors live in src/chartTheme.js. Do not add Recharts.
- Icons: lucide-react only, strokeWidth 1.75, always aria-hidden when decorative.
- Animation: framer-motion only when a task says so; every animation respects prefers-reduced-motion.
- Radix primitives only when a task says so: @radix-ui/react-dialog, react-dropdown-menu, react-tabs, react-tooltip.
- Never show a number the API does not provide. No fake trends, scores or sparklines.
- Windows PowerShell. Reply format and verification are in each task prompt.

## What the app really has (truth table)

- Suitability: EXCELLENT, GOOD, RISKY, NOT_RECOMMENDED. Stress: LOW, LOW_MODERATE, MODERATE, HIGH (four values, not three).
- An assessment is created from farmId, cropId and horizonDays (30, 60 or 90). It has no start date. Stored water and groundwater belong to the farm.
- A report has exactly three breakdown rows (30, 60, 90 days). There is no per-day series.
- Compare returns ratio, suitability and stress per crop. Nothing else, so no radar chart.
- A farm has name, lat, lon, area (ha), soil type, water fields and optional location text. It has no crop.
- The user has name and email only (GET /api/auth/me). There is no profile page, search, notification feed or export on the server.
- Alerts are the user's HIGH-stress assessments. There is no dismiss state on the server; hiding or snoozing may be stored in localStorage only.
- Allowed client-side extras: CSV download of data already on the screen, and "Print / save as PDF" through window.print().

## Design language

- Calm, data-dense but breathable. Glass cards, rounded-2xl, soft diffuse shadows, generous whitespace.
- Light: page #FAFAF9, text #0f172a, muted #475569, primary emerald #047857, water blue #0369a1, warning #b45309, danger #be123c.
- Dark: page #0B1512, card surface rgba(15,26,23,.72) with a white/10 border, text #e6f2ee, muted #9fb5ad, primary #34d399, water #38bdf8, warning #fbbf24, danger #fb7185.
- Suitability colors stay those in src/labels.js (green, blue, yellow, red) with readable text in both themes.
- Font: Plus Jakarta Sans (fallback Inter, system-ui). Metrics use tabular-nums, bold, tight tracking. Headings use clamp() sizes.
- Focus ring on every interactive element: 2px emerald ring with offset.
- Contrast: WCAG AA in both themes. White text only on backgrounds of #047857 or darker.

## Layout targets (later tasks)

- App shell: collapsible glass sidebar on desktop, sticky blurred top bar (breadcrumb, theme toggle, user menu), slide-in drawer plus bottom tab bar on mobile.
- Content max-width 1440px, padding p-4 sm:p-6 lg:p-8.
- Every page has loading (skeleton), empty (illustration + one CTA) and error states.
- Toast notifications for save and failure.
