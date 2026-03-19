"use client";

import { ReactNode, useState } from "react";
import { PenLine, Mic, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { useI18nContext } from "@/lib/i18n/i18n-react";
import type { MealEntry, MealType } from "@/types";
import type { Tab, ParsedMeal } from "./types";
import { MealConfirmCard } from "./MealConfirmCard";
import { TextInput } from "./TextInput";
import { VoiceInput } from "./VoiceInput";
import { ManualInput } from "./ManualInput";

interface AddMealPanelProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function AddMealPanel({ open: controlledOpen, onOpenChange }: AddMealPanelProps = {}) {
  const { LL } = useI18nContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function setOpen(v: boolean) {
    setInternalOpen(v);
    onOpenChange?.(v);
  }
  const [tab, setTab] = useState<Tab>("text");
  const [parsed, setParsed] = useState<ParsedMeal | null>(null);
  const addMeal = useStore((s) => s.addMeal);

  function handleParsed(meal: ParsedMeal) {
    setParsed(meal);
  }

  async function handleTranscriptToAI(transcript: string) {
    try {
      const res = await fetch("/api/ai/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: transcript.slice(0, 500) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParsed(data);
    } catch {
      // fall through — user sees voice tab with transcript still visible
    }
  }

  function handleConfirm(meal: ParsedMeal & { mealType: MealType }) {
    addMeal({
      name: meal.name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      mealType: meal.mealType,
      source: tab === "voice" ? "ai_voice" : "ai_text",
      confidence: meal.confidence,
      notes: meal.notes,
    });
    setParsed(null);
    setOpen(false);
  }

  function handleManualAdd(entry: Omit<MealEntry, "id" | "timestamp">) {
    addMeal(entry);
    setOpen(false);
  }

  const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "text", label: LL.addMeal.tabText(), icon: <PenLine className="h-4 w-4" /> },
    { id: "voice", label: LL.addMeal.tabVoice(), icon: <Mic className="h-4 w-4" /> },
    { id: "manual", label: LL.addMeal.tabManual(), icon: <Search className="h-4 w-4" /> },
  ] as const;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="rounded-t-2xl h-auto max-h-[85dvh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{LL.addMeal.title()}</SheetTitle>
        </SheetHeader>

        <div className="p-4">
          {parsed ? (
            <MealConfirmCard parsed={parsed} onConfirm={handleConfirm} onCancel={() => setParsed(null)} />
          ) : (
            <>
              {/* Tab selector */}
              <div className="flex gap-1 bg-white/6 border border-white/8 rounded-xl p-1 mb-5">
                {TABS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors
                    ${tab === id ? "bg-white/10 text-foreground border border-white/12" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {tab === "text" && <TextInput onParsed={handleParsed} />}
              {tab === "voice" && <VoiceInput onTranscript={handleTranscriptToAI} />}
              {tab === "manual" && <ManualInput onAdd={handleManualAdd} />}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
