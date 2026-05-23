"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { formatNumber as formatNum, getCurrencySuffix } from '@/lib/format';

// Sygedagpenge 2026 satser
// Kilde: borger.dk, star.dk, retsinformation.dk
const SATSER_2026 = {
  maxUgeSats: 4750, // Max sygedagpenge pr. uge (2026 estimat)
  arbejdsgiverperiodeDage: 30, // Kalenderdage arbejdsgiver betaler
  beregningsProcent: 90, // Procent af løn (for lønmodtagere)
  normalArbejdstimer: 37, // Normal ugentlig arbejdstid
  varighedUger: 22, // Revurdering efter 22 uger inden for 9 mdr.
};

type Ansaettelse = "loenmodtager" | "selvstaendig";

export default function SygedagpengeBeregner() {
  const { locale } = useLocale();
  const [ansaettelse, setAnsaettelse] = useState<Ansaettelse>("loenmodtager");
  const [maanedsloen, setMaanedsloen] = useState<string>("");
  const [arbejdstimer, setArbejdstimer] = useState<string>("37");
  const [sygedage, setSygedage] = useState<string>("60");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "sygedagpenge") {
      const inputs = urlState.inputs;
      if (inputs.ansaettelse !== undefined) setAnsaettelse(inputs.ansaettelse as Ansaettelse);
      if (inputs.maanedsloen !== undefined) setMaanedsloen(String(inputs.maanedsloen));
      if (inputs.arbejdstimer !== undefined) setArbejdstimer(String(inputs.arbejdstimer));
      if (inputs.sygedage !== undefined) setSygedage(String(inputs.sygedage));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    const state: CalculationState = {
      type: "sygedagpenge",
      timestamp: Date.now(),
      inputs: {
        ansaettelse,
        maanedsloen: Number(maanedsloen),
        arbejdstimer: Number(arbejdstimer),
        sygedage: Number(sygedage),
      },
    };
    return generateShareableLink(state);
  }, [ansaettelse, maanedsloen, arbejdstimer, sygedage]);

  useEffect(() => {
    return initScrollDepthTracking("sygedagpenge");
  }, []);

  const resultat = useMemo(() => {
    const loen = Number(maanedsloen);
    const timer = Number(arbejdstimer);
    const dage = Number(sygedage);

    if (!loen || loen <= 0 || !timer || timer <= 0 || !dage || dage <= 0) return null;

    // Beregn timeløn
    const ugerPrMaaned = 4.3333;
    const timeloen = loen / (timer * ugerPrMaaned);

    // Ugentlig sygedagpenge = timeløn × timer × 90%, max satsen
    const beregnetUgeSats = timeloen * timer * (SATSER_2026.beregningsProcent / 100);
    const ugeSats = Math.min(beregnetUgeSats, SATSER_2026.maxUgeSats);
    const erMaxSats = beregnetUgeSats >= SATSER_2026.maxUgeSats;

    const dagSats = ugeSats / 5; // 5 hverdage
    const maanedSats = ugeSats * ugerPrMaaned;

    // Fordel dage på arbejdsgiver vs. kommune
    const arbejdsgiverDage = Math.min(dage, SATSER_2026.arbejdsgiverperiodeDage);
    const kommuneDage = Math.max(0, dage - SATSER_2026.arbejdsgiverperiodeDage);
    const arbejdsgiverHverdage = Math.round(arbejdsgiverDage * (5 / 7));
    const kommuneHverdage = Math.round(kommuneDage * (5 / 7));

    // Total udbetaling i perioden
    const totalHverdage = Math.round(dage * (5 / 7));
    const totalUdbetaling = totalHverdage * dagSats;

    // Løntab
    const dagligLoen = loen / (ugerPrMaaned * 5);
    const totalLoentab = totalHverdage * dagligLoen - totalUdbetaling;

    // Procentdel af løn
    const procentAfLoen = (maanedSats / loen) * 100;

    // Varighedsvurdering
    const ugerSyg = dage / 7;
    const overVarighedsgraense = ugerSyg > SATSER_2026.varighedUger;

    if (!hasTracked.current && loen > 0) {
      hasTracked.current = true;
      trackCalculation("sygedagpenge");
    }

    return {
      ugeSats: Math.round(ugeSats),
      dagSats: Math.round(dagSats),
      maanedSats: Math.round(maanedSats),
      erMaxSats,
      procentAfLoen: Math.round(procentAfLoen * 10) / 10,
      arbejdsgiverDage,
      kommuneDage,
      arbejdsgiverHverdage,
      kommuneHverdage,
      totalHverdage,
      totalUdbetaling: Math.round(totalUdbetaling),
      totalLoentab: Math.round(totalLoentab),
      overVarighedsgraense,
      ugerSyg: Math.round(ugerSyg * 10) / 10,
    };
  }, [ansaettelse, maanedsloen, arbejdstimer, sygedage]);

  const handleReset = useCallback(() => {
    setAnsaettelse("loenmodtager");
    setMaanedsloen("");
    setArbejdstimer("37");
    setSygedage("60");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => formatNum(n, locale) + " " + getCurrencySuffix(locale);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Dine oplysninger</h2>
          <ResetButton onReset={handleReset} />
        </div>

        {/* Ansættelsestype */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ansættelsestype
          </label>
          <div className="flex gap-3">
            {(["loenmodtager", "selvstaendig"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setAnsaettelse(type)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  ansaettelse === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {type === "loenmodtager" ? "Lønmodtager" : "Selvstændig"}
              </button>
            ))}
          </div>
        </div>

        {/* Månedsløn / Årsindkomst */}
        <div>
          <label htmlFor="maanedsloen" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {ansaettelse === "loenmodtager" ? "Månedsløn (brutto)" : "Månedlig indkomst (gennemsnit)"}
          </label>
          <div className="relative">
            <input
              id="maanedsloen"
              type="number"
              value={maanedsloen}
              onChange={(e) => setMaanedsloen(e.target.value)}
              placeholder={ansaettelse === "loenmodtager" ? "F.eks. 35000" : "F.eks. 30000"}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
          </div>
        </div>

        {/* Arbejdstimer */}
        <div>
          <label htmlFor="arbejdstimer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ugentlig arbejdstid
          </label>
          <div className="relative">
            <input
              id="arbejdstimer"
              type="number"
              value={arbejdstimer}
              onChange={(e) => setArbejdstimer(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="50"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">timer</span>
          </div>
        </div>

        {/* Antal sygedage */}
        <div>
          <label htmlFor="sygedage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Forventet antal sygedage (kalenderdage)
          </label>
          <div className="relative">
            <input
              id="sygedage"
              type="number"
              value={sygedage}
              onChange={(e) => setSygedage(e.target.value)}
              placeholder="F.eks. 60"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="365"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">dage</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          {/* Hovedresultat */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                Dine sygedagpenge
              </h3>
              <div className="flex gap-2">
                <CopyResultButton
                  text={`Sygedagpenge: ${formatKr(resultat.maanedSats)}/md (${formatKr(resultat.ugeSats)}/uge). Total i perioden: ${formatKr(resultat.totalUdbetaling)}.`}
                />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Sygedagpenge" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. uge</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.ugeSats)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. måned</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.maanedSats)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. dag</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.dagSats)}</p>
              </div>
            </div>

            {resultat.erMaxSats && (
              <p className="mt-3 text-sm text-blue-700 dark:text-blue-300 bg-blue-200/50 dark:bg-blue-800/50 rounded-lg px-3 py-2">
                Du rammer maksimumsatsen på {formatKr(SATSER_2026.maxUgeSats)}/uge. Din beregnede sats er højere.
              </p>
            )}

            <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
              Svarer til {resultat.procentAfLoen}% af din bruttoløn
            </p>
          </div>

          {/* Periodefordeling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Periodefordeling</h3>

            {/* Tidslinje */}
            <div className="mb-6">
              <div className="flex rounded-lg overflow-hidden h-8">
                {resultat.arbejdsgiverDage > 0 && (
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(resultat.arbejdsgiverDage / Number(sygedage)) * 100}%` }}
                  >
                    {resultat.arbejdsgiverDage} dage
                  </div>
                )}
                {resultat.kommuneDage > 0 && (
                  <div
                    className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${(resultat.kommuneDage / Number(sygedage)) * 100}%` }}
                  >
                    {resultat.kommuneDage} dage
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>Dag 1</span>
                <span>Dag {sygedage}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium text-green-800 dark:text-green-300">Arbejdsgiverperioden</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  De første <strong>{SATSER_2026.arbejdsgiverperiodeDage} kalenderdage</strong> ({resultat.arbejdsgiverHverdage} hverdage)
                </p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                  Arbejdsgiver udbetaler sygedagpenge
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-300">Kommunal periode</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Fra dag {SATSER_2026.arbejdsgiverperiodeDage + 1}: <strong>{resultat.kommuneDage} kalenderdage</strong> ({resultat.kommuneHverdage} hverdage)
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">
                  Kommunen/Udbetaling Danmark udbetaler
                </p>
              </div>
            </div>
          </div>

          {/* Økonomisk overblik */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Økonomisk overblik for perioden</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Sygeperiode</span>
                <span className="font-medium dark:text-white">{sygedage} kalenderdage ({resultat.totalHverdage} hverdage)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet sygedagpenge</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatKr(resultat.totalUdbetaling)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Normal løn i perioden</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.totalUdbetaling + resultat.totalLoentab)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Løntab</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{formatKr(resultat.totalLoentab)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Mange arbejdsgivere supplerer op til fuld løn. Tjek din overenskomst eller ansættelseskontrakt.
            </p>
          </div>

          {/* Varighedsadvarsel */}
          {resultat.overVarighedsgraense && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                Revurdering efter {SATSER_2026.varighedUger} uger
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Din sygeperiode ({resultat.ugerSyg} uger) overskrider revurderingsgrænsen på {SATSER_2026.varighedUger} uger.
                Kommunen skal senest ved uge 22 vurdere, om du kan forlænges. Forlængelse kan ske ved f.eks. afventning af behandling, revalidering eller fleksjob-afklaring.
              </p>
            </div>
          )}

          {/* Mulighedserklæring info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
            <h3 className="font-semibold dark:text-white mb-3">Vigtige frister og dokumenter</h3>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold mt-0.5">1</span>
                <div>
                  <strong>Mulighedserklæring</strong> — din arbejdsgiver kan anmode om en fra dag 1. Den udfyldes af dig, din arbejdsgiver og din læge.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold mt-0.5">2</span>
                <div>
                  <strong>Friattest</strong> — din arbejdsgiver kan bede om lægelig dokumentation for, at du er syg.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold mt-0.5">3</span>
                <div>
                  <strong>Anmeldelse til kommunen</strong> — arbejdsgiver skal anmelde fraværet til kommunen senest 5 uger efter 1. fraværsdag.
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-blue-500 font-bold mt-0.5">4</span>
                <div>
                  <strong>Oplysningsskema</strong> — du modtager et oplysningsskema fra kommunen, som du skal udfylde inden 8 dage.
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende og baseret på 2026-satser. Faktisk udbetaling kan variere. Kontakt din kommune for præcise oplysninger.
          </p>
        </div>
      )}
    </div>
  );
}
