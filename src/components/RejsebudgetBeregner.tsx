"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Destination = "europa" | "skandinavien" | "sydeuropa" | "usa" | "asien" | "custom";
type Rejsetype = "budget" | "standard" | "luksus";

interface DestinationData {
  label: string;
  fly: number; // pr. person t/r
  hotel: Record<Rejsetype, number>; // pr. nat pr. person
  mad: Record<Rejsetype, number>; // pr. dag pr. person
  transport: number; // pr. dag pr. person
  oplevelser: number; // pr. dag pr. person
}

const DESTINATIONER: Record<Exclude<Destination, "custom">, DestinationData> = {
  europa: {
    label: "Centraleuropa (Berlin, Prag, Wien)",
    fly: 1200, hotel: { budget: 350, standard: 600, luksus: 1200 },
    mad: { budget: 200, standard: 400, luksus: 700 },
    transport: 100, oplevelser: 150,
  },
  skandinavien: {
    label: "Skandinavien (Stockholm, Oslo, Helsinki)",
    fly: 900, hotel: { budget: 500, standard: 800, luksus: 1500 },
    mad: { budget: 300, standard: 500, luksus: 900 },
    transport: 120, oplevelser: 200,
  },
  sydeuropa: {
    label: "Sydeuropa (Spanien, Italien, Grækenland)",
    fly: 1500, hotel: { budget: 300, standard: 550, luksus: 1100 },
    mad: { budget: 200, standard: 350, luksus: 650 },
    transport: 80, oplevelser: 120,
  },
  usa: {
    label: "USA (New York, LA, Florida)",
    fly: 4500, hotel: { budget: 600, standard: 1000, luksus: 2000 },
    mad: { budget: 300, standard: 500, luksus: 900 },
    transport: 200, oplevelser: 250,
  },
  asien: {
    label: "Asien (Thailand, Bali, Japan)",
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

  useEffect(() => { initScrollDepthTracking("rejsebudget"); }, []);

  const resultat = useMemo(() => {
    const dage = Number(antalDage);
    const personer = Number(antalPersoner);
    if (!dage || dage <= 0 || !personer || personer <= 0) return null;
    if (destination === "custom") return null;

    const d = DESTINATIONER[destination];
    const naetter = Math.max(0, dage - 1);

    const fly = d.fly * personer;
    const hotel = d.hotel[rejsetype] * naetter * Math.ceil(personer / 2); // 2 deler værelse
    const mad = d.mad[rejsetype] * dage * personer;
    const transport = d.transport * dage * personer;
    const oplevelser = d.oplevelser * dage * personer;
    const ekstra = Number(ekstraUdgifter) || 0;

    const total = fly + hotel + mad + transport + oplevelser + ekstra;
    const prPerson = Math.round(total / personer);
    const prDag = Math.round(total / dage);

    const poster = [
      { navn: "Fly (t/r)", beloeb: fly, farve: "#3b82f6" },
      { navn: "Overnatning", beloeb: hotel, farve: "#10b981" },
      { navn: "Mad og drikke", beloeb: mad, farve: "#f59e0b" },
      { navn: "Lokal transport", beloeb: transport, farve: "#ef4444" },
      { navn: "Oplevelser og entré", beloeb: oplevelser, farve: "#8b5cf6" },
      ...(ekstra > 0 ? [{ navn: "Ekstra udgifter", beloeb: ekstra, farve: "#6b7280" }] : []),
    ];

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("rejsebudget");
    }

    return { total, prPerson, prDag, poster, fly, hotel, mad, transport, oplevelser };
  }, [destination, rejsetype, antalDage, antalPersoner, ekstraUdgifter]);

  const handleReset = useCallback(() => {
    setDestination("sydeuropa");
    setRejsetype("standard");
    setAntalDage("7");
    setAntalPersoner("2");
    setEkstraUdgifter("0");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Rejseoplysninger</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination</label>
          <div className="space-y-2">
            {(Object.entries(DESTINATIONER) as [Exclude<Destination, "custom">, DestinationData][]).map(([key, val]) => (
              <button key={key} onClick={() => setDestination(key)}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-sm transition-colors ${
                  destination === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rejsetype</label>
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
            <label htmlFor="antalDage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Antal dage</label>
            <input id="antalDage" type="number" value={antalDage} onChange={(e) => setAntalDage(e.target.value)}
              min="1" max="60"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="antalPersoner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Antal personer</label>
            <input id="antalPersoner" type="number" value={antalPersoner} onChange={(e) => setAntalPersoner(e.target.value)}
              min="1" max="20"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <div>
          <label htmlFor="ekstraUdgifter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ekstra udgifter (shopping, souvenirs mv.)
          </label>
          <div className="relative">
            <input id="ekstraUdgifter" type="number" value={ekstraUdgifter} onChange={(e) => setEkstraUdgifter(e.target.value)}
              placeholder="0" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Samlet rejsebudget</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Rejsebudget: ${formatKr(resultat.total)} (${formatKr(resultat.prPerson)}/person, ${formatKr(resultat.prDag)}/dag).`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Rejsebudget" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.total)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. person</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prPerson)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. dag</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prDag)}</p>
              </div>
            </div>
          </div>

          {/* Udgiftsfordeling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Udgiftsfordeling</h3>
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
            <h3 className="text-lg font-semibold dark:text-white mb-4">Dagligt budget pr. person (ekskl. fly)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">Overnatning</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.hotel / Math.max(1, Number(antalDage) - 1) / Math.ceil(Number(antalPersoner) / 2)))}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">Mad</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.mad / Number(antalDage) / Number(antalPersoner)))}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400">Aktiviteter</p>
                <p className="text-lg font-bold dark:text-white">
                  {formatKr(Math.round(resultat.oplevelser / Number(antalDage) / Number(antalPersoner)))}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Priserne er estimater baseret på gennemsnitspriser i DKK for 2026. Faktiske priser varierer efter sæson, booking-tidspunkt og valg.
          </p>
        </div>
      )}
    </div>
  );
}
