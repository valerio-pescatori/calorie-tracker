"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import type { WeeklyDay } from "@/app/api/stats/weekly/route";
import { ChartEntry, WeeklyChartSvg } from "./WeeklyChartSvg";

export function WeeklyCaloriesChart() {
  const goal = useStore((s) => s.goals?.calories ?? null);
  const { LL } = useI18nContext();
  const today = new Date().toISOString().slice(0, 10);
  const [weekData, setWeekData] = useState<WeeklyDay[]>([]);

  useEffect(() => {
    fetch("/api/stats/weekly")
      .then((r) => r.json())
      .then(({ data }: { data: WeeklyDay[] }) => setWeekData(data))
      .catch(() => {});
  }, []);

  const entries = weekData.map<ChartEntry>((entry) => ({
    calories: entry.calories,
    dayOfWeek: new Date(entry.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" }),
    isToday: entry.date === today,
  }));

  return (
    <section className="glass-card p-4 space-y-3">
      <h3 className="text-xs font-bold tracking-wider text-foreground uppercase">{LL.dashboard.last7Days()}</h3>
      <WeeklyChartSvg entries={entries} goal={goal} />
    </section>
  );
}