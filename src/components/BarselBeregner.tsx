'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { useLocale } from "@/components/LocaleProvider";
import { getCurrencySuffix } from "@/lib/format";
import { AffiliateBox } from "./AffiliateBox";

// 2026 satser (kilde: bm.dk, borger.dk)
const MAX_WEEKLY_RATE = 5085; // Max barselsdagpenge per uge 2026
const WORK_HOURS_FULL = 37;   // Full time hours

type Employment = 'fulltime' | 'parttime' | 'selfemployed' | 'unemployed';
type Parent = 'mor' | 'far';

export default function BarselBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      monthlyGross: "Månedlig bruttoløn (kr.)",
      placeholder: "F.eks. 35000",
      employmentType: "Ansættelsestype",
      fulltime: "Fuldtid (37 timer)",
      parttime: "Deltid",
      selfemployed: "Selvstændig",
      unemployed: "Ledig",
      weeklyHours: "Ugentlige timer",
      hoursUnit: "timer",
      youAre: "Du er",
      mother: "Mor",
      fatherCoMother: "Far/medmor",
      plannedWeeks: "Planlagte ugers orlov:",
      weeksUnit: "uger",
      weekUnit: "uge",
      estimatedBenefits: "Estimeret barselsdagpenge",
      weeklyRateBeforeTax: "Ugentlig sats (før skat)",
      maxRateReached: "Maksimumssats nået",
      monthlyBeforeTax: "Månedligt (før skat)",
      monthlyAfterTax: "Månedligt (efter skat)",
      totalForWeeks: "I alt for",
      weeksAfterTax: "uger (efter skat)",
      incomeDrop: "Indkomstnedgang:",
      benefitsCover: "Dagpenge dækker ca.",
      ofYourSalary: "af din løn",
      disclaimer: "* Beregningen er vejledende og baseret på 2026-satser. Den faktiske udbetaling kan variere baseret på din situation.",
      enterSalary: "Indtast din månedsløn for at se beregningen",
      motherLeave: "Mors orlov",
      fatherLeave: "Fars/medmors orlov",
      motherWeek1: "4 uger før termin",
      motherWeek2: "10 uger efter fødsel (øremærket)",
      motherWeek3: "9 uger yderligere (øremærket)",
      motherWeek4: "Op til 13 uger til deling",
      fatherWeek1: "2 uger lige efter fødsel",
      fatherWeek2: "9 uger yderligere (øremærket)",
      fatherWeek3: "Op til 13 uger til deling",
      tip: "Tip",
      tipText: "Tjek din overenskomst eller ansættelseskontrakt. Mange arbejdsgivere supplerer barselsdagpenge med løn, så du får fuld eller delvis løn under barslen.",
    },
    se: {
      monthlyGross: "Månatlig bruttolön (kr)",
      placeholder: "T.ex. 35000",
      employmentType: "Anställningstyp",
      fulltime: "Heltid (37 timmar)",
      parttime: "Deltid",
      selfemployed: "Egenföretagare",
      unemployed: "Arbetslös",
      weeklyHours: "Veckoarbetstimmar",
      hoursUnit: "timmar",
      youAre: "Du är",
      mother: "Mamma",
      fatherCoMother: "Pappa/medförälder",
      plannedWeeks: "Planerade veckors ledighet:",
      weeksUnit: "veckor",
      weekUnit: "vecka",
      estimatedBenefits: "Uppskattad föräldrapenning",
      weeklyRateBeforeTax: "Veckobelopp (före skatt)",
      maxRateReached: "Maxbelopp uppnått",
      monthlyBeforeTax: "Månadsbelopp (före skatt)",
      monthlyAfterTax: "Månadsbelopp (efter skatt)",
      totalForWeeks: "Totalt för",
      weeksAfterTax: "veckor (efter skatt)",
      incomeDrop: "Inkomstminskning:",
      benefitsCover: "Ersättningen täcker ca.",
      ofYourSalary: "av din lön",
      disclaimer: "* Beräkningen är vägledande och baserad på 2026-satser. Den faktiska utbetalningen kan variera beroende på din situation.",
      enterSalary: "Ange din månadslön för att se beräkningen",
      motherLeave: "Mammans ledighet",
      fatherLeave: "Pappans/medförälderns ledighet",
      motherWeek1: "4 veckor före beräknad förlossning",
      motherWeek2: "10 veckor efter förlossning (öronmärkta)",
      motherWeek3: "9 veckor ytterligare (öronmärkta)",
      motherWeek4: "Upp till 13 veckor att dela",
      fatherWeek1: "2 veckor direkt efter förlossning",
      fatherWeek2: "9 veckor ytterligare (öronmärkta)",
      fatherWeek3: "Upp till 13 veckor att dela",
      tip: "Tips",
      tipText: "Kolla ditt kollektivavtal eller anställningsavtal. Många arbetsgivare kompletterar föräldrapenningen med lön, så att du får full eller delvis lön under ledigheten.",
    },
    no: {
      monthlyGross: "Månedlig bruttolønn (kr)",
      placeholder: "F.eks. 35000",
      employmentType: "Ansettelsestype",
      fulltime: "Fulltid (37 timer)",
      parttime: "Deltid",
      selfemployed: "Selvstendig",
      unemployed: "Arbeidsledig",
      weeklyHours: "Ukentlige arbeidstimer",
      hoursUnit: "timer",
      youAre: "Du er",
      mother: "Mor",
      fatherCoMother: "Far/medmor",
      plannedWeeks: "Planlagte ukers permisjon:",
      weeksUnit: "uker",
      weekUnit: "uke",
      estimatedBenefits: "Estimert foreldrepenger",
      weeklyRateBeforeTax: "Ukentlig sats (før skatt)",
      maxRateReached: "Maksimumssats nådd",
      monthlyBeforeTax: "Månedlig (før skatt)",
      monthlyAfterTax: "Månedlig (etter skatt)",
      totalForWeeks: "Totalt for",
      weeksAfterTax: "uker (etter skatt)",
      incomeDrop: "Inntektsnedgang:",
      benefitsCover: "Dagpenger dekker ca.",
      ofYourSalary: "av lønnen din",
      disclaimer: "* Beregningen er veiledende og basert på 2026-satser. Den faktiske utbetalingen kan variere basert på din situasjon.",
      enterSalary: "Skriv inn månedslønnen din for å se beregningen",
      motherLeave: "Mors permisjon",
      fatherLeave: "Fars/medmors permisjon",
      motherWeek1: "4 uker før termin",
      motherWeek2: "10 uker etter fødsel (øremerket)",
      motherWeek3: "9 uker ytterligere (øremerket)",
      motherWeek4: "Opptil 13 uker til deling",
      fatherWeek1: "2 uker rett etter fødsel",
      fatherWeek2: "9 uker ytterligere (øremerket)",
      fatherWeek3: "Opptil 13 uker til deling",
      tip: "Tips",
      tipText: "Sjekk tariffavtalen eller ansettelseskontrakten din. Mange arbeidsgivere supplerer foreldrepenger med lønn, slik at du får full eller delvis lønn under permisjonen.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [employment, setEmployment] = useState<Employment>('fulltime');
  const [weeklyHours, setWeeklyHours] = useState<string>('37');
  const [parent, setParent] = useState<Parent>('mor');
  const [weeksPlanned, setWeeksPlanned] = useState<string>('24');
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'barsel') {
      const inputs = urlState.inputs;
      if (inputs.monthlyIncome !== undefined) setMonthlyIncome(String(inputs.monthlyIncome));
      if (inputs.employment) setEmployment(inputs.employment);
      if (inputs.weeklyHours !== undefined) setWeeklyHours(String(inputs.weeklyHours));
      if (inputs.parent) setParent(inputs.parent);
      if (inputs.weeksPlanned !== undefined) setWeeksPlanned(String(inputs.weeksPlanned));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("barselsdagpenge");
    const timer = setTimeout(() => {
      trackCalculation("barselsdagpenge");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'barsel',
      inputs: { monthlyIncome, employment, weeklyHours, parent, weeksPlanned },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [monthlyIncome, employment, weeklyHours, parent, weeksPlanned]);

  const handleReset = useCallback(() => {
    setMonthlyIncome('');
    setEmployment('fulltime');
    setWeeklyHours('37');
    setParent('mor');
    setWeeksPlanned('24');
  }, []);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome) || 0;
    const hours = parseFloat(weeklyHours) || 37;
    const weeks = parseInt(weeksPlanned) || 24;

    if (income <= 0) return null;

    const monthlyHours = hours * 4.33;
    const hourlyRate = income / monthlyHours;
    const calculatedWeeklyRate = hourlyRate * hours;
    const weeklyRate = Math.min(calculatedWeeklyRate, MAX_WEEKLY_RATE);
    const coveragePercent = Math.min(100, (weeklyRate / calculatedWeeklyRate) * 100);
    const monthlyAmount = weeklyRate * 4.33;
    const totalAmount = weeklyRate * weeks;
    const taxRate = 0.38;
    const monthlyAfterTax = monthlyAmount * (1 - taxRate);
    const totalAfterTax = totalAmount * (1 - taxRate);
    const monthlyLoss = income - monthlyAfterTax;

    return {
      weeklyRate: Math.round(weeklyRate),
      monthlyAmount: Math.round(monthlyAmount),
      monthlyAfterTax: Math.round(monthlyAfterTax),
      totalAmount: Math.round(totalAmount),
      totalAfterTax: Math.round(totalAfterTax),
      coveragePercent: Math.round(coveragePercent),
      monthlyLoss: Math.round(monthlyLoss),
      isMaxed: weeklyRate >= MAX_WEEKLY_RATE,
    };
  }, [monthlyIncome, weeklyHours, weeksPlanned]);

  const fmtNum = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.monthlyGross}
            </label>
            <div className="relative">
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder={l.placeholder}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.employmentType}
            </label>
            <select
              value={employment}
              onChange={(e) => setEmployment(e.target.value as Employment)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
            >
              <option value="fulltime">{l.fulltime}</option>
              <option value="parttime">{l.parttime}</option>
              <option value="selfemployed">{l.selfemployed}</option>
              <option value="unemployed">{l.unemployed}</option>
            </select>
          </div>

          {employment === 'parttime' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {l.weeklyHours}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  min="1"
                  max="37"
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{l.hoursUnit}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.youAre}
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setParent('mor')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'mor'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                👩 {l.mother}
              </button>
              <button
                onClick={() => setParent('far')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'far'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                👨 {l.fatherCoMother}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.plannedWeeks} <span className="font-bold">{weeksPlanned} {l.weeksUnit}</span>
            </label>
            <input
              type="range"
              min="1"
              max="52"
              value={weeksPlanned}
              onChange={(e) => setWeeksPlanned(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 {l.weekUnit}</span>
              <span>26 {l.weeksUnit}</span>
              <span>52 {l.weeksUnit}</span>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {l.estimatedBenefits}
              </h3>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">{l.weeklyRateBeforeTax}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fmtNum(result.weeklyRate)} kr.
                </div>
                {result.isMaxed && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    ⚠️ {l.maxRateReached}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.monthlyBeforeTax}</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fmtNum(result.monthlyAmount)} kr.
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.monthlyAfterTax}</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ~{fmtNum(result.monthlyAfterTax)} kr.
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {l.totalForWeeks} {weeksPlanned} {l.weeksAfterTax}
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ~{fmtNum(result.totalAfterTax)} kr.
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>{l.incomeDrop}</strong> ~{fmtNum(result.monthlyLoss)} kr./md
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {l.benefitsCover} {result.coveragePercent}% {l.ofYourSalary}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {l.disclaimer}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">👶</div>
              <p>{l.enterSalary}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {result && (
        <div className="flex justify-center gap-3 mt-6">
          <CopyResultButton text={`${fmtNum(result.weeklyRate)} kr/${l.weekUnit} (${weeksPlanned} ${l.weeksUnit})`} />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Barselsberegner"
            resultSummary={`${fmtNum(result.weeklyRate)} kr/${l.weekUnit} (${weeksPlanned} ${l.weeksUnit})`}
          />
        </div>
      )}

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {parent === 'mor' ? `👩 ${l.motherLeave}` : `👨 ${l.fatherLeave}`}
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
            {parent === 'mor' ? (
              <>
                <li>• {l.motherWeek1}</li>
                <li>• {l.motherWeek2}</li>
                <li>• {l.motherWeek3}</li>
                <li>• {l.motherWeek4}</li>
              </>
            ) : (
              <>
                <li>• {l.fatherWeek1}</li>
                <li>• {l.fatherWeek2}</li>
                <li>• {l.fatherWeek3}</li>
              </>
            )}
          </ul>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">💡 {l.tip}</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            {l.tipText}
          </p>
        </div>
      </div>
      <AffiliateBox
        title="Forbered babyen"
        subtitle="Alt til den lille — barnevogn, autostol, tøj og udstyr"
        links={[{ name: "Babysam", description: "Danmarks store babyudstyrsbutik — barnevogne, autostole, tøj og legetøj.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=66806&uid=minberegner", cta: "Se udstyr hos Babysam", highlight: true }]}
        className="mt-6"
      />

      <AffiliateBox
        title="Forsikring til den nye familie"
        subtitle="Sammenlign børne-, familie- og ulykkesforsikring"
        links={[{ name: "Findforsikring.dk", description: "Danmarks største forsikringsportal — sammenlign børne-, familie- og ulykkesforsikring og sikr den nye familie bedst muligt.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068&uid=minberegner", cta: "Sammenlign forsikringer", highlight: true }]}
        className="mt-6"
      />
    </div>
  );
}
