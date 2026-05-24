"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type Destination = "europa" | "skandinavien" | "sydeuropa" | "usa" | "asien" | "custom";
type Rejsetype = "budget" | "standard" | "luksus";

interface DestinationData {
  fly: number;
  hotel: Record<Rejsetype, number>;
  mad: Record<Rejsetype, number>;
  transport: number;
  oplevelser: number;
}

const DESTINATIONER: Record<Exclude<Destination, "custom">, DestinationData> = {
  europa: {
    fly: 1200, hotel: { budget: 350, standard: 600, luksus: 1200 },
    mad: { budget: 200, standard: 400, luksus: 700 },
    transport: 100, oplevelser: 150,
  },
  skandinavien: {
    fly: 900, hotel: { budget: 500, standard: 800, luksus: 1500 },
    mad: { budget: 300, standard: 500, luksus: 900 },
    transport: 120, oplevelser: 200,
  },
  sydeuropa: {
    fly: 1500, hotel: { budget: 300, standard: 550, luksus: 1100 },
    mad: { budget: 200, standard: 350, luksus: 650 },
    transport: 80, oplevelser: 120,
  },
  usa: {
    fly: 4500, hotel: { budget: 600, standard: 1000, luksus: 2000 },
    mad: { budget: 300, standard: 500, luksus: 900 },
    transport: 200, oplevelser: 250,
  },
  asien: {
    fly: 5000, hotel: { budget: 200, standard: 400, luksus: 1000 },
    mad: { budget: 100, standard: 250, luksus: 500 },
    transport: 60, oplevelser: 100,
  },
};

const REJSETYPER: Record<Rejsetype, string> = {
  budget: "Budget",
  standard: "Standard",
  luksus: "Luksus",
};

export default function RejsebudgetBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      travelInfo: "Rejseoplysninger",
      destination: "Destination",
      travelType: "Rejsetype",
      numDays: "Antal dage",
      numPersons: "Antal personer",
      extraExpenses: "Ekstra udgifter (shopping, souvenirs mv.)",
      totalBudget: "Samlet rejsebudget",
      total: "Total",
      perPerson: "Pr. person",
      perDay: "Pr. dag",
      expenseBreakdown: "Udgiftsfordeling",
      dailyBudget: "Dagligt budget pr. person (ekskl. fly)",
      accommodation: "Overnatning",
      food: "Mad",
      activities: "Aktiviteter",
      disclaimer: "Priserne er estimater baseret på gennemsnitspriser for 2026. Faktiske priser varierer efter sæson, booking-tidspunkt og valg.",
      flyRoundtrip: "Fly (t/r)",
      foodAndDrink: "Mad og drikke",
      localTransport: "Lokal transport",
      experiencesAndEntry: "Oplevelser og entré",
      extraExpensesPost: "Ekstra udgifter",
      destEurope: "Centraleuropa (Berlin, Prag, Wien)",
      destScandinavia: "Skandinavien (Stockholm, Oslo, Helsinki)",
      destSouthEurope: "Sydeuropa (Spanien, Italien, Grækenland)",
      destUSA: "USA (New York, LA, Florida)",
      destAsia: "Asien (Thailand, Bali, Japan)",
    },
    se: {
      travelInfo: "Reseinformation",
      destination: "Destination",
      travelType: "Resetyp",
      numDays: "Antal dagar",
      numPersons: "Antal personer",
      extraExpenses: "Extra utgifter (shopping, souvenirer m.m.)",
      totalBudget: "Total resebudget",
      total: "Totalt",
      perPerson: "Per person",
      perDay: "Per dag",
      expenseBreakdown: "Utgiftsfördelning",
      dailyBudget: "Daglig budget per person (exkl. flyg)",
      accommodation: "Boende",
      food: "Mat",
      activities: "Aktiviteter",
      disclaimer: "Priserna är uppskattningar baserade på genomsnittspriser för 2026. Faktiska priser varierar beroende på säsong, bokningstid och val.",
      flyRoundtrip: "Flyg (t/r)",
      foodAndDrink: "Mat och dryck",
      localTransport: "Lokal transport",
      experiencesAndEntry: "Upplevelser och entré",
      extraExpensesPost: "Extra utgifter",
      destEurope: "Centraleuropa (Berlin, Prag, Wien)",
      destScandinavia: "Skandinavien (Stockholm, Oslo, Helsingfors)",
      destSouthEurope: "Sydeuropa (Spanien, Italien, Grekland)",
      destUSA: "USA (New York, LA, Florida)",
      destAsia: "Asien (Thailand, Bali, Japan)",
    },
    no: {
      travelInfo: "Reiseinformasjon",
      destination: "Destinasjon",
      travelType: "Reisetype",
      numDays: "Antall dager",
      numPersons: "Antall personer",
      extraExpenses: "Ekstra utgifter (shopping, suvenirer mv.)",
      totalBudget: "Samlet reisebudsjett",
      total: "Totalt",
      perPerson: "Per person",
      perDay: "Per dag",
      expenseBreakdown: "Utgiftsfordeling",
      dailyBudget: "Daglig budsjett per person (ekskl. fly)",
      accommodation: "Overnatting",
      food: "Mat",
      activities: "Aktiviteter",
      disclaimer: "Prisene er estimater basert på gjennomsnittspriser for 2026. Faktiske priser varierer etter sesong, bestillingstidspunkt og valg.",
      flyRoundtrip: "Fly (t/r)",
      foodAndDrink: "Mat og drikke",
      localTransport: "Lokal transport",
      experiencesAndEntry: "Opplevelser og entré",
      extraExpensesPost: "Ekstra utgifter",
      destEurope: "Sentral-Europa (Berlin, Praha, Wien)",
      destScandinavia: "Skandinavia (Stockholm, Oslo, Helsinki)",
      destSouthEurope: "Sør-Europa (Spania, Italia, Hellas)",
      destUSA: "USA (New York, LA, Florida)",
      destAsia: "Asia (Thailand, Bali, Japan)",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const destLabels: Record<Exclude<Destination, "custom">, string> = {
    europa: l.destEurope,
    skandinavien: l.destScandinavia,
    sydeuropa: l.destSouthEurope,
    usa: l.destUSA,
    asien: l.destAsia,
  };

  const [destination, setDestination] = useState<Destination>("sydeuropa");
  const [rejsetype, setRejsetype] = useState<Rejsetype>("standard");
  const [antalDage, setAntalDage] = useState<string>("7");
  const [antalPersoner, setAntalPersoner] = useState<string>("2");
  const [ekstraUdgifter, setEkstraUdgifter] = useState<string>("0");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "rejsebudget") {
      const i = urlState.inputs;
      if (i.destination !== undefined) setDestination(i.destination as Destination);
      if (i.rejsetype !== undefined) setRejsetype(i.rejsetype as Rejsetype);
      if (i.antalDage !== undefined) setAntalDage(String(i.antalDage));
      if (i.antalPersoner !== undefined) setAntalPersoner(String(i.antalPersoner));
      if (i.ekstraUdgifter !== undefined) setEkstraUdgifter(String(i.ekstraUdgifter));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "rejsebudget", timestamp: Date.now(),
      inputs: { destination, rejsetype, antalDage: Number(antalDage), antalPersoner: Number(antalPersoner), ekstraUdgifter: Number(ekstraUdgifter) },
    });
  }, [destination, rejsetype, antalDage, antalPersoner, ekstraUdgifter]);

  useEffect(() => initScrollDepthTracking("rejsebudget"), []);

  const resultat = useMemo(() => {
    const dage = Number(antalDage);
    const personer = Number(antalPersoner);
    if (!dage || dage <= 0 || !personer || personer <= 0) return null;
    if (destination === "custom") return null;

    const d = DESTINATIONER[destination];
    const naetter = Math.max(0, dage - 1);

    const fly = d.fly * personer;
    const hotel = d.hotel[rejsetype] * naetter * Math.ceil(personer / 2);
    const mad = d.mad[rejsetype] * dage * personer;
    const transport = d.transport * dage * personer;
    const oplevelser = d.oplevelser * dage * personer;
    const ekstra = Number(ekstraUdgifter) || 0;

    const total = fly + hotel + mad + transport + oplevelser + ekstra;
    const prPerson = Math.round(total / personer);
    const prDag = Math.round(total / dage);

    const poster = [
      { navn: l.flyRoundtrip, beloeb: fly, farve: "#3b82f6" },
      { navn: l.accommodation, beloeb: hotel, farve: "#10b981" },
      { navn: l.foodAndDrink, beloeb: mad, farve: "#f59e0b" },
      { navn: l.localTransport, beloeb: transport, farve: "#ef4444" },
      { navn: l.experiencesAndEntry, beloeb: oplevelser, farve: "#8b5cf6" },
      ...(ekstra > 0 ? [{ navn: l.extraExpensesPost, beloeb: ekstra, farve: "#6b7280" }] : []),
    ];

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("rejsebudget");
    }

    return { total, prPerson, prDag, poster, fly, hotel, mad, transport, oplevelser };
  }, [destination, rejsetype, antalDage, antalPersoner, ekstraUdgifter, l]);

  const handleReset = useCallback(() => {
    setDestination("sydeuropa");
    setRejsetype("standard");
    setAntalDage("7");
    setAntalPersoner("2");
    setEkstraUdgifter("0");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => formatCurrency(n, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{l.travelInfo}</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.destination}</label>
          <div className="space-y-2">
            {(Object.keys(DESTINATIONER) as Exclude<Destination, "custom">[]).map((key) => (
              <button key={key} onClick={() => setDestination(key)}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-sm transition-colors ${
                  destination === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {destLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.travelType}</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(REJSETYPER) as [Rejsetype, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setRejsetype(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  rejsetype === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="antalDage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l.numDays}</label>
            <input id="antalDage" type="number" value={antalDage} onChange={(e) => setAntalDage(e.target.value)}
              min="1" max="60"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="antalPersoner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{l.numPersons}</label>
            <input id="antalPersoner" type="number" value={antalPersoner} onChange={(e) => setAntalPersoner(e.target.value)}
              min="1" max="20"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label htmlFor="ekstraUdgifter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.extraExpenses}
          </label>
          <div className="relative">
            <input id="ekstraUdgifter" type="number" value={ekstraUdgifter} onChange={(e) => setEkstraUdgifter(e.target.value)}
              placeholder="0" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">{l.totalBudget}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`${l.totalBudget}: ${formatKr(resultat.total)} (${formatKr(resultat.prPerson)}/${l.perPerson}, ${formatKr(resultat.prDag)}/${l.perDay}).`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Rejsebudget" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.total}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.total)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.perPerson}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prPerson)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.perDay}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prDag)}</p>
              </div>
            </div>
          </div>

          {/* Udgiftsfordeling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.expenseBreakdown}</h3>
            <div className="space-y-3">
              {resultat.poster.map((post) => (
                <div key={post.navn}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{post.navn}</span>
                    <span className="text-sm font-medium dark:text-white">{formatKr(post.beloeb)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all"
                      style={{ width: `${(post.beloeb / resultat.total) * 100}%`, backgroundColor: post.farve }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daglig udgift */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.dailyBudget}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">{l.accommodation}</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.hotel / Math.max(1, Number(antalDage) - 1) / Math.ceil(Number(antalPersoner) / 2)))}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">{l.food}</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.mad / Number(antalDage) / Number(antalPersoner)))}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">{l.activities}</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.oplevelser / Number(antalDage) / Number(antalPersoner)))}
                </p>
              </div>
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
