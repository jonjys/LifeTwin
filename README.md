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
6. **Kvittoavläsning** (`/materials`, "Skanna kvitto") — fota eller ladda
   upp ett kvitto/faktura, Claude (vision) läser av produktrader, varje
   rad matchas mot materialbanken och visas som en diff (nuvarande pris
   → avläst pris, ±%) med ett bekräftelseklick per rad — antingen
   "Uppdatera pris" (arkiverar automatiskt det gamla priset) eller
   "Lägg till" för ett nytt material. Ingen automatisk massuppdatering.
   Materialbankens priser läses i sin tur in i både `/calculator` och
   Offert-wizarden — matchar en rad, visas den med en "Din prisbank"-
   badge och det verkliga priset istället för det simulerade.
7. **Offert-PDF** (`/offers/[id]`, "Skriv ut / Spara som PDF") — en
   riktig offertblankett (företagsbrevhuvud, kund, prisrader, prisbild)
   via webbläsarens print-till-PDF, ingen extra PDF-motor.
8. **Inställningar** (`/settings`) — företagsprofil (org.nr, moms,
   bankgiro, standardtimpris/påslag), som Offert-wizarden hämtar sina
   startvärden från.
9. **AI Studio** (`/ai-studio`) — marginalanalys (vinstprocent,
   snittpåslag, snittvärde, pipeline — riktiga Postgres-aggregeringar)
   och en uppföljnings-SMS-generator: Claude skriver ett kort,
   professionellt textutkast för varje offert som väntar på svar, med
   en kopiera-knapp och en "Skicka SMS"-knapp som skickar det riktigt
   via Twilio till kundens telefonnummer.

## Tech

- Next.js 15 (App Router) + TypeScript, Tailwind, Framer Motion
- Postgres via Prisma (`prisma/schema.prisma`) — kräver `DATABASE_URL`
  (Supabase, Neon eller Vercel Postgres) i miljövariablerna; utan den
  degraderar Dashboarden ärligt till nollställda KPI:er + en synlig
  banner istället för att krascha
- Claude (`@anthropic-ai/sdk`, `claude-opus-5`) för Command Bar-
  konversationen, kvittoavläsningen och SMS-utkasten — kräver
  `ANTHROPIC_API_KEY`, samma ärliga fallback-mönster
- Twilio (`twilio`) för att faktiskt skicka uppföljnings-SMS — kräver
  `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Vitest (`npm test`) för de rena, deterministiska kalkylatorfunktionerna

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000. Lägg till `DATABASE_URL` och kör
`npm run db:push` (eller `npm run db:migrate` för en riktig migrationshistorik)
för att slå på Dashboardens riktiga data. Lägg till `ANTHROPIC_API_KEY`
för att slå på AI Command Bar, kvittoavläsning och SMS-utkast. Lägg
till `TWILIO_ACCOUNT_SID`/`TWILIO_AUTH_TOKEN`/`TWILIO_FROM_NUMBER`
(ett eget Twilio-konto) för att faktiskt kunna skicka de SMS:en.

## Arkitektur

```
app/
  page.tsx                 Dashboard — KPI:er (Prisma) + AI Command Bar
  calculator/page.tsx      AI-Kalkylatorn — 8 projekttyper, en sida
  offers/page.tsx          Offertlista — status, totalsumma
  offers/new/page.tsx      Offert-wizarden — kund → jobb → kalkyl → spara
  offers/[id]/page.tsx     Offertdetalj — prisbild, statusändring, PDF-utskrift
  customers/page.tsx       Kundregister — CRUD
  materials/page.tsx       Materialbank — CRUD, prishistorik, kvittoavläsning
  settings/page.tsx        Företagsprofil
  ai-studio/page.tsx       Marginalanalys + uppföljnings-SMS
  api/ai/chat/route.ts     Claude-integrationen bakom Command Bar
  api/ai/scan-receipt/     Claude vision — läser av kvitto/faktura-bilder
  api/ai/followup-sms/     Claude — uppföljnings-SMS-utkast
  api/sms/send/            Twilio — skickar uppföljnings-SMS:et på riktigt
  api/ai-studio/margin-summary/  Prisma-aggregering — vinstprocent, marginal
  api/{customers,quotes,materials,company}/  REST-routes mot Prisma
components/
  nav/app-shell.tsx        Sidebar (desktop) + bottom nav (mobil)
  dashboard/command-bar.tsx  AI Command Bar — text + röst
  offers/offer-print-view.tsx  Offertblanketten som visas vid utskrift
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
  quote-engine/materialbank-pricing.ts  Ersätter en kalkylatorrads
                             simulerade unitPriceSEK med materialbankens
                             egna pris, matchat mot namnet
  use-speech-input.ts      Web Speech API-wrapper (sv-SE) för Command Bar
                             och Offert-wizarden
  db.ts                    Prisma-singleton + getOrCreateDefaultCompany()
  types.ts                 Customer, Quote, QuoteLineItem, CompanyProfile,
                            ROT/moms-konstanter
  seeded.ts                Deterministisk pseudo-slump (kalkylatorernas
                            priser är simulerade tills materialbanken
                            faktiskt kopplas in i kalkylen — se nedan)
prisma/schema.prisma       Company, Customer, Quote, QuoteLineItem,
                            MaterialBankItem, MaterialPriceHistory
```

### Samma matematik, nya kläder

De åtta AI-kalkylatorerna (`lib/cart-engine/{wall,floor,paint,roof,
exterior-wall,insulation,parking,materials}-catalog.ts`) är oförändrade
sedan Karma-eran — samma tester, samma pure functions, samma
`basePriceSEK`-värden. Det enda som ändrats är typen de returnerar:
`MaterialItem` (`lib/quote-engine/material.ts`) istället för det gamla
`CatalogItem` — identisk form, bara utan butiksdomän, plus två nya fält:
`qty` och `unitPriceSEK`, uppdelade så att `Math.round(qty ×
unitPriceSEK) === basePriceSEK` alltid håller — även för rader som
`regel-innervagg` där priset egentligen är `antal × vägghöjd × pris`
(här blir `qty = antal × höjd` och `unitPriceSEK` det rena grundpriset,
så uppdelningen aldrig tappar höjdberoendet). Detta är precis vad som
gör det säkert att låta materialbankens pris ersätta `unitPriceSEK` och
räkna om `basePriceSEK` från kalkylatorns egen `qty` — aldrig gissat.
`lib/quote-engine/qty-invariant.test.ts` bevisar det håller för alla 8
kalkylatorer, alla tiers, alla tillval, flera måttkombinationer — inte
bara standardvärdena. Both `/calculator` och Offert-wizarden anropar
samma `lib/quote-engine/estimate.ts`-funktioner och lägger på
offert-specifik logik ovanpå: materialpåslag, timpris × arbetstid, moms,
ROT-avdrag.

### Byggt hittills (Fas 1, 2 + delar av 3)

Dashboard, Command Bar, AI-Kalkylator (nu med riktiga materialbank-
priser där en match finns), Offert-wizard, kundregister, materialbank
(CRUD + versionerad prishistorik + kvittoavläsning), offert-PDF,
företagsinställningar och AI Studio (marginalanalys + uppföljnings-SMS,
inklusive riktig utskickning via Twilio) är alla riktiga skrivvägar mot
Postgres/Claude/Twilio — inga stubbar kvar i huvudnavigeringen, och
inget kodmässigt ofärdigt kvar av det ursprungliga uppdraget. Det som
återstår kräver antingen ett tredjepartskonto bara företaget själv kan
skaffa (`DATABASE_URL`, `ANTHROPIC_API_KEY`, Twilio-kontot bakom
`TWILIO_*`) eller är en medveten avgränsning, inte en lucka.

### Medvetet inte byggt än

- **E-post-utskick** — SMS skickas nu på riktigt (Twilio), men
  e-postutskick av offerter/uppföljning är inte byggt (samma
  tredjepartskonto-begränsning skulle gälla där också, t.ex. Resend
  eller SendGrid).
- **Kvittobilder sparas inte** — varje skanning är en engångskörning;
  ingen historik över själva bilderna, bara de pris-uppdateringar
  användaren väljer att bekräfta.
- **Materialbank-matchningen är namnbaserad, inte garanterad** — precis
  som kvittoavläsningens matchning görs den mot materialbankens fria
  textnamn (substräng, båda riktningar), så en materialbankspost med ett
  ovanligt namn kanske inte hittas automatiskt. Det är en medveten
  avvägning (samma som kvittomatchningen), inte ett bevisat korrekthets-
  hål — se `lib/quote-engine/materialbank-pricing.ts`.
