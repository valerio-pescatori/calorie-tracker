'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Mic, PenLine, Search, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import type { MealEntry, MealType } from '@/types';

interface Props {
  meals: MealEntry[];
}

const MEAL_SECTIONS: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { type: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { type: 'snack',     label: 'Snacks',    emoji: '🍎' },
];

const SOURCE_ICON: Record<MealEntry['source'], React.ReactNode> = {
  ai_voice: <Mic className="h-3 w-3" />,
  ai_text:  <PenLine className="h-3 w-3" />,
  manual:   <PenLine className="h-3 w-3" />,
  search:   <Search className="h-3 w-3" />,
};

function MealCard({ meal }: { meal: MealEntry }) {
  const [expanded, setExpanded] = useState(false);
  const removeMeal = useStore((s) => s.removeMeal);
  const time = new Date(meal.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-100 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-900 truncate">{meal.name}</span>
            {meal.confidence === 'low' && (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            )}
            <span className="text-zinc-400 shrink-0">{SOURCE_ICON[meal.source]}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
            <span>{time}</span>
            <span>·</span>
            <span>P {Math.round(meal.protein)}g</span>
            <span>C {Math.round(meal.carbs)}g</span>
            <span>F {Math.round(meal.fat)}g</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-zinc-800 shrink-0">{meal.calories} kcal</span>
        {expanded ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-100">
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Protein', value: meal.protein, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Carbs',   value: meal.carbs,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Fat',     value: meal.fat,     color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg py-2`}>
                <p className={`text-base font-bold ${color}`}>{Math.round(value)}g</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>

          {meal.confidence === 'medium' && (
            <Badge variant="secondary" className="text-xs">Medium confidence</Badge>
          )}
          {meal.confidence === 'low' && (
            <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
              ⚠ Low confidence
            </Badge>
          )}
          {meal.notes && (
            <p className="text-xs text-zinc-400 italic">"{meal.notes}"</p>
          )}

          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
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
          <section key={type} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{emoji}</span>
                <h3 className="text-sm font-semibold text-zinc-800">{label}</h3>
              </div>
              {sectionKcal > 0 && (
                <span className="text-xs font-medium text-zinc-500">{sectionKcal} kcal</span>
              )}
            </div>

            {group.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-2">No meals logged</p>
            ) : (
              <div className="space-y-2">
                {group.map((meal, i) => (
                  <div key={meal.id}>
                    {i > 0 && <Separator className="my-2" />}
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
