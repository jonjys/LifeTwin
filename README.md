# SmartCart AI

**Vi jämför inte priser. Vi fattar köpbeslut.**

Ingen bryr sig om fler priser — alla bryr sig om att slippa tänka. Du skriver
vad du behöver. SmartCart bygger listan, väger butiker mot varandra, byter
till billigare varor och märken, hittar kampanjer — och fattar sedan ett
beslut åt dig: hämta själv, hemleverans, eller promenera, räknat i riktiga
kronor och riktig tid. Inte tolv alternativ. Ett smartast val, och varför.

## Upplevelsen

1. **Landing** — en rubrik, en knapp: "Jag ska storhandla".
2. **Min Profil** (`/profile`) — hemadress, transport (bil/elbil/cykel/går/…),
   bränsle- och slitagekostnad, tidsvärde (kr/h eller "låt AI uppskatta"),
   handlings- och matpreferenser, favoritbutiker, leveranspreferenser. Driver
   Beslutsmotorn — sätts en gång, förfinas när som helst.
3. **Bygg lista** (`/build`) — lägg till varor en i taget (chips, snabbval,
   "Dina vanliga varor").
4. **Matkasse** (`/cart`) — produkten:
   - **Din matkasse** — varje vara SmartCart bytte, med förklaring
     (märkesbyte, storleksbyte, kampanj eller billigare butik) och exakt
     hur många kronor du sparade.
   - **AI Beslutsmotor** — inte tre priser, tre fullt kostade beslut: Hämta
     själv (bensin + slitage + tid), Hemleverans (leveransavgift), Promenera
     (steg + kalorier). AI väljer vinnaren mot ditt eget tidsvärde och säger
     varför i klartext.
   - **AI Shopping Route** — när "hämta själv" spänner över flera butiker:
     ordnad rutt, avstånd, och en tydlig rekommendation att hoppa över ett
     stopp när besparingen inte är värd omvägen.
   - **Pengar sparade** — denna månad / i år / sedan installation, plus
     sparad tid, undvikna bilresor, kalorier promenerade och CO₂ sparad.
   - **Automatiska inköp** — återkommande varor (AI Memory), optimerade i
     förväg med en notis och en knapp: "Köp".
   - **Matsmart fynd** — riktade rean-erbjudanden på varor du redan brukar
     köpa, aldrig hela katalogen.
   - **Bevakning** — en liten feed av "riktiga pengar"-notiser.
   - **AI Pantry** och **AI Meal Planner** — tydligt märkta "Kommer snart".

## Tech

- Next.js 15 (App Router) + TypeScript
- TailwindCSS med shadcn-liknande UI-primitiver
- Framer Motion, Lucide Icons
- Allt state i `localStorage` — ingen backend, ingen inloggning, ingen databas
- Deploy-klar för Vercel

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000.

## Arkitektur

```
app/                       Routes: landing, /profile, /build, /cart
components/
  cart/                    Matkasse-UI (swap-kort, beslutsmotor, rutt, sparande, Matsmart, bevakning)
  profile/                 Delade formulärkomponenter (chip-grupper, fält)
  shared/                  Återanvändbara visuella delar (animated number, confetti, ambient bg)
  ui/                      shadcn-liknande primitiver (button, card)
hooks/use-smart-cart.ts     Allt state: bygg matkasse, beslutsmotor, rutt, checkout, sparande
lib/
  cart-engine/             Motorn: butiker, katalog, prisoptimering, checkout, Matsmart, notiser
  decision-engine/         Hämta själv / hemleverans / promenera + AI Shopping Route
  seeded.ts                Deterministisk pseudo-slump (samma indata + dag = samma resultat)
  storage.ts               localStorage-persistens: profil, AI Memory, sparande + impact-historik
  types.ts                 Delade domäntyper (CartResult, DecisionResult, UserProfile, …)
```

### Viktigt att veta

Det finns ingen riktig prisdata-API, ingen geokodning och ingen ruttplanering —
`lib/cart-engine` och `lib/decision-engine` genererar troliga, deterministiska
priser, avstånd och restider per butik och dag, seedade av användarens profil
så att samma indata alltid ger samma resultat. Tre exakta scenarier (ketchup →
ICA Basic, 2 mjölk → 1 stor, avokadokampanj) är hårdkodade för att alltid visa
produktens "wow"-exempel exakt; övriga varor och beslut optimeras generiskt.
"Köp"-knappen simulerar en order (uppdaterar sparande- och impact-dashboarden)
— den skickar ingen riktig beställning till någon butik.

### Medvetet inte byggt än

Framtida kategorier (Bygg altan, Måla huset, Trädgård, Husdjur, Elektronik)
är arkitektoniskt förberedda men inte implementerade — de är explicit
framtidsvision, inte MVP. Samma gäller riktiga push-notiser (ingen
backend/service worker) och AI Pantry/Meal Planner (teasers, inte funktion).

### Koppla på riktig data

`lib/cart-engine/index.ts` (`buildCart`) och `lib/decision-engine/index.ts`
(`computeFulfillmentOptions`, `buildShoppingRoute`) är de enda ingångarna —
byt ut deras interna anrop mot riktiga pris-, karta- och trafik-API:er och
resten av appen är opåverkad, eftersom UI:t bara renderar deras typade output.
