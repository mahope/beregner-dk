"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { ModeSelector, ModeOption } from "@/components/ModeSelector";
import { prisEfterRabat, findRabatProcent } from "@/lib/rabat";

type RabatMode = "pris-efter-rabat" | "find-rabat-procent";

const labels = {
  da: {
    modePrisLabel: "Pris efter rabat",
    modePrisDesc: "Originalpris og rabat% → ny pris",
    modeProcentLabel: "Find rabatprocent",
    modeProcentDesc: "Original- og tilbudspris → rabat%",
    modeSelectorName: "Beregningstype",
    originalPris: "Originalpris",
    rabatProcent: "Rabat",
    tilbudspris: "Tilbudspris",
    besparelse: "Du sparer",
    prisEfter: "Pris efter rabat",
    resultHeading: "Resultat",
    calcName: "Rabatberegner",
  },
  se: {
    modePrisLabel: "Pris efter rabatt",
    modePrisDesc: "Originalpris och rabatt% → nytt pris",
    modeProcentLabel: "Hitta rabattprocent",
    modeProcentDesc: "Original- och reapris → rabatt%",
    modeSelectorName: "Beräkningstyp",
    originalPris: "Originalpris",
    rabatProcent: "Rabatt",
    tilbudspris: "Reapris",
    besparelse: "Du sparar",
    prisEfter: "Pris efter rabatt",
    resultHeading: "Resultat",
    calcName: "Rabattkalkylator",
  },
} as const;

export default function RabatBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const fmt = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const MODES: ModeOption<RabatMode>[] = [
    { id: "pris-efter-rabat", label: l.modePrisLabel, desc: l.modePrisDesc },
    { id: "find-rabat-procent", label: l.modeProcentLabel, desc: l.modeProcentDesc },
  ];

  const [mode, setMode] = useState<RabatMode>("pris-efter-rabat");
  const [originalPris, setOriginalPris] = useState<number>(400);
  const [rabatProcent, setRabatProcent] = useState<number>(25);
  const [tilbudspris, setTilbudspris] = useState<number>(300);

  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "rabat") {
      const i = urlState.inputs;
      if (i.mode) setMode(i.mode);
      if (i.originalPris !== undefined) setOriginalPris(Number(i.originalPris));
      if (i.rabatProcent !== undefined) setRabatProcent(Number(i.rabatProcent));
      if (i.tilbudspris !== undefined) setTilbudspris(Number(i.tilbudspris));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("rabat");
    const timer = setTimeout(() => {
      trackCalculation("rabat");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setMode("pris-efter-rabat");
    setOriginalPris(400);
    setRabatProcent(25);
    setTilbudspris(300);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "rabat",
      inputs: { mode, originalPris, rabatProcent, tilbudspris },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [mode, originalPris, rabatProcent, tilbudspris]);

  const resultat = useMemo(() => {
    if (mode === "pris-efter-rabat") {
      return prisEfterRabat(originalPris, rabatProcent);
    }
    return findRabatProcent(originalPris, tilbudspris);
  }, [mode, originalPris, rabatProcent, tilbudspris]);

  return (
    <div>
      <ModeSelector
        modes={MODES}
        currentMode={mode}
        onChange={setMode}
        name={l.modeSelectorName}
        columns={2}
      />

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {l.originalPris}
          </label>
          <div className="relative">
            <input
              type="number" min="0" step="0.01" value={originalPris}
              onChange={(e) => setOriginalPris(Number(e.target.value))}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
          </div>
        </div>

        {mode === "pris-efter-rabat" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {l.rabatProcent}
            </label>
            <div className="relative">
              <input
                type="number" min="0" max="100" step="0.1" value={rabatProcent}
                onChange={(e) => setRabatProcent(Number(e.target.value))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
            </div>
          </div>
        )}

        {mode === "find-rabat-procent" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              {l.tilbudspris}
            </label>
            <div className="relative">
              <input
                type="number" min="0" step="0.01" value={tilbudspris}
                onChange={(e) => setTilbudspris(Number(e.target.value))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <ResetButton onReset={handleReset} />
        </div>
      </div>

      {resultat && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">{l.resultHeading}</p>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.besparelse}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {fmt(resultat.besparelse)} kr
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400">{l.prisEfter}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {fmt(resultat.prisEfterRabat)} kr
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            {l.besparelse}: {fmt(resultat.besparelseProcent)}%
          </p>

          <div className="flex justify-center mt-4 gap-3">
            <CopyResultButton
              text={`${l.originalPris}: ${fmt(originalPris)} kr · ${l.besparelse}: ${fmt(resultat.besparelse)} kr · ${l.prisEfter}: ${fmt(resultat.prisEfterRabat)} kr`}
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={`${l.besparelse}: ${fmt(resultat.besparelse)} kr (${fmt(resultat.besparelseProcent)}%)`}
            />
          </div>
        </div>
      )}
    </div>
  );
}