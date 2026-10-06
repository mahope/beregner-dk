"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { InputField } from "@/components/InputField";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { ModeSelector, ModeOption } from "@/components/ModeSelector";
import { AnimatedNumber, CopyResultButton, ResetButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { procentForskelMellemTal, procentRetning } from "@/lib/procent";
import type { Locale } from "@/lib/i18n";

type BeregningsMode = "find-procent" | "find-resultat" | "find-heltal" | "stigning" | "forskel";

const labels = {
  da: {
    modeFindProcentLabel: "Find procent",
    modeFindProcentDesc: "X er ? % af Y",
    modeFindResultatLabel: "Find resultat",
    modeFindResultatDesc: "X % af Y = ?",
    modeFindHeltalLabel: "Find heltal",
    modeFindHeltalDesc: "X er Y % af ?",
    modeStigningLabel: "Procentvis ændring",
    modeStigningDesc: "Fra X til Y = ? %",
    modeForskelLabel: "Forskel mellem to tal",
    modeForskelDesc: "Hvor stor er forskellen?",
    modeSelectorName: "Beregningstype",
    ariaDeltalTael: "Del-tal (tælleren)",
    ariaHeltalNaev: "Heltal (nævneren)",
    ariaProcent: "Procent",
    ariaGrundvaerdi: "Grundværdi",
    ariaDelVaerdi: "Del-værdi",
    ariaStartvaerdi: "Startværdi",
    ariaSlutvaerdi: "Slutværdi",
    ariaFoersteTal: "Første tal",
    ariaAndetTal: "Andet tal",
    ariaResultProcent: "Resultat procent",
    ariaResult: "Resultat",
    ariaResultHeltal: "Resultat heltal",
    ariaProcentvis: "Procentvis ændring",
    wordEr: "er",
    wordAf: "af",
    wordPctAf: "% af",
    wordFra: "Fra",
    wordTil: "til",
    wordOg: "og",
    valueNotZero: "Værdien kan ikke være nul",
    resultHeading: "Resultat",
    quickReference: "Hurtig reference",
    formulas: "Formler",
    formulaProcent: "Procent = (Del / Heltal) × 100",
    formulaDel: "Del = (Procent / 100) × Heltal",
    formulaHeltal: "Heltal = Del × (100 / Procent)",
    formulaAendring: "Ændring = ((Ny - Gammel) / Gammel) × 100",
    calcName: "Procentberegner",
    explainFindProcent: (deltal: string, pct: string, heltal: string) => `${deltal} er ${pct} % af ${heltal}`,
    explainFindResultat: (procent: string, baseVal: string, val: string) => `${procent} % af ${baseVal} er ${val}`,
    explainFindHeltal: (deltal: string, procent: string, val: string) => `Hvis ${deltal} er ${procent} %, så er 100 % = ${val}`,
    explainStigning: (erStigning: boolean, fra: string, til: string, pct: string) =>
      `${erStigning ? "Stigning" : "Fald"} fra ${fra} til ${til} er ${pct} %`,
    forklarAendring: (a: string, b: string, pct: string) =>
      `Regnet fra ${a} er bevægelsen til ${b} ${pct} %.`,
    forklarDifferens: (pct: string) => `Regnet på middelværdien er forskellen ${pct} %.`,
    udefineretDifferens: "Middelværdien er 0, så forskellen kan ikke regnes i procent.",
    retningStigning: "stigning",
    retningFald: "fald",
    retningUaendret: "uændret",
    forskelOverskrift: "Procentvis ændring",
    forskelDifferensOverskrift: "Forskel på middelværdien",
    forskelMiddel: "Middelværdi",
    forskelNote:
      "De to tal er forskellige spørgsmål. Vælg den ovenfor, der passer på dit.",
  },
  se: {
    modeFindProcentLabel: "Hitta procent",
    modeFindProcentDesc: "X är ? % av Y",
    modeFindResultatLabel: "Hitta resultat",
    modeFindResultatDesc: "X % av Y = ?",
    modeFindHeltalLabel: "Hitta heltal",
    modeFindHeltalDesc: "X är Y % av ?",
    modeStigningLabel: "Procentuell förändring",
    modeStigningDesc: "Från X till Y = ? %",
    modeForskelLabel: "Skillnad mellan två tal",
    modeForskelDesc: "Hur stor är skillnaden?",
    modeSelectorName: "Beräkningstyp",
    ariaDeltalTael: "Deltal (täljaren)",
    ariaHeltalNaev: "Heltal (nämnaren)",
    ariaProcent: "Procent",
    ariaGrundvaerdi: "Grundvärde",
    ariaDelVaerdi: "Delvärde",
    ariaStartvaerdi: "Startvärde",
    ariaSlutvaerdi: "Slutvärde",
    ariaFoersteTal: "Första talet",
    ariaAndetTal: "Andra talet",
    ariaResultProcent: "Resultat procent",
    ariaResult: "Resultat",
    ariaResultHeltal: "Resultat heltal",
    ariaProcentvis: "Procentuell förändring",
    wordEr: "är",
    wordAf: "av",
    wordPctAf: "% av",
    wordFra: "Från",
    wordTil: "till",
    wordOg: "och",
    valueNotZero: "Värdet kan inte vara noll",
    resultHeading: "Resultat",
    quickReference: "Snabbreferens",
    formulas: "Formler",
    formulaProcent: "Procent = (Del / Heltal) × 100",
    formulaDel: "Del = (Procent / 100) × Heltal",
    formulaHeltal: "Heltal = Del × (100 / Procent)",
    formulaAendring: "Förändring = ((Ny - Gammal) / Gammal) × 100",
    calcName: "Procentkalkylator",
    explainFindProcent: (deltal: string, pct: string, heltal: string) => `${deltal} är ${pct} % av ${heltal}`,
    explainFindResultat: (procent: string, baseVal: string, val: string) => `${procent} % av ${baseVal} är ${val}`,
    explainFindHeltal: (deltal: string, procent: string, val: string) => `Om ${deltal} är ${procent} %, så är 100 % = ${val}`,
    explainStigning: (erStigning: boolean, fra: string, til: string, pct: string) =>
      `${erStigning ? "Ökning" : "Minskning"} från ${fra} till ${til} är ${pct} %`,
    forklarAendring: (a: string, b: string, pct: string) =>
      `Räknat från ${a} är förändringen till ${b} ${pct} %.`,
    forklarDifferens: (pct: string) => `Räknat på medelvärdet är skillnaden ${pct} %.`,
    udefineretDifferens: "Medelvärdet är 0, så skillnaden går inte att räkna i procent.",
    retningStigning: "ökning",
    retningFald: "minskning",
    retningUaendret: "oförändrat",
    forskelOverskrift: "Procentuell förändring",
    forskelDifferensOverskrift: "Skillnad på medelvärdet",
    forskelMiddel: "Medelvärde",
    forskelNote: "De två talen är två olika frågor. Välj den överst som passar din.",
  },
} as const;

export default function ProcentBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;

  const MODES: ModeOption<BeregningsMode>[] = [
    { id: "find-procent", label: l.modeFindProcentLabel, desc: l.modeFindProcentDesc },
    { id: "find-resultat", label: l.modeFindResultatLabel, desc: l.modeFindResultatDesc },
    { id: "find-heltal", label: l.modeFindHeltalLabel, desc: l.modeFindHeltalDesc },
    { id: "stigning", label: l.modeStigningLabel, desc: l.modeStigningDesc },
    { id: "forskel", label: l.modeForskelLabel, desc: l.modeForskelDesc },
  ];

  const [mode, setMode] = useState<BeregningsMode>("find-procent");

  // Find procent mode
  const [deltal, setDeltal] = useState<number>(25);
  const [heltal, setHeltal] = useState<number>(100);

  // Find resultat mode
  const [procent, setProcent] = useState<number>(25);
  const [baseVal, setBaseVal] = useState<number>(200);

  // Stigning mode
  const [fra, setFra] = useState<number>(100);
  const [til, setTil] = useState<number>(125);

  // Forskel mellem to tal mode. 30 000 → 33 000 er løneksemplet fra siden, så
  // værktøjet åbner på de tal brødteksten og FAQ'en allerede bruger.
  const [talA, setTalA] = useState<number>(30000);
  const [talB, setTalB] = useState<number>(33000);

  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'procent') {
      const inputs = urlState.inputs;
      if (inputs.mode) setMode(inputs.mode);
      if (inputs.deltal !== undefined) setDeltal(inputs.deltal);
      if (inputs.heltal !== undefined) setHeltal(inputs.heltal);
      if (inputs.procent !== undefined) setProcent(inputs.procent);
      if (inputs.baseVal !== undefined) setBaseVal(inputs.baseVal);
      if (inputs.fra !== undefined) setFra(inputs.fra);
      if (inputs.til !== undefined) setTil(inputs.til);
      if (inputs.talA !== undefined) setTalA(inputs.talA);
      if (inputs.talB !== undefined) setTalB(inputs.talB);
    }
  }, []);

  const handleReset = useCallback(() => {
    setMode("find-procent");
    setDeltal(25);
    setHeltal(100);
    setProcent(25);
    setBaseVal(200);
    setFra(100);
    setTil(125);
    setTalA(30000);
    setTalB(33000);
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'procent',
      inputs: { mode, deltal, heltal, procent, baseVal, fra, til, talA, talB },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [mode, deltal, heltal, procent, baseVal, fra, til, talA, talB]);

  const validateNotZero = useCallback((value: number) => {
    if (value === 0) return l.valueNotZero;
    return null;
  }, [l]);

  const resultat = useMemo(() => {
    const num = (value: number) => formatNumber(value, locale as Locale);
    const fixed = (value: number) =>
      formatNumber(value, locale as Locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    switch (mode) {
      case "find-procent":
        if (heltal === 0) return null;
        const procentAfHeltal = (deltal / heltal) * 100;
        return {
          type: "find-procent" as const,
          resultat: procentAfHeltal,
          forklaring: l.explainFindProcent(num(deltal), fixed(procentAfHeltal), num(heltal)),
        };

      case "find-resultat":
        const resultatVaerdi = (procent / 100) * baseVal;
        return {
          type: "find-resultat" as const,
          resultat: resultatVaerdi,
          forklaring: l.explainFindResultat(num(procent), num(baseVal), fixed(resultatVaerdi)),
        };

      case "find-heltal":
        if (procent === 0) return null;
        const heltalVaerdi = (deltal / procent) * 100;
        return {
          type: "find-heltal" as const,
          resultat: heltalVaerdi,
          forklaring: l.explainFindHeltal(num(deltal), num(procent), fixed(heltalVaerdi)),
        };

      case "stigning":
        if (fra === 0) return null;
        const aendring = til - fra;
        const procentAendring = (aendring / fra) * 100;
        const erStigning = aendring >= 0;
        return {
          type: "stigning" as const,
          resultat: procentAendring,
          aendring,
          erStigning,
          forklaring: l.explainStigning(
            erStigning,
            num(fra),
            num(til),
            fixed(Math.abs(procentAendring)),
          ),
        };

      case "forskel": {
        // Begge tal er gyldige her — 0 mod 100 er en forskel på 200 %, så den
        // "kan ikke være nul"-regel fra de andre tilstande hører ikke til.
        const svar = procentForskelMellemTal(talA, talB);
        return {
          type: "forskel" as const,
          resultat: svar.differens,
          aendring: svar.aendring,
          middel: svar.middel,
          udefineret: svar.udefineret,
          retning: procentRetning(svar.aendring),
          forklaring: l.forklarAendring(
            num(talA),
            num(talB),
            fixed(Math.abs(svar.aendring)),
          ),
          forklaringDifferens: svar.udefineret
            ? l.udefineretDifferens
            : l.forklarDifferens(fixed(svar.differens)),
        };
      }

      default:
        return null;
    }
  }, [mode, deltal, heltal, procent, baseVal, fra, til, talA, talB, l, locale]);

  // Track calculation once per session
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const cleanupScroll = initScrollDepthTracking("procent");
    const timer = setTimeout(() => {
        trackCalculation("procent");
        hasTracked.current = true;
      }, 2000);
      return () => { clearTimeout(timer); cleanupScroll(); };
    }
  }, [resultat]);

  return (
    <div className="space-y-8 print-area">
      {/* Mode selection with keyboard navigation */}
      <ModeSelector
        modes={MODES}
        currentMode={mode}
        onChange={setMode}
        name={l.modeSelectorName}
        columns={5}
      />

      {/* Input fields based on mode */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        {mode === "find-procent" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <InputField
              value={deltal}
              onChange={setDeltal}
              ariaLabel={l.ariaDeltalTael}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordEr}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label={l.ariaResultProcent}>? %</span>
            <span className="text-gray-600 dark:text-gray-400">{l.wordAf}</span>
            <InputField
              value={heltal}
              onChange={setHeltal}
              ariaLabel={l.ariaHeltalNaev}
              inline
              customValidation={validateNotZero}
            />
          </div>
        )}

        {mode === "find-resultat" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <InputField
              value={procent}
              onChange={setProcent}
              ariaLabel={l.ariaProcent}
              min={0}
              max={1000}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordPctAf}</span>
            <InputField
              value={baseVal}
              onChange={setBaseVal}
              ariaLabel={l.ariaGrundvaerdi}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">=</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label={l.ariaResult}>?</span>
          </div>
        )}

        {mode === "find-heltal" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <InputField
              value={deltal}
              onChange={setDeltal}
              ariaLabel={l.ariaDelVaerdi}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordEr}</span>
            <InputField
              value={procent}
              onChange={setProcent}
              ariaLabel={l.ariaProcent}
              inline
              customValidation={validateNotZero}
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordPctAf}</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label={l.ariaResultHeltal}>?</span>
          </div>
        )}

        {mode === "stigning" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <span className="text-gray-600 dark:text-gray-400">{l.wordFra}</span>
            <InputField
              value={fra}
              onChange={setFra}
              ariaLabel={l.ariaStartvaerdi}
              inline
              customValidation={validateNotZero}
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordTil}</span>
            <InputField
              value={til}
              onChange={setTil}
              ariaLabel={l.ariaSlutvaerdi}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">=</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400" aria-label={l.ariaProcentvis}>? %</span>
          </div>
        )}

        {mode === "forskel" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <InputField
              value={talA}
              onChange={setTalA}
              ariaLabel={l.ariaFoersteTal}
              inline
            />
            <span className="text-gray-600 dark:text-gray-400">{l.wordOg}</span>
            <InputField
              value={talB}
              onChange={setTalB}
              ariaLabel={l.ariaAndetTal}
              inline
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Result */}
      {resultat && (
        <div className={`p-6 rounded-xl text-center ${
          resultat.type === "stigning" && !resultat.erStigning
            ? "bg-red-50 dark:bg-red-900/20"
            : "bg-green-50 dark:bg-green-900/20"
        }`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{l.resultHeading}</p>
          <p className={`text-5xl font-bold ${
            resultat.type === "stigning" && !resultat.erStigning
              ? "text-red-600 dark:text-red-400"
              : "text-green-600 dark:text-green-400"
          }`}>
            <AnimatedNumber
              value={resultat.resultat}
              formatFn={(n) =>
                resultat.type === "find-procent" ||
                resultat.type === "stigning" ||
                resultat.type === "forskel"
                  ? `${formatNumber(n, locale as Locale, { maximumFractionDigits: 2 })} %`
                  : formatNumber(n, locale as Locale, { maximumFractionDigits: 2 })
              }
            />
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{resultat.forklaring}</p>

          {/* De to svar på «forskel mellem to tal». Begge står, fordi spørgsmålet
              har to rigtige svar, og læseren ikke kan vide på forhånd hvilket
              af dem den anden mener. */}
          {resultat.type === "forskel" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="rounded-lg p-4 bg-white/60 dark:bg-gray-900/30">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {l.forskelOverskrift}
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {formatNumber(Math.abs(resultat.aendring), locale as Locale, {
                    maximumFractionDigits: 2,
                  })}
                  {" %"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {resultat.retning === "stigning"
                    ? l.retningStigning
                    : resultat.retning === "fald"
                      ? l.retningFald
                      : l.retningUaendret}
                </p>
              </div>
              <div className="rounded-lg p-4 bg-white/60 dark:bg-gray-900/30">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {l.forskelDifferensOverskrift}
                </h3>
                <p className="text-2xl font-bold mt-1">
                  {resultat.udefineret
                    ? "—"
                    : `${formatNumber(resultat.resultat, locale as Locale, {
                        maximumFractionDigits: 2,
                      })} %`}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {l.forskelMiddel}: {formatNumber(resultat.middel, locale as Locale, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="sm:col-span-2 text-sm text-gray-600 dark:text-gray-400">
                {resultat.forklaringDifferens}
              </p>
              <p className="sm:col-span-2 text-sm text-gray-600 dark:text-gray-400">
                {l.forskelNote}
              </p>
            </div>
          )}

          {/* Share, Copy and Print buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <CopyResultButton
              text={
                resultat.type === "forskel"
                  ? `${resultat.forklaring} ${resultat.forklaringDifferens}`
                  : resultat.forklaring
              }
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={
                resultat.type === "forskel"
                  ? `${resultat.forklaring} ${resultat.forklaringDifferens}`
                  : resultat.forklaring
              }
            />
            <PrintResult
              calculatorName={l.calcName}
              resultSummary={resultat.forklaring}
            />
          </div>
        </div>
      )}

      {/* Quick reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-medium mb-2 dark:text-gray-100">{l.quickReference}</h2>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>10 % = 1/10</li>
            <li>25 % = 1/4</li>
            <li>33 % ≈ 1/3</li>
            <li>50 % = 1/2</li>
            <li>75 % = 3/4</li>
          </ul>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-medium mb-2 dark:text-gray-100">{l.formulas}</h2>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>{l.formulaProcent}</li>
            <li>{l.formulaDel}</li>
            <li>{l.formulaHeltal}</li>
            <li>{l.formulaAendring}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
