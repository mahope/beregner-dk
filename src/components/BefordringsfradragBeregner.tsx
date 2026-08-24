"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnBefordringsfradrag } from "@/lib/befordringsfradrag";

const labels = {
  da: {
    kmPerDag: "Km pr. dag (tur/retur)",
    arbejdsdage: "Arbejdsdage pr. år",
    yderkommune: "Yderkommune eller småø",
    broStorebaelt: "Storebæltsbroen (ture pr. år)",
    broOeresund: "Øresundsbroen (ture pr. år)",
    broOffentlig: "Offentlig transport over bro",
    indkomst: "Din årlige indkomst før AM-bidrag",
    calcName: "Befordringsfradrag",
    resultHeading: "Dit befordringsfradrag 2026",
    fradragPerAar: "Fradrag pr. år",
    skattevaerdi: "Skattebesparelse pr. år",
    almFradrag: "Almindeligt kørselsfradrag",
    ekstraFradrag: "Ekstra fradrag",
    fradragPerDag: "Fradrag pr. dag",
    bro: "Brobefordringsfradrag",
    note: "Bemærk",
    dage: "dage",
    ture: "ture",
  },
  se: {
    kmPerDag: "Km per dag (tur och retur)",
    arbejdsdage: "Arbetsdagar per år",
    yderkommune: "Glesbygd eller småö",
    broStorebaelt: "Stora Bält-bron (turer per år)",
    broOeresund: "Öresundsbron (turer per år)",
    broOffentlig: "Kollektivtrafik över bro",
    indkomst: "Din årliga inkomst före socialavgifter",
    calcName: "Befordringsavdrag",
    resultHeading: "Ditt befordringsavdrag 2026",
    fradragPerAar: "Avdrag per år",
    skattevaerdi: "Skattebesparing per år",
    almFradrag: "Vanligt körselsavdrag",
    ekstraFradrag: "Extra avdrag",
    fradragPerDag: "Avdrag per dag",
    bro: "Broavdrag",
    note: "Observera",
    dage: "dagar",
    ture: "turer",
  },
} as const;

export default function BefordringsfradragBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  const fmtKr = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const [kmPerDag, setKmPerDag] = useState(60);
  const [arbejdsdage, setArbejdsdage] = useState(225);
  const [yderkommune, setYderkommune] = useState(false);
  const [broStorebaelt, setBroStorebaelt] = useState(0);
  const [broOeresund, setBroOeresund] = useState(0);
  const [broOffentlig, setBroOffentlig] = useState(false);
  const [indkomst, setIndkomst] = useState(400000);

  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "befordring") {
      const i = urlState.inputs;
      if (i.kmPerDag !== undefined) setKmPerDag(Number(i.kmPerDag));
      if (i.arbejdsdage !== undefined) setArbejdsdage(Number(i.arbejdsdage));
      if (i.yderkommune !== undefined) setYderkommune(i.yderkommune === "true");
      if (i.broStorebaelt !== undefined) setBroStorebaelt(Number(i.broStorebaelt));
      if (i.broOeresund !== undefined) setBroOeresund(Number(i.broOeresund));
      if (i.broOffentlig !== undefined) setBroOffentlig(i.broOffentlig === "true");
      if (i.indkomst !== undefined) setIndkomst(Number(i.indkomst));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("befordringsfradrag");
    const timer = setTimeout(() => {
      trackCalculation("befordringsfradrag");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setKmPerDag(60);
    setArbejdsdage(225);
    setYderkommune(false);
    setBroStorebaelt(0);
    setBroOeresund(0);
    setBroOffentlig(false);
    setIndkomst(400000);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "befordring",
      inputs: { kmPerDag, arbejdsdage, yderkommune: String(yderkommune), broStorebaelt, broOeresund, broOffentlig: String(broOffentlig), indkomst },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [kmPerDag, arbejdsdage, yderkommune, broStorebaelt, broOeresund, broOffentlig, indkomst]);

  const resultat = useMemo(() => {
    return beregnBefordringsfradrag({
      kmPerDag,
      arbejdsdagePerAar: arbejdsdage,
      yderkommune,
      broStorebaeltTureAar: broStorebaelt,
      broOeresundTureAar: broOeresund,
      broOffentlig,
      indkomstFørAms: indkomst,
    });
  }, [kmPerDag, arbejdsdage, yderkommune, broStorebaelt, broOeresund, broOffentlig, indkomst]);

  const inputCls = "w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1";

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{l.kmPerDag}</label>
          <div className="relative">
            <input type="number" min="0" max="400" step="1" value={kmPerDag} onChange={(e) => setKmPerDag(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">km</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>{l.arbejdsdage}</label>
          <div className="relative">
            <input type="number" min="0" max="365" step="1" value={arbejdsdage} onChange={(e) => setArbejdsdage(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{l.dage}</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>{l.indkomst}</label>
          <div className="relative">
            <input type="number" min="0" step="1000" value={indkomst} onChange={(e) => setIndkomst(Number(e.target.value))} className={inputCls} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
          </div>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={yderkommune} onChange={(e) => setYderkommune(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
            <span className="text-sm text-gray-700 dark:text-gray-200">{l.yderkommune}</span>
          </label>
        </div>
      </div>

      <details className="mt-4">
        <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
          Brofradrag (Storebælt, Øresund)
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className={labelCls}>{l.broStorebaelt}</label>
            <div className="relative">
              <input type="number" min="0" step="1" value={broStorebaelt} onChange={(e) => setBroStorebaelt(Number(e.target.value))} className={inputCls} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{l.ture}</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>{l.broOeresund}</label>
            <div className="relative">
              <input type="number" min="0" step="1" value={broOeresund} onChange={(e) => setBroOeresund(Number(e.target.value))} className={inputCls} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{l.ture}</span>
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={broOffentlig} onChange={(e) => setBroOffentlig(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-gray-200">{l.broOffentlig}</span>
            </label>
          </div>
        </div>
      </details>

      <div className="flex justify-end mt-4">
        <ResetButton onReset={handleReset} />
      </div>

      {resultat && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{l.resultHeading}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.fradragPerAar}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmtKr(resultat.fradraegPerAar)} kr</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.skattevaerdi}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmtKr(resultat.skattevaerdi)} kr</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.almFradrag}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{fmtKr(resultat.almFradragPerAar)} kr</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.ekstraFradrag}</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">{fmtKr(resultat.ekstraFradragPerAar)} kr</p>
            </div>
          </div>
          {resultat.note && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400 mt-4">{l.note}: {resultat.note}</p>
          )}

          <div className="flex justify-center mt-4 gap-3">
            <CopyResultButton
              text={`${l.fradragPerAar}: ${fmtKr(resultat.fradraegPerAar)} kr · ${l.skattevaerdi}: ${fmtKr(resultat.skattevaerdi)} kr`}
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`${l.fradragPerAar}: ${fmtKr(resultat.fradraegPerAar)} kr`}
            />
          </div>
        </div>
      )}
    </div>
  );
}