import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MealEntry, DailyLog, MacroTotals, UserProfile } from "@/types";
import { computeTotals } from "./nutrition";
import { todayKey } from "./date";

function emptyLog(date: string): DailyLog {
  return { date, meals: [] };
}

// Safe storage that falls back to a noop during SSR
const safeStorage = createJSONStorage(() => {
  if (typeof localStorage !== "undefined") return localStorage;
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  } as unknown as Storage;
});

interface Store {
  /** Daily logs keyed by date (YYYY-MM-DD) */
  logs: Record<string, DailyLog>;
  profile: UserProfile;
}

interface Actions {
  addMeal: (entry: Omit<MealEntry, "id" | "timestamp">) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, patch: Partial<Omit<MealEntry, "id">>) => void;
  updateGoals: (goals: Partial<MacroTotals>) => void;
  updateProfile: (patch: Partial<Omit<UserProfile, "goals">>) => void;
}

export type StoreState = Store & Actions;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      logs: {},

      addMeal: (entry) => {
        const key = todayKey();
        set((state) => {
          const log = state.logs[key] ?? emptyLog(key);
          const newMeal: MealEntry = {
            ...entry,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
          };
          return {
            logs: { ...state.logs, [key]: { ...log, meals: [...log.meals, newMeal] } },
          };
        });
      },

      removeMeal: (id) => {
        const key = todayKey();
        set((state) => {
          const log = state.logs[key];
          if (!log) return state;
          return {
            logs: { ...state.logs, [key]: { ...log, meals: log.meals.filter((m) => m.id !== id) } },
          };
        });
      },

      updateMeal: (id, patch) => {
        const key = todayKey();
        set((state) => {
          const log = state.logs[key];
          if (!log) return state;
          return {
            logs: {
              ...state.logs,
              [key]: { ...log, meals: log.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) },
            },
          };
        });
      },

      profile: {
        goals: { calories: 2000, protein: 150, carbs: 200, fat: 65 },
      },

      updateGoals: (goals) =>
        set((state) => ({
          profile: { ...state.profile, goals: { ...state.profile.goals, ...goals } },
        })),

      updateProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
    }),
    { name: "calorie-tracker", storage: safeStorage },
  ),
);

// Selectors — derive totals from meals rather than storing redundant data
export const selectTodayTotals = (state: StoreState): MacroTotals =>
  computeTotals(state.logs[todayKey()]?.meals ?? []);

export const selectTotalsForDate = (date: string) => (state: StoreState): MacroTotals =>
  computeTotals(state.logs[date]?.meals ?? []);
