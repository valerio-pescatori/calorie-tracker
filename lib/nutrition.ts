import type { MacroTotals, BodyStats, ActivityLevel } from '@/types';

export function computeTotals(
  meals: Array<{ calories: number; protein: number; carbs: number; fat: number }>,
): MacroTotals {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function macrosToCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9);
}

/** Mifflin-St Jeor BMR */
export function calcBMR(stats: BodyStats): number {
  const { weightKg = 70, heightCm = 170, ageYears = 30, sex = 'male' } = stats;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return sex === 'female' ? base - 161 : base + 5;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calcTDEE(stats: BodyStats): number {
  return Math.round(calcBMR(stats) * ACTIVITY_MULTIPLIERS[stats.activityLevel ?? 'sedentary']);
}

export function getProgressColor(consumed: number, goal: number): string {
  if (goal <= 0) return 'hsl(142, 71%, 45%)';
  const ratio = consumed / goal;
  if (ratio > 1) return 'hsl(0, 72%, 51%)';
  if (ratio >= 0.9) return 'hsl(38, 92%, 50%)';
  return 'hsl(142, 71%, 45%)';
}
