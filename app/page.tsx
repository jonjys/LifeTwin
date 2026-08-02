// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

// --- TYPER ---
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
  email: string;
  ssn: string;
  propertyId: string;
}

interface SavedQuote {
  id: string;
  number: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerSsn: string;
  propertyId: string;
  jobTitle: string;
  laborHours: number;
  hourlyRate: number;
  materialMarkup: number;
  includeRot: boolean;
  lineItems: QuoteLineItem[];
  subtotalExclVat: number;
  vatAmount: number;
  rotDeduction: number;
  totalAmount: number;
  status: QuoteStatus;
}

export default function Home() {
  // --- STATE: NAVIGERING & ONBOARDING ---
  const [activeTab, setActiveTab] = useState<Tab>('offert');
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE: FÖRETAGSPROFIL ---
  const [companyName, setCompanyName] = useState<string>('Tullinge Bygg AB');
  const [orgNo, setOrgNo] = useState<string>('556123-4567');
  const [vatNo, setVatNo] = useState<string>('SE556123456701');
  const [bankgiro, setBankgiro] = useState<string>('512-3456');
  const [companyEmail, setCompanyEmail] = useState<string>('kontakt@tullingebygg.se');
  const [companyPhone, setCompanyPhone] = useState<string>('070-123 45 67');
  const [companyAddress, setCompanyAddress] = useState<string>('Företagsvägen 12, 147 30 Tullinge');
  const [defaultHourlyRate, setDefaultHourlyRate] = useState<number>(650);

  // --- STATE: KUND & PROJEKT ---
  const [customerName, setCustomerName] = useState<string>('Anna Andersson');
  const [customerAddress, setCustomerAddress] = useState<string>('Storgatan 45, Stockholm');
  const [customerPhone, setCustomerPhone] = useState<string>('070-987 65 43');
  const [customerEmail, setCustomerEmail] = useState<string>('anna@example.se');
  const [customerSsn, setCustomerSsn] = useState<string>('19850412-1234');
  const [propertyId, setPropertyId] = useState<string>('Stockholm Tullinge 1:12');
  const [jobTitle, setJobTitle] = useState<string>('Måleriarbete & Renovering');
  const [quoteNumber, setQuoteNumber] = useState<string>('OFF-2026-001');

  // --- STATE: REGLAGE & BERÄKNING ---
  const [laborHours, setLaborHours] = useState<number>(35);
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);

  // --- STATE: MATERIALBANK & STRUKTUR ---
  const [materialBank, setMaterialBank] = useState<MaterialItem[]>([
    { id: 'm1', name: 'Väggfärg Glans 7 (10L)', category: 'Måleri', unit: 'l', costPrice: 750 },
    { id: 'm2', name: 'Våtrumsspackel (10L)', category: 'Måleri', unit: 'st', costPrice: 420 },
    { id: 'm3', name: 'Gipsskiva 13mm 900x2400', category: 'Bygg', unit: 'st', costPrice: 110 },
    { id: 'm4', name: 'Regel 45x45x2500', category: 'Bygg', unit: 'st', costPrice: 45 },
    { id: 'm5', name: 'Tätskikt Badrum Set', category: 'VVS/Kakel', unit: 'st', costPrice: 3500 },
    { id: 'm6', name: 'Falu Rödfärg Original (10L)', category: 'Fasad', unit: 'st', costPrice: 490 },
  ]);

  const [selectedMaterials, setSelectedMaterials] = useState<QuoteLineItem[]>([
    { id: 'q1', description: 'Väggfärg Glans 7 (10L)', qty: 2, unit: 'l', unitPrice: 862, vatPercent: 25 },
    { id: 'q2', description: 'Våtrumsspackel (10L)', qty: 3, unit: 'st', unitPrice: 483, vatPercent: 25 },
  ]);

  // --- STATE: HISTORIK & KUNDER ---
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);

  // --- STATE: FORMS FÖR MANUELLT MATERIAL ---
  const [customMatName, setCustomMatName] = useState('');
  const [customMatPrice, setCustomMatPrice] = useState<number>(0);
  const [customMatQty, setCustomMatQty] = useState<number>(1);
  const [customMatUnit, setCustomMatUnit] = useState('st');

  // --- INIT: LOCALSTORAGE ---
  useEffect(() => {
    const onboarded = localStorage.getItem('offert_pro_onboarded');
    if (onboarded === 'true') {
      setIsOnboarded(true);
      setCompanyName(localStorage.getItem('offert_pro_company') || companyName);
      setOrgNo(localStorage.getItem('offert_pro_org') || orgNo);
      setVatNo(localStorage.getItem('offert_pro_vat') || vatNo);
      setBankgiro(localStorage.getItem('offert_pro_bg') || bankgiro);
      setCompanyEmail(localStorage.getItem('offert_pro_email') || companyEmail);
      setCompanyPhone(localStorage.getItem('offert_pro_phone') || companyPhone);
      setCompanyAddress(localStorage.getItem('offert_pro_address') || companyAddress);
      const rate = Number(localStorage.getItem('offert_pro_rate'));
      if (rate) {
        setDefaultHourlyRate(rate);
        setHourlyRate(rate);
      }
    }

    const bank = localStorage.getItem('offert_pro_materialbank');
    if (bank) setMaterialBank(JSON.parse(bank));

    const quotes = localStorage.getItem('offert_pro_quotes');
    if (quotes) setSavedQuotes(JSON.parse(quotes));

    const custs = localStorage.getItem('offert_pro_customers');
    if (custs) setSavedCustomers(JSON.parse(custs));
  }, []);

  // --- BERÄKNINGSLOGIK ---
  const laborCostExclVat = laborHours * hourlyRate;
  const materialsCostExclVat = selectedMaterials.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const subtotalExclVat = laborCostExclVat + materialsCostExclVat;
  const vatAmount = subtotalExclVat * 0.25;
  const totalInclVat = subtotalExclVat + vatAmount;
  // ROT beräknas på arbetskostnaden inkl. moms (30%)
  const rotDeduction = includeRot ? Math.round(laborCostExclVat * 1.25 * 0.3) : 0;
  const finalTotalToPay = totalInclVat - rotDeduction;

  // --- HANTERA MATERIALI OFFERTEN ---
  const addMaterialFromBank = (item: MaterialItem) => {
    const priceWithMarkup = Math.round(item.costPrice * (1 + materialMarkup / 100));
    const exist = selectedMaterials.find((m) => m.description === item.name);
    if (exist) {
      setSelectedMaterials(selectedMaterials.map((m) => m.description === item.name ? { ...m, qty: m.qty + 1 } : m));
    } else {
      setSelectedMaterials([
        ...selectedMaterials,
        { id: Date.now().toString(), description: item.name, qty: 1, unit: item.unit, unitPrice: priceWithMarkup, vatPercent: 25 },
      ]);
    }
  };

  const addCustomMaterial = () => {
    if (!customMatName || customMatPrice <= 0) return;
    const priceWithMarkup = Math.round(customMatPrice * (1 + materialMarkup / 100));
    setSelectedMaterials([
      ...selectedMaterials,
      { id: Date.now().toString(), description: customMatName, qty: customMatQty, unit: customMatUnit, unitPrice: priceWithMarkup, vatPercent: 25 },
    ]);
    setCustomMatName('');
    setCustomMatPrice(0);
    setCustomMatQty(1);
  };

  const removeMaterialItem = (id: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m.id !== id));
  };

  const updateMaterialQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeMaterialItem(id);
    } else {
      setSelectedMaterials(selectedMaterials.map((m) => (m.id === id ? { ...m, qty } : m)));
    }
  };

  // --- AI / KVITTOSCANNING ---
  const handleReceiptScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulerar smart OCR-inläsning av kvitto
    setTimeout(() => {
      const scannedItem: MaterialItem = {
        id: Date.now().toString(),
        name: `Inköp (${file.name.replace(/\.[^/.]+$/, '')})`,
        category: 'Inläst Kvitto',
        unit: 'st',
        costPrice: 850,
      };
      const updated = [scannedItem, ...materialBank];
      setMaterialBank(updated);
      localStorage.setItem('offert_pro_materialbank', JSON.stringify(updated));
      alert(`✅ Kvitto inläst! Inköpet "${scannedItem.name}" (850 kr exkl. moms) lades till i din Materialbank.`);
    }, 900);
  };

  // --- SPARA OFFERT & KUND ---
  const handleSaveQuote = () => {
    const newQuote: SavedQuote = {
      id: Date.now().toString(),
      number: quoteNumber,
      date: new Date().toLocaleDateString('sv-SE'),
      customerName,
      customerPhone,
      customerSsn,
      propertyId,
      jobTitle,
      laborHours,
      hourlyRate,
      materialMarkup,
      includeRot,
      lineItems: selectedMaterials,
      subtotalExclVat,
      vatAmount,
      rotDeduction,
      totalAmount: finalTotalToPay,
      status: 'Utkast',
    };

    const updatedQuotes = [newQuote, ...savedQuotes];
    setSavedQuotes(updatedQuotes);
    localStorage.setItem('offert_pro_quotes', JSON.stringify(updatedQuotes));

    // Spara kunden i kundregistret om den inte finns
    if (!savedCustomers.some((c) => c.name.toLowerCase() === customerName.toLowerCase())) {
      const newCust: SavedCustomer = {
        id: Date.now().toString(),
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
        email: customerEmail,
        ssn: customerSsn,
        propertyId,
      };
      const updatedCusts = [newCust, ...savedCustomers];
      setSavedCustomers(updatedCusts);
      localStorage.setItem('offert_pro_customers', JSON.stringify(updatedCusts));
    }

    alert(`🎉 Offert ${quoteNumber} sparades i historiken och kunden sparades i registret!`);
  };

  // --- VÄLJ KUND FRÅN REGISTER ---
  const selectCustomerFromRegister = (c: SavedCustomer) => {
    setCustomerName(c.name);
    setCustomerAddress(c.address);
    setCustomerPhone(c.phone);
    setCustomerEmail(c.email);
    setCustomerSsn(c.ssn);
    setPropertyId(c.propertyId);
    setActiveTab('offert');
  };

  // --- SMS-DELA DIGITAL ACCEPT ---
  const handleSendSms = () => {
    const text = encodeURIComponent(
      `Hej ${customerName}! Här kommer din offert för ${jobTitle} från ${companyName}.\n\nTotalsumma: ${finalTotalToPay.toLocaleString()} kr inkl. moms & ROT.\n\nKlicka här för att granska och godkänna offerten digitalt: https://offertpro.se/accept/${quoteNumber}`
    );
    window.open(`sms:${customerPhone}?body=${text}`, '_blank');
  };

  // --- SPARA FÖRETAGSPROFIL ---
  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('offert_pro_onboarded', 'true');
    localStorage.setItem('offert_pro_company', companyName);
    localStorage.setItem('offert_pro_org', orgNo);
    localStorage.setItem('offert_pro_vat', vatNo);
    localStorage.setItem('offert_pro_bg', bankgiro);
    localStorage.setItem('offert_pro_email', companyEmail);
    localStorage.setItem('offert_pro_phone', companyPhone);
    localStorage.setItem('offert_pro_address', companyAddress);
    localStorage.setItem('offert_pro_rate', defaultHourlyRate.toString());
    setIsOnboarded(true);
    alert('✅ Företagsprofilen har sparats!');
  };

  // --- FIRST-TIME ONBOARDING SCREEN ---
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-teal-500/20 text-teal-400 font-black rounded-2xl flex items-center justify-center mx-auto mb-2 border border-teal-500/30 text-xl">
              ⚡
            </div>
            <h1 className="text-xl font-black text-white">Välkommen till OffertPro</h1>
            <p className="text-xs text-slate-400">Ställ in ditt företag en gång. Sedan skapar du offerter på 30 sekunder.</p>
          </div>
          <form onSubmit={handleSaveCompanyProfile} className="space-y-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Företagsnamn</label>
              <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Org.nummer</label>
                <input type="text" value={orgNo} onChange={(e) => setOrgNo(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Standard Timpris (exkl. moms)</label>
                <input type="number" value={defaultHourlyRate} onChange={(e) => setDefaultHourlyRate(Number(e.target.value))} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">E-post</label>
              <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-400" />
            </div>
            <button type="submit" className="w-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-black py-3.5 rounded-xl shadow-lg transition active:scale-95">
              Kom igång nu →
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-3 sm:p-5 antialiased print:bg-white print:text-black print:p-0">
      
      {/* 🚀 HEADER & NAVIGATION */}
      <header className="flex justify-between items-center pb-3 mb-4 border-b border-slate-800/80 print:hidden">
        <div className="flex items-center gap-2.5">
          <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-xl text-teal-400 font-bold flex items-center justify-center active:scale-95 transition">
            ☰
          </button>
          <div>
            <span className="font-black text-sm text-white block leading-tight tracking-tight">{companyName}</span>
            <span className="text-[9px] font-bold tracking-widest text-teal-400 uppercase">Offert & Mikro-CRM</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSaveQuote} className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-xl text-xs font-bold text-slate-300 transition flex items-center gap-1.5">
            💾 <span>Spara</span>
          </button>
          <button onClick={handleSendSms} className="px-3 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl text-xs font-extrabold active:scale-95 transition flex items-center gap-1.5 shadow-md">
            📱 <span>SMS-Accept</span>
          </button>
        </div>
      </header>

      {/* 📱 DRAWER / RULLGARDINSMENY */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start">
          <div className="w-72 bg-slate-950 border-r border-slate-800 h-full p-5 space-y-6 animate-in slide-in-from-left">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-black text-sm text-white">Meny & Navigering</span>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
            </div>
            <nav className="space-y-1.5 text-xs font-bold">
              {[
                { id: 'offert', label: '⚡ Skapa Offert', icon: '⚡' },
                { id: 'historik', label: '🗂️ Offert-historik', icon: '🗂️' },
                { id: 'kunder', label: '👥 Kundregister', icon: '👥' },
                { id: 'material', label: '📦 Materialbank & Scanner', icon: '📦' },
                { id: 'jamfor', label: '📊 Jämför-Sida (Bilaga)', icon: '📊' },
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
            <div className="pt-6 border-t border-slate-800/80 text-[10px] text-slate-500">
              <p>OffertPro v3.4 • Pro Edition</p>
              <p>Kopplad till LocalStorage & Vercel</p>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ FLIK 1: SKAPA OFFERT (HUVUDVY MED REGLAGE OCH INTERAKTIV OFFERT) */}
      {activeTab === 'offert' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          
          {/* VÄNSTERPANEL: INTERAKTIV KALKYLATOR & REGLAGE */}
          <section className="lg:col-span-5 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4 print:hidden">
            
            {/* KUND & PROJEKTINFO */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Projekt Rubrik</label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-semibold outline-none focus:border-teal-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Kundens Namn</label>
                  <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Telefonnummer</label>
                  <input type="text" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Personnummer (ROT)</label>
                  <input type="text" value={customerSsn} onChange={(e) => setCustomerSsn(e.target.value)} placeholder="ÅÅMMDD-XXXX" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Fastighetsbet.</label>
                  <input type="text" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} placeholder="Kommun Fastighet 1:1" className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
                </div>
              </div>
            </div>

            {/* 🎛️ TESLA/APPLE STYLE RANGE-SLIDERS */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-3.5 text-xs">
              
              {/* SLIDER 1: ARBETSTIMMAR */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Arbetstimmar:</span>
                  <span className="text-teal-400 font-mono text-sm">{laborHours} h</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="150"
                  value={laborHours}
                  onChange={(e) => setLaborHours(Number(e.target.value))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              {/* SLIDER 2: TIMPRIS */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Timpris (exkl. moms):</span>
                  <span className="text-teal-400 font-mono text-sm">{hourlyRate} kr/h</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="25"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-teal-400 h-1.5 bg-slate-900 rounded-lg cursor-pointer"
                />
              </div>

              {/* SLIDER 3: MATERIALPÅSLAG */}
              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-400">Vinstpåslag Material:</span>
                  <span className="text-emerald-400 font-mono text-sm">+{materialMarkup}%</span>
                </div>
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {[0, 10, 15, 20, 30].map((p) => (
                    <button
                      key={p}
                      onClick={() => setMaterialMarkup(p)}
                      className={`py-1 text-[10px] font-bold rounded-lg border transition ${materialMarkup === p ? 'bg-teal-400 text-slate-950 border-teal-300' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                    >
                      +{p}%
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 📦 MATERIAL CHIPS & SNABBVAL */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Klicka för att lägga till material:</span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {materialBank.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addMaterialFromBank(item)}
                    className="bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-slate-300 text-[10px] px-2.5 py-1 rounded-lg font-medium active:scale-95 transition"
                  >
                    + {item.name} <span className="text-teal-400 font-mono">({Math.round(item.costPrice * (1 + materialMarkup / 100))}kr)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* LÄGG TILL MANUELL RAD */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-400 font-bold block">Lägg till egen materialrad:</span>
              <div className="grid grid-cols-12 gap-1.5">
                <input type="text" placeholder="Artikel / Material" value={customMatName} onChange={(e) => setCustomMatName(e.target.value)} className="col-span-5 p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-[11px]" />
                <input type="number" placeholder="Inköpspris" value={customMatPrice || ''} onChange={(e) => setCustomMatPrice(Number(e.target.value))} className="col-span-3 p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-[11px]" />
                <input type="number" placeholder="Antal" value={customMatQty} onChange={(e) => setCustomMatQty(Number(e.target.value))} className="col-span-2 p-1.5 bg-slate-900 border border-slate-800 rounded text-white text-[11px]" />
                <button onClick={addCustomMaterial} className="col-span-2 bg-teal-400 text-slate-950 font-black rounded text-[11px] hover:bg-teal-300">
                  +
                </button>
              </div>
            </div>

            {/* INSTÄLLNINGAR & ROT */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                <input type="checkbox" checked={includeRot} onChange={(e) => setIncludeRot(e.target.checked)} className="accent-teal-400 w-4 h-4 rounded" />
                Inkludera ROT-avdrag (30%)
              </label>
              <button onClick={() => window.print()} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition flex items-center gap-1">
                🖨️ <span>Skriv ut PDF</span>
              </button>
            </div>

          </section>

          {/* HÖGERPANEL: EXKLUSIV OCH EXAKT OFFERTMALL (LIVE-PREVIEW) */}
          <section className="lg:col-span-7 bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-2xl space-y-5 print:shadow-none print:p-0 print:m-0">
            
            {/* OFFERT HEADER */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight">{companyName}</h1>
                <p className="text-[11px] text-slate-500">{companyAddress}</p>
                <p className="text-[11px] text-slate-500">Org.nr: {orgNo} • {companyEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-slate-900 block tracking-widest">OFFERT</span>
                <span className="text-[11px] text-slate-600 block">Offertnr: {quoteNumber}</span>
                <span className="text-[11px] text-slate-500">Datum: {new Date().toLocaleDateString('sv-SE')}</span>
              </div>
            </div>

            {/* KUND & PROJEKTRUTA */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">Beställare</span>
                <p className="font-bold text-slate-900">{customerName}</p>
                <p className="text-slate-600 text-[11px]">{customerAddress}</p>
                <p className="text-slate-600 text-[11px]">Tel: {customerPhone}</p>
              </div>
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">Projekt & ROT-uppgifter</span>
                <p className="font-bold text-slate-900">{jobTitle}</p>
                <p className="text-slate-600 text-[11px]">Personnr: {customerSsn || 'Ej angivet'}</p>
                <p className="text-slate-600 text-[11px]">Fastighet: {propertyId || 'Ej angiven'}</p>
              </div>
            </div>

            {/* ARBETS- OCH MATERIALSPECIFIKATION */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Specifikation</span>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-black uppercase text-[10px]">
                    <th className="py-2">Beskrivning</th>
                    <th className="py-2 text-center">Antal</th>
                    <th className="py-2 text-right">Å-pris</th>
                    <th className="py-2 text-right">Belopp exkl. moms</th>
                    <th className="py-2 text-center print:hidden">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {/* Rad 1: Arbete */}
                  <tr className="font-medium">
                    <td className="py-2.5">
                      <span className="font-bold text-slate-900 block">Arbetstid & Utförande</span>
                      <span className="text-[10px] text-slate-500">{laborHours} timmar à {hourlyRate} kr/h</span>
                    </td>
                    <td className="py-2.5 text-center">{laborHours} h</td>
                    <td className="py-2.5 text-right">{hourlyRate} kr</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{laborCostExclVat.toLocaleString()} kr</td>
                    <td className="py-2.5 text-center print:hidden">-</td>
                  </tr>

                  {/* Materialrader */}
                  {selectedMaterials.map((m) => (
                    <tr key={m.id} className="text-slate-700">
                      <td className="py-2">{m.description}</td>
                      <td className="py-2 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => updateMaterialQty(m.id, m.qty - 1)} className="w-4 h-4 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold print:hidden">-</button>
                          <span>{m.qty} {m.unit}</span>
                          <button onClick={() => updateMaterialQty(m.id, m.qty + 1)} className="w-4 h-4 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold print:hidden">+</button>
                        </div>
                      </td>
                      <td className="py-2 text-right">{m.unitPrice} kr</td>
                      <td className="py-2 text-right font-semibold">{(m.qty * m.unitPrice).toLocaleString()} kr</td>
                      <td className="py-2 text-center print:hidden">
                        <button onClick={() => removeMaterialItem(m.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMERINGS-RUTA MED GRÖN TOTALT ATT BETALA */}
            <div className="border-t-2 border-slate-900 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Summa exkl. moms:</span>
                <span className="font-mono">{subtotalExclVat.toLocaleString()} kr</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Moms (25%):</span>
                <span className="font-mono">{vatAmount.toLocaleString()} kr</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-1">
                <span>Totalt exkl. ROT:</span>
                <span className="font-mono">{totalInclVat.toLocaleString()} kr</span>
              </div>
              {includeRot && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg">
                  <span>ROT-avdrag (30% av arbetskostnad inkl. moms):</span>
                  <span className="font-mono">-{rotDeduction.toLocaleString()} kr</span>
                </div>
              )}

              {/* SLUTGILTIG KNALLGRÖN BOX */}
              <div className="bg-slate-950 text-white p-4 rounded-xl flex justify-between items-center mt-3 shadow-lg">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">TOTALT ATT BETALA</span>
                  <span className="text-[10px] text-slate-400">Inkl. moms {includeRot ? '& ROT-avdrag' : ''}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-teal-400 font-mono tracking-tight">{finalTotalToPay.toLocaleString()} kr</span>
                </div>
              </div>
            </div>

            {/* FOOTER VILLKOR */}
            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-[9px] text-slate-500">
              <div>
                <p className="font-bold text-slate-700">Betalningsvillkor: 10 dagar netto</p>
                <p>Godkänd för F-skatt</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-700">Bankgiro: {bankgiro}</p>
                <p>Momsreg.nr: {vatNo}</p>
              </div>
            </div>

          </section>

        </div>
      )}

      {/* 🗂️ FLIK 2: OFFERT-HISTORIK */}
      {activeTab === 'historik' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-3xl mx-auto text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">🗂️ Sparade Offerter</h2>
              <p className="text-[11px] text-slate-400">Alla dina skapade offerter sparade säkert i mobilen.</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-teal-400 font-bold rounded-lg text-xs">{savedQuotes.length} st</span>
          </div>

          {savedQuotes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <span className="text-3xl block">📑</span>
              <p>Inga sparade offerter ännu. Skapa din första i fliken "Skapa Offert"!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {savedQuotes.map((q) => (
                <div key={q.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-slate-700 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-teal-400 font-mono">{q.number}</span>
                      <span className="text-[10px] text-slate-500">• {q.date}</span>
                    </div>
                    <p className="font-bold text-white text-sm">{q.customerName}</p>
                    <p className="text-[11px] text-slate-400">{q.jobTitle} ({q.laborHours}h)</p>
                  </div>
                  <div className="text-right space-y-1.5">
                    <span className="font-black text-teal-300 text-base block font-mono">{q.totalAmount.toLocaleString()} kr</span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-block ${q.status === 'Vunnen' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'}`}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 👥 FLIK 3: KUNDREGISTER */}
      {activeTab === 'kunder' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-3xl mx-auto text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">👥 Kundregister</h2>
              <p className="text-[11px] text-slate-400">Klicka på en kund för att blixtsnabbt fylla i en ny offert.</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-800 text-teal-400 font-bold rounded-lg text-xs">{savedCustomers.length} kunder</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedCustomers.map((c) => (
              <div key={c.id} onClick={() => selectCustomerFromRegister(c)} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-teal-500/50 cursor-pointer transition space-y-1.5 group">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-white text-sm group-hover:text-teal-300 transition">{c.name}</p>
                  <span className="text-[10px] text-teal-400">Välj →</span>
                </div>
                <p className="text-slate-400 text-[11px]">{c.address}</p>
                <p className="text-slate-400 text-[11px]">📞 {c.phone}</p>
                <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-900 flex justify-between">
                  <span>Personnr: {c.ssn || 'Ej angivet'}</span>
                  <span>{c.propertyId}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 📦 FLIK 4: MATERIALBANK & KVITTOSCANNER */}
      {activeTab === 'material' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-3xl mx-auto text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white">📦 Materialbank & Kvittoscanner</h2>
              <p className="text-[11px] text-slate-400">Fota kvitton eller bygg upp din standard-prislista.</p>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black shadow-lg active:scale-95 transition flex items-center gap-1.5">
              📷 <span>Skanna Kvitto</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleReceiptScan} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {materialBank.map((item) => (
              <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest">{item.category}</span>
                  <p className="font-bold text-white text-sm">{item.name}</p>
                  <p className="text-[11px] text-slate-400">Inköpspris: <span className="text-slate-200 font-mono">{item.costPrice} kr</span> /{item.unit} exkl. moms</p>
                </div>
                <button onClick={() => addMaterialFromBank(item)} className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold rounded-lg text-xs">
                  + Lägg till
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 📊 FLIK 5: JÄMFÖR-SIDA (SÄLJARGUMENT / BILAGA) */}
      {activeTab === 'jamfor' && (
        <section className="bg-white text-slate-950 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto space-y-5 print:shadow-none print:p-0">
          <div className="text-center space-y-1">
            <span className="text-xs font-black tracking-widest text-teal-700 uppercase">{companyName}</span>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">Varför välja oss framför andra?</h2>
            <p className="text-xs text-slate-500">En ärlig jämförelse av kvalitet, trygghet och dolda kostnader.</p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Vad ingår i jobbet?</th>
                  <th className="p-3 text-emerald-800 bg-emerald-50/80 font-black">{companyName}</th>
                  <th className="p-3 text-slate-500">Andra aktörer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="p-3 font-bold">Fast pris & Inga dolda avgifter</td>
                  <td className="p-3 text-emerald-700 bg-emerald-50/30 font-bold">✅ Ja, allt ingår</td>
                  <td className="p-3 text-red-600">❌ Dolda milersättningar</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Nöjd-Kund-Garanti & Besiktning</td>
                  <td className="p-3 text-emerald-700 bg-emerald-50/30 font-bold">✅ 5 Års Garanti</td>
                  <td className="p-3 text-amber-600">⚠️ Oftast bara 1 år</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">F-skatt & ROT-avdrag direkt</td>
                  <td className="p-3 text-emerald-700 bg-emerald-50/30 font-bold">✅ Direkt på fakturan</td>
                  <td className="p-3 text-emerald-700">✅ Ja</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Städning & Bortforsling av avfall</td>
                  <td className="p-3 text-emerald-700 bg-emerald-50/30 font-bold">✅ Ingår alltid</td>
                  <td className="p-3 text-red-600">❌ Tillkommer ofta</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold">Ansvarsförsäkring</td>
                  <td className="p-3 text-emerald-700 bg-emerald-50/30 font-bold">✅ Upp till 10 Mkr (Trygg-Hansa)</td>
                  <td className="p-3 text-amber-600">⚠️ Varierande coverage</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center pt-2 print:hidden">
            <button onClick={() => window.print()} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-lg transition">
              🖨️ Skriv ut Jämförelse-bilaga
            </button>
          </div>
        </section>
      )}

      {/* 🏢 FLIK 6: MITT FÖRETAG (PROFIL & INSTÄLLNINGAR) */}
      {activeTab === 'foretag' && (
        <section className="bg-slate-900 p-5 rounded-2xl border border-slate-800 max-w-xl mx-auto space-y-4 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white">🏢 Företagsprofil & Inställningar</h2>
            <p className="text-[11px] text-slate-400">Uppgifterna som visas överst på alla dina PDF-offerter.</p>
          </div>

          <form onSubmit={handleSaveCompanyProfile} className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">Företagsnamn</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Org.nummer</label>
                <input type="text" value={orgNo} onChange={(e) => setOrgNo(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Momsreg.nr (VAT)</label>
                <input type="text" value={vatNo} onChange={(e) => setVatNo(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Bankgiro / Plusgiro</label>
                <input type="text" value={bankgiro} onChange={(e) => setBankgiro(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Standard Timpris (exkl. moms)</label>
                <input type="number" value={defaultHourlyRate} onChange={(e) => setDefaultHourlyRate(Number(e.target.value))} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Adress</label>
              <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">E-post</label>
                <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Telefon</label>
                <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-medium" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black rounded-xl transition mt-2">
              Spara Ändringar
            </button>
          </form>
        </section>
      )}

    </main>
  );
}
