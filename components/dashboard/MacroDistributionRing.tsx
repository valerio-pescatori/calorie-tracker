"use client";

import { useMounted } from "@/hooks/useMounted";
import type { MacroTotals } from "@/types";
import { ArcElement, Chart as ChartJS, DoughnutController, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(DoughnutController, ArcElement, Tooltip);

interface Props {
  totals: MacroTotals;
}

const MACRO_COLORS = ["#3b82f6", "#eab308", "#f97316"];
const MACRO_LABELS = ["Protein", "Carbs", "Fat"];

export function MacroDistributionRing({ totals }: Props) {
  const mounted = useMounted();

  const centerTextPlugin = useMemo(
    () => ({
      id: "macroCenter",
      afterDraw(chart: ChartJS) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = chartArea.left + chartArea.width / 2;
        const cy = chartArea.top + chartArea.height / 2;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 13px sans-serif";
        ctx.fillStyle = "#71717a";
        ctx.fillText("Macros", cx, cy);
        ctx.restore();
      },
    }),
    [],
  );

  const proteinKcal = totals.protein * 4;
  const carbsKcal = totals.carbs * 4;
  const fatKcal = totals.fat * 9;
  const hasData = proteinKcal + carbsKcal + fatKcal > 0;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-zinc-500">Macros</p>
        <div className="w-40 h-40 rounded-full bg-zinc-100 animate-pulse" />
        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-zinc-500">Macros</p>
      <div className="w-40 h-40">
        <Doughnut
          data={{
            labels: MACRO_LABELS,
            datasets: [
              {
                data: hasData ? [proteinKcal, carbsKcal, fatKcal] : [1],
                backgroundColor: hasData ? MACRO_COLORS : ["#e4e4e7"],
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          }}
          options={{
            cutout: "72%",
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 400 },
            plugins: {
              legend: { display: false },
              tooltip: {
                enabled: hasData,
                callbacks: {
                  label: (ctx) => {
                    const grams = [totals.protein, totals.carbs, totals.fat][ctx.dataIndex];
                    const kcal = ctx.raw as number;
                    const total = proteinKcal + carbsKcal + fatKcal;
                    const pct = total > 0 ? Math.round((kcal / total) * 100) : 0;
                    return ` ${grams}g  ·  ${kcal} kcal  ·  ${pct}%`;
                  },
                },
              },
            },
          }}
          plugins={[centerTextPlugin]}
        />
      </div>
      {/* mini legend */}
      <div className="flex gap-3 text-xs text-zinc-500">
        {MACRO_LABELS.map((label, i) => (
          <span key={label} className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: MACRO_COLORS[i] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
