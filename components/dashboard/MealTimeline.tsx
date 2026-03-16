"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Mic, PenLine, Search, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
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

const SOURCE_ICON: Record<MealEntry["source"], React.ReactNode> = {
  ai_voice: <Mic className="h-3 w-3" />,
  ai_text: <PenLine className="h-3 w-3" />,
  manual: <PenLine className="h-3 w-3" />,
  search: <Search className="h-3 w-3" />,
};

function MealCard({ meal }: { meal: MealEntry }) {
  const [expanded, setExpanded] = useState(false);
  const removeMeal = useStore((s) => s.removeMeal);
  const time = new Date(meal.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground truncate">{meal.name}</span>
            {meal.confidence === "low" && <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
            <span className="text-foreground/40 shrink-0">{SOURCE_ICON[meal.source]}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
            <span>{time}</span>
            <span>·</span>
            <span>P {Math.round(meal.protein)}g</span>
            <span>C {Math.round(meal.carbs)}g</span>
            <span>F {Math.round(meal.fat)}g</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-foreground shrink-0">{meal.calories} kcal</span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-foreground/40 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground/40 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/[0.06]">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              {
                label: "Protein",
                value: meal.protein,
                color: "text-violet-300",
                bg: "bg-violet-500/10",
                border: "border-violet-500/20",
              },
              {
                label: "Carbs",
                value: meal.carbs,
                color: "text-teal-300",
                bg: "bg-teal-500/10",
                border: "border-teal-500/20",
              },
              {
                label: "Fat",
                value: meal.fat,
                color: "text-amber-300",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
            ].map(({ label, value, color, bg, border }) => (
              <div key={label} className={`${bg} border ${border} rounded-lg py-2`}>
                <p className={`text-base font-bold ${color}`}>{Math.round(value)}g</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {meal.confidence === "medium" && (
            <Badge variant="secondary" className="text-xs">
              Medium confidence
            </Badge>
          )}
          {meal.confidence === "low" && (
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/10">
              ⚠ Low confidence
            </Badge>
          )}
          {meal.notes && <p className="text-xs text-muted-foreground italic">&ldquo;{meal.notes}&rdquo;</p>}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
              onClick={() => removeMeal(meal.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MealTimeline({ meals }: Props) {
  const grouped = new Map<MealType, MealEntry[]>();
  for (const meal of meals) {
    const group = grouped.get(meal.mealType) ?? [];
    group.push(meal);
    grouped.set(meal.mealType, group);
  }

  return (
    <div className="space-y-4">
      {MEAL_SECTIONS.map(({ type, label, emoji }) => {
        const group = grouped.get(type) ?? [];
        const sectionKcal = group.reduce((s, m) => s + m.calories, 0);

        return (
          <section key={type} className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{emoji}</span>
                <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              </div>
              {sectionKcal > 0 && <span className="text-xs font-medium text-muted-foreground">{sectionKcal} kcal</span>}
            </div>

            {group.length === 0 ? (
              <p className="text-xs text-foreground/30 text-center py-2">No meals logged</p>
            ) : (
              <div className="space-y-2">
                {group.map((meal, i) => (
                  <div key={meal.id}>
                    {i > 0 && <Separator className="my-2 bg-white/5" />}
                    <MealCard meal={meal} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
