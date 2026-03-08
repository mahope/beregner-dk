"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type FestType = "hjemme" | "forsamlingshus" | "restaurant";

const PRISER = {
  hjemme: { madPrPerson: 200, lokalePris: 0, label: "Hjemme" },
  forsamlingshus: { madPrPerson: 350, lokalePris: 3500, label: "Forsamlingshus" },
  restaurant: { madPrPerson: 550, lokalePris: 0, label: "Restaurant" },
};

const FASTE_POSTER = {
  kirke: 0,
  konfirmandToej: 2500,
  fotograf: 1500,
  pynt: 800,
  invitation: 300,
  kage: 500,
};

const GAVEGENNEMSNIT = {
  foraeldre: 3000,
  bedsteforaeldre: 1500,
  oevrigFamilie: 700,
  venner: 300,
};

export default function KonfirmationBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      udgifterTilKonfirmation: "Udgifter til konfirmation",
      antalGaester: "Antal g\u00e6ster",
      typeFest: "Type fest",
      hjemme: "Hjemme",
      forsamlingshus: "Forsamlingshus",
      restaurant: "Restaurant",
      prPersonMad: "pr. person for mad og drikke",
      konfirmandtoej: "Konfirmandt\u00f8j",
      fotograf: "Fotograf",
      oevrigeUdgifter: "\u00d8vrige udgifter (underholdning, transport mv.)",
      forventedeGaver: "Forventede gaver",
      gaveDescription: "Baseret p\u00e5 gennemsnitlige gavebel\u00f8b i Danmark. Juster antal efter din situation.",
      foraeldre: "For\u00e6ldre",
      bedsteforaeldre: "Bedstefor\u00e6ldre",
      oevrigFamilie: "\u00d8vrig familie",
      venner: "Venner",
      samletBudget: "Samlet budget",
      samledeUdgifter: "Samlede udgifter",
      prGaest: "Pr. g\u00e6st",
      forventedeGaverLabel: "Forventede gaver",
      konfirmandenKanForvente: "Konfirmanden kan forvente ca.",
      efterUdgifter: "efter udgifter",
      underskudPaa: "Underskud p\u00e5 ca.",
      udgifterOverstiger: "\u2014 udgifter overstiger gaver",
      udgiftsfordeling: "Udgiftsfordeling",
      forventedeGaveindtaegter: "Forventede gaveindtaegter",
      iAlt: "I alt",
      gaveEstimat: "Gavebel\u00f8b er gennemsnitlige estimater. Faktiske bel\u00f8b varierer.",
      prisEstimat: "Priserne er vejledende estimater for 2026. Faktiske priser afh\u00e6nger af sted, valg og leverand\u00f8r.",
      madOgDrikke: "Mad og drikke",
      lokale: "Lokale",
      konfirmandtoejPost: "Konfirmandt\u00f8j",
      fotografPost: "Fotograf",
      pyntOgDekoration: "Pynt og dekoration",
      invitationer: "Invitationer",
      kage: "Kage",
      oevrigeUdgifterPost: "\u00d8vrige udgifter",
      ca: "ca.",
      stk: "/stk",
    },
    se: {
      udgifterTilKonfirmation: "Utgifter f\u00f6r konfirmation",
      antalGaester: "Antal g\u00e4ster",
      typeFest: "Typ av fest",
      hjemme: "Hemma",
      forsamlingshus: "Samlingslokal",
      restaurant: "Restaurang",
      prPersonMad: "per person f\u00f6r mat och dryck",
      konfirmandtoej: "Konfirmandkl\u00e4der",
      fotograf: "Fotograf",
      oevrigeUdgifter: "\u00d6vriga utgifter (underh\u00e5llning, transport m.m.)",
      forventedeGaver: "F\u00f6rv\u00e4ntade g\u00e5vor",
      gaveDescription: "Baserat p\u00e5 genomsnittliga g\u00e5vobelopp. Justera antal efter din situation.",
      foraeldre: "F\u00f6r\u00e4ldrar",
      bedsteforaeldre: "Morf\u00f6r\u00e4ldrar/Farf\u00f6r\u00e4ldrar",
      oevrigFamilie: "\u00d6vrig familj",
      venner: "V\u00e4nner",
      samletBudget: "Total budget",
      samledeUdgifter: "Totala utgifter",
      prGaest: "Per g\u00e4st",
      forventedeGaverLabel: "F\u00f6rv\u00e4ntade g\u00e5vor",
      konfirmandenKanForvente: "Konfirmanden kan f\u00f6rv\u00e4nta ca.",
      efterUdgifter: "efter utgifter",
      underskudPaa: "Underskott p\u00e5 ca.",
      udgifterOverstiger: "\u2014 utgifter \u00f6verstiger g\u00e5vor",
      udgiftsfordeling: "Utgiftsf\u00f6rdelning",
      forventedeGaveindtaegter: "F\u00f6rv\u00e4ntade g\u00e5voinkomster",
      iAlt: "Totalt",
      gaveEstimat: "G\u00e5vobelopp \u00e4r genomsnittliga uppskattningar. Faktiska belopp varierar.",
      prisEstimat: "Priserna \u00e4r v\u00e4gledande uppskattningar f\u00f6r 2026. Faktiska priser beror p\u00e5 plats, val och leverant\u00f6r.",
      madOgDrikke: "Mat och dryck",
      lokale: "Lokal",
      konfirmandtoejPost: "Konfirmandkl\u00e4der",
      fotografPost: "Fotograf",
      pyntOgDekoration: "Dekoration",
      invitationer: "Inbjudningar",
      kage: "T\u00e5rta",
      oevrigeUdgifterPost: "\u00d6vriga utgifter",
      ca: "ca.",
      stk: "/st",
    },
    no: {
      udgifterTilKonfirmation: "Utgifter til konfirmasjon",
      antalGaester: "Antall gjester",
      typeFest: "Type fest",
      hjemme: "Hjemme",
      forsamlingshus: "Forsamlingshus",
      restaurant: "Restaurant",
      prPersonMad: "per person for mat og drikke",
      konfirmandtoej: "Konfirmantklær",
      fotograf: "Fotograf",
      oevrigeUdgifter: "\u00d8vrige utgifter (underholdning, transport mv.)",
      forventedeGaver: "Forventede gaver",
      gaveDescription: "Basert p\u00e5 gjennomsnittlige gavebel\u00f8p. Juster antall etter din situasjon.",
      foraeldre: "Foreldre",
      bedsteforaeldre: "Besteforeldre",
      oevrigFamilie: "\u00d8vrig familie",
      venner: "Venner",
      samletBudget: "Samlet budsjett",
      samledeUdgifter: "Samlede utgifter",
      prGaest: "Per gjest",
      forventedeGaverLabel: "Forventede gaver",
      konfirmandenKanForvente: "Konfirmanten kan forvente ca.",
      efterUdgifter: "etter utgifter",
      underskudPaa: "Underskudd p\u00e5 ca.",
      udgifterOverstiger: "\u2014 utgifter overstiger gaver",
      udgiftsfordeling: "Utgiftsfordeling",
      forventedeGaveindtaegter: "Forventede gaveinntekter",
      iAlt: "Totalt",
      gaveEstimat: "Gavebel\u00f8p er gjennomsnittlige estimater. Faktiske bel\u00f8p varierer.",
      prisEstimat: "Prisene er veiledende estimater for 2026. Faktiske priser avhenger av sted, valg og leverand\u00f8r.",
      madOgDrikke: "Mat og drikke",
      lokale: "Lokale",
      konfirmandtoejPost: "Konfirmantklær",
      fotografPost: "Fotograf",
      pyntOgDekoration: "Pynt og dekorasjon",
      invitationer: "Invitasjoner",
      kage: "Kake",
      oevrigeUdgifterPost: "\u00d8vrige utgifter",
      ca: "ca.",
      stk: "/stk",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const festLabels: Record<string, string> = {
    hjemme: l.hjemme,
    forsamlingshus: l.forsamlingshus,
    restaurant: l.restaurant,
  };

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

    const gaveForaeldre = Number(antalForaeldre) * GAVEGENNEMSNIT.foraeldre;
    const gaveBedste = Number(antalBedsteforaeldre) * GAVEGENNEMSNIT.bedsteforaeldre;
    const gaveFamilie = Number(antalFamilie) * GAVEGENNEMSNIT.oevrigFamilie;
    const gaveVenner = Number(antalVenner) * GAVEGENNEMSNIT.venner;
    const totalGaver = gaveForaeldre + gaveBedste + gaveFamilie + gaveVenner;

    const netto = totalGaver - totalUdgifter;

    const poster = [
      { navn: l.madOgDrikke, beloeb: mad, procent: (mad / totalUdgifter) * 100 },
      ...(lokale > 0 ? [{ navn: l.lokale, beloeb: lokale, procent: (lokale / totalUdgifter) * 100 }] : []),
      { navn: l.konfirmandtoejPost, beloeb: toej, procent: (toej / totalUdgifter) * 100 },
      ...(fotograf > 0 ? [{ navn: l.fotografPost, beloeb: fotograf, procent: (fotograf / totalUdgifter) * 100 }] : []),
      { navn: l.pyntOgDekoration, beloeb: pynt, procent: (pynt / totalUdgifter) * 100 },
      { navn: l.invitationer, beloeb: invitation, procent: (invitation / totalUdgifter) * 100 },
      { navn: l.kage, beloeb: kage, procent: (kage / totalUdgifter) * 100 },
      ...(ekstra > 0 ? [{ navn: l.oevrigeUdgifterPost, beloeb: ekstra, procent: (ekstra / totalUdgifter) * 100 }] : []),
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
  }, [antalGaester, festType, inkluderFotograf, konfirmandToej, ekstraUdgifter, antalForaeldre, antalBedsteforaeldre, antalFamilie, antalVenner, l]);

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

  const formatKr = (n: number) => formatCurrency(n, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280"];

  return (
    <div className="space-y-6">
      {/* Udgifter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{l.udgifterTilKonfirmation}</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label htmlFor="antalGaester" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.antalGaester}
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
            {l.typeFest}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(PRISER) as [FestType, typeof PRISER.hjemme][]).map(([key]) => (
              <button
                key={key}
                onClick={() => setFestType(key)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  festType === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {festLabels[key]}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {l.ca} {formatKr(PRISER[festType].madPrPerson)} {l.prPersonMad}
          </p>
        </div>

        <div>
          <label htmlFor="konfirmandToej" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.konfirmandtoej}
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
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
            {l.fotograf} ({formatKr(FASTE_POSTER.fotograf)})
          </label>
        </div>

        <div>
          <label htmlFor="ekstraUdgifter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.oevrigeUdgifter}
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
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
          </div>
        </div>
      </div>

      {/* Gaveberegner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold dark:text-white">{l.forventedeGaver}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {l.gaveDescription}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="antalForaeldre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {l.foraeldre} ({l.ca} {formatKr(GAVEGENNEMSNIT.foraeldre)}{l.stk})
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
              {l.bedsteforaeldre} ({l.ca} {formatKr(GAVEGENNEMSNIT.bedsteforaeldre)}{l.stk})
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
              {l.oevrigFamilie} ({l.ca} {formatKr(GAVEGENNEMSNIT.oevrigFamilie)}{l.stk})
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
              {l.venner} ({l.ca} {formatKr(GAVEGENNEMSNIT.venner)}{l.stk})
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
                {l.samletBudget}
              </h3>
              <div className="flex gap-2">
                <CopyResultButton
                  text={`${l.samletBudget}: ${formatKr(resultat.totalUdgifter)} (${formatKr(resultat.prPerson)}/${l.prGaest}). ${l.forventedeGaverLabel}: ${formatKr(resultat.totalGaver)}.`}
                />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Konfirmation" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.samledeUdgifter}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalUdgifter)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.prGaest}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.prPerson)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{l.forventedeGaverLabel}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalGaver)}</p>
              </div>
            </div>

            <div className={`mt-4 rounded-lg px-4 py-3 ${resultat.netto >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              <p className={`text-sm font-medium ${resultat.netto >= 0 ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}>
                {resultat.netto >= 0
                  ? `${l.konfirmandenKanForvente} ${formatKr(resultat.netto)} ${l.efterUdgifter}`
                  : `${l.underskudPaa} ${formatKr(Math.abs(resultat.netto))} ${l.udgifterOverstiger}`}
              </p>
            </div>
          </div>

          {/* Udgiftsfordeling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.udgiftsfordeling}</h3>
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
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.forventedeGaveindtaegter}</h3>
            <div className="space-y-2">
              {[
                { navn: l.foraeldre, beloeb: resultat.gaveForaeldre },
                { navn: l.bedsteforaeldre, beloeb: resultat.gaveBedste },
                { navn: l.oevrigFamilie, beloeb: resultat.gaveFamilie },
                { navn: l.venner, beloeb: resultat.gaveVenner },
              ].map((g) => (
                <div key={g.navn} className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400">{g.navn}</span>
                  <span className="font-medium dark:text-white">{formatKr(g.beloeb)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold">
                <span className="dark:text-white">{l.iAlt}</span>
                <span className="text-green-600 dark:text-green-400">{formatKr(resultat.totalGaver)}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              {l.gaveEstimat}
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {l.prisEstimat}
          </p>
        </div>
      )}
    </div>
  );
}
