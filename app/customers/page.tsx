"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { TextField } from "@/components/profile/fields";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import type { Customer } from "@/lib/types";

type FormState = {
  name: string;
  address: string;
  phone: string;
  email: string;
  ssn: string;
  propertyId: string;
};

const EMPTY_FORM: FormState = { name: "", address: "", phone: "", email: "", ssn: "", propertyId: "" };

function toForm(c: Customer): FormState {
  return { name: c.name, address: c.address, phone: c.phone, email: c.email, ssn: c.ssn, propertyId: c.propertyId };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) {
        setConnected(false);
        setCustomers([]);
        return;
      }
      const data = await res.json();
      setConnected(true);
      setCustomers(data.customers ?? []);
    } catch {
      setConnected(false);
      setCustomers([]);
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

  function startEdit(c: Customer) {
    setForm(toForm(c));
    setFormError(null);
    setEditingId(c.id);
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
    setSaving(true);
    setFormError(null);
    try {
      const isNew = editingId === "new";
      const res = await fetch(isNew ? "/api/customers" : `/api/customers/${editingId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    if (!confirm("Ta bort kunden? Det går inte att ångra.")) return;
    try {
      await fetch(`/api/customers/${id}`, { method: "DELETE" });
      await load();
    } catch {
      // load() re-fetches below regardless; a stale row is the worst case.
    }
  }

  return (
    <main className="relative min-h-screen px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
      <AmbientBackground />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight sm:text-xl">Kunder</p>
            <p className="text-sm text-ink-muted">Kundregistret bakom varje offert.</p>
          </div>
          {connected && editingId === null && (
            <Button size="default" onClick={startCreate}>
              <Plus className="size-4" />
              Ny kund
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
                <code className="rounded bg-white/5 px-1 py-0.5">npm run db:push</code> för att kunna spara kunder.
              </p>
            </div>
          </Card>
        )}

        {editingId !== null && (
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <CardTitle>{editingId === "new" ? "Ny kund" : "Redigera kund"}</CardTitle>
              <button onClick={cancelEdit} className="text-ink-muted hover:text-ink" aria-label="Avbryt">
                <X className="size-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Namn *" />
              <TextField value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="Telefon" />
              <TextField value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="E-post" />
              <TextField value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} placeholder="Adress" />
              <TextField
                value={form.propertyId}
                onChange={(v) => setForm((f) => ({ ...f, propertyId: v }))}
                placeholder="Fastighetsbeteckning (ROT)"
              />
              <TextField
                value={form.ssn}
                onChange={(v) => setForm((f) => ({ ...f, ssn: v }))}
                placeholder="Personnummer (ROT)"
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

        {!loading && connected && customers.length === 0 && editingId === null && (
          <Card className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-ink-secondary">
              <Users className="size-6" />
            </div>
            <CardTitle>Inga kunder än</CardTitle>
            <p className="text-sm text-ink-muted">Lägg till din första kund för att kunna skapa en offert.</p>
            <Button onClick={startCreate}>
              <Plus className="size-4" />
              Ny kund
            </Button>
          </Card>
        )}

        {customers.length > 0 && (
          <div className="flex flex-col gap-2">
            {customers.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{c.name}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {[c.address, c.phone, c.email].filter(Boolean).join(" · ") || "Ingen kontaktinfo"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(c)}
                    className="flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-white/5 hover:text-ink"
                    aria-label="Redigera"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => remove(c.id)}
                    className="flex size-9 items-center justify-center rounded-xl text-ink-muted hover:bg-danger/10 hover:text-danger"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
