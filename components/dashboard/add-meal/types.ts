import type { Confidence } from '@/types';

export type Tab = 'text' | 'voice' | 'manual';

export interface ParsedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: Confidence;
  notes?: string;
}
