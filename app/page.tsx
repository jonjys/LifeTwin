// app/page.tsx
'use client';

import React, { useState } from 'react';

type JobType = 'målning' | 'takbyte' | 'fasad' | 'anpassad';

export default function Home() {
  const [jobType, setJobType] = useState<JobType>('målning');
  const [sqm, setSqm] = useState<number>(100);
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [hoursPerSqm, setHoursPerSqm] = useState<number>(0.4);
  const [materialPerSqm, setMaterialPerSqm] = useState<number>(180);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);

  const handleJobTypeChange = (type: JobType) => {
    setJobType(type);
    if (type === 'målning') {
      setHoursPerSqm(0.4);
      setMaterialPerSqm(180);
    } else if (type === 'takbyte') {
      setHoursPerSqm(0.6);
      setMaterialPerSqm(350);
    } else if (type === 'fasad') {
      setHoursPerSqm(0.5);
      setMaterialPerSqm(220);
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
      {/* Background Subtle Glow Accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER (Print hidden) */}
        <header className="flex justify-between items-center pb-4 border-b border-slate-800/80 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-lg shadow-teal-500/20">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OffertAI
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 block -mt-1">
                LifeTwin Pro
              </span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800 backdrop-blur-md">
            v0.1 Live Engine
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* CONTROL PANEL / INPUT FORM (Print hidden) */}
          <section className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl p-5 rounded-2xl border border-slate-800 shadow-2xl print:hidden space-y-4">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Kalkylera Pris & Offert</h1>
              <p className="text-xs text-slate-400">Justera mått och priser direkt för snabb offert.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Arbetstyp</label>
                <select
                  value={jobType}
                  onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
                >
                  <option value="målning">Målning (0.4 h/m² • 180 kr mat)</option>
                  <option value="takbyte">Takbyte (0.6 h/m² • 350 kr mat)</option>
                  <option value="fasad">Fasad / Vägg (0.5 h/m² • 220 kr mat)</option>
                  <option value="anpassad">Custom Schablon</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Yta (m²)</label>
                  <input
                    type="number"
                    value={sqm}
                    onChange={(e) => setSqm(Math.max(1, Number(e.target.value)))}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Timpris (kr/h)</label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 font-medium focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400/90 block">
                  Material & Schabloner
                </span>
                
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

                <div>
                  <label className="block text-[11px] text-slate-400 mb-0.5">Påslag (%)</label>
                  <input
                    type="number"
                    value={materialMarkup}
                    onChange={(e) => setMaterialMarkup(Number(e.target.value))}
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-teal-500"
                  />
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

          {/* PREVIEW & PRINT DOCUMENT AREA */}
          <section className="lg:col-span-7 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full">
            <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">OFFERT</h2>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full print:hidden">
                    Klar för kund
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Datum: {new Date().toLocaleDateString('sv-SE')} • Giltig 30 dagar
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  LifeTwin
                </span>
              </div>
            </div>

            <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <h3 className="font-bold text-base text-slate-900 capitalize">{jobType}</h3>
              <p className="text-xs text-slate-600">Beräknat underlag på totalt <strong className="text-slate-900">{sqm} m²</strong>.</p>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider">
                    <th className="py-2 font-bold">Post</th>
                    <th className="py-2 text-right font-bold">Belopp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 block">Arbetstid & Utförande</span>
                      <span className="text-[11px] text-slate-500">{laborHours} h à {hourlyRate} kr/h ({hoursPerSqm} h/m²)</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{laborCost.toLocaleString()} kr</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      <span className="font-semibold text-slate-900 block">Material & Tillbehör</span>
                      <span className="text-[11px] text-slate-500">{materialPerSqm} kr/m² inkl. {materialMarkup}% påslag</span>
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{materialCost.toLocaleString()} kr</td>
                  </tr>
                  <tr className="font-bold text-slate-900 bg-slate-100/60">
                    <td className="py-2.5 px-2">Totalt exkl. ROT</td>
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

            <div className="bg-slate-950 text-white p-4 rounded-xl shadow-inner print:bg-transparent print:text-slate-950 print:border-t-2 print:border-slate-950 print:rounded-none">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block uppercase tracking-wider print:text-slate-600">Totalt att betala</span>
                  <span className="text-[10px] text-slate-500 print:hidden">Inkl. moms & eventuellt ROT</span>
                </div>
                <span className="text-2xl font-black text-teal-400 print:text-slate-950">
                  {totalToPay.toLocaleString()} kr
                </span>
              </div>
            </div>

            <footer className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center flex justify-between items-center">
              <span>Godkänd för F-skatt</span>
              <span>OffertAI av LifeTwin</span>
            </footer>
          </section>

        </div>
      </div>
    </main>
  );
}
