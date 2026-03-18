import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BodyFormData } from "../types";
import { useI18nContext } from "@/lib/i18n/i18n-react";

interface Props {
  body: BodyFormData;
  setBody: React.Dispatch<React.SetStateAction<BodyFormData>>;
  onContinue: () => void;
}

const FIELDS = [
  { key: "weightKg" as const, unit: "kg", placeholder: "70" },
  { key: "heightCm" as const, unit: "cm", placeholder: "170" },
  { key: "ageYears" as const, unit: "yrs", placeholder: "30" },
];

export function BodyStatsStep({ body, setBody, onContinue }: Props) {
  const { LL } = useI18nContext();
  const fieldLabels: Record<keyof Omit<BodyFormData, "sex">, string> = {
    weightKg: LL.onboarding.weight(),
    heightCm: LL.onboarding.height(),
    ageYears: LL.onboarding.age(),
  };
  const sexLabels: Record<BodyFormData["sex"], string> = {
    male: LL.common.male(),
    female: LL.common.female(),
    other: LL.common.other(),
  };
  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-xl font-bold text-foreground">{LL.onboarding.bodyStatsTitle()}</h1>
        <p className="text-xs text-muted-foreground">{LL.onboarding.bodyStatsSubtitle()}</p>
      </div>

      <div className="space-y-4">
        {FIELDS.map(({ key, unit, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{fieldLabels[key]}</label>
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
          <label className="text-sm font-medium text-foreground/80">{LL.onboarding.sex()}</label>
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
                {sexLabels[s]}
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
        {LL.common.continue()}
      </Button>
    </div>
  );
}
