import type { MacroTotals } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  totals: MacroTotals;
  goals: MacroTotals;
}

interface RowProps {
  label: string;
  colorFrom: string;
  colorTo: string;
  consumed: number;
  goal: number;
}

function MacroRow({ label, colorFrom, colorTo, consumed, goal }: RowProps) {
  const pct = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const over = consumed > goal;

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-sm font-medium text-foreground/70 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500')}
          style={{
            width: `${pct}%`,
            background: over ? '#ef4444' : `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`,
          }}
        />
      </div>
      <span className={cn('text-xs tabular-nums shrink-0 w-24 text-right', over ? 'text-red-400 font-semibold' : 'text-muted-foreground')}>
        {consumed}g / {goal}g
      </span>
    </div>
  );
}

export function MacroBreakdownBar({ totals, goals }: Props) {
  return (
    <div className="glass-card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground/80">Macros</h2>
      <MacroRow label="Protein" colorFrom="#8b5cf6" colorTo="#a78bfa" consumed={Math.round(totals.protein)} goal={goals.protein} />
      <MacroRow label="Carbs"   colorFrom="#0d9488" colorTo="#2dd4bf" consumed={Math.round(totals.carbs)}   goal={goals.carbs} />
      <MacroRow label="Fat"     colorFrom="#d97706" colorTo="#f59e0b" consumed={Math.round(totals.fat)}     goal={goals.fat} />
    </div>
  );
}
