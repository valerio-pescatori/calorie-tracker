import { Button } from "@/components/ui/button";
import type { ActivityLevel } from "@/types";
import { ACTIVITY_OPTIONS } from "../types";

interface Props {
  activity: ActivityLevel;
  setActivity: React.Dispatch<React.SetStateAction<ActivityLevel>>;
  onContinue: () => void;
}

export function ActivityStep({ activity, setActivity, onContinue }: Props) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">Activity level</h1>
        <p className="text-xs text-muted-foreground">How active are you on a typical week?</p>
      </div>

      <div className="space-y-2">
        {ACTIVITY_OPTIONS.map(({ value, label, description }) => (
          <button
            key={value}
            type="button"
            className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
              activity === value
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40 hover:bg-muted"
            }`}
            onClick={() => setActivity(value)}
          >
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
