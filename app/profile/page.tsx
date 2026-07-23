"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { AmbientBackground } from "@/components/shared/ambient-background";
import { AddressMapPreview } from "@/components/profile/address-map-preview";
import {
  FieldLabel,
  MultiChipGroup,
  NumberField,
  SingleChipGroup,
  TextField,
  YesNoToggle,
} from "@/components/profile/fields";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { STORE_LIST } from "@/lib/cart-engine";
import { fadeUp } from "@/lib/motion";
import { ensureState, saveProfile } from "@/lib/storage";
import {
  DEFAULT_PROFILE,
  DELIVERY_PREFERENCES,
  FOOD_PREFERENCES,
  SHOPPING_PREFERENCES,
  TRANSPORT_MODES,
  type StoreId,
  type UserProfile,
} from "@/lib/types";

const TRANSPORT_LABELS: Record<(typeof TRANSPORT_MODES)[number], string> = {
  car: "Bil",
  ev: "Elbil",
  motorcycle: "Motorcykel",
  moped: "Moped",
  bike: "Cykel",
  "cargo-bike": "Lastcykel",
  walk: "Går",
  "public-transit": "Buss/Tåg",
};

const FUEL_LABELS = {
  petrol: "Bensin",
  diesel: "Diesel",
  electric: "El",
} as const;

const SHOPPING_PREFERENCE_LABELS: Record<(typeof SHOPPING_PREFERENCES)[number], string> = {
  pickup: "Jag hämtar gärna själv",
  delivery: "Jag vill helst få hemleverans",
  cheapest: "Jag vill alltid ha billigast",
  fastest: "Jag vill ha snabbast",
  "fewest-stops": "Jag vill ha minst antal stopp",
  "avoid-queues": "Jag vill undvika köer",
  evenings: "Jag handlar helst kvällar",
  weekends: "Jag handlar helst helger",
};

const DELIVERY_PREFERENCE_LABELS: Record<(typeof DELIVERY_PREFERENCES)[number], string> = {
  "home-delivery": "Hemleverans",
  "click-collect": "Click & Collect",
  "self-pickup": "Egen handling",
  mixed: "Blanda butiker",
};

const FOOD_PREFERENCE_LABELS: Record<(typeof FOOD_PREFERENCES)[number], string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  lchf: "LCHF",
  "gluten-free": "Glutenfri",
  "lactose-free": "Laktosfri",
  halal: "Halal",
  kosher: "Kosher",
  organic: "Ekologiskt",
  cheapest: "Billigast möjligt",
  premium: "Premium",
};

const VEHICLE_MODES = new Set(["car", "ev", "motorcycle", "moped"]);

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(ensureState().profile);
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
  };

  const isVehicle = VEHICLE_MODES.has(profile.transportMode);
  const favoriteIndex = (id: StoreId) => profile.favoriteStores.indexOf(id);
  const toggleFavorite = (id: StoreId) => {
    update(
      "favoriteStores",
      profile.favoriteStores.includes(id)
        ? profile.favoriteStores.filter((s) => s !== id)
        : [...profile.favoriteStores, id]
    );
  };

  return (
    <main className="relative min-h-screen px-5 pb-24 pt-8 sm:px-8">
      <AmbientBackground />

      <div className="mx-auto w-full max-w-3xl">
        <motion.header {...fadeUp(0)} className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Tillbaka
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Min Profil</h1>
          <div className="w-16" />
        </motion.header>

        <div className="flex flex-col gap-6">
          <motion.div {...fadeUp(0.05)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Hemadress</CardTitle>
              <TextField
                value={profile.homeAddress}
                onChange={(v) => update("homeAddress", v)}
                placeholder="t.ex. Storgatan 12, Stockholm"
              />
              <AddressMapPreview address={profile.homeAddress} />
              <p className="text-xs text-ink-muted">
                Visas på en riktig karta — SmartCart placerar butiker och rutter runt den här
                punkten när du bygger en matkasse.
              </p>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.09)}>
            <Card className="flex flex-col gap-5">
              <CardTitle>Transport</CardTitle>
              <div>
                <FieldLabel>Hur tar du dig till butiken?</FieldLabel>
                <SingleChipGroup
                  options={TRANSPORT_MODES.map((m) => ({ value: m, label: TRANSPORT_LABELS[m] }))}
                  value={profile.transportMode}
                  onChange={(v) => update("transportMode", v as UserProfile["transportMode"])}
                />
              </div>

              {isVehicle && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Bränsle</FieldLabel>
                    <SingleChipGroup
                      options={Object.entries(FUEL_LABELS).map(([value, label]) => ({
                        value,
                        label,
                      }))}
                      value={profile.fuelType}
                      onChange={(v) => update("fuelType", v as UserProfile["fuelType"])}
                    />
                  </div>
                  <div>
                    <FieldLabel>Förbrukning (per mil)</FieldLabel>
                    <NumberField
                      value={profile.fuelConsumptionPerMil}
                      onChange={(v) => update("fuelConsumptionPerMil", v)}
                      suffix={profile.fuelType === "electric" ? "kWh" : "liter"}
                    />
                  </div>
                  <div>
                    <FieldLabel>Kostnad per {profile.fuelType === "electric" ? "kWh" : "liter"}</FieldLabel>
                    <NumberField
                      value={profile.fuelPriceSEK}
                      onChange={(v) => update("fuelPriceSEK", v)}
                      suffix="kr"
                    />
                  </div>
                  <div>
                    <FieldLabel>Slitagekostnad per mil</FieldLabel>
                    <NumberField
                      value={profile.wearCostPerMilSEK}
                      onChange={(v) => update("wearCostPerMilSEK", v)}
                      suffix="kr"
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.13)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Tidsvärde</CardTitle>
              <FieldLabel>Hur mycket är en timme av din tid värd?</FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                {[150, 300, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update("hourlyValueSEK", v)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      profile.hourlyValueSEK === v
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20 hover:text-ink"
                    }`}
                  >
                    {v} kr/h
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => update("hourlyValueSEK", null)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    profile.hourlyValueSEK === null
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20 hover:text-ink"
                  }`}
                >
                  Vet inte — låt AI uppskatta
                </button>
              </div>
              {profile.hourlyValueSEK !== null && (
                <NumberField
                  value={profile.hourlyValueSEK}
                  onChange={(v) => update("hourlyValueSEK", v)}
                  suffix="kr/h"
                />
              )}
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.17)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Handlingspreferenser</CardTitle>
              <MultiChipGroup
                options={SHOPPING_PREFERENCES.map((p) => ({
                  value: p,
                  label: SHOPPING_PREFERENCE_LABELS[p],
                }))}
                values={profile.shoppingPreferences}
                onChange={(v) => update("shoppingPreferences", v as UserProfile["shoppingPreferences"])}
              />
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.21)}>
            <Card className="flex flex-col gap-5">
              <CardTitle>Familj &amp; husdjur</CardTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Har du barn?</FieldLabel>
                  <YesNoToggle value={profile.hasKids} onChange={(v) => update("hasKids", v)} />
                </div>
                {profile.hasKids && (
                  <div>
                    <FieldLabel>Antal barn</FieldLabel>
                    <NumberField
                      value={profile.kidsCount}
                      onChange={(v) => update("kidsCount", v)}
                    />
                  </div>
                )}
                <div>
                  <FieldLabel>Har du hund?</FieldLabel>
                  <YesNoToggle value={profile.hasDog} onChange={(v) => update("hasDog", v)} />
                </div>
                <div>
                  <FieldLabel>Har du katt?</FieldLabel>
                  <YesNoToggle value={profile.hasCat} onChange={(v) => update("hasCat", v)} />
                </div>
                <div>
                  <FieldLabel>Andra djur?</FieldLabel>
                  <YesNoToggle
                    value={profile.hasOtherPets}
                    onChange={(v) => update("hasOtherPets", v)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.25)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Matpreferenser</CardTitle>
              <MultiChipGroup
                options={FOOD_PREFERENCES.map((p) => ({ value: p, label: FOOD_PREFERENCE_LABELS[p] }))}
                values={profile.foodPreferences}
                onChange={(v) => update("foodPreferences", v as UserProfile["foodPreferences"])}
              />
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.29)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Favoritbutiker</CardTitle>
              <p className="text-xs text-ink-muted">
                Klicka i den ordning du föredrar dem — SmartCart väger in det när flera butiker är nästan lika bra.
              </p>
              <div className="flex flex-wrap gap-2">
                {STORE_LIST.map((store) => {
                  const idx = favoriteIndex(store.id);
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => toggleFavorite(store.id)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        idx >= 0
                          ? "border-primary/50 bg-primary/10 text-primary"
                          : "border-border bg-surface-2/50 text-ink-secondary hover:border-white/20 hover:text-ink"
                      }`}
                    >
                      {idx >= 0 && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {idx + 1}
                        </span>
                      )}
                      {store.name}
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.33)}>
            <Card className="flex flex-col gap-4">
              <CardTitle>Leveranspreferenser</CardTitle>
              <SingleChipGroup
                options={DELIVERY_PREFERENCES.map((p) => ({
                  value: p,
                  label: DELIVERY_PREFERENCE_LABELS[p],
                }))}
                value={profile.deliveryPreference}
                onChange={(v) => update("deliveryPreference", v as UserProfile["deliveryPreference"])}
              />
            </Card>
          </motion.div>

          <motion.div {...fadeUp(0.37)} className="flex justify-end">
            <Button size="lg" onClick={handleSave}>
              {saved ? <Check /> : null}
              {saved ? "Sparat" : "Spara profil"}
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
