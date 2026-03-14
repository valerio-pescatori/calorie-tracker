import { NextResponse } from 'next/server';

// TODO: Replace with real OpenRouter AI call (see docs/ai-integration.md)
// POST /api/ai/parse-meal
// Body: { description: string }
// Response: { name, calories, protein, carbs, fat, confidence, notes }

export async function POST(req: Request) {
  let description: string;
  try {
    const body = await req.json();
    description = String(body?.description ?? '').trim().slice(0, 500);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 });
  }

  // ── Placeholder response ──────────────────────────────────────────────────
  // This returns a mock response so the UI flow can be tested end-to-end.
  // Replace with an actual AI call before production deployment.
  return NextResponse.json({
    name: description.length > 60 ? description.slice(0, 60) + '…' : description,
    calories: 400,
    protein: 25,
    carbs: 45,
    fat: 12,
    confidence: 'low',
    notes: 'AI integration not yet configured — this is a placeholder estimate.',
  });
}
