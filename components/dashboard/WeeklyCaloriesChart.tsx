"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { computeTotals } from "@/lib/nutrition";

function getDateRange(daysAgo: number, count: number): string[] {
  const result: string[] = [];
  const today = new Date();
  for (let i = daysAgo + count - 1; i >= daysAgo; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    result.push(d.toISOString().slice(0, 10));
  }
  return result;
}

/** Convert points to a Catmull-Rom SVG path for smooth curves */
function catmullRomPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const tension = 0.25;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

export function WeeklyCaloriesChart() {
  const thisWeekDays = useMemo(() => getDateRange(0, 7), []);
  const prevWeekDays = useMemo(() => getDateRange(7, 7), []);
  const allDays = useMemo(() => [...prevWeekDays, ...thisWeekDays], [prevWeekDays, thisWeekDays]);

  const hydrateForDate = useStore((s) => s.hydrateForDate);
  const logs = useStore((s) => s.logs);
  const goal = useStore((s) => s.goals?.calories ?? null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    allDays.forEach((d) => hydrateForDate(d));
  }, [allDays, hydrateForDate]);

  const thisWeekData = thisWeekDays.map((date) => {
    const meals = logs[date]?.meals ?? [];
    const calories = computeTotals(meals).calories;
    const dayOfWeek = new Date(date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
    return { date, calories, dayOfWeek, isToday: date === today };
  });

  const W = 280;
  const H = 130;
  const PAD = { top: 20, right: 8, bottom: 28, left: 8 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...thisWeekData.map((d) => d.calories), goal ?? 0, 1);

  const points = thisWeekData.map((d, i) => ({
    x: PAD.left + (i / 6) * innerW,
    y: PAD.top + innerH - (d.calories / maxVal) * innerH,
    ...d,
  }));

  const nonZero = points.filter((p) => p.calories > 0);
  const linePath = catmullRomPath(nonZero);

  const goalY = goal !== null ? PAD.top + innerH - (goal / maxVal) * innerH : null;
  const gridLines = Array.from({ length: Math.floor(maxVal / 500) }, (_, i) => (i + 1) * 500).filter((v) => v < maxVal);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">Last 7 Days</h3>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full overflow-visible"
        aria-label="7-day calorie history line chart"
        onMouseLeave={() => setActiveIdx(null)}
      >
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
          <clipPath id="chart-clip">
            <rect x={PAD.left} y={0} width={innerW} height={H} />
          </clipPath>
          <filter id="line-glow" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="3" result="blur" />
          </filter>
        </defs>

        {/* 500 kcal grid lines */}
        {gridLines.map((v) => {
          const y = PAD.top + innerH - (v / maxVal) * innerH;
          return (
            <g key={v}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + innerW}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Goal dashed line */}
        {goal !== null && goalY !== null && (
          <>
            <line
              x1={PAD.left}
              y1={goalY}
              x2={PAD.left + innerW}
              y2={goalY}
              stroke="rgba(139,92,246,0.25)"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text
              x={PAD.left}
              y={goalY - 4}
              textAnchor="start"
              fontSize={8}
              fontWeight="600"
              fill="rgba(139,92,246,0.25)"
            >
              {goal} kcal
            </text>
          </>
        )}

        {/* Smooth gradient line */}
        {linePath && (
          <>
            {/* Glow layer */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={7}
              strokeLinecap="round"
              clipPath="url(#chart-clip)"
              filter="url(#line-glow)"
              opacity={0.35}
            />
            {/* Sharp line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              clipPath="url(#chart-clip)"
            />
          </>
        )}

        {/* Points + labels */}
        {points.map(({ x, y, calories, dayOfWeek, isToday }, i) => (
          <g key={i}>
            <text
              x={x}
              y={H - 6}
              textAnchor="middle"
              fontSize={9}
              fontWeight={isToday ? "600" : "400"}
              fill={isToday ? "oklch(0.92 0.008 285)" : "oklch(0.50 0.025 285)"}
            >
              {dayOfWeek}
            </text>

            {calories > 0 && (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={3}
                  fill={goal !== null && calories > goal ? "#ef4444" : "#2dd4bf"}
                  stroke="oklch(0.10 0.018 285)"
                  strokeWidth={1}
                  style={{ pointerEvents: "none" }}
                />
                {/* Invisible hit area */}
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i === activeIdx ? null : i)}
                />
                {isToday && activeIdx !== i && (
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize={8.5}
                    fontWeight="600"
                    fill="oklch(0.92 0.008 285)"
                    style={{ pointerEvents: "none" }}
                  >
                    {calories}
                  </text>
                )}
              </>
            )}
          </g>
        ))}

        {/* Tooltip */}
        {activeIdx !== null &&
          (() => {
            const pt = points[activeIdx];
            if (!pt || pt.calories === 0) return null;
            const TW = 68;
            const TH = 26;
            const tx = Math.min(Math.max(pt.x - TW / 2, PAD.left), W - PAD.right - TW);
            const ty = pt.y - TH - 10;
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={tx}
                  y={ty}
                  width={TW}
                  height={TH}
                  rx={5}
                  fill="oklch(0.16 0.018 285)"
                  stroke="rgba(139,92,246,0.45)"
                  strokeWidth={0.75}
                />
                <text x={tx + TW / 2} y={ty + 9} textAnchor="middle" fontSize={7.5} fill="oklch(0.55 0.025 285)">
                  {pt.dayOfWeek}
                </text>
                <text
                  x={tx + TW / 2}
                  y={ty + 20}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="700"
                  fill="oklch(0.92 0.008 285)"
                >
                  {pt.calories} kcal
                </text>
              </g>
            );
          })()}
      </svg>
    </section>
  );
}
