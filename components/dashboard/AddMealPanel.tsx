'use client';

import { useState, useRef } from 'react';
import { Plus, Mic, MicOff, Send, PenLine, Search, CheckCircle2, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { useI18nContext } from '@/lib/i18n/i18n-react';
import type { MealEntry, MealType, Confidence } from '@/types';

type Tab = 'text' | 'voice' | 'manual';

interface ParsedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: Confidence;
  notes?: string;
}

// ─── Meal Confirm Card ────────────────────────────────────────────────────────

interface ConfirmCardProps {
  parsed: ParsedMeal;
  onConfirm: (meal: ParsedMeal & { mealType: MealType }) => void;
  onCancel: () => void;
}

function MealConfirmCard({ parsed, onConfirm, onCancel }: ConfirmCardProps) {
  const [form, setForm] = useState({ ...parsed, mealType: 'lunch' as MealType });
  const { LL } = useI18nContext();
  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [key]: key === 'name' ? e.target.value : Number(e.target.value) }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{LL.addMeal.reviewEstimate()}</h3>
        <button onClick={onCancel}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{LL.addMeal.mealName()}</label>
          <input
            value={form.name}
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            className="input-dark"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { key: 'calories', label: LL.goals.caloriesKcal() },
              { key: 'protein',  label: LL.goals.proteinG() },
              { key: 'carbs',    label: LL.goals.carbsG() },
              { key: 'fat',      label: LL.goals.fatG() },
            ] as { key: keyof ParsedMeal; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input
                type="number"
                min={0}
                value={form[key] as number}
                onChange={f(key as keyof typeof form)}
                className="input-dark"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{LL.addMeal.mealType()}</label>
          <select
            value={form.mealType}
            onChange={(e) => setForm((v) => ({ ...v, mealType: e.target.value as MealType }))}
            className="input-dark"
          >
            <option value="breakfast">{LL.common.breakfast()}</option>
            <option value="lunch">{LL.common.lunch()}</option>
            <option value="dinner">{LL.common.dinner()}</option>
            <option value="snack">{LL.common.snack()}</option>
          </select>
        </div>

        {form.confidence !== 'high' && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1">
            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
              {form.confidence === 'low' ? LL.addMeal.lowConfidence() : LL.addMeal.mediumConfidence()}
            </Badge>
            {form.notes && <p className="text-xs text-amber-400/80 italic">&ldquo;{form.notes}&rdquo;</p>}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="flex-1" onClick={onCancel}>{LL.common.cancel()}</Button>
        <Button className="flex-1" onClick={() => onConfirm(form)}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> {LL.addMeal.addMeal()}
        </Button>
      </div>
    </div>
  );
}

// ─── Text Input ───────────────────────────────────────────────────────────────

function TextInput({ onParsed }: { onParsed: (meal: ParsedMeal) => void }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { LL } = useI18nContext();

  async function handleSubmit() {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.slice(0, 500) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      onParsed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : LL.addMeal.failedToParse());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        rows={4}
      placeholder={LL.addMeal.textPlaceholder()}
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 500))}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{LL.addMeal.charCount({ count: description.length })}</span>
        <Button size="sm" disabled={!description.trim() || loading} onClick={handleSubmit}>
          {loading ? LL.addMeal.analysing() : <><Send className="h-4 w-4 mr-1" /> {LL.addMeal.analyse()}</>}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Voice Input ──────────────────────────────────────────────────────────────

function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<unknown>(null);
  const { LL } = useI18nContext();

  function startRecording() {
    setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      setError(LL.addMeal.voiceNotSupported());
      return;
    }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (e: Event & { results: SpeechRecognitionResultList }) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join('');
      setTranscript(t);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => {
      setError('Could not access microphone.');
      setRecording(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }

  function stopRecording() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop();
    setRecording(false);
  }

  return (
    <div className="space-y-4 flex flex-col items-center">
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg
          ${recording
            ? 'bg-destructive hover:bg-destructive/90 animate-pulse'
            : 'fab-glow'
          }`}
      >
        {recording
          ? <MicOff className="h-8 w-8 text-white" />
          : <Mic className="h-8 w-8 text-white" />}
      </button>
      <p className="text-sm text-muted-foreground">{recording ? LL.addMeal.listening() : LL.addMeal.tapToRecord()}</p>

      {transcript && (
        <div className="w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm text-foreground/80 italic">
          &ldquo;{transcript}&rdquo;
        </div>
      )}
      {error && <p className="text-xs text-destructive text-center">{error}</p>}

      {transcript && !recording && (
        <Button className="w-full" onClick={() => onTranscript(transcript)}>
          <Send className="h-4 w-4 mr-1" /> {LL.addMeal.analyseThisMeal()}
        </Button>
      )}
    </div>
  );
}

// ─── Manual Input ─────────────────────────────────────────────────────────────

interface ManualInputProps {
  onAdd: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
}

function ManualInput({ onAdd }: ManualInputProps) {
  const empty = { name: '', calories: 0, protein: 0, carbs: 0, fat: 0, mealType: 'lunch' as MealType };
  const [form, setForm] = useState(empty);
  const { LL } = useI18nContext();
  const fieldLabels: Record<string, string> = {
    calories: LL.goals.caloriesKcal(),
    protein: LL.goals.proteinG(),
    carbs: LL.goals.carbsG(),
    fat: LL.goals.fatG(),
  };

  function handleSubmit() {
    if (!form.name.trim() || form.calories <= 0) return;
    onAdd({ ...form, source: 'manual' });
    setForm(empty);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">{LL.addMeal.mealName()}</label>
        <input
          placeholder={LL.addMeal.mealNamePlaceholder()}
          value={form.name}
          onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['calories', 'protein', 'carbs', 'fat'] as const).map((key) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">
              {fieldLabels[key]}
            </label>
            <input
              type="number"
              min={0}
              value={form[key]}
              onChange={(e) => setForm((v) => ({ ...v, [key]: Number(e.target.value) }))}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-zinc-500">{LL.addMeal.mealType()}</label>
        <select
          value={form.mealType}
          onChange={(e) => setForm((v) => ({ ...v, mealType: e.target.value as MealType }))}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="breakfast">{LL.common.breakfast()}</option>
          <option value="lunch">{LL.common.lunch()}</option>
          <option value="dinner">{LL.common.dinner()}</option>
          <option value="snack">{LL.common.snack()}</option>
        </select>
      </div>
      <Button className="w-full" disabled={!form.name.trim() || form.calories <= 0} onClick={handleSubmit}>
        <Plus className="h-4 w-4 mr-1" /> {LL.addMeal.addMeal()}
      </Button>
    </div>
  );
}

// ─── Add Meal Panel ───────────────────────────────────────────────────────────

interface AddMealPanelProps {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

export function AddMealPanel({ open: controlledOpen, onOpenChange }: AddMealPanelProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  function setOpen(v: boolean) {
    setInternalOpen(v);
    onOpenChange?.(v);
  }
  const [tab, setTab] = useState<Tab>('text');
  const [parsed, setParsed] = useState<ParsedMeal | null>(null);
  const addMeal = useStore((s) => s.addMeal);

  function handleParsed(meal: ParsedMeal) {
    setParsed(meal);
  }

  async function handleTranscriptToAI(transcript: string) {
    try {
      const res = await fetch('/api/ai/parse-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      source: tab === 'voice' ? 'ai_voice' : 'ai_text',
      confidence: meal.confidence,
      notes: meal.notes,
    });
    setParsed(null);
    setOpen(false);
  }

  function handleManualAdd(entry: Omit<MealEntry, 'id' | 'timestamp'>) {
    addMeal(entry);
    setOpen(false);
  }

  const { LL } = useI18nContext();
  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'text',   label: LL.addMeal.tabText(),  icon: <PenLine className="h-4 w-4" /> },
    { id: 'voice',  label: LL.addMeal.tabVoice(), icon: <Mic className="h-4 w-4" /> },
    { id: 'manual', label: LL.addMeal.tabManual(), icon: <Search className="h-4 w-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl h-auto max-h-[85dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{LL.addMeal.title()}</SheetTitle>
          </SheetHeader>

          {parsed ? (
            <MealConfirmCard
              parsed={parsed}
              onConfirm={handleConfirm}
              onCancel={() => setParsed(null)}
            />
          ) : (
            <>
              {/* Tab selector */}
              <div className="flex gap-1 bg-white/6 border border-white/8 rounded-xl p-1 mb-5">
                {TABS.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors
                      ${tab === id ? 'bg-white/10 text-foreground border border-white/12' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {tab === 'text'   && <TextInput onParsed={handleParsed} />}
              {tab === 'voice'  && <VoiceInput onTranscript={handleTranscriptToAI} />}
              {tab === 'manual' && <ManualInput onAdd={handleManualAdd} />}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
