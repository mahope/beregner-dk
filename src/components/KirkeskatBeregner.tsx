"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Church, LogOut } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { beregnKirkeskat, kirkeskatSats } from "@/lib/kirkeskat";
import { KOMMUNER } from "@/lib/kommuner";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency } from "@/lib/format";

export default function KirkeskatBeregner() {
  const { locale } = useLocale();
  const formatKr = (amount: number) =>
    formatCurrency(amount, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [indkomst, setIndkomst] = useState<string>("");
  const [kommune, setKommune] = useState<string>("København");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "kirkeskat") {
      const inputs = urlState.inputs;
      if (inputs.indkomst !== undefined) setIndkomst(String(inputs.indkomst));
      if (inputs.kommune) setKommune(inputs.kommune);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kirkeskat");
    const timer = setTimeout(() => {
      trackCalculation("kirkeskat");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "kirkeskat",
      inputs: { indkomst, kommune },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [indkomst, kommune]);

  const handleReset = useCallback(() => {
    setIndkomst("");
    setKommune("København");
  }, []);

  const resultat = useMemo(() => {
    const tal = parseFloat(indkomst.replace(/\./g, "").replace(",", "."));
    return beregnKirkeskat(tal, kommune);
  }, [indkomst, kommune]);

  const sats = kirkeskatSats(kommune);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="kirkeskat-indkomst"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Skattepligtig indkomst (kr.)
            </label>
            <div className="relative">
              <input
                id="kirkeskat-indkomst"
                type="text"
                inputMode="numeric"
                placeholder="F.eks. 450000"
                value={indkomst}
                onChange={(e) => setIndkomst(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Din skattepligtige indkomst efter fradrag (fra selvangivelsen)
            </p>
          </div>

          <div>
            <label
              htmlFor="kirkeskat-kommune"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Kommune
            </label>
            <select
              id="kirkeskat-kommune"
              value={kommune}
              onChange={(e) => setKommune(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
            >
              {KOMMUNER.map((k) => (
                <option key={k.navn} value={k.navn}>
                  {k.navn} ({k.kirkeskat.toLocaleString("da-DK", { minimumFractionDigits: 2 })} %)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Church className="w-5 h-5" aria-hidden="true" />
            Din kirkeskat
          </h3>
          {resultat ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-300">Kirkeskat pr. år:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatKr(resultat.kirkeskat)} kr.
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Sats:</span>
                <span className="font-medium">
                  {sats.toLocaleString("da-DK", { minimumFractionDigits: 2 })} %
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-300">Kirkeskat pr. måned:</span>
                <span className="font-medium">{formatKr(Math.round(resultat.kirkeskat / 12))} kr.</span>
              </div>
              <hr className="border-gray-200 dark:border-gray-600" />
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-1">
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Ved at melde dig ud af folkekirken
                </div>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Du sparer <strong>{formatKr(resultat.sparing)} kr.</strong> pr. år
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Indtast din skattepligtige indkomst for at se din kirkeskat.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <CopyResultButton
          text={
            resultat
              ? `Kirkeskat: ${formatKr(resultat.kirkeskat)} kr./år (${sats.toLocaleString("da-DK", { minimumFractionDigits: 2 })} % af ${formatKr(resultat.skattepligtig)} kr.)`
              : ""
          }
        />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName="Kirkeskat" />
        <ResetButton onReset={handleReset} />
      </div>
    </div>
  );
}
