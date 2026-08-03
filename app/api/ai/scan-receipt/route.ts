import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_MEDIA_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

function isAllowedMediaType(v: string): v is AllowedMediaType {
  return (ALLOWED_MEDIA_TYPES as readonly string[]).includes(v);
}

type ExtractedItem = { name: string; priceSEK: number };

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "extract_receipt_items",
  description: "Submit every material/product line item found on the receipt or invoice. Call this exactly once.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "One entry per line item on the receipt — skip subtotals, VAT lines, and payment info.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "The product name as printed, in Swedish if that's how it's written." },
            priceSEK: { type: "number", description: "The line's total price in SEK, as a plain number (no currency symbol)." },
          },
          required: ["name", "priceSEK"],
        },
      },
    },
    required: ["items"],
  },
};

const SYSTEM_PROMPT = `Du är Karma Pro AI och läser av ett svenskt byggvaru- eller materialkvitto/faktura från en bild. Extrahera varje produktrad (namn + pris i kr) — hoppa över rader för delsumma, moms, kortbetalning, kvittonummer osv.

Hitta ALDRIG på rader som inte syns på bilden. Om bilden inte är ett kvitto/faktura, eller om texten är för otydlig för att läsa, returnera en tom lista.

Anropa alltid verktyget "extract_receipt_items" — svara aldrig med vanlig text.`;

function extractItems(message: Anthropic.Message): ExtractedItem[] {
  for (const block of message.content) {
    if (block.type === "tool_use" && block.name === "extract_receipt_items") {
      const input = block.input as { items?: ExtractedItem[] };
      return Array.isArray(input.items) ? input.items : [];
    }
  }
  return [];
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI-assistenten är inte aktiverad än — appen saknar en ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let body: { imageBase64?: string; mediaType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (!body.imageBase64 || !body.mediaType) {
    return NextResponse.json({ error: "Ingen bild mottagen." }, { status: 400 });
  }
  if (!isAllowedMediaType(body.mediaType)) {
    return NextResponse.json({ error: "Bildformatet stöds inte — använd PNG, JPEG, WEBP eller GIF." }, { status: 400 });
  }
  // Base64 is ~1.37x the raw byte size; 12MB of base64 text is roughly an 8-9MB image.
  if (body.imageBase64.length > 12_000_000) {
    return NextResponse.json({ error: "Bilden är för stor — max ca 8 MB." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools: [EXTRACT_TOOL],
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: body.mediaType, data: body.imageBase64 } },
            { type: "text", text: "Läs av det här kvittot/fakturan och extrahera produktraderna." },
          ],
        },
      ],
    });

    const items = extractItems(response).filter(
      (i) => typeof i.name === "string" && i.name.trim() && typeof i.priceSEK === "number" && i.priceSEK >= 0,
    );
    return NextResponse.json({ items });
  } catch (err) {
    console.error("POST /api/ai/scan-receipt error", err);
    return NextResponse.json({ error: "Något gick fel med AI-avläsningen. Försök igen om en stund." }, { status: 502 });
  }
}
