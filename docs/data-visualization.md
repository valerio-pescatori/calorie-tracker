# Data Visualization

All charts are interactive, responsive, and theme-aware (light/dark). The primary library is **Chart.js** via `react-chartjs-2` for standard charts. **D3.js** is used for custom layouts (heatmap, radial rings) that Chart.js cannot easily express.

## Library Decision Matrix

| Chart Type | Library | Reason |
|---|---|---|
| Line (calorie trend) | Chart.js | Simple API, good animation |
| Stacked bar (macro split) | Chart.js | Native stack support |
| Doughnut (daily goal ring) | Chart.js | Built-in cutout prop |
| Radial progress (macro rings) | D3.js | Fine-grained arc control |
| Calendar heatmap | D3.js | No equivalent in Chart.js |
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

### 1.3 Macro Goal Rings (compact, 3× small rings)

- **Type**: Custom SVG arcs via D3.js
- Rendered as three 60px circles side-by-side
- Tooltip on hover

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

### 2.3 Monthly Calendar Heatmap (`MonthlyHeatmap`)

- **Type**: Custom D3.js calendar grid
- Grid: 7 columns (days) × ~5 rows (weeks)
- Each cell colored by intensity: `d3.scaleSequential([0, 1], d3.interpolateGreens)`
  - 0 = no data (grey)
  - 0–0.8 goal = light green
  - 0.8–1.0 goal = mid green
  - > goal = deep green (or soft red variant for over-budget)
- Click cell → drill into that day's dashboard
- Tooltip: date + calories + % of goal

```ts
// D3 color scale
const colorScale = d3.scaleSequential()
  .domain([0, 1])          // 0 = 0%, 1 = 100% of goal
  .interpolator(d3.interpolateGreens);
```

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
pnpm add chart.js react-chartjs-2 chartjs-plugin-annotation chartjs-plugin-zoom d3
pnpm add -D @types/d3
```
