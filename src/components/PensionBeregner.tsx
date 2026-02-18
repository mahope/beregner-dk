"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

interface AarData {
  aar: number;
  alder: number;
  saldo: number;
  indskud: number;
  afkast: number;
}

export default function PensionBeregner() {
  const [alder, setAlder] = useState<number>(30);
  const [pensionsalder, setPensionsalder] = useState<number>(68);
  const [maanedligIndbetaling, setMaanedligIndbetaling] = useState<number>(3000);
  const [nuværendeOpsparing, setNuværendeOpsparing] = useState<number>(200000);
  const [forventetAfkast, setForventetAfkast] = useState<number>(5);
  const [inflation, setInflation] = useState<number>(2);
  const [udbetalingsperiode, setUdbetalingsperiode] = useState<number>(20);
  const [oensketMaanedlig, setOensketMaanedlig] = useState<number>(25000);

  const isLoading = useCalculationLoading([
    alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing,
    forventetAfkast, inflation, udbetalingsperiode, oensketMaanedlig,
  ]);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'pension') {
      const inputs = urlState.inputs;
      if (inputs.alder !== undefined) setAlder(inputs.alder);
      if (inputs.pensionsalder !== undefined) setPensionsalder(inputs.pensionsalder);
      if (inputs.maanedligIndbetaling !== undefined) setMaanedligIndbetaling(inputs.maanedligIndbetaling);
      if (inputs.nuværendeOpsparing !== undefined) setNuværendeOpsparing(inputs.nuværendeOpsparing);
      if (inputs.forventetAfkast !== undefined) setForventetAfkast(inputs.forventetAfkast);
      if (inputs.inflation !== undefined) setInflation(inputs.inflation);
      if (inputs.udbetalingsperiode !== undefined) setUdbetalingsperiode(inputs.udbetalingsperiode);
      if (inputs.oensketMaanedlig !== undefined) setOensketMaanedlig(inputs.oensketMaanedlig);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("pension");
    const timer = setTimeout(() => {
      trackCalculation("pension");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'pension',
      inputs: {
        alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing,
        forventetAfkast, inflation, udbetalingsperiode, oensketMaanedlig,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing,
      forventetAfkast, inflation, udbetalingsperiode, oensketMaanedlig]);

  const resultat = useMemo(() => {
    const aarTilPension = pensionsalder - alder;
    if (aarTilPension <= 0) return null;

    const realAfkast = (1 + forventetAfkast / 100) / (1 + inflation / 100) - 1;
    const maanedligRealAfkast = realAfkast / 12;
    const antalMaaneder = aarTilPension * 12;

    // Fremtidig værdi
    const fvNuvaerende = nuværendeOpsparing * Math.pow(1 + realAfkast, aarTilPension);
    let fvIndbetalinger: number;
    if (maanedligRealAfkast === 0) {
      fvIndbetalinger = maanedligIndbetaling * antalMaaneder;
    } else {
      fvIndbetalinger = maanedligIndbetaling *
        ((Math.pow(1 + maanedligRealAfkast, antalMaaneder) - 1) / maanedligRealAfkast);
    }

    const samletOpsparing = fvNuvaerende + fvIndbetalinger;

    // Månedlig udbetaling
    const udbetalingsMaaneder = udbetalingsperiode * 12;
    let maanedligUdbetaling: number;
    if (maanedligRealAfkast === 0) {
      maanedligUdbetaling = samletOpsparing / udbetalingsMaaneder;
    } else {
      maanedligUdbetaling = samletOpsparing *
        (maanedligRealAfkast * Math.pow(1 + maanedligRealAfkast, udbetalingsMaaneder)) /
        (Math.pow(1 + maanedligRealAfkast, udbetalingsMaaneder) - 1);
    }

    const samletIndbetalt = nuværendeOpsparing + (maanedligIndbetaling * antalMaaneder);
    const samletAfkast = samletOpsparing - samletIndbetalt;

    // Ekstra ved +500 kr/md
    const ekstraPr500 = maanedligRealAfkast === 0
      ? 500 * antalMaaneder
      : 500 * ((Math.pow(1 + maanedligRealAfkast, antalMaaneder) - 1) / maanedligRealAfkast);

    // Folkepension (2026 satser)
    const folkepensionGrundbeloeb = 7544;
    const folkepensionTillaeg = 8729;
    const anslaaetFolkepension = folkepensionGrundbeloeb + Math.round(folkepensionTillaeg * 0.7);

    // Tre søjler
    const soejle1 = anslaaetFolkepension; // folkepension
    const soejle2 = Math.round(maanedligUdbetaling * 0.7); // arbejdsmarkedspension (estimeret ~70%)
    const soejle3 = Math.round(maanedligUdbetaling * 0.3); // privat (estimeret ~30%)
    const samletMaanedlig = soejle1 + soejle2 + soejle3;

    // Pension gap
    const gap = oensketMaanedlig - samletMaanedlig;

    // Årlig udvikling til graf
    const aarligData: AarData[] = [];
    let saldo = nuværendeOpsparing;
    let totalIndskud = nuværendeOpsparing;
    let totalAfkast = 0;

    for (let m = 1; m <= antalMaaneder; m++) {
      saldo += maanedligIndbetaling;
      totalIndskud += maanedligIndbetaling;
      const afk = saldo * maanedligRealAfkast;
      saldo += afk;
      totalAfkast += afk;

      if (m % 12 === 0) {
        aarligData.push({
          aar: m / 12,
          alder: alder + m / 12,
          saldo,
          indskud: totalIndskud,
          afkast: totalAfkast,
        });
      }
    }

    return {
      aarTilPension,
      samletOpsparing: Math.round(samletOpsparing),
      maanedligUdbetaling: Math.round(maanedligUdbetaling),
      samletIndbetalt: Math.round(samletIndbetalt),
      samletAfkast: Math.round(samletAfkast),
      ekstraPr500: Math.round(ekstraPr500),
      folkepension: anslaaetFolkepension,
      soejle1, soejle2, soejle3,
      samletMaanedlig,
      gap,
      aarligData,
    };
  }, [alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing, forventetAfkast, inflation, udbetalingsperiode, oensketMaanedlig]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            label="Din alder"
            value={alder}
            onChange={setAlder}
            min={18}
            max={70}
          />
          <InputField
            label="Ønsket pensionsalder"
            value={pensionsalder}
            onChange={setPensionsalder}
            min={alder + 1}
            max={80}
            helpText="Folkepensionsalder er 68 år (stigende)"
          />
          <InputField
            label="Nuværende pensionsopsparing"
            value={nuværendeOpsparing}
            onChange={setNuværendeOpsparing}
            min={0}
            max={50000000}
            step={10000}
            unit="kr"
          />
          <InputField
            label="Månedlig indbetaling"
            value={maanedligIndbetaling}
            onChange={setMaanedligIndbetaling}
            min={0}
            max={100000}
            step={500}
            unit="kr"
            helpText="Inkl. arbejdsgiverbidrag (ofte 12-17% af løn)"
          />
        </div>

        <div className="space-y-4">
          <InputField
            label="Forventet årligt afkast (%)"
            value={forventetAfkast}
            onChange={setForventetAfkast}
            min={0}
            max={15}
            step={0.5}
            helpText="Historisk gennemsnit: 5-7% (aktier), 2-4% (obligationer)"
          />
          <InputField
            label="Forventet inflation (%)"
            value={inflation}
            onChange={setInflation}
            min={0}
            max={10}
            step={0.5}
            helpText="Historisk gennemsnit: ca. 2%"
          />
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Udbetalingsperiode (år)</label>
            <select
              value={udbetalingsperiode}
              onChange={(e) => setUdbetalingsperiode(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
            >
              <option value="10">10 år</option>
              <option value="15">15 år</option>
              <option value="20">20 år</option>
              <option value="25">25 år</option>
              <option value="30">Livsvarig (ca. 30 år)</option>
            </select>
          </div>
          <InputField
            label="Ønsket månedlig pension"
            value={oensketMaanedlig}
            onChange={setOensketMaanedlig}
            min={0}
            max={200000}
            step={1000}
            unit="kr"
            helpText="Til beregning af pension gap"
          />
        </div>
      </div>

      {/* Resultat */}
      <CalculationLoading
        isLoading={isLoading}
        loadingText="Beregner din pension..."
        minHeight="300px"
      >
        {resultat && (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Forventet månedlig pension</p>
              <p className="text-5xl font-bold text-green-600 dark:text-green-400">
                {formatKr(resultat.samletMaanedlig)}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                (i dagens kroner - {resultat.aarTilPension} år til pension)
              </p>
            </div>

            {/* Tre søjler visualisering */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 dark:text-gray-200">De tre pensionssøjler</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="relative mx-auto w-16 bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: "120px" }}>
                    <div
                      className="absolute bottom-0 w-full bg-purple-500 dark:bg-purple-400 rounded-t-lg transition-all"
                      style={{ height: `${resultat.samletMaanedlig > 0 ? (resultat.soejle1 / resultat.samletMaanedlig) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 dark:text-gray-200">Folkepension</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatKr(resultat.soejle1)}</p>
                </div>
                <div className="text-center">
                  <div className="relative mx-auto w-16 bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: "120px" }}>
                    <div
                      className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-400 rounded-t-lg transition-all"
                      style={{ height: `${resultat.samletMaanedlig > 0 ? (resultat.soejle2 / resultat.samletMaanedlig) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 dark:text-gray-200">Arbejdsmarked</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatKr(resultat.soejle2)}</p>
                </div>
                <div className="text-center">
                  <div className="relative mx-auto w-16 bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden" style={{ height: "120px" }}>
                    <div
                      className="absolute bottom-0 w-full bg-green-500 dark:bg-green-400 rounded-t-lg transition-all"
                      style={{ height: `${resultat.samletMaanedlig > 0 ? (resultat.soejle3 / resultat.samletMaanedlig) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs font-medium mt-2 dark:text-gray-200">Privat</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatKr(resultat.soejle3)}</p>
                </div>
              </div>
            </div>

            {/* Pension gap */}
            {resultat.gap !== 0 && (
              <div className={`mb-6 p-4 rounded-lg text-center ${
                resultat.gap > 0
                  ? "bg-red-50 dark:bg-red-900/20"
                  : "bg-green-50 dark:bg-green-900/20"
              }`}>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {resultat.gap > 0 ? "Pension gap (mangler pr. måned)" : "Overskud ift. dit mål"}
                </p>
                <p className={`text-2xl font-bold ${resultat.gap > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                  {resultat.gap > 0 ? `-${formatKr(resultat.gap)}` : `+${formatKr(Math.abs(resultat.gap))}`}
                </p>
                {resultat.gap > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Du skal spare ca. {formatKr(Math.round(resultat.gap * 1.5))} ekstra pr. måned for at lukke gabet
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ved pension</p>
                <p className="font-bold text-lg dark:text-white">{formatKr(resultat.samletOpsparing)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Indbetalt</p>
                <p className="font-bold text-lg dark:text-white">{formatKr(resultat.samletIndbetalt)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Afkast</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatKr(resultat.samletAfkast)}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">År til pension</p>
                <p className="font-bold text-lg dark:text-white">{resultat.aarTilPension}</p>
              </div>
            </div>

            {/* Pensionsformue graf */}
            {resultat.aarligData.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Pensionsformue over tid</h4>
                <div className="flex items-end gap-1 h-36">
                  {resultat.aarligData
                    .filter((_, i) => i % Math.max(1, Math.floor(resultat.aarligData.length / 15)) === 0 || i === resultat.aarligData.length - 1)
                    .map((d) => {
                      const maxSaldo = resultat.aarligData[resultat.aarligData.length - 1].saldo;
                      const totalH = maxSaldo > 0 ? (d.saldo / maxSaldo) * 100 : 0;
                      const indskudH = maxSaldo > 0 ? (d.indskud / maxSaldo) * 100 : 0;
                      const afkastH = totalH - indskudH;
                      return (
                        <div key={d.aar} className="flex-1 flex flex-col justify-end items-center" title={`${d.alder} år`}>
                          <div className="w-full flex flex-col justify-end" style={{ height: "144px" }}>
                            <div className="bg-green-400 dark:bg-green-500 rounded-t-sm w-full" style={{ height: `${afkastH}%` }} />
                            <div className="bg-blue-400 dark:bg-blue-500 w-full" style={{ height: `${indskudH}%` }} />
                          </div>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{d.alder}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" /> Indskud
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" /> Afkast
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CalculationLoading>

      {/* Del beregning */}
      {resultat && !isLoading && (
        <div className="flex justify-center gap-3">
          <CopyResultButton text={`Forventet pension: ${formatKr(resultat.samletMaanedlig)}/md`} />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Pensionsberegner"
            resultSummary={`Forventet pension: ${formatKr(resultat.samletMaanedlig)}/md`}
          />
        </div>
      )}

      {/* Ekstra info */}
      {resultat && !isLoading && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h3 className="font-medium mb-2 text-green-800 dark:text-green-300">Vidste du?</h3>
          <p className="text-green-700 dark:text-green-400">
            Hvis du øger din månedlige indbetaling med <strong>500 kr</strong>,
            vil din opsparing vokse med yderligere <strong>{formatKr(resultat.ekstraPr500)}</strong> til pension.
          </p>
        </div>
      )}

      {/* Aldersbaseret anbefaling */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-blue-800 dark:text-blue-200">Tommelfingerregel: Opsparing efter alder</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">30 år</span>
            <p className="dark:text-gray-300">1x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">40 år</span>
            <p className="dark:text-gray-300">3x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">50 år</span>
            <p className="dark:text-gray-300">6x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">60 år</span>
            <p className="dark:text-gray-300">8x årsløn opsparet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
