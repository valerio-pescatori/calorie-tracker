import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";

const statsSchema = z.object({
  weightKg: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  ageYears: z.number().int().positive().optional(),
  sex: z.enum(["male", "female", "other"]).optional(),
  activityLevel: z
    .enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extra_active"])
    .optional(),
});

// ─── PUT /api/profile/stats ───────────────────────────────────────────────────

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = statsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  // Update only — the row must already exist (created via /api/profile/goals).
  await db
    .update(userProfile)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(userProfile.userId, user.id));

  return NextResponse.json({ ok: true });
}
