import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

const goalsSchema = z.object({
  calories: z.number().int().positive(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

// ─── PUT /api/profile/goals ───────────────────────────────────────────────────

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
  const parsed = goalsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation error", issues: parsed.error.issues }, { status: 422 });
  }

  const { data } = parsed;

  const [row] = await db
    .insert(userProfile)
    .values({ userId: user.id, ...data })
    .onConflictDoUpdate({
      target: userProfile.userId,
      set: { ...data, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ profile: row });
}
