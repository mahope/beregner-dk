"use client";

import { useState, useMemo } from "react";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";

// 2026 satser
const MAX_DAGPENGE_SATS = 20359; // kr/måned (2026)
const DAGPENGE_PROCENT = 90; // % af tidligere løn
const ARBEJDSTIMER_PR_MAANED = 160.33; // Gennemsnit

interface DagpengeResultat {
  maanedligDagpenge: number;
  ugentligDagpenge: number;
  dagligSats: number;
  procentAfLoen: number;
  erMaxSats: boolean;
}

export default function DagpengeBeregner() {
  const [maanedsloen, setMaanedsloen] = useState<string>("");
  const [arbejdstimer, setArbejdstimer] = useState<string>("37");

  // Loading state for beregning
  const isLoading = useCalculationLoading([maanedsloen, arbejdstimer]);

  const resultat = useMemo<DagpengeResultat | null>(() => {
    const loen = parseFloat(maanedsloen);
    const timer = parseFloat(arbejdstimer);
    
    if (!loen || loen <= 0 || !timer || timer <= 0) return null;

    // Beregn dagpenge baseret på 90% af tidligere løn
    let beregnetDagpenge = loen * (DAGPENGE_PROCENT / 100);
    
    // Juster for deltid
    const deltidsFaktor = timer / 37;
    const maxDagpengeJusteret = MAX_DAGPENGE_SATS * deltidsFaktor;
    
    const erMaxSats = beregnetDagpenge >= maxDagpengeJusteret;
    const maanedligDagpenge = erMaxSats ? maxDagpengeJusteret : beregnetDagpenge;
    
    return {
      maanedligDagpenge: Math.round(maanedligDagpenge),
      ugentligDagpenge: Math.round(maanedligDagpenge / 4.33),
      dagligSats: Math.round(maanedligDagpenge / 22),
      procentAfLoen: Math.round((maanedligDagpenge / loen) * 100),
      erMaxSats,
    };
  }, [maanedsloen, arbejdstimer]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="space-y-6">
        {/* Input: Månedlig løn */}
        <div>
          <label 
            htmlFor="maanedsloen" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Månedlig løn før skat
          </label>
          <div className="relative">
            <input
              type="number"
              id="maanedsloen"
              value={maanedsloen}
              onChange={(e) => setMaanedsloen(e.target.value)}
              placeholder="F.eks. 35000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              kr/md
            </span>
          </div>
        </div>

        {/* Input: Arbejdstimer */}
        <div>
          <label 
            htmlFor="arbejdstimer" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ugentlige arbejdstimer
          </label>
          <select
            id="arbejdstimer"
            value={arbejdstimer}
            onChange={(e) => setArbejdstimer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          >
            <option value="37">37 timer (fuldtid)</option>
            <option value="30">30 timer</option>
            <option value="25">25 timer</option>
            <option value="20">20 timer</option>
            <option value="15">15 timer</option>
          </select>
        </div>

        {/* Resultat */}
        <CalculationLoading 
          isLoading={isLoading} 
          loadingText="Beregner dagpenge..."
          minHeight="200px"
        >
        {resultat && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Dine estimerede dagpenge
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Månedligt</p>
                <p className="text-2xl font-bold text-blue-600">
                  {resultat.maanedligDagpenge.toLocaleString("da-DK")} kr
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Ugentligt</p>
                <p className="text-2xl font-bold text-blue-600">
                  {resultat.ugentligDagpenge.toLocaleString("da-DK")} kr
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Dagligt (ca.)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {resultat.dagligSats.toLocaleString("da-DK")} kr
                </p>
              </div>
            </div>

            {resultat.erMaxSats && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Du rammer maxsatsen på {MAX_DAGPENGE_SATS.toLocaleString("da-DK")} kr/md
                </p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Dagpengene svarer til <strong>{resultat.procentAfLoen}%</strong> af din løn
              </p>
            </div>
          </div>
        )}
        </CalculationLoading>

        {/* Info boks */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h4 className="font-semibold text-gray-800 mb-2">Om dagpenge i 2026</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Dagpenge udgør max 90% af din tidligere løn</li>
            <li>Maxsats i 2026: {MAX_DAGPENGE_SATS.toLocaleString("da-DK")} kr/md</li>
            <li>Du skal være medlem af en A-kasse og have optjent ret</li>
            <li>Dagpengeperioden er normalt 2 år</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Dette er et estimat. Kontakt din A-kasse for præcis beregning.
          </p>
        </div>
      </div>
    </div>
  );
}
