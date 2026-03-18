"use client";

import { useMounted } from "@/hooks/useMounted";
import type { MacroTotals, PCFKeys } from "@/types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  totals: MacroTotals;
  goals: MacroTotals | null;
}

interface MacroStyle {
  label: string;
  strokeClass: string;
  trackClass: string;
  borderClass: string;
  textClass: string;
}

interface MacroConfig extends MacroStyle {
  key: PCFKeys;
  kcalFactor: number;
}

interface MacroRingProps extends MacroStyle {
  grams: number;
  goal: number | null;
  pct: number;
}

const MACROS: MacroConfig[] = [
  {
    key: "protein",
    label: "PROTEIN",
    strokeClass: "stroke-violet-500",
    trackClass: "stroke-violet-500/15",
    borderClass: "border-violet-500/15",
    textClass: "text-violet-400",
    kcalFactor: 4,
  },
  {
    key: "carbs",
    label: "CARBS",
    strokeClass: "stroke-teal-400",
    trackClass: "stroke-teal-400/15",
    borderClass: "border-teal-400/15",
    textClass: "text-teal-400",
    kcalFactor: 4,
  },
  {
    key: "fat",
    label: "FATS",
    strokeClass: "stroke-amber-400",
    trackClass: "stroke-amber-400/15",
    borderClass: "border-amber-400/15",
    textClass: "text-amber-400",
    kcalFactor: 9,
  },
];

const R = 28;
const C = 2 * Math.PI * R;
const SIZE = 72;
const CX = SIZE / 2;

function MacroRing({ grams, goal, strokeClass, trackClass, borderClass, textClass, label, pct }: MacroRingProps) {
  const hasGoal = goal !== null && goal > 0;
  const progress = hasGoal ? Math.min(grams / goal, 1) : 0;
  const dash = progress * C;
  const gap = C - dash;
  const over = hasGoal && grams > goal;

  return (
    <div className={`glass-card flex flex-col items-center gap-2 p-3 ${borderClass}`}>
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={CX} cy={CX} r={R} fill="none" strokeWidth={5} className={trackClass} />
          {/* Progress */}
          {hasGoal && (
            <circle
              cx={CX}
              cy={CX}
              r={R}
              fill="none"
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${gap}`}
              className={over ? "stroke-red-400" : strokeClass}
            />
          )}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold tabular-nums ${textClass}`} style={{ fontSize: 11 }}>
            {Math.round(grams)}g
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-bold tracking-wider text-muted-foreground">{label}</p>
        {hasGoal && <p className={`text-xs font-semibold ${textClass}`}>{pct}%</p>}
      </div>
    </div>
  );
}

export function MacroMiniCards({ totals, goals }: Props) {
  const mounted = useMounted();
  const { LL } = useI18nContext();
  const macroLabels: Record<PCFKeys, string> = {
    protein: LL.common.protein().toUpperCase(),
    carbs: LL.common.carbs().toUpperCase(),
    fat: LL.common.fats().toUpperCase(),
  };
  const totalKcal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

  if (!mounted) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {MACROS.map((m) => (
          <div key={m.key} className="glass-card h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {MACROS.map(({ key, kcalFactor, ...macroProps }) => {
        const grams = totals[key];
        const pct = totalKcal > 0 ? Math.round((grams * kcalFactor / totalKcal) * 100) : 0;
        return (
          <MacroRing
            key={key}
            {...macroProps}
            label={macroLabels[key]}
            grams={grams}
            goal={goals?.[key] ?? null}
            pct={pct}
          />
        );
      })}
    </div>
  );
}
