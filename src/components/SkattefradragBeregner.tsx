"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

// 2026 fradragssatser og grænser
const SATSER_2026 = {
  // Håndværkerfradrag (servicefradrag)
  haandvaerkerMax: 12400, // pr. person pr. år (2026)
  servicefradragMax: 6200, // serviceydelser (rengøring mv.)

  // Kørselsfradrag
  koerselBundgraense: 24, // km enkelt vej (12 km = 24 km dagligt)
  koerselSatsLav: 2.23, // kr./km for 25-120 km
  koerselSatsHoej: 1.12, // kr./km over 120 km
  koerselDageMax: 216, // max arbejdsdage

  // Rentefradrag
  rentefradragVaerdi: 25.6, // % (skattemæssig fradragsværdi for kapitalindkomst under bundfradrag)
  rentefradragVaerdiHoej: 33.6, // % for negative kapitalindkomst over grænsen i visse kommuner

  // Fagforening og a-kasse
  fagforeningMax: 7000, // max fradrag for fagforening (2026)

  // Befordringsfradrag
  // Generel skatteprocent for fradrag
  kommuneskatSnit: 25.1, // gennemsnitlig kommuneskat
  bundskat: 12.01,
};

export default function SkattefradragBeregner() {
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

  useEffect(() => { initScrollDepthTracking("skattefradrag"); }, []);

  const resultat = useMemo(() => {
    // Kørselsfradrag
    let koerselsFradrag = 0;
    const km = Number(afstandKm);
    const dage = Math.min(Number(arbejdsdage) || 216, SATSER_2026.koerselDageMax);
    if (km > SATSER_2026.koerselBundgraense / 2) {
      const dagligKm = km * 2; // tur-retur
      const fradragsKm = dagligKm - SATSER_2026.koerselBundgraense;
      if (fradragsKm > 0) {
        const lavKm = Math.min(fradragsKm, 120 * 2 - SATSER_2026.koerselBundgraense);
        const hoejKm = Math.max(0, fradragsKm - lavKm);
        koerselsFradrag = Math.round((lavKm * SATSER_2026.koerselSatsLav + hoejKm * SATSER_2026.koerselSatsHoej) * dage);
      }
    }

    // Rentefradrag
    const rente = Number(aarligRente) || 0;
    const renteFradrag = rente; // fuldt fradragsberettiget
    const renteBesparelse = Math.round(rente * (SATSER_2026.rentefradragVaerdi / 100));

    // Fagforening + a-kasse
    const fagforeningBeloeb = Math.min(Number(fagforening) || 0, SATSER_2026.fagforeningMax);
    const aKasseBeloeb = Number(aKasse) || 0; // fuldt fradrag
    const fagOgAkasse = fagforeningBeloeb + aKasseBeloeb;

    // Håndværkerfradrag
    const haandvaerkerBeloeb = Math.min(Number(haandvaerker) || 0, SATSER_2026.haandvaerkerMax);
    const serviceBeloeb = Math.min(Number(serviceydelser) || 0, SATSER_2026.servicefradragMax);
    const boligfradrag = haandvaerkerBeloeb + serviceBeloeb;

    // Øvrige
    const donationerBeloeb = Number(donationer) || 0;
    const oevrigeBeloeb = Number(oevrigeFradrag) || 0;
    const oevrigtTotal = donationerBeloeb + oevrigeBeloeb;

    // Samlet
    const samletFradrag = koerselsFradrag + renteFradrag + fagOgAkasse + oevrigtTotal;
    // Boligfradrag er skattefradrag direkte, ikke ligningsmæssigt
    const skattesats = (SATSER_2026.kommuneskatSnit + SATSER_2026.bundskat) / 100;
    const besparelseAlmindelig = Math.round(samletFradrag * skattesats);
    const besparelseBoligfradrag = Math.round(boligfradrag * 0.26); // 26% skatteværdi af servicefradrag
    const totalBesparelse = besparelseAlmindelig + besparelseBoligfradrag + (renteBesparelse - Math.round(renteFradrag * skattesats));

    const harFradrag = samletFradrag > 0 || boligfradrag > 0;

    if (!hasTracked.current && harFradrag) {
      hasTracked.current = true;
      trackCalculation("skattefradrag");
    }

    if (!harFradrag) return null;

    const poster = [
      ...(koerselsFradrag > 0 ? [{ navn: "Kørselsfradrag", beloeb: koerselsFradrag, type: "ligningsmæssigt" as const }] : []),
      ...(renteFradrag > 0 ? [{ navn: "Rentefradrag", beloeb: renteFradrag, type: "kapitalindkomst" as const }] : []),
      ...(fagforeningBeloeb > 0 ? [{ navn: "Fagforening", beloeb: fagforeningBeloeb, type: "ligningsmæssigt" as const }] : []),
      ...(aKasseBeloeb > 0 ? [{ navn: "A-kasse", beloeb: aKasseBeloeb, type: "ligningsmæssigt" as const }] : []),
      ...(haandvaerkerBeloeb > 0 ? [{ navn: "Håndværkerfradrag", beloeb: haandvaerkerBeloeb, type: "boligfradrag" as const }] : []),
      ...(serviceBeloeb > 0 ? [{ navn: "Serviceydelser", beloeb: serviceBeloeb, type: "boligfradrag" as const }] : []),
      ...(donationerBeloeb > 0 ? [{ navn: "Donationer/gaver", beloeb: donationerBeloeb, type: "ligningsmæssigt" as const }] : []),
      ...(oevrigeBeloeb > 0 ? [{ navn: "Øvrige fradrag", beloeb: oevrigeBeloeb, type: "ligningsmæssigt" as const }] : []),
    ];

    return {
      samletFradrag: samletFradrag + boligfradrag,
      totalBesparelse: Math.round(besparelseAlmindelig + besparelseBoligfradrag),
      besparelsePrMd: Math.round((besparelseAlmindelig + besparelseBoligfradrag) / 12),
      poster,
      koerselsFradrag,
      renteFradrag,
      renteBesparelse,
      fagOgAkasse,
      boligfradrag,
    };
  }, [afstandKm, arbejdsdage, aarligRente, fagforening, aKasse, haandvaerker, serviceydelser, donationer, oevrigeFradrag]);

  const handleReset = useCallback(() => {
    setAfstandKm(""); setArbejdsdage("216"); setAarligRente("");
    setFagforening(""); setAKasse(""); setHaandvaerker("");
    setServiceydelser(""); setDonationer(""); setOevrigeFradrag("");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

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
          Bundgrænse: {SATSER_2026.koerselBundgraense} km dagligt (12 km én vej). Fradrag gælder uanset transportmiddel.
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Rentefradrag har en skatteværdi på ca. {SATSER_2026.rentefradragVaerdi}% af renteudgifterne.
        </p>
      </div>

      {/* Fagforening og a-kasse */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Fagforening og a-kasse</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fagforening" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fagforening (max {formatKr(SATSER_2026.fagforeningMax)})
            </label>
            <div className="relative">
              <input id="fagforening" type="number" value={fagforening} onChange={(e) => setFagforening(e.target.value)}
                placeholder="F.eks. 5000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
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
              Håndværkerydelser (max {formatKr(SATSER_2026.haandvaerkerMax)})
            </label>
            <div className="relative">
              <input id="haandvaerker" type="number" value={haandvaerker} onChange={(e) => setHaandvaerker(e.target.value)}
                placeholder="F.eks. 10000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>
          <div>
            <label htmlFor="serviceydelser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Serviceydelser (max {formatKr(SATSER_2026.servicefradragMax)})
            </label>
            <div className="relative">
              <input id="serviceydelser" type="number" value={serviceydelser} onChange={(e) => setServiceydelser(e.target.value)}
                placeholder="F.eks. 5000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kun arbejdsløn kan fradrages (ikke materialer). Beløb pr. person pr. år.
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
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
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
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
                Dine renteudgifter på {formatKr(resultat.renteFradrag)} giver en skattebesparelse på ca. {formatKr(resultat.renteBesparelse)} (fradragsværdi {SATSER_2026.rentefradragVaerdi}%).
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
