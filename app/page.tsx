// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';

type Tab = 'offert' | 'material' | 'jamfor' | 'foretag';

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  unit: string; // st, l, kvm, m, pack
  costPrice: number; // Inköpspris exkl moms
}

interface QuoteLineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number; // Å-pris ut till kund exkl moms
  vatPercent: number;
}

interface ComparisonPoint {
  id: string;
  feature: string;
  us: string;
  competitors: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('offert');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  // 1. FÖRETAGSUPPGIFTER (Låst till företaget)
  const [companyName, setCompanyName] = useState<string>('Tullinge Bygg AB');
  const [orgNo, setOrgNo] = useState<string>('556123-4567');
  const [vatNo, setVatNo] = useState<string>('SE556123456701');
  const [bankgiro, setBankgiro] = useState<string>('512-3456');
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [companyEmail, setCompanyEmail] = useState<string>('kontakt@tullingebygg.se');
  const [companyPhone, setCompanyPhone] = useState<string>('070-123 45 67');
  const [companyAddress, setCompanyAddress] = useState<string>('Företagsvägen 12, 147 30 Tullinge');

  // 2. KUND & PROJEKT
  const [customerName, setCustomerName] = useState<string>('Anna Andersson');
  const [customerAddress, setCustomerAddress] = useState<string>('Storgatan 45, Stockholm');
  const [customerPhone, setCustomerPhone] = useState<string>('070-987 65 43');
  const [jobTitle, setJobTitle] = useState<string>('Badrumsrenovering & Måleriarbete');
  const [quoteNumber, setQuoteNumber] = useState<string>('OFF-2026-001');

  // 3. MATERIALBANK & SKANNADE PRISER
  const [materialBank, setMaterialBank] = useState<MaterialItem[]>([
    { id: 'm1', name: 'Väggfärg Glans 7 (10L)', category: 'Måleri', unit: 'l', costPrice: 750 },
    { id: 'm2', name: 'Våtrumsspackel (10L)', category: 'Måleri', unit: 'st', costPrice: 420 },
    { id: 'm3', name: 'Gipsskiva 13mm (900x2400)', category: 'Bygg', unit: 'st', costPrice: 110 },
    { id: 'm4', name: 'Tätskikt Set (Badrum)', category: 'VVS/Kakel', unit: 'st', costPrice: 6500 },
    { id: 'm5', name: 'Falu Rödfärg Original (10L)', category: 'Fasad', unit: 'st', costPrice: 490 },
    { id: 'm6', name: 'Träskruv Torx 6,0x80 (300st)', category: 'Bygg', unit: 'st', costPrice: 280 },
  ]);

  // Formulär för nytt material
  const [newMatName, setNewMatName] = useState<string>('');
  const [newMatCategory, setNewMatCategory] = useState<string>('Måleri');
  const [newMatUnit, setNewMatUnit] = useState<string>('st');
  const [newMatPrice, setNewMatPrice] = useState<number>(0);

  // 4. OFFERTLINJER & MARGINALER
  const [materialMarkup, setMaterialMarkup] = useState<number>(15); // 5, 10, 15, 20, 25 %
  const [laborHours, setLaborHours] = useState<number>(40);
  const [includeRot, setIncludeRot] = useState<boolean>(true);
  const [riskMargin, setRiskMargin] = useState<number>(0);

  // Valda material i nuvarande offert
  const [selectedMaterials, setSelectedMaterials] = useState<QuoteLineItem[]>([
    { id: 'q1', description: 'Väggfärg Glans 7 (10L)', qty: 2, unit: 'l', unitPrice: 862.5, vatPercent: 25 },
    { id: 'q2', description: 'Våtrumsspackel (10L)', qty: 3, unit: 'st', unitPrice: 483, vatPercent: 25 },
  ]);

  // 5. JÄMFÖRELSEMATRIS
  const [comparisonPoints] = useState<ComparisonPoint[]>([
    { id: '1', feature: 'Fast pris & Inga dolda avgifter', us: '✅ Ja, allt ingår', competitors: '❌ Dolda milersättningar' },
    { id: '2', feature: 'Nöjd-Kund-Garanti & Besiktning', us: '✅ 5 Års Garanti', competitors: '⚠️ Ofta bara 1 år' },
    { id: '3', feature: 'Godkänd för F-skatt & ROT-avdrag', us: '✅ Direkt på fakturan', competitors: '✅ Ja' },
    { id: '4', feature: 'Städning & Bortforsling av avfall', us: '✅ Ingår alltid', competitors: '❌ Tillkommer ofta' },
    { id: '5', feature: 'Ansvarsförsäkring (Trygg-Hansa)', us: '✅ Upp till 10 Mkr', competitors: '⚠️ Varierande' },
  ]);

  // Laddar sparat från localStorage vid start
  useEffect(() => {
    const onboarded = localStorage.getItem('offertai_onboarded');
    const name = localStorage.getItem('offertai_company');
    const rate = localStorage.getItem('offertai_rate');
    const email = localStorage.getItem('offertai_email');
    const phone = localStorage.getItem('offertai_phone');
    const savedBank = localStorage.getItem('offertai_materialbank');

    if (onboarded === 'true') {
      setIsOnboarded(true);
      if (name) setCompanyName(name);
      if (rate) setHourlyRate(Number(rate));
      if (email) setCompanyEmail(email);
      if (phone) setCompanyPhone(phone);
    }

    if (savedBank) {
      try {
        setMaterialBank(JSON.parse(savedBank));
      } catch (e) {
        console.error('Kunde inte läsa materialbank', e);
      }
    }
  }, []);

  // Spara företagsprofil
  const saveCompanySettings = () => {
    if (!companyName.trim()) {
      alert('Vänligen ange företagsnamn.');
      return;
    }
    localStorage.setItem('offertai_onboarded', 'true');
    localStorage.setItem('offertai_company', companyName);
    localStorage.setItem('offertai_rate', hourlyRate.toString());
    localStorage.setItem('offertai_email', companyEmail);
    localStorage.setItem('offertai_phone', companyPhone);
    setIsOnboarded(true);
    alert('Företagsuppgifterna har sparats!');
  };

  // Lägg till i materialbank
  const handleAddMaterialToBank = () => {
    if (!newMatName.trim() || newMatPrice <= 0) {
      alert('Ange namn och giltigt inköpspris exkl moms.');
      return;
    }
    const newItem: MaterialItem = {
      id: Date.now().toString(),
      name: newMatName,
      category: newMatCategory,
      unit: newMatUnit,
      costPrice: newMatPrice,
    };
    const updated = [...materialBank, newItem];
    setMaterialBank(updated);
    localStorage.setItem('offertai_materialbank', JSON.stringify(updated));

    // Nollställ
    setNewMatName('');
    setNewMatPrice(0);
  };

  // Radera från materialbank
  const handleDeleteMaterial = (id: string) => {
    const updated = materialBank.filter((m) => m.id !== id);
    setMaterialBank(updated);
    localStorage.setItem('offertai_materialbank', JSON.stringify(updated));
  };

  // Lägg till valt material från banken till offerten
  const addMaterialToQuote = (item: MaterialItem) => {
    const sellingPrice = Math.round(item.costPrice * (1 + materialMarkup / 100));
    const existingIndex = selectedMaterials.findIndex((line) => line.description === item.name);

    if (existingIndex > -1) {
      const updated = [...selectedMaterials];
      updated[existingIndex].qty += 1;
      setSelectedMaterials(updated);
    } else {
      setSelectedMaterials([
        ...selectedMaterials,
        {
          id: Date.now().toString(),
          description: item.name,
          qty: 1,
          unit: item.unit,
          unitPrice: sellingPrice,
          vatPercent: 25,
        },
      ]);
    }
  };

  // Ändra antal på en offertrad
  const updateQuoteLineQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      setSelectedMaterials(selectedMaterials.filter((m) => m.id !== id));
    } else {
      setSelectedMaterials(
        selectedMaterials.map((m) => (m.id === id ? { ...m, qty: newQty } : m))
      );
    }
  };

  // ------------------------------------------------------------------
  // BERÄKNINGAR FÖR OFFERTEN (FÄLT/FIELDLY-STANDARD)
  // ------------------------------------------------------------------
  const effectiveHourlyRate = Math.round(hourlyRate * (1 + riskMargin / 100));
  const laborCostExclVat = laborHours * effectiveHourlyRate;

  const materialsCostExclVat = selectedMaterials.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  const subtotalExclVat = laborCostExclVat + materialsCostExclVat;
  const vatAmount = subtotalExclVat * 0.25;
  const totalInclVat = subtotalExclVat + vatAmount;

  // ROT-avdrag (30 % på arbetskostnaden inkl. moms)
  const laborCostInclVat = laborCostExclVat * 1.25;
  const rotDeduction = includeRot ? Math.round(laborCostInclVat * 0.3) : 0;
  const finalTotalToPay = totalInclVat - rotDeduction;

  // ONBOARDING-VY (Om inte onboarded)
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 antialiased selection:bg-teal-500/30">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="max-w-md w-full bg-slate-900/90 border border-teal-500/30 backdrop-blur-2xl p-7 rounded-3xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-teal-500/20 mx-auto">
              ⚡
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ställ in ditt Företag</h1>
            <p className="text-xs text-slate-400">Gör detta en gång – spara din branding & priser i mobilen.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Företagsnamn *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Org.nr</label>
                <input
                  type="text"
                  value={orgNo}
                  onChange={(e) => setOrgNo(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Timpris (kr/h exkl. moms)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <button
              onClick={saveCompanySettings}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black py-4 rounded-xl shadow-lg transition active:scale-[0.98] text-sm"
            >
              🚀 Spara & Gå Till Kalkylatorn
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-3 sm:p-6 antialiased print:bg-white print:text-black print:p-0">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10 print:hidden" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER / NAVIGATION */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-800/80 relative print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl text-teal-400 font-bold flex items-center justify-center active:scale-95 transition shadow-lg"
            >
              ☰
            </button>
            <div>
              <span className="font-black text-base tracking-tight text-white block">
                {companyName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400 block -mt-0.5">
                Professionellt Offertsystem
              </span>
            </div>
          </div>

          <div className="flex gap-1.5 sm:gap-2 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('offert')}
              className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'offert'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <span>⚡</span> Offert
            </button>
            <button
              onClick={() => setActiveTab('material')}
              className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'material'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <span>📦</span> Inköp & Bank
            </button>
            <button
              onClick={() => setActiveTab('jamfor')}
              className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'jamfor'
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <span>📊</span> Jämför
            </button>
            <button
              onClick={() => setActiveTab('foretag')}
              className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'foretag'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400'
              }`}
            >
              <span>⚙️</span> Profil
            </button>
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 1: SKAPA OFFERT */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'offert' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* KALKYLATOR & KNAPPAR (VÄNSTERPANEL) */}
            <section className="lg:col-span-5 bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-2xl print:hidden space-y-5">
              
              {/* KUNDUPPGIFTER */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Kund & Projekt
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Kundens Namn</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Leveransadress</label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Projektnamn / Rubrik</label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-semibold text-teal-300"
                    />
                  </div>
                </div>
              </div>

              {/* ARBETSTID & PA SLAG */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Arbetstid & Påslag
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Antal Timmar (h)</label>
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Timpris (kr/h exkl. moms)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-bold"
                    />
                  </div>
                </div>

                {/* VINSTPÅSLAG KNAPPAR PÅ MATERIAL */}
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1.5">
                    Vinstpåslag på Material ({materialMarkup} %)
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 10, 15, 20, 25].map((percent) => (
                      <button
                        key={percent}
                        onClick={() => setMaterialMarkup(percent)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          materialMarkup === percent
                            ? 'bg-teal-500 text-slate-950 border-teal-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        +{percent}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MATERIAL-CHIPS FRÅN MATERIALBANKEN */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Välj Material från din Bank
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {materialBank.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addMaterialToQuote(item)}
                      className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-xl font-medium flex items-center gap-1 active:scale-95 transition"
                    >
                      <span>+ {item.name}</span>
                      <span className="text-[10px] text-teal-400 font-bold">
                        ({Math.round(item.costPrice * (1 + materialMarkup / 100))} kr)
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* VALDA MATERIALRADER */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Material i denna offerten
                </span>
                {selectedMaterials.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">Inga material tillagda än. Klicka ovan.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {selectedMaterials.map((line) => (
                      <div key={line.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <div>
                          <p className="font-semibold text-white">{line.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {line.unitPrice.toLocaleString()} kr/{line.unit} exkl. moms
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuoteLineQty(line.id, line.qty - 1)}
                            className="w-6 h-6 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="font-bold text-white text-xs">{line.qty}</span>
                          <button
                            onClick={() => updateQuoteLineQty(line.id, line.qty + 1)}
                            className="w-6 h-6 bg-slate-800 text-slate-300 rounded-lg flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ROT CHECKBOX */}
              <div className="flex items-center gap-2.5 px-1">
                <input
                  type="checkbox"
                  id="rot"
                  checked={includeRot}
                  onChange={(e) => setIncludeRot(e.target.checked)}
                  className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
                />
                <label htmlFor="rot" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Inkludera ROT-avdrag (30 % på arbetskostnad)
                </label>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 text-xs"
              >
                <span>🖨️ Skriv Ut / Generera PDF Offert</span>
              </button>
            </section>

            {/* FULLSTÄNDIG PROFESSIONELL OFFERTMALL (FIELDLY-STANDARD) */}
            <section className="lg:col-span-7 bg-white text-slate-950 p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full space-y-6 font-sans">
              
              {/* HEADER MED DINA FÖRETAGSUPPGIFTER */}
              <div className="border-b border-slate-300 pb-5 flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-black text-slate-950 tracking-tight">{companyName}</h1>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">{companyAddress}</p>
                  <span className="inline-block mt-2 bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded">
                    Godkänd för F-skatt
                  </span>
                </div>
                <div className="text-right text-xs text-slate-600 space-y-0.5">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">OFFERT</h2>
                  <p><span className="font-semibold text-slate-800">Offertnr:</span> {quoteNumber}</p>
                  <p><span className="font-semibold text-slate-800">Datum:</span> {new Date().toLocaleDateString('sv-SE')}</p>
                  <p><span className="font-semibold text-slate-800">Giltig till:</span> {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('sv-SE')}</p>
                </div>
              </div>

              {/* KUND & ADRESS */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Beställare</span>
                  <p className="font-extrabold text-slate-950 text-sm">{customerName}</p>
                  <p className="text-slate-600">{customerAddress}</p>
                  <p className="text-slate-600">{customerPhone}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Projekt</span>
                  <p className="font-extrabold text-slate-950 text-sm">{jobTitle}</p>
                  <p className="text-slate-600 mt-1">Vår referens: {companyEmail}</p>
                </div>
              </div>

              {/* RIKTIG SPECIFIKATIONSTABELL */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 text-slate-900 uppercase font-black tracking-wider text-[11px]">
                      <th className="py-2.5">Beskrivning</th>
                      <th className="py-2.5 text-center">Antal</th>
                      <th className="py-2.5 text-center">Enhet</th>
                      <th className="py-2.5 text-right">Å-Pris exkl.</th>
                      <th className="py-2.5 text-center">Moms %</th>
                      <th className="py-2.5 text-right">Belopp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {/* Arbetstid */}
                    <tr>
                      <td className="py-3 font-bold text-slate-950">
                        Arbetstid & Utförande ({jobTitle})
                      </td>
                      <td className="py-3 text-center">{laborHours}</td>
                      <td className="py-3 text-center">h</td>
                      <td className="py-3 text-right">{effectiveHourlyRate.toLocaleString()} kr</td>
                      <td className="py-3 text-center">25%</td>
                      <td className="py-3 text-right font-bold text-slate-950">
                        {laborCostExclVat.toLocaleString()} kr
                      </td>
                    </tr>

                    {/* Valda materialrader */}
                    {selectedMaterials.map((line) => {
                      const totalLineExcl = line.qty * line.unitPrice;
                      return (
                        <tr key={line.id}>
                          <td className="py-3 font-medium text-slate-900">{line.description}</td>
                          <td className="py-3 text-center">{line.qty}</td>
                          <td className="py-3 text-center">{line.unit}</td>
                          <td className="py-3 text-right">{line.unitPrice.toLocaleString()} kr</td>
                          <td className="py-3 text-center">{line.vatPercent}%</td>
                          <td className="py-3 text-right font-bold text-slate-950">
                            {totalLineExcl.toLocaleString()} kr
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SUMMERINGS-SEKTION */}
              <div className="border-t-2 border-slate-900 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Summa exkl. moms:</span>
                  <span className="font-bold">{subtotalExclVat.toLocaleString()} kr</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Moms (25 %):</span>
                  <span className="font-bold">{vatAmount.toLocaleString()} kr</span>
                </div>
                <div className="flex justify-between text-slate-950 font-bold text-sm">
                  <span>Summa inkl. moms:</span>
                  <span>{totalInclVat.toLocaleString()} kr</span>
                </div>
                {includeRot && (
                  <div className="flex justify-between text-emerald-700 font-bold text-sm bg-emerald-50 p-2 rounded-lg">
                    <span>ROT-avdrag (30 % på arbetskostnad):</span>
                    <span>-{rotDeduction.toLocaleString()} kr</span>
                  </div>
                )}
              </div>

              {/* SLUTSUMMA CARD */}
              <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-xl print:border-2 print:border-slate-950 print:bg-white print:text-black">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 print:text-slate-600 block">
                      Totalt att betala
                    </span>
                    <span className="text-[10px] text-slate-400 print:hidden">Inkl. moms & ROT-avdrag</span>
                  </div>
                  <span className="text-3xl font-black text-teal-400 print:text-slate-950">
                    {finalTotalToPay.toLocaleString()} kr
                  </span>
                </div>
              </div>

              {/* FOOTER MED FÖRETAGSFAKTA */}
              <footer className="pt-6 border-t border-slate-200 text-[10px] text-slate-500 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="font-bold text-slate-800">{companyName}</p>
                  <p>Org.nr: {orgNo}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Kontakt</p>
                  <p>{companyPhone}</p>
                  <p>{companyEmail}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Betalning</p>
                  <p>Bankgiro: {bankgiro}</p>
                  <p>Momsreg: {vatNo}</p>
                </div>
              </footer>

            </section>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 2: MATERIALBANK & KVITTON */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'material' && (
          <div className="space-y-6">
            <section className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">📦 Din Materialbank & Inköpspriser</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Lägg till dina vanliga inköpspriser (exkl. moms). När du skapar en offert lägger appen automatiskt på ditt valda vinstpåslag (+15 %, +25 % osv.).
                </p>
              </div>

              {/* FORMULÄR FÖR NYTT MATERIAL */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                  Lägg Till Inköpsartikel
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Artikelnamn</label>
                    <input
                      type="text"
                      placeholder="Ex: Falu Rödfärg 10L"
                      value={newMatName}
                      onChange={(e) => setNewMatName(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Kategori</label>
                    <select
                      value={newMatCategory}
                      onChange={(e) => setNewMatCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Måleri">Måleri</option>
                      <option value="Bygg">Bygg & Snickeri</option>
                      <option value="VVS/Kakel">VVS & Kakel</option>
                      <option value="Fasad">Fasad & Utvändigt</option>
                      <option value="El">El & Belysning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Inköpspris (kr exkl. moms)</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={newMatPrice || ''}
                      onChange={(e) => setNewMatPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddMaterialToBank}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold p-2.5 rounded-xl transition"
                    >
                      + Spara Artikel
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTA MED SPARADE MATERIAL */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-200">Sparade Artiklar i Banken ({materialBank.length} st)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {materialBank.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-slate-400 text-[11px]">Inköp: {item.costPrice.toLocaleString()} kr exkl. moms</p>
                      </div>
                      <button
                        onClick={() => handleDeleteMaterial(item.id)}
                        className="text-rose-400 hover:text-rose-300 font-bold px-2 py-1 bg-rose-950/40 rounded-lg text-xs"
                      >
                        Radera
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 3: JÄMFÖR / VARFÖR VÄLJA OSS */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'jamfor' && (
          <div className="space-y-6">
            <section className="bg-white text-slate-950 p-6 sm:p-8 rounded-3xl shadow-2xl print:p-0 print:shadow-none">
              <div className="text-center border-b border-slate-200 pb-5 mb-6">
                <span className="text-xs font-black text-teal-700 uppercase tracking-widest block">{companyName}</span>
                <h2 className="text-2xl font-black text-slate-950 mt-1">Varför välja oss framför andra?</h2>
                <p className="text-xs text-slate-500 mt-1">En ärlig jämförelse av kvalitet, trygghet och dolda kostnader.</p>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-700 uppercase">
                      <th className="py-3 font-bold w-1/2">Vad ingår i jobbet?</th>
                      <th className="py-3 text-center font-bold text-teal-700 bg-teal-50/80 rounded-t-xl w-1/4">{companyName}</th>
                      <th className="py-3 text-center font-bold text-slate-400 w-1/4">Andra Aktörer / Konkurrenter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonPoints.map((pt) => (
                      <tr key={pt.id}>
                        <td className="py-3.5 font-bold text-slate-800">{pt.feature}</td>
                        <td className="py-3.5 text-center font-extrabold text-teal-800 bg-teal-50/50">{pt.us}</td>
                        <td className="py-3.5 text-center font-medium text-slate-500">{pt.competitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-600">
                <p className="font-bold text-slate-900 mb-0.5">💡 Vårt löfte till dig som kund</p>
                Vi konkurrerar inte med fuskarpriser. Vi levererar ett noggrant utfört arbete med garantier, schyssta villkor och utan överraskningar på fakturan.
              </div>

              <div className="mt-6 flex justify-center print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition text-xs"
                >
                  🖨️ Skriv ut Jämförelse-bilaga
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FLIK 4: FÖRETAGSPROFIL */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'foretag' && (
          <div className="space-y-6">
            <section className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
              <div>
                <h2 className="text-xl font-black text-white">⚙️ Din Företagsprofil</h2>
                <p className="text-xs text-slate-400">Ändra företagsinformationen som visas överst på alla dina offerter.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Företagsnamn</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Org.nr</label>
                    <input
                      type="text"
                      value={orgNo}
                      onChange={(e) => setOrgNo(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Momsreg.nr (VAT)</label>
                    <input
                      type="text"
                      value={vatNo}
                      onChange={(e) => setVatNo(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bankgiro / Plusgiro</label>
                    <input
                      type="text"
                      value={bankgiro}
                      onChange={(e) => setBankgiro(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Standard Timpris (kr/h exkl. moms)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">E-postadress</label>
                    <input
                      type="email"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Telefon</label>
                    <input
                      type="text"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <button
                  onClick={saveCompanySettings}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition text-xs mt-2"
                >
                  💾 Spara Företagsinställningar
                </button>
              </div>
            </section>
          </div>
        )}

      </div>
    </main>
  );
}
