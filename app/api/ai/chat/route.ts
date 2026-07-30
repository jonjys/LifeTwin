import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/categories";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; text: string };

type RespondInput = {
  type: "question" | "ready" | "decline";
  message: string;
  quickReplies?: string[];
  itemsQuery?: string;
};

const RESPOND_TOOL: Anthropic.Tool = {
  name: "respond",
  description:
    "Respond to the user in this shopping conversation. Call this exactly once per turn — never reply with plain text.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["question", "ready", "decline"],
        description:
          '"question" if you need more information before a shopping list can be built. ' +
          '"ready" once you have enough concrete detail to generate one. ' +
          '"decline" if the request is genuinely outside what a shopping/purchase assistant can help with.',
      },
      message: {
        type: "string",
        description:
          "The short Swedish message to show the user right now: a follow-up question, a one-line confirmation that you're building their list, or a decline explanation.",
      },
      quickReplies: {
        type: "array",
        items: { type: "string" },
        description: "0-4 short Swedish quick-reply suggestions for a question. Omit for ready/decline.",
      },
      itemsQuery: {
        type: "string",
        description:
          "Only when type=ready: a comma-separated list of concrete, purchasable Swedish product names resolved " +
          'from the whole conversation (e.g. "tacokrydda, tortillabröd, nötfärs 500g, riven ost, guacamole"). ' +
          "Be specific, not vague — this string is looked up directly against a store catalog.",
      },
    },
    required: ["type", "message"],
  },
};

function categoryPrimer(): string {
  return CATEGORIES.map((c) => `${c.label}: ${c.subcategories.map((s) => s.label).join(", ")}`).join("\n");
}

const SYSTEM_PROMPT = `Du är Karma AI, en köpbeslutsassistent i appen Karma. Din enda uppgift i den här konversationen är att prata med användaren, ställa högst 2-3 korta uppföljningsfrågor för att förstå exakt vad de behöver köpa, och sedan lämna över en konkret, kommaseparerad lista med köpbara produkter.

Karma har idag dessa kategorier och underkategorier (som referens för vad slags köp det kan handla om, men användaren kan fråga om vad som helst som går att handla):
${categoryPrimer()}

Regler:
- Ställ EN fråga i taget, kort och konkret, med korta svarsalternativ när det passar (quickReplies).
- Så fort du har tillräckligt för att bygga en konkret produktlista: svara med type="ready" och en itemsQuery med specifika produktnamn (inte vaga kategorier som "mat" utan t.ex. "nötfärs 500g, tacoskal, riven ost").
- Hitta ALDRIG på priser, butiksnamn, leveranstider eller jämförelser själv — det beräknar appens motor automatiskt efter att du lämnat över listan. Ditt jobb är bara konversationen och den slutgiltiga produktlistan.
- Om frågan handlar om något Karma uppenbarligen inte kan hjälpa till med att köpa (t.ex. boka flyg, sälja något, juridisk rådgivning): svara med type="decline" och en kort, ärlig förklaring.
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
          "AI-chatten är inte aktiverad än — appen saknar en ANTHROPIC_API_KEY. Lägg till den i projektets miljövariabler för att slå på Karma AI.",
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
      messages: messages.map((m) => ({
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
      message: text ?? "Kan du berätta lite mer om vad du behöver köpa?",
    });
  } catch (err) {
    console.error("AI chat error", err);
    return NextResponse.json(
      { type: "error", message: "Något gick fel med AI-chatten. Försök igen om en stund." },
      { status: 502 },
    );
  }
}
