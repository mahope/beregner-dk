"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  BOERNEBIDRAG_AAR,
  BOERNEBIDRAG_EKSEMPEL,
  BOERNEBIDRAG_2026,
  FRADRAGSVAERDI_PCT,
  MAX_ANTAL_BOERN,
  beregnBoernebidrag,
  formaterGrae,
} from "@/lib/boernebidrag";

const kr = (n: number, maks = 0) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function talFraState(vaerdi: unknown, standardvaerdi: number): number {
  const tal = typeof vaerdi === "number" ? vaerdi : Number(vaerdi);
  return Number.isFinite(tal) ? tal : standardvaerdi;
}

export default function BoernebidragBeregner() {
  const [antalBorn, setAntalBorn] = useState(BOERNEBIDRAG_EKSEMPEL.antalBorn);
  const [aarligIndomst, setAarligIndomst] = useState(BOERNEBIDRAG_EKSEMPEL.aarligIndomst);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "boernebidrag") {
      const i = urlState.inputs;
      if (i.antalBorn !== undefined) {
        setAntalBorn(talFraState(i.antalBorn, BOERNEBIDRAG_EKSEMPEL.antalBorn));
      }
      if (i.aarligIndomst !== undefined) {
        setAarligIndomst(talFraState(i.aarligIndomst, BOERNEBIDRAG_EKSEMPEL.aarligIndomst));
      }
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("boernebidrag");
    const timer = setTimeout(() => {
      trackCalculation("boernebidrag");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setAntalBorn(BOERNEBIDRAG_EKSEMPEL.antalBorn);
    setAarligIndomst(BOERNEBIDRAG_EKSEMPEL.aarligIndomst);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "boernebidrag",
      inputs: { antalBorn, aarligIndomst },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [antalBorn, aarligIndomst]);

  const resultat = useMemo(
    () => beregnBoernebidrag({ antalBorn, aarligIndomst }),
    [antalBorn, aarligIndomst],
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="boernebidrag-antal" className={labelClass}>
              Hvor mange børn er du forælder til?
            </label>
            <select
              id="boernebidrag-antal"
              value={antalBorn}
              onChange={(e) => setAntalBorn(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: MAX_ANTAL_BOERN }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n === 1 ? "1 barn" : `${n} børn`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Indkomstoversigten for {BOERNEBIDRAG_AAR} har en kolonne for 1 til{" "}
              {MAX_ANTAL_BOERN} børn, så det er så mange regneren tager imod.
            </p>
          </div>

          <div>
            <label htmlFor="boernebidrag-indkomst" className={labelClass}>
              Din årlige indkomst før skat (kr.)
            </label>
            <input
              id="boernebidrag-indkomst"
              type="number"
              min="0"
              step="10000"
              inputMode="numeric"
              value={aarligIndomst}
              onChange={(e) => setAarligIndomst(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Den årlige indkomst, bidragsbetaleren har — den samles på årsbasis,
              ikke måned for måned.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Sådan er normalbidraget bygget op i {BOERNEBIDRAG_AAR}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Grundbeløb {kr(BOERNEBIDRAG_2026.grundbeloebMaaned)} kr. + tillæg{" "}
              {kr(BOERNEBIDRAG_2026.tillaegMaaned)} kr. ={" "}
              <strong>{kr(BOERNEBIDRAG_2026.normalbidragMaaned)} kr. pr. måned</strong>. Et
              forhøjet bidrag lægger procenttillægget oveni — og procenten regnes kun
              af grundbeløbet, ikke af hele normalbidraget.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-indigo-50 dark:from-pink-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-pink-100 dark:bg-pink-900/30">
              <div className="text-sm font-medium text-pink-800 dark:text-pink-300">
                Du skal betale pr. måned
              </div>
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                {kr(resultat.bidragSamletMaaned)} kr.
              </div>
              <div className="text-sm text-pink-800 dark:text-pink-300">
                {kr(resultat.bidragSamletAar)} kr. om året til{" "}
                {resultat.antalBorn === 1 ? "1 barn" : `${resultat.antalBorn} børn`}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Pr. barn</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {kr(resultat.bidragPrBarnMaaned)} kr.
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Procenttillæg</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {resultat.niveauPct === 0 ? "0 %" : `${resultat.niveauPct} %`}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Skattefradrag pr. måned: {kr(resultat.skattefradragMaaned)} kr.
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                Ved {FRADRAGSVAERDI_PCT} % fradragsværdi er det svar til ca.{" "}
                <strong>{kr(resultat.skatteBesparelseMaaned)} kr.</strong> pr. måned — altså{" "}
                {kr(resultat.skatteBesparelseAar)} kr. om året.
              </p>
            </div>

            {resultat.manglerTilNaeste > 0 ? (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Du er {kr(resultat.manglerTilNaeste)} kr. under{" "}
                {formaterGrae(resultat.naesteGrae)}, som er grænsen for{" "}
                {resultat.naesteNiveauPct} %.
              </p>
            ) : resultat.niveauPct > 0 ? (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Du har nået det højeste niveau i oversigten, {resultat.niveauPct} %.
              </p>
            ) : (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Under {formaterGrae(resultat.naesteGrae)} er der intet procenttillæg, så
                bidraget er bare normalbidraget.
              </p>
            )}

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              {resultat.antalBorn === 1 ? "1 barn" : `${resultat.antalBorn} børn`} og{" "}
              {kr(resultat.aarligIndomst)} kr. i indkomst giver{" "}
              <strong>{kr(resultat.bidragPrBarnMaaned)} kr. pr. barn pr. måned</strong>
              {resultat.niveauPct > 0
                ? ` — normalbidraget plus ${resultat.niveauPct} % af grundbeløbet på ${kr(
                    BOERNEBIDRAG_2026.grundbeloebMaaned,
                  )} kr.`
                : " — altså normalbidraget uden tillæg."}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Indkomstniveauerne er vejledende beløb fra indkomstoversigten for{" "}
              {BOERNEBIDRAG_AAR}. Det er Familieretshuset eller en aftale mellem
              forældrene, der fastsætter det endelige beløb, og samvær og andre
              forhold kan ændre det.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${resultat.antalBorn} ${resultat.antalBorn === 1 ? "barn" : "børn"} = ${kr(
            resultat.bidragSamletMaaned,
          )} kr. pr. måned (${kr(resultat.bidragSamletAar)} kr. pr. år)`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Børnebidragsberegner"
          resultSummary={`${kr(resultat.bidragSamletMaaned)} kr. pr. måned`}
        />
        <ResetButton onReset={handleReset} />
      </div>
    </div>
  );
}
