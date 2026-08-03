# OffertPro

**Det här är den AI-drivna medgrundaren som sköter hela ditt hantverksföretag.**

Inte ännu en formulärbaserad offertgenerator. Beskriv jobbet — text eller
röst — och AI:t bygger material, arbetstid, ROT-avdrag och pris. En
digital tvilling av företaget: samma timpris, samma marginaler, samma
favoritmaterial, varje gång.

## Var kommer det ifrån?

OffertPro föddes ur Karma, en konsument-app för köpbeslut (matkasse,
byggmaterial, m.m.). Bygg-domänens AI-kalkylatorer — riktig matematik som
räknar ut material och arbetstid från mått och några följdfrågor — visade
sig vara exakt den motor ett hantverkar-OS behöver, bara omramad från
"vad ska jag köpa" till "vad ska jag offerera kunden". Allt konsument-
e-handel (matkasse, apotek, husdjur, elektronik, bilservice, live-karta,
butiksjämförelse) är borttaget — se git-historiken om det någonsin
behövs igen.

## Upplevelsen

1. **Dashboard** (`/`) — aldrig ett formulär. En AI Command Bar
   (Raycast/Linear-stil, text eller röst) överst, KPI-widgets (månadens
   omsättning, offerter, väntar på svar, snittmarginal) och kommande jobb
   — allt riktiga Postgres-frågor, aldrig fejkad data. Ingen databas
   ansluten än? En tydlig banner säger exakt det istället för att krascha
   eller visa påhittade siffror.
2. **AI Command Bar** (`components/dashboard/command-bar.tsx`) — pratar
   med Claude (`/api/ai/chat`, `claude-opus-5`) för att förstå jobbet,
   med riktig röstinmatning (`lib/use-speech-input.ts`, Web Speech API,
   sv-SE) för händer i handskar eller bakom ratten. Hittar aldrig på
   material eller pris själv — det gör kalkylatorn efteråt.
3. **AI-Kalkylator** (`/calculator`) — åtta projekttyper (Altan,
   Innervägg, Yttervägg, Golv, Tak, Målning, Isolering, Parkering), samma
   mönster för alla: mått + några följdfrågor in, en fullt kvantifierad
   materiallista, arbetstid, moms och ROT-avdrag ut. Timpris och
   materialpåslag justerbara direkt i kalkylen.
4. **Offerter, Kunder, Materialbank, AI Studio, Inställningar** — ärligt
   "kommer snart": informationsarkitekturen och datamodellen (Prisma-
   schemat) finns redan, UI:t byggs i nästa fas.

## Tech

- Next.js 15 (App Router) + TypeScript, Tailwind, Framer Motion
- Postgres via Prisma (`prisma/schema.prisma`) — kräver `DATABASE_URL`
  (Supabase, Neon eller Vercel Postgres) i miljövariablerna; utan den
  degraderar Dashboarden ärligt till nollställda KPI:er + en synlig
  banner istället för att krascha
- Claude (`@anthropic-ai/sdk`, `claude-opus-5`) för Command Bar-
  konversationen — kräver `ANTHROPIC_API_KEY`, samma ärliga
  fallback-mönster
- Vitest (`npm test`) för de rena, deterministiska kalkylatorfunktionerna

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000. Lägg till `DATABASE_URL` och kör
`npm run db:push` (eller `npm run db:migrate` för en riktig migrationshistorik)
för att slå på Dashboardens riktiga data. Lägg till `ANTHROPIC_API_KEY`
för att slå på AI Command Bar.

## Arkitektur

```
app/
  page.tsx                 Dashboard — KPI:er (Prisma) + AI Command Bar
  calculator/page.tsx      AI-Kalkylatorn — 8 projekttyper, en sida
  offers/ customers/       "Kommer snart" — datamodellen finns, UI:t inte än
  materials/ ai-studio/
  settings/
  api/ai/chat/route.ts     Claude-integrationen bakom Command Bar
components/
  nav/app-shell.tsx        Sidebar (desktop) + bottom nav (mobil)
  dashboard/command-bar.tsx  AI Command Bar — text + röst
  profile/fields.tsx       Delade formulärkomponenter (chip-grupper, toggles)
  shared/                  Ambient bg, animated number, confetti, coming-soon
  ui/                      Button, Card
lib/
  cart-engine/*-catalog.ts  De 8 AI-kalkylatorerna — ren matematik, mått in,
                             material + arbetstid ut, ingen butik inblandad
  quote-engine/material.ts  MaterialItem — den gemensamma prisrads-typen
                             kalkylatorerna producerar
  use-speech-input.ts      Web Speech API-wrapper (sv-SE) för Command Bar
  db.ts                    Prisma-singleton
  types.ts                 Customer, Quote, QuoteLineItem, CompanyProfile,
                            ROT/moms-konstanter
  seeded.ts                Deterministisk pseudo-slump (kalkylatorernas
                            priser är simulerade tills materialbanken finns)
prisma/schema.prisma       Company, Customer, Quote, QuoteLineItem,
                            MaterialBankItem, MaterialPriceHistory
```

### Samma matematik, nya kläder

De åtta AI-kalkylatorerna (`lib/cart-engine/{wall,floor,paint,roof,
exterior-wall,insulation,parking,materials}-catalog.ts`) är oförändrade
sedan Karma-eran — samma tester, samma pure functions. Det enda som
ändrats är typen de returnerar: `MaterialItem` (`lib/quote-engine/
material.ts`) istället för det gamla `CatalogItem` — identisk form, bara
utan butiksdomän. `/calculator` anropar dem direkt och lägger på
offert-specifik logik ovanpå: materialpåslag, timpris × arbetstid, moms,
ROT-avdrag.

### Medvetet inte byggt än

Offert-wizarden (kund → jobb → kalkyl → skicka), CRM:et, materialbanken
med kvittoavläsning och dynamisk prisindexering, AI Studio (uppföljnings-
SMS, marginalanalys) och företagsinställningar är alla "kommer snart" —
navigationen och datamodellen finns, men skrivvägarna (API-routes som
faktiskt sparar till Postgres) är nästa fas, inte den här.
