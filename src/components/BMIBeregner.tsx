"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { InputField } from "@/components/InputField";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { formatNumber } from "@/lib/format";
import { AffiliateBox } from "./AffiliateBox";
import { useLocale } from "@/components/LocaleProvider";
type Enhed = "metrisk" | "imperial";
type ZoneKey = "under" | "normal" | "over" | "fedme1" | "fedme2" | "fedme3";

const labels = {
  da: {
    unitMetric: "kg / cm",
    unitImperial: "lbs / inches",
    weightKg: "Vægt (kg)",
    weightLbs: "Vægt (lbs)",
    heightCm: "Højde (cm)",
    heightInches: "Højde (inches)",
    measureMetric: "cm",
    measureImperial: "inches",
    unitLabel: "Vælg måleenhed",
    adultNotice: "BMI for voksne (18+). Formlen bruger kun vægt og højde — alder indgår ikke i beregningen.",
    childInput: "Delelinken indeholder en alder under 18. Brug alders- og kønsspecifikke væksttabeller til børn.",
    invalidInput: "Indtast vægt og højde for en voksen inden for værktøjets grænser.",
    bmiScale: "BMI skala",
    zones: {
      under: "Undervægtig",
      normal: "Normal",
      over: "Overvægtig",
      fedme1: "Fedme I",
      fedme2: "Fedme II",
      fedme3: "Fedme III",
    } as Record<ZoneKey, string>,
    yourBmi: "Dit BMI (voksentall)",
    idealWeightLabel: "Vægtinterval for voksne (BMI 18,5-24,9):",
    catUnder: "Undervægtig",
    catNormal: "Normalvægtig",
    catOver: "Overvægtig",
    catFedme1: "Fedme (klasse 1)",
    catFedme2: "Fedme (klasse 2)",
    catFedme3: "Fedme (klasse 3)",
    descUnder: "Din BMI indikerer undervægt. Overvej at tale med en læge.",
    descNormal: "Din BMI er inden for det normale område. Fortsæt den gode livsstil!",
    descOver: "Din BMI indikerer overvægt. Små livsstilsændringer kan gøre en forskel.",
    descFedme1: "Din BMI indikerer fedme. Overvej at tale med en læge om sunde vægttabsstrategier.",
    descFedme2: "Din BMI indikerer svær fedme. Det anbefales at søge professionel hjælp.",
    descFedme3: "Din BMI indikerer meget svær fedme. Søg professionel medicinsk hjælp.",
    whrTitle: "Talje-hofte ratio (valgfrit)",
    whrDesc: "Beregner et råt forholdstal mellem taljemål og hoftemål.",
    waistLabel: "Taljemål",
    hipLabel: "Hoftemål",
    helpNavle: "Mål ved navlen",
    helpBredest: "Mål ved det bredeste punkt",
    whrResultLabel: "Talje-hofte ratio",
    whrGuide: "Råt forholdstal uden kønsjustering. Det erstatter ikke en samlet helbreds-vurdering.",
    catTableTitle: "BMI kategorier (voksne)",
    whoTitle: "Om talje-hofte ratio",
    whoDesc:
      "Talje-hofte ratioen (WHR) er et råt forholdstal mellem taljemål og hoftemål. Køn indgår hverken i BMI-formlen eller i værktøjets WHR. Værdien er ikke en diagnose.",
    calcName: "BMI Beregner for voksne",
  },
  se: {
    unitMetric: "kg / cm",
    unitImperial: "lbs / tum",
    weightKg: "Vikt (kg)",
    weightLbs: "Vikt (lbs)",
    heightCm: "Längd (cm)",
    heightInches: "Längd (tum)",
    measureMetric: "cm",
    measureImperial: "tum",
    unitLabel: "Välj måtenhet",
    adultNotice: "BMI för vuxna (18+). Formeln använder endast vikt och längd — ålder ingår inte i beräkningen.",
    childInput: "Delningslänken innehåller en ålder under 18. Använd ålders- och könsspecifika tillväxttabeller för barn.",
    invalidInput: "Ange vikt och längd för en vuxen inom verktygets gränser.",
    bmiScale: "BMI-skala",
    zones: {
      under: "Undervikt",
      normal: "Normal",
      over: "Övervikt",
      fedme1: "Fetma I",
      fedme2: "Fetma II",
      fedme3: "Fetma III",
    } as Record<ZoneKey, string>,
    yourBmi: "Ditt BMI (vuxental)",
    idealWeightLabel: "Viktintervall för vuxna (BMI 18,5-24,9):",
    catUnder: "Undervikt",
    catNormal: "Normalvikt",
    catOver: "Övervikt",
    catFedme1: "Fetma (klass 1)",
    catFedme2: "Fetma (klass 2)",
    catFedme3: "Fetma (klass 3)",
    descUnder: "Ditt BMI indikerar undervikt. Överväg att tala med en läkare.",
    descNormal: "Ditt BMI ligger inom det normala området. Fortsätt med den goda livsstilen!",
    descOver: "Ditt BMI indikerar övervikt. Små livsstilsförändringar kan göra skillnad.",
    descFedme1: "Ditt BMI indikerar fetma. Överväg att tala med en läkare om sunda strategier för viktnedgång.",
    descFedme2: "Ditt BMI indikerar svår fetma. Det rekommenderas att söka professionell hjälp.",
    descFedme3: "Ditt BMI indikerar mycket svår fetma. Sök professionell medicinsk hjälp.",
    whrTitle: "Midja-höft-kvot (valfritt)",
    whrDesc: "Beräknar ett rått förhållandetal mellan midja och höft.",
    waistLabel: "Midjemått",
    hipLabel: "Höftmått",
    helpNavle: "Mät vid naveln",
    helpBredest: "Mät vid den bredaste punkten",
    whrResultLabel: "Midja-höft-kvot",
    whrGuide: "Rått förhållandetal utan könsjustering. Det ersätter inte en samlad hälsobedömning.",
    catTableTitle: "BMI-kategorier (vuxna)",
    whoTitle: "Om midja-höft-kvot",
    whoDesc:
      "Midja-höft-kvoten (WHR) är ett rått förhållandetal mellan midja och höft. Kön ingår varken i BMI-formeln eller i verktygets WHR. Värdet är inte en diagnos.",
    calcName: "BMI-kalkylator för vuxna",
  },
  no: {
    unitMetric: "kg / cm",
    unitImperial: "lbs / tommer",
    weightKg: "Vekt (kg)",
    weightLbs: "Vekt (lbs)",
    heightCm: "Høyde (cm)",
    heightInches: "Høyde (tommer)",
    measureMetric: "cm",
    measureImperial: "tommer",
    unitLabel: "Velg måleenhet",
    adultNotice: "BMI for voksne (18+). Formelen bruker bare vekt og høyde — alder inngår ikke i beregningen.",
    childInput: "Delingslenken inneholder en alder under 18. Bruk alders- og kjønnsspesifikke veksttabeller for barn.",
    invalidInput: "Oppgi vekt og høyde for en voksen innenfor verktøyets grenser.",
    bmiScale: "BMI-skala",
    zones: {
      under: "Undervekt",
      normal: "Normal",
      over: "Overvekt",
      fedme1: "Fedme I",
      fedme2: "Fedme II",
      fedme3: "Fedme III",
    } as Record<ZoneKey, string>,
    yourBmi: "BMI-en din (voksentall)",
    idealWeightLabel: "Vektintervall for voksne (BMI 18,5-24,9):",
    catUnder: "Undervekt",
    catNormal: "Normalvekt",
    catOver: "Overvekt",
    catFedme1: "Fedme (klasse 1)",
    catFedme2: "Fedme (klasse 2)",
    catFedme3: "Fedme (klasse 3)",
    descUnder: "BMI-en din tyder på undervekt. Vurder å snakke med en lege.",
    descNormal: "BMI-en din er innenfor normalområdet. Fortsett med den gode livsstilen!",
    descOver: "BMI-en din tyder på overvekt. Små livsstilsendringer kan gjøre en forskjell.",
    descFedme1: "BMI-en din tyder på fedme. Vurder å snakke med en lege om sunne vekttapsstrategier.",
    descFedme2: "BMI-en din tyder på alvorlig fedme. Det anbefales å søke profesjonell hjelp.",
    descFedme3: "BMI-en din tyder på svært alvorlig fedme. Søk profesjonell medisinsk hjelp.",
    whrTitle: "Midje-hofte-kvot (valgfritt)",
    whrDesc: "Beregner et rått forholdstall mellom midjemål og hofte mål.",
    waistLabel: "Midjemål",
    hipLabel: "Hofte mål",
    helpNavle: "Mål ved navlen",
    helpBredest: "Mål ved det bredeste punktet",
    whrResultLabel: "Midje-hofte-kvot",
    whrGuide: "Rått forholdstall uten kjønnsjustering. Det erstatter ikke en samlet helsevurdering.",
    catTableTitle: "BMI-kategorier (voksne)",
    whoTitle: "Om midje-hofte-kvot",
    whoDesc:
      "Midje-hofte-kvoten (WHR) er et rått forholdstall mellom midje og hofte. Kjønn inngår verken i BMI-formelen eller i verktøyets WHR. Verdien er ikke en diagnose.",
    calcName: "BMI-kalkulator for voksne",
  },
} as const;

// Konverteringsfunktioner
function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}
function inchesToCm(inches: number): number {
  return inches * 2.54;
}
function kgToLbs(kg: number): number {
  return kg / 0.453592;
}
function cmToInches(cm: number): number {
  return cm / 2.54;
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// BMI skala konfiguration
const BMI_ZONES: { min: number; max: number; labelKey: ZoneKey; color: string }[] = [
  { min: 0, max: 18.5, labelKey: "under", color: "bg-blue-400" },
  { min: 18.5, max: 25, labelKey: "normal", color: "bg-green-500" },
  { min: 25, max: 30, labelKey: "over", color: "bg-yellow-400" },
  { min: 30, max: 35, labelKey: "fedme1", color: "bg-orange-500" },
  { min: 35, max: 40, labelKey: "fedme2", color: "bg-red-500" },
  { min: 40, max: 50, labelKey: "fedme3", color: "bg-red-700" },
];

const SCALE_MIN = 10;
const SCALE_MAX = 50;
const ADULT_INPUT_LIMITS = {
  metrisk: { weight: 30, maxWeight: 300, height: 100, maxHeight: 250 },
  imperial: { weight: 66.14, maxWeight: 661.38, height: 39.37, maxHeight: 98.42 },
} as const;

function BMISkala({ bmi, formattedBmi }: { bmi: number; formattedBmi: string }) {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const clampedBmi = Math.max(SCALE_MIN, Math.min(SCALE_MAX, bmi));
  const position = ((clampedBmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  const format = (value: number) => formatNumber(value, locale, { maximumFractionDigits: 1 });

  return (
    <div className="mt-6">
      <p className="text-sm font-medium mb-2 dark:text-gray-200">{l.bmiScale}</p>
      <div className="relative">
        {/* Farvede zoner */}
        <div className="flex h-6 rounded-full overflow-hidden">
          {BMI_ZONES.map((zone) => {
            const zoneStart = Math.max(zone.min, SCALE_MIN);
            const zoneEnd = Math.min(zone.max, SCALE_MAX);
            const width = ((zoneEnd - zoneStart) / (SCALE_MAX - SCALE_MIN)) * 100;
            return (
              <div
                key={zone.labelKey}
                className={`${zone.color} relative`}
                style={{ width: `${width}%` }}
                title={`${l.zones[zone.labelKey]}: ${format(zone.min)}–${format(zone.max)}`}
              />
            );
          })}
        </div>

        {/* Markør */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="w-0.5 h-6 bg-gray-900 dark:bg-white" />
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-white" />
          <span className="text-xs font-bold mt-0.5 dark:text-white">{formattedBmi}</span>
        </div>

        {/* Tallabels under skala */}
        <div className="flex justify-between mt-5 text-[10px] text-gray-500 dark:text-gray-400 px-0.5">
          <span>{format(10)}</span>
          <span>{format(18.5)}</span>
          <span>{format(25)}</span>
          <span>{format(30)}</span>
          <span>{format(35)}</span>
          <span>{format(40)}</span>
          <span>{format(50)}</span>
        </div>
      </div>
    </div>
  );
}

export default function BMIBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [vaegt, setVaegt] = useState<number>(75);
  const [hoejde, setHoejde] = useState<number>(175);
  const [enhed, setEnhed] = useState<Enhed>("metrisk");
  const [taljemaal, setTaljemaal] = useState<number>(0);
  const [hoftemaal, setHoftemaal] = useState<number>(0);
  const [harBarnestate, setHarBarnestate] = useState(false);
  const [urlStateKontrolleret, setUrlStateKontrolleret] = useState(false);
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bmi') {
      const inputs = urlState.inputs;
      const inputVægt = Number(inputs.vaegt);
      const inputHoejde = Number(inputs.hoejde);
      const erGyldigtIImperial = inputVægt >= 66 && inputVægt <= 662 && inputHoejde >= 39 && inputHoejde <= 99;
      const erGyldigtIMetrisk = inputVægt >= 30 && inputVægt <= 300 && inputHoejde >= 100 && inputHoejde <= 250;
      const indlaestEnhed = inputs.enhed === "imperial"
        ? "imperial"
        : inputs.enhed === "metrisk"
          ? "metrisk"
          : erGyldigtIImperial && !erGyldigtIMetrisk
            ? "imperial"
            : "metrisk";

      if (inputs.vaegt !== undefined) setVaegt(inputVægt);
      if (inputs.hoejde !== undefined) setHoejde(inputHoejde);
      if (inputs.enhed !== undefined || erGyldigtIImperial) setEnhed(indlaestEnhed);
      if (inputs.alder !== undefined && Number(inputs.alder) < 18) setHarBarnestate(true);
    }
    setUrlStateKontrolleret(true);
  }, []);

  const handleReset = useCallback(() => {
    setVaegt(75);
    setHoejde(175);
    setEnhed("metrisk");
    setTaljemaal(0);
    setHoftemaal(0);
    setHarBarnestate(false);
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bmi',
      inputs: { vaegt, hoejde, enhed },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [vaegt, hoejde, enhed]);

  // Konverter input til metriske værdier til beregning
  const metriskVaegt = enhed === "imperial" ? lbsToKg(vaegt) : vaegt;
  const metriskHoejde = enhed === "imperial" ? inchesToCm(hoejde) : hoejde;
  const inputLimits = ADULT_INPUT_LIMITS[enhed];
  const minWeight = inputLimits.weight;
  const maxWeight = inputLimits.maxWeight;
  const minHeight = inputLimits.height;
  const maxHeight = inputLimits.maxHeight;
  const normaliseretVaegt = Math.round(metriskVaegt * 100) / 100;
  const normaliseretHoejde = Math.round(metriskHoejde * 100) / 100;
  const inputUdenforGraenser = normaliseretVaegt < 30
    || normaliseretVaegt > 300
    || normaliseretHoejde < 100
    || normaliseretHoejde > 250;
  const inputErUgyldigt = harBarnestate || inputUdenforGraenser;

  const resultat = useMemo(() => {
    if (!urlStateKontrolleret || inputErUgyldigt || !metriskVaegt || !metriskHoejde || metriskHoejde === 0) {
      return null;
    }

    const hoejdeM = metriskHoejde / 100;
    const bmi = metriskVaegt / (hoejdeM * hoejdeM);

    let kategori: string;
    let farve: string;
    let beskrivelse: string;

    if (bmi < 18.5) {
      kategori = l.catUnder;
      farve = "text-blue-600";
      beskrivelse = l.descUnder;
    } else if (bmi < 25) {
      kategori = l.catNormal;
      farve = "text-green-600";
      beskrivelse = l.descNormal;
    } else if (bmi < 30) {
      kategori = l.catOver;
      farve = "text-yellow-600";
      beskrivelse = l.descOver;
    } else if (bmi < 35) {
      kategori = l.catFedme1;
      farve = "text-orange-600";
      beskrivelse = l.descFedme1;
    } else if (bmi < 40) {
      kategori = l.catFedme2;
      farve = "text-red-500";
      beskrivelse = l.descFedme2;
    } else {
      kategori = l.catFedme3;
      farve = "text-red-700";
      beskrivelse = l.descFedme3;
    }

    // Beregn idealvægt
    const idealVaegtMinKg = 18.5 * (hoejdeM * hoejdeM);
    const idealVaegtMaxKg = 24.9 * (hoejdeM * hoejdeM);

    return {
      bmi,
      bmiFormatted: formatNumber(bmi, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
      kategori,
      farve,
      beskrivelse,
      idealVaegtMin: formatNumber(idealVaegtMinKg, locale, { maximumFractionDigits: 0 }),
      idealVaegtMax: formatNumber(idealVaegtMaxKg, locale, { maximumFractionDigits: 0 }),
    };
  }, [metriskVaegt, metriskHoejde, l, locale, inputErUgyldigt, urlStateKontrolleret]);

  // Talje-hofte ratio
  const taljeHofteResultat = useMemo(() => {
    if (!taljemaal || !hoftemaal || hoftemaal === 0) return null;

    const metriskTalje = enhed === "imperial" ? inchesToCm(taljemaal) : taljemaal;
    const metriskHofte = enhed === "imperial" ? inchesToCm(hoftemaal) : hoftemaal;
    const ratio = metriskTalje / metriskHofte;

    return {
      ratio: formatNumber(ratio, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    };
  }, [taljemaal, hoftemaal, enhed, locale]);

  // Track calculation once per session when user changes values
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const cleanupScroll = initScrollDepthTracking("bmi");
    const timer = setTimeout(() => {
        trackCalculation("bmi");
        hasTracked.current = true;
      }, 2000);
      return () => { clearTimeout(timer); cleanupScroll(); };
    }
  }, [resultat]);

  // Håndter enhedsskift med konvertering af værdier
  const handleEnhedSkift = (nyEnhed: Enhed) => {
    if (nyEnhed === enhed) return;

    const nextLimits = ADULT_INPUT_LIMITS[nyEnhed];

    if (nyEnhed === "imperial") {
      setVaegt(clamp(Math.round(kgToLbs(vaegt) * 100) / 100, nextLimits.weight, nextLimits.maxWeight));
      setHoejde(clamp(Math.round(cmToInches(hoejde) * 100) / 100, nextLimits.height, nextLimits.maxHeight));
      if (taljemaal) setTaljemaal(Math.round(cmToInches(taljemaal) * 100) / 100);
      if (hoftemaal) setHoftemaal(Math.round(cmToInches(hoftemaal) * 100) / 100);
    } else {
      setVaegt(clamp(Math.round(lbsToKg(vaegt) * 100) / 100, nextLimits.weight, nextLimits.maxWeight));
      setHoejde(clamp(Math.round(inchesToCm(hoejde) * 100) / 100, nextLimits.height, nextLimits.maxHeight));
      if (taljemaal) setTaljemaal(Math.round(inchesToCm(taljemaal) * 100) / 100);
      if (hoftemaal) setHoftemaal(Math.round(inchesToCm(hoftemaal) * 100) / 100);
    }
    setEnhed(nyEnhed);
  };

  const vaegtLabel = enhed === "metrisk" ? l.weightKg : l.weightLbs;
  const hoejdeLabel = enhed === "metrisk" ? l.heightCm : l.heightInches;
  const maalEnhed = enhed === "metrisk" ? l.measureMetric : l.measureImperial;

  return (
    <div className="space-y-8 print-area">
      {/* Enhedsvalg */}
      <div className="flex justify-end">
        <div
          role="group"
          aria-label={l.unitLabel}
          className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
        >
          <button type="button"
            aria-pressed={enhed === "metrisk"}
            onClick={() => handleEnhedSkift("metrisk")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              enhed === "metrisk"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {l.unitMetric}
          </button>
          <button type="button"
            aria-pressed={enhed === "imperial"}
            onClick={() => handleEnhedSkift("imperial")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              enhed === "imperial"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {l.unitImperial}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
        {l.adultNotice}
      </div>

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label={vaegtLabel}
          value={vaegt}
          onChange={setVaegt}
          min={minWeight}
          max={maxWeight}
          step={0.1}
          unit={enhed === "metrisk" ? "kg" : "lbs"}
          required
        />

        <InputField
          label={hoejdeLabel}
          value={hoejde}
          onChange={setHoejde}
          min={minHeight}
          max={maxHeight}
          step={0.1}
          unit={enhed === "metrisk" ? "cm" : "in"}
          required
        />
      </div>

      {urlStateKontrolleret && inputErUgyldigt && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100">
          {harBarnestate ? l.childInput : l.invalidInput}
        </p>
      )}

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 animate-fade-in">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{l.yourBmi}</p>
            <p className={`text-5xl font-bold ${resultat.farve}`}>
              {resultat.bmiFormatted}
            </p>
            <p className={`text-xl font-medium mt-2 ${resultat.farve}`}>
              {resultat.kategori}
            </p>
          </div>

          {/* Grafisk BMI skala */}
          <BMISkala bmi={resultat.bmi} formattedBmi={resultat.bmiFormatted} />

          <p className="text-gray-600 dark:text-gray-300 text-center mt-6 mb-6">{resultat.beskrivelse}</p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              {l.idealWeightLabel} <strong className="dark:text-white">{resultat.idealVaegtMin} - {resultat.idealVaegtMax} kg</strong>
            </p>
          </div>

          {/* Share and Print buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <CopyResultButton text={`BMI ${resultat.bmiFormatted} - ${resultat.kategori}`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`BMI ${resultat.bmiFormatted} - ${resultat.kategori}`}
            />
            <PrintResult
              calculatorName={l.calcName}
              resultSummary={`BMI ${resultat.bmiFormatted} - ${resultat.kategori}`}
            />
          </div>
        </div>
      )}

      {/* Talje-hofte ratio */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-1 dark:text-white">{l.whrTitle}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {l.whrDesc}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={`${l.waistLabel} (${maalEnhed})`}
            value={taljemaal}
            onChange={setTaljemaal}
            min={0}
            max={enhed === "metrisk" ? 200 : 79}
            step={0.1}
            unit={maalEnhed}
            helpText={l.helpNavle}
          />
          <InputField
            label={`${l.hipLabel} (${maalEnhed})`}
            value={hoftemaal}
            onChange={setHoftemaal}
            min={0}
            max={enhed === "metrisk" ? 200 : 79}
            step={0.1}
            unit={maalEnhed}
            helpText={l.helpBredest}
          />
        </div>

        {taljeHofteResultat && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{l.whrResultLabel}</p>
                <p className="text-2xl font-bold dark:text-white">{taljeHofteResultat.ratio}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {l.whrGuide}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BMI kategorier tabel */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3 dark:text-white">{l.catTableTitle}</h3>
        <div className="space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Under 18,5</span>
            <span>{l.catUnder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">18,5 - 24,9</span>
            <span>{l.catNormal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">25,0 - 29,9</span>
            <span>{l.catOver}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600 dark:text-orange-400">30,0 - 34,9</span>
            <span>{l.catFedme1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500 dark:text-red-400">35,0 - 39,9</span>
            <span>{l.catFedme2}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700 dark:text-red-500">40+</span>
            <span>{l.catFedme3}</span>
          </div>
        </div>
      </div>

      {/* WHO info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium mb-2 dark:text-white">{l.whoTitle}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {l.whoDesc}
        </p>
      </div>
      <AffiliateBox
        title="Sundhed & velvære"
        subtitle="Vitaminer, kosttilskud og vægttab"
        links={[{ name: "Med24", description: "Danmarks apotek på nettet — vitaminer, kosttilskud og produkter til vægttab.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=42807&uid=minberegner", cta: "Se produkter hos Med24", highlight: true }]}
        className="mt-6"
      />
      <AffiliateBox
        title="Sundhedsforsikring"
        subtitle="Hurtig behandling uden ventetid"
        links={[{ name: "Findforsikring.dk", description: "Sammenlign sundhedsforsikringer og få hurtig adgang til behandling, fysioterapi og speciallæge uden lange ventelister.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068&uid=minberegner", cta: "Sammenlign sundhedsforsikring", highlight: true }]}
        className="mt-6"
      />
    </div>
  );
}
