'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

// 2026-satser
const AM = 0.08;
const BUNDSKAT = 0.1201;
const KOMMUNE_SNIT = 0.2507;
const KIRKESKAT_SNIT = 0.0068;
const MELLEMSKAT_GRAENSE = 641200;
const MELLEMSKAT = 0.075;
const TOPSKAT_GRAENSE = 777900;
const TOPSKAT_SATS = 0.075;
const PERSONFRADRAG = 54100;
const BESK_FRADRAG_PCT = 0.1275;
const BESK_FRADRAG_MAX = 63300;

function beregnNetto(bruttoAar: number, komPct: number, kirPct: number): number {
  const amBidrag = bruttoAar * AM;
  const indkomstEfterAm = bruttoAar - amBidrag;
  const skattepligtig = indkomstEfterAm;
  const bundSkat = Math.max(0, skattepligtig - PERSONFRADRAG) * BUNDSKAT;
  const kommuneSkat = Math.max(0, skattepligtig - PERSONFRADRAG) * komPct;
  const kirkeSkat = Math.max(0, skattepligtig - PERSONFRADRAG) * kirPct;
  const mellemSkat = Math.max(0, skattepligtig - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
  const topSkat = Math.max(0, skattepligtig - TOPSKAT_GRAENSE) * TOPSKAT_SATS;
  const samletSkat = amBidrag + bundSkat + kommuneSkat + kirkeSkat + mellemSkat + topSkat;
  return bruttoAar - samletSkat;
}

function findBruttoFraNetto(oensketNettoAar: number, komPct: number, kirPct: number): number {
  // Binary search for brutto that gives the desired netto
  let low = oensketNettoAar;
  let high = oensketNettoAar * 3;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const netto = beregnNetto(mid, komPct, kirPct);
    if (Math.abs(netto - oensketNettoAar) < 1) return mid;
    if (netto < oensketNettoAar) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export default function BruttoNettoBeregner() {
  const [oensketNetto, setOensketNetto] = useState<string>('25000');
  const [periode, setPeriode] = useState<'maaned' | 'aar'>('maaned');
  const [kommuneSkat, setKommuneSkat] = useState<string>('25.07');
  const [medKirkeskat, setMedKirkeskat] = useState(false);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'brutto-netto') {
      const inputs = urlState.inputs;
      if (inputs.oensketNetto !== undefined) setOensketNetto(inputs.oensketNetto);
      if (inputs.periode) setPeriode(inputs.periode);
      if (inputs.kommuneSkat !== undefined) setKommuneSkat(inputs.kommuneSkat);
      if (inputs.medKirkeskat !== undefined) setMedKirkeskat(inputs.medKirkeskat);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('brutto-netto');
    const timer = setTimeout(() => {
      trackCalculation('brutto-netto');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'brutto-netto',
      inputs: { oensketNetto, periode, kommuneSkat, medKirkeskat },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [oensketNetto, periode, kommuneSkat, medKirkeskat]);

  const handleReset = useCallback(() => {
    setOensketNetto('25000');
    setPeriode('maaned');
    setKommuneSkat('25.07');
    setMedKirkeskat(false);
  }, []);

  const result = useMemo(() => {
    const nettoInput = parseFloat(oensketNetto) || 0;
    if (nettoInput <= 0) return null;

    const nettoAar = periode === 'maaned' ? nettoInput * 12 : nettoInput;
    const komPct = (parseFloat(kommuneSkat) || 25.07) / 100;
    const kirPct = medKirkeskat ? KIRKESKAT_SNIT : 0;

    const bruttoAar = findBruttoFraNetto(nettoAar, komPct, kirPct);
    const bruttoMd = bruttoAar / 12;

    const amBidrag = bruttoAar * AM;
    const indkomstEfterAm = bruttoAar - amBidrag;
    const bundSkat = Math.max(0, indkomstEfterAm - PERSONFRADRAG) * BUNDSKAT;
    const kommuneSkatBeloeb = Math.max(0, indkomstEfterAm - PERSONFRADRAG) * komPct;
    const kirkeSkatBeloeb = Math.max(0, indkomstEfterAm - PERSONFRADRAG) * kirPct;
    const mellemSkat = Math.max(0, indkomstEfterAm - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
    const topSkat = Math.max(0, indkomstEfterAm - TOPSKAT_GRAENSE) * TOPSKAT_SATS;
    const samletSkat = amBidrag + bundSkat + kommuneSkatBeloeb + kirkeSkatBeloeb + mellemSkat + topSkat;
    const effektivSkat = bruttoAar > 0 ? (samletSkat / bruttoAar) * 100 : 0;

    return {
      bruttoAar: Math.round(bruttoAar),
      bruttoMd: Math.round(bruttoMd),
      nettoAar: Math.round(nettoAar),
      nettoMd: Math.round(nettoAar / 12),
      amBidrag: Math.round(amBidrag),
      bundSkat: Math.round(bundSkat),
      kommuneSkatBeloeb: Math.round(kommuneSkatBeloeb),
      kirkeSkatBeloeb: Math.round(kirkeSkatBeloeb),
      mellemSkat: Math.round(mellemSkat),
      topSkat: Math.round(topSkat),
      samletSkat: Math.round(samletSkat),
      effektivSkat: Math.round(effektivSkat * 10) / 10,
      betalerMellemskat: indkomstEfterAm > MELLEMSKAT_GRAENSE,
      betalerTopskat: indkomstEfterAm > TOPSKAT_GRAENSE,
    };
  }, [oensketNetto, periode, kommuneSkat, medKirkeskat]);

  const formatKr = (n: number) => n.toLocaleString('da-DK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ønsket udbetaling (netto)
            </label>
            <div className="relative">
              <input type="number" value={oensketNetto} onChange={(e) => setOensketNetto(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setPeriode('maaned')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${periode === 'maaned' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
              Pr. måned
            </button>
            <button onClick={() => setPeriode('aar')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${periode === 'aar' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
              Pr. år
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Kommuneskat (%)</label>
            <div className="relative">
              <input type="number" step="0.01" value={kommuneSkat} onChange={(e) => setKommuneSkat(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="kirke-bn" checked={medKirkeskat} onChange={(e) => setMedKirkeskat(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="kirke-bn" className="text-sm text-gray-700 dark:text-gray-200">Betaler kirkeskat</label>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Du skal tjene</h3>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Nødvendig bruttoløn</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatKr(result.bruttoMd)} kr./md
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  = {formatKr(result.bruttoAar)} kr./år
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Ønsket udbetaling</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatKr(result.nettoMd)} kr./md
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">AM-bidrag (8%)</span><span className="dark:text-gray-200">{formatKr(Math.round(result.amBidrag / 12))} kr./md</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Bundskat</span><span className="dark:text-gray-200">{formatKr(Math.round(result.bundSkat / 12))} kr./md</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Kommuneskat</span><span className="dark:text-gray-200">{formatKr(Math.round(result.kommuneSkatBeloeb / 12))} kr./md</span></div>
                {result.kirkeSkatBeloeb > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Kirkeskat</span><span className="dark:text-gray-200">{formatKr(Math.round(result.kirkeSkatBeloeb / 12))} kr./md</span></div>
                )}
                {result.betalerMellemskat && (
                  <div className="flex justify-between text-yellow-600 dark:text-yellow-400"><span>Mellemskat</span><span>{formatKr(Math.round(result.mellemSkat / 12))} kr./md</span></div>
                )}
                {result.betalerTopskat && (
                  <div className="flex justify-between text-red-600 dark:text-red-400"><span>Topskat</span><span>{formatKr(Math.round(result.topSkat / 12))} kr./md</span></div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 dark:border-gray-600">
                  <span className="dark:text-gray-200">Samlet skat</span>
                  <span className="dark:text-gray-200">{formatKr(Math.round(result.samletSkat / 12))} kr./md</span>
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
                <strong>Effektiv skat:</strong> {result.effektivSkat}% — For hver 100 kr. du tjener, betaler du {result.effektivSkat} kr. i skat.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">💸</div>
              <p>Indtast din ønskede udbetaling</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `For ${formatKr(result.nettoMd)} kr. netto skal du tjene ${formatKr(result.bruttoMd)} kr. brutto` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Brutto/Netto Beregner"
          resultSummary={result ? `Netto ${formatKr(result.nettoMd)} kr. = Brutto ${formatKr(result.bruttoMd)} kr.` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Til lønforhandling</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Brug beregneren til at finde ud af hvilken bruttoløn du skal forhandle dig til for at nå din ønskede udbetaling. Husk at pension og fradrag også påvirker resultatet.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Den omvendte beregning</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Kender du din bruttoløn og vil vide hvad du får udbetalt? Brug vores <a href="/loen-efter-skat" className="underline">løn efter skat beregner</a> i stedet.
          </p>
        </div>
      </div>
    </div>
  );
}
