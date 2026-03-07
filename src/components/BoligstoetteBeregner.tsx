"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

// 2026 satser (kilde: bm.dk, borger.dk)
const MAX_BOLIGUDGIFT = 113_000; // Max årlig boligudgift der indgår i beregning (2026)
const MINDSTE_EGENBETALING = 28_900; // Min egenbetaling for boligsikring (2026)
const MINDSTE_EGENBETALING_PROCENT = 18; // % af indkomst over grænsen

interface BoligstoetteResultat {
  aarligBoligstoette: number;
  maanedligBoligstoette: number;
  egenbetaling: number;
  procentAfHusleje: number;
  note: string;
}

export default function BoligstoetteBeregner() {
  const [maanedligHusleje, setMaanedligHusleje] = useState<string>("");
  const [husstandsindkomst, setHusstandsindkomst] = useState<string>("");
  const [antalPersoner, setAntalPersoner] = useState<string>("1");
  const [boligType, setBoligType] = useState<string>("leje");
  const [areal, setAreal] = useState<string>("65");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'boligstoette') {
      const inputs = urlState.inputs;
      if (inputs.maanedligHusleje !== undefined) setMaanedligHusleje(String(inputs.maanedligHusleje));
      if (inputs.husstandsindkomst !== undefined) setHusstandsindkomst(String(inputs.husstandsindkomst));
      if (inputs.antalPersoner !== undefined) setAntalPersoner(String(inputs.antalPersoner));
      if (inputs.boligType) setBoligType(inputs.boligType);
      if (inputs.areal !== undefined) setAreal(String(inputs.areal));
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("boligstoette");
    const timer = setTimeout(() => {
      trackCalculation("boligstoette");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'boligstoette',
      inputs: { maanedligHusleje, husstandsindkomst, antalPersoner, boligType, areal },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maanedligHusleje, husstandsindkomst, antalPersoner, boligType, areal]);

  const handleReset = useCallback(() => {
    setMaanedligHusleje("");
    setHusstandsindkomst("");
    setAntalPersoner("1");
    setBoligType("leje");
    setAreal("65");
  }, []);

  const resultat = useMemo<BoligstoetteResultat | null>(() => {
    const husleje = parseFloat(maanedligHusleje);
    const indkomst = parseFloat(husstandsindkomst);
    const personer = parseInt(antalPersoner);
    const m2 = parseFloat(areal);

    if (!husleje || husleje <= 0 || !indkomst || indkomst <= 0) return null;

    // Meget forenklet beregning - den rigtige er kompleks
    const aarligHusleje = husleje * 12;
    const maksHusleje = Math.min(aarligHusleje, MAX_BOLIGUDGIFT);
    
    // Indkomstgrænse varierer efter antal personer (2026)
    const indkomstGraense = 171_500 + (personer - 1) * 53_100;
    
    // Beregn egenbetaling
    let egenbetalingProcent = 18;
    if (indkomst > indkomstGraense) {
      const overIndkomst = indkomst - indkomstGraense;
      egenbetalingProcent = 18 + (overIndkomst / 10_000) * 0.5;
    }
    egenbetalingProcent = Math.min(egenbetalingProcent, 75);

    const egenbetaling = maksHusleje * (egenbetalingProcent / 100);
    const aarligStoette = Math.max(0, maksHusleje - egenbetaling);
    
    // Reducer for store boliger
    let arealReduktion = 1;
    const maxAreal = 65 + (personer - 1) * 20;
    if (m2 > maxAreal) {
      arealReduktion = maxAreal / m2;
    }

    const endeligStoette = aarligStoette * arealReduktion;
    
    // Mindste boligstøtte (2026)
    if (endeligStoette < 3_648) {
      return {
        aarligBoligstoette: 0,
        maanedligBoligstoette: 0,
        egenbetaling: aarligHusleje,
        procentAfHusleje: 0,
        note: "Beregnet støtte er under minimumsgrænsen (304 kr/md).",
      };
    }

    return {
      aarligBoligstoette: Math.round(endeligStoette),
      maanedligBoligstoette: Math.round(endeligStoette / 12),
      egenbetaling: Math.round(aarligHusleje - endeligStoette),
      procentAfHusleje: Math.round((endeligStoette / aarligHusleje) * 100),
      note: "",
    };
  }, [maanedligHusleje, husstandsindkomst, antalPersoner, areal]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="space-y-6">
        {/* Input: Husleje */}
        <div>
          <label 
            htmlFor="husleje" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Månedlig husleje (inkl. varme)
          </label>
          <div className="relative">
            <input
              type="number"
              id="husleje"
              value={maanedligHusleje}
              onChange={(e) => setMaanedligHusleje(e.target.value)}
              placeholder="F.eks. 8000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              kr/md
            </span>
          </div>
        </div>

        {/* Input: Husstandsindkomst */}
        <div>
          <label 
            htmlFor="indkomst" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Årlig husstandsindkomst (før skat)
          </label>
          <div className="relative">
            <input
              type="number"
              id="indkomst"
              value={husstandsindkomst}
              onChange={(e) => setHusstandsindkomst(e.target.value)}
              placeholder="F.eks. 250000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              kr/år
            </span>
          </div>
        </div>

        {/* Input: Antal personer */}
        <div>
          <label 
            htmlFor="personer" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Antal personer i husstanden
          </label>
          <select
            id="personer"
            value={antalPersoner}
            onChange={(e) => setAntalPersoner(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          >
            <option value="1">1 person</option>
            <option value="2">2 personer</option>
            <option value="3">3 personer</option>
            <option value="4">4 personer</option>
            <option value="5">5+ personer</option>
          </select>
        </div>

        {/* Input: Boligareal */}
        <div>
          <label 
            htmlFor="areal" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Boligens areal (m²)
          </label>
          <div className="relative">
            <input
              type="number"
              id="areal"
              value={areal}
              onChange={(e) => setAreal(e.target.value)}
              placeholder="F.eks. 65"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              m²
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <ResetButton onReset={handleReset} />
        </div>

        {/* Resultat */}
        {resultat && (
          <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estimeret boligstøtte
            </h3>
            
            {resultat.maanedligBoligstoette > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Månedlig støtte</p>
                    <p className="text-3xl font-bold text-green-600">
                      {resultat.maanedligBoligstoette.toLocaleString("da-DK")} kr
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-600">Årlig støtte</p>
                    <p className="text-2xl font-bold text-green-600">
                      {resultat.aarligBoligstoette.toLocaleString("da-DK")} kr
                    </p>
                  </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>
                    Din egenbetaling: {Math.round(resultat.egenbetaling / 12).toLocaleString("da-DK")} kr/md
                  </p>
                  <p>
                    Støtten dækker ca. <strong>{resultat.procentAfHusleje}%</strong> af din husleje
                  </p>
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">{resultat.note}</p>
              </div>
            )}
          </div>
        )}

        {/* Del beregning */}
        {resultat && resultat.maanedligBoligstoette > 0 && (
          <div className="flex justify-center">
            <CopyResultButton text={`Estimeret støtte: ${resultat.maanedligBoligstoette.toLocaleString("da-DK")} kr/md`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Boligstøtteberegner"
              resultSummary={`Estimeret støtte: ${resultat.maanedligBoligstoette.toLocaleString("da-DK")} kr/md`}
            />
          </div>
        )}

        {/* Info boks */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <h4 className="font-semibold text-gray-800 mb-2">Om boligstøtte</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Boligstøtte er et skattefrit tilskud til din husleje</li>
            <li>Du skal bo til leje i en helårsbolig</li>
            <li>Din indkomst og formue påvirker beløbet</li>
            <li>Søg via borger.dk med NemID/MitID</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Dette er et estimat. Den præcise beregning laves af Udbetaling Danmark.
          </p>
        </div>
      </div>
    </div>
  );
}
