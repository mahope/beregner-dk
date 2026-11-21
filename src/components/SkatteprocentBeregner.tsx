"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Landmark } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { beregnSkat } from "@/lib/skattefordeling";
import { KOMMUNER, KOMMUNER_SNIT } from "@/lib/kommuner";
const fmt = (n: number) => Math.round(n).toLocaleString("da-DK");
const fmtPct = (n: number) =>
  n.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface KommuneRække {
  navn: string;
  kommuneskat: number;
  kirkeskat: number;
  total: number;
  skat: number;
}

export default function SkatteprocentBeregner() {
  const [kommune, setKommune] = useState<string>("København");
  const [indkomst, setIndkomst] = useState<string>("500000");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "skatteprocent") {
      const i = urlState.inputs;
      if (i.kommune !== undefined) setKommune(String(i.kommune));
      if (i.indkomst !== undefined) setIndkomst(String(i.indkomst));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("skatteprocent");
    const timer = setTimeout(() => {
      trackCalculation("skatteprocent");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setKommune("København");
    setIndkomst("500000");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "skatteprocent",
      inputs: { kommune, indkomst },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [kommune, indkomst]);

  const valgt = KOMMUNER.find((k) => k.navn === kommune) ?? KOMMUNER[0];
  const komPct = valgt.kommuneskat / 100;
  const kirPct = valgt.kirkeskat / 100;

  const resultat = useMemo(() => {
    const tal = parseFloat(indkomst) || 0;
    if (tal <= 0) return null;
    return beregnSkat(tal, komPct, kirPct);
  }, [indkomst, komPct, kirPct]);

  const tabel = useMemo<KommuneRække[]>(() => {
    const tal = parseFloat(indkomst) || 0;
    return KOMMUNER.map((k) => {
      const skat = beregnSkat(tal, k.kommuneskat / 100, k.kirkeskat / 100);
      return {
        navn: k.navn,
        kommuneskat: k.kommuneskat,
        kirkeskat: k.kirkeskat,
        total: k.kommuneskat + k.kirkeskat,
        skat: skat ? skat.samletSkat : 0,
      };
    }).sort((a, b) => a.total - b.total);
  }, [indkomst]);

  const laveste = tabel[0];
  const hoejeste = tabel[tabel.length - 1];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="skatteprocent-kommune"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Din kommune
              </label>
              <select
                id="skatteprocent-kommune"
                value={kommune}
                onChange={(e) => setKommune(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {KOMMUNER.map((k) => (
                  <option key={k.navn} value={k.navn}>
                    {k.navn} — {fmtPct(k.kommuneskat)} %
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Kommuneskat {fmtPct(valgt.kommuneskat)} % + kirkeskat {fmtPct(valgt.kirkeskat)} %
              </p>
            </div>
            <div>
              <label
                htmlFor="skatteprocent-indkomst"
                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
              >
                Din årlige bruttoløn
              </label>
              <div className="relative">
                <input
                  id="skatteprocent-indkomst"
                  type="number"
                  value={indkomst}
                  onChange={(e) => setIndkomst(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
              </div>
            </div>
            <div className="flex gap-2">
              <CopyResultButton
                text={
                  resultat
                    ? `Skat: ${fmt(resultat.samletSkat)} kr./år i ${valgt.navn} (effektiv ${fmtPct(resultat.effektivSkat)} % af ${fmt(resultat.bruttoAar)} kr.)`
                    : ""
                }
              />
              <ResetButton onReset={handleReset} />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5">
            {resultat ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Landmark className="w-5 h-5" />
                  <span className="font-medium">Din skat i {valgt.navn}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.samletSkat)} kr.
                  <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-2">
                    i skat pr. år
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Effektiv skattesats: <strong>{fmtPct(resultat.effektivSkat)} %</strong> — for hver
                  100 kr. tjener du, betaler du {fmt(resultat.samletSkat / (resultat.bruttoAar / 100))} kr. i skat.
                </p>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">AM-bidrag (8 %)</span>
                    <span className="font-medium">{fmt(resultat.amBidrag)} kr.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Bundskat (12,01 %)</span>
                    <span className="font-medium">{fmt(resultat.bundSkat)} kr.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Kommuneskat ({fmtPct(valgt.kommuneskat)} %)
                    </span>
                    <span className="font-medium">{fmt(resultat.kommuneSkat)} kr.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Kirkeskat ({fmtPct(valgt.kirkeskat)} %)
                    </span>
                    <span className="font-medium">{fmt(resultat.kirkeSkat)} kr.</span>
                  </div>
                  {resultat.mellemSkat > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Mellemskat (7,5 %)</span>
                      <span className="font-medium">{fmt(resultat.mellemSkat)} kr.</span>
                    </div>
                  )}
                  {resultat.topSkat > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Topskat (7,5 %)</span>
                      <span className="font-medium">{fmt(resultat.topSkat)} kr.</span>
                    </div>
                  )}
                  {resultat.topTopSkat > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Top-topskat (5 %)</span>
                      <span className="font-medium">{fmt(resultat.topTopSkat)} kr.</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Netto om året</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {fmt(resultat.nettoAar)} kr.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Indtast din bruttoløn for at se skatteopgørelsen.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">
          Skatteprocent i alle {KOMMUNER.length} kommuner
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Kommuneskat + kirkeskat for en bruttoløn på {fmt(parseFloat(indkomst) || 0)} kr. — sorteret
          efter laveste samlet sats. Danmarks gennemsnit er {fmtPct(KOMMUNER_SNIT)} % i kommuneskat.
        </p>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-gray-800">
              <tr className="border-b border-gray-200 dark:border-gray-600 text-left">
                <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-300">Kommune</th>
                <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-300 text-right">Kommuneskat</th>
                <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-300 text-right">Kirkeskat</th>
                <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-300 text-right">I alt</th>
                <th className="py-2 font-medium text-gray-600 dark:text-gray-300 text-right">Skat pr. år</th>
              </tr>
            </thead>
            <tbody>
              {tabel.map((r) => (
                <tr
                  key={r.navn}
                  className={`border-b border-gray-100 dark:border-gray-700 ${
                    r.navn === kommune ? "bg-blue-50 dark:bg-blue-900/20 font-medium" : ""
                  }`}
                >
                  <td className="py-1.5 pr-4">{r.navn}</td>
                  <td className="py-1.5 pr-4 text-right">{fmtPct(r.kommuneskat)} %</td>
                  <td className="py-1.5 pr-4 text-right">{fmtPct(r.kirkeskat)} %</td>
                  <td className="py-1.5 pr-4 text-right">{fmtPct(r.total)} %</td>
                  <td className="py-1.5 text-right">{fmt(r.skat)} kr.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Laveste: {laveste.navn} ({fmtPct(laveste.total)} %) · Højeste: {hoejeste.navn} (
          {fmtPct(hoejeste.total)} %)
        </p>
      </div>

      <ShareCalculation getShareableLink={getShareableLink} calculatorName="Skatteprocent" />
    </div>
  );
}
