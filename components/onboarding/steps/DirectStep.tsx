import { Button } from "@/components/ui/button";
import { MacroFields } from "../MacroFields";
import type { MacroFormData } from "../types";

interface Props {
  macros: MacroFormData;
  setMacros: React.Dispatch<React.SetStateAction<MacroFormData>>;
  saving: boolean;
  onSave: () => void;
}

export function DirectStep({ macros, setMacros, saving, onSave }: Props) {
  const filled = macros.calories && macros.protein && macros.carbs && macros.fat;
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">Your daily goals</h1>
        <p className="text-xs text-muted-foreground">Enter your calorie and macro targets.</p>
      </div>
      <MacroFields macros={macros} onChange={setMacros} showPlaceholders />
      <Button className="w-full" size="lg" disabled={!filled || saving} onClick={onSave}>
        {saving ? "Saving…" : "Save & continue"}
      </Button>
    </div>
  );
}
