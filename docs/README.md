# Calorie Tracker — Documentation

A Progressive Web App (PWA) for intelligent, AI-assisted calorie and macronutrient tracking built with Next.js 16, Tailwind CSS v4, and shadcn/ui.

## Documentation Index

| File | Description |
|---|---|
| [architecture.md](./architecture.md) | Tech stack, project structure, and design decisions |
| [features.md](./features.md) | Full feature specification for all modules |
| [ai-integration.md](./ai-integration.md) | AI meal-parsing via voice and text input |
| [data-visualization.md](./data-visualization.md) | Charts and graphs (Chart.js) strategy |
| [pwa.md](./pwa.md) | PWA configuration and installability |
| [data-model.md](./data-model.md) | Data schemas for meals, logs, and user profiles |

## Pages

| File | Description |
|---|---|
| [pages/dashboard.md](./pages/dashboard.md) | Daily tracker — layout, components, state, and interactions |

## Quick Start

```bash
pnpm install
pnpm dev
```

## High-Level Overview

```
User
 ├── Describes meal (voice or text)
 │    └── AI Agent  →  calories + macros estimate
 ├── Reviews and confirms entry
 └── Daily log updated
          ├── Daily dashboard  (rings, bars, timeline)
          └── Weekly/Monthly  (trend lines, heatmaps)
```
