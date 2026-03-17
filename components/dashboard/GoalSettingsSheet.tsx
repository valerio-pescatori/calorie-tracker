'use client';

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useStore } from '@/lib/store';
import { calcTDEE } from '@/lib/nutrition';
import type { MacroTotals, ActivityLevel, BodyStats } from '@/types';

interface Props {
  children: React.ReactNode;
}

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary',          label: 'Sedentary (little/no exercise)' },
  { value: 'lightly_active',     label: 'Lightly active (1–3 days/week)' },
  { value: 'moderately_active',  label: 'Moderately active (3–5 days/week)' },
  { value: 'very_active',        label: 'Very active (6–7 days/week)' },
  { value: 'extra_active',       label: 'Extra active (physical job)' },
];

export function GoalSettingsSheet({ children }: Props) {
  const goals = useStore((s) => s.goals);
  const bodyStats = useStore((s) => s.bodyStats);
  const updateGoals = useStore((s) => s.updateGoals);
  const updateBodyStats = useStore((s) => s.updateBodyStats);

  const [form, setForm] = useState({
    calories: goals?.calories?.toString() ?? '',
    protein: goals?.protein?.toString() ?? '',
    carbs: goals?.carbs?.toString() ?? '',
    fat: goals?.fat?.toString() ?? '',
  });
  const [tdeeOpen, setTdeeOpen] = useState(false);
  const [tdeeForm, setTdeeForm] = useState({
    weightKg: bodyStats.weightKg?.toString() ?? '',
    heightCm: bodyStats.heightCm?.toString() ?? '',
    ageYears: bodyStats.ageYears?.toString() ?? '',
    sex: bodyStats.sex ?? ('' as BodyStats['sex'] | ''),
    activityLevel: bodyStats.activityLevel ?? ('' as ActivityLevel | ''),
  });

  function handleTdeeFill() {
    const stats: BodyStats = {
      weightKg: tdeeForm.weightKg ? Number(tdeeForm.weightKg) : undefined,
      heightCm: tdeeForm.heightCm ? Number(tdeeForm.heightCm) : undefined,
      ageYears: tdeeForm.ageYears ? Number(tdeeForm.ageYears) : undefined,
      sex: tdeeForm.sex || undefined,
      activityLevel: (tdeeForm.activityLevel || undefined) as ActivityLevel | undefined,
    };
    const tdee = calcTDEE(stats);
    setForm((f) => ({ ...f, calories: String(tdee) }));
  }

  function handleSave() {
    updateBodyStats({
      weightKg: tdeeForm.weightKg ? Number(tdeeForm.weightKg) : undefined,
      heightCm: tdeeForm.heightCm ? Number(tdeeForm.heightCm) : undefined,
      ageYears: tdeeForm.ageYears ? Number(tdeeForm.ageYears) : undefined,
      sex: tdeeForm.sex || undefined,
      activityLevel: (tdeeForm.activityLevel || undefined) as ActivityLevel | undefined,
    });
    updateGoals({
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" /> Daily Goals
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Goal inputs */}
          {(
            [
              { key: 'calories', label: 'Calories', unit: 'kcal' },
              { key: 'protein',  label: 'Protein',  unit: 'g' },
              { key: 'carbs',    label: 'Carbs',    unit: 'g' },
              { key: 'fat',      label: 'Fat',      unit: 'g' },
            ] as { key: keyof MacroTotals; label: string; unit: string }[]
          ).map(({ key, label, unit }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                {label} <span className="text-muted-foreground">({unit})</span>
              </label>
              <input
                type="number"
                min={0}
                value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="input-dark"
              />
            </div>
          ))}

          <Button className="w-full" onClick={handleSave}>
            Save goals
          </Button>

          <Separator />

          {/* TDEE Calculator */}
          <button
            className="w-full text-left text-sm font-semibold text-foreground flex items-center justify-between"
            onClick={() => setTdeeOpen((v) => !v)}
          >
            TDEE Calculator
            <span className="text-muted-foreground text-xs">{tdeeOpen ? '▲ hide' : '▼ show'}</span>
          </button>

          {tdeeOpen && (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-muted-foreground">
                Calculates your Total Daily Energy Expenditure using the Mifflin-St Jeor formula and fills in your calorie goal.
              </p>

              {[
                { key: 'weightKg', label: 'Weight (kg)' },
                { key: 'heightCm', label: 'Height (cm)' },
                { key: 'ageYears', label: 'Age' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={tdeeForm[key as keyof typeof tdeeForm] as string}
                    onChange={(e) =>
                      setTdeeForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                    className="input-dark"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Sex</label>
                <select
                  value={tdeeForm.sex}
                  onChange={(e) =>
                    setTdeeForm((f) => ({ ...f, sex: e.target.value as BodyStats['sex'] }))
                  }
                  className="input-dark"
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Activity level</label>
                <select
                  value={tdeeForm.activityLevel}
                  onChange={(e) =>
                    setTdeeForm((f) => ({ ...f, activityLevel: e.target.value as ActivityLevel }))
                  }
                  className="input-dark"
                >
                  <option value="">Select…</option>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <Button variant="outline" className="w-full" onClick={handleTdeeFill}>
                Calculate & fill calorie goal
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
