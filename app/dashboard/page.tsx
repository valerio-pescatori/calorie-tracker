"use client";

import { useMemo, useEffect } from "react";
import { Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { computeTotals } from "@/lib/nutrition";
import { CalorieSummaryRing } from "@/components/dashboard/CalorieSummaryRing";
import { MacroDistributionRing } from "@/components/dashboard/MacroDistributionRing";
import { MacroBreakdownBar } from "@/components/dashboard/MacroBreakdownBar";
import { MealTimeline } from "@/components/dashboard/MealTimeline";
import { AddMealPanel } from "@/components/dashboard/AddMealPanel";
import { GoalSettingsSheet } from "@/components/dashboard/GoalSettingsSheet";
import { Button } from "@/components/ui/button";

const EMPTY_MEALS: [] = [];

export default function DashboardPage() {
  const key = new Date().toISOString().slice(0, 10);
  const meals = useStore((s) => s.logs[key]?.meals ?? EMPTY_MEALS);
  const goals = useStore((s) => s.profile.goals);
  const totals = useMemo(() => computeTotals(meals), [meals]);

  const hydrateForDate = useStore((s) => s.hydrateForDate);
  const hydrateProfile = useStore((s) => s.hydrateProfile);

  // Hydrate store from server on first render
  useEffect(() => {
    hydrateForDate(key);
    hydrateProfile();
  }, [key, hydrateForDate, hydrateProfile]);

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="relative min-h-dvh pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground leading-tight">Today</h1>
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
        </div>
        <GoalSettingsSheet>
          <Button variant="ghost" size="icon" aria-label="Open goal settings">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </GoalSettingsSheet>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Calorie & Macro rings */}
        <section className="grid grid-cols-2 gap-2 glass-card-elevated p-5">
          <CalorieSummaryRing consumed={totals.calories} goal={goals.calories} />
          <MacroDistributionRing totals={totals} />
        </section>

        {/* Macro progress bars */}

        <MacroBreakdownBar totals={totals} goals={goals} />

        {/* Meal list grouped by meal type */}
        <MealTimeline meals={meals} />
      </main>

      {/* Floating add meal button + sheet */}
      <AddMealPanel />
    </div>
  );
}
