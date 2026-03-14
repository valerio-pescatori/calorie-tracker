'use client';

import { Settings } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CalorieSummaryRing } from '@/components/dashboard/CalorieSummaryRing';
import { MacroDistributionRing } from '@/components/dashboard/MacroDistributionRing';
import { MacroBreakdownBar } from '@/components/dashboard/MacroBreakdownBar';
import { MealTimeline } from '@/components/dashboard/MealTimeline';
import { AddMealPanel } from '@/components/dashboard/AddMealPanel';
import { GoalSettingsSheet } from '@/components/dashboard/GoalSettingsSheet';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const key = new Date().toISOString().slice(0, 10);
  const today = useStore((s) => s.logs[key] ?? { date: key, meals: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });
  const goals = useStore((s) => s.profile.goals);

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-dvh bg-zinc-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 leading-tight">Today</h1>
          <p className="text-xs text-zinc-500">{dateLabel}</p>
        </div>
        <GoalSettingsSheet>
          <Button variant="ghost" size="icon" aria-label="Open goal settings">
            <Settings className="h-5 w-5 text-zinc-600" />
          </Button>
        </GoalSettingsSheet>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        {/* Calorie & Macro rings */}
        <section className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-5 shadow-sm">
          <CalorieSummaryRing consumed={today.totals.calories} goal={goals.calories} />
          <MacroDistributionRing totals={today.totals} />
        </section>

        {/* Macro progress bars */}
        <MacroBreakdownBar totals={today.totals} goals={goals} />

        {/* Meal list grouped by meal type */}
        <MealTimeline meals={today.meals} />
      </main>

      {/* Floating add meal button + sheet */}
      <AddMealPanel />
    </div>
  );
}
