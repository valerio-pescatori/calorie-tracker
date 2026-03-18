import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MacroFields } from "../MacroFields";
import type { MacroFormData, WeightGoal } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  macros: MacroFormData;
  setMacros: React.Dispatch<React.SetStateAction<MacroFormData>>;
  saving: boolean;
  onSave: () => void;
  tdee: number;
  weightGoal: WeightGoal;
}

export function ReviewStep({ macros, setMacros, saving, onSave, tdee, weightGoal }: Props) {
  const [showTdeeInfo, setShowTdeeInfo] = useState(false);
  const { LL } = useI18nContext();
  const filled = macros.calories && macros.protein && macros.carbs && macros.fat;
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.reviewTitle()}</h1>
        <p className="text-xs text-muted-foreground">{LL.onboarding.reviewSubtitle()}</p>
      </div>

      {weightGoal !== "maintain" && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{LL.onboarding.tdeeLabel()}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{tdee} kcal</span>
              <button
                type="button"
                onClick={() => setShowTdeeInfo((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={LL.onboarding.tdeeAriaLabel()}
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {showTdeeInfo && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
              {weightGoal === "lose" ? LL.onboarding.tdeeExplainLose() : LL.onboarding.tdeeExplainGain()}
            </p>
          )}
        </div>
      )}

      <MacroFields macros={macros} onChange={setMacros} />
      <Button className="w-full" size="lg" disabled={!filled || saving} onClick={onSave}>
        {saving ? LL.onboarding.reviewSaving() : LL.onboarding.reviewSave()}
      </Button>
    </div>
  );
}
