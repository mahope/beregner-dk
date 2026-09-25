"use client";

import { useLocale } from '@/components/LocaleProvider';
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { initScrollDepthTracking, trackCalculation } from "@/lib/analytics";
import { CalculationState, ShareableLink, generateShareableLink, getStateFromUrl } from "@/lib/calculation-state";
import { formatNumber as formatNum, getCurrencySuffix } from '@/lib/format';
import { beregnSkattefradrag } from '@/lib/skattefradrag';
import { RENTEFRADRAG_2026, SATSER_2026, SKATTEFRADRAG_2026 } from '@/lib/satser-2026';

const RENTEFRADRAG_HOEJ_PCT = (RENTEFRADRAG_2026.highRate * 100).toLocaleString('da-DK');
const RENTEFRADRAG_LAV_PCT = (RENTEFRADRAG_2026.lowRate * 100).toLocaleString('da-DK');
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function SkattefradragBeregner() {
  const { locale } = useLocale();
  // Kørselsfradrag
  const [afstandKm, setAfstandKm] = useState<string>("");
  const [arbejdsdage, setArbejdsdage] = useState<string>("216");

  // Rentefradrag
  const [aarligRente, setAarligRente] = useState<string>("");

  // Fagforening og a-kasse
  const [fagforening, setFagforening] = useState<string>("");
  const [aKasse, setAKasse] = useState<string>("");

  // Håndværkerfradrag
  const [haandvaerker, setHaandvaerker] = useState<string>("");
  const [serviceydelser, setServiceydelser] = useState<string>("");

  // Øvrige fradrag
  const [donationer, setDonationer] = useState<string>("");
  const [oevrigeFradrag, setOevrigeFradrag] = useState<string>("");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "skattefradrag") {
      const i = urlState.inputs;
      if (i.afstandKm !== undefined) setAfstandKm(String(i.afstandKm));
      if (i.arbejdsdage !== undefined) setArbejdsdage(String(i.arbejdsdage));
      if (i.aarligRente !== undefined) setAarligRente(String(i.aarligRente));
      if (i.fagforening !== undefined) setFagforening(String(i.fagforening));
      if (i.aKasse !== undefined) setAKasse(String(i.aKasse));
      if (i.haandvaerker !== undefined) setHaandvaerker(String(i.haandvaerker));
      if (i.serviceydelser !== undefined) setServiceydelser(String(i.serviceydelser));
      if (i.donationer !== undefined) setDonationer(String(i.donationer));
      if (i.oevrigeFradrag !== undefined) setOevrigeFradrag(String(i.oevrigeFradrag));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "skattefradrag", timestamp: Date.now(),
      inputs: { afstandKm: Number(afstandKm), arbejdsdage: Number(arbejdsdage), aarligRente: Number(aarligRente), fagforening: Number(fagforening), aKasse: Number(aKasse), haandvaerker: Number(haandvaerker), serviceydelser: Number(serviceydelser), donationer: Number(donationer), oevrigeFradrag: Number(oevrigeFradrag) },
    });
  }, [afstandKm, arbejdsdage, aarligRente, fagforening, aKasse, haandvaerker, serviceydelser, donationer, oevrigeFradrag]);

  useEffect(() => initScrollDepthTracking("skattefradrag"), []);

  const resultat = useMemo(() => {
    const r = beregnSkattefradrag({
      afstandKm: Number(afstandKm),
      arbejdsdage: Number(arbejdsdage),
      aarligRente: Number(aarligRente),
      fagforening: Number(fagforening),
      aKasse: Number(aKasse),
      haandvaerker: Number(haandvaerker),
      serviceydelser: Number(serviceydelser),
      donationer: Number(donationer),
      oevrigeFradrag: Number(oevrigeFradrag),
    });
    if (r && !hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("skattefradrag");
    }
    return r;
  }, [afstandKm, arbejdsdage, aarligRente, fagforening, aKasse, haandvaerker, serviceydelser, donationer, oevrigeFradrag]);

  const handleReset = useCallback(() => {
    setAfstandKm(""); setArbejdsdage("216"); setAarligRente("");
    setFagforening(""); setAKasse(""); setHaandvaerker("");
    setServiceydelser(""); setDonationer(""); setOevrigeFradrag("");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => formatNum(n, locale) + " " + getCurrencySuffix(locale);

  return (
    <div className="space-y-6">
      {/* Kørselsfradrag */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Kørselsfradrag</h2>
          <ResetButton onReset={handleReset} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="afstandKm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afstand til arbejde (én vej)
            </label>
            <div className="relative">
              <input id="afstandKm" type="number" value={afstandKm} onChange={(e) => setAfstandKm(e.target.value)}
                placeholder="F.eks. 30" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
            </div>
          </div>
          <div>
            <label htmlFor="arbejdsdage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Arbejdsdage pr. år
            </label>
            <input id="arbejdsdage" type="number" value={arbejdsdage} onChange={(e) => setArbejdsdage(e.target.value)}
              min="1" max="260"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Bundgrænse: {SATSER_2026.koerselBundgraense} km dagligt (12 km én vej), herefter{" "}
          {SATSER_2026.koerselSatsLav.toLocaleString("da-DK")} kr./km op til{" "}
          {SATSER_2026.koerselHoejGraense} km og{" "}
          {SATSER_2026.koerselSatsHoej.toLocaleString("da-DK")} kr./km over. Fradrag gælder
          uanset transportmiddel. Samme satser som på{" "}
          <a href="/befordringsfradrag" className="underline hover:text-gray-700 dark:hover:text-gray-200">
            befordringsfradraget
          </a>
          .
        </p>
      </div>

      {/* Rentefradrag */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Rentefradrag</h2>
        <div>
          <label htmlFor="aarligRente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Årlige renteudgifter (boliglån, SU-lån mv.)
          </label>
          <div className="relative">
            <input id="aarligRente" type="number" value={aarligRente} onChange={(e) => setAarligRente(e.target.value)}
              placeholder="F.eks. 40000" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Rentefradrag har en skatteværdi på {RENTEFRADRAG_HOEJ_PCT}% af de første{" "}
          {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. renteudgifter
          (beregnet som enlig) og {RENTEFRADRAG_LAV_PCT}% af beløbet over.
        </p>
      </div>

      {/* Fagforening og a-kasse */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Fagforening og a-kasse</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fagforening" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fagforening (max {formatKr(SKATTEFRADRAG_2026.fagforeningMax)})
            </label>
            <div className="relative">
              <input id="fagforening" type="number" value={fagforening} onChange={(e) => setFagforening(e.target.value)}
                placeholder="F.eks. 5000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label htmlFor="aKasse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              A-kasse kontingent
            </label>
            <div className="relative">
              <input id="aKasse" type="number" value={aKasse} onChange={(e) => setAKasse(e.target.value)}
                placeholder="F.eks. 4000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Håndværkerfradrag */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Boligjobordning (håndværkerfradrag)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="haandvaerker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Håndværkerydelser (max {formatKr(SKATTEFRADRAG_2026.haandvaerkerMax)})
            </label>
            <div className="relative">
              <input id="haandvaerker" type="number" value={haandvaerker} onChange={(e) => setHaandvaerker(e.target.value)}
                placeholder="F.eks. 10000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label htmlFor="serviceydelser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Serviceydelser (max {formatKr(SKATTEFRADRAG_2026.servicefradragMax)})
            </label>
            <div className="relative">
              <input id="serviceydelser" type="number" value={serviceydelser} onChange={(e) => setServiceydelser(e.target.value)}
                placeholder="F.eks. 5000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kun arbejdsløn kan fradrages (ikke materialer), og betalingen skal ske digitalt.
          Beløb pr. person pr. år. Loftet for 2026 er endnu ikke verificeret mod en
          myndighedskilde, så de to felter er vejledende — tjek beløbet hos skat.dk.
        </p>
      </div>

      {/* Øvrige fradrag */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Øvrige fradrag</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="donationer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Donationer til godkendte organisationer
            </label>
            <div className="relative">
              <input id="donationer" type="number" value={donationer} onChange={(e) => setDonationer(e.target.value)}
                placeholder="0" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label htmlFor="oevrigeFradrag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Øvrige fradrag
            </label>
            <div className="relative">
              <input id="oevrigeFradrag" type="number" value={oevrigeFradrag} onChange={(e) => setOevrigeFradrag(e.target.value)}
                placeholder="0" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">Din skattebesparelse</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Skattefradrag: ${formatKr(resultat.samletFradrag)} i fradrag giver ca. ${formatKr(resultat.totalBesparelse)} i skattebesparelse (${formatKr(resultat.besparelsePrMd)}/md).`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Skattefradrag" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Samlet fradrag</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatKr(resultat.samletFradrag)}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Skattebesparelse</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatKr(resultat.totalBesparelse)}</p>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Pr. måned</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{formatKr(resultat.besparelsePrMd)}</p>
              </div>
            </div>
          </div>

          {/* Fradragsoversigt */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Fradragsoversigt</h3>
            <div className="space-y-3">
              {resultat.poster.map((post) => (
                <div key={post.navn} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300">{post.navn}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      post.type === "kapitalindkomst" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : post.type === "boligfradrag" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    }`}>
                      {post.type === "kapitalindkomst" ? "Kapital" : post.type === "boligfradrag" ? "Boligjob" : "Ligningsmæssigt"}
                    </span>
                  </div>
                  <span className="font-medium text-green-600 dark:text-green-400">{formatKr(post.beloeb)}</span>
                </div>
              ))}
            </div>
          </div>

          {resultat.renteBesparelse > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Rentefradrag detalje</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Dine renteudgifter på {formatKr(resultat.renteFradrag)} giver en skattebesparelse
                på {formatKr(resultat.renteBesparelse)} ({RENTEFRADRAG_HOEJ_PCT}% op til{" "}
                {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr., derefter{" "}
                {RENTEFRADRAG_LAV_PCT}%).
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende og baseret på 2026-satser. Faktisk besparelse afhænger af din kommune, indkomst og skatteforhold. Se skat.dk for præcise oplysninger.
          </p>
        </div>
      )}
    </div>
  );
}
