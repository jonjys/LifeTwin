// app/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';

type Tab = 'offert' | 'historik' | 'jamfor';

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

  // Företagsprofil (Låst till företaget)
  const [companyName, setCompanyName] = useState<string>('Tullinge Bygg AB');
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [companyEmail, setCompanyEmail] = useState<string>('kontakt@tullingebygg.se');
  const [companyPhone, setCompanyPhone] = useState<string>('070-123 45 67');

  // Offert Kalkylator
  const [customerNameInput, setCustomerNameInput] = useState<string>('Anna Andersson');
  const [customerPhoneInput, setCustomerPhoneInput] = useState<string>('070-987 65 43');
  const [jobTitle, setJobTitle] = useState<string>('Måleriarbete & Ytbehandling');
  const [materialDescription, setMaterialDescription] = useState<string>('Väggfärg Glans 7, Primer & Spackel');
  const [sqm, setSqm] = useState<number>(100);
  const [hoursPerSqm, setHoursPerSqm] = useState<number>(0.4);
  const [materialPerSqm, setMaterialPerSqm] = useState<number>(180);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);
  const [riskMargin, setRiskMargin] = useState<number>(0);

  // Parser text & fil
  const [pasteText, setPasteText] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Jämförelse-matris
  const [comparisonPoints] = useState<ComparisonPoint[]>([
    { id: '1', feature: 'Fast pris & Inga dolda avgifter', us: '✅ Ja, allt ingår', competitors: '❌ Dolda milersättningar' },
    { id: '2', feature: 'Nöjd-Kund-Garanti & Besiktning', us: '✅ 5 Års Garanti', competitors: '⚠️ Ofta bara 1 år' },
    { id: '3', feature: 'Godkänd för F-skatt & ROT-avdrag', us: '✅ Direkt på fakturan', competitors: '✅ Ja' },
    { id: '4', feature: 'Städning & Bortforsling av avfall', us: '✅ Ingår alltid', competitors: '❌ Tillkommer ofta' },
    { id: '5', feature: 'Ansvarsförsäkring (Trygg-Hansa)', us: '✅ Upp till 10 Mkr', competitors: '⚠️ Varierande' },
  ]);

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
      alert('Vänligen ange företagsnamn.');
      return;
    }
    localStorage.setItem('offertai_onboarded', 'true');
    localStorage.setItem('offertai_company', companyName);
    localStorage.setItem('offertai_rate', hourlyRate.toString());
    localStorage.setItem('offertai_email', companyEmail);
    localStorage.setItem('offertai_phone', companyPhone);
    setIsOnboarded(true);
  };

  // Beräkningar för komplett offert
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

  // 1. VÄLKOMMENSIDA / ONBOARDING ("Gör detta 1 gång")
  if (!isOnboarded) {
    return (
      <main className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4 antialiased selection:bg-teal-500/30">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-md w-full bg-slate-900/90 border border-teal-500/30 backdrop-blur-2xl p-7 rounded-3xl shadow-2xl space-y-6">
          <div className="flex justify-center">
            <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold uppercase tracking-widest px-3.5 py-1 rounded-full">
              🔒 Gör detta 1 gång – Spara för alltid
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-teal-500/20 mx-auto">
              ⚡
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Ställ in ditt Företag</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ange dina företagsuppgifter. Appen sparar din branding och låser sig helt till ert företag.
            </p>
          </div>

          <div className="space-y-4 text-xs pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Företagsnamn *</label>
              <input
                type="text"
                placeholder="Ex: Tullinge Bygg AB"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-teal-500 outline-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Standard Timpris (kr/h)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-teal-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefon</label>
                <input
                  type="text"
                  placeholder="070-000 00 00"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">E-postadress</label>
              <input
                type="email"
                placeholder="kontakt@foretag.se"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:border-teal-500 outline-none"
              />
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-teal-500/20 transition active:scale-[0.98] text-sm mt-2 flex items-center justify-center gap-2"
            >
              <span>🚀 Spara & Lås Appen Till Mitt Företag</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. HUVUDAPP (SNYGG OCH REN LAYOUT)
  return (
    <main className="min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 sm:p-6 md:p-8 antialiased selection:bg-teal-500/30">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

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
                Offert & Företagssystem
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setActiveTab('offert')}
              className={`px-3.5 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 ${
                activeTab === 'offert'
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡</span> Skapa Offert
            </button>
            <button
              onClick={() => setActiveTab('jamfor')}
              className={`px-3.5 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 ${
                activeTab === 'jamfor'
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>📊</span> Jämför-Sida
            </button>
          </div>

          {/* HAMBURGER DROPDOWN */}
          {menuOpen && (
            <div className="absolute top-14 left-0 w-72 bg-slate-900/95 border border-slate-800 backdrop-blur-2xl rounded-2xl shadow-2xl p-3 z-50 space-y-1">
              <div className="p-3 border-b border-slate-800/80 mb-1">
                <span className="text-xs font-black text-white block">{companyName}</span>
                <span className="text-[10px] text-teal-400 font-semibold block">{companyEmail}</span>
              </div>
              <button
                onClick={() => { setActiveTab('offert'); setMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition"
              >
                <span>⚡</span> Skapa Ny Offert
              </button>
              <button
                onClick={() => { setActiveTab('jamfor'); setMenuOpen(false); }}
                className="w-full text-left p-2.5 rounded-lg text-xs font-semibold hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition"
              >
                <span>📊</span> Varför Välja Oss (Jämför-Sida)
              </button>
              <button
                onClick={() => {
                  if (confirm('Vill du återställa företagets inställningar och köra onboarding igen?')) {
                    localStorage.removeItem('offertai_onboarded');
                    setIsOnboarded(false);
                  }
                }}
                className="w-full text-left p-2.5 rounded-xl text-xs font-semibold hover:bg-rose-950/40 text-rose-400 flex items-center gap-2 transition"
              >
                <span>⚙️</span> Ändra Företagsuppgifter
              </button>
            </div>
          )}
        </header>

        {/* TAB 1: OFFERT */}
        {activeTab === 'offert' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* KALKYLATOR & REGLAGE (VÄNSTERPANEL) */}
            <section className="lg:col-span-5 bg-slate-900/70 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-2xl print:hidden space-y-5">
              
              {/* KUNDUPPGIFTER */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Kundinformation
                </span>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Kundens Namn</label>
                    <input
                      type="text"
                      value={customerNameInput}
                      onChange={(e) => setCustomerNameInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Telefon</label>
                    <input
                      type="text"
                      value={customerPhoneInput}
                      onChange={(e) => setCustomerPhoneInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* UPPDRAG & SCHABLONER */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Uppdrag & Material
                </span>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Projekt Rubrik</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">Materialbeskrivning</label>
                  <input
                    type="text"
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Yta (m²)</label>
                    <input
                      type="number"
                      value={sqm}
                      onChange={(e) => setSqm(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Timpris (kr/h)</label>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:border-teal-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Material (kr/m²)</label>
                    <input
                      type="number"
                      value={materialPerSqm}
                      onChange={(e) => setMaterialPerSqm(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Tid (h/m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={hoursPerSqm}
                      onChange={(e) => setHoursPerSqm(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SVÅRIGHETSREGLAGE */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-indigo-500/30 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-300">🎯 Svårighet & Marginal</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    riskMargin > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {riskMargin > 0 ? `+${riskMargin}% Påslag` : `${riskMargin}% Rabatt`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  step="5"
                  value={riskMargin}
                  onChange={(e) => setRiskMargin(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
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
                  Inkludera ROT-avdrag (30 % på arbete)
                </label>
              </div>

              {/* KNAPPAR */}
              <button
                onClick={() => window.print()}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 transition flex items-center justify-center gap-2 active:scale-[0.99] text-xs"
              >
                <span>🖨️ Generera Offert PDF</span>
              </button>
            </section>

            {/* FULLSTÄNDIG OFFERTMALL PREVIEW (HÖGERPANEL) */}
            <section className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full space-y-6">
              
              {/* LOGO & DATED HEADER */}
              <div className="border-b border-slate-200 pb-5 flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-teal-700 uppercase tracking-widest block">
                    {companyName}
                  </span>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">OFFERT</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Datum: {new Date().toLocaleDateString('sv-SE')} • Giltig i 30 dagar
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-600 block">{companyEmail}</span>
                  <span className="text-[11px] font-bold text-slate-600 block">{companyPhone}</span>
                  <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mt-1">
                    Godkänd för F-skatt
                  </span>
                </div>
              </div>

              {/* KUND & PROJEKTRUBRIK */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Beställare</span>
                  <p className="font-extrabold text-slate-900">{customerNameInput}</p>
                  <p className="text-slate-500">{customerPhoneInput}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Projekt titeln</span>
                  <p className="font-extrabold text-slate-900">{jobTitle}</p>
                  <p className="text-slate-500">Omfattning: {sqm} m²</p>
                </div>
              </div>

              {/* FULLSTÄNDIG SPECS-TABELL */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 font-bold">Beskrivning & Specifikation</th>
                      <th className="py-2.5 text-right font-bold">Belopp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-3.5">
                        <span className="font-extrabold text-slate-900 block">Arbetstid & Utförande</span>
                        <span className="text-[11px] text-slate-500">
                          {laborHours} timmar à {effectiveHourlyRate} kr/h
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-900 text-sm">{laborCost.toLocaleString()} kr</td>
                    </tr>
                    <tr>
                      <td className="py-3.5">
                        <span className="font-extrabold text-slate-900 block">Material & Tillbehör</span>
                        <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                          📦 {materialDescription}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({materialPerSqm} kr/m² inkl. {materialMarkup}% påslag)
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-900 text-sm">{materialCost.toLocaleString()} kr</td>
                    </tr>
                    <tr className="font-bold text-slate-900 bg-slate-50">
                      <td className="py-3 px-2">Totalt exkl. ROT-avdrag</td>
                      <td className="py-3 px-2 text-right text-sm">{totalBeforeRot.toLocaleString()} kr</td>
                    </tr>
                    {includeRot && (
                      <tr className="text-emerald-700 font-bold bg-emerald-50/70">
                        <td className="py-3 px-2">ROT-avdrag (30 % av arbetskostnad)</td>
                        <td className="py-3 px-2 text-right text-sm">-{rotDeduction.toLocaleString()} kr</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TOTALT ATT BETALA (STYLED CARD) */}
              <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-xl print:bg-transparent print:text-slate-950 print:border-t-2 print:border-slate-950 print:rounded-none">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block uppercase tracking-wider print:text-slate-600">
                      Totalt att betala
                    </span>
                    <span className="text-[10px] text-slate-400 print:hidden">Inkl. moms & ROT-avdrag</span>
                  </div>
                  <span className="text-3xl font-black text-teal-400 print:text-slate-950">
                    {totalToPay.toLocaleString()} kr
                  </span>
                </div>
              </div>

              {/* FOOTER */}
              <footer className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center flex justify-between items-center">
                <span>Utfärdad av: {companyName}</span>
                <span>Innehar F-skattsedel</span>
              </footer>

            </section>
          </div>
        )}

        {/* TAB 2: JÄMFÖR / VARFÖR VÄLJA OSS */}
        {activeTab === 'jamfor' && (
          <div className="space-y-6">
            <section className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl print:p-0 print:shadow-none">
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

      </div>
    </main>
  );
}
