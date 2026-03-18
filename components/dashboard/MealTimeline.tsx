"use client";

import { cn } from "@/lib/utils";
import type { MealEntry, MealType } from "@/types";
import { Apple, Moon, Scale, Sun } from "lucide-react";
import { type ComponentType } from "react";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  meals: MealEntry[];
}

interface MealSection {
  type: MealType;
  icon: ComponentType<{ size?: number; className?: string }>;
  bg: string;
  text: string;
}

const MEAL_SECTIONS: MealSection[] = [
  { type: "breakfast", icon: Sun, bg: "bg-violet-500/20", text: "text-violet-500" },
  { type: "lunch", icon: Scale, bg: "bg-teal-500/20", text: "text-teal-500" },
  { type: "dinner", icon: Moon, bg: "bg-indigo-500/20", text: "text-indigo-500" },
  { type: "snack", icon: Apple, bg: "bg-amber-500/20", text: "text-amber-500" },
];

export function MealTimeline({ meals }: Props) {
  const { LL } = useI18nContext();
  const sectionLabels: Record<MealType, string> = {
    breakfast: LL.common.breakfast(),
    lunch: LL.common.lunch(),
    dinner: LL.common.dinner(),
    snack: LL.common.snacks(),
  };
  const grouped = new Map<MealType, MealEntry[]>();
  for (const meal of meals) {
    const group = grouped.get(meal.mealType) ?? [];
    group.push(meal);
    grouped.set(meal.mealType, group);
  }

  const sections = MEAL_SECTIONS.filter(({ type }) => (grouped.get(type)?.length ?? 0) > 0);

  if (sections.length === 0) {
    return <p className="text-xs text-foreground/30 text-center py-4">{LL.dashboard.noMeals()}</p>;
  }

  return (
    <div className="space-y-3">
      {sections.map(({ type, icon: Icon, bg, text }) => {
        const group = grouped.get(type)!;
        const sectionKcal = group.reduce((s, m) => s + m.calories, 0);
        const description = group.map((m) => m.name).join(", ");

        return (
          <div key={type} className="glass-card flex items-center gap-4 p-4">
            {/* Icon */}
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon size={20} className={text} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{sectionLabels[type]}</p>
              <p className="text-xs text-muted-foreground truncate">{description}</p>
            </div>

            {/* Kcal */}
            <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
              {sectionKcal} <span className="text-xs font-normal text-muted-foreground">{LL.common.kcal()}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
