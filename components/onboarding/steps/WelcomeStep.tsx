import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  onSetup: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onSetup, onSkip }: Props) {
  const { LL } = useI18nContext();
  return (
    <div className="w-full text-center space-y-8">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Target className="size-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{LL.onboarding.welcomeTitle()}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {LL.onboarding.welcomeDescription()}
        </p>
      </div>
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={onSetup}>
          {LL.onboarding.setupGoal()}
        </Button>
        <Button className="w-full" variant="ghost" onClick={onSkip}>
          {LL.onboarding.skipForNow()}
        </Button>
      </div>
    </div>
  );
}
