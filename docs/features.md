# Features

## 1. Daily Tracker

The primary screen users interact with every day.

### 1.1 Calorie Summary

- **Goal ring** — circular progress indicator showing calories consumed vs. daily goal
- **Remaining / over budget** label prominently displayed
- **Macro distribution ring** — a single segmented ring showing the caloric contribution of Protein, Carbs, and Fat as proportional arcs of the total calories consumed (Protein = blue, Carbs = yellow, Fat = orange)
- Color-coded feedback on the goal ring: green → on track, amber → near limit, red → over

### 1.2 Meal Timeline

- Chronological list of meals logged today (Breakfast, Lunch, Dinner, Snacks)
- Each entry shows: meal name, time, total kcal, macro chips
- Tap to expand for full macro breakdown
- Swipe-to-delete / edit inline

### 1.3 AI-Assisted Meal Entry

See [ai-integration.md](./ai-integration.md) for full detail.

Two entry modes available via the `+` FAB:

| Mode | Trigger | Description |
|---|---|---|
| Voice | Microphone button | User speaks meal description; AI transcribes + estimates |
| Text | Text field | User types in natural language; AI estimates macros |

Workflow:
1. User describes meal (e.g., "I had a bowl of pasta bolognese with parmesan and a glass of red wine")
2. AI returns a structured `MealEntry` with name, kcal, protein, carbs, fat
3. User sees a **MealConfirmCard** to review, adjust individual values, and confirm
4. On confirm → entry appended to today's log

### 1.4 Manual Entry (Fallback)

- Search food database (Open Food Facts API — EU-focused, open source, covers European products)
- Select serving size → auto-fill macros
- Fully manual form as last resort

### 1.5 Daily Goal Settings

- Accessible from dashboard header
- Set target calories, protein, carbs, fat
- BMR/TDEE calculator helper (height, weight, age, activity level)

---

## 2. Weekly / Monthly Progress

Dedicated page at `/progress`.

### 2.1 Date Range Selector

- Toggle: **Week** / **Month** / **Custom range**
- Navigation arrows to move backward/forward in time

### 2.2 Calorie Trend Line

- Line chart of daily calories over the selected period
- Goal line drawn as a dashed reference
- Color fill under the line for visual density

### 2.3 Macro Stacked Bar Chart

- Daily bars broken into Protein / Carbs / Fat contribution
- Hover/tap tooltip with exact values

### 2.4 Summary Stats Panel

- Average daily calories for period
- Best streak of goal-hitting days
- Most logged meal type
- Average macro split (pie chart)

---

## 3. Meal Log History

Full searchable/filterable history at `/log`.

- Filter by date range, meal type, keyword
- Export to CSV

---

## 4. PWA Features

See [pwa.md](./pwa.md) for detail.

- Installable on mobile home screen
- Push notifications for meal reminders (opt-in)
