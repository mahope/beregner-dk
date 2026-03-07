"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type FestType = "hjemme" | "forsamlingshus" | "restaurant";

const PRISER = {
  hjemme: { madPrPerson: 200, lokalePris: 0, label: "Hjemme" },
  forsamlingshus: { madPrPerson: 350, lokalePris: 3500, label: "Forsamlingshus" },
  restaurant: { madPrPerson: 550, lokalePris: 0, label: "Restaurant" },
};

const FASTE_POSTER = {
  kirke: 0, // Konfirmation i kirken er gratis
  konfirmandToej: 2500,
  fotograf: 1500,
  pynt: 800,
  invitation: 300,
  kage: 500,
};

// Gennemsnitlige konfirmationsgavebeløb 2026
const GAVEGENNEMSNIT = {
  foraeldre: 3000,
  bedsteforaeldre: 1500,
  oevrigFamilie: 700,
  venner: 300,
};

export default function KonfirmationBeregner() {
  const [antalGaester, setAntalGaester] = useState<string>("30");
  const [festType, setFestType] = useState<FestType>("forsamlingshus");
  const [inkluderFotograf, setInkluderFotograf] = useState(true);
  const [konfirmandToej, setKonfirmandToej] = useState<string>(String(FASTE_POSTER.konfirmandToej));
  const [ekstraUdgifter, setEkstraUdgifter] = useState<string>("0");
  // Gaveberegner
  const [antalForaeldre, setAntalForaeldre] = useState<string>("2");
  const [antalBedsteforaeldre, setAntalBedsteforaeldre] = useState<string>("4");
  const [antalFamilie, setAntalFamilie] = useState<string>("8");
  const [antalVenner, setAntalVenner] = useState<string>("5");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "konfirmation") {
      const i = urlState.inputs;
      if (i.antalGaester !== undefined) setAntalGaester(String(i.antalGaester));
      if (i.festType !== undefined) setFestType(i.festType as FestType);
      if (i.inkluderFotograf !== undefined) setInkluderFotograf(Boolean(i.inkluderFotograf));
      if (i.konfirmandToej !== undefined) setKonfirmandToej(String(i.konfirmandToej));
      if (i.ekstraUdgifter !== undefined) setEkstraUdgifter(String(i.ekstraUdgifter));
      if (i.antalForaeldre !== undefined) setAntalForaeldre(String(i.antalForaeldre));
      if (i.antalBedsteforaeldre !== undefined) setAntalBedsteforaeldre(String(i.antalBedsteforaeldre));
      if (i.antalFamilie !== undefined) setAntalFamilie(String(i.antalFamilie));
      if (i.antalVenner !== undefined) setAntalVenner(String(i.antalVenner));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    const state: CalculationState = {
      type: "konfirmation",
      timestamp: Date.now(),
      inputs: {
        antalGaester: Number(antalGaester),
        festType,
        inkluderFotograf,
        konfirmandToej: Number(konfirmandToej),
        ekstraUdgifter: Number(ekstraUdgifter),
        antalForaeldre: Number(antalForaeldre),
        antalBedsteforaeldre: Number(antalBedsteforaeldre),
        antalFamilie: Number(antalFamilie),
        antalVenner: Number(antalVenner),
      },
    };
    return generateShareableLink(state);
  }, [antalGaester, festType, inkluderFotograf, konfirmandToej, ekstraUdgifter, antalForaeldre, antalBedsteforaeldre, antalFamilie, antalVenner]);

  useEffect(() => {
    initScrollDepthTracking("konfirmation");
  }, []);

  const resultat = useMemo(() => {
    const gaester = Number(antalGaester);
    if (!gaester || gaester <= 0) return null;

    const pris = PRISER[festType];
    const mad = gaester * pris.madPrPerson;
    const lokale = pris.lokalePris;
    const toej = Number(konfirmandToej) || 0;
    const fotograf = inkluderFotograf ? FASTE_POSTER.fotograf : 0;
    const pynt = FASTE_POSTER.pynt;
    const invitation = FASTE_POSTER.invitation;
    const kage = FASTE_POSTER.kage;
    const ekstra = Number(ekstraUdgifter) || 0;

    const totalUdgifter = mad + lokale + toej + fotograf + pynt + invitation + kage + ekstra;
    const prPerson = Math.round(totalUdgifter / gaester);

    // Gaveindtægter
    const gaveForaeldre = Number(antalForaeldre) * GAVEGENNEMSNIT.foraeldre;
    const gaveBedste = Number(antalBedsteforaeldre) * GAVEGENNEMSNIT.bedsteforaeldre;
    const gaveFamilie = Number(antalFamilie) * GAVEGENNEMSNIT.oevrigFamilie;
    const gaveVenner = Number(antalVenner) * GAVEGENNEMSNIT.venner;
    const totalGaver = gaveForaeldre + gaveBedste + gaveFamilie + gaveVenner;

    const netto = totalGaver - totalUdgifter;

    const poster = [
      { navn: "Mad og drikke", beloeb: mad, procent: (mad / totalUdgifter) * 100 },
      ...(lokale > 0 ? [{ navn: "Lokale", beloeb: lokale, procent: (lokale / totalUdgifter) * 100 }] : []),
      { navn: "Konfirmandtøj", beloeb: toej, procent: (toej / totalUdgifter) * 100 },
      ...(fotograf > 0 ? [{ navn: "Fotograf", beloeb: fotograf, procent: (fotograf / totalUdgifter) * 100 }] : []),
      { navn: "Pynt og dekoration", beloeb: pynt, procent: (pynt / totalUdgifter) * 100 },
      { navn: "Invitationer", beloeb: invitation, procent: (invitation / totalUdgifter) * 100 },
      { navn: "Kage", beloeb: kage, procent: (kage / totalUdgifter) * 100 },
      ...(ekstra > 0 ? [{ navn: "Øvrige udgifter", beloeb: ekstra, procent: (ekstra / totalUdgifter) * 100 }] : []),
    ];

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("konfirmation");
    }

    return {
      totalUdgifter,
      prPerson,
      poster,
      totalGaver,
      netto,
      gaveForaeldre,
      gaveBedste,
      gaveFamilie,
      gaveVenner,
    };
  }, [antalGaester, festType, inkluderFotograf, konfirmandToej, ekstraUdgifter, antalForaeldre, antalBedsteforaeldre, antalFamilie, antalVenner]);

  const handleReset = useCallback(() => {
    setAntalGaester("30");
    setFestType("forsamlingshus");
    setInkluderFotograf(true);
    setKonfirmandToej(String(FASTE_POSTER.konfirmandToej));
    setEkstraUdgifter("0");
    setAntalForaeldre("2");
    setAntalBedsteforaeldre("4");
    setAntalFamilie("8");
    setAntalVenner("5");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280"];

  return (
    <div className="space-y-6">
      {/* Udgifter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Udgifter til konfirmation</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label htmlFor="antalGaester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Antal gæster
          </label>
          <input
            id="antalGaester"
            type="number"
            value={antalGaester}
            onChange={(e) => setAntalGaester(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type fest
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(PRISER) as [FestType, typeof PRISER.hjemme][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setFestType(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  festType === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {val.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Ca. {formatKr(PRISER[festType].madPrPerson)} pr. person for mad og drikke
          </p>
        </div>

        <div>
          <label htmlFor="konfirmandToej" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Konfirmandtøj
          </label>
          <div className="relative">
            <input
              id="konfirmandToej"
              type="number"
              value={konfirmandToej}
              onChange={(e) => setKonfirmandToej(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="fotograf"
            type="checkbox"
            checked={inkluderFotograf}
            onChange={(e) => setInkluderFotograf(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="fotograf" className="text-sm text-gray-700 dark:text-gray-300">
            Fotograf ({formatKr(FASTE_POSTER.fotograf)})
          </label>
        </div>

        <div>
          <label htmlFor="ekstraUdgifter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Øvrige udgifter (underholdning, transport mv.)
          </label>
          <div className="relative">
            <input
              id="ekstraUdgifter"
              type="number"
              value={ekstraUdgifter}
              onChange={(e) => setEkstraUdgifter(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>
      </div>

      {/* Gaveberegner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold dark:text-white">Forventede gaver</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Baseret på gennemsnitlige gavebeløb i Danmark. Juster antal efter din situation.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="antalForaeldre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forældre (ca. {formatKr(GAVEGENNEMSNIT.foraeldre)}/stk)
            </label>
            <input
              id="antalForaeldre"
              type="number"
              value={antalForaeldre}
              onChange={(e) => setAntalForaeldre(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="antalBedsteforaeldre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bedsteforældre (ca. {formatKr(GAVEGENNEMSNIT.bedsteforaeldre)}/stk)
            </label>
            <input
              id="antalBedsteforaeldre"
              type="number"
              value={antalBedsteforaeldre}
              onChange={(e) => setAntalBedsteforaeldre(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="antalFamilie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Øvrig familie (ca. {formatKr(GAVEGENNEMSNIT.oevrigFamilie)}/stk)
            </label>
            <input
              id="antalFamilie"
              type="number"
              value={antalFamilie}
              onChange={(e) => setAntalFamilie(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="antalVenner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Venner (ca. {formatKr(GAVEGENNEMSNIT.venner)}/stk)
            </label>
            <input
              id="antalVenner"
              type="number"
              value={antalVenner}
              onChange={(e) => setAntalVenner(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
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
                Samlet budget
              </h3>
              <div className="flex gap-2">
                <CopyResultButton
                  text={`Konfirmationsbudget: ${formatKr(resultat.totalUdgifter)} (${formatKr(resultat.prPerson)}/person). Forventede gaver: ${formatKr(resultat.totalGaver)}.`}
                />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Konfirmation" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Samlede udgifter</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalUdgifter)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Pr. gæst</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prPerson)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Forventede gaver</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalGaver)}</p>
              </div>
            </div>

            <div className={`mt-4 rounded-lg px-4 py-3 ${resultat.netto >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <p className={`text-sm font-medium ${resultat.netto >= 0 ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                {resultat.netto >= 0
                  ? `Konfirmanden kan forvente ca. ${formatKr(resultat.netto)} efter udgifter`
                  : `Underskud på ca. ${formatKr(Math.abs(resultat.netto))} — udgifter overstiger gaver`}
              </p>
            </div>
          </div>

          {/* Udgiftsfordeling */}
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
                    <div
                      className="h-2.5 rounded-full transition-all"
                      style={{ width: `${post.procent}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gavefordeling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Forventede gaveindtægter</h3>
            <div className="space-y-2">
              {[
                { navn: "Forældre", beloeb: resultat.gaveForaeldre },
                { navn: "Bedsteforældre", beloeb: resultat.gaveBedste },
                { navn: "Øvrig familie", beloeb: resultat.gaveFamilie },
                { navn: "Venner", beloeb: resultat.gaveVenner },
              ].map((g) => (
                <div key={g.navn} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400">{g.navn}</span>
                  <span className="font-medium dark:text-white">{formatKr(g.beloeb)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold">
                <span className="dark:text-white">I alt</span>
                <span className="text-green-600 dark:text-green-400">{formatKr(resultat.totalGaver)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Gavebeløb er gennemsnitlige estimater. Faktiske beløb varierer.
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Priserne er vejledende estimater for 2026. Faktiske priser afhænger af sted, valg og leverandør.
          </p>
        </div>
      )}
    </div>
  );
}
