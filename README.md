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
4. **Offert-wizarden** (`/offers/new`) — kund (välj eller snabblägg till)
   → jobbeskrivning (text eller röst) → samma kalkylatormotor som
   `/calculator` föreslår material och arbetstid → justera timpris/
   påslag/ROT → spara. `/offers` listar sparade offerter med status
   (Utkast/Skickad/Vunnen/Avslagen); `/offers/[id]` visar hela
   prisbilden och statusändring.
5. **Kunder** (`/customers`) och **Materialbank** (`/materials`) — riktiga
   CRUD-sidor mot Postgres: kundregister, och företagets egna
   materialpriser versionerade över tid (varje prisändring arkiverar
   det gamla priset i `MaterialPriceHistory`).
6. **Inställningar** (`/settings`) — företagsprofil (org.nr, moms,
   bankgiro, standardtimpris/påslag), som Offert-wizarden hämtar sina
   startvärden från.
7. **AI Studio** — fortfarande ärligt "kommer snart": uppföljnings-SMS
   och marginalanalys är inte byggda än.

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
  offers/page.tsx          Offertlista — status, totalsumma
  offers/new/page.tsx      Offert-wizarden — kund → jobb → kalkyl → spara
  offers/[id]/page.tsx     Offertdetalj — prisbild + statusändring
  customers/page.tsx       Kundregister — CRUD
  materials/page.tsx       Materialbank — CRUD + prishistorik
  settings/page.tsx        Företagsprofil
  ai-studio/               "Kommer snart" — inte byggd än
  api/ai/chat/route.ts     Claude-integrationen bakom Command Bar
  api/{customers,quotes,materials,company}/  REST-routes mot Prisma
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
  quote-engine/estimate.ts  Delad dispatch (estimateProject) + prisbild-
                             formel (computeQuoteTotals) — används av både
                             /calculator och Offert-wizarden
  use-speech-input.ts      Web Speech API-wrapper (sv-SE) för Command Bar
                             och Offert-wizarden
  db.ts                    Prisma-singleton + getOrCreateDefaultCompany()
  types.ts                 Customer, Quote, QuoteLineItem, CompanyProfile,
                            ROT/moms-konstanter
  seeded.ts                Deterministisk pseudo-slump (kalkylatorernas
                            priser är simulerade tills materialbanken
                            faktiskt kopplas in i kalkylen)
prisma/schema.prisma       Company, Customer, Quote, QuoteLineItem,
                            MaterialBankItem, MaterialPriceHistory
```

### Samma matematik, nya kläder

De åtta AI-kalkylatorerna (`lib/cart-engine/{wall,floor,paint,roof,
exterior-wall,insulation,parking,materials}-catalog.ts`) är oförändrade
sedan Karma-eran — samma tester, samma pure functions. Det enda som
ändrats är typen de returnerar: `MaterialItem` (`lib/quote-engine/
material.ts`) istället för det gamla `CatalogItem` — identisk form, bara
utan butiksdomän. Both `/calculator` och Offert-wizarden anropar samma
`lib/quote-engine/estimate.ts`-funktioner och lägger på offert-specifik
logik ovanpå: materialpåslag, timpris × arbetstid, moms, ROT-avdrag.

### Byggt hittills (Fas 1 + 2)

Dashboard, Command Bar, AI-Kalkylator, Offert-wizard (kund → jobb →
kalkyl → spara), kundregister, materialbank (CRUD + versionerad
prishistorik) och företagsinställningar är alla riktiga skrivvägar mot
Postgres via Prisma — inga stubbar.

### Medvetet inte byggt än

- **AI Studio** — uppföljnings-SMS, marginalanalys.
- **Kvittoavläsning / OCR** — materialbankens prishistorik finns och
  versioneras redan vid manuell prisändring, men att automatiskt läsa
  av ett kvitto och föreslå en prisuppdatering ("priset har ökat 8%
  hos Bauhaus") är inte byggt.
- **PDF/SMS-utskick av offerter** — offerter sparas och visas, men
  skickas inte ut som PDF eller SMS än.
- **Kalkylatorns priser** är fortfarande simulerade (`lib/seeded.ts`)
  — de läser inte från materialbanken än, trots att båda nu finns.
