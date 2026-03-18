import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ start?: string }> }) {
  const { start } = await searchParams;
  const isEdit = start === "path";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isEdit) {
    const [meta] = await db.select().from(userMeta).where(eq(userMeta.userId, user!.id));

    if (meta?.onboardingSeen) redirect("/dashboard");
  }

  return <OnboardingFlow initialStep={isEdit ? "path" : undefined} />;
}
