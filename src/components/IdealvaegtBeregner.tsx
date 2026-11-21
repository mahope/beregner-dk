"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { generateShareableLink, getStateFromUrl, type CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { BMI_BAAND, vaegtInterval } from "@/lib/bmi-voksen-grænser";
import { IDEALVAEGT_KILDE, MAX_HOEJDE_CM, MIN_HOEJDE_CM, idealvaegtResultat, rundIdealvaegt, type Koen } from "@/lib/idealvaegt";
import { formatNumber } from "@/lib/format";

const labels = {
  da: {
    hoejde: "Din højde",
    mand: "Mand",
    kvinde: "Kvinde",
    calcName: "Idealvægtsberegner",
    resultLabel: "Idealvægt",
    gennemsnitLabel: "Gennemsnit af de to formler",
    devineLabel: "Devine (1974)",
    hamwiLabel: "Hamwi (1964)",
    intervalTitle: "Vægtinterval ved dit BMI",
    intervalLead: "BMI 18,5-24,9 regnes som normalvægt af WHO, og for din højde svarer det til:",
    intervalSource: "Kilde: Verdenssundhedsorganisationen (WHO), Obesity and overweight, opdateret 8. december 2025.",
    disclaimer:
      "Formlerne er fra 1964 og 1974 og blev lavet til medicinsk dosering — de tager ikke højde for muskulatur, kropsbygning eller alder. Se dem som et interval, ikke som et mål.",
    formulaTitle: "Sådan regnes det",
    hoejdeOrd: "højde",
    shareSummary: "Idealvægt",
  },
  se: {
    hoejde: "Din längd",
    mand: "Man",
    kvinde: "Kvinna",
    calcName: "Idealviktkalkylator",
    resultLabel: "Idealvikt",
    gennemsnitLabel: "Medel av de två formlerna",
    devineLabel: "Devine (1974)",
    hamwiLabel: "Hamwi (1964)",
    intervalTitle: "Viktintervall vid ditt BMI",
    intervalLead: "BMI 18,5-24,9 räknas som normalvikt av WHO, och för din längd motsvarar det:",
    intervalSource: "Källa: Världshälsoorganisationen (WHO), Obesity and overweight, uppdaterad 8 december 2025.",
    disclaimer:
      "Formlerna är från 1964 och 1974 och skapades för medicinsk dosering — de tar inte hänsyn till muskulatur, kroppsbyggnad eller ålder. Se dem som ett intervall, inte ett mål.",
    formulaTitle: "Så räknas det",
    hoejdeOrd: "längd",
    shareSummary: "Idealvikt",
  },
} as const;

const STANDARD_HOEJDE = 175;

export default function IdealvaegtBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number, decimals = 1) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const [hoejde, setHoejde] = useState<number>(STANDARD_HOEJDE);
  const [koen, setKoen] = useState<Koen>("mand");

  const harIndlaestUrl = useRef(false);
  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harIndlaestUrl.current) return;
    harIndlaestUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState?.type !== "idealvaegt") return;
    if (urlState.inputs.hoejde !== undefined) {
      const h = Number(urlState.inputs.hoejde);
      if (Number.isFinite(h)) setHoejde(Math.min(MAX_HOEJDE_CM, Math.max(MIN_HOEJDE_CM, h)));
    }
    if (urlState.inputs.koen === "mand" || urlState.inputs.koen === "kvinde") {
      setKoen(urlState.inputs.koen);
    }
  }, []);

  useEffect(() => {
    if (harRegistreret.current) return;
    const oprydningScroll = initScrollDepthTracking("idealvaegt");
    const timer = setTimeout(() => {
      trackCalculation("idealvaegt");
      harRegistreret.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const nulstil = useCallback(() => {
    setHoejde(STANDARD_HOEJDE);
    setKoen("mand");
  }, []);

  const delelink = useCallback(() => {
    const state: CalculationState = {
      type: "idealvaegt",
      inputs: { hoejde, koen },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [hoejde, koen]);

  const r = useMemo(() => idealvaegtResultat(hoejde, koen), [hoejde, koen]);
  const normalvaegt = BMI_BAAND.find((b) => b.dansk === "Normalvægt") ?? BMI_BAAND[1];
  const interval = vaegtInterval(hoejde / 100, normalvaegt);

  const resumé = `${l.gennemsnitLabel}: ${fmt(rundIdealvaegt(r.gennemsnit))} kg`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div role="group" aria-label={l.hoejde} className="inline-flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
            {(["mand", "kvinde"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={koen === k}
                onClick={() => setKoen(k)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                  koen === k
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {l[k]}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="idealvaegt-hoejde" className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              {l.hoejde}
            </label>
            <div className="relative">
              <input
                id="idealvaegt-hoejde"
                type="number"
                min={MIN_HOEJDE_CM}
                max={MAX_HOEJDE_CM}
                step="1"
                value={hoejde}
                onChange={(e) => {
                  const h = Number(e.target.value);
                  if (Number.isFinite(h)) {
                    setHoejde(Math.min(MAX_HOEJDE_CM, Math.max(MIN_HOEJDE_CM, h)));
                  }
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">cm</span>
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={nulstil} />
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.gennemsnitLabel}</p>
            <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
              <span>
                {fmt(rundIdealvaegt(r.gennemsnit))} <span className="text-xl font-semibold">kg</span>
              </span>
            </p>
          </div>
          <dl className="mt-3 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
              <dt className="text-sm text-gray-700 dark:text-gray-200">{l.devineLabel}</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                {fmt(rundIdealvaegt(r.devine))} kg
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
              <dt className="text-sm text-gray-700 dark:text-gray-200">{l.hamwiLabel}</dt>
              <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                {fmt(rundIdealvaegt(r.hamwi))} kg
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
        <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{l.intervalTitle}</h3>
        <p className="mb-2">{l.intervalLead}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {fmt(interval.min)}–{interval.max} kg
        </p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{l.intervalSource}</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
        {l.disclaimer}
      </div>

      <details className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
          {l.formulaTitle}
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            {l.devineLabel}: {koen === "mand" ? "50" : "45,5"} kg + 0,9 kg × ({l.hoejdeOrd} − 152)
          </li>
          <li>
            {l.hamwiLabel}: {koen === "mand" ? "48" : "45,4"} kg +{" "}
            {koen === "mand" ? "1,1" : "0,9"} kg × ({l.hoejdeOrd} − 152)
          </li>
        </ul>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {IDEALVAEGT_KILDE.devine.dokument} · {IDEALVAEGT_KILDE.hamwi.dokument}
        </p>
      </details>

      <div className="flex justify-center gap-3">
        <CopyResultButton text={resumé} />
        <ShareCalculation
          getShareableLink={delelink}
          calculatorName={l.calcName}
          resultSummary={resumé}
        />
      </div>
    </div>
  );
}