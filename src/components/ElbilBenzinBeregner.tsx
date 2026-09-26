"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Fuel, Zap } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { billigsteNatVindue, gennemsnitsPris, type PriceArea } from "@/lib/energi/elpriser";
import { elbilForudsætninger } from "@/lib/braendstof";
import type { ElprisData } from "@/lib/energi/server";
import { kr2 } from "@/components/energi/ElprisGraf";
import EnergiKilde from "@/components/energi/EnergiKilde";
import PrisomraadeVaelger, { OMRAADE_NAVN } from "@/components/energi/PrisomraadeVaelger";

const labels = {
  da: {
    common: "Fælles",
    kmPerYear: "Kørte km pr. år",
    years: "Ejerperiode (år)",
    ev: "Elbil",
    petrol: "Benzinbil",
    evUse: "Elforbrug (kWh/100 km)",
    elPrice: "Elpris (kr/kWh)",
    petrolUse: "Forbrug (km/l)",
    petrolPrice: "Benzinpris (kr/l)",
    priceDiff: "Merpris for elbilen ved køb (valgfrit)",
    yearlyEnergy: "Årlig energiudgift",
    saving: "Årlig besparelse med elbil",
    overPeriod: "Over hele perioden",
    payback: "Tilbagebetalingstid på merpris",
    yearsUnit: "år",
    evCheaper: "Elbilen er billigst i drift",
    petrolCheaper: "Benzinbilen er billigst i drift",
    perYear: "pr. år",
    name: "Elbil vs. benzinbil",
    note: "Beregningen viser energiudgiften (el vs. benzin). Forsikring, service og værditab varierer og indgår ikke.",
  },
  se: {
    common: "Gemensamt",
    kmPerYear: "Körda km per år",
    years: "Ägandeperiod (år)",
    ev: "Elbil",
    petrol: "Bensinbil",
    evUse: "Elförbrukning (kWh/100 km)",
    elPrice: "Elpris (kr/kWh)",
    petrolUse: "Förbrukning (km/l)",
    petrolPrice: "Bensinpris (kr/l)",
    priceDiff: "Merpris för elbilen vid köp (valfritt)",
    yearlyEnergy: "Årlig energikostnad",
    saving: "Årlig besparing med elbil",
    overPeriod: "Under hela perioden",
    payback: "Återbetalningstid på merpriset",
    yearsUnit: "år",
    evCheaper: "Elbilen är billigast i drift",
    petrolCheaper: "Bensinbilen är billigast i drift",
    perYear: "per år",
    name: "Elbil vs. bensinbil",
    note: "Beräkningen visar energikostnaden (el vs. bensin). Försäkring, service och värdeminskning varierar och ingår inte.",
  },
} as const;

type Props = {
  /** Live Danish prices; only used on the Danish locale. Null keeps the static default. */
  elprisData?: ElprisData | null;
  nu?: { date: string; hour: number };
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const hh = (h: number) => String(h % 24).padStart(2, "0");
const dagNavn = (date: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString("da-DK", { timeZone: "UTC", weekday: "long", day: "numeric", month: "short" });

export default function ElbilBenzinBeregner({ elprisData = null, nu }: Props = {}) {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const f = elbilForudsætninger(locale);
  const live = locale === "da" ? elprisData : null;
  const [omraade, setOmraade] = useState<PriceArea>("DK2");
  const dagensGns = (a: PriceArea) => {
    const dag = live?.omraader[a].dage.find((d) => d.date === live.idag);
    return dag ? gennemsnitsPris(dag.hours).total : null;
  };
  const liveGns = dagensGns(omraade);
  const standardElPrice = liveGns !== null ? round2(liveGns) : f.elKwhPris;
  const ladeVindue = live && nu ? billigsteNatVindue(live.omraader[omraade].dage, nu, 4) : null;
  const fmt = (n: number) => Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [kmPerYear, setKmPerYear] = useState<number>(f.kmPrAar);
  const [years, setYears] = useState<number>(f.aar);
  const [evUse, setEvUse] = useState<number>(f.elKwhPer100km);
  const [elPrice, setElPrice] = useState<number>(standardElPrice);
  const [petrolUse, setPetrolUse] = useState<number>(f.benzinKmPerLiter);
  const [petrolPrice, setPetrolPrice] = useState<number>(f.benzinLiterPris);
  const [priceDiff, setPriceDiff] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "elbil") {
      const i = urlState.inputs;
      if (i.kmPerYear !== undefined) setKmPerYear(Number(i.kmPerYear));
      if (i.years !== undefined) setYears(Number(i.years));
      if (i.evUse !== undefined) setEvUse(Number(i.evUse));
      if (i.elPrice !== undefined) setElPrice(Number(i.elPrice));
      if (i.petrolUse !== undefined) setPetrolUse(Number(i.petrolUse));
      if (i.petrolPrice !== undefined) setPetrolPrice(Number(i.petrolPrice));
      if (i.priceDiff !== undefined) setPriceDiff(Number(i.priceDiff));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("elbil");
    const timer = setTimeout(() => {
      trackCalculation("elbil");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setKmPerYear(f.kmPrAar);
    setYears(f.aar);
    setEvUse(f.elKwhPer100km);
    setElPrice(standardElPrice);
    setPetrolUse(f.benzinKmPerLiter);
    setPetrolPrice(f.benzinLiterPris);
    setPriceDiff(0);
  }, [f, standardElPrice]);

  const skiftOmraade = (a: PriceArea) => {
    setOmraade(a);
    const gns = dagensGns(a);
    if (gns !== null) setElPrice(round2(gns));
  };

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "elbil",
      inputs: { kmPerYear, years, evUse, elPrice, petrolUse, petrolPrice, priceDiff },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [kmPerYear, years, evUse, elPrice, petrolUse, petrolPrice, priceDiff]);

  const r = useMemo(() => {
    const evYearly = (kmPerYear / 100) * evUse * elPrice;
    const petrolYearly = petrolUse > 0 ? (kmPerYear / petrolUse) * petrolPrice : 0;
    const saving = petrolYearly - evYearly;
    const payback = priceDiff > 0 && saving > 0 ? priceDiff / saving : null;
    return {
      evYearly,
      petrolYearly,
      saving,
      evPeriod: evYearly * years,
      petrolPeriod: petrolYearly * years,
      savingPeriod: saving * years,
      payback,
      evCheaper: saving >= 0,
    };
  }, [kmPerYear, years, evUse, elPrice, petrolUse, petrolPrice, priceDiff]);

  const field = (label: string, value: number, onChange: (n: number) => void, step = "1", unit = "") => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{l.common}</p>
          {field(l.kmPerYear, kmPerYear, setKmPerYear, "100", "km")}
          {field(l.years, years, setYears, "1", l.yearsUnit)}

          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 pt-2 inline-flex items-center gap-1.5"><Zap className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.ev}</p>
          {field(l.evUse, evUse, setEvUse, "0.1", "kWh")}
          {live && <PrisomraadeVaelger value={omraade} onChange={skiftOmraade} />}
          {field(l.elPrice, elPrice, setElPrice, "0.01", "kr")}
          {liveGns !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
              Standard er dagens gennemsnitlige elpris i {OMRAADE_NAVN[omraade]}: {kr2(liveGns)} kr/kWh inkl. nettarif, afgifter og moms.
            </p>
          )}

          <p className="text-sm font-medium text-orange-700 dark:text-orange-300 pt-2 inline-flex items-center gap-1.5"><Fuel className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.petrol}</p>
          {field(l.petrolUse, petrolUse, setPetrolUse, "0.1", "km/l")}
          {field(l.petrolPrice, petrolPrice, setPetrolPrice, "0.1", "kr")}

          {field(l.priceDiff, priceDiff, setPriceDiff, "1000", "kr")}

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className={`rounded-lg p-4 text-center ${r.evCheaper ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
              <div className={`text-sm font-medium ${r.evCheaper ? "text-blue-800 dark:text-blue-300" : "text-orange-800 dark:text-orange-300"}`}>
                {r.evCheaper ? l.evCheaper : l.petrolCheaper}
              </div>
              <div className={`text-3xl font-bold ${r.evCheaper ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"}`}>
                {fmt(Math.abs(r.saving))} kr
              </div>
              <div className={`text-xs mt-1 ${r.evCheaper ? "text-blue-700 dark:text-blue-400" : "text-orange-700 dark:text-orange-400"}`}>
                {l.saving} {l.perYear}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1 justify-center"><Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.ev}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(r.evYearly)} kr</div>
                <div className="text-xs text-gray-400">{l.perYear}</div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1 justify-center"><Fuel className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.petrol}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{fmt(r.petrolYearly)} kr</div>
                <div className="text-xs text-gray-400">{l.perYear}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{l.overPeriod} ({years} {l.yearsUnit})</span>
                <span className="font-medium dark:text-gray-200">{fmt(r.savingPeriod)} kr</span>
              </div>
              {r.payback !== null && (
                <div className="flex justify-between border-t pt-1.5 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">{l.payback}</span>
                  <span className="font-medium dark:text-gray-200">{r.payback.toFixed(1)} {l.yearsUnit}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      {live && (
        <div className="mt-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 md:p-5">
          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">Billigste 4 sammenhængende timer at lade i nat</h3>
          {ladeVindue ? (
            <>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                kl. {hh(ladeVindue.startHour)}-{ladeVindue.slutHour === 0 ? "24" : hh(ladeVindue.slutHour)}
              </p>
              <p className="text-sm text-green-900 dark:text-green-200">
                {dagNavn(ladeVindue.startDate)} · gennemsnit {kr2(ladeVindue.gennemsnit)} kr/kWh
                {liveGns !== null && liveGns > ladeVindue.gennemsnit && (
                  <> ({Math.round((1 - ladeVindue.gennemsnit / liveGns) * 100)}% under dagens gennemsnit)</>
                )}
                . Det svarer til ca. {kr2((evUse * ladeVindue.gennemsnit))} kr pr. 100 km.
              </p>
              {ladeVindue.kunIDag && (
                <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                  Morgendagens priser offentliggøres ca. kl. 13. Indtil da regnes der kun på aftenens timer frem til midnat.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-green-900 dark:text-green-200">Der er ikke kendte priser for nok timer i nat endnu. Kig igen efter kl. 13.</p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Beregnet ud fra timeprisen inkl. nettarif, afgifter og moms mellem kl. 18 og 08. Nettariffen er højest kl. 17-21, så aftenen er sjældent billigst.
          </p>
          <EnergiKilde hentet={live.hentet} tariffer={live.omraader[omraade].tariffer} className="mt-2" />
        </div>
      )}

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.saving}: ${fmt(r.saving)} kr ${l.perYear}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.saving}: ${fmt(r.saving)} kr/${l.perYear}`} />
      </div>
    </div>
  );
}
