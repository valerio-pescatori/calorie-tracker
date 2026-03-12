# Data Model

All types are defined in `types/index.ts` and validated with Zod schemas.

---

## Core Types

### `MealEntry`

A single AI-parsed or manually entered meal item.

```ts
interface MealEntry {
  id:         string;          // uuid
  name:       string;          // "Pasta Bolognese"
  calories:   number;          // total kcal
  protein:    number;          // grams
  carbs:      number;          // grams
  fat:        number;          // grams
  mealType:   MealType;        // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  timestamp:  string;          // ISO 8601
  source:     EntrySource;     // 'ai_voice' | 'ai_text' | 'manual' | 'search'
  confidence?: 'high' | 'medium' | 'low';  // AI entries only
  notes?:     string;          // AI assumption notes
}

type MealType   = 'breakfast' | 'lunch' | 'dinner' | 'snack';
type EntrySource = 'ai_voice' | 'ai_text' | 'manual' | 'search';
```

---

### `DailyLog`

All meals for a single calendar day.

```ts
interface DailyLog {
  date:    string;         // 'YYYY-MM-DD'
  meals:   MealEntry[];
  totals:  MacroTotals;    // derived, recomputed on save
}

interface MacroTotals {
  calories: number;
  protein:  number;
  carbs:    number;
  fat:      number;
}
```

---

### `UserProfile`

User settings and nutrition goals.

```ts
interface UserProfile {
  id:              string;
  displayName?:    string;

  // Goals
  goalCalories:    number;       // daily kcal target
  goalProtein:     number;       // grams
  goalCarbs:       number;       // grams
  goalFat:         number;       // grams

  // BMR inputs (optional, used by TDEE calculator)
  weightKg?:       number;
  heightCm?:       number;
  ageYears?:       number;
  sex?:            'male' | 'female' | 'other';
  activityLevel?:  ActivityLevel;

  // Preferences
  theme:           'light' | 'dark' | 'system';
  unitSystem:      'metric' | 'imperial';
}

type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';
```

---

## Derived Calculations

```ts
// lib/nutrition.ts

/** Calories from macros (4/4/9 rule) */
export function macrosToCalories(p: number, c: number, f: number): number {
  return Math.round(p * 4 + c * 4 + f * 9);
}

/** Mifflin-St Jeor BMR */
export function calcBMR(profile: UserProfile): number {
  const { weightKg = 70, heightCm = 170, ageYears = 30, sex = 'male' } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'female' ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:          1.2,
  lightly_active:     1.375,
  moderately_active:  1.55,
  very_active:        1.725,
  extra_active:       1.9,
};

export function calcTDEE(profile: UserProfile): number {
  return Math.round(calcBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel ?? 'sedentary']);
}
```

---

## Persistence (Phase 1 — Offline / Local)

All data is stored client-side using **IndexedDB** via the `idb` library.

| Store name | Key | Description |
|---|---|---|
| `daily_logs` | `date` (YYYY-MM-DD) | One `DailyLog` per day |
| `user_profile` | `'profile'` | Single `UserProfile` record |

### Zustand + idb integration

```ts
// lib/store.ts  (simplified)
const useDailyLogStore = create<DailyLogState>()(
  persist(
    (set, get) => ({
      today: null,
      addMeal: (entry) => { /* append to today.meals, recompute totals */ },
      removeMeal: (id)  => { /* filter out */ },
    }),
    {
      name: 'calorie-tracker-log',
      storage: createJSONStorage(() => localforage),  // IndexedDB under the hood
    }
  )
);
```

---

## Persistence (Phase 2 — Server / Sync)

When backend is added, data syncs to **PostgreSQL** via **Drizzle ORM**.

Schema sketch:

```sql
-- users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- meal_entries
CREATE TABLE meal_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  logged_at   TIMESTAMPTZ NOT NULL,
  meal_type   TEXT NOT NULL,
  name        TEXT NOT NULL,
  calories    INT NOT NULL,
  protein     NUMERIC(6,2) NOT NULL,
  carbs       NUMERIC(6,2) NOT NULL,
  fat         NUMERIC(6,2) NOT NULL,
  source      TEXT NOT NULL,
  confidence  TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- user_goals
CREATE TABLE user_goals (
  user_id         UUID PRIMARY KEY REFERENCES users(id),
  goal_calories   INT NOT NULL,
  goal_protein    NUMERIC(6,2),
  goal_carbs      NUMERIC(6,2),
  goal_fat        NUMERIC(6,2),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```
