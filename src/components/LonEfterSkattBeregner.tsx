"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Wallet } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { beregnSvenskSkatt, SVENSK_SKATT_2026 } from "@/lib/svensk-skatt";

const fmt = (n: number) => Math.round(n).toLocaleString("sv-SE");

export default function LonEfterSkattBeregner() {
  const [lon, setLon] = useState<number>(35000);
  const [periode, setPeriode] = useState<"manad" | "ar">("manad");
  const [kommunalskatt, setKommunalskatt] = useState<number>(32.38);
  const [kyrkomedlem, setKyrkomedlem] = useState(false);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "lon-sverige") {
      const i = urlState.inputs;
      if (i.lon !== undefined) setLon(Number(i.lon));
      if (i.periode) setPeriode(i.periode);
      if (i.kommunalskatt !== undefined) setKommunalskatt(Number(i.kommunalskatt));
      if (i.kyrkomedlem !== undefined) setKyrkomedlem(Boolean(i.kyrkomedlem));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("lon-efter-skatt");
    const timer = setTimeout(() => {
      trackCalculation("lon-efter-skatt");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setLon(35000);
    setPeriode("manad");
    setKommunalskatt(32.38);
    setKyrkomedlem(false);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "lon-sverige",
      inputs: { lon, periode, kommunalskatt, kyrkomedlem },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [lon, periode, kommunalskatt, kyrkomedlem]);

  const resultat = useMemo(() => {
    const arsloen = periode === "manad" ? lon * 12 : lon;
    return beregnSvenskSkatt(arsloen, kommunalskatt / 100, kyrkomedlem);
  }, [lon, periode, kommunalskatt, kyrkomedlem]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inmatning */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Lön
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setPeriode("manad")}
                className={`flex-1 py-2 rounded-lg border-2 text-sm transition-colors ${
                  periode === "manad"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                Per månad
              </button>
              <button
                type="button"
                onClick={() => setPeriode("ar")}
                className={`flex-1 py-2 rounded-lg border-2 text-sm transition-colors ${
                  periode === "ar"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                Per år
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                value={lon}
                onChange={(e) => setLon(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bruttolön {periode === "manad" ? "per månad" : "per år"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Kommunalskatt (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={kommunalskatt}
                onChange={(e) => setKommunalskatt(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Genomsnitt i Sverige 2026: 32,38 % (kommun + region)
            </p>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={kyrkomedlem}
              onChange={(e) => setKyrkomedlem(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Medlem i Svenska kyrkan (kyrkoavgift)
            </span>
          </label>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Resultat */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {resultat ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-green-800 dark:text-green-300">
                  Nettolön per månad
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {fmt(resultat.nettoMaaned)} kr
                </div>
                <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                  {fmt(resultat.nettoAar)} kr per år
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Effektiv skatt</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {resultat.effektivSkattProcent}%
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total skatt/år</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {fmt(resultat.summaSkatt)} kr
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Grundavdrag</span>
                  <span className="dark:text-gray-200">−{fmt(resultat.grundavdrag)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Kommunalskatt ({kommunalskatt}%)</span>
                  <span className="dark:text-gray-200">{fmt(resultat.kommunalSkatt)} kr</span>
                </div>
                {resultat.statligSkatt > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Statlig inkomstskatt (20%)</span>
                    <span>{fmt(resultat.statligSkatt)} kr</span>
                  </div>
                )}
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <span>Jobbskatteavdrag</span>
                  <span>−{fmt(resultat.jobbskatteavdrag)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Public service-avgift</span>
                  <span className="dark:text-gray-200">{fmt(resultat.publicService)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Begravningsavgift</span>
                  <span className="dark:text-gray-200">{fmt(resultat.begravningsavgift)} kr</span>
                </div>
                {resultat.kyrkoavgift > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Kyrkoavgift</span>
                    <span className="dark:text-gray-200">{fmt(resultat.kyrkoavgift)} kr</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-2 dark:border-gray-600">
                  <span className="dark:text-gray-200">Total skatt/år</span>
                  <span className="dark:text-gray-200">{fmt(resultat.summaSkatt)} kr</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Beräkningen följer Skatteverkets regler för 2026 (jobbskatteavdrag,
                grundavdrag, statlig skatt). Allmän pensionsavgift (7 %) krediteras
                fullt ut. Begravnings- och kyrkoavgift varierar mellan församlingar.
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="mb-3 flex justify-center">
                <Wallet className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p>Ange din bruttolön för att se din nettolön</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={resultat ? `Nettolön: ${fmt(resultat.nettoMaaned)} kr/mån (effektiv skatt ${resultat.effektivSkattProcent}%)` : ""}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Lön efter skatt"
          resultSummary={resultat ? `Nettolön: ${fmt(resultat.nettoMaaned)} kr/mån` : ""}
        />
      </div>
    </div>
  );
}
