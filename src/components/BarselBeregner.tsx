'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Baby, Lightbulb, TriangleAlert, User, UserRound } from 'lucide-react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import {
  beregnBarselsdagpenge,
  fordelBarselsUger,
  isBarselEmployment,
  isBarselParent,
  type BarselEmployment,
  type BarselParent,
} from '@/lib/barselsdagpenge';
import { BARSEL_2026 } from '@/lib/satser-2026';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { useLocale } from "@/components/LocaleProvider";
import { getCurrencySuffix } from "@/lib/format";
import { AffiliateBox } from "./AffiliateBox";
import { adtractionLink } from "@/lib/adtraction";

const DEFAULT_EMPLOYER_WEEKS = '14';

export default function BarselBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      monthlyGross: "Månedlig bruttoløn (kr.)",
      placeholder: "F.eks. 35000",
      employmentType: "Beregningsgrundlag",
      fulltime: `Lønmodtager, fuldtid (${BARSEL_2026.fullTimeHours} timer)`,
      parttime: "Lønmodtager, deltid",
      selfemployed: "Selvstændig",
      unemployed: "Ledig (a-kasse)",
      monthlyProfit: "Månedligt overskud før skat (kr.)",
      monthlyBenefit: "Dine månedlige a-dagpenge (kr.)",
      profitHint: `Satsen beregnes af virksomhedens overskud. Fuld sats kræver et årligt overskud på ca. ${BARSEL_2026.selfEmployedProfitForMaxRate.toLocaleString("da-DK")} kr. Kilde:`,
      benefitHint: "Ledige får samme sats som deres a-dagpenge, dog højst maksimum. Kender du ikke dine dagpenge, så brug dagpengeberegneren. Kilde:",
      enterBenefit: "Indtast dine månedlige a-dagpenge for at se beregningen",
      enterProfit: "Indtast dit månedlige overskud for at se beregningen",
      employerPays: "Min arbejdsgiver betaler løn under barsel",
      employerWeeksLabel: "Uger med løn fra arbejdsgiveren:",
      employerPercentLabel: "Arbejdsgiveren betaler (andel af lønnen)",
      employerNote: "Arbejdsgiveren får dagpengene som refusion i de uger, så du får lønnen i stedet for dagpengene. Tjek din overenskomst for, hvor mange uger der er med løn.",
      withSalary: "med løn",
      withBenefit: "med barselsdagpenge",
      perMonthAfterTax: "om måneden efter skat",
      averageLabel: "Gennemsnit pr. måned under hele barslen",
      weeklyRateCapReached: "Satsen er afkortet til maksimum",
      verified: "verificeret",
      transferLabel: "Overdragelse mellem jer:",
      transferNone: "Ingen overdragelse",
      transferGive: "Du overdrager",
      transferTake: "Du overtager",
      transferGiveShort: `Overdrager ${BARSEL_2026.maxTransferableWeeks} uger`,
      transferTakeShort: `Overtager ${BARSEL_2026.maxTransferableWeeks} uger`,
      splitTitle: "Fordeling af ugerne",
      yourWeeks: "Dine uger med barselsdagpenge",
      partnerWeeks: "Din partners uger",
      beforeBirth: "uger før fødslen",
      afterBirth: "uger efter fødslen",
      earmarkedLine: "uger er øremærket til dig og kan ikke overdrages (2 ved fødslen og 9 senere, kun for lønmodtagere).",
      canTransferLine: "Du kan overdrage eller overtage op til",
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
      hourlyRateCapReached: "Maksimum timeløn nået",
      monthlyBeforeTax: "Månedligt (før skat)",
      monthlyAfterTax: "Månedligt (efter skat)",
      totalForWeeks: "I alt for",
      weeksAfterTax: "uger (efter skat)",
      incomeDrop: "Indkomstnedgang:",
      benefitsCover: "Dagpenge dækker ca.",
      ofYourSalary: "af din løn",
      disclaimer: "* Vejledende beregning efter 2026-satser og et skøn over skatten (gennemsnitlig kommuneskat, uden kirkeskat). Den faktiske udbetaling kan variere. Kilde:",
      enterSalary: "Indtast din månedsløn for at se beregningen",
      motherLeave: "Mors orlov",
      fatherLeave: "Fars/medmors orlov",
      motherWeek1: `${BARSEL_2026.motherBeforeBirthWeeks} uger før termin`,
      motherWeek2: `${BARSEL_2026.motherAtBirthWeeks} + ${BARSEL_2026.motherEarlyAfterBirthWeeks} uger efter fødsel (${BARSEL_2026.motherEarlyAfterBirthWeeks} kan overdrages under særlige betingelser)`,
      motherWeek3: `${BARSEL_2026.earmarkedWeeks} uger yderligere (øremærket)`,
      motherWeek4: `${BARSEL_2026.motherLateTransferableWeeks} uger efter de første ${BARSEL_2026.firstTenWeeksAfterBirth} uger (kan overdrages)`,
      fatherWeek1: `${BARSEL_2026.fatherAtBirthWeeks} uger i de første ${BARSEL_2026.firstTenWeeksAfterBirth} uger (kan fordeles fleksibelt efter aftale med arbejdsgiveren)`,
      fatherWeek2: `${BARSEL_2026.earmarkedWeeks} uger yderligere (øremærket)`,
      fatherWeek3: `Op til ${BARSEL_2026.maxTransferableWeeks} uger til overdragelse (som udgangspunkt inden for barnets første år)`,
      tip: "Tip",
      tipText: "Tjek din overenskomst eller ansættelseskontrakt. Mange arbejdsgivere supplerer barselsdagpenge med løn, så du får fuld eller delvis løn under barslen.",
    },
    se: {
      monthlyGross: "Månatlig bruttolön (kr)",
      placeholder: "T.ex. 35000",
      employmentType: "Beräkningsunderlag",
      fulltime: `Heltid (${BARSEL_2026.fullTimeHours} timmar)`,
      parttime: "Deltid",
      selfemployed: "Egenföretagare – se Min barsel",
      unemployed: "Arbetslös – se Min barsel",
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
      hourlyRateCapReached: "Maximal timlön nådd",
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
      employmentType: "Beregningsgrunnlag",
      fulltime: `Fulltid (${BARSEL_2026.fullTimeHours} timer)`,
      parttime: "Deltid",
      selfemployed: "Selvstendig – se Min barsel",
      unemployed: "Arbeidsledig – se Min barsel",
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
      hourlyRateCapReached: "Maksimum timlønn nådd",
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
  const l = { ...labels.da, ...(locale === "da" ? {} : labels[locale as "se" | "no"] ?? {}) };

  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [employment, setEmployment] = useState<BarselEmployment>('fulltime');
  const [weeklyHours, setWeeklyHours] = useState<string>(`${BARSEL_2026.fullTimeHours}`);
  const [parent, setParent] = useState<BarselParent>('mor');
  const [transfer, setTransfer] = useState<string>('0');
  const [weeksPlanned, setWeeksPlanned] = useState<string>(
    `${fordelBarselsUger('mor').total}`
  );
  const [employerPays, setEmployerPays] = useState<boolean>(false);
  const [employerWeeks, setEmployerWeeks] = useState<string>(DEFAULT_EMPLOYER_WEEKS);
  const [employerPercent, setEmployerPercent] = useState<string>('100');
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'barsel') {
      const inputs = urlState.inputs;
      if (inputs.monthlyIncome !== undefined) setMonthlyIncome(String(inputs.monthlyIncome));
      if (isBarselEmployment(inputs.employment)) setEmployment(inputs.employment);
      if (inputs.weeklyHours !== undefined) setWeeklyHours(String(inputs.weeklyHours));
      if (isBarselParent(inputs.parent)) setParent(inputs.parent);
      if (inputs.weeksPlanned !== undefined) setWeeksPlanned(String(inputs.weeksPlanned));
      if (inputs.transfer !== undefined) setTransfer(String(inputs.transfer));
      if (typeof inputs.employerPays === 'boolean') setEmployerPays(inputs.employerPays);
      if (inputs.employerWeeks !== undefined) setEmployerWeeks(String(inputs.employerWeeks));
      if (inputs.employerPercent !== undefined) setEmployerPercent(String(inputs.employerPercent));
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

  const isEmployee = employment === 'fulltime' || employment === 'parttime';
  const split = useMemo(
    () => fordelBarselsUger(parent, Number.parseInt(transfer, 10)),
    [parent, transfer]
  );

  // Weeks follow the split until the reader moves the slider themselves.
  const changeParent = useCallback((next: BarselParent) => {
    setParent(next);
    setWeeksPlanned(String(fordelBarselsUger(next, Number.parseInt(transfer, 10)).total));
  }, [transfer]);

  const changeTransfer = useCallback((value: string) => {
    setTransfer(value);
    setWeeksPlanned(String(fordelBarselsUger(parent, Number.parseInt(value, 10)).total));
  }, [parent]);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'barsel',
      inputs: {
        monthlyIncome, employment, weeklyHours, parent, weeksPlanned,
        transfer, employerPays, employerWeeks, employerPercent,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [monthlyIncome, employment, weeklyHours, parent, weeksPlanned, transfer, employerPays, employerWeeks, employerPercent]);

  const handleReset = useCallback(() => {
    setMonthlyIncome('');
    setEmployment('fulltime');
    setWeeklyHours(`${BARSEL_2026.fullTimeHours}`);
    setParent('mor');
    setTransfer('0');
    setWeeksPlanned(`${fordelBarselsUger('mor').total}`);
    setEmployerPays(false);
    setEmployerWeeks(DEFAULT_EMPLOYER_WEEKS);
    setEmployerPercent('100');
  }, []);

  const result = useMemo(() => {
    const income = Number.parseFloat(monthlyIncome);
    const parsedHours = Number.parseFloat(weeklyHours);
    const hours =
      employment === 'parttime' && Number.isFinite(parsedHours)
        ? parsedHours
        : BARSEL_2026.fullTimeHours;
    const weeks = Number.parseInt(weeksPlanned, 10);
    const parsedEmployerWeeks = Number.parseInt(employerWeeks, 10);
    const parsedPercent = Number.parseFloat(employerPercent);

    if (!(income > 0)) return null;

    const withEmployer = isEmployee && employerPays && parsedEmployerWeeks > 0;
    const calculated = beregnBarselsdagpenge({
      monthlyIncome: income,
      weeklyHours: hours,
      weeks,
      employment,
      employerWeeks: withEmployer ? Math.min(parsedEmployerWeeks, weeks) : 0,
      employerPercent: withEmployer ? parsedPercent : 100,
    });
    if (!calculated) return null;

    return {
      ...calculated,
      weeklyRate: Math.round(calculated.weeklyRate),
      monthlyAmount: Math.round(calculated.monthlyAmount),
      monthlyAfterTax: Math.round(calculated.monthlyAfterTax),
      totalAmount: Math.round(calculated.totalAmount),
      totalAfterTax: Math.round(calculated.totalAfterTax),
      averageMonthlyAfterTax: Math.round(calculated.averageMonthlyAfterTax),
      employerMonthlyAfterTax: Math.round(calculated.employerMonthlyAfterTax),
      coveragePercent: Math.round(calculated.coveragePercent),
      monthlyLoss: Math.round(calculated.monthlyLoss),
    };
  }, [monthlyIncome, weeklyHours, weeksPlanned, employment, isEmployee, employerPays, employerWeeks, employerPercent]);

  const fmtNum = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const incomeLabel =
    employment === 'selfemployed' ? l.monthlyProfit
    : employment === 'unemployed' ? l.monthlyBenefit
    : l.monthlyGross;
  const incomeHint =
    employment === 'selfemployed' ? l.profitHint
    : employment === 'unemployed' ? l.benefitHint
    : null;
  const incomeSource =
    employment === 'selfemployed' ? BARSEL_2026.sourceSelfEmployed
    : employment === 'unemployed' ? BARSEL_2026.sourceUnemployed
    : BARSEL_2026.source;

  const transferValue = split.transferred;
  const transferText =
    transferValue > 0 ? `${l.transferGive} ${transferValue} ${l.weeksUnit}`
    : transferValue < 0 ? `${l.transferTake} ${-transferValue} ${l.weeksUnit}`
    : l.transferNone;
  const maxEmployerWeeks = Math.max(1, Number.parseInt(weeksPlanned, 10) || 1);
  const shownEmployerWeeks = Math.min(Number.parseInt(employerWeeks, 10) || 1, maxEmployerWeeks);

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label htmlFor="barsel-employment" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.employmentType}
            </label>
            <select
              id="barsel-employment"
              value={employment}
              onChange={(e) => setEmployment(e.target.value as BarselEmployment)}
              className={inputClass}
            >
              <option value="fulltime">{l.fulltime}</option>
              <option value="parttime">{l.parttime}</option>
              <option value="selfemployed">{l.selfemployed}</option>
              <option value="unemployed">{l.unemployed}</option>
            </select>
          </div>

          <div>
            <label htmlFor="barsel-monthly-income" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {incomeLabel}
            </label>
            <div className="relative">
              <input
                id="barsel-monthly-income"
                type="number"
                inputMode="decimal"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder={l.placeholder}
                aria-describedby={incomeHint ? "barsel-income-hint" : undefined}
                className={`${inputClass} pr-12`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
            {incomeHint && (
              <p id="barsel-income-hint" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {incomeHint}{' '}
                <a href={incomeSource} className="underline" target="_blank" rel="noopener noreferrer">Borger.dk</a>
              </p>
            )}
          </div>

          {employment === 'parttime' && (
            <div>
              <label htmlFor="barsel-weekly-hours" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {l.weeklyHours}
              </label>
              <div className="relative">
                <input
                  id="barsel-weekly-hours"
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value)}
                  min="1"
                  max={BARSEL_2026.maxHoursForEstimate}
                  className={`${inputClass} pr-14`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{l.hoursUnit}</span>
              </div>
            </div>
          )}

          <div>
            <label id="barsel-du-er-gruppe" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.youAre}
            </label>
            <div role="group" aria-labelledby="barsel-du-er-gruppe" className="flex gap-4">
              <button type="button"
                aria-pressed={parent === 'mor'}
                onClick={() => changeParent('mor')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'mor'
                    ? 'border-pink-500 bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2"><User className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.mother}</span>
              </button>
              <button type="button"
                aria-pressed={parent === 'far'}
                onClick={() => changeParent('far')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'far'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2"><UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.fatherCoMother}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="barsel-transfer" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.transferLabel} <span className="font-bold">{transferText}</span>
            </label>
            <input
              id="barsel-transfer"
              type="range"
              min={-split.transferable}
              max={split.transferable}
              value={transferValue}
              onChange={(e) => changeTransfer(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{l.transferTakeShort}</span>
              <span>{l.transferGiveShort}</span>
            </div>
          </div>

          <div>
            <label htmlFor="barsel-planned-weeks" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.plannedWeeks} <span className="font-bold">{weeksPlanned} {l.weeksUnit}</span>
            </label>
            <input
              id="barsel-planned-weeks"
              type="range"
              min="1"
              max={BARSEL_2026.maxWeeks}
              value={weeksPlanned}
              onChange={(e) => setWeeksPlanned(e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 {l.weekUnit}</span>
              <span>26 {l.weeksUnit}</span>
              <span>{BARSEL_2026.maxWeeks} {l.weeksUnit}</span>
            </div>
          </div>

          {isEmployee && (
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-600">
              <label htmlFor="barsel-employer-pays" className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input
                  id="barsel-employer-pays"
                  type="checkbox"
                  checked={employerPays}
                  onChange={(e) => setEmployerPays(e.target.checked)}
                  className="h-4 w-4"
                />
                {l.employerPays}
              </label>
              {employerPays && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="barsel-employer-weeks" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
                      {l.employerWeeksLabel} <span className="font-bold">{shownEmployerWeeks} {l.weeksUnit}</span>
                    </label>
                    <input
                      id="barsel-employer-weeks"
                      type="range"
                      min="1"
                      max={maxEmployerWeeks}
                      value={shownEmployerWeeks}
                      onChange={(e) => setEmployerWeeks(e.target.value)}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label htmlFor="barsel-employer-percent" className="block text-sm text-gray-700 dark:text-gray-200 mb-2">
                      {l.employerPercentLabel}
                    </label>
                    <select
                      id="barsel-employer-percent"
                      value={employerPercent}
                      onChange={(e) => setEmployerPercent(e.target.value)}
                      className={inputClass}
                    >
                      {[100, 75, 50].map((pct) => (
                        <option key={pct} value={pct}>{pct} %</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{l.employerNote}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result Section */}
        <div role="status" aria-live="polite" aria-atomic="true" className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {l.estimatedBenefits}
              </h2>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">{l.weeklyRateBeforeTax}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fmtNum(result.weeklyRate)} kr.
                </div>
                {(result.isHourlyRateCapped || result.isWeeklyRateCapped) && (
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    <span className="inline-flex items-center gap-1"><TriangleAlert className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{result.isWeeklyRateCapped ? l.weeklyRateCapReached : l.hourlyRateCapReached}</span>
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
                  <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                    ~{fmtNum(result.monthlyAfterTax)} kr.
                  </div>
                </div>
              </div>

              {result.employerWeeks > 0 && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm text-gray-700 dark:text-gray-200">
                  <p>
                    <strong>{result.employerWeeks} {l.weeksUnit}</strong> {l.withSalary}: ~{fmtNum(result.employerMonthlyAfterTax)} kr. {l.perMonthAfterTax}
                  </p>
                  <p className="mt-1">
                    <strong>{result.benefitWeeks} {l.weeksUnit}</strong> {l.withBenefit}: ~{fmtNum(result.monthlyAfterTax)} kr. {l.perMonthAfterTax}
                  </p>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {l.averageLabel}: <strong>~{fmtNum(result.averageMonthlyAfterTax)} kr.</strong>
                  </p>
                </div>
              )}

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {l.totalForWeeks} {weeksPlanned} {l.weeksAfterTax}
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ~{fmtNum(result.totalAfterTax)} kr.
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>{l.incomeDrop}</strong> ~{fmtNum(result.monthlyLoss)} kr./md
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {l.benefitsCover} {result.coveragePercent} % {l.ofYourSalary}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {l.disclaimer}{' '}
                <a href={incomeSource} className="underline" target="_blank" rel="noopener noreferrer">Borger.dk</a>
                {', '}{l.verified} {BARSEL_2026.verifiedAt}.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="mb-3 flex justify-center">
                <Baby className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p>{employment === 'unemployed' ? l.enterBenefit : employment === 'selfemployed' ? l.enterProfit : l.enterSalary}</p>
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
          <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
            {parent === 'mor' ? (
              <span className="inline-flex items-center gap-2"><User className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.motherLeave}</span>
            ) : (
              <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.fatherLeave}</span>
            )}
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
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
          <h2 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.splitTitle}</h2>
          <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
            <li>• {l.yourWeeks}: <strong>{split.total} {l.weeksUnit}</strong>
              {split.beforeBirth > 0 ? ` (${split.beforeBirth} ${l.beforeBirth} + ${split.afterBirth - split.transferred} ${l.afterBirth})` : ` ${l.afterBirth}`}
            </li>
            <li>• {l.partnerWeeks}: <strong>{split.partnerTotal} {l.weeksUnit}</strong></li>
            <li>• {split.earmarked} {l.earmarkedLine}</li>
            <li>• {l.canTransferLine} {split.transferable} {l.weeksUnit}.</li>
          </ul>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-700/40 p-4 text-sm text-gray-700 dark:text-gray-200">
        <p className="flex items-start gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" /><span><strong>{l.tip}:</strong> {l.tipText}</span></p>
      </div>

      <AffiliateBox
        title="Skal du være medlem af en a-kasse?"
        subtitle="Som ledig kræver barselsdagpenge, at du er medlem af en a-kasse"
        links={[{ name: "ASE", description: "A-kasse for alle, uanset job, med online tilmelding.", url: adtractionLink("1666137874", "https://www.ase.dk"), cta: "Se priser", highlight: true }]}
        className="mt-6"
      />

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
