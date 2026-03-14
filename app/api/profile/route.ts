import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { userGoals } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

const upsertProfileSchema = z.object({
  calories: z.number().int().positive().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  ageYears: z.number().int().positive().optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  activityLevel: z
    .enum([
      "sedentary",
      "lightly_active",
      "moderately_active",
      "very_active",
      "extra_active",
    ])
    .optional(),
});

// ─── GET /api/profile ─────────────────────────────────────────────────────────

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select()
    .from(userGoals)
    .where(eq(userGoals.userId, user.id));

  // If no profile exists yet return sensible defaults
  if (!profile) {
    return NextResponse.json({
      profile: {
        userId: user.id,
        calories: 2000,
        protein: 150,
        carbs: 200,
        fat: 65,
      },
    });
  }

  return NextResponse.json({ profile });
}

// ─── PUT /api/profile ─────────────────────────────────────────────────────────

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = upsertProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const [profile] = await db
    .insert(userGoals)
    .values({ userId: user.id, ...parsed.data })
    .onConflictDoUpdate({
      target: userGoals.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ profile });
}
