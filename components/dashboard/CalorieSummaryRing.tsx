'use client';

import { useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, DoughnutController } from 'chart.js';

ChartJS.register(DoughnutController, ArcElement, Tooltip);

interface Props {
  consumed: number;
  goal: number;
}

export function CalorieSummaryRing({ consumed, goal }: Props) {
  const mounted = useMounted();

  const centerTextPlugin = useMemo(
    () => ({
      id: 'calorieCenter',
      afterDraw(chart: ChartJS) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = chartArea.left + chartArea.width / 2;
        const cy = chartArea.top + chartArea.height / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 26px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(String(consumed), cx, cy - 10);
        ctx.font = '12px "Inter", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`/ ${goal} kcal`, cx, cy + 14);
        ctx.restore();
      },
    }),
    [consumed, goal],
  );

  const color = consumed > goal
    ? '#ef4444'
    : goal > 0 && consumed / goal >= 0.9
      ? '#f59e0b'
      : '#8b5cf6';
  const remaining = Math.max(0, goal - consumed);
  const overBudget = consumed > goal;
  const labelClass = overBudget
    ? 'text-red-400'
    : goal > 0 && consumed / goal >= 0.9
      ? 'text-amber-400'
      : 'text-violet-400';

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">Calories</p>
        <div className="w-40 h-40 rounded-full bg-white/10 animate-pulse" />
        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">Calories</p>
      <div className="w-40 h-40">
        <Doughnut
          data={{
            datasets: [
              {
                data: [consumed, remaining],
                backgroundColor: [color, 'rgba(255,255,255,0.07)'],
                borderWidth: 0,
                hoverOffset: 0,
              },
            ],
          }}
          options={{
            cutout: '78%',
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 400 },
            plugins: { tooltip: { enabled: false }, legend: { display: false } },
          }}
          plugins={[centerTextPlugin]}
        />
      </div>
      <p className={`text-sm font-semibold ${labelClass}`}>
        {overBudget ? `${consumed - goal} kcal over` : `${remaining} kcal left`}
      </p>
    </div>
  );
}
