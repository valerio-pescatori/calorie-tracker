import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onSetup: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onSetup, onSkip }: Props) {
  return (
    <div className="w-full text-center space-y-8">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Target className="size-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Do you want to set up a daily nutrition goal?
          <br />
          It only takes a minute.
        </p>
      </div>
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={onSetup}>
          Set up my goal
        </Button>
        <Button className="w-full" variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
