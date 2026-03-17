"use client";

import { useMounted } from "@/hooks/useMounted";

interface Props {
  consumed: number;
  goal?: number;
}

const SIZE = 224;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 88;
const STROKE = 12;
const C = 2 * Math.PI * R;

export function CalorieSummaryRing({ consumed, goal }: Props) {
  const mounted = useMounted();
  const hasGoal = goal !== undefined && goal > 0;
  const remaining = hasGoal ? Math.max(0, goal - consumed) : 0;
  const overBudget = hasGoal && consumed > goal;
  const progress = hasGoal ? Math.min(consumed / goal, 1) : 0;
  const offset = C * (1 - progress);
  const color = overBudget ? "#ef4444" : "#8b5cf6";

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-56 h-56 rounded-full bg-white/10 animate-pulse" />
        <div className="h-7 w-32 bg-white/10 rounded-full animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-56 h-56">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          style={{ display: "block" }}
        >
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={STROKE}
          />
          {/* Glow layer */}
          {progress > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE + 8}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              style={{ filter: "blur(8px)", opacity: 0.45 }}
            />
          )}
          {/* Sharp arc */}
          {progress > 0 && (
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
            />
          )}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
          <span
            className="text-5xl font-bold text-slate-100 leading-none tabular-nums"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            {consumed}
          </span>
          <span className="text-sm text-slate-400">{hasGoal ? `/ ${goal} kcal` : "kcal"}</span>
        </div>
      </div>

      {/* Badge */}
      {hasGoal && (
        <span
          className={
            overBudget
              ? "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-widest"
              : "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold uppercase tracking-widest"
          }
        >
          {overBudget ? "Over" : "Remaining"}&nbsp;{overBudget ? consumed - goal : remaining} kcal
        </span>
      )}
    </div>
  );
}
