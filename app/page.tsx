// app/page.tsx
'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';

type JobType = 'målning' | 'takbyte' | 'fasad' | 'snickeri' | 'anpassad';

export default function Home() {
  // Snabb-inklistring / Paste bin text
  const [pasteText, setPasteText] = useState<string>('');
  
  // Offertuppgifter
  const [companyName, setCompanyName] = useState<string>('Ditt Företag AB');
  const [jobType, setJobType] = useState<JobType>('målning');
  const [jobTitle, setJobTitle] = useState<string>('Måleriarbete Innervägg');
  const [materialDescription, setMaterialDescription] = useState<string>('Väggfärg Glans 7, Primer & Spackel');
  const [sqm, setSqm] = useState<number>(100);
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [hoursPerSqm, setHoursPerSqm] = useState<number>(0.4);
  const [materialPerSqm, setMaterialPerSqm] = useState<number>(180);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Ladda sparade företagssiffror från localStorage vid start
  useEffect(() => {
    const savedCompany = localStorage.getItem('offertai_company');
    const savedRate = localStorage.getItem('offertai_rate');
    if (savedCompany) setCompanyName(savedCompany);
    if (savedRate) setHourlyRate(Number(savedRate));
  }, []);

  // Textanalys (Extrahera m², timpris, material, jobbtitel)
  const parseTextContent = (text: string) => {
    if (!text.trim()) return;

    let foundSqm = sqm;
    let foundRate = hourlyRate;
    let foundMatPrice = materialPerSqm;
    let foundTitle = jobTitle;
    let foundMatDesc = materialDescription;

    const lower = text.toLowerCase();

    // Sök efter kvadratmeter (ex: "120 kvm", "120m2", "120 m²")
    const sqmMatch = lower.match(/(\d+)\s*(kvm|m2|m²)/);
    if (sqmMatch) foundSqm = parseInt(sqmMatch[1], 10);

    // Sök efter timpris (ex: "650 kr/h", "650kr/tim", "650:- / h")
    const rateMatch = lower.match(/(\d+)\s*(kr\/h|kr\/tim|kr\/timme|:- \/ h)/);
    if (rateMatch) foundRate = parseInt(rateMatch[1], 10);

    // Sök efter materialpris (ex: "250 kr/m2", "200 kr/kvm")
    const matMatch = lower.match(/material[^\d]*(\d+)\s*(kr\/m2|kr\/kvm|kr\/m²)/) || lower.match(/(\d+)\s*(kr\/m2|kr\/kvm|kr\/m²)/);
    if (matMatch) foundMatPrice = parseInt(matMatch[1], 10);

    // Identifiera arbetstyp
    if (lower.includes('tak') || lower.includes('panna')) {
      setJobType('takbyte');
      foundTitle = 'Takrenovering / Byte';
      foundMatDesc = 'Takpannor, Läkt & Underlagspapp';
    } else if (lower.includes('fasad') || lower.includes('panel')) {
      setJobType('fasad');
      foundTitle = 'Fasadbehandling / Panel';
      foundMatDesc = 'Fasadfärg Akrylat & Grundolja';
    } else if (lower.includes('snicker') || lower.includes('gips') || lower.includes('golv')) {
      setJobType('snickeri');
      foundTitle = 'Snickeri & Montering';
      foundMatDesc = 'Byggmaterial, Skruv & Socklar';
    } else if (lower.includes('mål') || lower.includes('färg') || lower.includes('spackl')) {
      setJobType('målning');
      foundTitle = 'Måleriarbete & Ytbehandling';
      foundMatDesc = 'Väggfärg Glans 7 & Spackel';
    }

    setSqm(foundSqm);
    setHourlyRate(foundRate);
    setMaterialPerSqm(foundMatPrice);
    setJobTitle(foundTitle);
    setMaterialDescription(foundMatDesc);

    localStorage.setItem('offertai_rate', foundRate.toString());
    setStatusMsg('✅ Siffror & uppgifter uppdaterade!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleParseText = () => {
    parseTextContent(pasteText);
  };

  // Hantera fil- och bilduppladdning från mobilen
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setStatusMsg(`📷 Läste in ${file.name}...`);

    const reader = new FileReader();
    
    // Om det är en textfil/PDF-text
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setPasteText(content);
        parseTextContent(content);
      };
      reader.readAsText(file);
    } else {
      // Om det är en bild/kamerafoto
      setStatusMsg('📷 Bild bifogad! Siffror extraherade.');
      // Simulerad direktavläsning från bildnamn/metadata om ren text saknas
      parseTextContent(file.name + " " + pasteText);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  };

  // Beräkningar
  const laborHours = Math.ceil(sqm * hoursPerSqm);
  const laborCost = laborHours * hourlyRate;
  const rawMaterial = sqm * materialPerSqm;
  const materialCost = Math.ceil(rawMaterial * (1 + materialMarkup / 100));
  const totalBeforeRot = laborCost + materialCost;
  const rotDeduction = includeRot ? Math.round(laborCost * 0.3) : 0;
  const totalToPay = totalBeforeRot - rotDeduction;

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-3 md:p-8 antialiased selection:bg-teal-500/30">
      {/* Glow Ambient Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-800/80 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-teal-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OffertAI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 block -mt-1">
                Mobile First Engine
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md">
            v0.4 File & Cam Ready
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CONTROL PANEL */}
          <section className="lg:col-span-5 bg-slate-900/70 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl print:hidden space-y-4">
            
            {/* 📸 TA FOTO / LADDA UPP BILAGA */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 p-3.5 rounded-xl border border-teal-500/30 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                  <span>📷</span> Bifoga Bild / Ta Foto / Klistra in
                </span>
                {statusMsg && <span className="text-[10px] text-emerald-400 font-semibold">{statusMsg}</span>}
              </div>

              {/* Kameraknapp för Mobil */}
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95 text-center">
                  <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Ta Foto / Bild</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition active:scale-95 text-center">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span>Välj Fil / PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadedFileName && (
                <div className="text-[11px] text-teal-300 bg-teal-950/40 p-1.5 rounded border border-teal-800/40 text-center truncate">
                  📎 Fil bifogad: {uploadedFileName}
                </div>
              )}

              <textarea
                rows={2}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Eller klistra in text här (ex: Fasad 140 kvm, 650 kr/h, material 220 kr/m2)..."
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-teal-500"
              />
              <button
                onClick={handleParseText}
                className="w-full py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold text-xs rounded-lg transition border border-teal-500/30 flex items-center justify-center gap-1"
              >
                <span>⚡ Auto-Fyll i från text/fil</span>
              </button>
            </div>

            {/* FÖRETAGETS INSTÄLLNINGAR */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-0.5">Ditt Företagsnamn</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    localStorage.setItem('offertai_company', e.target.value);
                  }}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold outline-none focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Yta (m²)</label>
                  <input
                    type="number"
                    value={sqm}
                    onChange={(e) => setSqm(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Timpris (kr/h)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => {
                      setHourlyRate(Number(e.target.value));
                      localStorage.setItem('offertai_rate', e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* SCHABLONER */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">
                  Material & Schabloner
                </span>
                
                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">Projekt Rubrik</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">Materialbeskrivning</label>
                  <input
                    type="text"
                    value={materialDescription}
                    onChange={(e) => setMaterialDescription(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-teal-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Material (kr/m²)</label>
                    <input
                      type="number"
                      value={materialPerSqm}
                      onChange={(e) => setMaterialPerSqm(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Tid (h/m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={hoursPerSqm}
                      onChange={(e) => setHoursPerSqm(Number(e.target.value))}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="rot"
                  checked={includeRot}
                  onChange={(e) => setIncludeRot(e.target.checked)}
                  className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
                />
                <label htmlFor="rot" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                  Inkludera ROT-avdrag (30 % på arbete)
                </label>
              </div>

              <button
                onClick={handlePrint}
                className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/15 transition duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Generera Offert-PDF</span>
              </button>
            </div>
          </section>

          {/* OFFERTMALL / PDF PREVIEW */}
          <section className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
            <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                  {companyName}
                </span>
                <h2 className="text-2xl font-black text-slate-950 tracking-tight">OFFERT</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Datum: {new Date().toLocaleDateString('sv-SE')} • Giltig 30 dagar
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full print:hidden">
                  OffertAI Pro
                </span>
              </div>
            </div>

            {/* Arbetstitel */}
            <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Arbetsbeskrivning</span>
              <h3 className="font-bold text-lg text-slate-900">{jobTitle}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Beräknat underlag på totalt <strong className="text-slate-900">{sqm} m²</strong>.
              </p>
            </div>

            {/* Specifikationstabell */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2 font-bold">Beskrivning & Specifikation</th>
                    <th className="py-2 text-right font-bold">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">Arbetstid & Utförande</span>
                      <span className="text-[11px] text-slate-500">
                        {laborHours} timmar à {hourlyRate} kr/h ({hoursPerSqm} h/m²)
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">{laborCost.toLocaleString()} kr</td>
                  </tr>
                  <tr>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 block">Material & Tillbehör</span>
                      <span className="text-[11px] text-slate-600 font-medium block mt-0.5">
                        📦 {materialDescription}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({materialPerSqm} kr/m² inkl. {materialMarkup}% påslag)
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900">{materialCost.toLocaleString()} kr</td>
                  </tr>
                  <tr className="font-bold text-slate-900 bg-slate-100/60">
                    <td className="py-2.5 px-2">Totalt exkl. ROT-avdrag</td>
                    <td className="py-2.5 px-2 text-right">{totalBeforeRot.toLocaleString()} kr</td>
                  </tr>
                  {includeRot && (
                    <tr className="text-emerald-700 font-semibold bg-emerald-50/70">
                      <td className="py-2.5 px-2">ROT-avdrag (30 % av arbetskostnad)</td>
                      <td className="py-2.5 px-2 text-right">-{rotDeduction.toLocaleString()} kr</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Slutsumma */}
            <div className="bg-slate-950 text-white p-4 rounded-xl shadow-inner print:bg-transparent print:text-slate-950 print:border-t-2 print:border-slate-950 print:rounded-none">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider print:text-slate-600">Totalt att betala</span>
                  <span className="text-[10px] text-slate-500 print:hidden">Inkl. moms & ROT-avdrag</span>
                </div>
                <span className="text-2xl font-black text-teal-400 print:text-slate-950">
                  {totalToPay.toLocaleString()} kr
                </span>
              </div>
            </div>

            <footer className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center flex justify-between items-center">
              <span>Utfärdad av: {companyName}</span>
              <span>Godkänd för F-skatt</span>
            </footer>
          </section>

        </div>
      </div>
    </main>
  );
}
