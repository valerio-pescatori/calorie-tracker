'use client';

import { useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, DoughnutController } from 'chart.js';
import { getProgressColor } from '@/lib/nutrition';

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
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#18181b';
        ctx.fillText(String(consumed), cx, cy - 10);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(`/ ${goal} kcal`, cx, cy + 14);
        ctx.restore();
      },
    }),
    [consumed, goal],
  );

  const color = getProgressColor(consumed, goal);
  const remaining = Math.max(0, goal - consumed);
  const overBudget = consumed > goal;
  const labelClass = overBudget
    ? 'text-red-500'
    : goal > 0 && consumed / goal >= 0.9
      ? 'text-amber-500'
      : 'text-green-600';

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-zinc-500">Calories</p>
        <div className="w-40 h-40 rounded-full bg-zinc-100 animate-pulse" />
        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-zinc-500">Calories</p>
      <div className="w-40 h-40">
        <Doughnut
          data={{
            datasets: [
              {
                data: [consumed, remaining],
                backgroundColor: [color, '#e4e4e7'],
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
