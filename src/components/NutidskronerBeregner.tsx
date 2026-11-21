"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  NUTIDSKRONER_NU_AAR,
  NUTIDSKRONER_NU_PERIODE,
  NUTIDSKRONER_SENESTE_HELE_AAR,
  nutidskroneAar,
  omregnTilNutidskroner,
} from "@/lib/nutidskroner";

const fmtKr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });
const fmtPct = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 1 });

export default function NutidskronerBeregner() {
  const [beloeb, setBeloeb] = useState<number>(10_000);
  const [fraAar, setFraAar] = useState<number>(2000);
  const [tilAar, setTilAar] = useState<number>(NUTIDSKRONER_NU_AAR);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "nutidskroner") {
      const i = urlState.inputs;
      if (i.beloeb !== undefined) setBeloeb(Number(i.beloeb));
      if (i.fraAar !== undefined) setFraAar(Number(i.fraAar));
      if (i.tilAar !== undefined) setTilAar(Number(i.tilAar));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("nutidskroner");
    const timer = setTimeout(() => {
      trackCalculation("nutidskroner");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setBeloeb(10_000);
    setFraAar(2000);
    setTilAar(NUTIDSKRONER_NU_AAR);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "nutidskroner",
      inputs: { beloeb, fraAar, tilAar },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beloeb, fraAar, tilAar]);

  const aar = useMemo(() => nutidskroneAar(), []);
  const r = useMemo(() => omregnTilNutidskroner(beloeb, fraAar, tilAar), [beloeb, fraAar, tilAar]);

  const aarLabel = (y: number) =>
    y === NUTIDSKRONER_NU_AAR ? `i dag (${NUTIDSKRONER_NU_PERIODE})` : `${y}`;

  const retning = r && r.aendringPct < 0 ? "faldet" : "steget";

  const selectClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="nutidskroner-beloeb" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Beløb (kr.)
            </label>
            <div className="relative">
              <input
                id="nutidskroner-beloeb"
                type="number"
                min="0"
                step="100"
                value={beloeb}
                onChange={(e) => setBeloeb(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>
          <div>
            <label htmlFor="nutidskroner-fra" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Beløbet er fra år
            </label>
            <select id="nutidskroner-fra" value={fraAar} onChange={(e) => setFraAar(Number(e.target.value))} className={selectClass}>
              {aar
                .filter((y) => y <= NUTIDSKRONER_SENESTE_HELE_AAR)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="nutidskroner-til" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Regn om til
            </label>
            <select id="nutidskroner-til" value={tilAar} onChange={(e) => setTilAar(Number(e.target.value))} className={selectClass}>
              <option value={NUTIDSKRONER_NU_AAR}>i dag ({NUTIDSKRONER_NU_PERIODE})</option>
              {aar
                .filter((y) => y <= NUTIDSKRONER_SENESTE_HELE_AAR)
                .map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Svarer til</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {r ? fmtKr(r.beloeb) : "—"} kr.
              </div>
            </div>
            {r && (
              <>
                <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                  {fmtKr(beloeb)} kr. i {fraAar} svarer til{" "}
                  <strong>{fmtKr(r.beloeb)} kr.</strong> {aarLabel(tilAar)}.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Prisændring</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {retning} {fmtPct(Math.abs(r.aendringPct))} %
                  </div>
                </div>
              </>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kilde: Danmarks Statistiks forbrugerprisindeks (årsgennemsnit). «I dag» bruger den seneste
              offentliggjorte måned, {NUTIDSKRONER_NU_PERIODE}. Prisindekset måler det generelle prisniveau —
              din egen varekurv kan stige mere eller mindre.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${fmtKr(beloeb)} kr. i ${fraAar} svarer til ${r ? fmtKr(r.beloeb) : "—"} kr. ${aarLabel(tilAar)}`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Nutidskroner"
          resultSummary={`${fmtKr(beloeb)} kr. i ${fraAar} = ${r ? fmtKr(r.beloeb) : "—"} kr. ${aarLabel(tilAar)}`}
        />
      </div>
    </div>
  );
}
