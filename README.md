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

1. **Start** (`/`) — inte en landningssida, ett beslutsverktyg: en
   hälsning, ett stort fält ("Vad behöver du idag?"), exempel-chips
   (Veckohandling, Tacomiddag, Hundmat, Bygg altan, Ny TV, Semester,
   Apotek) och en knapp: "Planera åt mig". Skriv fritt eller tryck ett
   exempel — `lib/home-intent.ts` tolkar det till en matkasse, en
   veckoplan, ett altanprojekt, ett husdjursinköp, en ny TV eller ett
   apoteksinköp (allt annat är ärligt "inte byggt ännu", inte gissat). En kort, animerad scanning-sekvens (samma motor,
   bara pausad för effekt) mynnar ut i **ett** AI-rekommendationskort —
   rekommenderade butiker, totalpris, en kompakt rad (spara/tid/butiker/
   metod), tre konkreta skäl — med "Visa fullständig plan" till `/cart`
   eller "Visa alternativ" inline. Allt får plats på en mobilskärm utan
   scroll, i varje steg.
2. **Projekt** (`/projects`) — Flik 1 för den som vill välja mer
   medvetet istället för att skriva fritt: Storhandla, Bygga altan,
   Husdjur, Elektronik och Apotek är byggda; Renovera badrum, Flytta, Jul,
   Bröllop, Semester, Bilservice och IKEA är "Kommer snart" — samma
   ärliga mönster som AI Pantry.
3. **Min Profil** (`/profile`) — hemadress, skriven manuellt eller hämtad
   på riktigt via "Använd min plats" (webbläsarens Geolocation-API +
   omvänd geokodning mot Nominatim — godkänn en gång, adressen fylls i
   automatiskt), med en live kartförhandsvisning som geokodar adressen på
   riktigt. Transport (bil/elbil/cykel/går/…),
   bränsle- och slitagekostnad, tidsvärde (kr/h eller "låt AI uppskatta"),
   handlings- och matpreferenser, favoritbutiker, leveranspreferenser.
   Driver Beslutsmotorn för varje projekt — sätts en gång, förfinas när
   som helst.
4. **AI Plan** — Flik 2, projektspecifik:
   - **Storhandla** (`/build`) — lägg till varor en i taget (röst eller
     text — en mikrofonknapp använder webbläsarens Web Speech API, sv-SE,
     och visas bara där webbläsaren stödjer det), chips, snabbval, "Dina
     vanliga varor", eller bläddra i sju kategorier (Kylvaror, Frys,
     Skafferi, Frukt & Grönt, Kött & Fisk, Bröd & Bageri, Dryck & Snacks)
     via en egen animerad kategoriväljare.
   - **AI Veckoplanering** (`/build/week`) — AI scannar hela
     matkatalogen mot alla åtta butiker för dagens kampanjer och bygger en
     hel veckas matkasse (minst en vara per kategori, resten de hårdaste
     rabatterna) i ett klick.
   - **AI Meal Planner** (`/build/meals`) — välj vilka måltider du vill
     äta i veckan (Tacos, Pasta Bolognese, Kycklinggryta, …); samma
     motor som expanderar "tacos" till konkreta varor på `/build`
     expanderar alla valda måltider på en gång till en aggregerad,
     redan optimerad inköpslista.
   - **Bygga altan** (`/projects/deck`) — ange bredd och djup; AI räknar
     ut Trall, Reglar, Plintar, Skruv, Betong och Verktyg i rätt mängd,
     scannar sedan synligt (Byggmax, Hornbach, Bauhaus, Beijer, XL-BYGG,
     en efter en) och visar redan här vilken butik som är billigast per
     vara idag — samma automatiska cross-store-scan som Veckoplanering,
     bara för byggvaror.
   - **Husdjur** (`/projects/pet`) — svara Ja/Nej på hund och katt; AI
     väljer rätt foder/kattsand/godis och scannar synligt över Arken Zoo,
     Granngården, Vetzoo och Zooplus — samma cross-store-scan igen, bara
     för djurartiklar.
   - **Elektronik** (`/projects/electronics`) — välj skärmstorlek (43-75
     tum) och om du vill ha soundbar/väggfäste; AI scannar Elgiganten,
     Media Markt, NetOnNet och Webhallen — samma cross-store-scan, bara
     för elektronik.
   - **Apotek** (`/projects/pharmacy`) — kryssa i vilka vardagsbasics du
     behöver (smärtstillande, vitaminer, plåster, …); AI scannar Apoteket,
     Apotek Hjärtat, Kronans Apotek och Apotea — samma cross-store-scan,
     bara för apoteksvaror.
5. **Inköp & beslut** (`/cart`) — Flik 3 + 4, samma sida för varje projekt:
   - **Ditt inköp** — en kompakt inköpslista grupperad per butik, en rad
     per vara (namn, ev. bytesförklaring, pris, sparat) — inte ett kort
     per vara, så hela kassen läses på en skärm istället för en lång
     scroll.
   - **Smartaste beslutet** — inte billigast, smartast, i en mening: "Köp
     Trall på XL-BYGG. Reglar på Byggmax. Betongen från Bauhaus. Hämta
     själv. Du sparar totalt: 3686 kr." Genererad ur samma cart- och
     beslutsdata varje annat kort på sidan redan visar.
   - **AI Beslutsmotor** — inte tre priser, tre (eller två, för skrymmande
     byggvaror, foder och TV-köp) fullt kostade beslut: Hämta själv
     (bensin + slitage + tid + hyrsläp om profilen saknar eget släp och
     lasten är skrymmande), Hemleverans (leveransavgift), Promenera (steg
     + kalorier, bara för matkassen och apoteksvaror — små nog att bära
     hem — och väger tyngre i regn, kyla eller stark värme, enligt riktig
     live-väderdata vid din adress). AI väljer vinnaren mot ditt eget
     tidsvärde och säger varför i klartext.
   - **Live karta** — en riktig, interaktiv karta (OpenStreetMap) centrerad
     på ditt geokodade hem. Varje butik placeras i första hand på sin
     riktiga, namngivna adress (sökt live via OpenStreetMap/Overpass) —
     hittas ingen bekräftad butik nära dig faller den tillbaka till en
     uppskattad plats, tydligt markerad med en streckad ring. En rutt
     (riktiga vägar via OSRM, med en rak linje som reserv) byter färg och
     mönster direkt när du växlar mellan Hämta själv / Hemleverans /
     Promenera — ingen ny hämtning, bara en omedelbar omstil.
   - **AI Shopping Route** — när "hämta själv" spänner över flera butiker:
     en kompakt numrerad lista (samma radformat som inköpslistan), avstånd,
     och en tydlig rekommendation att hoppa över ett stopp när besparingen
     inte är värd omvägen.
   - **Pengar sparade** — denna månad / i år / sedan installation, plus
     sparad tid, undvikna bilresor, kalorier promenerade och CO₂ sparad.
   - **Verkliga ICA-erbjudanden** — inte simulerat: en live hämtad lista
     från ica.se:s publika "veckans erbjudanden"-sida, tydligt märkt som
     äkta till skillnad från resten av appens kampanjmärkningar.
   - Grocery-specifikt (döljs för andra projekt): **Automatiska inköp**
     (AI Memory-baserad återköp), **Matsmart fynd**, **Bevakning**-feeden,
     samt **AI Pantry** ("Kommer snart").
6. **Mina inköp** (`/orders`) — hela orderhistoriken, senaste först, en
   rad per köp med projektikon (Storhandla/Bygga altan/Husdjur/Elektronik/
   Apotek), datum, hämtningssätt, totalpris och besparing. Nås från
   `/profile`, inte från huvudflödet på startsidan.

## Tech

- Next.js 15 (App Router) + TypeScript
- TailwindCSS med shadcn-liknande UI-primitiver
- Framer Motion, Lucide Icons
- Allt state i `localStorage` — ingen backend, ingen inloggning, ingen databas
- Installerbar PWA: manifest, genererade ikoner (`next/og`, inga binära
  assets att underhålla), offline app-shell via en enkel service worker
- Deploy-klar för Vercel
- Vitest (`npm test`) för motorns rena, deterministiska funktioner —
  `lib/cart-engine`, `lib/decision-engine`, `lib/home-intent` — inklusive
  regressionstester för den typ av bugg som redan hittats en gång
  (substrings i `matchCatalogItem` som får fel vara att matcha)

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
  projects/                Flik 1: projekthubb + /projects/deck, /projects/pet, /projects/electronics, /projects/pharmacy (Flik 2 för respektive projekt)
  build/                   Flik 2 för storhandla: bygg listan
  cart/                    Flik 3 + 4: inköp + Smartaste beslutet, för alla projekt
  profile/                 Personlig profil — driver Beslutsmotorn
  orders/                  Mina inköp: hela orderhistoriken
  error.tsx, not-found.tsx Märkta fel- och 404-sidor
components/
  cart/                    Inköps-UI (swap-kort, smartaste beslutet, beslutsmotor, live karta, rutt, sparande, Matsmart, bevakning)
  map/live-map.tsx         Leaflet-kartan (dark tiles, markörer, rutter) — dynamiskt laddad, klient-only
  profile/                 Delade formulärkomponenter (chip-grupper, fält, adress-kartförhandsvisning)
  shared/                  Återanvändbara visuella delar (animated number, confetti, ambient bg)
  ui/                      shadcn-liknande primitiver (button, card)
hooks/use-smart-cart.ts    Allt state: bygg cart (rätt katalog per projekt), beslutsmotor, rutt, checkout, sparande
lib/
  cart-engine/             Motorn: butiker (25, taggade grocery/building/pet/electronics/pharmacy), katalog(er), prisoptimering, checkout, Matsmart, notiser
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

- **Katalogen** — `lib/cart-engine/catalog.ts` (grocery),
  `lib/cart-engine/materials-catalog.ts` (`generateDeckMaterialsCatalog`,
  som räknar Trall/Reglar/Plintar/Skruv/Betong/Verktyg utifrån altanens
  mått), `lib/cart-engine/pet-catalog.ts` (`generatePetCatalog`,
  hund-/kattartiklar utifrån vilka djur profilen har),
  `lib/cart-engine/electronics-catalog.ts` (`generateElectronicsCatalog`,
  en fast superset av alla TV-storlekar + tillbehör — vilka som faktiskt
  hamnar i kassen avgörs helt av intagssidans val, inte av katalogen) eller
  `lib/cart-engine/apotek-catalog.ts` (`generateApotekCatalog`, en fast
  lista vardagsbasics). Varje `CatalogItem` har en
  `domain: "grocery" | "building" | "pet" | "electronics" | "pharmacy"`.
- **Butikerna** som jämförs — `lib/cart-engine/stores.ts` har alla 25
  butiker taggade med samma `domain`; `optimizeItem`/`buildCheckoutOptions`
  filtrerar alltid på katalogens domän, så en byggvara aldrig jämförs mot
  ICA och en matvara aldrig mot Byggmax eller Arken Zoo.
- **Om "Promenera" är rimligt** — `computeFulfillmentOptions` läser
  `cart.domain` och utesluter promenad-alternativet för skrymmande
  byggvaror, tunga foderpåsar och TV-köp; matkassen och apoteksköp
  (litet nog att bära hem) får fortfarande alla tre.
- **"Stora Köp"** — samma funktion lägger på en hyrsläp-kostnad (349 kr +
  25 minuter) på Hämta själv när projektet är skrymmande (`domain ===
  "building"`) och profilens `hasTrailer` är `false`; äger man släp
  försvinner kostnaden helt. Ett nytt profilfält (`Har du släp?`), synligt
  bara för bil/elbil under Transport.

Ett nytt projekt (t.ex. semester) kräver bara en ny
katalog-genererande funktion och nya butiker taggade med rätt `domain` —
inte en ny motor, precis som Husdjur, Elektronik och Apotek bevisade om
och om igen. `lib/cart-engine/deal-scanner.ts` (`scanCatalogForDeals`)
är samma sak för prisscanning: Veckoplanering (grocery), Bygga altan
(building), Husdjur (pet), Elektronik och Apotek delar exakt samma
scan-funktion, bara katalogen skiljer.

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
ritar riktiga vägar, och `lib/geo/places.ts` söker upp en riktig, namngiven
butik nära dig via Overpass API (samma öppna OpenStreetMap-data, gratis,
ingen nyckel) för varje kedja som faktiskt har fysiska butiker (ICA,
Willys, Coop, Hemköp, Lidl, City Gross, Byggmax, Hornbach, Bauhaus, Beijer,
XL-BYGG, Arken Zoo, Granngården, Elgiganten, Media Markt, Apoteket, Apotek
Hjärtat, Kronans Apotek — Mathem, Matsmart, Vetzoo, Zooplus, NetOnNet,
Webhallen och Apotea är renodlade nätbutiker utan fysiska butiker att
hitta och använder alltid det uppskattade läget). Hittas ingen bekräftad
butik faller platsen tillbaka
till samma seedade avstånd och riktning som Beslutsmotorns kostnadsberäkning
redan använder — en riktig karta med en ärlig, tydligt markerad uppskattning
när det verkliga inte finns, aldrig en tyst gissning som ser exakt ut.
Alla tre tjänster (Nominatim, OSRM, Overpass) är delade publika API:er utan
nyckel (rimlig användning, ingen SLA, och Overpass kan vara märkbart
långsammare eller tillfälligt överbelastat) — varje anrop har en tidsgräns
och faller tillbaka till Stockholm/en rak linje/en uppskattad butiksplats
om tjänsten är långsam eller nere, så kartan aldrig fastnar i "laddar".

Väder (`lib/geo/weather.ts`) är av samma sort: riktig, live data från
Open-Meteo (gratis, ingen nyckel) vid din geokodade adress. Regn, sträng
kyla eller stark värme gör "Promenera" mätbart mindre attraktivt i
Beslutsmotorns egen kostnadsräkning (inte bara en kommentar i texten) —
motorn är fortfarande en ren, synkron funktion; vädret hämtas asynkront i
hooken och skickas sedan in som vanlig data, precis som profilen.

Priserna i övrigt är fortfarande simulerade, med ett uttryckligt undantag:
`app/api/ica-offers/route.ts` hämtar live, på riktigt, ICA:s egen publika
"veckans erbjudanden"-sida (samma sida vem som helst ser på ica.se) — inte
en privat butiks-API, inte inloggade Stammis-priser, inte hela
produktkatalogen. Servern cachar svaret i 24 timmar (Next.js `revalidate`
+ ett dagligt Vercel Cron-jobb som håller cachen varm, se `vercel.json` —
Vercels gratis Hobby-plan tillåter bara schemalagda jobb en gång per dag),
så riktiga besökare aldrig utlöser en ny hämtning själva. De andra sju
butikernas erbjudandesidor är byggda som JavaScript-appar där priserna
laddas via anrop efter sidladdningen — ett enkelt, respektfullt sidhämtande
skript ser dem inte, och att gå vidare (deras interna API, eller en
huvudlös webbläsare som kringgår det) är en annan och juridiskt osäkrare
avvägning som medvetet inte gjorts här. Verkliga ICA-priser blandas heller
inte in i motorns egna, simulerade priser/kampanjer — de visas i ett eget,
tydligt märkt kort, så det aldrig är oklart vad som är äkta.

"Köp"-knappen simulerar en order (uppdaterar sparande- och impact-dashboarden)
— den skickar ingen riktig beställning till någon butik.

### Medvetet inte byggt än

Renovera badrum, Flytta, Jul, Bröllop, Semester, Bilservice och IKEA
är "Kommer snart"-kort på
`/projects` — arkitektoniskt förberedda (lägg till en katalog + butiker
taggade med rätt domän) men inte implementerade; explicit
framtidsvision, inte MVP. Samma gäller riktiga push-notiser (ingen
backend/service worker) och AI Pantry ("fotografera kylskåpet" kräver
riktig bild-AI, som medvetet inte är kopplad på — se nästa avsnitt för var
gränsen dras). AI Meal Planner är däremot byggd på riktigt, se ovan.

### Koppla på riktig data

`lib/cart-engine/index.ts` (`buildCart`) och `lib/decision-engine/index.ts`
(`computeFulfillmentOptions`, `buildShoppingRoute`) är de enda ingångarna —
byt ut deras interna anrop mot riktiga pris-, karta- och trafik-API:er och
resten av appen är opåverkad, eftersom UI:t bara renderar deras typade output.
