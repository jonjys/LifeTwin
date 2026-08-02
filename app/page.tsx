// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

type Tab = 'offert' | 'historik' | 'kunder' | 'material' | 'jamfor' | 'foretag';
type QuoteStatus = 'Utkast' | 'Skickad' | 'Vunnen' | 'Avslagen';

interface MaterialItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  costPrice: number;
}

interface QuoteLineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  vatPercent: number;
}

interface SavedCustomer {
  id: string;
  name: string;
  address: string;
  phone: string;
  ssn: string;
  propertyId: string;
}

interface SavedQuote {
  id: string;
  number: string;
  date: string;
  customerName: string;
  jobTitle: string;
  totalAmount: number;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  laborHours: number;
  hourlyRate: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('offert');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FÖRETAGSPROFIL
  const [companyName, setCompanyName] = useState<string>('Tullinge Bygg AB');
  const [orgNo, setOrgNo] = useState<string>('556123-4567');
  const [vatNo, setVatNo] = useState<string>('SE556123456701');
  const [bankgiro, setBankgiro] = useState<string>('512-3456');
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [companyEmail, setCompanyEmail] = useState<string>('kontakt@tullingebygg.se');
  const [companyPhone, setCompanyPhone] = useState<string>('070-123 45 67');
  const [companyAddress, setCompanyAddress] = useState<string>('Företagsvägen 12, 147 30 Tullinge');

  // KUND & PROJEKT
  const [customerName, setCustomerName] = useState<string>('Anna Andersson');
  const [customerAddress, setCustomerAddress] = useState<string>('Storgatan 45, Stockholm');
  const [customerPhone, setCustomerPhone] = useState<string>('070-987 65 43');
  const [customerSsn, setCustomerSsn] = useState<string>('19850412-1234');
  const [propertyId, setPropertyId] = useState<string>('Stockholm Tullinge 1:12');
  const [jobTitle, setJobTitle] = useState<string>('Måleriarbete & Renovering');
  const [quoteNumber, setQuoteNumber] = useState<string>('OFF-2026-001');

  // REGLAGE & BERÄKNING
  const [laborHours, setLaborHours] = useState<number>(35);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);

  // MATERIALBANK
  const [materialBank, setMaterialBank] = useState<MaterialItem[]>([
    { id: 'm1', name: 'Väggfärg Glans 7 (10L)', category: 'Måleri', unit: 'l', costPrice: 750 },
    { id: 'm2', name: 'Våtrumsspackel (10L)', category: 'Måleri', unit: 'st', costPrice: 420 },
    { id: 'm3', name: 'Gipsskiva 13mm', category: 'Bygg', unit: 'st', costPrice: 110 },
    { id: 'm4', name: 'Falu Rödfärg Original (10L)', category: 'Fasad', unit: 'st', costPrice: 490 },
  ]);

  // VALDA MATERIAL I OFFERTEN
  const [selectedMaterials, setSelectedMaterials] = useState<QuoteLineItem[]>([
    { id: 'q1', description: 'Väggfärg Glans 7 (10L)', qty: 2, unit: 'l', unitPrice: 862, vatPercent: 25 },
    { id: 'q2', description: 'Våtrumsspackel (10L)', qty: 3, unit: 'st', unitPrice: 483, vatPercent: 25 },
  ]);

  // HISTORIK & KUNDER
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);

  // NYTT MATERIAL FORMULÄR
  const [newMatName, setNewMatName] = useState('');
  const [newMatPrice, setNewMatPrice] = useState(0);
  const [newMatUnit, setNewMatUnit] = useState('st');

  // Ladda LocalStorage
  useEffect(() => {
    const onboarded = localStorage.getItem('offertpro_onboarded');
    if (onboarded === 'true') {
      setIsOnboarded(true);
      setCompanyName(localStorage.getItem('offertpro_company') || companyName);
      setHourlyRate(Number(localStorage.getItem('offertpro_rate')) || hourlyRate);
    }
    const bank = localStorage.getItem('offertpro_materialbank');
    if (bank) setMaterialBank(JSON.parse(bank));

    const quotes = localStorage.getItem('offertpro_quotes');
    if (quotes) setSavedQuotes(JSON.parse(quotes));

    const custs = localStorage.getItem('offertpro_customers');
    if (custs) setSavedCustomers(JSON.parse(custs));
  }, []);

  // BERÄKNINGAR
  const laborCostExclVat = laborHours * hourlyRate;
  const materialsCostExclVat = selectedMaterials.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const subtotalExclVat = laborCostExclVat + materialsCostExclVat;
  const vatAmount = subtotalExclVat * 0.25;
  const totalInclVat = subtotalExclVat + vatAmount;
  const rotDeduction = includeRot ? Math.round(laborCostExclVat * 1.25 * 0.3) : 0;
  const finalTotalToPay = totalInclVat - rotDeduction;

  // Lägg till material från bank
  const addMaterialToQuote = (item: MaterialItem) => {
    const priceWithMarkup = Math.round(item.costPrice * (1 + materialMarkup / 100));
    const exist = selectedMaterials.find((m) => m.description === item.name);
    if (exist) {
      setSelectedMaterials(selectedMaterials.map((m) => m.description === item.name ? { ...m, qty: m.qty + 1 } : m));
    } else {
      setSelectedMaterials([...selectedMaterials, { id: Date.now().toString(), description: item.name, qty: 1, unit: item.unit, unitPrice: priceWithMarkup, vatPercent: 25 }]);
    }
  };

  // Simulerad AI-Kvitto-Scanning
  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulerad OCR-extrahering av kvitto
    setTimeout(() => {
      const scannedItem: MaterialItem = {
        id: Date.now().toString(),
        name: `Inköp (${file.name.replace(/\.[^/.]+$/, "")})`,
        category: 'Inläst Kvitto',
        unit: 'st',
        costPrice: 650,
      };
      const updated = [...materialBank, scannedItem];
      setMaterialBank(updated);
      localStorage.setItem('offertpro_materialbank', JSON.stringify(updated));
      alert(`✅ Kvitto inläst! Artikelexempel "${scannedItem.name}" (650 kr) tillagt i Materialbanken.`);
    }, 800);
  };

  // Spara Offert
  const handleSaveQuote = () => {
    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      number: quoteNumber,
      date: new Date().toLocaleDateString('sv-SE'),
      customerName,
      jobTitle,
      totalAmount: finalTotalToPay,
      status: 'Utkast',
      lineItems: selectedMaterials,
      laborHours,
      hourlyRate,
    };
    const updated = [newQuote, ...savedQuotes];
    setSavedQuotes(updated);
    localStorage.setItem('offertpro_quotes', JSON.stringify(updated));

    // Spara även kunden om den inte finns
    if (!savedCustomers.some((c) => c.name === customerName)) {
      const newCust: SavedCustomer = { id: Date.now().toString(), name: customerName, address: customerAddress, phone: customerPhone, ssn: customerSsn, propertyId };
      const updatedCusts = [...savedCustomers, newCust];
      setSavedCustomers(updatedCusts);
      localStorage.setItem('offertpro_customers', JSON.stringify(updatedCusts));
    }

    alert('✅ Offert och Kund har sparats i historiken!');
  };

  // SMS-dela
  const handleSendSms = () => {
    const text = encodeURIComponent(`Hej ${customerName}! Här är din offert för ${jobTitle}: ${finalTotalToPay.toLocaleString()} kr inkl. moms & ROT. Klicka för att godkänna: https://dinapp.se/accept/${quoteNumber}`);
    window.open(`sms:${customerPhone}?body=${text}`, '_blank');
  };

  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <h1 className="text-xl font-black text-white">Välkommen till Läcksök Pro</h1>
            <p className="text-xs text-slate-400">Ange företagets basic info en gång.</p>
          </div>
          <div className="space-y-3 text-xs">
            <input type="text" placeholder="Företagsnamn" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
            <input type="number" placeholder="Timpris exkl. moms" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none" />
            <button onClick={() => { localStorage.setItem('offertpro_onboarded', 'true'); localStorage.setItem('offertpro_company', companyName); localStorage.setItem('offertpro_rate', hourlyRate.toString()); setIsOnboarded(true); }} className="w-full bg-teal-400 text-slate-950 font-black py-3 rounded-xl">Starta Appen</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-3 sm:p-5 antialiased print:bg-white print:text-black print:p-0">
      
      {/* HEADER & DRAWER TOGGLE */}
      <header className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800/80 print:hidden">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 bg-slate-900 border border-slate-800 rounded-xl text-teal-400 font-bold flex items-center justify-center active:scale-95 transition">
            ☰
          </button>
          <div>
            <span className="font-black text-sm text-white block leading-tight">{companyName}</span>
            <span className="text-[9px] font-bold tracking-widest text-teal-400 uppercase">Offert & CRM</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveQuote} className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl text-xs font-bold text-slate-300 transition">
            💾 Spara
          </button>
          <button onClick={handleSendSms} className="px-3 py-1.5 bg-teal-400 text-slate-950 rounded-xl text-xs font-extrabold active:scale-95 transition">
            📱 SMS-Accept
          </button>
        </div>
      </header>

      {/* DRAWER MENU (RULLGARDINSMENY) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-start">
          <div className="w-72 bg-slate-950 border-r border-slate-800 h-full p-5 space-y-6 animate-in slide-in-from-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-black text-sm text-white">Meny & Navigering</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 text-lg font-bold">✕</button>
            </div>
            <nav className="space-y-1.5 text-xs font-bold">
              {[
                { id: 'offert', label: '⚡ Skapa Offert', icon: '⚡' },
                { id: 'historik', label: '🗂️ Offert-historik', icon: '🗂️' },
                { id: 'kunder', label: '👥 Kundregister', icon: '👥' },
                { id: 'material', label: '📦 Materialbank & Kvittoscanner', icon: '📦' },
                { id: 'jamfor', label: '📊 Jämför-Sida', icon: '📊' },
                { id: 'foretag', label: '🏢 Mitt Företag', icon: '🏢' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTab(t.id as Tab); setDrawerOpen(false); }}
                  className={`w-full text-left p-3 rounded-xl transition flex items-center gap-2.5 ${activeTab === t.id ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:bg-slate-900'}`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ⚡ FLIK 1: SKAPA OFFERT (MINIMALISTISK MOCK-UP & SLIDERS) */}
      {activeTab === 'offert' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* VÄNSTERPANEL: SLIDERS & FORMULÄR */}
          <section className="lg:col-span-5 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 print:hidden">
            
            {/* KUND & ROT-FÄLT */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Kund</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Telefon</label>
                  <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Personnummer (ROT)</label>
                  <input type="text" value={customerSsn} onChange={(e) => setCustomerSsn(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Fastighetsbeteckning</label>
                  <input type="text" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
              </div>
            </div>

            {/* INTERAKTIVA REGLAGE (SLIDERS) */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Arbetstimmar:</span>
                  <span className="text-teal-400 font-mono text-sm">{laborHours} h</span>
                </div>
                <input type="range" min="1" max="150" value={laborHours} onChange={(e) => setLaborHours(Number(e.target.value))} className="w-full accent-teal-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Timpris:</span>
                  <span className="text-teal-400 font-mono text-sm">{hourlyRate} kr/h</span>
                </div>
                <input type="range" min="400" max="1200" step="25" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full accent-teal-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer" />
              </div>

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Materialpåslag:</span>
                  <span className="text-emerald-400 font-mono text-sm">+{materialMarkup}%</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[5, 10, 15, 20, 25].map((p) => (
                    <button key={p} onClick={() => setMaterialMarkup(p)} className={`py-1 text-[11px] font-bold rounded border ${materialMarkup === p ? 'bg-teal-400 text-slate-950 border-teal-300' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                      +{p}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* MINIMALISTISKA MATERIAL-CHIPS */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Snabbval Material</span>
              <div className="flex flex-wrap gap-1">
                {materialBank.map((item) => (
                  <button key={item.id} onClick={() => addMaterialToQuote(item)} className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-slate-300 text-[10px] px-2 py-1 rounded-lg font-medium active:scale-95 transition">
                    + {item.name} <span className="text-teal-400">({Math.round(item.costPrice * (1 + materialMarkup / 100))}kr)</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input type="checkbox" checked={includeRot} onChange={(e) => setIncludeRot(e.target.checked)} className="accent-teal-400 w-4 h-4 rounded" />
                ROT-avdrag (30%)
              </label>
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition">
                🖨️ PDF
              </button>
            </div>
          </section>

          {/* HÖGERPANEL: KOMPAKT & EXKLUSIV OFFERTMALL */}
          <section className="lg:col-span-7 bg-white text-slate-950 p-5 sm:p-7 rounded-2xl shadow-xl space-y-4 print:shadow-none print:p-0">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight">{companyName}</h1>
                <p className="text-[10px] text-slate-500">{companyAddress} • Org: {orgNo}</p>
              </div>
              <div className="text-right text-[10px] text-slate-600">
                <span className="text-sm font-black text-slate-900 block">OFFERT</span>
                <span>{quoteNumber} • {new Date().toLocaleDateString('sv-SE')}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Kund</span>
                <p className="font-bold text-slate-900">{customerName}</p>
                <p className="text-slate-600 text-[10px]">{customerAddress}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">ROT / Fastighet</span>
                <p className="text-slate-700 text-[10px]">{customerSsn || 'Ej angivet'}</p>
                <p className="text-slate-700 text-[10px]">{propertyId || 'Ej angiven'}</p>
              </div>
            </div>

            {/* TABELL */}
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-900 font-black text-slate-900 uppercase">
                  <th className="py-1">Beskrivning</th>
                  <th className="py-1 text-center">Antal</th>
                  <th className="py-1 text-right">Å-pris</th>
                  <th className="py-1 text-right">Belopp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-2 font-bold">{jobTitle} ({laborHours}h)</td>
                  <td className="py-2 text-center">{laborHours} h</td>
                  <td className="py-2 text-right">{hourlyRate} kr</td>
                  <td className="py-2 text-right font-bold">{laborCostExclVat.toLocaleString()} kr</td>
                </tr>
                {selectedMaterials.map((m) => (
                  <tr key={m.id}>
                    <td className="py-1.5">{m.description}</td>
                    <td className="py-1.5 text-center">{m.qty} {m.unit}</td>
                    <td className="py-1.5 text-right">{m.unitPrice} kr</td>
                    <td className="py-1.5 text-right font-semibold">{(m.qty * m.unitPrice).toLocaleString()} kr</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* SUMMERING */}
            <div className="border-t border-slate-900 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600"><span>Exkl. moms:</span><span>{subtotalExclVat.toLocaleString()} kr</span></div>
              <div className="flex justify-between text-slate-600"><span>Moms 25%:</span><span>{vatAmount.toLocaleString()} kr</span></div>
              {includeRot && <div className="flex justify-between text-emerald-700 font-bold"><span>ROT-avdrag (30% arbete):</span><span>-{rotDeduction.toLocaleString()} kr</span></div>}
              <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-200">
                <span>Att betala:</span>
                <span className="text-teal-700">{finalTotalToPay.toLocaleString()} kr</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* 📦 FLIK: MATERIALBANK & KVITTOSCANNER */}
      {activeTab === 'material' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-2xl mx-auto">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-black text-white">📦 Materialbank & Inköpskvitton</h2>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-black">
              📷 Skanna Kvitto
            </button>
            <input type="file" ref={fileInputRef} onChange={handleReceiptScan} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {materialBank.map((item) => (
              <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="text-[10px] text-slate-400">Inköp: {item.costPrice} kr exkl. moms</p>
                </div>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-teal-400 font-bold">{item.category}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🗂️ FLIK: OFFERT-HISTORIK */}
      {activeTab === 'historik' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-2xl mx-auto text-xs">
          <h2 className="text-base font-black text-white">🗂️ Sparade Offerter ({savedQuotes.length})</h2>
          {savedQuotes.length === 0 ? (
            <p className="text-slate-500 italic">Inga sparade offerter än.</p>
          ) : (
            savedQuotes.map((q) => (
              <div key={q.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-teal-400">{q.number} • {q.date}</span>
                  <p className="font-bold text-white text-sm">{q.customerName}</p>
                  <p className="text-[10px] text-slate-400">{q.jobTitle}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-teal-300 text-sm block">{q.totalAmount.toLocaleString()} kr</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">{q.status}</span>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* 👥 FLIK: KUNDREGISTER */}
      {activeTab === 'kunder' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 max-w-2xl mx-auto text-xs">
          <h2 className="text-base font-black text-white">👥 Sparade Kunder ({savedCustomers.length})</h2>
          {savedCustomers.map((c) => (
            <div key={c.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p className="font-bold text-white text-sm">{c.name}</p>
              <p className="text-slate-400 text-[10px]">{c.address} • {c.phone}</p>
              <p className="text-teal-400 text-[10px] mt-1">Personnr: {c.ssn} | Fastighet: {c.propertyId}</p>
            </div>
          ))}
        </section>
      )}

    </main>
  );
}
