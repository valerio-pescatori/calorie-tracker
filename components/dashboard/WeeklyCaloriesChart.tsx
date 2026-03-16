"use client";

import { useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { computeTotals } from "@/lib/nutrition";

function getPast7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function WeeklyCaloriesChart() {
  const days = useMemo(() => getPast7Days(), []);
  const hydrateForDate = useStore((s) => s.hydrateForDate);
  const logs = useStore((s) => s.logs);
  const goal = useStore((s) => s.profile.goals.calories);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    days.forEach((d) => hydrateForDate(d));
  }, [days, hydrateForDate]);

  const data = days.map((date) => {
    const meals = logs[date]?.meals ?? [];
    const calories = computeTotals(meals).calories;
    const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
    return { date, calories, dayOfWeek, isToday: date === today };
  });

  const W = 280;
  const H = 100;
  const PAD = { top: 16, right: 8, bottom: 24, left: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const daysWithData = data.filter((d) => d.calories > 0);
  const avgCalories = daysWithData.length > 0
    ? Math.round(daysWithData.reduce((sum, d) => sum + d.calories, 0) / daysWithData.length)
    : 0;

  const maxVal = Math.max(...data.map((d) => d.calories), goal, 1);

  // Map each data point to an (x, y) coordinate
  const points = data.map((d, i) => ({
    x: PAD.left + (i / 6) * innerW,
    y: PAD.top + innerH - (d.calories / maxVal) * innerH,
    ...d,
  }));

  // Build SVG polyline points string (skip days with 0 calories for a clean line)
  const linePoints = points
    .filter((p) => p.calories > 0)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Area fill path (close under the line back to the baseline)
  const nonZero = points.filter((p) => p.calories > 0);
  const areaPath =
    nonZero.length > 1
      ? `M ${nonZero[0].x},${PAD.top + innerH} ` +
        nonZero.map((p) => `L ${p.x},${p.y}`).join(" ") +
        ` L ${nonZero[nonZero.length - 1].x},${PAD.top + innerH} Z`
      : "";

  const goalY = PAD.top + innerH - (goal / maxVal) * innerH;

  return (
    <section className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Past 7 Days</h3>
        <span className="text-xs text-muted-foreground">Avg: {avgCalories} kcal</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        aria-label="7-day calorie history line chart"
      >
        <defs>
          <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.65 0.22 285)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 285)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="chart-clip">
            <rect x={PAD.left} y={PAD.top} width={innerW} height={innerH} />
          </clipPath>
        </defs>

        {/* Goal dashed line */}
        <line
          x1={PAD.left}
          y1={goalY}
          x2={PAD.left + innerW}
          y2={goalY}
          stroke="oklch(0.65 0.22 285 / 0.30)"
          strokeDasharray="4 3"
          strokeWidth={1}
        />

        {/* Area fill */}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#area-fill)"
            clipPath="url(#chart-clip)"
          />
        )}

        {/* Line */}
        {linePoints && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="oklch(0.65 0.22 285)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath="url(#chart-clip)"
          />
        )}

        {/* Points + labels */}
        {points.map(({ x, y, calories, dayOfWeek, isToday }, i) => (
          <g key={i}>
            {/* Day label */}
            <text
              x={x}
              y={H - 4}
              textAnchor="middle"
              fontSize={9}
              fontWeight={isToday ? "600" : "400"}
              fill={isToday ? "oklch(0.92 0.008 285)" : "oklch(0.50 0.025 285)"}
            >
              {dayOfWeek}
            </text>

            {calories > 0 && (
              <>
                {/* Dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isToday ? 4 : 3}
                  fill={calories > goal ? "oklch(0.65 0.22 25)" : "oklch(0.65 0.22 285)"}
                  stroke="oklch(0.10 0.018 285)"
                  strokeWidth={1.5}
                />

                {/* Calorie label — today always shows, others show on hover via title */}
                {isToday && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize={8.5}
                    fontWeight="600"
                    fill="oklch(0.92 0.008 285)"
                  >
                    {calories}
                  </text>
                )}
                <title>{`${dayOfWeek}: ${calories} kcal`}</title>
              </>
            )}
          </g>
        ))}
      </svg>
    </section>
  );
}
