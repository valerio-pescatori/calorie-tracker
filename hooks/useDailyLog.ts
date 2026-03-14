import { useStore, selectTodayTotals, type StoreState } from "@/lib/store";
import { todayKey } from "@/lib/date";
import type { DailyLog, MacroTotals } from "@/types";

export function useDailyLog(): DailyLog & {
  totals: MacroTotals;
  addMeal: StoreState["addMeal"];
  removeMeal: StoreState["removeMeal"];
  updateMeal: StoreState["updateMeal"];
} {
  const today = todayKey();
  const meals = useStore((s) => s.logs[today]?.meals ?? []);
  const totals = useStore(selectTodayTotals);
  const addMeal = useStore((s) => s.addMeal);
  const removeMeal = useStore((s) => s.removeMeal);
  const updateMeal = useStore((s) => s.updateMeal);

  return { date: today, meals, totals, addMeal, removeMeal, updateMeal };
}
