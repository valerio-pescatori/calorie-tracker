import { Button } from "@/components/ui/button";
import { MacroFields } from "../MacroFields";
import type { MacroFormData } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  macros: MacroFormData;
  setMacros: React.Dispatch<React.SetStateAction<MacroFormData>>;
  saving: boolean;
  onSave: () => void;
}

export function DirectStep({ macros, setMacros, saving, onSave }: Props) {
  const filled = macros.calories && macros.protein && macros.carbs && macros.fat;
  const { LL } = useI18nContext();
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.directTitle()}</h1>
        <p className="text-xs text-muted-foreground">{LL.onboarding.directSubtitle()}</p>
      </div>
      <MacroFields macros={macros} onChange={setMacros} showPlaceholders />
      <Button className="w-full" size="lg" disabled={!filled || saving} onClick={onSave}>
        {saving ? LL.onboarding.directSaving() : LL.onboarding.directSave()}
      </Button>
    </div>
  );
}
