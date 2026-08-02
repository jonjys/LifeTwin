// app/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';

type Tab = 'offert' | 'historik' | 'jamfor' | 'profil';

interface ComparisonPoint {
  id: string;
  feature: string;
  us: string | boolean;
  competitors: string | boolean;
}

interface SavedQuote {
  id: string;
  date: string;
  customerName: string;
  jobTitle: string;
  totalToPay: number;
  status: 'Skickad' | 'Godkänd' | 'Behöver följas upp';
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('offert');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

  // Företagsprofil
  const [companyName, setCompanyName] = useState<string>('Ditt Företag AB');
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [companyEmail, setCompanyEmail] = useState<string>('');
  const [companyPhone, setCompanyPhone] = useState<string>('');

  // Offert Kalkylator
  const [customerNameInput, setCustomerNameInput] = useState<string>('Anna Andersson');
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('070-123 45 67');
  const [jobTitle, setJobTitle] = useState<string>('Måleriarbete Innervägg');
  const [materialDescription, setMaterialDescription] = useState<string>('Väggfärg Glans 7, Primer & Spackel');
  const [sqm, setSqm] = useState<number>(100);
  const [hoursPerSqm, setHoursPerSqm] = useState<number>(0.4);
  const [materialPerSqm, setMaterialPerSqm] = useState<number>(180);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);
  const [riskMargin, setRiskMargin] = useState<number>(0);

  // Jämförelse-matris (Förinställd med starka säljargument)
  const [comparisonPoints, setComparisonPoints] = useState<ComparisonPoint[]>([
    { id: '1', feature: 'Fast pris & Inga dolda avgifter', us: '✅ Ja, allt ingår', competitors: '❌ Dolda milersättningar' },
    { id: '2', feature: 'Nöjd-Kund-Garanti & Besiktning', us: '✅ 5 Års Garanti', competitors: '⚠️ Ofta bara 1 år' },
    { id: '3', feature: 'Godkänd för F-skatt & ROT-avdrag', us: '✅ Direkt på fakturan', competitors: '✅ Ja' },
    { id: '4', feature: 'Städning & Bortforsling av avfall', us: '✅ Ingår alltid', competitors: '❌ Tillkommer ofta' },
    { id: '5', feature: 'Ansvarsförsäkring (Trygg-Hansa)', us: '✅ Upp till 10 Mkr', competitors: '⚠️ Varierande' },
  ]);

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    const onboarded = localStorage.getItem('offertai_onboarded');
    const name = localStorage.getItem('offertai_company');
    const rate = localStorage.getItem('offertai_rate');
    const email = localStorage.getItem('offertai_email');
    const phone = localStorage.getItem('offertai_phone');
    if (onboarded === 'true') {
      setIsOnboarded(true);
      if (name) setCompanyName(name);
      if (rate) setHourlyRate(Number(rate));
      if (email) setCompanyEmail(email);
      if (phone) setCompanyPhone(phone);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    if (!companyName.trim()) {
      alert('Vänligen ange ditt företagsnamn.');
      return;
    }
    localStorage.setItem('offertai_onboarded', 'true');
    localStorage.setItem('offertai_company', companyName);
    localStorage.setItem('offertai_rate', hourlyRate.toString());
    localStorage.setItem('offertai_email', companyEmail);
    localStorage.setItem('offertai_phone', companyPhone);
    setIsOnboarded(true);
  };

  // Beräkningar
  const marginMultiplier = 1 + riskMargin / 100;
  const baseLaborHours = Math.ceil(sqm * hoursPerSqm);
  const laborHours = Math.ceil(baseLaborHours * (riskMargin > 0 ? (1 + (riskMargin * 0.5) / 100) : 1));
  const effectiveHourlyRate = Math.round(hourlyRate * (riskMargin > 0 ? (1 + (riskMargin * 0.5) / 100) : marginMultiplier));
  const laborCost = laborHours * effectiveHourlyRate;
  const rawMaterial = sqm * materialPerSqm;
  const materialCost = Math.ceil(rawMaterial * (1 + materialMarkup / 100));
  const totalBeforeRot = laborCost + materialCost;
  const rotDeduction = includeRot ? Math.round(laborCost * 0.3) : 0;
  const totalToPay = totalBeforeRot - rotDeduction;

  // 1. TYDLIG VÄLKOMMENSIDA / ONBOARDING ("GÖR DETTA 1 GÅNG")
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-teal-500/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Tydlig "Gör detta 1 gång"-tagg */}
          <div className="flex justify-center">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-inner flex items-center gap-1.5">
              <span>🔒</span> Gör detta 1 gång – Spara för alltid
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-2xl shadow-xl shadow-teal-500/20 mx-auto">
              ⚡
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">Ställ in ditt Företag</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fyll i dina grunduppgifter en enda gång. Appen sparar dina priser och branding så att den fungerar som din helt egna företags-app varje gång du öppnar den!
            </p>
          </div>

          <div className="space-y-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ditt Företagsnamn *</label>
              <input
                type="text"
                placeholder="Ex: Malmö Måleri AB"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none text-sm shadow-inner"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Standard Timpris (kr/h)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none shadow-inner"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefonnummer</label>
                <input
                  type="text"
                  placeholder="070-000 00 00"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-post (på offerter)</label>
              <input
                type="email"
                placeholder="kontakt@foretag.se"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none shadow-inner"
              />
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-teal-500/20 transition duration-200 active:scale-[0.98] text-sm mt-3 flex items-center justify-center gap-2"
            >
              <span>🚀 Spara & Lås Appen Till Mitt Företag</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center italic">
              Du kan när som helst ändra dina uppgifter under "Min Profil" i menyn senare.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // 2. HUVUDAPP MED HAMBURGERMENY (☰)
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-3 md:p-8 antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* TOP BAR / HAMBURGER-MENY */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-800 relative print:hidden">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-teal-400 font-bold active:scale-95 transition"
            >
              ☰
            </button>
            <div>
              <span className="font-extrabold text-base text-white block">{companyName}</span>
              <span className="text-[10px] font-semibold uppercase text-teal-400 block -mt-1">Offert & Företags-System</span>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('offert')}
              className={`px-3 py-1.5 font-semibold rounded-lg border transition ${
                activeTab === 'offert' ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              ⚡ Offert
            </button>
            <button
              onClick={() => setActiveTab('jamfor')}
              className={`px-3 py-1.5 font-semibold rounded-lg border transition ${
                activeTab === 'jamfor' ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              📊 Jämför-Sida
            </button>
          </div>

          {/* MENY DROPDOWN */}
          {menuOpen && (
            <div className="absolute top-14 left-0 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 space-y-1 backdrop-blur-xl">
              <div className="p-2 border-b border-slate-800 mb-1">
                <span className="text-xs font-bold text-white block">{companyName}</span>
                <span className="text-[10px] text-teal-400 font-medium block">Inloggad & Sparad</span>
              </div>
              <button
                onClick={() => { setActiveTab('offert'); setMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 flex items-center gap-2"
              >
                <span>⚡</span> Skapa Offert
              </button>
              <button
                onClick={() => { setActiveTab('jamfor'); setMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 flex items-center gap-2"
              >
                <span>📊</span> Varför Välja Oss (Jämför)
              </button>
              <button
                onClick={() => {
                  if (confirm('Vill du återställa företagets inställningar och köra onboarding igen?')) {
                    localStorage.removeItem('offertai_onboarded');
                    setIsOnboarded(false);
                  }
                }}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold hover:bg-rose-950/40 text-rose-400 flex items-center gap-2"
              >
                <span>⚙️</span> Ändra Företagsuppgifter
              </button>
            </div>
          )}
        </header>

        {/* TAB 1: OFFERT */}
        {activeTab === 'offert' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-5 bg-slate-900/70 p-5 rounded-2xl border border-slate-800 print:hidden space-y-4">
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Kundens Namn</label>
                  <input
                    type="text"
                    value={customerNameInput}
                    onChange={(e) => setCustomerNameInput(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">Yta (m²)</label>
                    <input
                      type="number"
                      value={sqm}
                      onChange={(e) => setSqm(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Timpris (kr/h)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
                    />
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition"
                >
                  🖨️ Skriv ut / Spara PDF
                </button>
              </div>
            </section>

            {/* PREVIEW OFFERT */}
            <section className="lg:col-span-7 bg-white text-slate-900 p-6 rounded-2xl shadow-2xl print:p-0 print:shadow-none">
              <div className="border-b pb-4 mb-4 flex justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-700 block uppercase">{companyName}</span>
                  <h2 className="text-2xl font-black">OFFERT</h2>
                  <p className="text-xs text-slate-500">Kund: {customerNameInput}</p>
                </div>
              </div>
              <div className="bg-slate-950 text-white p-4 rounded-xl flex justify-between items-center print:bg-transparent print:text-slate-950">
                <span className="text-xs text-slate-400">Totalt att betala</span>
                <span className="text-2xl font-black text-teal-400 print:text-slate-950">{totalToPay.toLocaleString()} kr</span>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: JÄMFÖR / "VARFÖR VÄLJA OSS" */}
        {activeTab === 'jamfor' && (
          <div className="space-y-6">
            <section className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl print:p-0 print:shadow-none">
              <div className="text-center border-b pb-4 mb-6">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-widest block">{companyName}</span>
                <h2 className="text-2xl font-black text-slate-950 mt-1">Varför välja oss framför andra?</h2>
                <p className="text-xs text-slate-500 mt-1">En ärlig jämförelse av kvalitet, trygghet och dolda kostnader.</p>
              </div>

              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-700 uppercase">
                      <th className="py-3 font-bold w-1/2">Vad ingår i jobbet?</th>
                      <th className="py-3 text-center font-bold text-teal-700 bg-teal-50/80 rounded-t-lg w-1/4">{companyName}</th>
                      <th className="py-3 text-center font-bold text-slate-400 w-1/4">Andra Aktörer / Konkurrenter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonPoints.map((pt) => (
                      <tr key={pt.id}>
                        <td className="py-3 font-semibold text-slate-800">{pt.feature}</td>
                        <td className="py-3 text-center font-bold text-teal-800 bg-teal-50/50">{pt.us}</td>
                        <td className="py-3 text-center font-medium text-slate-500">{pt.competitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-center print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition text-xs"
                >
                  🖨️ Skriv ut Jämförelse-bilaga
                </button>
              </div>
            </section>
          </div>
        )}

      </div>
    </main>
  );
}
