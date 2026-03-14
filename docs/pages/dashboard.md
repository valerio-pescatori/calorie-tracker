# Dashboard Page

**Route**: `/dashboard`  
**File**: `app/dashboard/page.tsx`  
**Rendering**: Client Component (`'use client'`) — heavy interactivity, charts, and real-time state updates

---

## Purpose

The dashboard is the primary screen of the app. Users land here every day to:

1. See their calorie and macro progress at a glance
2. Log new meals via AI (voice or text) or manually
3. Review and manage every meal they've eaten today

---

## Layout

```
┌─────────────────────────────────────────┐
│  Header: date + goal settings button    │
├──────────────────┬──────────────────────┤
│  Calorie Goal    │  Macro Distribution  │
│  Ring            │  Ring                │
├──────────────────┴──────────────────────┤
│  Macro Breakdown Bars                   │
│  (Protein / Carbs / Fat)                │
├─────────────────────────────────────────┤
│  Meal Timeline                          │
│  ├─ Breakfast                           │
│  ├─ Lunch                               │
│  ├─ Dinner                              │
│  └─ Snacks                              │
├─────────────────────────────────────────┤
│                           [ + ] FAB     │
└─────────────────────────────────────────┘
```

On mobile (< `md`): single-column stack.  
On desktop (≥ `md`): the two rings sit side-by-side in a 2-column grid.

---

## Sections

### 1. Header

- Displays today's date (e.g. "Thursday, 12 March")
- **Goal settings button** (cog icon, top-right) → opens the `GoalSettingsSheet` slide-over panel

---

### 2. Calorie Goal Ring (`CalorieSummaryRing`)

**Component**: `components/dashboard/CalorieSummaryRing.tsx`  
**Chart type**: Doughnut (Chart.js, `cutout: '78%'`)

Displays calories consumed vs. the user's daily goal as a circular progress ring.

| Element | Description |
|---|---|
| Filled arc | Calories consumed so far |
| Empty arc | Remaining budget (clamped to 0 if over) |
| Center label (top) | Calories consumed (large, bold) |
| Center label (bottom) | "/ `{goal}` kcal" |
| Below ring | "X kcal remaining" or "X kcal over budget" in matching color |

**Color states** (applied to the filled arc):

| State | Condition | Color |
|---|---|---|
| On track | consumed < 90% of goal | `hsl(142, 71%, 45%)` green |
| Near limit | consumed 90–100% of goal | `hsl(38, 92%, 50%)` amber |
| Over budget | consumed > goal | `hsl(0, 72%, 51%)` red |

---

### 3. Macro Distribution Ring (`MacroDistributionRing`)

**Component**: `components/dashboard/MacroDistributionRing.tsx`  
**Chart type**: Segmented doughnut (Chart.js, `cutout: '72%'`)

A single ring divided into three arcs representing the **caloric contribution** of each macro out of today's total calories consumed. Sized by energy (kcal), not grams.

| Macro | Calculation | Color |
|---|---|---|
| Protein | `grams × 4 kcal` | `#3b82f6` blue |
| Carbs | `grams × 4 kcal` | `#eab308` yellow |
| Fat | `grams × 9 kcal` | `#f97316` orange |

- Center label: total calories consumed (matches the goal ring)
- Tooltip on hover/tap: macro name, grams, kcal from that macro, % of total
- When no meals are logged yet, the ring shows a single grey placeholder arc

---

### 4. Macro Breakdown Bars (`MacroBreakdownBar`)

**Component**: `components/dashboard/MacroBreakdownBar.tsx`  
**Implementation**: Custom Tailwind — not a Chart.js component

Three horizontal progress rows, one per macro, showing progress toward the user's macro goals in grams.

```
Protein   ████████░░░░  85g / 150g  (57%)
Carbs     ████████████  220g / 200g ⚠ over
Fat       █████░░░░░░░  30g / 65g   (46%)
```

Each row:
- Macro label + color dot
- Filled progress bar (color matches macro color)
- `{consumed}g / {goal}g` text
- Bar turns red if the macro's gram goal is exceeded

---

### 5. Meal Timeline (`MealTimeline`)

**Component**: `components/dashboard/MealTimeline.tsx`

A chronological list of all meals logged today, grouped into four sections:

- **Breakfast** (icon: 🌅)
- **Lunch** (icon: ☀️)
- **Dinner** (icon: 🌙)
- **Snacks** (icon: 🍎)

Empty sections are collapsed by default and show an "Add meal" ghost button.

#### Meal Entry Card

Each logged meal renders as a card:

```
┌───────────────────────────────────────────┐
│  🍝 Pasta Bolognese         08:45   620 kcal │
│  P 35g  C 72g  F 18g                [···]  │
└───────────────────────────────────────────┘
```

- **Tap / click** → expands to show full macro breakdown + AI confidence badge + notes
- **`···` menu** → Edit | Delete options
- **AI confidence badge** (on AI-sourced entries):
  - `high` → no badge shown
  - `medium` → subtle grey badge
  - `low` → yellow ⚠ badge + AI notes shown inline
- **Source icon** (small): microphone for `ai_voice`, text cursor for `ai_text`, pencil for `manual`, search for `search`

---

### 6. Add Meal FAB (`AddMealPanel`)

**Component**: `components/dashboard/AddMealPanel.tsx`

A fixed floating action button (`+`) in the bottom-right corner. Tapping it opens a bottom sheet (shadcn/ui `Sheet`) with three entry modes:

#### Mode A — AI Voice Input

1. User taps the **microphone** button
2. `useVoiceRecorder` activates — live transcript appears as the user speaks
3. On stop → transcript sent to `POST /api/ai/parse-meal`
4. `MealConfirmCard` slides up with the AI estimate

#### Mode B — AI Text Input

1. User types a natural language description in a text area (e.g. "Two scrambled eggs with toast and orange juice")
2. On submit → sent to `POST /api/ai/parse-meal`
3. `MealConfirmCard` slides up with the AI estimate

#### Mode C — Manual / Search

1. Search box queries the **Open Food Facts API**
2. Results list with product name, brand, kcal per 100g
3. Tap a result → serving size picker → macros auto-filled
4. Fallback: fully manual form (name, kcal, protein, carbs, fat fields)

#### `MealConfirmCard`

Shown after AI parsing (modes A and B):

```
┌─────────────────────────────────────────┐
│  🍝 Pasta Bolognese                     │
│  620 kcal  |  P 35g  C 72g  F 18g      │
│                                         │
│  [Meal type ▾]  [Time ▾]               │
│                                         │
│  ⚠ medium confidence                    │
│  "Assumed 250g serving, standard recipe"│
│                                         │
│  [Edit values]    [Confirm & Add]       │
└─────────────────────────────────────────┘
```

- All values are editable before confirming
- On confirm → `addMeal()` called on the Zustand store → timeline and rings update instantly

---

### 7. Goal Settings Sheet (`GoalSettingsSheet`)

Triggered from the header cog button. Opens as a right-side `Sheet` (shadcn/ui).

**Fields:**

| Field | Input type | Notes |
|---|---|---|
| Daily calorie goal | Number input | kcal |
| Protein goal | Number input | grams |
| Carbs goal | Number input | grams |
| Fat goal | Number input | grams |
| TDEE calculator | Expandable section | Fills goals from BMR + activity level |

**TDEE Calculator inputs**: weight (kg), height (cm), age, sex, activity level → auto-computes suggested goals using the Mifflin-St Jeor formula (see `lib/nutrition.ts`).

---

## State Management

All dashboard state lives in the Zustand store (`lib/store.ts`). The dashboard reads and writes through the `useDailyLog` hook.

```ts
// hooks/useDailyLog.ts
const { today, addMeal, removeMeal, updateMeal } = useDailyLog();
```

`today` is the `DailyLog` for the current date. `totals` (calories, protein, carbs, fat) are recomputed on every `addMeal` / `removeMeal` / `updateMeal` call and drive all the charts and bars.

---

## Component Tree

```
app/dashboard/page.tsx  ('use client')
├── DashboardHeader
│   └── GoalSettingsSheet
├── CalorieSummaryRing       ← Chart.js doughnut
├── MacroDistributionRing    ← Chart.js segmented doughnut
├── MacroBreakdownBar        ← Tailwind progress bars
├── MealTimeline
│   └── MealEntryCard[]
└── AddMealPanel             ← shadcn/ui Sheet (bottom)
    ├── VoiceInput           ← useVoiceRecorder hook
    ├── TextMealInput
    ├── ManualEntryForm
    └── MealConfirmCard
```

---

## Data Dependencies

| Data | Source | How |
|---|---|---|
| Today's meals + totals | Zustand store | `useDailyLog()` hook |
| User's calorie/macro goals | Zustand store | `useUserProfile()` hook |
| AI meal estimate | `POST /api/ai/parse-meal` | Vercel AI SDK `streamObject` |
| Voice transcript | Web Speech API / `POST /api/ai/voice` | `useVoiceRecorder()` hook |
| Food search results | Open Food Facts API | `fetch` inside `ManualEntryForm` |

---

## Related Docs

- [features.md](../features.md) — feature-level spec
- [ai-integration.md](../ai-integration.md) — AI parsing pipeline
- [data-visualization.md](../data-visualization.md) — chart configuration details
- [data-model.md](../data-model.md) — `MealEntry`, `DailyLog`, `UserProfile` types
