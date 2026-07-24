# ProjektOS

**Vi jämför inte priser. Vi fattar köpbeslut.**

Allt börjar med ett projekt — storhandla, bygga altan, vad som helst
härnäst. Samma AI bryter ner det i vad det faktiskt kräver, väger butik
mot butik, bensin mot leverans, tid mot pengar — och fattar sedan ett
beslut åt dig. Inte tolv alternativ. Ett smartast val, och varför.

Det avgörande: det är inte olika appar per projekt. Det är samma
beslutsmotor — bara katalogen och butikerna den jämför mot byter ut sig
beroende på vilket projekt du startar.

## Upplevelsen

1. **Landing** — en rubrik, en knapp: "Starta ett projekt".
2. **Projekt** (`/projects`) — Flik 1: välj vad du ska göra. Storhandla
   och Bygga altan är byggda; Renovera badrum, Köpa ny TV, Flytta, Jul,
   Bröllop, Semester, Husdjur, Elektronik, Bilservice, Apotek och IKEA är
   "Kommer snart" — samma ärliga mönster som AI Pantry/Meal Planner.
3. **Min Profil** (`/profile`) — hemadress (med en live kartförhandsvisning
   som geokodar adressen på riktigt), transport (bil/elbil/cykel/går/…),
   bränsle- och slitagekostnad, tidsvärde (kr/h eller "låt AI uppskatta"),
   handlings- och matpreferenser, favoritbutiker, leveranspreferenser.
   Driver Beslutsmotorn för varje projekt — sätts en gång, förfinas när
   som helst.
4. **AI Plan** — Flik 2, projektspecifik:
   - **Storhandla** (`/build`) — lägg till varor en i taget (chips,
     snabbval, "Dina vanliga varor"), eller bläddra i sju kategorier
     (Kylvaror, Frys, Skafferi, Frukt & Grönt, Kött & Fisk, Bröd & Bageri,
     Dryck & Snacks) via en kategori-rullgardin.
   - **AI Veckoplanering** (`/build/week`) — AI scannar hela
     matkatalogen mot alla åtta butiker för dagens kampanjer och bygger en
     hel veckas matkasse (minst en vara per kategori, resten de hårdaste
     rabatterna) i ett klick.
   - **Bygga altan** (`/projects/deck`) — ange bredd och djup; AI räknar
     ut Trall, Reglar, Plintar, Skruv, Betong och Verktyg i rätt mängd.
5. **Inköp & beslut** (`/cart`) — Flik 3 + 4, samma sida för varje projekt:
   - **Ditt inköp** — varje vara ProjektOS bytte, med förklaring
     (märkesbyte, storleksbyte, kampanj eller billigare butik) och exakt
     hur många kronor du sparade.
   - **Smartaste beslutet** — inte billigast, smartast, i en mening: "Köp
     Trall på XL-BYGG. Reglar på Byggmax. Betongen från Bauhaus. Hämta
     själv. Du sparar totalt: 3686 kr." Genererad ur samma cart- och
     beslutsdata varje annat kort på sidan redan visar.
   - **AI Beslutsmotor** — inte tre priser, tre (eller två, för skrymmande
     byggvaror) fullt kostade beslut: Hämta själv (bensin + slitage + tid
     + hyrsläp om profilen saknar eget släp och lasten är skrymmande),
     Hemleverans (leveransavgift), Promenera (steg + kalorier, bara för
     matkassen). AI väljer vinnaren mot ditt eget tidsvärde och säger
     varför i klartext.
   - **Live karta** — en riktig, interaktiv karta (OpenStreetMap) centrerad
     på ditt geokodade hem, med varje butik i inköpet utsatt och en rutt
     (riktiga vägar via OSRM, med en rak linje som reserv) som byter färg
     och mönster direkt när du växlar mellan Hämta själv / Hemleverans /
     Promenera — ingen ny hämtning, bara en omedelbar omstil.
   - **AI Shopping Route** — när "hämta själv" spänner över flera butiker:
     ordnad rutt, avstånd, och en tydlig rekommendation att hoppa över ett
     stopp när besparingen inte är värd omvägen.
   - **Pengar sparade** — denna månad / i år / sedan installation, plus
     sparad tid, undvikna bilresor, kalorier promenerade och CO₂ sparad.
   - Grocery-specifikt (döljs för andra projekt): **Automatiska inköp**
     (AI Memory-baserad återköp), **Matsmart fynd**, **Bevakning**-feeden,
     samt **AI Pantry**/**AI Meal Planner** ("Kommer snart").

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
app/
  page.tsx                 Landing
  projects/                Flik 1: projekthubb + /projects/deck (Flik 2 för bygg)
  build/                   Flik 2 för storhandla: bygg listan
  cart/                    Flik 3 + 4: inköp + Smartaste beslutet, för alla projekt
  profile/                 Personlig profil — driver Beslutsmotorn
components/
  cart/                    Inköps-UI (swap-kort, smartaste beslutet, beslutsmotor, live karta, rutt, sparande, Matsmart, bevakning)
  map/live-map.tsx         Leaflet-kartan (dark tiles, markörer, rutter) — dynamiskt laddad, klient-only
  profile/                 Delade formulärkomponenter (chip-grupper, fält, adress-kartförhandsvisning)
  shared/                  Återanvändbara visuella delar (animated number, confetti, ambient bg)
  ui/                      shadcn-liknande primitiver (button, card)
hooks/use-smart-cart.ts    Allt state: bygg cart (rätt katalog per projekt), beslutsmotor, rutt, checkout, sparande
lib/
  cart-engine/             Motorn: butiker (13, taggade grocery/building), katalog(er), prisoptimering, checkout, Matsmart, notiser
  decision-engine/         Hämta själv / hemleverans / promenera + AI Shopping Route + Smartaste beslutet-narrativet
  geo/                     Geokodning (Nominatim), ruttning (OSRM), koordinat-offset — riktiga tjänster, tidsgränsade
  seeded.ts                Deterministisk pseudo-slump (samma indata + dag = samma resultat)
  storage.ts               localStorage-persistens: profil, projekt/kategori, AI Memory, sparande + impact-historik
  types.ts                 Delade domäntyper (CartResult, DecisionResult, UserProfile, ProjectCategory, …)
```

### Samma motor, olika projekt — hur det faktiskt fungerar i kod

`buildCart(rawItems, dateKey, usualItems, catalog?)` och
`computeFulfillmentOptions(cart, profile)` är oförändrade funktioner
oavsett projekt. Det som byter ut sig är enbart:

- **Katalogen** — `lib/cart-engine/catalog.ts` (grocery) eller
  `lib/cart-engine/materials-catalog.ts` (`generateDeckMaterialsCatalog`,
  som räknar Trall/Reglar/Plintar/Skruv/Betong/Verktyg utifrån altanens
  mått). Varje `CatalogItem` har en `domain: "grocery" | "building"`.
- **Butikerna** som jämförs — `lib/cart-engine/stores.ts` har alla 13
  butiker taggade med samma `domain`; `optimizeItem`/`buildCheckoutOptions`
  filtrerar alltid på katalogens domän, så en byggvara aldrig jämförs mot
  ICA och en matvara aldrig mot Byggmax.
- **Om "Promenera" är rimligt** — `computeFulfillmentOptions` läser
  `cart.domain` och utesluter promenad-alternativet för skrymmande
  byggvaror; matkassen får fortfarande alla tre.
- **"Stora Köp"** — samma funktion lägger på en hyrsläp-kostnad (349 kr +
  25 minuter) på Hämta själv när projektet är skrymmande (`domain ===
  "building"`) och profilens `hasTrailer` är `false`; äger man släp
  försvinner kostnaden helt. Ett nytt profilfält (`Har du släp?`), synligt
  bara för bil/elbil under Transport.

Ett nytt projekt (t.ex. husdjur eller elektronik) kräver bara en ny
katalog-genererande funktion och nya butiker taggade med rätt `domain` —
inte en ny motor.

### Viktigt att veta

Det finns ingen riktig prisdata-API och ingen ruttplanerings-backend av
vårt eget — `lib/cart-engine` och `lib/decision-engine` genererar
troliga, deterministiska priser, avstånd och restider per butik och dag,
seedade av användarens profil så att samma indata alltid ger samma
resultat. Tre exakta grocery-scenarier (ketchup → ICA Basic, 2 mjölk → 1
stor, avokadokampanj) är hårdkodade för att alltid visa produktens
"wow"-exempel exakt; övriga varor och beslut optimeras generiskt — inklusive
byggmaterialen, som prisas och swapas av precis samma logik.

Kartan (`lib/geo/`) är däremot riktig: Nominatim geokodar adressen, OSRM
ritar riktiga vägar, och butikerna placeras vid de seedade avstånden ovan
men i en riktig, deterministisk riktning runt din geokodade hempunkt — så
kartan visar en äkta plats, även om exakt vilken butik som ligger var inte
är verifierad mot riktiga butiksadresser. Alla tre är delade publika tjänster
utan API-nyckel (rimlig användning, ingen SLA) — varje anrop har en 6
sekunders tidsgräns och faller tillbaka till Stockholm/en rak linje om
tjänsten är långsam eller nere, så kartan aldrig fastnar i "laddar".

"Köp"-knappen simulerar en order (uppdaterar sparande- och impact-dashboarden)
— den skickar ingen riktig beställning till någon butik.

### Medvetet inte byggt än

Renovera badrum, Köpa ny TV, Flytta, Jul, Bröllop, Semester, Husdjur,
Elektronik, Bilservice, Apotek och IKEA är "Kommer snart"-kort på
`/projects` — arkitektoniskt förberedda (lägg till en katalog + butiker
taggade med rätt domän) men inte implementerade; explicit
framtidsvision, inte MVP. Samma gäller riktiga push-notiser (ingen
backend/service worker) och AI Pantry/Meal Planner (teasers, inte
funktion).

### Koppla på riktig data

`lib/cart-engine/index.ts` (`buildCart`) och `lib/decision-engine/index.ts`
(`computeFulfillmentOptions`, `buildShoppingRoute`) är de enda ingångarna —
byt ut deras interna anrop mot riktiga pris-, karta- och trafik-API:er och
resten av appen är opåverkad, eftersom UI:t bara renderar deras typade output.
