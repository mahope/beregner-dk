"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";

type Locale = "da" | "se" | "no";

const labels = {
  da: {
    income: "Månedlig indkomst (efter skat)",
    expensesTitle: "Månedlige udgifter",
    housing: "Bolig (husleje/boliglån)",
    transport: "Transport (bil, offentlig)",
    food: "Mad og dagligvarer",
    insurance: "Forsikringer",
    subscriptions: "Abonnementer (mobil, streaming, internet)",
    loans: "Afdrag på lån",
    other: "Øvrige udgifter",
    disposable: "Rådighedsbeløb",
    perMonth: "pr. måned",
    totalExpenses: "Samlede udgifter",
    ofIncome: "af indkomsten",
    empty: "Indtast din indkomst og udgifter",
    negative: "Dine udgifter overstiger din indkomst",
    name: "Rådighedsbeløb",
  },
  se: {
    income: "Månadsinkomst (efter skatt)",
    expensesTitle: "Månadsutgifter",
    housing: "Boende (hyra/bolån)",
    transport: "Transport (bil, kollektivt)",
    food: "Mat och dagligvaror",
    insurance: "Försäkringar",
    subscriptions: "Abonnemang (mobil, streaming, internet)",
    loans: "Amortering på lån",
    other: "Övriga utgifter",
    disposable: "Kvar att leva på",
    perMonth: "per månad",
    totalExpenses: "Totala utgifter",
    ofIncome: "av inkomsten",
    empty: "Ange din inkomst och dina utgifter",
    negative: "Dina utgifter överstiger din inkomst",
    name: "Hushållsbudget",
  },
} as const;

const EXPENSE_KEYS = ["housing", "transport", "food", "insurance", "subscriptions", "loans", "other"] as const;
type ExpenseKey = (typeof EXPENSE_KEYS)[number];

export default function BudgetBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const currency = locale === "se" ? "kr" : locale === "no" ? "kr" : "kr";
  const fmt = (n: number) =>
    Math.round(n).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  const [income, setIncome] = useState<number>(28000);
  const [expenses, setExpenses] = useState<Record<ExpenseKey, number>>({
    housing: 9000,
    transport: 2500,
    food: 3500,
    insurance: 1200,
    subscriptions: 800,
    loans: 2000,
    other: 2000,
  });

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "budget") {
      const i = urlState.inputs;
      if (i.income !== undefined) setIncome(Number(i.income));
      if (i.expenses && typeof i.expenses === "object") {
        setExpenses((prev) => ({ ...prev, ...(i.expenses as Record<ExpenseKey, number>) }));
      }
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("budget");
    const timer = setTimeout(() => {
      trackCalculation("budget");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setIncome(28000);
    setExpenses({ housing: 9000, transport: 2500, food: 3500, insurance: 1200, subscriptions: 800, loans: 2000, other: 2000 });
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "budget",
      inputs: { income, expenses },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [income, expenses]);

  const { totalExpenses, disposable, expenseShare } = useMemo(() => {
    const total = EXPENSE_KEYS.reduce((sum, k) => sum + (expenses[k] || 0), 0);
    return {
      totalExpenses: total,
      disposable: income - total,
      expenseShare: income > 0 ? Math.round((total / income) * 100) : 0,
    };
  }, [income, expenses]);

  const setExpense = (k: ExpenseKey, v: number) => setExpenses((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.income}</label>
            <div className="relative">
              <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{currency}</span>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 pt-2">{l.expensesTitle}</p>
          {EXPENSE_KEYS.map((k) => (
            <div key={k}>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l[k]}</label>
              <div className="relative">
                <input type="number" value={expenses[k]} onChange={(e) => setExpense(k, Number(e.target.value))}
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{currency}</span>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Result */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {income > 0 ? (
            <div className="space-y-4 animate-fade-in">
              <div className={`rounded-lg p-4 text-center ${disposable >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                <div className={`text-sm font-medium ${disposable >= 0 ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>{l.disposable}</div>
                <div className={`text-3xl font-bold ${disposable >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {fmt(disposable)} {currency}
                </div>
                <div className={`text-xs mt-1 ${disposable >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {disposable >= 0 ? l.perMonth : l.negative}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.totalExpenses}</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{fmt(totalExpenses)} {currency}</div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{expenseShare}% {l.ofIncome}</div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${expenseShare > 100 ? "bg-red-500" : expenseShare > 80 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(expenseShare, 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">📊</div>
              <p>{l.empty}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.disposable}: ${fmt(disposable)} ${currency} ${l.perMonth}`} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={`${l.disposable}: ${fmt(disposable)} ${currency}`} />
      </div>
    </div>
  );
}
