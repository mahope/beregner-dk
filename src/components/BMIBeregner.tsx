"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { InputField } from "@/components/InputField";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { AffiliateBox } from "./AffiliateBox";
import { useLocale } from "@/components/LocaleProvider";

type Koen = "mand" | "kvinde";
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
    gender: "Køn",
    male: "Mand",
    female: "Kvinde",
    age: "Alder",
    ageUnit: "år",
    bmiScale: "BMI skala",
    zones: {
      under: "Undervægtig",
      normal: "Normal",
      over: "Overvægtig",
      fedme1: "Fedme I",
      fedme2: "Fedme II",
      fedme3: "Fedme III",
    } as Record<ZoneKey, string>,
    yourBmi: "Dit BMI",
    idealWeightLabel: "Idealvægt for din højde:",
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
    riskLow: "Lav risiko",
    riskModerate: "Moderat risiko",
    riskHigh: "Høj risiko",
    whrTitle: "Talje-hofte ratio (valgfrit)",
    whrDesc: "Supplerer BMI med en vurdering af fedtfordelingen.",
    waistLabel: "Taljemål",
    hipLabel: "Hoftemål",
    helpNavle: "Mål ved navlen",
    helpBredest: "Mål ved det bredeste punkt",
    whrResultLabel: "Talje-hofte ratio",
    whrGuideMen: "Mænd: < 0,90 = lav",
    whrGuideWomen: "Kvinder: < 0,80 = lav",
    catTableTitle: "BMI kategorier (voksne)",
    whoTitle: "Om talje-hofte ratio",
    whoDesc:
      "Talje-hofte ratioen (WHR) supplerer BMI ved at vurdere, hvor fedtet sidder på kroppen. Fedt omkring maven (æbleform) giver højere sundhedsrisiko end fedt på hofter og lår (pæreform). WHO anbefaler en ratio under 0,90 for mænd og under 0,85 for kvinder.",
    calcName: "BMI Beregner",
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
    gender: "Kön",
    male: "Man",
    female: "Kvinna",
    age: "Ålder",
    ageUnit: "år",
    bmiScale: "BMI-skala",
    zones: {
      under: "Undervikt",
      normal: "Normal",
      over: "Övervikt",
      fedme1: "Fetma I",
      fedme2: "Fetma II",
      fedme3: "Fetma III",
    } as Record<ZoneKey, string>,
    yourBmi: "Ditt BMI",
    idealWeightLabel: "Idealvikt för din längd:",
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
    riskLow: "Låg risk",
    riskModerate: "Måttlig risk",
    riskHigh: "Hög risk",
    whrTitle: "Midja-höft-kvot (valfritt)",
    whrDesc: "Kompletterar BMI med en bedömning av fettfördelningen.",
    waistLabel: "Midjemått",
    hipLabel: "Höftmått",
    helpNavle: "Mät vid naveln",
    helpBredest: "Mät vid den bredaste punkten",
    whrResultLabel: "Midja-höft-kvot",
    whrGuideMen: "Män: < 0,90 = låg",
    whrGuideWomen: "Kvinnor: < 0,80 = låg",
    catTableTitle: "BMI-kategorier (vuxna)",
    whoTitle: "Om midja-höft-kvot",
    whoDesc:
      "Midja-höft-kvoten (WHR) kompletterar BMI genom att bedöma var fettet sitter på kroppen. Fett runt magen (äppelform) ger högre hälsorisk än fett på höfter och lår (päronform). WHO rekommenderar en kvot under 0,90 för män och under 0,85 för kvinnor.",
    calcName: "BMI-kalkylator",
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

function BMISkala({ bmi }: { bmi: number }) {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const clampedBmi = Math.max(SCALE_MIN, Math.min(SCALE_MAX, bmi));
  const position = ((clampedBmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

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
                title={`${l.zones[zone.labelKey]}: ${zone.min}–${zone.max}`}
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
          <span className="text-xs font-bold mt-0.5 dark:text-white">{bmi.toFixed(1)}</span>
        </div>

        {/* Tallabels under skala */}
        <div className="flex justify-between mt-5 text-[10px] text-gray-500 dark:text-gray-400 px-0.5">
          <span>10</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35</span>
          <span>40</span>
          <span>50</span>
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
  const [koen, setKoen] = useState<Koen>("mand");
  const [alder, setAlder] = useState<number>(30);
  const [enhed, setEnhed] = useState<Enhed>("metrisk");
  const [taljemaal, setTaljemaal] = useState<number>(0);
  const [hoftemaal, setHoftemaal] = useState<number>(0);
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bmi') {
      const inputs = urlState.inputs;
      if (inputs.vaegt !== undefined) setVaegt(inputs.vaegt);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.koen) setKoen(inputs.koen);
      if (inputs.alder !== undefined) setAlder(inputs.alder);
    }
  }, []);

  const handleReset = useCallback(() => {
    setVaegt(75);
    setHoejde(175);
    setKoen("mand");
    setAlder(30);
    setEnhed("metrisk");
    setTaljemaal(0);
    setHoftemaal(0);
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bmi',
      inputs: { vaegt, hoejde, koen, alder },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [vaegt, hoejde, koen, alder]);

  // Konverter input til metriske værdier til beregning
  const metriskVaegt = enhed === "imperial" ? lbsToKg(vaegt) : vaegt;
  const metriskHoejde = enhed === "imperial" ? inchesToCm(hoejde) : hoejde;

  const resultat = useMemo(() => {
    if (!metriskVaegt || !metriskHoejde || metriskHoejde === 0) {
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
      bmiFormatted: bmi.toFixed(1),
      kategori,
      farve,
      beskrivelse,
      idealVaegtMin: idealVaegtMinKg.toFixed(0),
      idealVaegtMax: idealVaegtMaxKg.toFixed(0),
    };
  }, [metriskVaegt, metriskHoejde, l]);

  // Talje-hofte ratio
  const taljeHofteResultat = useMemo(() => {
    if (!taljemaal || !hoftemaal || hoftemaal === 0) return null;

    const metriskTalje = enhed === "imperial" ? inchesToCm(taljemaal) : taljemaal;
    const metriskHofte = enhed === "imperial" ? inchesToCm(hoftemaal) : hoftemaal;
    const ratio = metriskTalje / metriskHofte;

    let risikoNiveau: string;
    let farve: string;

    if (koen === "mand") {
      if (ratio < 0.90) {
        risikoNiveau = l.riskLow;
        farve = "text-green-600";
      } else if (ratio < 1.0) {
        risikoNiveau = l.riskModerate;
        farve = "text-yellow-600";
      } else {
        risikoNiveau = l.riskHigh;
        farve = "text-red-600";
      }
    } else {
      if (ratio < 0.80) {
        risikoNiveau = l.riskLow;
        farve = "text-green-600";
      } else if (ratio < 0.85) {
        risikoNiveau = l.riskModerate;
        farve = "text-yellow-600";
      } else {
        risikoNiveau = l.riskHigh;
        farve = "text-red-600";
      }
    }

    return {
      ratio: ratio.toFixed(2),
      risikoNiveau,
      farve,
    };
  }, [taljemaal, hoftemaal, koen, enhed, l]);

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

    if (nyEnhed === "imperial") {
      setVaegt(Math.round(kgToLbs(vaegt) * 10) / 10);
      setHoejde(Math.round(cmToInches(hoejde) * 10) / 10);
      if (taljemaal) setTaljemaal(Math.round(cmToInches(taljemaal) * 10) / 10);
      if (hoftemaal) setHoftemaal(Math.round(cmToInches(hoftemaal) * 10) / 10);
    } else {
      setVaegt(Math.round(lbsToKg(vaegt) * 10) / 10);
      setHoejde(Math.round(inchesToCm(hoejde) * 10) / 10);
      if (taljemaal) setTaljemaal(Math.round(inchesToCm(taljemaal) * 10) / 10);
      if (hoftemaal) setHoftemaal(Math.round(inchesToCm(hoftemaal) * 10) / 10);
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
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button type="button"
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

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            label={vaegtLabel}
            value={vaegt}
            onChange={setVaegt}
            min={enhed === "metrisk" ? 30 : 66}
            max={enhed === "metrisk" ? 300 : 660}
            step={0.1}
            unit={enhed === "metrisk" ? "kg" : "lbs"}
            required
          />

          <InputField
            label={hoejdeLabel}
            value={hoejde}
            onChange={setHoejde}
            min={enhed === "metrisk" ? 100 : 39}
            max={enhed === "metrisk" ? 250 : 98}
            step={0.1}
            unit={enhed === "metrisk" ? "cm" : "in"}
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.gender}</label>
            <div className="flex gap-4">
              <button type="button"
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                {l.male}
              </button>
              <button type="button"
                onClick={() => setKoen("kvinde")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "kvinde"
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                {l.female}
              </button>
            </div>
          </div>

          <InputField
            label={l.age}
            value={alder}
            onChange={setAlder}
            min={18}
            max={120}
            unit={l.ageUnit}
            required
          />
        </div>
      </div>

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
          <BMISkala bmi={resultat.bmi} />

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
                <p className={`text-lg font-semibold ${taljeHofteResultat.farve}`}>
                  {taljeHofteResultat.risikoNiveau}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {koen === "mand" ? l.whrGuideMen : l.whrGuideWomen}
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
