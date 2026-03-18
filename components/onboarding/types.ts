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

export const MACRO_FIELDS: { key: keyof MacroFormData; unit: string; placeholder: string }[] = [
  { key: "calories", unit: "kcal", placeholder: "2000" },
  { key: "protein", unit: "g", placeholder: "150" },
  { key: "carbs", unit: "g", placeholder: "200" },
  { key: "fat", unit: "g", placeholder: "65" },
];

export const ACTIVITY_OPTIONS: ActivityLevel[] = [
  "sedentary",
  "lightly_active",
  "moderately_active",
  "very_active",
  "extra_active",
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
