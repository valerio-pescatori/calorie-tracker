import { create } from "zustand";
import type { MealEntry, DailyLog, MacroTotals, BodyStats } from "@/types";
import { computeTotals } from "./nutrition";
import { v4 as uuidv4 } from "uuid";
import { todayKey } from "./date";

function emptyLog(date: string): DailyLog {
  return { date, meals: [] };
}

interface Store {
  /** Daily logs keyed by date (YYYY-MM-DD) */
  logs: Record<string, DailyLog>;
  goals: MacroTotals | null;
  bodyStats: BodyStats;
  /** Dates whose meals have already been fetched from the server */
  hydratedDates: Set<string>;
  profileHydrated: boolean;
  /** null = unknown (not yet fetched), false = no row in DB, true = row exists */
  profileExists: boolean | null;
  isAddMealOpen: boolean;
}

interface Actions {
  addMeal: (entry: Omit<MealEntry, "id" | "timestamp">, date?: string) => Promise<void>;
  removeMeal: (id: string, date?: string) => Promise<void>;
  updateMeal: (id: string, patch: Partial<Omit<MealEntry, "id">>, date?: string) => Promise<void>;
  updateGoals: (goals: MacroTotals) => Promise<void>;
  updateBodyStats: (stats: Partial<BodyStats>) => Promise<void>;
  /** Load meals for a date from the server (no-op if already loaded) */
  hydrateForDate: (date: string) => Promise<void>;
  /** Load profile/goals from the server (no-op if already loaded) */
  hydrateProfile: () => Promise<void>;
  setAddMealOpen: (v: boolean) => void;
}

export type StoreState = Store & Actions;

export const useStore = create<StoreState>()((set, get) => ({
  logs: {},
  hydratedDates: new Set(),
  profileHydrated: false,
  profileExists: null,

  goals: null,
  bodyStats: {},
  isAddMealOpen: false,
  setAddMealOpen: (v) => set({ isAddMealOpen: v }),

  // ─── Hydration ─────────────────────────────────────────────────────────────

  hydrateForDate: async (date) => {
    if (get().hydratedDates.has(date)) return;

    const res = await fetch(`/api/meals?date=${date}`);
    if (!res.ok) return;

    const { meals } = (await res.json()) as { meals: MealEntry[] };
    set((state) => ({
      hydratedDates: new Set([...state.hydratedDates, date]),
      logs: {
        ...state.logs,
        [date]: { date, meals },
      },
    }));
  },

  hydrateProfile: async () => {
    if (get().profileHydrated) return;

    const res = await fetch("/api/profile");
    if (!res.ok) return;

    const { profile } = await res.json();

    if (!profile) {
      set({ profileHydrated: true, profileExists: false });
      return;
    }

    set({
      profileHydrated: true,
      profileExists: true,
      goals: {
        calories: profile.calories,
        protein: profile.protein,
        carbs: profile.carbs,
        fat: profile.fat,
      },
      bodyStats: {
        weightKg: profile.weightKg ?? undefined,
        heightCm: profile.heightCm ?? undefined,
        ageYears: profile.ageYears ?? undefined,
        sex: profile.sex ?? undefined,
        activityLevel: profile.activityLevel ?? undefined,
      },
    });
  },

  // ─── Mutations ─────────────────────────────────────────────────────────────

  addMeal: async (entry, date) => {
    const key = date ?? todayKey();

    // Optimistic update
    const tempId = uuidv4();
    const newMeal: MealEntry = {
      ...entry,
      id: tempId,
      timestamp: new Date().toISOString(),
    };
    set((state) => {
      const log = state.logs[key] ?? emptyLog(key);
      return {
        logs: { ...state.logs, [key]: { ...log, meals: [...log.meals, newMeal] } },
      };
    });

    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, date: key }),
      });
      if (!res.ok) throw new Error("Failed to save meal");

      const { meal } = (await res.json()) as { meal: MealEntry };
      // Replace temp entry with the server-assigned id
      set((state) => {
        const log = state.logs[key];
        if (!log) return state;
        return {
          logs: {
            ...state.logs,
            [key]: {
              ...log,
              meals: log.meals.map((m) => (m.id === tempId ? meal : m)),
            },
          },
        };
      });
    } catch {
      // Rollback
      set((state) => {
        const log = state.logs[key];
        if (!log) return state;
        return {
          logs: {
            ...state.logs,
            [key]: { ...log, meals: log.meals.filter((m) => m.id !== tempId) },
          },
        };
      });
    }
  },

  removeMeal: async (id, date) => {
    const key = date ?? todayKey();
    const prevLog = get().logs[key];

    // Optimistic remove
    set((state) => {
      const log = state.logs[key];
      if (!log) return state;
      return {
        logs: { ...state.logs, [key]: { ...log, meals: log.meals.filter((m) => m.id !== id) } },
      };
    });

    try {
      const res = await fetch(`/api/meals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete meal");
    } catch {
      // Rollback
      if (prevLog) {
        set((state) => ({ logs: { ...state.logs, [key]: prevLog } }));
      }
    }
  },

  updateMeal: async (id, patch, date) => {
    const key = date ?? todayKey();
    const prevLog = get().logs[key];

    // Optimistic update
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

    try {
      const res = await fetch(`/api/meals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update meal");
    } catch {
      if (prevLog) {
        set((state) => ({ logs: { ...state.logs, [key]: prevLog } }));
      }
    }
  },

  updateGoals: async (goals) => {
    const prevGoals = get().goals;

    // Optimistic
    set({ goals });

    try {
      const res = await fetch("/api/profile/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });
      if (!res.ok) throw new Error("Failed to update goals");
      set({ profileExists: true });
    } catch {
      set({ goals: prevGoals });
    }
  },

  updateBodyStats: async (stats) => {
    const prevBodyStats = get().bodyStats;

    // Optimistic
    set((state) => ({ bodyStats: { ...state.bodyStats, ...stats } }));

    try {
      const res = await fetch("/api/profile/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      if (!res.ok) throw new Error("Failed to update body stats");
    } catch {
      set({ bodyStats: prevBodyStats });
    }
  },
}));

// Selectors — derive totals from meals rather than storing redundant data
export const selectTodayTotals = (state: StoreState): MacroTotals => computeTotals(state.logs[todayKey()]?.meals ?? []);

export const selectTotalsForDate =
  (date: string) =>
  (state: StoreState): MacroTotals =>
    computeTotals(state.logs[date]?.meals ?? []);
