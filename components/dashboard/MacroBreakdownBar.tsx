import type { MacroTotals } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  totals: MacroTotals;
  goals: MacroTotals;
}

interface RowProps {
  label: string;
  color: string;
  consumed: number;
  goal: number;
}

function MacroRow({ label, color, consumed, goal }: RowProps) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const over = consumed > goal;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium text-zinc-700 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-red-500' : '')}
          style={{
            width: `${pct}%`,
            backgroundColor: over ? undefined : color,
          }}
        />
      </div>
      <span className={cn('text-xs tabular-nums shrink-0 w-24 text-right', over ? 'text-red-500 font-semibold' : 'text-zinc-500')}>
        {consumed}g / {goal}g
      </span>
    </div>
  );
}

export function MacroBreakdownBar({ totals, goals }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold text-zinc-700">Macros</h2>
      <MacroRow label="Protein" color="#3b82f6" consumed={Math.round(totals.protein)} goal={goals.protein} />
      <MacroRow label="Carbs"   color="#eab308" consumed={Math.round(totals.carbs)}   goal={goals.carbs} />
      <MacroRow label="Fat"     color="#f97316" consumed={Math.round(totals.fat)}     goal={goals.fat} />
    </div>
  );
}
