'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useI18nContext } from '@/lib/i18n/i18n-react';
import type { ParsedMeal } from './types';

export function TextInput({ onParsed }: { onParsed: (meal: ParsedMeal) => void }) {
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
      <Textarea
        rows={4}
        placeholder={LL.addMeal.textPlaceholder()}
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 500))}
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

