'use client';

import { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import type { MealType } from '@/types';
import type { ParsedMeal } from './types';

interface ConfirmCardProps {
  parsed: ParsedMeal;
  onConfirm: (meal: ParsedMeal & { mealType: MealType }) => void;
  onCancel: () => void;
}

export function MealConfirmCard({ parsed, onConfirm, onCancel }: ConfirmCardProps) {
  const [form, setForm] = useState({ ...parsed, mealType: 'lunch' as MealType });
  const { LL } = useI18nContext();
  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [key]: key === 'name' ? e.target.value : Number(e.target.value) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{LL.addMeal.reviewEstimate()}</h3>
        <button onClick={onCancel}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label>{LL.addMeal.mealName()}</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'calories', label: LL.goals.caloriesKcal() },
              { key: 'protein',  label: LL.goals.proteinG() },
              { key: 'carbs',    label: LL.goals.carbsG() },
              { key: 'fat',      label: LL.goals.fatG() },
            ] as { key: keyof ParsedMeal; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                type="number"
                min={0}
                value={form[key] as number}
                onChange={field(key as keyof typeof form)}
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

        {form.confidence !== 'high' && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
              {form.confidence === 'low' ? LL.addMeal.lowConfidence() : LL.addMeal.mediumConfidence()}
            </Badge>
            {form.notes && <p className="text-xs text-amber-400/80 italic">&ldquo;{form.notes}&rdquo;</p>}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onCancel}>{LL.common.cancel()}</Button>
        <Button className="flex-1" onClick={() => onConfirm(form)}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> {LL.addMeal.addMeal()}
        </Button>
      </div>
    </div>
  );
}

