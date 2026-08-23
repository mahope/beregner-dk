'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Baby } from 'lucide-react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { useLocale } from '@/components/LocaleProvider';

const GRAVIDITET_DAGE = 280; // 40 uger

const ugerMilepale: number[] = [4, 8, 12, 13, 18, 20, 24, 27, 32, 34, 37, 40];

const labels = {
  da: {
    lastPeriodLabel: "Første dag i sidste menstruation",
    hint: "Terminsdatoen beregnes som 280 dage (40 uger) fra denne dato",
    expectedDueDate: "Forventet terminsdato",
    youAreInWeek: "Du er i uge",
    trimester: "Trimester",
    daysToTermin: (n: number) => `${n} dage til termin`,
    pctPregnancy: (n: number) => `${n}% af graviditeten`,
    conception: "Undfangelse (ca.)",
    maternityStart: "Barselstart (4 uger før)",
    emptyState: "Vælg første dag i din sidste menstruation",
    milestonesTitle: "Milepæle i graviditeten",
    nowBadge: "Nu",
    copySummary: (date: string, w: number, r: number) => `Terminsdato: ${date} (uge ${w}+${r})`,
    shareSummary: (date: string) => `Termin: ${date}`,
    calcName: "Terminsdato Beregner",
    info1Title: "Sådan beregnes terminen",
    info1Desc:
      "Terminsdatoen beregnes som 280 dage (40 uger) fra første dag i din sidste menstruation. Kun 5% af børn fødes på den præcise terminsdato — de fleste fødes inden for 2 uger.",
    info2Title: "Barsel i Danmark",
    info2Desc:
      "Mor har ret til barsel fra 4 uger før termin. Samlet har forældre ret til 52 ugers barsel, hvoraf 11 uger er øremærket til hver forælder. Brug vores barselsdagpenge-beregner for beløb.",
    milestones: {
      4: "Positiv graviditetstest mulig",
      8: "Første lægebesøg anbefales",
      12: "Nakkefoldscanning",
      13: "2. trimester begynder",
      18: "Du kan mærke bevægelser",
      20: "Misdannelsesscanning",
      24: "Barnet kan overleve uden for livmoderen",
      27: "3. trimester begynder",
      32: "Forbered barselstaske",
      34: "Barsel kan begynde (4 uger før termin)",
      37: "Barnet er fuldbårent",
      40: "Terminsdato",
    } as Record<number, string>,
  },
  se: {
    lastPeriodLabel: "Första dagen i din senaste menstruation",
    hint: "Beräknat förlossningsdatum räknas som 280 dagar (40 veckor) från detta datum",
    expectedDueDate: "Beräknat förlossningsdatum",
    youAreInWeek: "Du är i vecka",
    trimester: "Trimester",
    daysToTermin: (n: number) => `${n} dagar till förlossning`,
    pctPregnancy: (n: number) => `${n}% av graviditeten`,
    conception: "Befruktning (ca.)",
    maternityStart: "Föräldraledighet (4 veckor före)",
    emptyState: "Välj första dagen i din senaste menstruation",
    milestonesTitle: "Milstolpar i graviditeten",
    nowBadge: "Nu",
    copySummary: (date: string, w: number, r: number) => `Beräknat förlossningsdatum: ${date} (vecka ${w}+${r})`,
    shareSummary: (date: string) => `BF: ${date}`,
    calcName: "Förlossningsdatum-kalkylator",
    info1Title: "Så beräknas förlossningsdatumet",
    info1Desc:
      "Beräknat förlossningsdatum räknas som 280 dagar (40 veckor) från första dagen i din senaste menstruation. Endast 5 % av barnen föds på det exakta datumet — de flesta föds inom 2 veckor.",
    info2Title: "Föräldraledighet i Sverige",
    info2Desc:
      "I Sverige har föräldrar tillsammans rätt till 480 dagars föräldrapenning, varav 90 dagar är reserverade för vardera föräldern. Mamman kan börja ta ut föräldrapenning upp till 60 dagar före beräknad förlossning.",
    milestones: {
      4: "Positivt graviditetstest möjligt",
      8: "Första läkarbesöket rekommenderas",
      12: "Nackuppklarhetsmätning (KUB)",
      13: "Andra trimestern börjar",
      18: "Du kan känna rörelser",
      20: "Rutinultraljud",
      24: "Barnet kan överleva utanför livmodern",
      27: "Tredje trimestern börjar",
      32: "Packa förlossningsväskan",
      34: "Föräldraledighet kan börja (4 veckor före förlossning)",
      37: "Barnet är fullgånget",
      40: "Beräknat förlossningsdatum",
    } as Record<number, string>,
  },
} as const;

function formatDato(d: Date, dateLocale: string): string {
  return d.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function ugedagNavn(d: Date, dateLocale: string): string {
  return d.toLocaleDateString(dateLocale, { weekday: 'long' });
}

function dageMellem(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TerminBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const dateLocale = locale === "se" ? "sv-SE" : "da-DK";
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
              {l.lastPeriodLabel}
            </label>
            <input
              type="date"
              value={sidsteMens}
              onChange={(e) => setSidsteMens(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {l.hint}
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
                <div className="text-sm text-gray-500 dark:text-gray-400">{l.expectedDueDate}</div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {formatDato(result.termin, dateLocale)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {ugedagNavn(result.termin, dateLocale)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.youAreInWeek}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {result.ugerGaaet}+{result.restDage}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.trimester}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{result.trimester}.</div>
                </div>
              </div>

              {result.dageTilTermin > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {l.daysToTermin(result.dageTilTermin)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mt-2">
                    <div
                      className="bg-pink-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (result.dageGaaet / GRAVIDITET_DAGE) * 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {l.pctPregnancy(Math.round((result.dageGaaet / GRAVIDITET_DAGE) * 100))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l.conception}</span>
                  <span className="dark:text-gray-200">{formatDato(result.undfangelse, dateLocale)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{l.maternityStart}</span>
                  <span className="dark:text-gray-200">{formatDato(result.barselStart, dateLocale)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="mb-3 flex justify-center">
                <Baby className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p>{l.emptyState}</p>
            </div>
          )}
        </div>
      </div>

      {/* Uge-for-uge milepæle */}
      {result && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">{l.milestonesTitle}</h3>
          <div className="space-y-2">
            {ugerMilepale.map((uge) => {
              const erPasseret = result.ugerGaaet >= uge;
              const erNu = result.ugerGaaet === uge;
              return (
                <div
                  key={uge}
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
                    {uge}
                  </div>
                  <span className={erPasseret ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                    {l.milestones[uge]}
                  </span>
                  {erNu && <span className="text-pink-600 dark:text-pink-400 font-medium ml-auto">{l.nowBadge}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? l.copySummary(formatDato(result.termin, dateLocale), result.ugerGaaet, result.restDage) : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calcName}
          resultSummary={result ? l.shareSummary(formatDato(result.termin, dateLocale)) : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-pink-800 dark:text-pink-300 mb-2">{l.info1Title}</h4>
          <p className="text-sm text-pink-700 dark:text-pink-400">
            {l.info1Desc}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">{l.info2Title}</h4>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {l.info2Desc}
          </p>
        </div>
      </div>
    </div>
  );
}
