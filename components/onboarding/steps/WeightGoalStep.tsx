import { TrendingDown, Minus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WeightGoal } from "../types";

const OPTIONS: { value: WeightGoal; label: string; description: string; Icon: React.ElementType }[] = [
  { value: "lose", label: "Lose weight", description: "500 kcal below your maintenance level", Icon: TrendingDown },
  { value: "maintain", label: "Maintain weight", description: "Stay at your maintenance calorie level", Icon: Minus },
  { value: "gain", label: "Gain weight", description: "500 kcal above your maintenance level", Icon: TrendingUp },
];

interface Props {
  weightGoal: WeightGoal;
  setWeightGoal: React.Dispatch<React.SetStateAction<WeightGoal>>;
  onContinue: () => void;
}

export function WeightGoalStep({ weightGoal, setWeightGoal, onContinue }: Props) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">Your goal</h1>
        <p className="text-xs text-muted-foreground">What are you trying to achieve?</p>
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
        Continue
      </Button>
    </div>
  );
}
