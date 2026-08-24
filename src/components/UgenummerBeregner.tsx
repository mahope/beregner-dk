"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { getIntlLocale } from "@/lib/format";
import { isoUge, antalUgerIIsoAar, IsoUgeResultat } from "@/lib/ugenummer";

const labels = {
  da: {
    dato: "Vælg en dato",
    ugenummer: "Ugenummer",
    isoAar: "ISO-år",
    ugedag: "Ugedag",
    ugerIAaret: "Uger i året",
    ugeAf: "Uge {x} af {y} i {aar}",
    isoAarAfviger: "Denne dato ligger i uge 1 af det følgende ISO-år",
    isoAarAfvigerTilbage: "Denne dato hører til det foregående ISO-år",
    langtAar: "{aar} er et langt år med {n} uger",
    calcName: "Ugenummer-beregner",
  },
} as const;

export default function UgenummerBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [datoStr, setDatoStr] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );

  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("ugenummer");
    const timer = setTimeout(() => {
      trackCalculation("ugenummer");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setDatoStr(new Date().toISOString().split("T")[0]);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "ugenummer",
      inputs: { dato: datoStr },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [datoStr]);

  const r = useMemo((): (IsoUgeResultat & { ugerIAaret: number }) | null => {
    const res = isoUge(datoStr);
    if (!res) return null;
    const ugerIAaret = antalUgerIIsoAar(res.isoAar);
    return ugerIAaret ? { ...res, ugerIAaret } : null;
  }, [datoStr]);

  const intlLocale = getIntlLocale(locale as "da");
  const ugedagNavn = useMemo(() => {
    if (!r) return "";
    const [y, m, d] = datoStr.split("-").map(Number);
    return new Date(y, m - 1, d)
      .toLocaleDateString(intlLocale, { weekday: "long" });
  }, [r, datoStr, intlLocale]);

  const fmtUgeAf = l.ugeAf
    .replace("{x}", String(r?.uge ?? ""))
    .replace("{y}", String(r?.ugerIAaret ?? ""))
    .replace("{aar}", String(r?.isoAar ?? ""));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div>
          <label htmlFor="ugenummer-dato" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {l.dato}
          </label>
          <input
            id="ugenummer-dato"
            type="date"
            value={datoStr}
            onChange={(e) => setDatoStr(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <ResetButton onReset={handleReset} />
      </div>

      {r && (
        <div className="mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{l.ugenummer}</p>
          <div className="rounded-lg p-6 text-center bg-teal-100 dark:bg-teal-900/30 mb-4">
            <p className="text-5xl font-bold text-teal-700 dark:text-teal-300">
              {l.ugenummer} {r.uge}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.ugedag}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{ugedagNavn}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.isoAar}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{r.isoAar}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm col-span-2 md:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.ugerIAaret}</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{r.ugerIAaret}</p>
            </div>
          </div>

          {(r.isoAar !== Number(datoStr.split("-")[0]) || r.ugerIAaret === 53) && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              {r.isoAar !== Number(datoStr.split("-")[0])
                ? r.isoAar > Number(datoStr.split("-")[0])
                  ? l.isoAarAfviger
                  : l.isoAarAfvigerTilbage
                : l.langtAar.replace("{aar}", String(r.isoAar)).replace("{n}", String(r.ugerIAaret))}
            </p>
          )}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">{fmtUgeAf}</p>

          <div className="flex justify-center mt-4 gap-3">
            <CopyResultButton text={`Uge ${r.uge}, ${r.isoAar}`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`Uge ${r.uge}, ${r.isoAar}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
