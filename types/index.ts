export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type EntrySource = "ai_voice" | "ai_text" | "manual" | "search";
export type Confidence = "high" | "medium" | "low";

export interface MealEntry extends MacroTotals {
  id: string;
  name: string;
  mealType: MealType;
  timestamp: string; // ISO 8601
  source: EntrySource;
  confidence?: Confidence;
  notes?: string;
}

export interface PCF {
  protein: number;
  carbs: number;
  fat: number;
}

export type PCFKeys = keyof PCF;

export interface MacroTotals extends PCF {
  calories: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
}

export type ActivityLevel = "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extra_active";

export interface BodyStats {
  weightKg?: number;
  heightCm?: number;
  ageYears?: number;
  sex?: "male" | "female" | "other";
  activityLevel?: ActivityLevel;
}
