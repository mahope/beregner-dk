"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Venue = "have" | "forsamlingshus" | "slot_herregaard" | "restaurant" | "hotel";
type MadNiveau = "budget" | "standard" | "luksus";

const VENUES: Record<Venue, { label: string; pris: number }> = {
  have: { label: "Privat have", pris: 0 },
  forsamlingshus: { label: "Forsamlingshus", pris: 8000 },
  slot_herregaard: { label: "Slot/herregård", pris: 35000 },
  restaurant: { label: "Restaurant", pris: 15000 },
  hotel: { label: "Hotel", pris: 25000 },
};

const MAD: Record<MadNiveau, { label: string; prisPrPerson: number }> = {
  budget: { label: "Budget", prisPrPerson: 350 },
  standard: { label: "Standard", prisPrPerson: 650 },
  luksus: { label: "Luksus", prisPrPerson: 1100 },
};

const POSTER = {
  fotograf: { min: 5000, standard: 12000, max: 25000 },
  musik: { min: 3000, standard: 8000, max: 20000 },
  kjole: { min: 3000, standard: 10000, max: 25000 },
  jakkesaet: { min: 2000, standard: 5000, max: 12000 },
  ringe: { min: 3000, standard: 8000, max: 20000 },
  blomster: { min: 2000, standard: 6000, max: 15000 },
  invitation: { min: 500, standard: 2000, max: 5000 },
  kage: { min: 1500, standard: 4000, max: 8000 },
  kirke: 0, // Gratis i folkekirken
};

export default function BryllupBeregner() {
  const [antalGaester, setAntalGaester] = useState<string>("80");
  const [venue, setVenue] = useState<Venue>("forsamlingshus");
  const [madNiveau, setMadNiveau] = useState<MadNiveau>("standard");
  const [fotograf, setFotograf] = useState<string>(String(POSTER.fotograf.standard));
  const [musik, setMusik] = useState<string>(String(POSTER.musik.standard));
  const [kjole, setKjole] = useState<string>(String(POSTER.kjole.standard));
  const [jakkesaet, setJakkesaet] = useState<string>(String(POSTER.jakkesaet.standard));
  const [ringe, setRinge] = useState<string>(String(POSTER.ringe.standard));
  const [blomster, setBlomster] = useState<string>(String(POSTER.blomster.standard));
  const [ekstra, setEkstra] = useState<string>("5000");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "bryllup") {
      const i = urlState.inputs;
      if (i.antalGaester !== undefined) setAntalGaester(String(i.antalGaester));
      if (i.venue !== undefined) setVenue(i.venue as Venue);
      if (i.madNiveau !== undefined) setMadNiveau(i.madNiveau as MadNiveau);
      if (i.fotograf !== undefined) setFotograf(String(i.fotograf));
      if (i.musik !== undefined) setMusik(String(i.musik));
      if (i.kjole !== undefined) setKjole(String(i.kjole));
      if (i.jakkesaet !== undefined) setJakkesaet(String(i.jakkesaet));
      if (i.ringe !== undefined) setRinge(String(i.ringe));
      if (i.blomster !== undefined) setBlomster(String(i.blomster));
      if (i.ekstra !== undefined) setEkstra(String(i.ekstra));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "bryllup", timestamp: Date.now(),
      inputs: { antalGaester: Number(antalGaester), venue, madNiveau, fotograf: Number(fotograf), musik: Number(musik), kjole: Number(kjole), jakkesaet: Number(jakkesaet), ringe: Number(ringe), blomster: Number(blomster), ekstra: Number(ekstra) },
    });
  }, [antalGaester, venue, madNiveau, fotograf, musik, kjole, jakkesaet, ringe, blomster, ekstra]);

  useEffect(() => { initScrollDepthTracking("bryllup"); }, []);

  const resultat = useMemo(() => {
    const gaester = Number(antalGaester);
    if (!gaester || gaester <= 0) return null;

    const venuePris = VENUES[venue].pris;
    const madPris = gaester * MAD[madNiveau].prisPrPerson;
    const fotografPris = Number(fotograf) || 0;
    const musikPris = Number(musik) || 0;
    const kjolePris = Number(kjole) || 0;
    const jakkesaetPris = Number(jakkesaet) || 0;
    const ringePris = Number(ringe) || 0;
    const blomsterPris = Number(blomster) || 0;
    const invitationPris = POSTER.invitation.standard;
    const kagePris = POSTER.kage.standard;
    const ekstraPris = Number(ekstra) || 0;

    const total = venuePris + madPris + fotografPris + musikPris + kjolePris + jakkesaetPris + ringePris + blomsterPris + invitationPris + kagePris + ekstraPris;
    const prGaest = Math.round(total / gaester);

    const poster = [
      { navn: "Mad og drikke", beloeb: madPris },
      ...(venuePris > 0 ? [{ navn: "Venue/lokale", beloeb: venuePris }] : []),
      { navn: "Fotograf", beloeb: fotografPris },
      { navn: "Musik/DJ", beloeb: musikPris },
      { navn: "Brudekjole", beloeb: kjolePris },
      { navn: "Jakkesæt", beloeb: jakkesaetPris },
      { navn: "Ringe", beloeb: ringePris },
      { navn: "Blomster/dekoration", beloeb: blomsterPris },
      { navn: "Invitationer", beloeb: invitationPris },
      { navn: "Bryllupskage", beloeb: kagePris },
      ...(ekstraPris > 0 ? [{ navn: "Øvrige udgifter", beloeb: ekstraPris }] : []),
    ].filter(p => p.beloeb > 0).sort((a, b) => b.beloeb - a.beloeb);

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("bryllup");
    }

    return { total, prGaest, poster };
  }, [antalGaester, venue, madNiveau, fotograf, musik, kjole, jakkesaet, ringe, blomster, ekstra]);

  const handleReset = useCallback(() => {
    setAntalGaester("80");
    setVenue("forsamlingshus");
    setMadNiveau("standard");
    setFotograf(String(POSTER.fotograf.standard));
    setMusik(String(POSTER.musik.standard));
    setKjole(String(POSTER.kjole.standard));
    setJakkesaet(String(POSTER.jakkesaet.standard));
    setRinge(String(POSTER.ringe.standard));
    setBlomster(String(POSTER.blomster.standard));
    setEkstra("5000");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280", "#f97316", "#84cc16", "#14b8a6"];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Grundlæggende</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label htmlFor="antalGaester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Antal gæster</label>
          <input id="antalGaester" type="number" value={antalGaester} onChange={(e) => setAntalGaester(e.target.value)}
            min="1" max="500"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Venue</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(VENUES) as [Venue, typeof VENUES.have][]).map(([key, val]) => (
              <button key={key} onClick={() => setVenue(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  venue === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {val.label}
                <span className={`block text-xs mt-0.5 ${venue === key ? "text-blue-200" : "text-gray-400"}`}>
                  {val.pris === 0 ? "Gratis" : formatKr(val.pris)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mad og drikke</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MAD) as [MadNiveau, typeof MAD.budget][]).map(([key, val]) => (
              <button key={key} onClick={() => setMadNiveau(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  madNiveau === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {val.label}
                <span className={`block text-xs mt-0.5 ${madNiveau === key ? "text-blue-200" : "text-gray-400"}`}>
                  {formatKr(val.prisPrPerson)}/pers.
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detaljerede poster */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">Udgiftsposter</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "fotograf", label: "Fotograf", value: fotograf, set: setFotograf },
            { id: "musik", label: "Musik/DJ/band", value: musik, set: setMusik },
            { id: "kjole", label: "Brudekjole", value: kjole, set: setKjole },
            { id: "jakkesaet", label: "Jakkesæt", value: jakkesaet, set: setJakkesaet },
            { id: "ringe", label: "Vielsesringe", value: ringe, set: setRinge },
            { id: "blomster", label: "Blomster/dekoration", value: blomster, set: setBlomster },
          ].map((post) => (
            <div key={post.id}>
              <label htmlFor={post.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{post.label}</label>
              <div className="relative">
                <input id={post.id} type="number" value={post.value} onChange={(e) => post.set(e.target.value)}
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr.</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="ekstra" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Øvrige udgifter (transport, overnatning mv.)</label>
          <div className="relative">
            <input id="ekstra" type="number" value={ekstra} onChange={(e) => setEkstra(e.target.value)}
              min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr.</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">Samlet bryllupsbudget</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Bryllupsbudget: ${formatKr(resultat.total)} (${formatKr(resultat.prGaest)}/gæst, ${antalGaester} gæster).`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Bryllup" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-rose-700 dark:text-rose-300">Samlet budget</p>
                <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{formatKr(resultat.total)}</p>
              </div>
              <div>
                <p className="text-sm text-rose-700 dark:text-rose-300">Pr. gæst</p>
                <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{formatKr(resultat.prGaest)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Udgiftsfordeling</h3>
            <div className="space-y-3">
              {resultat.poster.map((post, i) => (
                <div key={post.navn}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{post.navn}</span>
                    <span className="text-sm font-medium dark:text-white">{formatKr(post.beloeb)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all"
                      style={{ width: `${(post.beloeb / resultat.total) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Priserne er estimater baseret på gennemsnitlige danske bryllupspriser 2026. Faktiske priser varierer efter sted, sæson og ønsker.
          </p>
        </div>
      )}
    </div>
  );
}
