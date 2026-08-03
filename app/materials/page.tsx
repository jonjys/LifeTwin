"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Check, Package, Pencil, Plus, ScanLine, Trash2, X } from "lucide-react";
import { TextField } from "@/components/profile/fields";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type MaterialHistoryEntry = { priceSEK: number; supplier: string; recordedAt: string };

type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  priceSEK: number;
  supplier: string;
  history: MaterialHistoryEntry[];
};

type FormState = { name: string; category: string; unit: string; priceSEK: string; supplier: string };

const EMPTY_FORM: FormState = { name: "", category: "", unit: "st", priceSEK: "", supplier: "" };

type ScannedItem = { name: string; priceSEK: number };

function readFileAsBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Kunde inte läsa filen."));
    reader.onload = () => {
      const result = reader.result as string;
      const [, base64] = result.split(",", 2);
      resolve({ data: base64 ?? "", mediaType: file.type });
    };
    reader.readAsDataURL(file);
  });
}

function toForm(m: Material): FormState {
  return { name: m.name, category: m.category, unit: m.unit, priceSEK: String(m.priceSEK), supplier: m.supplier };
}

function fmt(n: number): string {
  return `${Math.round(n).toLocaleString("sv-SE")} kr`;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[] | null>(null);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedIndexes, setAppliedIndexes] = useState<Set<number>>(new Set());

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/materials");
      if (!res.ok) {
        setConnected(false);
        return;
      }
      const data = await res.json();
      setConnected(true);
      setMaterials(data.materials ?? []);
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingId("new");
  }

  function startEdit(m: Material) {
    setForm(toForm(m));
    setFormError(null);
    setEditingId(m.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError(null);
  }

  async function save() {
    if (!form.name.trim()) {
      setFormError("Namn krävs.");
      return;
    }
    const priceSEK = Number(form.priceSEK);
    if (!Number.isFinite(priceSEK) || priceSEK < 0) {
      setFormError("Ange ett giltigt pris.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const isNew = editingId === "new";
      const res = await fetch(isNew ? "/api/materials" : `/api/materials/${editingId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, priceSEK }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error ?? "Något gick fel.");
        return;
      }
      setEditingId(null);
      await load();
    } catch {
      setFormError("Något gick fel — kontrollera anslutningen.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Ta bort materialet? Det går inte att ångra.")) return;
    try {
      await fetch(`/api/materials/${id}`, { method: "DELETE" });
      await load();
    } catch {
      // load() below re-fetches regardless; a stale row is the worst case.
    }
  }

  /** Best-effort match against the materialbank by substring, either
   *  direction — a scanned "Gipsskiva 12mm 3-pack" should find a bank
   *  item named "Gipsskiva" and vice versa. Not exact-match by design:
   *  receipt wording rarely matches the bank entry word-for-word. */
  function findMatch(scannedName: string): Material | undefined {
    const needle = scannedName.trim().toLowerCase();
    if (!needle) return undefined;
    return materials.find((m) => {
      const hay = m.name.trim().toLowerCase();
      return hay.length > 0 && (needle.includes(hay) || hay.includes(needle));
    });
  }

  async function scanReceipt(file: File) {
    setScanning(true);
    setScanError(null);
    setScannedItems(null);
    setAppliedIndexes(new Set());
    try {
      const { data, mediaType } = await readFileAsBase64(file);
      const res = await fetch("/api/ai/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: data, mediaType }),
      });
      const result = await res.json();
      if (!res.ok) {
        setScanError(result.error ?? "Något gick fel vid avläsningen.");
        return;
      }
      setScannedItems(result.items ?? []);
    } catch {
      setScanError("Något gick fel — kontrollera anslutningen.");
    } finally {
      setScanning(false);
    }
  }

  async function applyScannedItem(item: ScannedItem, index: number) {
    setApplyingIndex(index);
    try {
      const match = findMatch(item.name);
      if (match) {
        await fetch(`/api/materials/${match.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceSEK: item.priceSEK }),
        });
      } else {
        await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: item.name, category: "", unit: "st", priceSEK: item.priceSEK, supplier: "" }),
        });
      }
      setAppliedIndexes((prev) => new Set(prev).add(index));
      await load();
    } finally {
      setApplyingIndex(null);
    }
  }

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight sm:text-xl">Materialbank</p>
            <p className="text-sm text-ink-muted">Företagets egna priser, versionerade över tid.</p>
          </div>
          {connected && editingId === null && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={scanning}>
                <ScanLine className="size-4" />
                {scanning ? "Läser av…" : "Skanna kvitto"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) scanReceipt(file);
                  e.target.value = "";
                }}
              />
              <Button onClick={startCreate}>
                <Plus className="size-4" />
                Nytt material
              </Button>
            </div>
          )}
        </div>

        {!connected && !loading && (
          <Card className="flex items-start gap-3 border-warning/30 bg-warning/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium text-ink">Databasen är inte ansluten än</p>
              <p className="text-xs text-ink-muted">
                Lägg till <code className="rounded bg-white/5 px-1 py-0.5">DATABASE_URL</code> och kör{" "}
                <code className="rounded bg-white/5 px-1 py-0.5">npm run db:push</code> för att kunna spara material.
              </p>
            </div>
          </Card>
        )}

        {scanError && (
          <Card className="flex items-start gap-3 border-danger/30 bg-danger/[0.05]">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-sm text-ink-muted">{scanError}</p>
          </Card>
        )}

        {scannedItems !== null && (
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle>Avläst från kvitto</CardTitle>
              <button onClick={() => setScannedItems(null)} className="text-ink-muted hover:text-ink" aria-label="Stäng">
                <X className="size-4" />
              </button>
            </div>
            {scannedItems.length === 0 ? (
              <p className="text-sm text-ink-muted">Kunde inte hitta några produktrader på bilden.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {scannedItems.map((item, index) => {
                  const match = findMatch(item.name);
                  const deltaPct =
                    match && match.priceSEK > 0 ? Math.round(((item.priceSEK - match.priceSEK) / match.priceSEK) * 100) : 0;
                  const applied = appliedIndexes.has(index);
                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/40 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                        {match ? (
                          <p className="truncate text-xs text-ink-muted">
                            {match.name}: {fmt(match.priceSEK)} → kvitto {fmt(item.priceSEK)}
                            {deltaPct !== 0 && (
                              <span className={deltaPct > 0 ? "text-danger" : "text-success"}> ({deltaPct > 0 ? "+" : ""}{deltaPct}%)</span>
                            )}
                          </p>
                        ) : (
                          <p className="truncate text-xs text-ink-muted">Nytt material — {fmt(item.priceSEK)}</p>
                        )}
                      </div>
                      {applied ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-success">
                          <Check className="size-3.5" />
                          Klart
                        </span>
                      ) : (
                        <Button
                          size="default"
                          variant="outline"
                          disabled={applyingIndex === index}
                          onClick={() => applyScannedItem(item, index)}
                        >
                          {match ? "Uppdatera pris" : "Lägg till"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {editingId !== null && (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>{editingId === "new" ? "Nytt material" : "Redigera material"}</CardTitle>
              <button onClick={cancelEdit} className="text-ink-muted hover:text-ink" aria-label="Avbryt">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Namn *" />
              <TextField
                value={form.category}
                onChange={(v) => setForm((f) => ({ ...f, category: v }))}
                placeholder="Kategori (t.ex. Trä, Färg)"
              />
              <TextField value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} placeholder="Enhet (st, m², kg)" />
              <TextField
                value={form.priceSEK}
                onChange={(v) => setForm((f) => ({ ...f, priceSEK: v }))}
                placeholder="Pris (kr) *"
              />
              <TextField
                value={form.supplier}
                onChange={(v) => setForm((f) => ({ ...f, supplier: v }))}
                placeholder="Leverantör (t.ex. Bauhaus)"
              />
            </div>
            {formError && <p className="text-sm text-danger">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelEdit}>
                Avbryt
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Sparar…" : "Spara"}
              </Button>
            </div>
          </Card>
        )}

        {!loading && connected && materials.length === 0 && editingId === null && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
              <Package className="size-6" />
            </div>
            <CardTitle>Materialbanken är tom</CardTitle>
            <p className="text-sm text-ink-muted">Lägg till era vanligaste material och priser.</p>
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Nytt material
            </Button>
          </Card>
        )}

        {materials.length > 0 && (
          <div className="flex flex-col gap-2">
            {materials.map((m) => {
              const prev = m.history[0];
              const deltaPct = prev && prev.priceSEK > 0 ? Math.round(((m.priceSEK - prev.priceSEK) / prev.priceSEK) * 100) : 0;
              return (
                <Card key={m.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                      {m.category && (
                        <span className="rounded-full border border-border bg-surface-2/50 px-2 py-0.5 text-[11px] text-ink-muted">
                          {m.category}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-ink-muted">
                      {m.unit}
                      {m.supplier ? ` · ${m.supplier}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-ink">{fmt(m.priceSEK)}</p>
                      {deltaPct !== 0 && (
                        <p className={`flex items-center justify-end gap-0.5 text-[11px] ${deltaPct > 0 ? "text-danger" : "text-success"}`}>
                          {deltaPct > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                          {Math.abs(deltaPct)}%
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(m)}
                        className="flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-white/5 hover:text-ink"
                        aria-label="Redigera"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger"
                        aria-label="Ta bort"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
