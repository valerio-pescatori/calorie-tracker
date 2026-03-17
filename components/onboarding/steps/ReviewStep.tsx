import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MacroFields } from "../MacroFields";
import type { MacroFormData, WeightGoal } from "../types";

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
  const filled = macros.calories && macros.protein && macros.carbs && macros.fat;
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">Your daily goals</h1>
        <p className="text-xs text-muted-foreground">Calculated from your stats. Feel free to adjust.</p>
      </div>

      {weightGoal !== "maintain" && (
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Maintenance calories (TDEE)</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{tdee} kcal</span>
              <button
                type="button"
                onClick={() => setShowTdeeInfo((v) => !v)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="What is TDEE?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {showTdeeInfo && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
              TDEE (Total Daily Energy Expenditure) is the number of calories your body burns in a day. Eating at
              this level keeps your weight stable. To {weightGoal === "lose" ? "lose" : "gain"} weight, your
              calorie goal is set {weightGoal === "lose" ? "500 kcal below" : "500 kcal above"} your TDEE.
            </p>
          )}
        </div>
      )}

      <MacroFields macros={macros} onChange={setMacros} />
      <Button className="w-full" size="lg" disabled={!filled || saving} onClick={onSave}>
        {saving ? "Saving…" : "Save & continue"}
      </Button>
    </div>
  );
}
