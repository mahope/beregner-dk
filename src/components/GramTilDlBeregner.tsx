"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  GRAM_TIL_DL_KATEGORIER,
  GRAM_TIL_DL_STANDARD_MAENGDE,
  GRAM_TIL_DL_STANDARD_VARE,
  GRAM_TIL_DL_VARER,
  type GramTilDlRetning,
  beregnGramTilDl,
  formatGramTilDl,
  vareVedId,
} from "@/lib/gram-til-dl";

const fmt = (n: number, maks = 0) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function GramTilDlBeregner() {
  const [vareId, setVareId] = useState(GRAM_TIL_DL_STANDARD_VARE);
  const [maengde, setMaengde] = useState(GRAM_TIL_DL_STANDARD_MAENGDE);
  const [retning, setRetning] = useState<GramTilDlRetning>("gram-til-dl");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "gram-til-dl") {
      const i = urlState.inputs;
      if (i.vareId !== undefined) setVareId(String(i.vareId));
      if (i.maengde !== undefined) setMaengde(Number(i.maengde));
      if (i.retning === "dl-til-gram" || i.retning === "gram-til-dl") {
        setRetning(i.retning);
      }
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("gram-til-dl");
    const timer = setTimeout(() => {
      trackCalculation("gram-til-dl");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setVareId(GRAM_TIL_DL_STANDARD_VARE);
    setMaengde(GRAM_TIL_DL_STANDARD_MAENGDE);
    setRetning("gram-til-dl");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "gram-til-dl",
      inputs: { vareId, maengde, retning },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [vareId, maengde, retning]);

  const resultat = useMemo(
    () => beregnGramTilDl({ vareId, maengde, retning }),
    [vareId, maengde, retning],
  );

  const vare = vareVedId(vareId) ?? GRAM_TIL_DL_VARER[0];
  const maengdeTekst = `${fmt(maengde, 2)} ${resultat.maengdeEnhed}`;
  const svarTekst = `${formatGramTilDl(resultat.svar, resultat.svarEnhed === "g" ? 0 : 2)} ${resultat.svarEnhed}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="gram-til-dl-vare" className={labelClass}>
              Ingrediens
            </label>
            <select
              id="gram-til-dl-vare"
              value={vareId}
              onChange={(e) => setVareId(e.target.value)}
              className={inputClass}
            >
              {GRAM_TIL_DL_KATEGORIER.map((kategori) => (
                <optgroup key={kategori} label={kategori}>
                  {GRAM_TIL_DL_VARER.filter((v) => v.kategori === kategori).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.navn}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>Omregn</span>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Omregningsretning">
              <button
                type="button"
                aria-pressed={retning === "gram-til-dl"}
                onClick={() => setRetning("gram-til-dl")}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  retning === "gram-til-dl"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                Gram → dl
              </button>
              <button
                type="button"
                aria-pressed={retning === "dl-til-gram"}
                onClick={() => setRetning("dl-til-gram")}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  retning === "dl-til-gram"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                dl → gram
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="gram-til-dl-maengde" className={labelClass}>
              Mængde ({resultat.maengdeEnhed})
            </label>
            <input
              id="gram-til-dl-maengde"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={maengde}
              onChange={(e) => setMaengde(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            1 dl {vare.navn.toLowerCase()} vejer ca. {fmt(vare.gramPrDl)} g. Vægten er et
            køkkenmål og afhænger af, hvor fast varen er fyldt i målet.
          </p>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {maengdeTekst} {vare.navn.toLowerCase()} er
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{svarTekst}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">1 dl vejer</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(vare.gramPrDl)} g
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">1 g er</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatGramTilDl(100 / vare.gramPrDl, 2)} ml
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              Med 1 dl = {fmt(vare.gramPrDl)} g bliver {maengdeTekst} til{" "}
              <strong>{svarTekst}</strong>.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tallet er vejledende. Mel, gryn og pulver kan veje lidt forskelligt alt efter,
              hvordan de fyldes i målet, så brug en vægt, når opskriften er følsom.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${maengdeTekst} ${vare.navn.toLowerCase()} = ${svarTekst}`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Gram til dl"
          resultSummary={`${maengdeTekst} = ${svarTekst}`}
        />
      </div>
    </div>
  );
}
