"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { konverterEnhed, ENHEDER, EnhedsGruppe } from "@/lib/enheder";

const groupLabels = {
  da: { laengde: "Længde", vaegt: "Vægt", volumen: "Volumen" },
  se: { laengde: "Längd", vaegt: "Vikt", volumen: "Volym" },
} as const;

const unitLabels: Record<string, { da: string; se: string }> = {
  mm: { da: "Millimeter (mm)", se: "Millimeter (mm)" },
  cm: { da: "Centimeter (cm)", se: "Centimeter (cm)" },
  m: { da: "Meter (m)", se: "Meter (m)" },
  km: { da: "Kilometer (km)", se: "Kilometer (km)" },
  inch: { da: "Tomme (in)", se: "Tum (in)" },
  foot: { da: "Fod (ft)", se: "Fot (ft)" },
  yard: { da: "Yard (yd)", se: "Yard (yd)" },
  mile: { da: "Engelsk mil (mile)", se: "Engelsk mil (mile)" },
  sømil: { da: "Sømil (nm)", se: "Nautisk mil (nm)" },
  mg: { da: "Milligram (mg)", se: "Milligram (mg)" },
  g: { da: "Gram (g)", se: "Gram (g)" },
  kg: { da: "Kilogram (kg)", se: "Kilogram (kg)" },
  ton: { da: "Ton", se: "Ton" },
  ounce: { da: "Ounce (oz)", se: "Uns (oz)" },
  pound: { da: "Pund (lb)", se: "Pund (lb)" },
  stone: { da: "Stone (st)", se: "Stone (st)" },
  ml: { da: "Milliliter (ml)", se: "Milliliter (ml)" },
  cl: { da: "Centiliter (cl)", se: "Centiliter (cl)" },
  dl: { da: "Deciliter (dl)", se: "Deciliter (dl)" },
  l: { da: "Liter (l)", se: "Liter (l)" },
  m3: { da: "Kubikmeter (m³)", se: "Kubikmeter (m³)" },
  gallon: { da: "Gallon (US)", se: "Gallon (US)" },
  pint: { da: "Pint (US)", se: "Pint (US)" },
};

const labels = {
  da: {
    group: "Kategori",
    value: "Værdi",
    from: "Fra",
    to: "Til",
    name: "Enhedsberegner",
    note: "Bemærk: engelsk mil = 1.609 m, mens en skandinavisk »mil« er 10 km. Denne beregner bruger den engelske mil.",
  },
  se: {
    group: "Kategori",
    value: "Värde",
    from: "Från",
    to: "Till",
    name: "Enhetskalkylator",
    note: "Obs: engelsk mil = 1 609 m, medan en skandinavisk »mil« är 10 km. Den här kalkylatorn använder engelsk mil.",
  },
} as const;

const DEFAULT_UNITS: Record<EnhedsGruppe, [string, string]> = {
  laengde: ["km", "mile"],
  vaegt: ["kg", "pound"],
  volumen: ["l", "gallon"],
};

export default function EnhederBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const gl = groupLabels[lang];
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      maximumFractionDigits: 6,
    });

  const [group, setGroup] = useState<EnhedsGruppe>("laengde");
  const [value, setValue] = useState<number>(10);
  const [from, setFrom] = useState<string>("km");
  const [to, setTo] = useState<string>("mile");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "enheder") {
      const i = urlState.inputs;
      if (i.group === "laengde" || i.group === "vaegt" || i.group === "volumen") setGroup(i.group);
      if (i.value !== undefined) setValue(Number(i.value));
      if (typeof i.from === "string") setFrom(i.from);
      if (typeof i.to === "string") setTo(i.to);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("enheder");
    const timer = setTimeout(() => {
      trackCalculation("enheder");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const changeGroup = useCallback((g: EnhedsGruppe) => {
    setGroup(g);
    setFrom(DEFAULT_UNITS[g][0]);
    setTo(DEFAULT_UNITS[g][1]);
  }, []);

  const handleReset = useCallback(() => {
    setGroup("laengde");
    setValue(10);
    setFrom("km");
    setTo("mile");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "enheder",
      inputs: { group, value, from, to },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [group, value, from, to]);

  const result = useMemo(() => konverterEnhed(value, group, from, to), [value, group, from, to]);

  const options = ENHEDER[group].map((e) => (
    <option key={e.id} value={e.id}>{unitLabels[e.id][lang]}</option>
  ));

  const groupBtn = (g: EnhedsGruppe) => (
    <button key={g} type="button" onClick={() => changeGroup(g)}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        group === g
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}>
      {gl[g]}
    </button>
  );

  const selectCls = "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.group}</label>
            <div className="grid grid-cols-3 gap-2">
              {groupBtn("laengde")}
              {groupBtn("vaegt")}
              {groupBtn("volumen")}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.value}</label>
            <input type="number" step="any" value={value} onChange={(e) => setValue(Number(e.target.value))}
              className={selectCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.from}</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectCls}>{options}</select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.to}</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className={selectCls}>{options}</select>
            </div>
          </div>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {fmt(value)} {unitLabels[from][lang]}
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {result !== null ? fmt(result) : "—"}
              </div>
              <div className="text-xs mt-1 text-blue-700 dark:text-blue-400">{unitLabels[to][lang]}</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${fmt(value)} ${unitLabels[from][lang]} = ${result !== null ? fmt(result) : "—"} ${unitLabels[to][lang]}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${fmt(value)} ${from} = ${result !== null ? fmt(result) : "—"} ${to}`} />
      </div>
    </div>
  );
}
