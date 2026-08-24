"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

interface PostData {
  key: string;
  label: string;
  pris: number;
  min: number;
  max: number;
}

const POSTER: PostData[] = [
  { key: "flyttemand", label: "Flyttemand", pris: 8000, min: 3000, max: 20000 },
  { key: "transport", label: "Transport/flyttebil", pris: 1500, min: 500, max: 5000 },
  { key: "kasser", label: "Kasser og emballage", pris: 500, min: 200, max: 1500 },
  { key: "rengoering", label: "Rengøring af gammel bolig", pris: 2500, min: 1000, max: 6000 },
  { key: "istaendsaettelse", label: "Istandsættelse af gammel bolig", pris: 10000, min: 0, max: 50000 },
  { key: "maegler", label: "Ejendomsmægler", pris: 25000, min: 15000, max: 50000 },
  { key: "tinglysning", label: "Tinglysning", pris: 3000, min: 1850, max: 5000 },
  { key: "advokat", label: "Advokat", pris: 10000, min: 5000, max: 25000 },
  { key: "depositum", label: "Depositum (ny lejebolig)", pris: 30000, min: 15000, max: 60000 },
  { key: "opbevaring", label: "Møbelopbevaring", pris: 2000, min: 1000, max: 5000 },
  { key: "moebler", label: "Nye møbler/hvidevarer", pris: 15000, min: 5000, max: 100000 },
  { key: "forsikring", label: "Flytteforsikring", pris: 1000, min: 500, max: 2500 },
  { key: "andre", label: "Andre udgifter", pris: 0, min: 0, max: 50000 },
];

export default function FlyttebudgetBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      heading: "Flytteudgifter",
      totalBudget: "Samlet flyttebudget",
      total: "Total",
      disclaimer: "Priserne er estimater baseret på gennemsnitlige danske priser 2026. Faktiske priser varierer efter boligtype, håndværkere og geografi.",
      expensePosts: "Udgiftsposter",
      expenseBreakdown: "Udgiftsfordeling",
      reset: "Nulstil",
      shareLabel: "Flyttebudget",
      otherExpenses: "Andre udgifter",
    },
    se: {
      heading: "Flyttkostnader",
      totalBudget: "Total flyttbudget",
      total: "Totalt",
      disclaimer: "Priserna är uppskattningar baserade på genomsnittliga svenska priser 2026. Faktiska priser varierar efter bostadstyp och geografi.",
      expensePosts: "Utgiftsposter",
      expenseBreakdown: "Utgiftsfördelning",
      reset: "Återställ",
      shareLabel: "Flyttbudget",
      otherExpenses: "Andra utgifter",
    },
    no: {
      heading: "Flytteutgifter",
      totalBudget: "Totalt flyttebudsjett",
      total: "Totalt",
      disclaimer: "Prisene er estimater basert på gjennomsnittlige norske priser 2026. Faktiske priser varierer etter bostedstype og geografi.",
      expensePosts: "Utgiftsposter",
      expenseBreakdown: "Utgiftsfordeling",
      reset: "Nullstill",
      shareLabel: "Flyttebudsjett",
      otherExpenses: "Andre utgifter",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const initialValues: Record<string, number> = {};
  for (const p of POSTER) { initialValues[p.key] = p.pris; }

  const [values, setValues] = useState<Record<string, number>>(initialValues);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "flyttebudget") {
      const i = urlState.inputs as Record<string, number>;
      setValues((prev) => {
        const next = { ...prev };
        for (const p of POSTER) {
          if (i[p.key] !== undefined) next[p.key] = i[p.key] as number;
        }
        return next;
      });
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "flyttebudget", timestamp: Date.now(),
      inputs: values,
    });
  }, [values]);

  useEffect(() => initScrollDepthTracking("flyttebudget"), []);

  const setValue = useCallback((key: string, val: string) => {
    const num = Number(val);
    if (!isNaN(num)) setValues((prev) => ({ ...prev, [key]: num }));
  }, []);

  const resultat = useMemo(() => {
    const total = Object.values(values).reduce((sum, v) => sum + v, 0);
    const poster = POSTER
      .map((p) => ({ navn: p.label, beloeb: values[p.key] || 0 }))
      .filter((p) => p.beloeb > 0)
      .sort((a, b) => b.beloeb - a.beloeb);

    if (!hasTracked.current && total > 0) {
      hasTracked.current = true;
      trackCalculation("flyttebudget");
    }

    return { total, poster };
  }, [values, l]);

  const handleReset = useCallback(() => {
    setValues(initialValues);
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

        <div className="space-y-4">
          {POSTER.map((post) => (
            <div key={post.key}>
              <label htmlFor={post.key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{post.label}</label>
              <div className="relative">
                <input id={post.key} type="number" value={values[post.key]}
                  onChange={(e) => setValue(post.key, e.target.value)}
                  min={post.min} max={post.max}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resultat.total > 0 && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">{l.totalBudget}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`${l.totalBudget}: ${formatKr(resultat.total)}`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.shareLabel} />
              </div>
            </div>
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-300">{l.total}</p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{formatKr(resultat.total)}</p>
            </div>
          </div>

          {resultat.poster.length > 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold dark:text-white mb-4">{l.expenseBreakdown}</h3>
              <div className="space-y-3">
                {resultat.poster.map((post, i) => (
                  <div key={post.navn}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{post.navn}</span>
                      <span className="text-sm font-medium dark:text-white">{formatKr(post.beloeb)}</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all"
                        style={{ width: `${(post.beloeb / resultat.total) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {l.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}