"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { House } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { beregnSvenskBolan } from "@/lib/svensk-bolan";

const fmt = (n: number) => Math.round(n).toLocaleString("sv-SE");

export default function BolanBeregner() {
  const [bostadsvarde, setBostadsvarde] = useState<number>(3000000);
  const [lanebelopp, setLanebelopp] = useState<number>(2400000);
  const [ranta, setRanta] = useState<number>(4);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "bolan") {
      const i = urlState.inputs;
      if (i.bostadsvarde !== undefined) setBostadsvarde(Number(i.bostadsvarde));
      if (i.lanebelopp !== undefined) setLanebelopp(Number(i.lanebelopp));
      if (i.ranta !== undefined) setRanta(Number(i.ranta));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("bolan");
    const timer = setTimeout(() => {
      trackCalculation("bolan");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setBostadsvarde(3000000);
    setLanebelopp(2400000);
    setRanta(4);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "bolan",
      inputs: { bostadsvarde, lanebelopp, ranta },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bostadsvarde, lanebelopp, ranta]);

  const r = useMemo(
    () => beregnSvenskBolan(bostadsvarde, lanebelopp, ranta),
    [bostadsvarde, lanebelopp, ranta]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inmatning */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bostadens pris</label>
            <div className="relative">
              <input type="number" value={bostadsvarde} onChange={(e) => setBostadsvarde(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Lånebelopp</label>
            <div className="relative">
              <input type="number" value={lanebelopp} onChange={(e) => setLanebelopp(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            {r && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Kontantinsats: {fmt(r.kontantinsats)} kr ({Math.round((1 - r.belaningsgrad) * 100)}%)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ränta (% per år)</label>
            <div className="relative">
              <input type="number" step="0.01" value={ranta} onChange={(e) => setRanta(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Resultat */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {r ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                <div className="text-sm font-medium text-green-800 dark:text-green-300">Månadskostnad</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{fmt(r.manadskostnadBrutto)} kr</div>
                <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                  {fmt(r.manadskostnadEfterAvdrag)} kr efter ränteavdrag
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Belåningsgrad</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(r.belaningsgrad * 100)}%</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Amorteringskrav</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(r.amorteringstakt * 100)}%/år</div>
                </div>
              </div>

              {r.overBolanetak && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-300">
                  Lånet överstiger bolånetaket på 90% ({fmt(r.maxLan)} kr). Du behöver en större kontantinsats.
                </div>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ränta/mån</span>
                  <span className="dark:text-gray-200">{fmt(r.manadsRanta)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amortering/mån</span>
                  <span className="dark:text-gray-200">{fmt(r.manadsAmortering)} kr</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <span>Ränteavdrag/år</span>
                  <span>−{fmt(r.ranteavdragArligt)} kr</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 dark:border-gray-600">
                  <span className="dark:text-gray-200">Månadskostnad (brutto)</span>
                  <span className="dark:text-gray-200">{fmt(r.manadskostnadBrutto)} kr</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Amorteringskravet följer reglerna från 1 april 2026 (baseras på belåningsgrad,
                max 2%). Ränteavdraget är 30% upp till 100 000 kr, sedan 21%.
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="mb-3 flex justify-center">
                <House className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p>Ange bostadens pris och lånebelopp</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={r ? `Bolån: ${fmt(r.manadskostnadBrutto)} kr/mån (${Math.round(r.belaningsgrad * 100)}% belåningsgrad)` : ""} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Bolånekalkylator"
          resultSummary={r ? `Månadskostnad: ${fmt(r.manadskostnadBrutto)} kr` : ""}
        />
      </div>
    </div>
  );
}
