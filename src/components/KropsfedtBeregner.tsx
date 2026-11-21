"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnKropsfedt, Koen, FedtKategori } from "@/lib/kropsfedt";

const labels = {
  da: {
    sex: "Køn",
    man: "Mand",
    woman: "Kvinde",
    height: "Højde",
    waist: "Talje (omkreds)",
    neck: "Hals (omkreds)",
    hip: "Hofte (omkreds)",
    result: "Anslået kropsfedt",
    name: "Kropsfedtprocent",
    note: "Estimeret med U.S. Navy-metoden ud fra kropsmål. Mål taljen ved navlen, halsen under adamsæblet og hoften på det bredeste sted. Resultatet er et estimat.",
    cat: {
      essentiel: "Essentielt fedt",
      atlet: "Atlet",
      fitness: "Fitness",
      gennemsnit: "Gennemsnit",
      over: "Over gennemsnit",
    } as Record<FedtKategori, string>,
  },
  se: {
    sex: "Kön",
    man: "Man",
    woman: "Kvinna",
    height: "Längd",
    waist: "Midja (omkrets)",
    neck: "Hals (omkrets)",
    hip: "Höft (omkrets)",
    result: "Uppskattat kroppsfett",
    name: "Kroppsfettprocent",
    note: "Uppskattat med U.S. Navy-metoden utifrån kroppsmått. Mät midjan vid naveln, halsen under adamsäpplet och höften på bredaste stället. Resultatet är en uppskattning.",
    cat: {
      essentiel: "Essentiellt fett",
      atlet: "Atlet",
      fitness: "Fitness",
      gennemsnit: "Genomsnitt",
      over: "Över genomsnitt",
    } as Record<FedtKategori, string>,
  },
} as const;

const CAT_COLOR: Record<FedtKategori, string> = {
  essentiel: "text-blue-600 dark:text-blue-400",
  atlet: "text-green-600 dark:text-green-400",
  fitness: "text-emerald-600 dark:text-emerald-400",
  gennemsnit: "text-amber-600 dark:text-amber-400",
  over: "text-red-600 dark:text-red-400",
};

export default function KropsfedtBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 1 });

  const [sex, setSex] = useState<Koen>("mand");
  const [height, setHeight] = useState<number>(180);
  const [waist, setWaist] = useState<number>(90);
  const [neck, setNeck] = useState<number>(40);
  const [hip, setHip] = useState<number>(95);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "kropsfedt") {
      const i = urlState.inputs;
      if (i.sex === "mand" || i.sex === "kvinde") setSex(i.sex);
      if (i.height !== undefined) setHeight(Number(i.height));
      if (i.waist !== undefined) setWaist(Number(i.waist));
      if (i.neck !== undefined) setNeck(Number(i.neck));
      if (i.hip !== undefined) setHip(Number(i.hip));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kropsfedt");
    const timer = setTimeout(() => {
      trackCalculation("kropsfedt");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setSex("mand");
    setHeight(180);
    setWaist(90);
    setNeck(40);
    setHip(95);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "kropsfedt",
      inputs: { sex, height, waist, neck, hip },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [sex, height, waist, neck, hip]);

  const r = useMemo(() => beregnKropsfedt(sex, height, waist, neck, hip), [sex, height, waist, neck, hip]);

  const field = (label: string, value: number, onChange: (n: number) => void) => (
    <div>
      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input type="number" min="0" step="0.5" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">cm</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.sex}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["mand", "kvinde"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSex(s)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    sex === s ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  {s === "mand" ? l.man : l.woman}
                </button>
              ))}
            </div>
          </div>
          {field(l.height, height, setHeight)}
          {field(l.waist, waist, setWaist)}
          {field(l.neck, neck, setNeck)}
          {sex === "kvinde" && field(l.hip, hip, setHip)}
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-white dark:bg-gray-700 shadow-sm">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{l.result}</div>
              <div className={`text-4xl font-bold ${r ? CAT_COLOR[r.kategori] : "text-gray-400"}`}>
                {r ? fmt(r.procent) : "—"} %
              </div>
              {r && <div className={`text-sm mt-1 font-medium ${CAT_COLOR[r.kategori]}`}>{l.cat[r.kategori]}</div>}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.result}: ${r ? fmt(r.procent) : "—"} %`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.result}: ${r ? fmt(r.procent) : "—"} %`} />
      </div>
    </div>
  );
}
