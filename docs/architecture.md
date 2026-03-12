# Architecture

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | File-based routing, RSC, built-in API routes |
| Styling | Tailwind CSS v4 | Utility-first, design tokens, dark mode |
| UI Components | shadcn/ui | Accessible, unstyled-by-default, copy-owned |
| Charts | Chart.js + react-chartjs-2 | Straightforward API; D3.js reserved for custom viz |
| AI | Vercel AI SDK + OpenAI | Streaming text/voice responses, tool calling |
| Speech | Web Speech API (browser) + Whisper (fallback) | Native voice input, server-side transcription fallback |
| State | Zustand | Lightweight client-side state for daily log |
| Persistence | localStorage / IndexedDB (phase 1), Postgres via Drizzle ORM (phase 2) | Offline-first then sync |
| PWA | next-pwa | Service worker, caching, install prompt |

## Project Structure

```
calorie-tracker/
├── app/
│   ├── layout.tsx               # Root layout, PWA meta tags, theme provider
│   ├── page.tsx                 # Redirects to /dashboard
│   ├── dashboard/
│   │   └── page.tsx             # Daily tracker view
│   ├── progress/
│   │   └── page.tsx             # Weekly/monthly charts view
│   ├── log/
│   │   └── page.tsx             # Full meal log history
│   └── api/
│       ├── ai/
│       │   └── parse-meal/
│       │       └── route.ts     # AI meal parsing endpoint
│       └── ai/
│           └── voice/
│               └── route.ts     # Audio → transcription → meal parse
├── components/
│   ├── ui/                      # shadcn/ui generated components
│   ├── dashboard/
│   │   ├── CalorieSummaryRing.tsx
│   │   ├── MacroBreakdownBar.tsx
│   │   ├── MealTimeline.tsx
│   │   └── AddMealPanel.tsx
│   ├── ai/
│   │   ├── VoiceInput.tsx
│   │   ├── TextMealInput.tsx
│   │   └── MealConfirmCard.tsx
│   └── progress/
│       ├── WeeklyTrendChart.tsx
│       ├── MonthlyHeatmap.tsx
│       └── MacroStackedBar.tsx
├── lib/
│   ├── ai.ts                    # AI SDK client setup
│   ├── store.ts                 # Zustand store
│   ├── nutrition.ts             # Macro helpers and calculation utils
│   └── db.ts                    # DB client (phase 2)
├── hooks/
│   ├── useVoiceRecorder.ts
│   └── useDailyLog.ts
├── types/
│   └── index.ts                 # Shared TypeScript types
├── docs/                        # ← you are here
└── public/
    ├── manifest.json            # PWA manifest
    └── icons/
```

## Rendering Strategy

- **Dashboard & Progress pages** → Client Components (heavy interactivity + charts)
- **API routes** → Edge runtime for AI streaming
- **Layout / nav** → Server Components (static shell)

## Data Flow

```
[User Input] ──► [AI API Route] ──► [OpenAI / Whisper]
                      │
                      ▼
              [Parsed MealEntry]
                      │
                      ▼
              [Zustand Store] ──► [Persist to IndexedDB]
                      │
                      ▼
          [Dashboard / Progress Charts]
```
