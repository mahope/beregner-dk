"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  BETON_EKSEMPEL,
  BETON_ELEMENTER,
  BETON_STANDARD_SPILD_PCT,
  type BetonElementId,
  beregnBeton,
  betonStandardValg,
} from "@/lib/beton";

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

function talFraState(vaerdi: unknown, standardvaerdi: number): number {
  const tal = typeof vaerdi === "number" ? vaerdi : Number(vaerdi);
  return Number.isFinite(tal) ? tal : standardvaerdi;
}

export default function BetonBeregner() {
  const [elementId, setElementId] = useState<BetonElementId>(BETON_EKSEMPEL.elementId);
  const [laengdeM, setLaengdeM] = useState(BETON_EKSEMPEL.laengdeM ?? 0);
  const [breddeM, setBreddeM] = useState(BETON_EKSEMPEL.breddeM ?? 0);
  const [tykkelseCm, setTykkelseCm] = useState(BETON_EKSEMPEL.tykkelseCm ?? 0);
  const [fundamentBreddeCm, setFundamentBreddeCm] = useState(
    BETON_EKSEMPEL.fundamentBreddeCm ?? 0,
  );
  const [fundamentDybdeCm, setFundamentDybdeCm] = useState(BETON_EKSEMPEL.fundamentDybdeCm ?? 0);
  const [antal, setAntal] = useState(BETON_EKSEMPEL.antal ?? 0);
  const [soejleBreddeCm, setSoejleBreddeCm] = useState(BETON_EKSEMPEL.soejleBreddeCm ?? 0);
  const [soejleDybdeCm, setSoejleDybdeCm] = useState(BETON_EKSEMPEL.soejleDybdeCm ?? 0);
  const [soejleHoejdeCm, setSoejleHoejdeCm] = useState(BETON_EKSEMPEL.soejleHoejdeCm ?? 0);
  const [spildPct, setSpildPct] = useState(BETON_STANDARD_SPILD_PCT);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "beton") {
      const i = urlState.inputs;
      if (i.elementId !== undefined) {
        const id = String(i.elementId) as BetonElementId;
        setElementId(id);
        const standard = betonStandardValg(id);
        setLaengdeM(talFraState(i.laengdeM, standard.laengdeM ?? 0));
        setBreddeM(talFraState(i.breddeM, standard.breddeM ?? 0));
        setTykkelseCm(talFraState(i.tykkelseCm, standard.tykkelseCm ?? 0));
        setFundamentBreddeCm(talFraState(i.fundamentBreddeCm, standard.fundamentBreddeCm ?? 0));
        setFundamentDybdeCm(talFraState(i.fundamentDybdeCm, standard.fundamentDybdeCm ?? 0));
        setAntal(talFraState(i.antal, standard.antal ?? 0));
        setSoejleBreddeCm(talFraState(i.soejleBreddeCm, standard.soejleBreddeCm ?? 0));
        setSoejleDybdeCm(talFraState(i.soejleDybdeCm, standard.soejleDybdeCm ?? 0));
        setSoejleHoejdeCm(talFraState(i.soejleHoejdeCm, standard.soejleHoejdeCm ?? 0));
      }
      if (i.spildPct !== undefined) setSpildPct(Number(i.spildPct));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("beton");
    const timer = setTimeout(() => {
      trackCalculation("beton");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const skiftElement = useCallback((id: string) => {
    const nytId = id as BetonElementId;
    setElementId(nytId);
    const standard = betonStandardValg(nytId);
    setLaengdeM(standard.laengdeM ?? 0);
    setBreddeM(standard.breddeM ?? 0);
    setTykkelseCm(standard.tykkelseCm ?? 0);
    setFundamentBreddeCm(standard.fundamentBreddeCm ?? 0);
    setFundamentDybdeCm(standard.fundamentDybdeCm ?? 0);
    setAntal(standard.antal ?? 0);
    setSoejleBreddeCm(standard.soejleBreddeCm ?? 0);
    setSoejleDybdeCm(standard.soejleDybdeCm ?? 0);
    setSoejleHoejdeCm(standard.soejleHoejdeCm ?? 0);
    setSpildPct(BETON_STANDARD_SPILD_PCT);
  }, []);

  const handleReset = useCallback(() => {
    skiftElement(BETON_EKSEMPEL.elementId);
    setSpildPct(BETON_STANDARD_SPILD_PCT);
  }, [skiftElement]);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "beton",
      inputs: {
        elementId,
        laengdeM,
        breddeM,
        tykkelseCm,
        fundamentBreddeCm,
        fundamentDybdeCm,
        antal,
        soejleBreddeCm,
        soejleDybdeCm,
        soejleHoejdeCm,
        spildPct,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [
    elementId,
    laengdeM,
    breddeM,
    tykkelseCm,
    fundamentBreddeCm,
    fundamentDybdeCm,
    antal,
    soejleBreddeCm,
    soejleDybdeCm,
    soejleHoejdeCm,
    spildPct,
  ]);

  const resultat = useMemo(
    () =>
      beregnBeton({
        elementId,
        laengdeM,
        breddeM,
        tykkelseCm,
        fundamentBreddeCm,
        fundamentDybdeCm,
        antal,
        soejleBreddeCm,
        soejleDybdeCm,
        soejleHoejdeCm,
        spildPct,
      }),
    [
      elementId,
      laengdeM,
      breddeM,
      tykkelseCm,
      fundamentBreddeCm,
      fundamentDybdeCm,
      antal,
      soejleBreddeCm,
      soejleDybdeCm,
      soejleHoejdeCm,
      spildPct,
    ],
  );

  const element = resultat.element;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="beton-element" className={labelClass}>
              Hvad skal du støbe?
            </label>
            <select
              id="beton-element"
              value={elementId}
              onChange={(e) => skiftElement(e.target.value)}
              className={inputClass}
            >
              {BETON_ELEMENTER.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.navn}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{element.brug}</p>
          </div>

          {elementId === "plade" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="beton-laengde" className={labelClass}>
                    Længde (m)
                  </label>
                  <input
                    id="beton-laengde"
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
                  <label htmlFor="beton-bredde" className={labelClass}>
                    Bredde (m)
                  </label>
                  <input
                    id="beton-bredde"
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
              <div>
                <label htmlFor="beton-tykkelse" className={labelClass}>
                  Tykkelse (cm)
                </label>
                <input
                  id="beton-tykkelse"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={tykkelseCm}
                  onChange={(e) => setTykkelseCm(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {elementId === "fundament" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="beton-laengde" className={labelClass}>
                    Grunden, længde (m)
                  </label>
                  <input
                    id="beton-laengde"
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
                  <label htmlFor="beton-bredde" className={labelClass}>
                    Grunden, bredde (m)
                  </label>
                  <input
                    id="beton-bredde"
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
                  <label htmlFor="beton-fundamentbredde" className={labelClass}>
                    Fundamentbredde (cm)
                  </label>
                  <input
                    id="beton-fundamentbredde"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={fundamentBreddeCm}
                    onChange={(e) => setFundamentBreddeCm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="beton-fundamentdybde" className={labelClass}>
                    Dybde (cm)
                  </label>
                  <input
                    id="beton-fundamentdybde"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={fundamentDybdeCm}
                    onChange={(e) => setFundamentDybdeCm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {elementId === "soejle" && (
            <>
              <div>
                <label htmlFor="beton-antal" className={labelClass}>
                  Antal søjler
                </label>
                <input
                  id="beton-antal"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={antal}
                  onChange={(e) => setAntal(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="beton-soejle-bredde" className={labelClass}>
                    Bredde (cm)
                  </label>
                  <input
                    id="beton-soejle-bredde"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={soejleBreddeCm}
                    onChange={(e) => setSoejleBreddeCm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="beton-soejle-dybde" className={labelClass}>
                    Dybde (cm)
                  </label>
                  <input
                    id="beton-soejle-dybde"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={soejleDybdeCm}
                    onChange={(e) => setSoejleDybdeCm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="beton-soejle-hoejde" className={labelClass}>
                    Højde (cm)
                  </label>
                  <input
                    id="beton-soejle-hoejde"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    value={soejleHoejdeCm}
                    onChange={(e) => setSoejleHoejdeCm(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="beton-spild" className={labelClass}>
              Spild (%)
            </label>
            <input
              id="beton-spild"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={spildPct}
              onChange={(e) => setSpildPct(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Spild dækker beton, der bliver i karret, i formen og ved kanter — 5–10 % er sædvanligt.
            Regner du på mange ens søjler, læg dem alle ind på én gang.
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
                {fmt(resultat.volumenM3, 2)} m³
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                ca. {fmt(resultat.liter, 0)} liter
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Støbemix à 20 kg</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.poser20kg, 0)} poser
                </div>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">Vægt</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {fmt(resultat.tonMin, 1)}–{fmt(resultat.tonMaks, 1)} t
                </div>
              </div>
            </div>

            {resultat.overBetonbilGraense && (
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Over ca. 1 m³ kan det betale sig at få beton leveret af en bil i stedet for at købe
                poser — færdigbeton i sække er sjældent den billigste løsning der.
              </p>
            )}

            <p className="text-sm text-center text-gray-700 dark:text-gray-300">
              Med {resultat.maal} og {fmt(spildPct, 0)} % spild skal du bruge{" "}
              <strong>{fmt(resultat.volumenM3, 2)} m³</strong> — omkring{" "}
              {fmt(resultat.poser20kg, 0)} poser à 20 kg.
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Volumen er regnet med målene gange hinanden. En 20 kg-pose færdigblandet støbemix
              giver ca. 10 liter beton, og hærdet beton vejer ca. 2,2–2,4 ton pr. m³ — tallene er
              vejledende.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={`${resultat.maal} med ${fmt(spildPct, 0)} % spild = ${fmt(resultat.volumenM3, 2)} m³ (${fmt(resultat.poser20kg, 0)} poser à 20 kg)`}
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Betonberegner"
          resultSummary={`${resultat.maal} = ${fmt(resultat.volumenM3, 2)} m³`}
        />
      </div>
    </div>
  );
}
