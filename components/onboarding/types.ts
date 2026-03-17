import type { ActivityLevel, MacroTotals, BodyStats } from "@/types";

export type Step = "welcome" | "path" | "body-stats" | "activity" | "weight-goal" | "review" | "direct";

export type WeightGoal = "lose" | "maintain" | "gain";

export const WEIGHT_GOAL_DELTA: Record<WeightGoal, number> = { lose: -500, maintain: 0, gain: 500 };

export interface BodyFormData {
  weightKg: string;
  heightCm: string;
  ageYears: string;
  sex: NonNullable<BodyStats["sex"]>;
}

export type MacroFormData = Record<keyof MacroTotals, string>;

export const MACRO_FIELDS: { key: keyof MacroFormData; label: string; unit: string; placeholder: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal", placeholder: "2000" },
  { key: "protein", label: "Protein", unit: "g", placeholder: "150" },
  { key: "carbs", label: "Carbs", unit: "g", placeholder: "200" },
  { key: "fat", label: "Fat", unit: "g", placeholder: "65" },
];

export const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly active", description: "1–3 days/week" },
  { value: "moderately_active", label: "Moderately active", description: "3–5 days/week" },
  { value: "very_active", label: "Very active", description: "6–7 days/week" },
  { value: "extra_active", label: "Extra active", description: "Physical job or 2× daily training" },
];

export const GUIDED_PROGRESS: Partial<Record<Step, number>> = {
  "body-stats": 1,
  activity: 2,
  "weight-goal": 3,
  review: 4,
};

export const BACK_MAP: Partial<Record<Step, Step>> = {
  path: "welcome",
  "body-stats": "path",
  activity: "body-stats",
  "weight-goal": "activity",
  review: "weight-goal",
  direct: "path",
};
