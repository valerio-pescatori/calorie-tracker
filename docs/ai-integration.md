# AI Integration

The AI meal-parsing pipeline is the core differentiator of this app. It accepts either **voice** or **text** input and returns a structured calorie + macro estimate.

## Model & SDK

- **Router**: [OpenRouter](https://openrouter.ai/) — unified API across Claude, GPT-4o, Gemini, Llama, Mistral and more. Swap models with a single env var, no code changes.
- **SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) via `@openrouter/ai-sdk-provider` — handles streaming, tool calling, and edge compatibility
- **Speech-to-text**: Web Speech API (browser-native, zero latency) with **Groq Whisper** fallback for unsupported browsers. OpenRouter does not handle audio, so transcription is routed to Groq's Whisper-v3 endpoint separately.

## Why OpenRouter over direct OpenAI

| Concern | OpenRouter |
|---|---|
| Vendor lock-in | None — switch model in one env var |
| Cost | Can route to cheaper models (Gemini Flash, Haiku) for structured tasks |
| Model variety | Claude 3.5/3.7, GPT-4o, Gemini 2.0, Llama 3.x, Mistral, etc. |
| API compatibility | OpenAI-format, minimal code difference |
| Audio/Whisper | Not supported — use Groq for transcription |

## Recommended Models

| Task | Recommended model | Why |
|---|---|---|
| Meal parsing (structured output) | `anthropic/claude-3.5-haiku` | Cheap, fast, excellent at JSON |
| Meal parsing (higher accuracy) | `anthropic/claude-3.7-sonnet` | Best for ambiguous descriptions |
| Fallback / budget | `google/gemini-2.0-flash` | Very cheap, good structured output |
| Voice transcription | `whisper-large-v3` via **Groq** | Fast, accurate, generous free tier |

## Environment Variables

```env
# OpenRouter (chat / structured output)
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=anthropic/claude-3.5-haiku   # swap freely, no code changes
AI_MAX_TOKENS=512

# Groq (voice transcription fallback)
GROQ_API_KEY=gsk_...
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
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamObject } from 'ai';
import { mealSchema } from '@/types';

export const runtime = 'edge';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {
  const { description } = await req.json();

  return streamObject({
    model: openrouter(process.env.AI_MODEL ?? 'anthropic/claude-3.5-haiku'),
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
- Base estimates on standard European portion sizes and use EU/EFSA nutritional reference values.
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

### API Route: `/api/ai/voice` (Groq Whisper fallback)

OpenRouter doesn't handle audio, so the transcription step hits Groq directly. Groq exposes an OpenAI-compatible endpoint, so the `openai` SDK works with a custom `baseURL`.

```ts
// app/api/ai/voice/route.ts
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const audio = formData.get('audio') as File;

  const transcription = await groq.audio.transcriptions.create({
    model: 'whisper-large-v3',
    file: audio,
  });

  // Forward transcript to the same parse-meal logic
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

---

## Packages to Install

```bash
pnpm add @openrouter/ai-sdk-provider ai openai zod
```

> `openai` is used only for the Groq Whisper transcription call (Groq exposes an OpenAI-compatible endpoint). No direct OpenAI account needed.
