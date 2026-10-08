"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  GRUS_MATERIALER,
  GRUS_STANDARD_BREDDE_M,
  GRUS_STANDARD_LAENGDE_M,
  GRUS_STANDARD_SPILD_PCT,
  beregnGrus,
  grusMaterialeVedId,
} from "@/lib/sand-og-grus";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function SandOgGrusBeregner() {
  const [laengdeM, setLaengdeM] = useState(GRUS_STANDARD_LAENGDE_M);
  const [breddeM, setBreddeM] = useState(GRUS_STANDARD_BREDDE_M);
  const [materialeId, setMaterialeId] = useState(GRUS_MATERIALER[0].id);
  const [lagCm, setLagCm] = useState(GRUS_MATERIALER[0].lagCmStandard);
  const [spildPct, setSpildPct] = useState(GRUS_STANDARD_SPILD_PCT);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "sand-og-grus") {
      const i = urlState.inputs;
      if (i.laengdeM !== undefined) setLaengdeM(Number(i.laengdeM));
      if (i.breddeM !== undefined) setBreddeM(Number(i.breddeM));
      if (i.materialeId !== undefined) setMaterialeId(String(i.materialeId));
      if (i.lagCm !== undefined) setLagCm(Number(i.lagCm));
      if (i.spildPct !== undefined) setSpildPct(Number(i.spildPct));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("sand-og-grus");
    const timer = setTimeout(() => {
      trackCalculation("sand-og-grus");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setLaengdeM(GRUS_STANDARD_LAENGDE_M);
    setBreddeM(GRUS_STANDARD_BREDDE_M);
    setMaterialeId(GRUS_MATERIALER[0].id);
    setLagCm(GRUS_MATERIALER[0].lagCmStandard);
    setSpildPct(GRUS_STANDARD_SPILD_PCT);
  }, []);

  const handleMateriale = useCallback((id: string) => {
    setMaterialeId(id);
    setLagCm(grusMaterialeVedId(id).lagCmStandard);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "sand-og-grus",
      inputs: { laengdeM, breddeM, materialeId, lagCm, spildPct },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laengdeM, breddeM, materialeId, lagCm, spildPct]);

  const resultat = useMemo(
    () => beregnGrus({ laengdeM, breddeM, materialeId, lagCm, spildPct }),
    [laengdeM, breddeM, materialeId, lagCm, spildPct],
  );

  const materiale = resultat.materiale;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="grus-materiale" className={labelClass}>
              Materiale
            </label>
            <select
              id="grus-materiale"
              value={materialeId}
              onChange={(e) => handleMateriale(e.target.value)}
              className={inputClass}
            >
              {GRUS_MATERIALER.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.navn}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{materiale.brug}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="grus-laengde" className={labelClass}>
                Længde (m)
              </label>
              <input
                id="grus-laengde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={laengdeM}
                onChange={(e) => setLaengdeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="grus-bredde" className={labelClass}>
                Bredde (m)
              </label>
              <input
                id="grus-bredde"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={breddeM}
                onChange={(e) => setBreddeM(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="grus-lag" className={labelClass}>
                Lagtykkelse (cm)
              </label>
              <input
                id="grus-lag"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={lagCm}
                onChange={(e) => setLagCm(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="grus-spild" className={labelClass}>
                Spild (%)
              </label>
              <input
                id="grus-spild"
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                value={spildPct}
                onChange={(e) => setSpildPct(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {materiale.navn} lægges typisk i {materiale.lagCmMin}–{materiale.lagCmMax} cm. Spild
            dækker ujævnheder og tilpasning — leverandørerne anbefaler 5–10 % ekstra.
          </p>

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
                {fmt(resultat.volumenMedSpildM3, 2)} m³
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                ca. {fmt(resultat.tonMedSpild, 1)} ton
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Areal</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.arealM2, 1)} m²
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Volumen</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.literMedSpild, 0)} liter
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              {fmt(resultat.arealM2, 1)} m² med {fmt(lagCm, 0)} cm {materiale.navn.toLowerCase()} og{" "}
              {fmt(spildPct, 0)} % spild giver{" "}
              <strong>{fmt(resultat.volumenMedSpildM3, 2)} m³</strong> — omkring{" "}
              {fmt(resultat.tonMedSpild, 1)} ton.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Volumen er areal gange lagtykkelse. Vægten er regnet med{" "}
              {fmt(materiale.densitetTPerM3, 1)} ton pr. m³, som er en vejledende værdi — den
              faktiske vægt afhænger af materialets fugtindhold.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${fmt(resultat.arealM2, 1)} m² med ${fmt(lagCm, 0)} cm ${materiale.navn.toLowerCase()} = ${fmt(resultat.volumenMedSpildM3, 2)} m³ (${fmt(resultat.tonMedSpild, 1)} ton)`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Sand- og grusberegner"
          resultSummary={`${fmt(resultat.arealM2, 1)} m² = ${fmt(resultat.volumenMedSpildM3, 2)} m³`}
        />
      </div>
    </div>
  );
}
