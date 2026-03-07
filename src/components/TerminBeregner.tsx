'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

const GRAVIDITET_DAGE = 280; // 40 uger

const ugerMilepale: { uge: number; tekst: string }[] = [
  { uge: 4, tekst: "Positiv graviditetstest mulig" },
  { uge: 8, tekst: "Første lægebesøg anbefales" },
  { uge: 12, tekst: "Nakkefoldscanning" },
  { uge: 13, tekst: "2. trimester begynder" },
  { uge: 18, tekst: "Du kan mærke bevægelser" },
  { uge: 20, tekst: "Misdannelsesscanning" },
  { uge: 24, tekst: "Barnet kan overleve uden for livmoderen" },
  { uge: 27, tekst: "3. trimester begynder" },
  { uge: 32, tekst: "Forbered barselstaske" },
  { uge: 34, tekst: "Barsel kan begynde (4 uger før termin)" },
  { uge: 37, tekst: "Barnet er fuldbårent" },
  { uge: 40, tekst: "Terminsdato" },
];

function formatDato(d: Date): string {
  return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ugedagNavn(d: Date): string {
  return d.toLocaleDateString('da-DK', { weekday: 'long' });
}

function dageMellem(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TerminBeregner() {
  const [sidsteMens, setSidsteMens] = useState<string>('');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'termin') {
      if (urlState.inputs.sidsteMens) setSidsteMens(urlState.inputs.sidsteMens);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('termin');
    const timer = setTimeout(() => {
      trackCalculation('termin');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'termin',
      inputs: { sidsteMens },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [sidsteMens]);

  const handleReset = useCallback(() => {
    setSidsteMens('');
  }, []);

  const result = useMemo(() => {
    if (!sidsteMens) return null;

    const smp = new Date(sidsteMens);
    if (isNaN(smp.getTime())) return null;

    const termin = new Date(smp);
    termin.setDate(termin.getDate() + GRAVIDITET_DAGE);

    const idag = new Date();
    idag.setHours(0, 0, 0, 0);
    const dageGaaet = dageMellem(smp, idag);
    const ugerGaaet = Math.floor(dageGaaet / 7);
    const restDage = dageGaaet % 7;
    const dageTilTermin = dageMellem(idag, termin);

    const trimester = ugerGaaet < 13 ? 1 : ugerGaaet < 27 ? 2 : 3;

    // Barsel start (4 uger før termin)
    const barselStart = new Date(termin);
    barselStart.setDate(barselStart.getDate() - 28);

    // Undfangelse (ca. uge 2)
    const undfangelse = new Date(smp);
    undfangelse.setDate(undfangelse.getDate() + 14);

    return {
      termin,
      ugerGaaet,
      restDage,
      dageTilTermin,
      trimester,
      barselStart,
      undfangelse,
      dageGaaet,
    };
  }, [sidsteMens]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Første dag i sidste menstruation
            </label>
            <input
              type="date"
              value={sidsteMens}
              onChange={(e) => setSidsteMens(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Terminsdatoen beregnes som 280 dage (40 uger) fra denne dato
            </p>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">Forventet terminsdato</div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {formatDato(result.termin)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {ugedagNavn(result.termin)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Du er i uge</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {result.ugerGaaet}+{result.restDage}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Trimester</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{result.trimester}.</div>
                </div>
              </div>

              {result.dageTilTermin > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {result.dageTilTermin} dage til termin
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-2">
                    <div
                      className="bg-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (result.dageGaaet / GRAVIDITET_DAGE) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round((result.dageGaaet / GRAVIDITET_DAGE) * 100)}% af graviditeten
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Undfangelse (ca.)</span>
                  <span className="dark:text-gray-200">{formatDato(result.undfangelse)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Barselstart (4 uger før)</span>
                  <span className="dark:text-gray-200">{formatDato(result.barselStart)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">🤰</div>
              <p>Vælg første dag i din sidste menstruation</p>
            </div>
          )}
        </div>
      </div>

      {/* Uge-for-uge milepæle */}
      {result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Milepæle i graviditeten</h3>
          <div className="space-y-2">
            {ugerMilepale.map((m) => {
              const erPasseret = result.ugerGaaet >= m.uge;
              const erNu = result.ugerGaaet === m.uge;
              return (
                <div
                  key={m.uge}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                    erNu
                      ? 'bg-pink-100 dark:bg-pink-900/30 border-2 border-pink-400'
                      : erPasseret
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    erPasseret ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}>
                    {m.uge}
                  </div>
                  <span className={erPasseret ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                    {m.tekst}
                  </span>
                  {erNu && <span className="text-pink-600 dark:text-pink-400 font-medium ml-auto">Nu</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Terminsdato: ${formatDato(result.termin)} (uge ${result.ugerGaaet}+${result.restDage})` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Terminsdato Beregner"
          resultSummary={result ? `Termin: ${formatDato(result.termin)}` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">Sådan beregnes terminen</h4>
          <p className="text-sm text-pink-700 dark:text-pink-400">
            Terminsdatoen beregnes som 280 dage (40 uger) fra første dag i din sidste menstruation. Kun 5% af børn fødes på den præcise terminsdato — de fleste fødes inden for 2 uger.
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Barsel i Danmark</h4>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            Mor har ret til barsel fra 4 uger før termin. Samlet har forældre ret til 52 ugers barsel, hvoraf 11 uger er øremærket til hver forælder. Brug vores barselsdagpenge-beregner for beløb.
          </p>
        </div>
      </div>
    </div>
  );
}
