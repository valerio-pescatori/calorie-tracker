# Data Visualization

All charts are interactive, responsive, and theme-aware (light/dark). The primary library is **Chart.js** via `react-chartjs-2`.

> **Phase 2 note**: A monthly calendar heatmap (D3.js) is planned for a later phase.

## Library Decision Matrix

| Chart Type | Library | Reason |
|---|---|---|
| Line (calorie trend) | Chart.js | Simple API, good animation |
| Stacked bar (macro split) | Chart.js | Native stack support |
| Doughnut (daily goal ring) | Chart.js | Built-in cutout prop |
| Segmented doughnut (macro distribution) | Chart.js | Same API, proportional arc segments |
| Pie (avg macro split) | Chart.js | Standard pie |

---

## 1. Daily Dashboard Charts

### 1.1 Calorie Goal Ring (`CalorieSummaryRing`)

- **Type**: Doughnut (Chart.js)
- **Data**: `[consumed, remaining]` — remaining clamped to 0 if over budget
- **Center label**: calories consumed + "/ goal kcal" via Chart.js plugin
- **Colors**:
  - Under budget: `hsl(142, 71%, 45%)` (green)
  - Within 10% of budget: `hsl(38, 92%, 50%)` (amber)
  - Over budget: `hsl(0, 72%, 51%)` (red)

```ts
// Example Chart.js config
const data = {
  datasets: [{
    data: [consumed, Math.max(0, goal - consumed)],
    backgroundColor: [progressColor, '#e5e7eb'],
    borderWidth: 0,
    cutout: '78%',
  }],
};
```

### 1.2 Macro Breakdown Bars (`MacroBreakdownBar`)

- **Type**: Horizontal progress bars (custom Tailwind, not Chart.js)
- Three rows: Protein / Carbs / Fat
- Each shows: grams consumed, grams goal, % fill
- Color coded: Protein = blue, Carbs = yellow, Fat = orange

### 1.3 Macro Distribution Ring

- **Type**: Segmented doughnut (Chart.js)
- A single ring where each arc segment represents the caloric share of each macro:
  - Protein: calories × 4 kcal/g → blue segment
  - Carbs: calories × 4 kcal/g → yellow segment
  - Fat: calories × 9 kcal/g → orange segment
- Center label shows total calories consumed
- Hover/tap tooltip shows macro name, grams, kcal contribution, and % of total
- Segments are proportional to actual caloric contribution, not gram weight

```ts
// Example: 40g protein, 80g carbs, 20g fat
// → protein: 160 kcal, carbs: 320 kcal, fat: 180 kcal  (total: 660 kcal)
const data = {
  datasets: [{
    data: [protein * 4, carbs * 4, fat * 9],
    backgroundColor: ['#3b82f6', '#eab308', '#f97316'],
    borderWidth: 0,
    cutout: '72%',
  }],
  labels: ['Protein', 'Carbs', 'Fat'],
};
```

---

## 2. Progress Page Charts

### 2.1 Calorie Trend Line (`WeeklyTrendChart`)

- **Type**: Line chart (Chart.js)
- **X axis**: dates in selected range
- **Y axis**: kcal
- **Datasets**:
  1. Actual calories (solid filled line)
  2. Daily goal (dashed horizontal reference line using `annotation` plugin)
- Zoom/pan enabled via `chartjs-plugin-zoom`

```ts
const options = {
  responsive: true,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    annotation: {
      annotations: {
        goalLine: {
          type: 'line',
          yMin: userGoal,
          yMax: userGoal,
          borderColor: 'rgb(99, 102, 241)',
          borderDash: [6, 4],
        },
      },
    },
  },
};
```

### 2.2 Macro Stacked Bar (`MacroStackedBar`)

- **Type**: Stacked vertical bar (Chart.js)
- **Datasets**: Protein, Carbs, Fat (one dataset each)
- Hover tooltip shows individual macro grams + total kcal
- Legend below chart with color swatches

---

## 3. Chart Theming

All Chart.js charts respect the active theme:

```ts
// lib/chartDefaults.ts
import { Chart, defaults } from 'chart.js';

export function applyChartTheme(isDark: boolean) {
  defaults.color = isDark ? '#a1a1aa' : '#52525b';          // axis labels
  defaults.borderColor = isDark ? '#3f3f46' : '#e4e4e7';    // grid lines
  defaults.font.family = 'var(--font-sans)';
}
```

Call `applyChartTheme` inside a `useEffect` that watches the theme context.

---

## 4. Responsiveness

- Charts wrapped in a container div with `aspect-ratio: 16/9` on desktop, `aspect-ratio: 4/3` on mobile
- `maintainAspectRatio: false` on all Chart.js instances — sizing handled by CSS
- D3 SVGs use `viewBox` + `preserveAspectRatio="xMidYMid meet"` and fill parent width

---

## 5. Packages to Install

```bash
pnpm add chart.js react-chartjs-2 chartjs-plugin-annotation chartjs-plugin-zoom
```
