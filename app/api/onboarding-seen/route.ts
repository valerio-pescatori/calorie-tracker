import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .insert(userMeta)
    .values({ userId: user.id, onboardingSeen: true })
    .onConflictDoUpdate({
      target: userMeta.userId,
      set: { onboardingSeen: true },
    });

  return NextResponse.json({ ok: true });
}
