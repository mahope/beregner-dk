"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";
import { beregnBoligsalg, DEFAULT_VALUES, type BoligsalgInput, type BoligsalgResultat } from "@/lib/boligsalg";

const INPUTS: { key: keyof BoligsalgInput; label: string; min: number; max: number; suffix?: string }[] = [
  { key: "salgspris", label: "Salgspris for din bolig", min: 100000, max: 50000000, suffix: "kr" },
  { key: "markedsfoering", label: "Markedsføring (foto, annoncering)", min: 0, max: 50000 },
  { key: "energimaerke", label: "Energimærke", min: 0, max: 15000 },
  { key: "tilstandsrapport", label: "Tilstandsrapport", min: 0, max: 15000 },
  { key: "elRapport", label: "Elinstallationsrapport", min: 0, max: 10000 },
  { key: "ejerskifteforsikring", label: "Ejerskifteforsikring (sælgerandel)", min: 0, max: 15000 },
  { key: "dataRapport", label: "Ejendomsdatarapport", min: 0, max: 1000 },
  { key: "istaendsaettelse", label: "Istandsættelse før salg", min: 0, max: 200000 },
  { key: "flytning", label: "Flytning", min: 0, max: 50000 },
  { key: "advokat", label: "Advokat/berigtigelse", min: 0, max: 30000 },
  { key: "indfrielseGebyrer", label: "Indfrielse af lån (gebyrer)", min: 0, max: 10000 },
  { key: "nyBoligPris", label: "Ny bolig pris (til tinglysning)", min: 0, max: 50000000 },
  { key: "andre", label: "Andre udgifter", min: 0, max: 100000 },
];

export default function BoligsalgBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      heading: "Beregn dit salgsprovenu",
      salesProceeds: "Netto provenu ved salg",
      totalCosts: "Samlede salgsomkostninger",
      total: "I alt",
      salesPrice: "Salgspris",
      net: "Netto",
      maeglerSettings: "Mæglerhonorar",
      maeglerType: "Honorartype",
      maeglerProcent: "Mæglerhonorar i procent",
      maeglerFast: "Fast honorar",
      procent: "Procent",
      fixed: "Fast beløb",
      tinglysningSettings: "Tinglysning af ny bolig",
      tinglysningInclude: "Medtag tinglysning af ny bolig",
      breakdown: "Omkostningsfordeling",
      disclaimer: "Estimater baseret på gennemsnitlige danske priser 2026. Faktiske omkostninger varierer. Mæglerhonorar forhandles individuelt. Tinglysningssatser 0,6% + 1.850 kr (skøde) og 1,45% + 1.825 kr (pantebrev).",
      reset: "Nulstil",
      shareLabel: "Boligsalgsberegner",
      noMaegler: "Vælg honorartype",
    },
    se: {
      heading: "Beräkna ditt försäljningsnetto",
      salesProceeds: "Netto från försäljning",
      totalCosts: "Totala kostnader",
      total: "Totalt",
      salesPrice: "Försäljningspris",
      net: "Netto",
      maeglerSettings: "Mäklararvode",
      maeglerType: "Arvodestyp",
      maeglerProcent: "Mäklararvode i procent",
      maeglerFast: "Fast arvode",
      procent: "Procent",
      fixed: "Fast belopp",
      tinglysningSettings: "Lagfart av ny bostad",
      tinglysningInclude: "Inkludera lagfart av ny bostad",
      breakdown: "Kostnadsfördelning",
      disclaimer: "Uppskattningar baserade på genomsnittliga svenska priser 2026. Faktiska kostnader varierar.",
      reset: "Återställ",
      shareLabel: "Bostadsförsäljning",
      noMaegler: "Välj arvodestyp",
    },
    no: {
      heading: "Beregn ditt salgsproveny",
      salesProceeds: "Netto proveny ved salg",
      totalCosts: "Totale salgskostnader",
      total: "Totalt",
      salesPrice: "Salgspris",
      net: "Netto",
      maeglerSettings: "Meglerhonorar",
      maeglerType: "Honorartype",
      maeglerProcent: "Meglerhonorar i prosent",
      maeglerFast: "Fast honorar",
      procent: "Prosent",
      fixed: "Fast beløp",
      tinglysningSettings: "Tinglysning av ny bolig",
      tinglysningInclude: "Inkluder tinglysning av ny bolig",
      breakdown: "Kostnadsfordeling",
      disclaimer: "Estimater basert på gjennomsnittlige norske priser 2026. Faktiske kostnader varierer.",
      reset: "Nullstill",
      shareLabel: "Boligsalgskalkulator",
      noMaegler: "Velg honorartype",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [values, setValues] = useState<BoligsalgInput>({ ...DEFAULT_VALUES });

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "boligsalg") {
      const i = urlState.inputs as Record<string, unknown>;
      setValues((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next) as (keyof BoligsalgInput)[]) {
          if (i[key] !== undefined) next[key] = i[key] as number & boolean;
        }
        return next;
      });
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "boligsalg", timestamp: Date.now(),
      inputs: values,
    });
  }, [values]);

  useEffect(() => initScrollDepthTracking("boligsalg"), []);

  const setValue = useCallback((key: keyof BoligsalgInput, val: string | boolean) => {
    if (typeof val === "boolean") {
      setValues((prev) => ({ ...prev, [key]: val }));
    } else {
      const num = Number(val);
      if (!isNaN(num)) setValues((prev) => ({ ...prev, [key]: num }));
    }
  }, []);

  const resultat: BoligsalgResultat | null = useMemo(() => {
    const r = beregnBoligsalg(values);
    if (r && r.nettoProvenu > 0 && !hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("boligsalg");
    }
    return r;
  }, [values]);

  const handleReset = useCallback(() => {
    setValues({ ...DEFAULT_VALUES });
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => formatCurrency(n, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#14b8a6", "#6b7280", "#d946ef", "#22d3ee"];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{l.heading}</h2>
          <ResetButton onReset={handleReset} />
        </div>

        {/* Sales price */}
        <div>
          <label htmlFor="salgspris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l.salesPrice}</label>
          <div className="relative">
            <input id="salgspris" type="number" value={values.salgspris}
              onChange={(e) => setValue("salgspris", e.target.value)}
              min={100000} max={50000000}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-lg" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
          </div>
        </div>

        {/* Mægler settings */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{l.maeglerSettings}</h3>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{l.maeglerType}</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="maeglerType" value="procent"
                  checked={values.maeglerType === "procent"}
                  onChange={() => setValue("maeglerType", "procent" as unknown as boolean)}
                  className="accent-blue-600" /> {l.procent}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="radio" name="maeglerType" value="fast"
                  checked={values.maeglerType === "fast"}
                  onChange={() => setValue("maeglerType", "fast" as unknown as boolean)}
                  className="accent-blue-600" /> {l.fixed}
              </label>
            </div>
          </div>
          {values.maeglerType === "procent" ? (
            <div>
              <label htmlFor="maeglerProcent" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{l.maeglerProcent}</label>
              <div className="relative w-40">
                <input id="maeglerProcent" type="number" value={values.maeglerProcent}
                  onChange={(e) => setValue("maeglerProcent", e.target.value)}
                  min={0} max={10} step={0.1}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pr-8 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="maeglerFast" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{l.maeglerFast}</label>
              <div className="relative w-40">
                <input id="maeglerFast" type="number" value={values.maeglerFast}
                  onChange={(e) => setValue("maeglerFast", e.target.value)}
                  min={0} max={200000}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pr-8 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Other costs */}
        <div className="space-y-4">
          {INPUTS.filter((i) => i.key !== "salgspris" && i.key !== "nyBoligPris" && i.key !== "maeglerProcent" && i.key !== "maeglerFast").map((input) => (
            <div key={input.key}>
              <label htmlFor={input.key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{input.label}</label>
              <div className="relative">
                <input id={input.key} type="number" value={values[input.key] as number}
                  onChange={(e) => setValue(input.key, e.target.value)}
                  min={input.min} max={input.max}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{input.suffix || getCurrencySuffix(locale)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tinglysning toggle */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{l.tinglysningSettings}</h3>
          <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox"
              checked={values.tinglysningInkluderet}
              onChange={(e) => setValue("tinglysningInkluderet", e.target.checked)}
              className="rounded accent-blue-600 w-4 h-4" />
            <span>{l.tinglysningInclude}</span>
          </label>
          {values.tinglysningInkluderet && (
            <div>
              <label htmlFor="nyBoligPris" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ny boligs pris</label>
              <div className="relative">
                <input id="nyBoligPris" type="number" value={values.nyBoligPris}
                  onChange={(e) => setValue("nyBoligPris", e.target.value)}
                  min={0} max={50000000}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {resultat && resultat.nettoProvenu > 0 && (
        <div className="animate-fade-in space-y-4">
          {/* Net proceeds */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">{l.salesProceeds}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`${l.salesProceeds}: ${formatKr(resultat.nettoProvenu)}`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.shareLabel} />
              </div>
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">{l.net}</p>
            <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{formatKr(resultat.nettoProvenu)}</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              {l.totalCosts}: {formatKr(resultat.samledeOmkostninger)}
            </p>
          </div>

          {/* Cost breakdown */}
          {resultat.fordelinger.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold dark:text-white mb-4">{l.breakdown}</h3>
              <div className="space-y-3">
                {resultat.fordelinger.map((post, i) => (
                  <div key={post.navn}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{post.navn}</span>
                      <span className="text-sm font-medium dark:text-white">{formatKr(post.beloeb)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all"
                        style={{ width: `${post.procent}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{l.disclaimer}</p>
        </div>
      )}
    </div>
  );
}