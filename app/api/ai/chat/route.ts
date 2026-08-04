import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; text: string };

type RespondInput = {
  type: "question" | "ready" | "decline";
  message: string;
  quickReplies?: string[];
  /** Only when type=ready: a short, concrete summary of the job — what to
   *  build/renovate, for whom, and any measurements mentioned — ready to
   *  hand off to the AI-kalkylator. */
  projectSummary?: string;
};

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description:
    "Respond to the tradesperson in this conversation. Call this exactly once per turn — never reply with plain text.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["question", "ready", "decline"],
        description:
          '"question" if you need more information before a project summary can be built. ' +
          '"ready" once you have enough detail (what job, roughly what measurements) to hand off to the kalkylator. ' +
          '"decline" if the request is genuinely outside what a construction-quote assistant can help with.',
      },
      message: {
        type: "string",
        description:
          "The short Swedish message to show the user right now: a follow-up question, a one-line confirmation you're building the project, or a decline explanation.",
      },
      quickReplies: {
        type: "array",
        items: { type: "string" },
        description: "0-4 short Swedish quick-reply suggestions for a question. Omit for ready/decline.",
      },
      projectSummary: {
        type: "string",
        description:
          'Only when type=ready: a concrete Swedish summary of the job, e.g. "Måla villa 180 kvm åt Johan på ' +
          'Storgatan 45, inkl. ställning, 20% påslag." Specific, not vague.',
      },
    },
    required: ["type", "message"],
  },
};

const BYGG_PROJECT_TYPES = ["Altan", "Innervägg", "Yttervägg", "Golv", "Tak", "Målning", "Isolering", "Parkering"];

const SYSTEM_PROMPT = `Du är OffertPro AI, en projektassistent i appen OffertPro för hantverkare. Din enda uppgift i den här konversationen är att prata med hantverkaren, ställa högst 2-3 korta uppföljningsfrågor för att förstå exakt vilket jobb det gäller, och sedan lämna över en konkret projektsammanfattning.

OffertPro har idag kalkylatorer för dessa projekttyper (som referens, men hantverkaren kan beskriva vad som helst):
${BYGG_PROJECT_TYPES.join(", ")}

Regler:
- Ställ EN fråga i taget, kort och konkret, med korta svarsalternativ när det passar (quickReplies).
- Så fort du har tillräckligt för att bygga en offert: svara med type="ready" och en projectSummary med jobb, ungefärliga mått, och ev. kund/adress om nämnt.
- Hitta ALDRIG på priser, materialåtgång eller arbetstid själv — det räknar appens kalkylator ut efteråt. Ditt jobb är bara konversationen och sammanfattningen.
- Om frågan handlar om något OffertPro uppenbarligen inte kan hjälpa till med: svara med type="decline" och en kort, ärlig förklaring.
- Svara alltid på svenska, kort och naturligt.
- Anropa alltid verktyget "respond" — svara aldrig med vanlig text.`;

function extractRespond(message: Anthropic.Message): RespondInput | null {
  for (const block of message.content) {
    if (block.type === "tool_use" && block.name === "respond") {
      return block.input as RespondInput;
    }
  }
  return null;
}

function fallbackText(message: Anthropic.Message): string | null {
  for (const block of message.content) {
    if (block.type === "text" && block.text.trim()) return block.text.trim();
  }
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        type: "error",
        message:
          "AI-assistenten är inte aktiverad än — appen saknar en ANTHROPIC_API_KEY. Lägg till den i projektets miljövariabler för att slå på OffertPro AI.",
      },
      { status: 503 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ type: "error", message: "Ogiltig förfrågan." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json({ type: "error", message: "Inget meddelande att svara på." }, { status: 400 });
  }
  if (messages.length > 40) {
    return NextResponse.json({ type: "error", message: "Konversationen är för lång." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      tools: [RESPOND_TOOL],
      messages: messages.map((m: ChatMessage) => ({
        role: m.role,
        content: m.text.slice(0, 4000),
      })),
    });

    const parsed = extractRespond(response);
    if (parsed) {
      return NextResponse.json(parsed);
    }

    const text = fallbackText(response);
    return NextResponse.json({
      type: "question",
      message: text ?? "Kan du berätta lite mer om jobbet?",
    });
  } catch (err) {
    console.error("AI chat error", err);
    return NextResponse.json(
      { type: "error", message: "Något gick fel med AI-assistenten. Försök igen om en stund." },
      { status: 502 },
    );
  }
}
