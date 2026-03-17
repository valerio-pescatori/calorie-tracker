import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userMeta } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [meta] = await db
    .select()
    .from(userMeta)
    .where(eq(userMeta.userId, user!.id));

  if (meta?.onboardingSeen) redirect("/dashboard");

  return <OnboardingFlow />;
}
