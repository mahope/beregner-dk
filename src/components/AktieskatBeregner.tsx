'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

// 2026-satser
const PROGRESSION_LIMIT = 79400; // Progressionsgrænse for aktieindkomst 2026
const LOW_TAX_RATE = 0.27;       // 27% under grænsen
const HIGH_TAX_RATE = 0.42;      // 42% over grænsen
const ASK_TAX_RATE = 0.17;       // 17% i aktiesparekonto (lagerbeskatning)
const ASK_MAX_DEPOSIT = 174200;  // Max indskud i ASK 2026

type DepotType = 'frit' | 'ask' | 'begge';

export default function AktieskatBeregner() {
  const [depotType, setDepotType] = useState<DepotType>('begge');
  const [gevinst, setGevinst] = useState<string>('');
  const [tab, setTab] = useState<string>('');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'aktieskat') {
      const inputs = urlState.inputs;
      if (inputs.depotType) setDepotType(inputs.depotType);
      if (inputs.gevinst !== undefined) setGevinst(inputs.gevinst);
      if (inputs.tab !== undefined) setTab(inputs.tab);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('aktieskat');
    const timer = setTimeout(() => {
      trackCalculation('aktieskat');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'aktieskat',
      inputs: { depotType, gevinst, tab },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [depotType, gevinst, tab]);

  const handleReset = useCallback(() => {
    setDepotType('begge');
    setGevinst('');
    setTab('');
  }, []);

  const result = useMemo(() => {
    const gevinstNum = parseFloat(gevinst) || 0;
    const tabNum = parseFloat(tab) || 0;
    const nettoGevinst = Math.max(0, gevinstNum - tabNum);

    if (nettoGevinst === 0) return null;

    // Frit depot (realisationsbeskatning)
    let fritSkatLav = 0;
    let fritSkatHoej = 0;
    if (nettoGevinst <= PROGRESSION_LIMIT) {
      fritSkatLav = nettoGevinst * LOW_TAX_RATE;
    } else {
      fritSkatLav = PROGRESSION_LIMIT * LOW_TAX_RATE;
      fritSkatHoej = (nettoGevinst - PROGRESSION_LIMIT) * HIGH_TAX_RATE;
    }
    const fritSkatTotal = Math.round(fritSkatLav + fritSkatHoej);
    const fritEfterSkat = Math.round(nettoGevinst - fritSkatTotal);
    const fritEffektivSats = nettoGevinst > 0 ? Math.round((fritSkatTotal / nettoGevinst) * 1000) / 10 : 0;

    // ASK (lagerbeskatning, 17%)
    const askSkat = Math.round(nettoGevinst * ASK_TAX_RATE);
    const askEfterSkat = Math.round(nettoGevinst - askSkat);

    // Besparelse ved ASK
    const besparelseAsk = fritSkatTotal - askSkat;

    return {
      nettoGevinst,
      fritSkatLav: Math.round(fritSkatLav),
      fritSkatHoej: Math.round(fritSkatHoej),
      fritSkatTotal,
      fritEfterSkat,
      fritEffektivSats,
      askSkat,
      askEfterSkat,
      besparelseAsk,
    };
  }, [gevinst, tab]);

  const formatKr = (n: number) => n.toLocaleString('da-DK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Vis beregning for
            </label>
            <div className="flex gap-2">
              {([['begge', 'Sammenlign'], ['frit', 'Frit depot'], ['ask', 'ASK']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setDepotType(key)}
                  className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    depotType === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Realiseret gevinst (kr.)
            </label>
            <div className="relative">
              <input
                type="number"
                value={gevinst}
                onChange={(e) => setGevinst(e.target.value)}
                placeholder="F.eks. 100.000"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Din samlede gevinst fra salg af aktier, investeringsbeviser eller ETF&apos;er
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Realiseret tab til modregning (kr.)
            </label>
            <div className="relative">
              <input
                type="number"
                value={tab}
                onChange={(e) => setTab(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tab fra aktiesalg kan modregnes i gevinster
            </p>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Aktieskat af {formatKr(result.nettoGevinst)} kr.
              </h3>

              {(depotType === 'frit' || depotType === 'begge') && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Frit depot</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatKr(result.fritSkatTotal)} kr. i skat
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {formatKr(result.fritEfterSkat)} kr. efter skat
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-0.5">
                    {result.fritSkatLav > 0 && (
                      <div>27% af {formatKr(Math.min(result.nettoGevinst, PROGRESSION_LIMIT))} kr. = {formatKr(result.fritSkatLav)} kr.</div>
                    )}
                    {result.fritSkatHoej > 0 && (
                      <div>42% af {formatKr(result.nettoGevinst - PROGRESSION_LIMIT)} kr. = {formatKr(result.fritSkatHoej)} kr.</div>
                    )}
                    <div className="text-gray-400">Effektiv skat: {result.fritEffektivSats}%</div>
                  </div>
                </div>
              )}

              {(depotType === 'ask' || depotType === 'begge') && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Aktiesparekonto (ASK)</div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatKr(result.askSkat)} kr. i skat
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {formatKr(result.askEfterSkat)} kr. efter skat
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    17% lagerbeskatning (max indskud: {formatKr(ASK_MAX_DEPOSIT)} kr.)
                  </div>
                </div>
              )}

              {depotType === 'begge' && result.besparelseAsk > 0 && (
                <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <strong>Besparelse med ASK:</strong> {formatKr(result.besparelseAsk)} kr.
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Du sparer {formatKr(result.besparelseAsk)} kr. i skat ved at investere via aktiesparekonto i stedet for frit depot.
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Beregningen er vejledende og baseret på 2026-satser. Progressionsgrænse: {formatKr(PROGRESSION_LIMIT)} kr.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">📈</div>
              <p>Indtast din aktiegevinst for at se skatten</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Aktieskat: ${formatKr(result.fritSkatTotal)} kr. (frit depot) / ${formatKr(result.askSkat)} kr. (ASK)` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Aktieskat Beregner"
          resultSummary={result ? `Aktieskat: ${formatKr(result.fritSkatTotal)} kr. (frit depot) / ${formatKr(result.askSkat)} kr. (ASK)` : ''}
        />
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Frit depot vs. ASK</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            I et frit depot beskattes du 27/42% ved realisering. I en aktiesparekonto (ASK) beskattes du kun 17%, men der er lagerbeskatning og max indskud på {formatKr(ASK_MAX_DEPOSIT)} kr.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Tab kan modregnes</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Tab på aktier kan modregnes i gevinster. Ubrugte tab kan fremføres til kommende år. Tab i frit depot kan kun modregnes i frit depot.
          </p>
        </div>
      </div>
    </div>
  );
}
