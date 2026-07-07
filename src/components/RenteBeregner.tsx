"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency, getCurrencySuffix } from '@/lib/format';

type BeregningsType = "annuitet" | "serielaan";

export default function RenteBeregner() {
  const { locale } = useLocale();
  const [hovedstol, setHovedstol] = useState<number>(1000000);
  const [rente, setRente] = useState<number>(5);
  const [loebetid, setLoebetid] = useState<number>(30);
  const [type, setType] = useState<BeregningsType>("annuitet");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'rente') {
      const inputs = urlState.inputs;
      if (inputs.hovedstol !== undefined) setHovedstol(inputs.hovedstol);
      if (inputs.rente !== undefined) setRente(inputs.rente);
      if (inputs.loebetid !== undefined) setLoebetid(inputs.loebetid);
      if (inputs.type) setType(inputs.type);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("renteberegner");
    const timer = setTimeout(() => {
      trackCalculation("renteberegner");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setHovedstol(1000000);
    setRente(5);
    setLoebetid(30);
    setType("annuitet");
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'rente',
      inputs: { hovedstol, rente, loebetid, type },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [hovedstol, rente, loebetid, type]);

  const beregning = useMemo(() => {
    if (!hovedstol || !rente || !loebetid) {
      return null;
    }

    const maanedligRente = rente / 100 / 12;
    const antalTerminer = loebetid * 12;

    if (type === "annuitet") {
      // Annuitetslån: fast ydelse, faldende rente, stigende afdrag
      const maanedligYdelse =
        (hovedstol * maanedligRente * Math.pow(1 + maanedligRente, antalTerminer)) /
        (Math.pow(1 + maanedligRente, antalTerminer) - 1);

      const samletBetaling = maanedligYdelse * antalTerminer;
      const samletRente = samletBetaling - hovedstol;

      // Beregn første og sidste års data
      let restgaeld = hovedstol;
      let foersteAarRente = 0;
      let foersteAarAfdrag = 0;

      for (let m = 0; m < 12; m++) {
        const maanedensRente = restgaeld * maanedligRente;
        const maanedensAfdrag = maanedligYdelse - maanedensRente;
        foersteAarRente += maanedensRente;
        foersteAarAfdrag += maanedensAfdrag;
        restgaeld -= maanedensAfdrag;
      }

      return {
        maanedligYdelse,
        aarligYdelse: maanedligYdelse * 12,
        samletBetaling,
        samletRente,
        foersteAarRente,
        foersteAarAfdrag,
        type: "annuitet" as const,
      };
    } else {
      // Serielån: fast afdrag, faldende rente, faldende ydelse
      const maanedligtAfdrag = hovedstol / antalTerminer;

      // Første måneds beregning
      const foersteMaanedsRente = hovedstol * maanedligRente;
      const foersteMaanedsYdelse = maanedligtAfdrag + foersteMaanedsRente;

      // Sidste måneds beregning
      const sidsteMaanedsRente = maanedligtAfdrag * maanedligRente;
      const sidsteMaanedsYdelse = maanedligtAfdrag + sidsteMaanedsRente;

      // Samlet rente for serielån
      const samletRente = (antalTerminer + 1) / 2 * maanedligtAfdrag * maanedligRente * antalTerminer;
      // Forenklet: sum af renter = (n+1)/2 * første rente (aritmetisk række)
      const praecisRente = ((antalTerminer + 1) * foersteMaanedsRente) / 2;
      const samletBetaling = hovedstol + praecisRente;

      // Første års data
      let restgaeld = hovedstol;
      let foersteAarRente = 0;
      for (let m = 0; m < 12; m++) {
        foersteAarRente += restgaeld * maanedligRente;
        restgaeld -= maanedligtAfdrag;
      }

      return {
        foersteMaanedsYdelse,
        sidsteMaanedsYdelse,
        maanedligtAfdrag,
        aarligtAfdrag: maanedligtAfdrag * 12,
        samletBetaling,
        samletRente: praecisRente,
        foersteAarRente,
        foersteAarAfdrag: maanedligtAfdrag * 12,
        type: "serielaan" as const,
      };
    }
  }, [hovedstol, rente, loebetid, type]);

  const formatKr = (beloeb: number) => formatCurrency(beloeb, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="laaneBeloeb" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Lånebeløb (hovedstol)
            </label>
            <div className="relative">
              <input
                id="laaneBeloeb"
                type="number"
                min="0"
                step="10000"
                value={hovedstol}
                onChange={(e) => setHovedstol(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="aarligRente" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Årlig rente (%)
            </label>
            <div className="relative">
              <input
                id="aarligRente"
                type="number"
                min="0"
                max="30"
                step="0.1"
                value={rente}
                onChange={(e) => setRente(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="loebetid" className="block text-sm font-medium mb-2 dark:text-gray-200">
              Løbetid (år)
            </label>
            <div className="relative">
              <input
                id="loebetid"
                type="number"
                min="1"
                max="50"
                value={loebetid}
                onChange={(e) => setLoebetid(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">år</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Låntype</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setType("annuitet")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  type === "annuitet"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
                }`}
              >
                Annuitetslån
              </button>
              <button
                type="button"
                onClick={() => setType("serielaan")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  type === "serielaan"
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
                }`}
              >
                Serielån
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      {beregning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beregning.type === "annuitet" ? (
              <>
                <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">Månedlig ydelse</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatKr(beregning.maanedligYdelse)}
                  </p>
                </div>
                <div className="p-6 bg-blue-50 rounded-xl text-center dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">Årlig ydelse</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatKr(beregning.aarligYdelse)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    Første måneds ydelse
                  </p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {formatKr(beregning.foersteMaanedsYdelse)}
                  </p>
                </div>
                <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    Sidste måneds ydelse
                  </p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {formatKr(beregning.sidsteMaanedsYdelse)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center dark:bg-gray-800">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">Lånebeløb</p>
              <p className="text-xl font-bold dark:text-white">{formatKr(hovedstol)}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center dark:bg-red-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">Samlet rente</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatKr(beregning.samletRente)}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center dark:bg-yellow-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                Samlet tilbagebetaling
              </p>
              <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                {formatKr(beregning.samletBetaling)}
              </p>
            </div>
          </div>

          {/* Første år breakdown */}
          <details className="bg-gray-50 rounded-lg dark:bg-gray-800 dark:border dark:border-gray-700">
            <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
              Se første års beregning
            </summary>
            <div className="p-4 pt-0 space-y-2 text-sm dark:text-gray-300">
              <div className="flex justify-between">
                <span>Rente første år</span>
                <span className="text-red-600 dark:text-red-400">
                  {formatKr(beregning.foersteAarRente)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Afdrag første år</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatKr(beregning.foersteAarAfdrag)}
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 dark:border-gray-700">
                <span>Samlet ydelse første år</span>
                <span>
                  {formatKr(
                    beregning.foersteAarRente + beregning.foersteAarAfdrag
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 border-t pt-2 dark:text-gray-400 dark:border-gray-700">
                <span>Restgæld efter 1 år</span>
                <span>{formatKr(hovedstol - beregning.foersteAarAfdrag)}</span>
              </div>
            </div>
          </details>

          {/* Share button */}
          <div className="flex justify-center gap-3">
            <CopyResultButton text={`${formatKr(hovedstol)} til ${rente}% i ${loebetid} år - samlet rente ${formatKr(beregning.samletRente)}`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Renteberegner"
              resultSummary={`${formatKr(hovedstol)} til ${rente}% i ${loebetid} år - samlet rente ${formatKr(beregning.samletRente)}`}
            />
          </div>

          {/* Låntype forklaring */}
          <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
            <h3 className="font-medium mb-2 dark:text-white">
              {type === "annuitet" ? "Om annuitetslån" : "Om serielån"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {type === "annuitet"
                ? "Ved annuitetslån er din månedlige ydelse fast gennem hele lånets løbetid. I starten betaler du mest i rente og mindst i afdrag. Over tid skifter forholdet, så du betaler mere i afdrag og mindre i rente."
                : "Ved serielån er dit månedlige afdrag fast, men den samlede ydelse falder over tid, fordi renten beregnes af en stadig mindre restgæld. Du betaler mindre i samlet rente, men starter med højere ydelser."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
