"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

import {
  BYGNINGSDELER,
  ISOLERINGSMATERIALER,
  beregnIsolering,
  materialeVedId,
  bygningsdelVedId,
  BR18_OMBYGNING,
  type BygningsdelId,
} from "@/lib/isolation";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function IsolationsBeregner() {
  const [bygningsdelId, setBygningsdelId] = useState<BygningsdelId>("loft");
  const [materialeId, setMaterialeId] = useState(ISOLERINGSMATERIALER[0].id);
  const [arealM2, setArealM2] = useState(100);
  const [uVaerdi, setUVaerdi] = useState(0);

  useEffect(() => {
    const cleanupScroll = initScrollDepthTracking("isolation");
    const timer = setTimeout(() => trackCalculation("isolation"), 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const del = bygningsdelVedId(bygningsdelId);

  const skiftDel = useCallback((id: string) => {
    setBygningsdelId(id as BygningsdelId);
    setUVaerdi(0);
  }, []);

  const handleReset = useCallback(() => {
    setBygningsdelId("loft");
    setMaterialeId(ISOLERINGSMATERIALER[0].id);
    setArealM2(100);
    setUVaerdi(0);
  }, []);

  const resultat = useMemo(
    () =>
      beregnIsolering({
        bygningsdelId,
        materialeId,
        arealM2,
        uVaerdi: uVaerdi > 0 ? uVaerdi : null,
      }),
    [bygningsdelId, materialeId, arealM2, uVaerdi],
  );

  const materiale = materialeVedId(materialeId);

  // Resume-strengen skal kunne kopieres ud og gives til entreprenøren.
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "isolation",
      inputs: { bygningsdelId, materialeId, arealM2, uVaerdi },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bygningsdelId, materialeId, arealM2, uVaerdi]);

  const resume = `${fmt(resultat.tykkelseCm, 1)} cm ${materiale.navn} på ${fmt(resultat.arealM2, 0)} m² ${del.navn.toLowerCase()} til U ≤ ${fmt(resultat.uVaerdi, 2)} W/m²K`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="isolation-bygningsdel" className={labelClass}>
              Hvad skal du isolere?
            </label>
            <select
              id="isolation-bygningsdel"
              value={bygningsdelId}
              onChange={(e) => skiftDel(e.target.value)}
              className={inputClass}
            >
              {BYGNINGSDELER.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.navn}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{del.brug}</p>
          </div>

          <div>
            <label htmlFor="isolation-materiale" className={labelClass}>
              Isoleringsmateriale
            </label>
            <select
              id="isolation-materiale"
              value={materialeId}
              onChange={(e) => setMaterialeId(e.target.value)}
              className={inputClass}
            >
              {ISOLERINGSMATERIALER.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.navn} (λ {fmt(m.lambda, 3)})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{materiale.brug}</p>
          </div>

          <div>
            <label htmlFor="isolation-areal" className={labelClass}>
              Areal (m²)
            </label>
            <input
              id="isolation-areal"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={arealM2}
              onChange={(e) => setArealM2(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="isolation-u" className={labelClass}>
              Ønsket U-værdi (W/m²K)
            </label>
            <input
              id="isolation-u"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={uVaerdi}
              onChange={(e) => setUVaerdi(Number(e.target.value))}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lad feltet stå på 0 for at bruge bygningsreglementets krav på{" "}
              {fmt(del.brKrav, 2)} W/m²K for {del.navn.toLowerCase()}. Skal du blot
              efterisolere, skal det være {fmt(BR18_OMBYGNING[del.id], 2)} — har du
              plads, giver det en lavere varmeregning.
            </p>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Du skal bruge
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {fmt(resultat.tykkelseCm, 1)} cm
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                {materiale.navn}, λ {fmt(materiale.lambda, 3)} W/(m·K)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">U-værdi</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.uVaerdi, 2)} W/m²K
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Isoleringens R</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.rIsolering, 2)} m²K/W
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Materiale</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.volumenM3, 2)} m³
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Varmetab pr. grad</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.varmetabPrGrad, 1)} W
                </div>
              </div>
            </div>

            {resultat.umuligt ? (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Luften alene holder den U-værdi — her behøves ingen isolering. Sæt
                U-værdien til under 1 W/m²K for at regne på isolering.
              </p>
            ) : (
              <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                {materiale.navn} skal ligge {fmt(resultat.tykkelseCm, 1)} cm på{" "}
                {fmt(resultat.arealM2, 0)} m² for at nå {fmt(resultat.uVaerdi, 2)} W/m²K
                — det er {fmt(resultat.volumenM3, 2)} m³ materiale.
              </p>
            )}

            {resultat.lossereEndOmbygning && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fmt(resultat.uVaerdi, 2)} er bygningsreglementets krav til nyt byggeri.
                Ved ombygning er kravet {fmt(BR18_OMBYGNING[del.id], 2)} W/m²K.
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Regnestykket er U = 1 / (Rsi + d/λ + Rse): luftlagene tager{" "}
              {fmt(resultat.luftlagM2KW, 2)} m²K/W, og resten skal isoleringen dække.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={resume} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Isolationsberegner"
          resultSummary={resume}
        />
      </div>
    </div>
  );
}
