"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";
import { calcTDEE } from "@/lib/nutrition";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import type { MacroTotals, ActivityLevel, BodyStats } from "@/types";

interface Props {
  children: React.ReactNode;
}

export function GoalSettingsSheet({ children }: Props) {
  const goals = useStore((s) => s.goals);
  const bodyStats = useStore((s) => s.bodyStats);
  const updateGoals = useStore((s) => s.updateGoals);
  const updateBodyStats = useStore((s) => s.updateBodyStats);

  const [form, setForm] = useState({
    calories: goals?.calories?.toString() ?? "",
    protein: goals?.protein?.toString() ?? "",
    carbs: goals?.carbs?.toString() ?? "",
    fat: goals?.fat?.toString() ?? "",
  });
  const [tdeeOpen, setTdeeOpen] = useState(false);
  const { LL } = useI18nContext();
  const ACTIVITY_OPTIONS = [
    { value: "sedentary" as ActivityLevel, label: LL.goals.activitySedentary() },
    { value: "lightly_active" as ActivityLevel, label: LL.goals.activityLightly() },
    { value: "moderately_active" as ActivityLevel, label: LL.goals.activityModerately() },
    { value: "very_active" as ActivityLevel, label: LL.goals.activityVery() },
    { value: "extra_active" as ActivityLevel, label: LL.goals.activityExtra() },
  ];
  const [tdeeForm, setTdeeForm] = useState({
    weightKg: bodyStats.weightKg?.toString() ?? "",
    heightCm: bodyStats.heightCm?.toString() ?? "",
    ageYears: bodyStats.ageYears?.toString() ?? "",
    sex: bodyStats.sex ?? ("" as BodyStats["sex"] | ""),
    activityLevel: bodyStats.activityLevel ?? ("" as ActivityLevel | ""),
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
            <Settings2 className="h-5 w-5" /> {LL.goals.title()}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Goal inputs */}
          {(
            [
              { key: "calories", label: LL.goals.caloriesKcal() },
              { key: "protein", label: LL.goals.proteinG() },
              { key: "carbs", label: LL.goals.carbsG() },
              { key: "fat", label: LL.goals.fatG() },
            ] as { key: keyof MacroTotals; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{label}</label>
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
            {LL.goals.saveGoals()}
          </Button>

          <Separator />

          {/* TDEE Calculator */}
          <button
            className="w-full text-left text-sm font-semibold text-foreground flex items-center justify-between"
            onClick={() => setTdeeOpen((v) => !v)}
          >
            {LL.goals.tdeeTitle()}
            <span className="text-muted-foreground text-xs">
              {tdeeOpen ? LL.goals.tdeeHide() : LL.goals.tdeeShow()}
            </span>
          </button>

          {tdeeOpen && (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-muted-foreground">{LL.goals.tdeeDescription()}</p>

              {[
                { key: "weightKg", label: LL.goals.weightKg() },
                { key: "heightCm", label: LL.goals.heightCm() },
                { key: "ageYears", label: LL.goals.age() },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">{label}</label>
                  <input
                    type="number"
                    min={0}
                    value={tdeeForm[key as keyof typeof tdeeForm] as string}
                    onChange={(e) => setTdeeForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="input-dark"
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{LL.goals.sex()}</label>
                <select
                  value={tdeeForm.sex}
                  onChange={(e) => setTdeeForm((f) => ({ ...f, sex: e.target.value as BodyStats["sex"] }))}
                  className="input-dark"
                >
                  <option value="">{LL.goals.selectPlaceholder()}</option>
                  <option value="male">{LL.common.male()}</option>
                  <option value="female">{LL.common.female()}</option>
                  <option value="other">{LL.common.other()}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">{LL.goals.activityLevel()}</label>
                <select
                  value={tdeeForm.activityLevel}
                  onChange={(e) => setTdeeForm((f) => ({ ...f, activityLevel: e.target.value as ActivityLevel }))}
                  className="input-dark"
                >
                  <option value="">{LL.goals.selectPlaceholder()}</option>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button variant="outline" className="w-full" onClick={handleTdeeFill}>
                {LL.goals.calculateFill()}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
