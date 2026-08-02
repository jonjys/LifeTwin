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

  // När man byter jobbgrupp fyller vi i förslag, men användaren kan ändra allt själv!
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
    <main className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* INPUT-FORMULÄR (Ljus bakgrund med hög kontrast) */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-300 print:hidden">
          <h1 className="text-2xl font-bold mb-1 text-slate-900">OffertAI</h1>
          <p className="text-sm text-slate-600 mb-6">Skapa anpassade offerter snabbt & enkelt.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Typ av arbete</label>
              <select
                value={jobType}
                onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
                className="w-full p-3 border border-slate-400 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="målning">Målning</option>
                <option value="takbyte">Takbyte</option>
                <option value="fasad">Fasad / Vägg</option>
                <option value="anpassad">Egna inställningar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Yta (m²)</label>
                <input
                  type="number"
                  value={sqm}
                  onChange={(e) => setSqm(Math.max(1, Number(e.target.value)))}
                  className="w-full p-3 border border-slate-400 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Timpris (kr/h)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-3 border border-slate-400 rounded-lg bg-white text-slate-900 font-medium focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            {/* ANPASSADE PRISER OCH SCHABLONER */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Dina material & tidsvärden</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material pris/m² (kr)</label>
                  <input
                    type="number"
                    value={materialPerSqm}
                    onChange={(e) => setMaterialPerSqm(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tid/m² (timmar)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hoursPerSqm}
                    onChange={(e) => setHoursPerSqm(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Materialpåslag (%)</label>
                <input
                  type="number"
                  value={materialMarkup}
                  onChange={(e) => setMaterialMarkup(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="rot"
                checked={includeRot}
                onChange={(e) => setIncludeRot(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-400 focus:ring-blue-500"
              />
              <label htmlFor="rot" className="text-sm font-bold text-slate-800 cursor-pointer">
                Räkna med ROT-avdrag (30 % på arbetet)
              </label>
            </div>

            <button
              onClick={handlePrint}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>🖨️ Skriv ut / Spara PDF</span>
            </button>
          </div>
        </div>

        {/* OFFERTMALL (Vit bakgrund med skarp svart text) */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-300 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">OFFERT</h2>
              <p className="text-xs text-slate-500">Datum: {new Date().toLocaleDateString('sv-SE')}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full print:hidden">
                Förhandsgranskning
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-xl text-slate-900 capitalize">{jobType}</h3>
            <p className="text-sm text-slate-600">Specifikation för totalt {sqm} m² yta.</p>
          </div>

          <table className="w-full text-left text-sm mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-700">
                <th className="py-2 font-bold">Beskrivning</th>
                <th className="py-2 text-right font-bold">Belopp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              <tr>
                <td className="py-3 font-medium">
                  Arbetskostnad ({laborHours} h à {hourlyRate} kr/h)
                </td>
                <td className="py-3 text-right font-bold text-slate-900">{laborCost.toLocaleString()} kr</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">
                  Materialkostnad ({materialPerSqm} kr/m² inkl. {materialMarkup}% påslag)
                </td>
                <td className="py-3 text-right font-bold text-slate-900">{materialCost.toLocaleString()} kr</td>
              </tr>
              <tr className="font-bold text-slate-900 bg-slate-50">
                <td className="py-3 px-2">Totalt före avdrag</td>
                <td className="py-3 px-2 text-right">{totalBeforeRot.toLocaleString()} kr</td>
              </tr>
              {includeRot && (
                <tr className="text-emerald-800 font-bold bg-emerald-50">
                  <td className="py-3 px-2">ROT-avdrag (30 % på arbetskostnad)</td>
                  <td className="py-3 px-2 text-right">-{rotDeduction.toLocaleString()} kr</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-slate-900 text-white p-5 rounded-lg shadow-sm print:bg-transparent print:text-slate-900 print:border-t-2 print:border-slate-900 print:rounded-none">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Totalt att betala (inkl. moms):</span>
              <span className="text-2xl font-black text-emerald-400 print:text-slate-900">
                {totalToPay.toLocaleString()} kr
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-400 text-center">
            Offert genererad med OffertAI • Giltig i 30 dagar
          </div>
        </div>

      </div>
    </main>
  );
}
