// app/api/ai/extract-quote/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { mapRawExtractionToDraft, type RawQuoteExtraction } from "@/lib/ai-parse";
import { PROJECT_TYPES } from "@/lib/quote-engine/estimate";

export const runtime = "nodejs";

const PROJECT_TYPE_VALUES = PROJECT_TYPES.map((p) => p.value);

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "extract_quote",
  description:
    "Extract structured Offert-wizard fields from a confirmed Swedish project summary. Call this exactly once.",
  input_schema: {
    type: "object",
    properties: {
      customerName: { type: ["string", "null"], description: "Kundens namn om det nämns i texten, annars null." },
      customerAddress: { type: ["string", "null"], description: "Kundens adress om den nämns i texten, annars null." },
      jobTitle: {
        type: ["string", "null"],
        description: "En kort svensk projektrubrik, t.ex. \"Måla villa 180 kvm\". Behåll den om texten redan är en bra rubrik.",
      },
      projectType: {
        type: "string",
        enum: PROJECT_TYPE_VALUES,
        description: "Vilken av OffertPros kalkylatortyper jobbet bäst matchar.",
      },
      widthM: {
        type: ["number", "null"],
        description: "Bredd i meter — endast för altan/innervägg/yttervägg/golv, och endast om måttet uttryckligen nämns.",
      },
      heightM: {
        type: ["number", "null"],
        description: "Höjd i meter (eller längd i meter om projectType är golv) — endast om måttet uttryckligen nämns.",
      },
      areaM2: {
        type: ["number", "null"],
        description: "Yta i kvadratmeter — endast för tak/målning/isolering/parkering, och endast om ytan uttryckligen nämns.",
      },
      tier: {
        type: ["string", "null"],
        enum: ["budget", "premium", null],
        description: "\"premium\" om lyx/premiummaterial nämns, \"budget\" om budget uttryckligen nämns, annars null.",
      },
      workHours: {
        type: ["number", "null"],
        description:
          "Antal arbetstimmar — ENDAST om ett konkret timantal uttryckligen nämns i texten, t.ex. \"45 timmar\" → 45. Annars null; normalfallet är att timmarna räknas fram från måtten istället.",
      },
      hourlyRateSEK: {
        type: ["number", "null"],
        description: "Timpris i kronor — ENDAST om ett konkret timpris uttryckligen nämns i texten.",
      },
      markupPct: {
        type: ["number", "null"],
        description: "Materialpåslag i procent — ENDAST om ett konkret påslag uttryckligen nämns, t.ex. \"20% påslag\" → 20.",
      },
      includeRot: {
        type: ["boolean", "null"],
        description: "true om ROT-avdrag uttryckligen ska inkluderas, false om det uttryckligen INTE ska det, annars null.",
      },
      isolera: { type: ["boolean", "null"], description: "Endast relevant för innervägg/yttervägg: ska väggen isoleras?" },
      malas: { type: ["boolean", "null"], description: "Endast relevant för innervägg/yttervägg: ska väggen målas?" },
      golvvarme: { type: ["boolean", "null"], description: "Endast relevant för golv: ska golvvärme ingå?" },
      troskel: { type: ["boolean", "null"], description: "Endast relevant för golv: ska trösklar ingå?" },
      rannor: { type: ["boolean", "null"], description: "Endast relevant för tak: ska hängrännor ingå?" },
      malaTaket: { type: ["boolean", "null"], description: "Endast relevant för målning: ska taket målas också?" },
      inkluderaVerktyg: { type: ["boolean", "null"], description: "Endast relevant för målning: ska verktyg ingå?" },
      angspar: { type: ["boolean", "null"], description: "Endast relevant för isolering: ska ångspärr ingå?" },
      kantsten: { type: ["boolean", "null"], description: "Endast relevant för parkering: ska kantsten ingå?" },
    },
    required: ["projectType"],
  },
};

const SYSTEM_PROMPT = `Du är en extraheringsmotor för OffertPro. Du får en kort, redan bekräftad svensk projektsammanfattning för ett hantverksjobb och ska extrahera strukturerade fält ur den — redo att fylla i offert-wizardens formulär automatiskt så att hantverkaren slipper skriva in dem manuellt.

Regler:
- Extrahera ENDAST det som uttryckligen nämns eller otvetydigt går att härleda ur texten (t.ex. "måla" → projectType "malning"). Sätt null för allt annat.
- Hitta ALDRIG på mått, timpris, påslag eller andra siffror som inte står i texten — det är appens kalkylator som räknar ut pris och arbetstid, inte du. Undantaget är workHours: om ett konkret timantal uttryckligen sägs (t.ex. "45 timmar") ska det extraheras rakt av — det är fortfarande inte en uppfinning, bara en transkribering av vad som redan sades.
- Ange bara de mått som passar vald projectType: bredd/höjd för altan/innervägg/yttervägg/golv, yta för tak/målning/isolering/parkering.
- Anropa alltid verktyget "extract_quote" — svara aldrig med vanlig text.`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI-assistenten är inte aktiverad än — appen saknar en ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let body: { transcript?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const transcript = body.transcript?.trim().slice(0, 2000);
  if (!transcript) {
    return NextResponse.json({ error: "Ingen projektbeskrivning att tolka." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: "extract_quote" },
      messages: [{ role: "user", content: transcript }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use" && block.name === "extract_quote");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json({ error: "Kunde inte tolka projektet." }, { status: 502 });
    }

    const raw = toolUse.input as RawQuoteExtraction;
    const draft = mapRawExtractionToDraft(raw, transcript);
    return NextResponse.json({ draft });
  } catch (err) {
    console.error("AI extract-quote error", err);
    return NextResponse.json({ error: "Något gick fel med AI-tolkningen. Försök igen om en stund." }, { status: 502 });
  }
}
