"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { calcTDEE } from "@/lib/nutrition";
import type { ActivityLevel, BodyStats } from "@/types";
import { type Step, type BodyFormData, type MacroFormData, type WeightGoal, GUIDED_PROGRESS, BACK_MAP, WEIGHT_GOAL_DELTA } from "./types";
import { ProgressDots } from "./ProgressDots";
import { WelcomeStep } from "./steps/WelcomeStep";
import { PathStep } from "./steps/PathStep";
import { BodyStatsStep } from "./steps/BodyStatsStep";
import { ActivityStep } from "./steps/ActivityStep";
import { WeightGoalStep } from "./steps/WeightGoalStep";
import { ReviewStep } from "./steps/ReviewStep";
import { DirectStep } from "./steps/DirectStep";

export function OnboardingFlow({ initialStep }: { initialStep?: Step } = {}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialStep ?? "welcome");
  const [body, setBody] = useState<BodyFormData>({ weightKg: "", heightCm: "", ageYears: "", sex: "male" });
  const [activity, setActivity] = useState<ActivityLevel>("moderately_active");
  const [weightGoal, setWeightGoal] = useState<WeightGoal>("maintain");
  const [tdee, setTdee] = useState(0);
  const [macros, setMacros] = useState<MacroFormData>({ calories: "", protein: "", carbs: "", fat: "" });
  const [saving, setSaving] = useState(false);

  async function markSeen() {
    await fetch("/api/onboarding-seen", { method: "POST" });
  }

  async function handleSkip() {
    await markSeen();
    router.push("/dashboard");
  }

  async function handleSaveDirect() {
    setSaving(true);
    try {
      await fetch("/api/profile/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(macros.calories),
          protein: Number(macros.protein),
          carbs: Number(macros.carbs),
          fat: Number(macros.fat),
        }),
      });
      await markSeen();
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveGuided() {
    setSaving(true);
    const stats: BodyStats = {
      weightKg: Number(body.weightKg) || undefined,
      heightCm: Number(body.heightCm) || undefined,
      ageYears: Number(body.ageYears) || undefined,
      sex: body.sex,
      activityLevel: activity,
    };
    try {
      await fetch("/api/profile/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calories: Number(macros.calories),
          protein: Number(macros.protein),
          carbs: Number(macros.carbs),
          fat: Number(macros.fat),
        }),
      });
      await fetch("/api/profile/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      await markSeen();
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  }

  function handleEnterReview() {
    const stats: BodyStats = {
      weightKg: Number(body.weightKg) || undefined,
      heightCm: Number(body.heightCm) || undefined,
      ageYears: Number(body.ageYears) || undefined,
      sex: body.sex,
      activityLevel: activity,
    };
    const computed = calcTDEE(stats);
    const calories = computed + WEIGHT_GOAL_DELTA[weightGoal];
    setTdee(computed);
    setMacros({
      calories: String(calories),
      protein: String(Math.round((calories * 0.3) / 4)),
      carbs: String(Math.round((calories * 0.4) / 4)),
      fat: String(Math.round((calories * 0.3) / 9)),
    });
    setStep("review");
  }

  const prevStep = BACK_MAP[step];
  const progress = GUIDED_PROGRESS[step];

  return (
    <div className="relative min-h-dvh flex flex-col">
      {prevStep && (
        <button
          onClick={() => {
            if (step === initialStep) {
              router.back();
            } else {
              setStep(prevStep);
            }
          }}
          className="absolute top-5 left-4 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 w-full max-w-sm mx-auto">
        {progress != null && <ProgressDots current={progress} />}

        {step === "welcome" && <WelcomeStep onSetup={() => setStep("path")} onSkip={handleSkip} />}
        {step === "path" && <PathStep onChoose={setStep} />}
        {step === "body-stats" && (
          <BodyStatsStep body={body} setBody={setBody} onContinue={() => setStep("activity")} />
        )}
        {step === "activity" && (
          <ActivityStep activity={activity} setActivity={setActivity} onContinue={() => setStep("weight-goal")} />
        )}
        {step === "weight-goal" && (
          <WeightGoalStep weightGoal={weightGoal} setWeightGoal={setWeightGoal} onContinue={handleEnterReview} />
        )}
        {step === "review" && (
          <ReviewStep macros={macros} setMacros={setMacros} saving={saving} onSave={handleSaveGuided} tdee={tdee} weightGoal={weightGoal} />
        )}
        {step === "direct" && (
          <DirectStep macros={macros} setMacros={setMacros} saving={saving} onSave={handleSaveDirect} />
        )}
      </div>
    </div>
  );
}
