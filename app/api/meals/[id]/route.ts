import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { mealEntries } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";

const patchMealSchema = z.object({
  name: z.string().min(1).optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// ─── PATCH /api/meals/[id] ────────────────────────────────────────────────────

export async function PATCH(request: Request, { params }: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchMealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const [meal] = await db
    .update(mealEntries)
    .set(parsed.data)
    .where(and(eq(mealEntries.id, id), eq(mealEntries.userId, user.id)))
    .returning();

  if (!meal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ meal });
}

// ─── DELETE /api/meals/[id] ───────────────────────────────────────────────────

export async function DELETE(_request: Request, { params }: RouteContext) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(mealEntries)
    .where(and(eq(mealEntries.id, id), eq(mealEntries.userId, user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
