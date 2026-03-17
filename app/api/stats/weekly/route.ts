import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mealEntries } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, gte, lte, sum } from "drizzle-orm";

export interface WeeklyDay {
  date: string; // YYYY-MM-DD
  calories: number;
}

// GET /api/stats/weekly
// Returns total calories per day for the last 7 days (today inclusive).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Build YYYY-MM-DD strings for the 7-day window
  const today = new Date();
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const from = days[0];
  const to = days[days.length - 1];

  const rows = await db
    .select({ date: mealEntries.date, calories: sum(mealEntries.calories) })
    .from(mealEntries)
    .where(
      and(
        eq(mealEntries.userId, user.id),
        gte(mealEntries.date, from),
        lte(mealEntries.date, to),
      ),
    )
    .groupBy(mealEntries.date);

  // Index results by date so days with no meals default to 0
  const byDate = Object.fromEntries(rows.map((r) => [r.date, Number(r.calories ?? 0)]));
  const data: WeeklyDay[] = days.map((date) => ({ date, calories: byDate[date] ?? 0 }));

  return NextResponse.json({ data });
}
