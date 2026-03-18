"use client";

import { useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import { computeTotals } from "@/lib/nutrition";
import { CalorieSummaryRing } from "@/components/dashboard/CalorieSummaryRing";
import { MacroMiniCards } from "@/components/dashboard/MacroMiniCards";
import { MealTimeline } from "@/components/dashboard/MealTimeline";
import { WeeklyCaloriesChart } from "@/components/dashboard/WeeklyCaloriesChart";

const EMPTY_MEALS: [] = [];

export default function DashboardPage() {
  const key = new Date().toISOString().slice(0, 10);
  const meals = useStore((s) => s.logs[key]?.meals ?? EMPTY_MEALS);
  const goals = useStore((s) => s.goals);
  const totals = useMemo(() => computeTotals(meals), [meals]);

  const hydrateForDate = useStore((s) => s.hydrateForDate);
  const hydrateProfile = useStore((s) => s.hydrateProfile);

  const { LL } = useI18nContext();

  useEffect(() => {
    hydrateForDate(key);
    hydrateProfile();
  }, [key, hydrateForDate, hydrateProfile]);

  return (
    <div className="relative min-h-dvh pb-28">
      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {/* Large calorie ring — centered */}
        <div className="flex justify-center">
          <CalorieSummaryRing consumed={totals.calories} goal={goals?.calories} />
        </div>

        {/* Macro mini cards */}
        <MacroMiniCards totals={totals} goals={goals} />

        {/* 7-day calorie history */}
        <WeeklyCaloriesChart />

        {/* Today's meals */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold tracking-wider text-foreground/50 uppercase">
            {LL.dashboard.todaysMeals()}
          </h2>
          <MealTimeline meals={meals} />
        </div>
      </main>
    </div>
  );
}
