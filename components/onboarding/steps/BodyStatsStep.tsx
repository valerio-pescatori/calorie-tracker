import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BodyFormData } from "../types";

interface Props {
  body: BodyFormData;
  setBody: React.Dispatch<React.SetStateAction<BodyFormData>>;
  onContinue: () => void;
}

const FIELDS = [
  { key: "weightKg" as const, label: "Weight", unit: "kg",  placeholder: "70" },
  { key: "heightCm" as const, label: "Height", unit: "cm",  placeholder: "170" },
  { key: "ageYears" as const, label: "Age",    unit: "yrs", placeholder: "30" },
];

export function BodyStatsStep({ body, setBody, onContinue }: Props) {
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">Your stats</h1>
        <p className="text-xs text-muted-foreground">Used to calculate your daily energy needs</p>
      </div>

      <div className="space-y-4">
        {FIELDS.map(({ key, label, unit, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{label}</label>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder={placeholder}
                value={body[key]}
                onChange={(e) => setBody((s) => ({ ...s, [key]: e.target.value }))}
                className="pr-10"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                {unit}
              </span>
            </div>
          </div>
        ))}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">Sex</label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["male", "female", "other"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className={`flex-1 py-2 text-sm capitalize transition-colors ${
                  body.sex === s
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setBody((b) => ({ ...b, sex: s }))}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={!body.weightKg || !body.heightCm || !body.ageYears}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}
