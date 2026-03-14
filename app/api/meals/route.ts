import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mealEntries } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";

// ─── Validation ───────────────────────────────────────────────────────────────

const createMealSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().int().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
  source: z.enum(["ai_voice", "ai_text", "manual", "search"]).default("manual"),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  notes: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

// ─── GET /api/meals?date=YYYY-MM-DD ──────────────────────────────────────────

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Missing or invalid ?date= parameter (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const meals = await db
    .select()
    .from(mealEntries)
    .where(and(eq(mealEntries.userId, user.id), eq(mealEntries.date, date)));

  return NextResponse.json({ meals });
}

// ─── POST /api/meals ──────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const { date, mealType, ...rest } = parsed.data;

  const [meal] = await db
    .insert(mealEntries)
    .values({
      userId: user.id,
      date,
      mealType,
      ...rest,
    })
    .returning();

  return NextResponse.json({ meal }, { status: 201 });
}
