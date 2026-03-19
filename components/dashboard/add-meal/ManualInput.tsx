'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18nContext } from '@/lib/i18n/i18n-react';
import type { MealEntry, MealType } from '@/types';

interface ManualInputProps {
  onAdd: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
}

export function ManualInput({ onAdd }: ManualInputProps) {
  const empty = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, mealType: 'lunch' as MealType };
  const [form, setForm] = useState(empty);
  const { LL } = useI18nContext();
  const fieldLabels: Record<string, string> = {
    calories: LL.goals.caloriesKcal(),
    protein: LL.goals.proteinG(),
    carbs: LL.goals.carbsG(),
    fat: LL.goals.fatG(),
  };

  function handleSubmit() {
    if (!form.name.trim() || form.calories <= 0) return;
    onAdd({ ...form, source: 'manual' });
    setForm(empty);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{LL.addMeal.mealName()}</Label>
        <Input
          placeholder={LL.addMeal.mealNamePlaceholder()}
          value={form.name}
          onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
          <div key={key} className="space-y-1.5">
            <Label>{fieldLabels[key]}</Label>
            <Input
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => setForm((v) => ({ ...v, [key]: Number(e.target.value) }))}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label>{LL.addMeal.mealType()}</Label>
        <Select
          value={form.mealType}
          onValueChange={(v) => setForm((prev) => ({ ...prev, mealType: v as MealType }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="breakfast">{LL.common.breakfast()}</SelectItem>
            <SelectItem value="lunch">{LL.common.lunch()}</SelectItem>
            <SelectItem value="dinner">{LL.common.dinner()}</SelectItem>
            <SelectItem value="snack">{LL.common.snack()}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" disabled={!form.name.trim() || form.calories <= 0} onClick={handleSubmit}>
        <Plus className="h-4 w-4 mr-1" /> {LL.addMeal.addMeal()}
      </Button>
    </div>
  );
}

