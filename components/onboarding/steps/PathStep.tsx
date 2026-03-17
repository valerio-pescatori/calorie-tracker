import type { Step } from "../types";

interface Props {
  onChoose: (next: Step) => void;
}

const OPTIONS = [
  {
    next: "body-stats" as Step,
    title: "Guide me through it",
    description: "We'll calculate your target based on your stats",
  },
  {
    next: "direct" as Step,
    title: "I know my numbers",
    description: "Enter your calorie and macro targets directly",
  },
];

export function PathStep({ onChoose }: Props) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-foreground">
          How would you like to set your calorie target?
        </h1>
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
