'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

// 2026-satser (kilde: skm.dk)
const AM_BIDRAG = 0.08;
const BUNDSKAT = 0.1201;
const MELLEMSKAT_GRAENSE = 641200;
const MELLEMSKAT = 0.075;
const TOPSKAT_GRAENSE = 777900;
const TOPSKAT = 0.075;
const TOP_TOPSKAT_GRAENSE = 2592700;
const TOP_TOPSKAT = 0.05;
const PERSONFRADRAG = 54100;
const BESKAEFTIGELSESFRADRAG_PCT = 0.1275;
const BESKAEFTIGELSESFRADRAG_MAX = 63300;

export default function TopskatBeregner() {
  const [aarsindkomst, setAarsindkomst] = useState<string>('600000');
  const [kommuneSkat, setKommuneSkat] = useState<string>('25.07');
  const [kirkeskat, setKirkeskat] = useState(false);
  const [kirkeSkatPct, setKirkeSkatPct] = useState<string>('0.68');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'topskat') {
      const inputs = urlState.inputs;
      if (inputs.aarsindkomst !== undefined) setAarsindkomst(inputs.aarsindkomst);
      if (inputs.kommuneSkat !== undefined) setKommuneSkat(inputs.kommuneSkat);
      if (inputs.kirkeskat !== undefined) setKirkeskat(inputs.kirkeskat);
      if (inputs.kirkeSkatPct !== undefined) setKirkeSkatPct(inputs.kirkeSkatPct);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('topskat');
    const timer = setTimeout(() => {
      trackCalculation('topskat');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'topskat',
      inputs: { aarsindkomst, kommuneSkat, kirkeskat, kirkeSkatPct },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [aarsindkomst, kommuneSkat, kirkeskat, kirkeSkatPct]);

  const handleReset = useCallback(() => {
    setAarsindkomst('600000');
    setKommuneSkat('25.07');
    setKirkeskat(false);
    setKirkeSkatPct('0.68');
  }, []);

  const result = useMemo(() => {
    const brutto = parseFloat(aarsindkomst) || 0;
    if (brutto <= 0) return null;

    const komPct = (parseFloat(kommuneSkat) || 25.07) / 100;
    const kirPct = kirkeskat ? (parseFloat(kirkeSkatPct) || 0.68) / 100 : 0;

    // AM-bidrag
    const amBidrag = brutto * AM_BIDRAG;
    const indkomstEfterAm = brutto - amBidrag;

    // Beskæftigelsesfradrag
    const beskFradrag = Math.min(brutto * BESKAEFTIGELSESFRADRAG_PCT, BESKAEFTIGELSESFRADRAG_MAX);

    // Skattepligtig indkomst
    const skattepligtig = indkomstEfterAm;

    // Bundskat (af skattepligtig indkomst minus personfradrag)
    const bundSkatBeloeb = Math.max(0, skattepligtig - PERSONFRADRAG) * BUNDSKAT;

    // Kommuneskat + kirkeskat (af skattepligtig indkomst minus personfradrag)
    const kommuneSkatBeloeb = Math.max(0, skattepligtig - PERSONFRADRAG) * komPct;
    const kirkeSkatBeloeb = Math.max(0, skattepligtig - PERSONFRADRAG) * kirPct;

    // Mellemskat
    const mellemSkatBeloeb = Math.max(0, skattepligtig - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
    const betalerMellemskat = skattepligtig > MELLEMSKAT_GRAENSE;

    // Topskat
    const topSkatBeloeb = Math.max(0, skattepligtig - TOPSKAT_GRAENSE) * TOPSKAT;
    const betalerTopskat = skattepligtig > TOPSKAT_GRAENSE;

    // Top-topskat
    const topTopSkatBeloeb = Math.max(0, skattepligtig - TOP_TOPSKAT_GRAENSE) * TOP_TOPSKAT;
    const betalerTopTopskat = skattepligtig > TOP_TOPSKAT_GRAENSE;

    // Samlet skat
    const samletSkat = amBidrag + bundSkatBeloeb + kommuneSkatBeloeb + kirkeSkatBeloeb + mellemSkatBeloeb + topSkatBeloeb + topTopSkatBeloeb;
    const nettoLoen = brutto - samletSkat;

    // Effektiv skatteprocent
    const effektivSkat = brutto > 0 ? (samletSkat / brutto) * 100 : 0;

    // Marginal skatteprocent (skat af den sidst tjente krone)
    let marginalSkat = AM_BIDRAG + BUNDSKAT + komPct + kirPct;
    if (betalerMellemskat) marginalSkat += MELLEMSKAT;
    if (betalerTopskat) marginalSkat += TOPSKAT;
    if (betalerTopTopskat) marginalSkat += TOP_TOPSKAT;
    // Skatteloft: ca. 52,07%
    const marginalPct = Math.min(marginalSkat * 100, 52.07 + AM_BIDRAG * 100);

    // Hvad skal du tjene før topskat?
    const topSkatBruttoGraense = Math.round(TOPSKAT_GRAENSE / (1 - AM_BIDRAG));
    const mellemSkatBruttoGraense = Math.round(MELLEMSKAT_GRAENSE / (1 - AM_BIDRAG));

    return {
      brutto,
      amBidrag: Math.round(amBidrag),
      indkomstEfterAm: Math.round(indkomstEfterAm),
      beskFradrag: Math.round(beskFradrag),
      bundSkatBeloeb: Math.round(bundSkatBeloeb),
      kommuneSkatBeloeb: Math.round(kommuneSkatBeloeb),
      kirkeSkatBeloeb: Math.round(kirkeSkatBeloeb),
      mellemSkatBeloeb: Math.round(mellemSkatBeloeb),
      betalerMellemskat,
      topSkatBeloeb: Math.round(topSkatBeloeb),
      betalerTopskat,
      topTopSkatBeloeb: Math.round(topTopSkatBeloeb),
      betalerTopTopskat,
      samletSkat: Math.round(samletSkat),
      nettoLoen: Math.round(nettoLoen),
      effektivSkat: Math.round(effektivSkat * 10) / 10,
      marginalPct: Math.round(marginalPct * 10) / 10,
      topSkatBruttoGraense,
      mellemSkatBruttoGraense,
      overMellemskat: Math.max(0, Math.round(indkomstEfterAm - MELLEMSKAT_GRAENSE)),
      overTopskat: Math.max(0, Math.round(indkomstEfterAm - TOPSKAT_GRAENSE)),
    };
  }, [aarsindkomst, kommuneSkat, kirkeskat, kirkeSkatPct]);

  const formatKr = (n: number) => n.toLocaleString('da-DK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bruttoindkomst (pr. år)</label>
            <div className="relative">
              <input type="number" value={aarsindkomst} onChange={(e) => setAarsindkomst(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              = {formatKr(Math.round((parseFloat(aarsindkomst) || 0) / 12))} kr./md
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Kommuneskat (%)</label>
            <div className="relative">
              <input type="number" step="0.01" value={kommuneSkat} onChange={(e) => setKommuneSkat(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="kirkeskat"
              checked={kirkeskat}
              onChange={(e) => setKirkeskat(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="kirkeskat" className="text-sm text-gray-700 dark:text-gray-200">
              Betaler kirkeskat ({kirkeSkatPct}%)
            </label>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {/* Status */}
              {result.betalerTopskat ? (
                <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-red-800 dark:text-red-300">Du betaler topskat</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatKr(result.topSkatBeloeb)} kr./år</div>
                  <div className="text-xs text-red-700 dark:text-red-400 mt-1">
                    {formatKr(result.overTopskat)} kr. over topskattegrænsen
                  </div>
                </div>
              ) : result.betalerMellemskat ? (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Du betaler mellemskat, men ikke topskat</div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatKr(result.mellemSkatBeloeb)} kr./år</div>
                  <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Du mangler {formatKr(Math.round(TOPSKAT_GRAENSE - result.indkomstEfterAm))} kr. i at nå topskattegrænsen
                  </div>
                </div>
              ) : (
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
                  <div className="text-sm font-medium text-green-800 dark:text-green-300">Du betaler hverken mellemskat eller topskat</div>
                  <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Du kan tjene {formatKr(result.mellemSkatBruttoGraense - result.brutto)} kr. mere årligt før mellemskat
                  </div>
                </div>
              )}

              {/* Nøgletal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Effektiv skat</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{result.effektivSkat}%</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Marginalskat</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{result.marginalPct}%</div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">AM-bidrag (8%)</span><span className="dark:text-gray-200">{formatKr(result.amBidrag)} kr.</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Bundskat (12,01%)</span><span className="dark:text-gray-200">{formatKr(result.bundSkatBeloeb)} kr.</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Kommuneskat ({kommuneSkat}%)</span><span className="dark:text-gray-200">{formatKr(result.kommuneSkatBeloeb)} kr.</span></div>
                {kirkeskat && (
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Kirkeskat ({kirkeSkatPct}%)</span><span className="dark:text-gray-200">{formatKr(result.kirkeSkatBeloeb)} kr.</span></div>
                )}
                {result.betalerMellemskat && (
                  <div className="flex justify-between text-yellow-700 dark:text-yellow-400"><span>Mellemskat (7,5%)</span><span>{formatKr(result.mellemSkatBeloeb)} kr.</span></div>
                )}
                {result.betalerTopskat && (
                  <div className="flex justify-between text-red-600 dark:text-red-400"><span>Topskat (7,5%)</span><span>{formatKr(result.topSkatBeloeb)} kr.</span></div>
                )}
                {result.betalerTopTopskat && (
                  <div className="flex justify-between text-red-700 dark:text-red-300"><span>Top-topskat (5%)</span><span>{formatKr(result.topTopSkatBeloeb)} kr.</span></div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 dark:border-gray-600"><span className="dark:text-gray-200">Samlet skat</span><span className="dark:text-gray-200">{formatKr(result.samletSkat)} kr.</span></div>
                <div className="flex justify-between font-bold text-green-600 dark:text-green-400 border-t pt-2 dark:border-gray-600"><span>Netto (udbetalt)</span><span>{formatKr(result.nettoLoen)} kr./år</span></div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
                <strong>Grænser 2026:</strong> Mellemskat fra {formatKr(result.mellemSkatBruttoGraense)} kr./år brutto. Topskat fra {formatKr(result.topSkatBruttoGraense)} kr./år brutto.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">📊</div>
              <p>Indtast din årsindkomst for at se din skat</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Skat: ${formatKr(result.samletSkat)} kr./år (effektiv ${result.effektivSkat}%, marginal ${result.marginalPct}%)` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Topskat Beregner"
          resultSummary={result ? `Effektiv skat: ${result.effektivSkat}% — Netto: ${formatKr(result.nettoLoen)} kr./år` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Ny skattemodel 2026</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            I 2026 er den gamle topskat erstattet af tre trin: mellemskat (7,5% over {formatKr(MELLEMSKAT_GRAENSE)} kr.), topskat (7,5% over {formatKr(TOPSKAT_GRAENSE)} kr.) og top-topskat (5% over {formatKr(TOP_TOPSKAT_GRAENSE)} kr.).
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Skatteloft</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Der er et skatteloft på ca. 52,07% (ekskl. AM-bidrag og kirkeskat). Det sikrer at din samlede marginalskat aldrig overstiger dette niveau.
          </p>
        </div>
      </div>
    </div>
  );
}
