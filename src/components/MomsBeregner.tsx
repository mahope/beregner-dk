"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { AnimatedNumber, CopyResultButton, ResetButton } from "@/components/ui";
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency, getCurrencySuffix } from '@/lib/format';

// Dansk momssats
const MOMS_SATS = 0.25; // 25%

export default function MomsBeregner() {
  const { locale } = useLocale();
  const [beloeb, setBeloeb] = useState<number>(1000);
  const [beregningsType, setBeregningsType] = useState<"tillaegMoms" | "fratraekMoms" | "findMoms">("tillaegMoms");
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'moms') {
      const inputs = urlState.inputs;
      if (inputs.beloeb !== undefined) setBeloeb(inputs.beloeb);
      if (inputs.beregningsType) setBeregningsType(inputs.beregningsType);
    }
  }, []);

  const handleReset = useCallback(() => {
    setBeloeb(1000);
    setBeregningsType("tillaegMoms");
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'moms',
      inputs: { beloeb, beregningsType },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beloeb, beregningsType]);

  const beregning = useMemo(() => {
    switch (beregningsType) {
      case "tillaegMoms": {
        // Beløb uden moms → tilføj moms
        const momsBeloeb = beloeb * MOMS_SATS;
        const prisInklMoms = beloeb + momsBeloeb;
        return {
          prisUdenMoms: beloeb,
          momsBeloeb,
          prisInklMoms,
          momsProcent: 25,
        };
      }
      case "fratraekMoms": {
        // Beløb inkl. moms → find pris uden moms
        const prisUdenMoms = beloeb / (1 + MOMS_SATS);
        const momsBeloeb = beloeb - prisUdenMoms;
        return {
          prisUdenMoms,
          momsBeloeb,
          prisInklMoms: beloeb,
          momsProcent: 25,
        };
      }
      case "findMoms": {
        // Find momsandelen i et beløb inkl. moms
        const prisUdenMoms = beloeb / (1 + MOMS_SATS);
        const momsBeloeb = beloeb - prisUdenMoms;
        return {
          prisUdenMoms,
          momsBeloeb,
          prisInklMoms: beloeb,
          momsProcent: 25,
        };
      }
      default:
        return {
          prisUdenMoms: 0,
          momsBeloeb: 0,
          prisInklMoms: 0,
          momsProcent: 25,
        };
    }
  }, [beloeb, beregningsType]);

  // Track calculation once per session
  useEffect(() => {
    if (beregning && !hasTracked.current) {
      const cleanupScroll = initScrollDepthTracking("moms");
    const timer = setTimeout(() => {
        trackCalculation("moms");
        hasTracked.current = true;
      }, 2000);
      return () => { clearTimeout(timer); cleanupScroll(); };
    }
  }, [beregning]);

  const formatKr = (amount: number) => formatCurrency(amount, locale);

  const getInputLabel = () => {
    switch (beregningsType) {
      case "tillaegMoms":
        return "Beløb uden moms";
      case "fratraekMoms":
      case "findMoms":
        return "Beløb inkl. moms";
    }
  };

  return (
    <div className="space-y-8 print-area">
      {/* Beregningstype valg */}
      <div>
        <label className="block text-sm font-medium mb-3">Hvad vil du beregne?</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setBeregningsType("tillaegMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "tillaegMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">Tillæg moms</div>
            <div className="text-sm text-gray-500">Beløb uden moms → inkl. moms</div>
          </button>
          <button
            onClick={() => setBeregningsType("fratraekMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "fratraekMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">Fratræk moms</div>
            <div className="text-sm text-gray-500">Beløb inkl. moms → uden moms</div>
          </button>
          <button
            onClick={() => setBeregningsType("findMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "findMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">Find moms</div>
            <div className="text-sm text-gray-500">Se momsandelen i et beløb</div>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="max-w-md">
        <label htmlFor="momsBeloeb" className="block text-sm font-medium mb-2">{getInputLabel()}</label>
        <div className="relative">
          <input
            id="momsBeloeb"
            type="number"
            min="0"
            step="0.01"
            value={beloeb}
            onChange={(e) => setBeloeb(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border rounded-lg text-lg pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-stagger">
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pris uden moms</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            <AnimatedNumber value={beregning.prisUdenMoms} formatFn={formatKr} />
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moms (25%)</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            <AnimatedNumber value={beregning.momsBeloeb} formatFn={formatKr} />
          </p>
        </div>
        <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pris inkl. moms</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            <AnimatedNumber value={beregning.prisInklMoms} formatFn={formatKr} />
          </p>
        </div>
      </div>

      {/* Share, Copy and Print buttons */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatKr(beregning.prisUdenMoms)} + moms = ${formatKr(beregning.prisInklMoms)}`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Momsberegner"
          resultSummary={`${formatKr(beregning.prisUdenMoms)} + moms = ${formatKr(beregning.prisInklMoms)}`}
        />
        <PrintResult
          calculatorName="Momsberegner"
          resultSummary={`${formatKr(beregning.prisUdenMoms)} + moms = ${formatKr(beregning.prisInklMoms)}`}
        />
      </div>

      {/* Hurtig reference tabel */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Hurtig reference</h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Uden moms</th>
                <th className="text-left py-2">Moms</th>
                <th className="text-left py-2">Inkl. moms</th>
              </tr>
            </thead>
            <tbody>
              {[100, 500, 1000, 5000, 10000].map((amount) => (
                <tr key={amount} className="border-b last:border-b-0">
                  <td className="py-2">{formatKr(amount)}</td>
                  <td className="py-2">{formatKr(amount * MOMS_SATS)}</td>
                  <td className="py-2 font-medium">{formatKr(amount * (1 + MOMS_SATS))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info boks */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 Om dansk moms</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Den danske momssats er <strong>25%</strong></li>
          <li>• For at beregne moms: Beløb × 0,25</li>
          <li>• For at finde pris uden moms: Beløb ÷ 1,25</li>
          <li>• Momsandelen af en pris inkl. moms er 20% (25/125)</li>
        </ul>
      </div>

      {/* Formler */}
      <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          Se formler og beregningsmetoder
        </summary>
        <div className="p-4 pt-0 space-y-4 text-sm dark:text-gray-300">
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">Tillæg moms (25%):</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              Pris inkl. moms = Pris uden moms × 1,25
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">Fratræk moms:</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              Pris uden moms = Pris inkl. moms ÷ 1,25
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">Find momsbeløbet:</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              Moms = Pris inkl. moms - (Pris inkl. moms ÷ 1,25)
            </code>
          </div>
        </div>
      </details>
    </div>
  );
}
