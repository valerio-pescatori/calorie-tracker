# AI Integration

The AI meal-parsing pipeline is the core differentiator of this app. It accepts either **voice** or **text** input and returns a structured calorie + macro estimate.

## Model & SDK

- **Provider**: OpenAI (GPT-4o recommended; configurable via env var)
- **SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) — handles streaming, tool calling, and edge compatibility
- **Speech-to-text**: Web Speech API (browser-native, zero latency) with Whisper API fallback for unsupported browsers

## Environment Variables

```env
OPENAI_API_KEY=sk-...
# Optional overrides
AI_MODEL=gpt-4o
AI_MAX_TOKENS=512
```

---

## Text Input Flow

```
[User types meal description]
        │
        ▼
POST /api/ai/parse-meal
  body: { description: string }
        │
        ▼
 System prompt + user message → OpenAI
        │
        ▼
 Structured output (JSON tool call)
  { name, calories, protein, carbs, fat, confidence, notes }
        │
        ▼
 Streamed back to client → MealConfirmCard rendered
```

### API Route: `/api/ai/parse-meal`

```ts
// app/api/ai/parse-meal/route.ts
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { mealSchema } from '@/types';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { description } = await req.json();

  return streamObject({
    model: openai(process.env.AI_MODEL ?? 'gpt-4o'),
    schema: mealSchema,
    system: SYSTEM_PROMPT,
    prompt: description,
  });
}
```

### System Prompt

```
You are a professional nutritionist AI. Given a meal description in natural language,
estimate the total calories and macronutrient breakdown (protein, carbs, fat in grams).

Rules:
- Base estimates on standard USDA portion sizes unless the user specifies quantities.
- If quantities are vague (e.g. "a bowl", "a handful"), use a reasonable average.
- Always return a confidence level: "high" | "medium" | "low".
- Add a brief `notes` field explaining key assumptions.
- Never refuse to estimate; always provide a best-guess with low confidence if unsure.
- Output must match the required JSON schema exactly.
```

---

## Voice Input Flow

```
[User holds mic button]
        │
        ▼
Web Speech API (SpeechRecognition)
  → interim transcript shown in real time
        │
        ▼
[User releases button / silence detected]
  - If Web Speech API unsupported:
      → MediaRecorder captures audio blob
      → POST /api/ai/voice  (Whisper transcription)
        │
        ▼
[Transcript string]  →  same as Text Input Flow above
```

### `useVoiceRecorder` Hook

Responsibilities:
- Manages `SpeechRecognition` lifecycle
- Falls back to `MediaRecorder` → Whisper if needed
- Exposes: `{ isRecording, transcript, startRecording, stopRecording, error }`

### API Route: `/api/ai/voice` (Whisper fallback)

```ts
// app/api/ai/voice/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get('audio') as File;

  const transcription = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: audio,
  });

  // Forward transcript to parse-meal logic
  return parseMealFromDescription(transcription.text);
}
```

---

## MealEntry Schema (Zod)

```ts
// types/index.ts
import { z } from 'zod';

export const mealSchema = z.object({
  name:        z.string().describe('Short descriptive meal name'),
  calories:    z.number().int().positive(),
  protein:     z.number().nonnegative().describe('Grams of protein'),
  carbs:       z.number().nonnegative().describe('Grams of carbohydrates'),
  fat:         z.number().nonnegative().describe('Grams of fat'),
  confidence:  z.enum(['high', 'medium', 'low']),
  notes:       z.string().optional().describe('Assumptions made during estimation'),
});

export type MealEntry = z.infer<typeof mealSchema>;
```

---

## UX Considerations

| Scenario | Behaviour |
|---|---|
| Low confidence estimate | Yellow badge on MealConfirmCard + show notes |
| Network offline | Disable AI entry, show offline banner, suggest manual entry |
| Partial transcript | Show live interim text while recording |
| AI returns malformed JSON | Graceful error, prompt user to retry or enter manually |
| Long description | Truncate to 500 chars before sending; warn user |
