"use client";

import { Input } from "@/components/ui/input";
import type { MacroFormData } from "./types";
import { MACRO_FIELDS } from "./types";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import { MacroTotals } from "@/types";

interface Props {
  macros: MacroFormData;
  onChange: React.Dispatch<React.SetStateAction<MacroFormData>>;
  showPlaceholders?: boolean;
}

const g = (s: string) => parseFloat(s) || 0;
const fmt = (n: number) => String(Math.round(n * 10) / 10);

export function MacroFields({ macros, onChange, showPlaceholders = false }: Props) {
  const { LL } = useI18nContext();
  const fieldLabels: Record<keyof MacroTotals, string> = {
    calories: LL.common.calories(),
    protein: LL.common.protein(),
    carbs: LL.common.carbs(),
    fat: LL.common.fat(),
  };
  function handleChange(key: keyof MacroFormData, raw: string) {
    onChange((prev) => {
      if (key === "calories") {
        // Redistribute using AMDR 40% carbs / 30% protein / 30% fat
        const kcal = parseFloat(raw) || 0;
        return {
          calories: raw,
          carbs: fmt((kcal * 0.4) / 4),
          protein: fmt((kcal * 0.3) / 4),
          fat: fmt((kcal * 0.3) / 9),
        };
      }

      // Macro changed — recompute calories from macros
      const newP = key === "protein" ? g(raw) : g(prev.protein);
      const newC = key === "carbs" ? g(raw) : g(prev.carbs);
      const newF = key === "fat" ? g(raw) : g(prev.fat);
      return {
        ...prev,
        [key]: raw,
        calories: String(Math.round(newP * 4 + newC * 4 + newF * 9)),
      };
    });
  }

  return (
    <div className="space-y-4">
      {MACRO_FIELDS.map(({ key, unit, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">{fieldLabels[key]}</label>
          <div className="relative">
            <Input
              type="number"
              min={0}
              placeholder={showPlaceholders ? placeholder : undefined}
              value={macros[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
