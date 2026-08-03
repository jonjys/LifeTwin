import Twilio from "twilio";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** E.164-ish check — Twilio requires "+countrycode..." on both ends. */
function isE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

export async function POST(req: Request) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return NextResponse.json(
      {
        error:
          "SMS-utskick är inte aktiverat än — appen saknar TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN och/eller " +
          "TWILIO_FROM_NUMBER. Lägg till dem i projektets miljövariabler (kräver ett eget Twilio-konto).",
      },
      { status: 503 },
    );
  }

  let body: { to?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ogiltig förfrågan." }, { status: 400 });
  }

  const to = body.to?.trim();
  const message = body.message?.trim();
  if (!to || !isE164(to)) {
    return NextResponse.json(
      { error: "Kundens telefonnummer saknas eller har fel format (behöver landskod, t.ex. +46701234567)." },
      { status: 400 },
    );
  }
  if (!message) {
    return NextResponse.json({ error: "Inget meddelande att skicka." }, { status: 400 });
  }
  if (message.length > 1600) {
    return NextResponse.json({ error: "Meddelandet är för långt." }, { status: 400 });
  }

  try {
    const client = Twilio(accountSid, authToken);
    const sent = await client.messages.create({ to, from: fromNumber, body: message });
    return NextResponse.json({ ok: true, sid: sent.sid });
  } catch (err) {
    console.error("POST /api/sms/send error", err);
    return NextResponse.json({ error: "SMS:et kunde inte skickas. Kontrollera numret och försök igen." }, { status: 502 });
  }
}
