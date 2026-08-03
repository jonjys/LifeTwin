"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Package, Pencil, Plus, Trash2, X } from "lucide-react";
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
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Nytt material
            </Button>
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
