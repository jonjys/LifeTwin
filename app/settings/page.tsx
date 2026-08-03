"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Save, Settings } from "lucide-react";
import { FieldLabel, NumberField, TextField } from "@/components/profile/fields";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DEFAULT_COMPANY_PROFILE, type CompanyProfile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company");
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = await res.json();
        setConnected(true);
        setProfile(data.company);
      } catch {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setProfile((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save() {
    if (!profile.name.trim()) {
      setError("Företagsnamn krävs.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Något gick fel.");
        return;
      }
      setProfile(data.company);
      setSaved(true);
    } catch {
      setError("Något gick fel — kontrollera anslutningen.");
    } finally {
      setSaving(false);
    }
  }

  if (!connected && !loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
        <AmbientBackground />
        <Card className="flex max-w-md flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
            <Settings className="size-6" />
          </div>
          <CardTitle>Inställningar</CardTitle>
          <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/[0.05] p-4 text-left">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-xs text-ink-muted">
              Databasen är inte ansluten — lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code>{" "}
              och kör <code className="rounded bg-white/5 px-1 py-0.5">npm run db:push</code> för att kunna spara
              företagsprofilen.
            </p>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div>
          <p className="text-lg font-semibold tracking-tight sm:text-xl">Inställningar</p>
          <p className="text-sm text-ink-muted">Företagsprofilen som varje offert utgår ifrån.</p>
        </div>

        <Card className="flex flex-col gap-4">
          <CardTitle>Företag</CardTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Företagsnamn *</FieldLabel>
              <TextField value={profile.name} onChange={(v) => set("name", v)} placeholder="Ditt företags namn" />
            </div>
            <div>
              <FieldLabel>Org.nr</FieldLabel>
              <TextField value={profile.orgNumber} onChange={(v) => set("orgNumber", v)} placeholder="556677-8899" />
            </div>
            <div>
              <FieldLabel>Momsregistreringsnummer</FieldLabel>
              <TextField value={profile.vatNumber} onChange={(v) => set("vatNumber", v)} placeholder="SE556677889901" />
            </div>
            <div>
              <FieldLabel>Bankgiro</FieldLabel>
              <TextField value={profile.bankgiro} onChange={(v) => set("bankgiro", v)} placeholder="123-4567" />
            </div>
            <div>
              <FieldLabel>E-post</FieldLabel>
              <TextField value={profile.email} onChange={(v) => set("email", v)} placeholder="info@foretag.se" />
            </div>
            <div>
              <FieldLabel>Telefon</FieldLabel>
              <TextField value={profile.phone} onChange={(v) => set("phone", v)} placeholder="070-123 45 67" />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Adress</FieldLabel>
              <TextField value={profile.address} onChange={(v) => set("address", v)} placeholder="Gatan 1, 123 45 Stad" />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <CardTitle>Standardvärden för offerter</CardTitle>
          <p className="text-xs text-ink-muted">Förifyllda i varje ny offert — justerbara per offert vid behov.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Standardtimpris</FieldLabel>
              <NumberField
                value={profile.defaultHourlyRateSEK}
                onChange={(v) => set("defaultHourlyRateSEK", v)}
                suffix="kr/h"
              />
            </div>
            <div>
              <FieldLabel>Standard materialpåslag</FieldLabel>
              <NumberField value={profile.defaultMarkupPct} onChange={(v) => set("defaultMarkupPct", v)} suffix="%" />
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button size="xl" onClick={save} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Sparar…" : saved ? "Sparat!" : "Spara"}
        </Button>
      </div>
    </main>
  );
}
