# SmartCart AI

**Handla smartare, automatiskt.**

SmartCart AI är inte en prisjämförelsesida. Du skriver vad du behöver — SmartCart
jämför butiker, byter till billigare varor och märken, hittar kampanjer, och
bygger om din matkasse innan du ens ser den. Målet: du ska aldrig behöva öppna
ICA-appen igen.

## Upplevelsen

1. **Landing** — en rubrik, en knapp: "Jag ska storhandla".
2. **Bygg lista** (`/build`) — lägg till varor en i taget (chips, snabbval,
   och "Dina vanliga varor" från AI Memory).
3. **Matkasse** (`/cart`) — produkten:
   - **Din matkasse** — varje vara SmartCart bytte, med förklaring
     (märkesbyte, storleksbyte, kampanj eller billigare butik) och exakt
     hur många kronor du sparade.
   - **Smart Checkout** — tre alternativ (Billigast / Snabbast hem / Minst
     antal butiker), det billigaste markeras automatiskt.
   - **Pengar sparade** — denna månad / i år / sedan appen installerades.
   - **AI Memory** — varor som återkommer i dina listor, tillagda utan att
     fråga igen.
   - **Bevakning** — en liten feed av "riktiga pengar"-notiser (prisfall,
     vänta-tips, kampanjstart).
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
app/                    Routes: landing, /build, /cart
components/
  cart/                 Matkasse-UI (swap-kort, checkout, sparande, AI memory, bevakning)
  shared/               Återanvändbara visuella delar (animated number, confetti, ambient bg)
  ui/                   shadcn-liknande primitiver (button, card)
hooks/use-smart-cart.ts  Allt state: bygg matkasse, checkout, sparande
lib/
  cart-engine/          Motorn: butiker, katalog, prisoptimering, checkout, notiser
  seeded.ts             Deterministisk pseudo-slump (samma lista + dag = samma resultat)
  storage.ts            localStorage-persistens + AI Memory-räkning
  types.ts              Delade domäntyper (CartResult, OptimizedItem, Store, …)
```

### Viktigt att veta

Det finns ingen riktig prisdata-API — `lib/cart-engine` genererar troliga,
deterministiska priser per butik och dag. Tre exakta scenarier (ketchup →
ICA Basic, 2 mjölk → 1 stor, avokadokampanj) är hårdkodade för att alltid
visa produktens "wow"-exempel exakt; övriga varor optimeras generiskt.
"Beställ"-knappen simulerar en order (uppdaterar sparande-dashboarden) —
den skickar ingen riktig beställning till någon butik.

### Koppla på riktig prisdata

`lib/cart-engine/index.ts` (`buildCart`) är den enda ingången till motorn —
byt ut `optimize.ts`/`checkout.ts` mot anrop till en riktig pris-API och
resten av appen är opåverkad, eftersom UI:t bara renderar `CartResult`.
