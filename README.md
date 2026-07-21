# LifeTwin

**Your future changes every day.**

LifeTwin is a visual AI that simulates a person's future. It is not a chatbot,
not a habit tracker, and not an assistant — it shows you where your life is
heading, and lets you improve it a little every day.

## The experience

1. **Landing** — one headline, one call to action.
2. **Onboarding** — three fullscreen questions: your one-year goal, what holds
   you back, and your current situation.
3. **Future Dashboard** — the product:
   - **Future Score** — a large animated percentage with day-over-day delta.
   - **Twin Sync** — how closely you currently live like your future self.
   - **Future Paths** — Current Path vs. LifeTwin Path across Health, Money,
     Mood, Confidence and Productivity.
   - **Timeline** — an animated 12-month projection (Today → 3 → 6 → 12 months).
   - **Today's Future Quest** — one simple daily action. Completing it raises
     your Future Score and Twin Sync, replays the timeline, and celebrates.
   - **AI Insight** — one sentence. Never a conversation.

## Tech

- Next.js 15 (App Router) + TypeScript
- TailwindCSS with shadcn-style UI primitives
- Framer Motion, Lucide Icons, Recharts
- All state in `localStorage` — no backend, no auth, fully local
- Deploy-ready for Vercel

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Architecture

```
app/                  Routes: landing, onboarding, dashboard
components/
  dashboard/          Dashboard sections (score, sync, paths, timeline, quest, insight)
  shared/             Reusable visuals (score ring, stat bar, animated number, confetti)
  ui/                 shadcn-style primitives (button, card, textarea)
hooks/use-life-twin.ts  All product state: load, simulate, complete quest
lib/
  ai/ai-service.ts    AIService abstraction + deterministic mock
  storage.ts          localStorage persistence
  types.ts            Shared domain types (FutureSimulation, TwinState, …)
```

### Plugging in a real AI

The app only ever talks to the `AIService` interface
(`lib/ai/ai-service.ts`). To use Claude, OpenAI or Grok, implement
`AIService.simulate()` against the provider of your choice and swap the
implementation returned by `getAIService()`. The rest of the app is untouched.
