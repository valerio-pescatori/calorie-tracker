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
import type { UserGoals, ActivityLevel, UserProfile } from '@/types';

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
  const goals = useStore((s) => s.profile.goals);
  const profile = useStore((s) => s.profile);
  const updateGoals = useStore((s) => s.updateGoals);
  const updateProfile = useStore((s) => s.updateProfile);

  const [form, setForm] = useState<UserGoals>({ ...goals });
  const [tdeeOpen, setTdeeOpen] = useState(false);
  const [tdeeForm, setTdeeForm] = useState({
    weightKg: profile.weightKg ?? 70,
    heightCm: profile.heightCm ?? 170,
    ageYears: profile.ageYears ?? 30,
    sex: profile.sex ?? ('male' as UserProfile['sex']),
    activityLevel: profile.activityLevel ?? ('sedentary' as ActivityLevel),
  });

  function handleSave() {
    updateGoals(form);
  }

  function handleTdeeFill() {
    const tdee = calcTDEE({ ...profile, ...tdeeForm });
    updateProfile({
      weightKg: tdeeForm.weightKg,
      heightCm: tdeeForm.heightCm,
      ageYears: tdeeForm.ageYears,
      sex: tdeeForm.sex,
      activityLevel: tdeeForm.activityLevel,
    });
    setForm((f) => ({ ...f, calories: tdee }));
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
            ] as { key: keyof UserGoals; label: string; unit: string }[]
          ).map(({ key, label, unit }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">
                {label} <span className="text-zinc-400">({unit})</span>
              </label>
              <input
                type="number"
                min={0}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }))}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          ))}

          <Button className="w-full" onClick={handleSave}>
            Save goals
          </Button>

          <Separator />

          {/* TDEE Calculator */}
          <button
            className="w-full text-left text-sm font-semibold text-zinc-700 flex items-center justify-between"
            onClick={() => setTdeeOpen((v) => !v)}
          >
            TDEE Calculator
            <span className="text-zinc-400 text-xs">{tdeeOpen ? '▲ hide' : '▼ show'}</span>
          </button>

          {tdeeOpen && (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-zinc-400">
                Calculates your Total Daily Energy Expenditure using the Mifflin-St Jeor formula and fills in your calorie goal.
              </p>

              {[
                { key: 'weightKg', label: 'Weight (kg)' },
                { key: 'heightCm', label: 'Height (cm)' },
                { key: 'ageYears', label: 'Age' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={tdeeForm[key as keyof typeof tdeeForm] as number}
                    onChange={(e) =>
                      setTdeeForm((f) => ({ ...f, [key]: Number(e.target.value) }))
                    }
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Sex</label>
                <select
                  value={tdeeForm.sex}
                  onChange={(e) =>
                    setTdeeForm((f) => ({ ...f, sex: e.target.value as UserProfile['sex'] }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Activity level</label>
                <select
                  value={tdeeForm.activityLevel}
                  onChange={(e) =>
                    setTdeeForm((f) => ({ ...f, activityLevel: e.target.value as ActivityLevel }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                >
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
