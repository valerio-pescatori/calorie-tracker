"use client";

import { useMounted } from "@/hooks/useMounted";
import type { MacroTotals } from "@/types";
import { ArcElement, Chart as ChartJS, DoughnutController, Tooltip } from "chart.js";
import { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useI18nContext } from "@/lib/i18n/i18n-react";

ChartJS.register(DoughnutController, ArcElement, Tooltip);

interface Props {
  totals: MacroTotals;
}

const MACRO_COLORS = ["#8b5cf6", "#2dd4bf", "#f59e0b"];

export function MacroDistributionRing({ totals }: Props) {
  const mounted = useMounted();
  const { LL } = useI18nContext();
  const MACRO_LABELS = [LL.common.protein(), LL.common.carbs(), LL.common.fat()];
  const macrosLabel = LL.dashboard.macros();

  const segmentLabelPlugin = useMemo(
    () => ({
      id: "segmentLabels",
      afterDraw(chart: ChartJS) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta?.data?.length) return;

        const total = (chart.data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
        if (total === 0) return;

        meta.data.forEach((arc, i) => {
          const el = arc as ArcElement;
          const pct = Math.round(((chart.data.datasets[0].data[i] as number) / total) * 100);
          if (pct < 7) return;

          const text = `${pct}%`;
          const midAngle = (el.startAngle + el.endAngle) / 2;
          const midRadius = (el.innerRadius + el.outerRadius) / 2;

          ctx.save();
          ctx.font = "bold 11px \"Inter\", sans-serif";
          ctx.fillStyle = "rgba(255,255,255,1)";
          ctx.strokeStyle = "rgba(0,0,0,0.65)";
          ctx.lineWidth = 2.5;
          ctx.lineJoin = "round";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const chars = text.split("");
          const charWidths = chars.map((c) => ctx.measureText(c).width);
          const totalWidth = charWidths.reduce((a, b) => a + b, 0);
          const totalAngle = totalWidth / midRadius;

          // Text with +π/2 rotation flips upside-down when charAngle ∈ (0, π).
          // Fix: use -π/2 rotation + dir=-1 for that half so glyphs stay readable.
          const norm = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const isBottomHalf = norm > 0 && norm < Math.PI;

          const dir       = isBottomHalf ? -1 : 1;
          const rotOffset = isBottomHalf ? -Math.PI / 2 : Math.PI / 2;

          let currentAngle = midAngle - dir * (totalAngle / 2);

          chars.forEach((char, j) => {
            const charAngle = currentAngle + dir * (charWidths[j] / 2 / midRadius);
            const x = el.x + Math.cos(charAngle) * midRadius;
            const y = el.y + Math.sin(charAngle) * midRadius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(charAngle + rotOffset);
            ctx.strokeText(char, 0, 0);
            ctx.fillText(char, 0, 0);
            ctx.restore();

            currentAngle += dir * (charWidths[j] / midRadius);
          });

          ctx.restore();
        });
      },
    }),
    [],
  );

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
        ctx.font = "bold 13px \"Inter\", sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(macrosLabel, cx, cy);
        ctx.restore();
      },
    }),
    [macrosLabel],
  );

  const proteinKcal = totals.protein * 4;
  const carbsKcal = totals.carbs * 4;
  const fatKcal = totals.fat * 9;
  const hasData = proteinKcal + carbsKcal + fatKcal > 0;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">{macrosLabel}</p>
        <div className="w-40 h-40 rounded-full bg-white/10 animate-pulse" />
        <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{macrosLabel}</p>
      <div className="w-40 h-40">
        <Doughnut
          data={{
            labels: MACRO_LABELS,
            datasets: [
              {
                data: hasData ? [proteinKcal, carbsKcal, fatKcal] : [1],
                backgroundColor: hasData ? MACRO_COLORS : ["rgba(255,255,255,0.07)"],
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
          plugins={[centerTextPlugin, segmentLabelPlugin]}
        />
      </div>
      {/* mini legend */}
      <div className="flex gap-3 text-xs text-muted-foreground">
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
