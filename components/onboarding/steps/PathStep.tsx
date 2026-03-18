import type { Step } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  onChoose: (next: Step) => void;
}

export function PathStep({ onChoose }: Props) {
  const { LL } = useI18nContext();
  const OPTIONS = [
    { next: "body-stats" as Step, title: LL.onboarding.pathGuideTitle(), description: LL.onboarding.pathGuideDesc() },
    { next: "direct" as Step, title: LL.onboarding.pathDirectTitle(), description: LL.onboarding.pathDirectDesc() },
  ];
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.pathTitle()}</h1>
      </div>
      <div className="space-y-3">
        {OPTIONS.map(({ next, title, description }) => (
          <button
            key={next}
            type="button"
            className="w-full rounded-xl border border-border p-4 text-left hover:border-primary/50 hover:bg-muted transition-colors glass-card"
            onClick={() => onChoose(next)}
          >
            <p className="font-semibold text-sm text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
