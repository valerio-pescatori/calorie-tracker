"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MealEntry, MealType } from "@/types";

interface Props {
  meals: MealEntry[];
}

const MEAL_SECTIONS: { type: MealType; label: string; emoji: string }[] = [
  { type: "breakfast", label: "Breakfast", emoji: "🌅" },
  { type: "lunch", label: "Lunch", emoji: "☀️" },
  { type: "dinner", label: "Dinner", emoji: "🌙" },
  { type: "snack", label: "Snacks", emoji: "🍎" },
];


export function MealTimeline({ meals }: Props) {
  const grouped = new Map<MealType, MealEntry[]>();
  for (const meal of meals) {
    const group = grouped.get(meal.mealType) ?? [];
    group.push(meal);
    grouped.set(meal.mealType, group);
  }

  const totalKcal = meals.reduce((s, m) => s + m.calories, 0);

  return (
    <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Meals Today</h3>
          <div className="flex items-center gap-1.5">
            {totalKcal > 0 && (
              <span className="text-xs font-medium text-muted-foreground">{totalKcal} kcal</span>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {meals.length === 0 ? (
          <p className="text-xs text-foreground/30 text-center py-2">No meals logged yet — tap to add one</p>
        ) : (
          <div className="divide-y divide-white/5">
            {MEAL_SECTIONS.map(({ type, label, emoji }) => {
              const group = grouped.get(type) ?? [];
              const sectionKcal = group.reduce((s, m) => s + m.calories, 0);
              const hasItems = group.length > 0;
              return (
                <div key={type} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                  <span className="text-base w-5 shrink-0 leading-none">{emoji}</span>
                  <span className={cn("flex-1 text-xs", hasItems ? "text-foreground" : "text-foreground/30")}>
                    {label}
                  </span>
                  {hasItems ? (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {group.length} item{group.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-medium text-foreground w-16 text-right">
                        {sectionKcal} kcal
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-foreground/20">—</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
