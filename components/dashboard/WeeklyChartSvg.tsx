"use client";

import { useEffect, useRef, useState } from "react";

const PAD = { top: 36, right: 12, bottom: 28, left: 8 };
const CHART_HEIGHT = 140;

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

export interface ChartEntry {
  calories: number;
  dayOfWeek: string;
  isToday: boolean;
}

interface Props {
  entries: ChartEntry[];
  goal: number | null;
}

export function WeeklyChartSvg({ entries, goal }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setW(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setW(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = CHART_HEIGHT;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = entries.length;

  const maxVal = Math.max(...entries.map((d) => d.calories), goal ?? 0, 1);

  const points = entries.map((d, i) => ({
    x: PAD.left + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2),
    y: PAD.top + innerH - (d.calories / maxVal) * innerH,
    ...d,
  }));

  const linePath = W > 0 ? catmullRomPath(points.filter((p) => p.calories > 0)) : "";
  const goalY = goal !== null ? PAD.top + innerH - (goal / maxVal) * innerH : null;
  const gridLines = Array.from({ length: Math.floor(maxVal / 500) }, (_, i) => (i + 1) * 500)
    .filter((v) => v < maxVal)
    .map((v) => ({ v, y: PAD.top + innerH - (v / maxVal) * innerH }));

  return (
    <div ref={containerRef}>
      {W > 0 && (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          className="block"
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

          {gridLines.map(({ v, y }) => (
            <line key={v} x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          ))}

          {goal !== null && goalY !== null && (
            <>
              <line x1={PAD.left} y1={goalY} x2={PAD.left + innerW} y2={goalY} stroke="rgba(139,92,246,0.25)" strokeDasharray="4 3" strokeWidth={1} />
              <text x={PAD.left} y={goalY - 4} textAnchor="start" fontSize={10} fontWeight="600" fill="rgba(139,92,246,0.5)">{goal} kcal</text>
            </>
          )}

          {linePath && (
            <>
              <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth={7} strokeLinecap="round" clipPath="url(#chart-clip)" filter="url(#line-glow)" opacity={0.35} />
              <path d={linePath} fill="none" stroke="url(#line-gradient)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" clipPath="url(#chart-clip)" />
            </>
          )}

          {points.map(({ x, y, calories, dayOfWeek, isToday }, i) => (
            <g key={i}>
              <text x={x} y={H - 6} textAnchor="middle" fontSize={10.5} fontWeight={isToday ? "600" : "400"} fill={isToday ? "oklch(0.92 0.008 285)" : "oklch(0.50 0.025 285)"}>{dayOfWeek}</text>
              {calories > 0 && (
                <>
                  <circle cx={x} cy={y} r={3} fill={goal !== null && calories > goal ? "#ef4444" : "#2dd4bf"} stroke="oklch(0.10 0.018 285)" strokeWidth={1} style={{ pointerEvents: "none" }} />
                  <circle cx={x} cy={y} r={10} fill="transparent" style={{ cursor: "pointer" }} onMouseEnter={() => setActiveIdx(i)} onClick={() => setActiveIdx(i === activeIdx ? null : i)} />
                  {isToday && activeIdx !== i && (
                    <text x={x} y={y - 8} textAnchor="middle" fontSize={10} fontWeight="600" fill="oklch(0.92 0.008 285)" style={{ pointerEvents: "none" }}>{calories}</text>
                  )}
                </>
              )}
            </g>
          ))}

          {activeIdx !== null && (() => {
            const pt = points[activeIdx];
            if (!pt || pt.calories === 0) return null;
            const TW = 68; const TH = 26;
            const tx = Math.min(Math.max(pt.x - TW / 2, PAD.left), W - PAD.right - TW);
            const ty = Math.max(pt.y - TH - 10, 2);
            return (
              <g style={{ pointerEvents: "none" }}>
                <rect x={tx} y={ty} width={TW} height={TH} rx={5} fill="oklch(0.16 0.018 285)" stroke="rgba(139,92,246,0.45)" strokeWidth={0.75} />
                <text x={tx + TW / 2} y={ty + 9} textAnchor="middle" fontSize={9} fill="oklch(0.55 0.025 285)">{pt.dayOfWeek}</text>
                <text x={tx + TW / 2} y={ty + 20} textAnchor="middle" fontSize={10.5} fontWeight="700" fill="oklch(0.92 0.008 285)">{pt.calories} kcal</text>
              </g>
            );
          })()}
        </svg>
      )}
    </div>
  );
}