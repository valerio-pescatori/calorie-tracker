"use client";

import { useMemo, useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import { computeTotals } from "@/lib/nutrition";
import { CalorieSummaryRing } from "@/components/dashboard/CalorieSummaryRing";
import { MacroMiniCards } from "@/components/dashboard/MacroMiniCards";
import { MealTimeline } from "@/components/dashboard/MealTimeline";
import { AddMealPanel } from "@/components/dashboard/AddMealPanel";
import { GoalSettingsSheet } from "@/components/dashboard/GoalSettingsSheet";
import { WeeklyCaloriesChart } from "@/components/dashboard/WeeklyCaloriesChart";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const EMPTY_MEALS: [] = [];

export default function DashboardPage() {
  const key = new Date().toISOString().slice(0, 10);
  const meals = useStore((s) => s.logs[key]?.meals ?? EMPTY_MEALS);
  const goals = useStore((s) => s.goals);
  const profileExists = useStore((s) => s.profileExists);
  const totals = useMemo(() => computeTotals(meals), [meals]);

  const hydrateForDate = useStore((s) => s.hydrateForDate);
  const hydrateProfile = useStore((s) => s.hydrateProfile);

  const [addMealOpen, setAddMealOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string>("");
  const { LL, locale, setLocale } = useI18nContext();

  function switchLocale(next: typeof locale) {
    setLocale(next);
    localStorage.setItem('locale', next);
    document.cookie = `locale=${next};path=/;max-age=31536000`;
  }

  useEffect(() => {
    hydrateForDate(key);
    hydrateProfile();
  }, [key, hydrateForDate, hydrateProfile]);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const user = data.user;
        const name =
          user?.user_metadata?.full_name ??
          user?.email?.split("@")[0] ??
          "there";
        setDisplayName(name);
      });
  }, []);

  // Avatar initials (first letter of each word, max 2)
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="relative min-h-dvh pb-28">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-200 shrink-0">
            {initials || "?"}
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{LL.dashboard.welcomeBack()}</p>
            <h1 className="text-base font-bold text-foreground leading-tight">
              {displayName || "…"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchLocale('en')}
            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
              locale === 'en' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => switchLocale('it')}
            className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
              locale === 'it' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            IT
          </button>
          <GoalSettingsSheet>
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label={LL.goals.openSettings()}>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            {profileExists === false && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-400 pointer-events-none" />
            )}
          </div>
        </GoalSettingsSheet>
        </div>
      </header>

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

      {/* Add Meal Sheet (controlled by BottomNav) */}
      <AddMealPanel open={addMealOpen} onOpenChange={setAddMealOpen} />

      {/* Bottom nav */}
      <BottomNav onAddMeal={() => setAddMealOpen(true)} />
    </div>
  );
}
