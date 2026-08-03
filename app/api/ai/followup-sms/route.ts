import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type DraftSmsInput = { text: string };

const DRAFT_SMS_TOOL: Anthropic.Tool = {
  name: "draft_sms",
  description: "Submit the drafted follow-up SMS text. Call this exactly once.",
  input_schema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description:
          "The complete SMS text in Swedish, ready to send as-is. Under 300 characters, friendly but professional, " +
          "no placeholders like [namn] — use the real details given.",
      },
    },
    required: ["text"],
  },
};

const SYSTEM_PROMPT = `Du är Karma Pro AI och skriver ett kort uppföljnings-SMS åt en hantverkare till en kund som fått en offert men inte svarat än.

Regler:
- Vänligt, professionellt, kort — max 2-3 meningar, under 300 tecken.
- Nämn offertnumret och jobbet konkret.
- Fråga naturligt om kunden haft en chans att titta på offerten, utan att pressa.
- Ingen hälsningsfras med [NAMN]-placeholders — använd de riktiga namnen som ges.
- Svara alltid på svenska.
- Anropa alltid verktyget "draft_sms" — svara aldrig med vanlig text.`;

function extractDraft(message: Anthropic.Message): DraftSmsInput | null {
  for (const block of message.content) {
    if (block.type === "tool_use" && block.name === "draft_sms") {
      return block.input as DraftSmsInput;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI-assistenten är inte aktiverad än — appen saknar en ANTHROPIC_API_KEY." },
      { status: 503 },
    );
  }

  let body: { quoteId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  if (!body.quoteId) {
    return NextResponse.json({ error: "quoteId krävs." }, { status: 400 });
  }

  let quote;
  try {
    quote = await prisma.quote.findUnique({ where: { id: body.quoteId }, include: { customer: true } });
  } catch (err) {
    console.error("GET quote for followup-sms error", err);
    return NextResponse.json({ error: "Databasen är inte ansluten." }, { status: 503 });
  }
  if (!quote) return NextResponse.json({ error: "Offerten hittades inte." }, { status: 404 });

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 512,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools: [DRAFT_SMS_TOOL],
      messages: [
        {
          role: "user",
          content: `Kund: ${quote.customer.name}\nOffertnummer: ${quote.number}\nJobb: ${quote.jobTitle}\nStatus: skickad, inget svar än.`,
        },
      ],
    });

    const draft = extractDraft(response);
    if (!draft) {
      return NextResponse.json({ error: "Kunde inte generera ett SMS-förslag just nu." }, { status: 502 });
    }
    return NextResponse.json({ text: draft.text });
  } catch (err) {
    console.error("POST /api/ai/followup-sms error", err);
    return NextResponse.json({ error: "Något gick fel med AI-assistenten. Försök igen om en stund." }, { status: 502 });
  }
}
