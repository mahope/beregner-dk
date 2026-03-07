"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

export default function TimeprisBeregner() {
  const [beregningsType, setBeregningsType] = useState<"fraLoen" | "fraTimepris">("fraLoen");

  // Fra ønsket løn
  const [oensketNettoLoen, setOensketNettoLoen] = useState<number>(35000);
  const [arbejdstimerUge, setArbejdstimerUge] = useState<number>(37);
  const [ferieUger, setFerieUger] = useState<number>(5);
  const [sygdomsBuffer, setSygdomsBuffer] = useState<number>(5);
  const [administrativTid, setAdministrativTid] = useState<number>(20);
  const [transportTid, setTransportTid] = useState<number>(0);
  const [driftsomkostninger, setDriftsomkostninger] = useState<number>(3000);

  // Fra timepris
  const [timepris, setTimepris] = useState<number>(600);
  const [fakturerbareTimer, setFakturerbareTimer] = useState<number>(120);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'timepris') {
      const inputs = urlState.inputs;
      if (inputs.beregningsType) setBeregningsType(inputs.beregningsType);
      if (inputs.oensketNettoLoen !== undefined) setOensketNettoLoen(inputs.oensketNettoLoen);
      if (inputs.arbejdstimerUge !== undefined) setArbejdstimerUge(inputs.arbejdstimerUge);
      if (inputs.ferieUger !== undefined) setFerieUger(inputs.ferieUger);
      if (inputs.sygdomsBuffer !== undefined) setSygdomsBuffer(inputs.sygdomsBuffer);
      if (inputs.administrativTid !== undefined) setAdministrativTid(inputs.administrativTid);
      if (inputs.transportTid !== undefined) setTransportTid(inputs.transportTid);
      if (inputs.driftsomkostninger !== undefined) setDriftsomkostninger(inputs.driftsomkostninger);
      if (inputs.timepris !== undefined) setTimepris(inputs.timepris);
      if (inputs.fakturerbareTimer !== undefined) setFakturerbareTimer(inputs.fakturerbareTimer);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("timepris");
    const timer = setTimeout(() => {
      trackCalculation("timepris");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'timepris',
      inputs: {
        beregningsType, oensketNettoLoen, arbejdstimerUge, ferieUger,
        sygdomsBuffer, administrativTid, transportTid, driftsomkostninger,
        timepris, fakturerbareTimer,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beregningsType, oensketNettoLoen, arbejdstimerUge, ferieUger,
      sygdomsBuffer, administrativTid, transportTid, driftsomkostninger,
      timepris, fakturerbareTimer]);

  const handleReset = useCallback(() => {
    setBeregningsType("fraLoen");
    setOensketNettoLoen(35000);
    setArbejdstimerUge(37);
    setFerieUger(5);
    setSygdomsBuffer(5);
    setAdministrativTid(20);
    setTransportTid(0);
    setDriftsomkostninger(3000);
    setTimepris(600);
    setFakturerbareTimer(120);
  }, []);

  const beregningFraLoen = useMemo(() => {
    const skatProcent = 0.45;
    const oensketBruttoLoen = oensketNettoLoen / (1 - skatProcent);

    const arbejdsugerAar = 52 - ferieUger;
    const effektiveUger = arbejdsugerAar * (1 - sygdomsBuffer / 100);

    const spildtTidPct = administrativTid + transportTid;
    const timerUgeEfterSpild = arbejdstimerUge * (1 - spildtTidPct / 100);
    const fakturerbareTimerAar = effektiveUger * timerUgeEfterSpild;
    const fakturerbareTimerMaaned = fakturerbareTimerAar / 12;

    const aarligLoen = oensketBruttoLoen * 12;
    const aarligeDriftsomkostninger = driftsomkostninger * 12;
    const noedvendigOmsaetning = aarligLoen + aarligeDriftsomkostninger;

    const beregnetTimepris = fakturerbareTimerAar > 0 ? noedvendigOmsaetning / fakturerbareTimerAar : 0;
    const timeprismMoms = beregnetTimepris * 1.25;

    return {
      oensketBruttoLoen,
      effektiveUger,
      fakturerbareTimerAar,
      fakturerbareTimerMaaned,
      aarligLoen,
      aarligeDriftsomkostninger,
      noedvendigOmsaetning,
      beregnetTimepris,
      timeprismMoms,
    };
  }, [oensketNettoLoen, arbejdstimerUge, ferieUger, sygdomsBuffer, administrativTid, transportTid, driftsomkostninger]);

  const beregningFraTimepris = useMemo(() => {
    const maanedligOmsaetning = timepris * fakturerbareTimer;
    const aarligOmsaetning = maanedligOmsaetning * 12;

    const skatProcent = 0.45;
    const bruttoLoenMaaned = maanedligOmsaetning - driftsomkostninger;
    const skatBeloeb = bruttoLoenMaaned * skatProcent;
    const nettoLoenMaaned = bruttoLoenMaaned - skatBeloeb;

    // Breakdown-procenter for visuel bar
    const total = maanedligOmsaetning;
    const driftPct = total > 0 ? (driftsomkostninger / total) * 100 : 0;
    const skatPct = total > 0 ? (skatBeloeb / total) * 100 : 0;
    const nettoPct = total > 0 ? (Math.max(0, nettoLoenMaaned) / total) * 100 : 0;

    return {
      maanedligOmsaetning,
      aarligOmsaetning,
      bruttoLoenMaaned,
      nettoLoenMaaned,
      skatBeloeb,
      driftPct, skatPct, nettoPct,
    };
  }, [timepris, fakturerbareTimer, driftsomkostninger]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Valg af beregningstype */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button
          onClick={() => setBeregningsType("fraLoen")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            beregningsType === "fraLoen"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Find din timepris
        </button>
        <button
          onClick={() => setBeregningsType("fraTimepris")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            beregningsType === "fraTimepris"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Se din indtjening
        </button>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {beregningsType === "fraLoen" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Ønsket nettoløn pr. måned"
                value={oensketNettoLoen}
                onChange={setOensketNettoLoen}
                min={0}
                step={1000}
                unit="kr"
                helpText="Hvad vil du have udbetalt?"
              />
              <InputField
                label="Arbejdstimer pr. uge"
                value={arbejdstimerUge}
                onChange={setArbejdstimerUge}
                min={1}
                max={80}
              />
              <InputField
                label="Ferie (uger pr. år)"
                value={ferieUger}
                onChange={setFerieUger}
                min={0}
                max={12}
              />
            </div>

            <div className="space-y-4">
              <InputField
                label="Buffer for sygdom/stille perioder (%)"
                value={sygdomsBuffer}
                onChange={setSygdomsBuffer}
                min={0}
                max={30}
              />
              <InputField
                label="Administrativ tid (%)"
                value={administrativTid}
                onChange={setAdministrativTid}
                min={0}
                max={50}
                helpText="Salg, mails, bogføring, etc."
              />
              <InputField
                label="Transport/forberedelse (%)"
                value={transportTid}
                onChange={setTransportTid}
                min={0}
                max={30}
                helpText="Tid brugt på transport og forberedelse"
              />
              <InputField
                label="Driftsomkostninger pr. måned"
                value={driftsomkostninger}
                onChange={setDriftsomkostninger}
                min={0}
                step={500}
                unit="kr"
                helpText="Software, kontor, forsikring, etc."
              />
            </div>
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Din anbefalede timepris</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraLoen.beregnetTimepris)}
            </p>
            <p className="text-sm opacity-75 mt-2">
              ekskl. moms ({formatKr(beregningFraLoen.timeprismMoms)} inkl. moms)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {beregningFraLoen.fakturerbareTimerMaaned.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timer/måned</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {beregningFraLoen.fakturerbareTimerAar.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timer/år</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraLoen.noedvendigOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Årlig omsætning</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraLoen.oensketBruttoLoen)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bruttoløn/måned</p>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={`Anbefalet timepris: ${formatKr(beregningFraLoen.beregnetTimepris)} ekskl. moms`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Timeprisberegner"
              resultSummary={`Anbefalet timepris: ${formatKr(beregningFraLoen.beregnetTimepris)} ekskl. moms`}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label="Timepris (ekskl. moms)"
              value={timepris}
              onChange={setTimepris}
              min={0}
              step={50}
              unit="kr"
            />
            <InputField
              label="Fakturerbare timer/måned"
              value={fakturerbareTimer}
              onChange={setFakturerbareTimer}
              min={0}
              max={200}
            />
            <InputField
              label="Driftsomkostninger/måned"
              value={driftsomkostninger}
              onChange={setDriftsomkostninger}
              min={0}
              step={500}
              unit="kr"
            />
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Estimeret nettoløn pr. måned</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraTimepris.nettoLoenMaaned)}
            </p>
            <p className="text-sm opacity-75 mt-2">efter skat</p>
          </div>

          {/* Visuel breakdown */}
          <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Omsætning fordeling</h4>
            <div className="flex h-8 rounded-full overflow-hidden mb-3">
              <div className="bg-green-500" style={{ width: `${beregningFraTimepris.nettoPct}%` }} title="Netto" />
              <div className="bg-red-400" style={{ width: `${beregningFraTimepris.skatPct}%` }} title="Skat" />
              <div className="bg-gray-400" style={{ width: `${beregningFraTimepris.driftPct}%` }} title="Drift" />
            </div>
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Netto ({formatKr(beregningFraTimepris.nettoLoenMaaned)})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Skat ({formatKr(beregningFraTimepris.skatBeloeb)})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-400 inline-block" /> Drift ({formatKr(driftsomkostninger)})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.maanedligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Omsætning/måned</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.bruttoLoenMaaned)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Før skat</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatKr(beregningFraTimepris.skatBeloeb)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Skat (ca. 45%)</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.aarligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Omsætning/år</p>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={`Nettoløn: ${formatKr(beregningFraTimepris.nettoLoenMaaned)}/md ved ${formatKr(timepris)}/time`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Timeprisberegner"
              resultSummary={`Nettoløn: ${formatKr(beregningFraTimepris.nettoLoenMaaned)}/md ved ${formatKr(timepris)}/time`}
            />
          </div>
        </>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Tips til at sætte din timepris</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>Undersøg markedspriser for din branche og kompetencer</li>
          <li>Husk at inkludere buffer for sygdom og stille perioder</li>
          <li>Som freelancer har du ikke betalt ferie, så indregn dette</li>
          <li>Overvej dine driftsomkostninger: software, udstyr, forsikring</li>
          <li>Start ikke for lavt - det er svært at hæve prisen bagefter</li>
        </ul>
      </div>

      {/* Typiske timepriser */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="font-medium dark:text-white">Typiske timepriser i Danmark (2026)</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">IT & Udvikling</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>Junior udvikler: 500-700 kr</li>
                <li>Senior udvikler: 800-1.200 kr</li>
                <li>IT-konsulent: 900-1.500 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">Kreativ & Marketing</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>Grafisk designer: 500-800 kr</li>
                <li>Tekstforfatter: 600-1.000 kr</li>
                <li>Marketing konsulent: 700-1.200 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">Rådgivning</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>Konsulent: 800-1.500 kr</li>
                <li>Advokat: 1.500-3.500 kr</li>
                <li>Revisor: 900-1.800 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">Håndværk & Service</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>Håndværker: 400-600 kr</li>
                <li>Fotograf: 500-1.500 kr</li>
                <li>Underviser: 500-1.000 kr</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Priserne er vejledende og ekskl. moms. Faktiske priser afhænger af erfaring, speciale og geografi.
          </p>
        </div>
      </div>
    </div>
  );
}
