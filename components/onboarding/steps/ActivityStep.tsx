import { Button } from "@/components/ui/button";
import type { ActivityLevel } from "@/types";
import { ACTIVITY_OPTIONS } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  activity: ActivityLevel;
  setActivity: React.Dispatch<React.SetStateAction<ActivityLevel>>;
  onContinue: () => void;
}

export function ActivityStep({ activity, setActivity, onContinue }: Props) {
  const { LL } = useI18nContext();
  const activityLabels: Record<ActivityLevel, { label: string; description: string }> = {
    sedentary: {
      label: LL.onboarding.activitySedentaryLabel(),
      description: LL.onboarding.activitySedentaryDesc(),
    },
    lightly_active: {
      label: LL.onboarding.activityLightlyLabel(),
      description: LL.onboarding.activityLightlyDesc(),
    },
    moderately_active: {
      label: LL.onboarding.activityModeratelyLabel(),
      description: LL.onboarding.activityModeratelyDesc(),
    },
    very_active: {
      label: LL.onboarding.activityVeryLabel(),
      description: LL.onboarding.activityVeryDesc(),
    },
    extra_active: {
      label: LL.onboarding.activityExtraLabel(),
      description: LL.onboarding.activityExtraDesc(),
    },
  };
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.activityTitle()}</h1>
        <p className="text-xs text-muted-foreground">{LL.onboarding.activitySubtitle()}</p>
      </div>

      <div className="space-y-2">
        {ACTIVITY_OPTIONS.map((value) => (
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
            <p className="text-sm font-semibold text-foreground">{activityLabels[value].label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{activityLabels[value].description}</p>
          </button>
        ))}
      </div>

      <Button className="w-full" size="lg" onClick={onContinue}>
        {LL.common.continue()}
      </Button>
    </div>
  );
}
