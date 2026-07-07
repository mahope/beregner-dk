"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type Venue = "have" | "forsamlingshus" | "slot_herregaard" | "restaurant" | "hotel";
type MadNiveau = "budget" | "standard" | "luksus";

const VENUES_DATA: Record<Venue, { pris: number }> = {
  have: { pris: 0 },
  forsamlingshus: { pris: 8000 },
  slot_herregaard: { pris: 35000 },
  restaurant: { pris: 15000 },
  hotel: { pris: 25000 },
};

const MAD_DATA: Record<MadNiveau, { prisPrPerson: number }> = {
  budget: { prisPrPerson: 350 },
  standard: { prisPrPerson: 650 },
  luksus: { prisPrPerson: 1100 },
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
  const { locale } = useLocale();

  const labels = {
    da: {
      basics: "Grundlæggende",
      numGuests: "Antal gæster",
      venue: "Venue",
      venueHave: "Privat have",
      venueForsamlingshus: "Forsamlingshus",
      venueSlot: "Slot/herregård",
      venueRestaurant: "Restaurant",
      venueHotel: "Hotel",
      free: "Gratis",
      foodAndDrink: "Mad og drikke",
      budget: "Budget",
      standard: "Standard",
      luxury: "Luksus",
      perPerson: "/pers.",
      expensePosts: "Udgiftsposter",
      photographer: "Fotograf",
      musicDJ: "Musik/DJ/band",
      weddingDress: "Brudekjole",
      suit: "Jakkesæt",
      rings: "Vielsesringe",
      flowersDecor: "Blomster/dekoration",
      otherExpenses: "Øvrige udgifter (transport, overnatning mv.)",
      totalBudget: "Samlet bryllupsbudget",
      totalBudgetLabel: "Samlet budget",
      perGuest: "Pr. gæst",
      expenseBreakdown: "Udgiftsfordeling",
      disclaimer: "Priserne er estimater baseret på gennemsnitlige danske bryllupspriser 2026. Faktiske priser varierer efter sted, sæson og ønsker.",
      foodAndDrinkPost: "Mad og drikke",
      venuePost: "Venue/lokale",
      musicDJPost: "Musik/DJ",
      invitations: "Invitationer",
      weddingCake: "Bryllupskage",
      ringsPost: "Ringe",
      otherExpensesPost: "Øvrige udgifter",
    },
    se: {
      basics: "Grundläggande",
      numGuests: "Antal gäster",
      venue: "Lokal",
      venueHave: "Privat trädgård",
      venueForsamlingshus: "Samlingslokal",
      venueSlot: "Slott/herrgård",
      venueRestaurant: "Restaurang",
      venueHotel: "Hotell",
      free: "Gratis",
      foodAndDrink: "Mat och dryck",
      budget: "Budget",
      standard: "Standard",
      luxury: "Lyx",
      perPerson: "/pers.",
      expensePosts: "Utgiftsposter",
      photographer: "Fotograf",
      musicDJ: "Musik/DJ/band",
      weddingDress: "Brudklänning",
      suit: "Kostym",
      rings: "Vigselringar",
      flowersDecor: "Blommor/dekoration",
      otherExpenses: "Övriga utgifter (transport, övernattning m.m.)",
      totalBudget: "Total bröllopsbudget",
      totalBudgetLabel: "Total budget",
      perGuest: "Per gäst",
      expenseBreakdown: "Utgiftsfördelning",
      disclaimer: "Priserna är uppskattningar baserade på genomsnittliga svenska bröllopspriser 2026. Faktiska priser varierar beroende på plats, säsong och önskemål.",
      foodAndDrinkPost: "Mat och dryck",
      venuePost: "Lokal/venue",
      musicDJPost: "Musik/DJ",
      invitations: "Inbjudningar",
      weddingCake: "Bröllopstårta",
      ringsPost: "Ringar",
      otherExpensesPost: "Övriga utgifter",
    },
    no: {
      basics: "Grunnleggende",
      numGuests: "Antall gjester",
      venue: "Lokale",
      venueHave: "Privat hage",
      venueForsamlingshus: "Forsamlingshus",
      venueSlot: "Slott/herregård",
      venueRestaurant: "Restaurant",
      venueHotel: "Hotell",
      free: "Gratis",
      foodAndDrink: "Mat og drikke",
      budget: "Budsjett",
      standard: "Standard",
      luxury: "Luksus",
      perPerson: "/pers.",
      expensePosts: "Utgiftsposter",
      photographer: "Fotograf",
      musicDJ: "Musikk/DJ/band",
      weddingDress: "Brudekjole",
      suit: "Dress",
      rings: "Gifteringer",
      flowersDecor: "Blomster/dekorasjon",
      otherExpenses: "Øvrige utgifter (transport, overnatting mv.)",
      totalBudget: "Samlet bryllupsbudsjett",
      totalBudgetLabel: "Samlet budsjett",
      perGuest: "Per gjest",
      expenseBreakdown: "Utgiftsfordeling",
      disclaimer: "Prisene er estimater basert på gjennomsnittlige norske bryllupspriser 2026. Faktiske priser varierer etter sted, sesong og ønsker.",
      foodAndDrinkPost: "Mat og drikke",
      venuePost: "Lokale/venue",
      musicDJPost: "Musikk/DJ",
      invitations: "Invitasjoner",
      weddingCake: "Bryllupskake",
      ringsPost: "Ringer",
      otherExpensesPost: "Øvrige utgifter",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const venueLabels: Record<Venue, string> = {
    have: l.venueHave,
    forsamlingshus: l.venueForsamlingshus,
    slot_herregaard: l.venueSlot,
    restaurant: l.venueRestaurant,
    hotel: l.venueHotel,
  };

  const madLabels: Record<MadNiveau, string> = {
    budget: l.budget,
    standard: l.standard,
    luksus: l.luxury,
  };

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

  useEffect(() => initScrollDepthTracking("bryllup"), []);

  const resultat = useMemo(() => {
    const gaester = Number(antalGaester);
    if (!gaester || gaester <= 0) return null;

    const venuePris = VENUES_DATA[venue].pris;
    const madPris = gaester * MAD_DATA[madNiveau].prisPrPerson;
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
      { navn: l.foodAndDrinkPost, beloeb: madPris },
      ...(venuePris > 0 ? [{ navn: l.venuePost, beloeb: venuePris }] : []),
      { navn: l.photographer, beloeb: fotografPris },
      { navn: l.musicDJPost, beloeb: musikPris },
      { navn: l.weddingDress, beloeb: kjolePris },
      { navn: l.suit, beloeb: jakkesaetPris },
      { navn: l.ringsPost, beloeb: ringePris },
      { navn: l.flowersDecor, beloeb: blomsterPris },
      { navn: l.invitations, beloeb: invitationPris },
      { navn: l.weddingCake, beloeb: kagePris },
      ...(ekstraPris > 0 ? [{ navn: l.otherExpensesPost, beloeb: ekstraPris }] : []),
    ].filter(p => p.beloeb > 0).sort((a, b) => b.beloeb - a.beloeb);

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("bryllup");
    }

    return { total, prGaest, poster };
  }, [antalGaester, venue, madNiveau, fotograf, musik, kjole, jakkesaet, ringe, blomster, ekstra, l]);

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

  const formatKr = (n: number) => formatCurrency(n, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280", "#f97316", "#84cc16", "#14b8a6"];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{l.basics}</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label htmlFor="antalGaester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l.numGuests}</label>
          <input id="antalGaester" type="number" value={antalGaester} onChange={(e) => setAntalGaester(e.target.value)}
            min="1" max="500"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.venue}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(VENUES_DATA) as Venue[]).map((key) => (
              <button type="button" key={key} onClick={() => setVenue(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  venue === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {venueLabels[key]}
                <span className={`block text-xs mt-0.5 ${venue === key ? "text-blue-200" : "text-gray-400"}`}>
                  {VENUES_DATA[key].pris === 0 ? l.free : formatKr(VENUES_DATA[key].pris)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.foodAndDrink}</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(MAD_DATA) as MadNiveau[]).map((key) => (
              <button type="button" key={key} onClick={() => setMadNiveau(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  madNiveau === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {madLabels[key]}
                <span className={`block text-xs mt-0.5 ${madNiveau === key ? "text-blue-200" : "text-gray-400"}`}>
                  {formatKr(MAD_DATA[key].prisPrPerson)}{l.perPerson}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detaljerede poster */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold dark:text-white">{l.expensePosts}</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: "fotograf", label: l.photographer, value: fotograf, set: setFotograf },
            { id: "musik", label: l.musicDJ, value: musik, set: setMusik },
            { id: "kjole", label: l.weddingDress, value: kjole, set: setKjole },
            { id: "jakkesaet", label: l.suit, value: jakkesaet, set: setJakkesaet },
            { id: "ringe", label: l.rings, value: ringe, set: setRinge },
            { id: "blomster", label: l.flowersDecor, value: blomster, set: setBlomster },
          ].map((post) => (
            <div key={post.id}>
              <label htmlFor={post.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{post.label}</label>
              <div className="relative">
                <input id={post.id} type="number" value={post.value} onChange={(e) => post.set(e.target.value)}
                  min="0"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="ekstra" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l.otherExpenses}</label>
          <div className="relative">
            <input id="ekstra" type="number" value={ekstra} onChange={(e) => setEkstra(e.target.value)}
              min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-2.5 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{getCurrencySuffix(locale)}</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/30 dark:to-rose-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-rose-900 dark:text-rose-200">{l.totalBudget}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`${l.totalBudget}: ${formatKr(resultat.total)} (${formatKr(resultat.prGaest)}/${l.perGuest}, ${antalGaester} ${l.numGuests}).`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Bryllup" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-rose-700 dark:text-rose-300">{l.totalBudgetLabel}</p>
                <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{formatKr(resultat.total)}</p>
              </div>
              <div>
                <p className="text-sm text-rose-700 dark:text-rose-300">{l.perGuest}</p>
                <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{formatKr(resultat.prGaest)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.expenseBreakdown}</h3>
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
            {l.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
