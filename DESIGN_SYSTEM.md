# JalKrishi AI Design System

Modern agri-tech SaaS UI design system inspired by Linear, Vercel, Stripe Dashboard, and Apple's bento-grid layouts.

---

## 1. Color Palette

Nature + water theme combining emerald/teal greens for crops and water supply, calm blues for hydrology, warm ambers for caution, and vibrant rose/red for HIGH stress.

### Light Mode (#FAFAF9 Base)
- **Primary / Crops**: Emerald (`#059669` to `#10b981`)
- **Secondary / Water**: Sky & Ocean Blue (`#0284c7` to `#38bdf8`)
- **Caution / Warning**: Amber (`#d97706` to `#f59e0b`)
- **Danger / High Stress**: Rose (`#dc2626` to `#ef4444`)
- **Neutrals**: Off-white (`#fafaf9`), Slate text (`#0f172a`), Muted (`#64748b`)

### Dark Mode (`#0B1512` / `#0F1A17` Surfaces)
- **Background**: Deep forest-charcoal (`#0b1512`)
- **Glass Cards**: `rgba(15, 26, 23, 0.75)` with `rgba(255, 255, 255, 0.1)` borders
- **Accents**: Emerald glow (`#22c55e`) and vibrant cyan/blue water gradients

---

## 2. Typography

- **Headings & Body**: Inter / Plus Jakarta Sans variable fonts.
- **Metric Numbers**: `tabular-nums` for precise alignment in data tables and stat cards.
- **Scale**: Fluid clamp-based scale supporting display, h1, h2, body, and captions.

---

## 3. Layout & Architecture

- **App Shell**: Collapsible glass sidebar (desktop) with emerald pill active states; sticky backdrop-blur-xl top bar with breadcrumbs, search, notification bell, dark mode toggle, and user avatar.
- **Mobile**: Slide-in drawer + fixed bottom tab bar with 5 key routes.
- **Bento Grid**: 1 col mobile, 2 col tablet, 4 col desktop with varied tile spans for rich dashboards.

---

## 4. Reusable Primitives (`src/components/ui/`)

- `Button`: Primary, secondary, ghost, danger variants with loading spinner and hover lift.
- `Card` / `GlassCard`: Soft glassmorphism container with diffuse shadows.
- `Input`, `Select`, `Slider`: Accessible inputs with floating labels and error states.
- `Badge` / `StatusPill`: Color-coded status badges for Suitability (EXCELLENT, GOOD, RISKY, NOT_RECOMMENDED) and Stress (LOW, MODERATE, HIGH).
- `Modal` / `Drawer`: Accessible spring-animated dialogs.
- `Tooltip`, `Skeleton`, `StatCard`, `ProgressRing`, `EmptyState`, `Toast`.
