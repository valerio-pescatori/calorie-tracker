import { TrendingDown, Minus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WeightGoal } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  weightGoal: WeightGoal;
  setWeightGoal: React.Dispatch<React.SetStateAction<WeightGoal>>;
  onContinue: () => void;
}

export function WeightGoalStep({ weightGoal, setWeightGoal, onContinue }: Props) {
  const { LL } = useI18nContext();
  const OPTIONS: { value: WeightGoal; label: string; description: string; Icon: React.ElementType }[] = [
    {
      value: "lose",
      label: LL.onboarding.loseWeight(),
      description: LL.onboarding.loseWeightDesc(),
      Icon: TrendingDown,
    },
    {
      value: "maintain",
      label: LL.onboarding.maintainWeight(),
      description: LL.onboarding.maintainWeightDesc(),
      Icon: Minus,
    },
    { value: "gain", label: LL.onboarding.gainWeight(), description: LL.onboarding.gainWeightDesc(), Icon: TrendingUp },
  ];
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.weightGoalTitle()}</h1>
        <p className="text-xs text-muted-foreground">{LL.onboarding.weightGoalSubtitle()}</p>
      </div>

      <div className="space-y-2">
        {OPTIONS.map(({ value, label, description, Icon }) => (
          <button
            key={value}
            type="button"
            className={`w-full rounded-xl border p-3.5 text-left transition-colors flex items-center gap-3 ${
              weightGoal === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-muted"
            }`}
            onClick={() => setWeightGoal(value)}
          >
            <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={onContinue}>
        {LL.common.continue()}
      </Button>
    </div>
  );
}
