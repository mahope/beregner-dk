"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

// Officielle 2026 dagpenge-satser
// Kilde: bm.dk/satser/satser-for-2026, a-kasser.dk
const SATSER_2026 = {
  maxDagpenge: 22041, // Max dagpengesats kr/måned (2026)
  beskaeftigelsesTillaeg: 26198, // Med beskæftigelsestillæg, de første 3 mdr
  dagpengeProcent: 90, // % af beregningsgrundlag
  amBidragProcent: 8, // AM-bidrag fratrækkes først
  dimittendsats: 15174, // Dimittend-sats (ikke-forsørgere, 2026 estimat)
  dimittendsatsForsorger: 22041, // Dimittend-sats forsørgere = max sats
};

interface DagpengeResultat {
  maanedligDagpenge: number;
  medBeskaeftigelsesTillaeg: number;
  ugentligDagpenge: number;
  dagligSats: number;
  procentAfLoen: number;
  erMaxSats: boolean;
  beregningsgrundlag: number;
}

export default function DagpengeBeregner() {
  const [maanedsloen, setMaanedsloen] = useState<string>("");
  const [arbejdstimer, setArbejdstimer] = useState<string>("37");
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'dagpenge') {
      const inputs = urlState.inputs;
      if (inputs.maanedsloen !== undefined) setMaanedsloen(String(inputs.maanedsloen));
      if (inputs.arbejdstimer !== undefined) setArbejdstimer(String(inputs.arbejdstimer));
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'dagpenge',
      inputs: { maanedsloen, arbejdstimer },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maanedsloen, arbejdstimer]);

  // Loading state for beregning
  const isLoading = useCalculationLoading([maanedsloen, arbejdstimer]);

  const resultat = useMemo<DagpengeResultat | null>(() => {
    const loen = parseFloat(maanedsloen);
    const timer = parseFloat(arbejdstimer);

    if (!loen || loen <= 0 || !timer || timer <= 0) return null;

    // Beregningsgrundlag: løn EFTER AM-bidrag (8%)
    const beregningsgrundlag = loen * (1 - SATSER_2026.amBidragProcent / 100);

    // Dagpenge = 90% af beregningsgrundlag
    const beregnetDagpenge = beregningsgrundlag * (SATSER_2026.dagpengeProcent / 100);

    // Juster for deltid
    const deltidsFaktor = timer / 37;
    const maxDagpengeJusteret = SATSER_2026.maxDagpenge * deltidsFaktor;
    const maxMedTillaeg = SATSER_2026.beskaeftigelsesTillaeg * deltidsFaktor;

    const erMaxSats = beregnetDagpenge >= maxDagpengeJusteret;
    const maanedligDagpenge = erMaxSats ? maxDagpengeJusteret : beregnetDagpenge;
    const medBeskaeftigelsesTillaeg = erMaxSats ? maxMedTillaeg : beregnetDagpenge;

    return {
      maanedligDagpenge: Math.round(maanedligDagpenge),
      medBeskaeftigelsesTillaeg: Math.round(medBeskaeftigelsesTillaeg),
      ugentligDagpenge: Math.round(maanedligDagpenge / 4.33),
      dagligSats: Math.round(maanedligDagpenge / 22),
      procentAfLoen: Math.round((maanedligDagpenge / loen) * 100),
      erMaxSats,
      beregningsgrundlag: Math.round(beregningsgrundlag),
    };
  }, [maanedsloen, arbejdstimer]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="space-y-6">
        {/* Input: Månedlig løn */}
        <div>
          <label
            htmlFor="maanedsloen"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              kr/md
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Din gennemsnitlige månedsløn de seneste 12 måneder
          </p>
        </div>

        {/* Input: Arbejdstimer */}
        <div>
          <label
            htmlFor="arbejdstimer"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Ugentlige arbejdstimer
          </label>
          <select
            id="arbejdstimer"
            value={arbejdstimer}
            onChange={(e) => setArbejdstimer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dine estimerede dagpenge
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Månedligt</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {resultat.maanedligDagpenge.toLocaleString("da-DK")} kr
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Ugentligt</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {resultat.ugentligDagpenge.toLocaleString("da-DK")} kr
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">Dagligt (ca.)</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {resultat.dagligSats.toLocaleString("da-DK")} kr
                </p>
              </div>
            </div>

            {resultat.erMaxSats && resultat.medBeskaeftigelsesTillaeg > resultat.maanedligDagpenge && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Beskæftigelsestillæg:</strong> De første 3 måneder kan du få op til {resultat.medBeskaeftigelsesTillaeg.toLocaleString("da-DK")} kr/md hvis du opfylder kravene.
                </p>
              </div>
            )}

            {resultat.erMaxSats && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Du rammer maxsatsen på {SATSER_2026.maxDagpenge.toLocaleString("da-DK")} kr/md. Din løn giver et beregningsgrundlag på {resultat.beregningsgrundlag.toLocaleString("da-DK")} kr (efter 8% AM-bidrag).
                </p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Dagpengene svarer til <strong>{resultat.procentAfLoen}%</strong> af din bruttoløn.
                Beregning: {resultat.beregningsgrundlag.toLocaleString("da-DK")} kr (løn efter AM-bidrag) × 90% = {Math.round(resultat.beregningsgrundlag * 0.9).toLocaleString("da-DK")} kr
              </p>
            </div>
          </div>
        )}
        </CalculationLoading>

        {resultat && (
          <div className="flex justify-center mt-6">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Dagpengeberegner"
              resultSummary={`${resultat.maanedligDagpenge.toLocaleString("da-DK")} kr/md`}
            />
          </div>
        )}

        {/* Info boks */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Officielle dagpenge-satser 2026</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>Dagpenge = 90% af løn efter AM-bidrag (8%)</li>
            <li>Max dagpengesats: {SATSER_2026.maxDagpenge.toLocaleString("da-DK")} kr/md</li>
            <li>Med beskæftigelsestillæg (første 3 mdr): op til {SATSER_2026.beskaeftigelsesTillaeg.toLocaleString("da-DK")} kr/md</li>
            <li>Dagpengeperioden er normalt 2 år (3.848 timer)</li>
            <li>Du skal være medlem af en A-kasse og opfylde indkomstkravet</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Kilde: bm.dk/satser/satser-for-2026 — Kontakt din A-kasse for præcis beregning.
          </p>
        </div>
      </div>
    </div>
  );
}
