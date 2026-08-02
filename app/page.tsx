// app/page.tsx
'use client';

import React, { useState } from 'react';

type JobType = 'målning' | 'takbyte' | 'fasad';

interface CalculationResult {
  jobTitle: string;
  sqm: number;
  laborHours: number;
  laborCost: number;
  materialCost: number;
  rotDeduction: number;
  totalBeforeRot: number;
  totalToPay: number;
}

export default function Home() {
  const [jobType, setJobType] = useState<JobType>('målning');
  const [sqm, setSqm] = useState<number>(100);
  const [hourlyRate, setHourlyRate] = useState<number>(650);
  const [materialMarkup, setMaterialMarkup] = useState<number>(15);
  const [includeRot, setIncludeRot] = useState<boolean>(true);

  const calculateOffer = (): CalculationResult => {
    let hoursPerSqm = 0.4;
    let baseMaterialPerSqm = 180;
    let jobTitle = 'Måleriarbete';

    if (jobType === 'takbyte') {
      hoursPerSqm = 0.6;
      baseMaterialPerSqm = 350;
      jobTitle = 'Takbyte och renovering';
    } else if (jobType === 'fasad') {
      hoursPerSqm = 0.5;
      baseMaterialPerSqm = 220;
      jobTitle = 'Fasad- och väggbehandling';
    }

    const laborHours = Math.ceil(sqm * hoursPerSqm);
    const laborCost = laborHours * hourlyRate;
    
    const rawMaterial = sqm * baseMaterialPerSqm;
    const materialCost = Math.ceil(rawMaterial * (1 + materialMarkup / 100));
    
    const totalBeforeRot = laborCost + materialCost;
    const rotDeduction = includeRot ? Math.round(laborCost * 0.3) : 0;
    const totalToPay = totalBeforeRot - rotDeduction;

    return {
      jobTitle,
      sqm,
      laborHours,
      laborCost,
      materialCost,
      rotDeduction,
      totalBeforeRot,
      totalToPay,
    };
  };

  const result = calculateOffer();

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FORMULÄR */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
          <h1 className="text-2xl font-bold mb-1 text-slate-800">OffertAI</h1>
          <p className="text-sm text-slate-500 mb-6">Skapa professionell offert på under 60 sekunder.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Typ av arbete</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="målning">Målning (0.4 h/m², 180 kr mat/m²)</option>
                <option value="takbyte">Takbyte (0.6 h/m², 350 kr mat/m²)</option>
                <option value="fasad">Fasad / Vägg (0.5 h/m², 220 kr mat/m²)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Yta (m²)</label>
              <input
                type="number"
                value={sqm}
                onChange={(e) => setSqm(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Timpris (kr/h)</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Materialpåslag (%)</label>
                <input
                  type="number"
                  value={materialMarkup}
                  onChange={(e) => setMaterialMarkup(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="rot"
                checked={includeRot}
                onChange={(e) => setIncludeRot(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="rot" className="text-sm font-medium cursor-pointer">
                Räkna med ROT-avdrag (30 % på arbetet)
              </label>
            </div>

            <button
              onClick={handlePrint}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
            >
              <span>🖨️ Skriv ut / Spara som PDF</span>
            </button>
          </div>
        </div>

        {/* OFFERTVISNING & PRINT-MALL */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
          <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">OFFERT</h2>
              <p className="text-xs text-slate-500">Datum: {new Date().toLocaleDateString('sv-SE')}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 print:hidden">
                Förhandsgranskning
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg text-slate-800">{result.jobTitle}</h3>
            <p className="text-sm text-slate-600">Specifikation för totalt {result.sqm} m² yta.</p>
          </div>

          <table className="w-full text-left text-sm mb-6 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500">
                <th className="py-2">Beskrivning</th>
                <th className="py-2 text-right">Belopp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5">
                  Arbetskostnad ({result.laborHours} timmar à {hourlyRate} kr/h)
                </td>
                <td className="py-2.5 text-right font-medium">{result.laborCost.toLocaleString()} kr</td>
              </tr>
              <tr>
                <td className="py-2.5">
                  Materialkostnad (inkl. {materialMarkup}% påslag)
                </td>
                <td className="py-2.5 text-right font-medium">{result.materialCost.toLocaleString()} kr</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-2.5">Totalt före avdrag</td>
                <td className="py-2.5 text-right">{result.totalBeforeRot.toLocaleString()} kr</td>
              </tr>
              {includeRot && (
                <tr className="text-emerald-700 font-medium">
                  <td className="py-2.5">ROT-avdrag (30 % på arbetskostnad)</td>
                  <td className="py-2.5 text-right">-{result.rotDeduction.toLocaleString()} kr</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-t print:border-b print:border-slate-300 print:rounded-none">
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Totalt att betala (inkl. moms):</span>
              <span className="text-xl font-extrabold text-blue-600 print:text-slate-900">
                {result.totalToPay.toLocaleString()} kr
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
