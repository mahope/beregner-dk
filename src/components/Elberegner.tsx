"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrencySuffix } from "@/lib/format";

interface Apparat {
  id: string;
  navn: string;
  watt: number;
  timerPerDag: number;
}

const STANDARD_APPARATER = [
  { id: "computer", navn: "Computer/laptop", watt: 150, timerPerDag: 8 },
  { id: "tv", navn: "TV", watt: 100, timerPerDag: 4 },
  { id: "koeleskab", navn: "Køleskab", watt: 40, timerPerDag: 24 },
  { id: "vaskemaskine", navn: "Vaskemaskine (per vask)", watt: 500, timerPerDag: 1 },
  { id: "opvaskemaskine", navn: "Opvaskemaskine", watt: 1800, timerPerDag: 1 },
  { id: "elkedel", navn: "Elkedel", watt: 2000, timerPerDag: 0.1 },
  { id: "stoevsuger", navn: "Støvsuger", watt: 1400, timerPerDag: 0.25 },
  { id: "haartorrer", navn: "Hårtørrer", watt: 1500, timerPerDag: 0.1 },
  { id: "ovn", navn: "Ovn", watt: 2500, timerPerDag: 0.5 },
  { id: "microovn", navn: "Mikroovn", watt: 1000, timerPerDag: 0.25 },
  { id: "toerretumbler", navn: "Tørretumbler", watt: 3000, timerPerDag: 0.5 },
  { id: "gaming-pc", navn: "Gaming PC", watt: 500, timerPerDag: 4 },
  { id: "router", navn: "Router/WiFi", watt: 10, timerPerDag: 24 },
  { id: "lampe-led", navn: "LED lampe", watt: 10, timerPerDag: 5 },
  { id: "lampe-gloede", navn: "Glødepære", watt: 60, timerPerDag: 5 },
];

const GENNNEMSNIT_KWH = {
  lejlighed1: 1600,
  lejlighed2: 2200,
  hus2: 4000,
  hus4: 5500,
};

const ELPRIS_KOMPONENTER = {
  elspot: 0.80,
  transport: 0.45,
  elafgift: 0.761,
  moms: 0,
};

export default function Elberegner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      dinElpris: "Din elpris (kr/kWh inkl. afgifter)",
      gennemsnitElpris: "Gennemsnitlig dansk elpris er ca. 2-3 kr/kWh inkl. alle afgifter (2026)",
      dineApparater: "Dine apparater",
      apparat: "Apparat",
      vaelgStandard: "Vælg standard...",
      ellerSkrivNavn: "Eller skriv navn",
      watt: "Watt",
      timerDag: "Timer/dag",
      timer: "timer",
      tilfoejApparat: "+ Tilføj apparat",
      dagligtForbrug: "Dagligt forbrug",
      maanedligtForbrug: "Månedligt forbrug",
      aarligtForbrug: "Årligt forbrug",
      forbrugPerApparat: "Forbrug per apparat",
      sammenlignGennemsnit: "Sammenlign med gennemsnitligt forbrug",
      ditForbrug: "Dit forbrug",
      vsGns: "vs. gns.",
      elprisHvadBetaler: "Din elpris: Hvad betaler du for?",
      spotpris: "Spotpris",
      transportLabel: "Transport",
      elafgift: "Elafgift",
      momsLabel: "Moms (25%)",
      andeleBeskrivelse: "Andele er baseret på gennemsnitlige priser. Din faktiske fordeling kan afvige.",
      unavngivet: "Unavngivet",
      lejlighed1: "1 pers. lejlighed",
      lejlighed2: "2 pers. lejlighed",
      hus2: "2 pers. hus",
      hus4: "4 pers. hus",
    },
    se: {
      dinElpris: "Ditt elpris (kr/kWh inkl. avgifter)",
      gennemsnitElpris: "Genomsnittligt svenskt elpris är ca. 1,5–3 kr/kWh inkl. alla avgifter (2026)",
      dineApparater: "Dina apparater",
      apparat: "Apparat",
      vaelgStandard: "Välj standard...",
      ellerSkrivNavn: "Eller skriv namn",
      watt: "Watt",
      timerDag: "Timmar/dag",
      timer: "timmar",
      tilfoejApparat: "+ Lägg till apparat",
      dagligtForbrug: "Daglig förbrukning",
      maanedligtForbrug: "Månatlig förbrukning",
      aarligtForbrug: "Årlig förbrukning",
      forbrugPerApparat: "Förbrukning per apparat",
      sammenlignGennemsnit: "Jämför med genomsnittlig förbrukning",
      ditForbrug: "Din förbrukning",
      vsGns: "vs. snitt",
      elprisHvadBetaler: "Ditt elpris: Vad betalar du för?",
      spotpris: "Spotpris",
      transportLabel: "Elnät",
      elafgift: "Energiskatt",
      momsLabel: "Moms (25%)",
      andeleBeskrivelse: "Andelar baseras på genomsnittliga priser. Din faktiska fördelning kan avvika.",
      unavngivet: "Namnlös",
      lejlighed1: "1 pers. lägenhet",
      lejlighed2: "2 pers. lägenhet",
      hus2: "2 pers. hus",
      hus4: "4 pers. hus",
    },
    no: {
      dinElpris: "Din strømpris (kr/kWh inkl. avgifter)",
      gennemsnitElpris: "Gjennomsnittlig norsk strømpris er ca. 1,5–3 kr/kWh inkl. alle avgifter (2026)",
      dineApparater: "Dine apparater",
      apparat: "Apparat",
      vaelgStandard: "Velg standard...",
      ellerSkrivNavn: "Eller skriv navn",
      watt: "Watt",
      timerDag: "Timer/dag",
      timer: "timer",
      tilfoejApparat: "+ Legg til apparat",
      dagligtForbrug: "Daglig forbruk",
      maanedligtForbrug: "Månedlig forbruk",
      aarligtForbrug: "Årlig forbruk",
      forbrugPerApparat: "Forbruk per apparat",
      sammenlignGennemsnit: "Sammenlign med gjennomsnittlig forbruk",
      ditForbrug: "Ditt forbruk",
      vsGns: "vs. gj.sn.",
      elprisHvadBetaler: "Din strømpris: Hva betaler du for?",
      spotpris: "Spotpris",
      transportLabel: "Transport",
      elafgift: "Elavgift",
      momsLabel: "Mva (25%)",
      andeleBeskrivelse: "Andeler er basert på gjennomsnittlige priser. Din faktiske fordeling kan avvike.",
      unavngivet: "Uten navn",
      lejlighed1: "1 pers. leilighet",
      lejlighed2: "2 pers. leilighet",
      hus2: "2 pers. hus",
      hus4: "4 pers. hus",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [apparater, setApparater] = useState<Apparat[]>([
    { id: crypto.randomUUID(), navn: "", watt: 0, timerPerDag: 0 },
  ]);
  const [elpris, setElpris] = useState(2.5);
  const [husstandType, setHusstandType] = useState<keyof typeof GENNNEMSNIT_KWH>("hus2");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'elberegner') {
      const inputs = urlState.inputs;
      if (inputs.elpris !== undefined) setElpris(inputs.elpris);
      if (inputs.husstandType) setHusstandType(inputs.husstandType);
      if (inputs.apparater && Array.isArray(inputs.apparater)) {
        setApparater(inputs.apparater.map((a: { navn: string; watt: number; timerPerDag: number }) => ({
          id: crypto.randomUUID(),
          navn: a.navn,
          watt: a.watt,
          timerPerDag: a.timerPerDag,
        })));
      }
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("elberegner");
    const timer = setTimeout(() => {
      trackCalculation("elberegner");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'elberegner',
      inputs: {
        elpris,
        husstandType,
        apparater: apparater.map((a) => ({ navn: a.navn, watt: a.watt, timerPerDag: a.timerPerDag })),
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [elpris, husstandType, apparater]);

  const handleReset = useCallback(() => {
    setApparater([
      { id: crypto.randomUUID(), navn: "", watt: 0, timerPerDag: 0 },
    ]);
    setElpris(2.5);
    setHusstandType("hus2");
  }, []);

  const tilfoejApparat = () => {
    setApparater([
      ...apparater,
      { id: crypto.randomUUID(), navn: "", watt: 0, timerPerDag: 0 },
    ]);
  };

  const fjernApparat = (id: string) => {
    if (apparater.length > 1) {
      setApparater(apparater.filter((a) => a.id !== id));
    }
  };

  const opdaterApparat = (id: string, felt: keyof Apparat, vaerdi: string | number) => {
    setApparater(
      apparater.map((a) => (a.id === id ? { ...a, [felt]: vaerdi } : a))
    );
  };

  const vaelgStandardApparat = (id: string, standardId: string) => {
    const standard = STANDARD_APPARATER.find((s) => s.id === standardId);
    if (standard) {
      setApparater(
        apparater.map((a) =>
          a.id === id
            ? { ...a, navn: standard.navn, watt: standard.watt, timerPerDag: standard.timerPerDag }
            : a
        )
      );
    }
  };

  const beregninger = useMemo(() => {
    const perApparat = apparater
      .filter(a => a.watt > 0 && a.timerPerDag > 0)
      .map(a => {
        const dagligKwh = (a.watt * a.timerPerDag) / 1000;
        return {
          navn: a.navn || l.unavngivet,
          dagligKwh,
          maanedligKwh: dagligKwh * 30,
          aarligKwh: dagligKwh * 365,
          maanedligPris: dagligKwh * 30 * elpris,
          aarligPris: dagligKwh * 365 * elpris,
        };
      })
      .sort((a, b) => b.aarligPris - a.aarligPris);

    const dagligtKwh = apparater.reduce((sum, a) => sum + (a.watt * a.timerPerDag) / 1000, 0);
    const maanedligtKwh = dagligtKwh * 30;
    const aarligtKwh = dagligtKwh * 365;

    const gennemsnitKwh = GENNNEMSNIT_KWH[husstandType];
    const forskelPct = gennemsnitKwh > 0 ? ((aarligtKwh - gennemsnitKwh) / gennemsnitKwh) * 100 : 0;

    const elspotAndel = ELPRIS_KOMPONENTER.elspot / elpris * 100;
    const transportAndel = ELPRIS_KOMPONENTER.transport / elpris * 100;
    const afgiftAndel = ELPRIS_KOMPONENTER.elafgift / elpris * 100;
    const momsAndel = 100 - elspotAndel - transportAndel - afgiftAndel;

    return {
      dagligtKwh: dagligtKwh.toFixed(2),
      maanedligtKwh: maanedligtKwh.toFixed(1),
      aarligtKwh: aarligtKwh.toFixed(0),
      dagligPris: (dagligtKwh * elpris).toFixed(2),
      maanedligPris: (maanedligtKwh * elpris).toFixed(0),
      aarligPris: (aarligtKwh * elpris).toFixed(0),
      perApparat,
      gennemsnitKwh,
      forskelPct,
      prisAndele: { elspot: elspotAndel, transport: transportAndel, afgift: afgiftAndel, moms: momsAndel },
    };
  }, [apparater, elpris, husstandType, l.unavngivet]);

  const husstandLabels: Record<string, string> = {
    lejlighed1: l.lejlighed1,
    lejlighed2: l.lejlighed2,
    hus2: l.hus2,
    hus4: l.hus4,
  };

  return (
    <div className="space-y-8">
      {/* Elpris input */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <label className="block text-sm font-medium mb-2 dark:text-gray-200">
          {l.dinElpris}
        </label>
        <div className="relative w-32">
          <input
            type="number"
            step="0.1"
            min="0"
            value={elpris}
            onChange={(e) => setElpris(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{getCurrencySuffix(locale)}/kWh</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {l.gennemsnitElpris}
        </p>
      </div>

      {/* Apparater */}
      <div>
        <h2 className="text-xl font-semibold mb-4 dark:text-white">{l.dineApparater}</h2>

        <div className="space-y-4">
          {apparater.map((apparat, index) => (
            <div
              key={apparat.id}
              className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                  {l.apparat} {index + 1}
                </label>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                    onChange={(e) => vaelgStandardApparat(apparat.id, e.target.value)}
                    value=""
                  >
                    <option value="">{l.vaelgStandard}</option>
                    {STANDARD_APPARATER.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.navn} ({s.watt}W)
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={l.ellerSkrivNavn}
                    value={apparat.navn}
                    onChange={(e) => opdaterApparat(apparat.id, "navn", e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="w-28">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">{l.watt}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={apparat.watt || ""}
                    onChange={(e) => opdaterApparat(apparat.id, "watt", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">W</span>
                </div>
              </div>

              <div className="w-28">
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">{l.timerDag}</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={apparat.timerPerDag || ""}
                    onChange={(e) => opdaterApparat(apparat.id, "timerPerDag", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{l.timer}</span>
                </div>
              </div>

              <button type="button"
                onClick={() => fjernApparat(apparat.id)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                disabled={apparater.length === 1}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button type="button"
          onClick={tilfoejApparat}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {l.tilfoejApparat}
        </button>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.dagligtForbrug}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{beregninger.dagligtKwh} kWh</p>
          <p className="text-xl text-green-700 dark:text-green-400 font-medium">{beregninger.dagligPris} {getCurrencySuffix(locale)}</p>
        </div>

        <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.maanedligtForbrug}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{beregninger.maanedligtKwh} kWh</p>
          <p className="text-xl text-green-700 dark:text-green-400 font-medium">{beregninger.maanedligPris} {getCurrencySuffix(locale)}</p>
        </div>

        <div className="p-6 bg-green-200 dark:bg-green-800/40 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{l.aarligtForbrug}</p>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{beregninger.aarligtKwh} kWh</p>
          <p className="text-2xl text-green-800 dark:text-green-300 font-bold">{beregninger.aarligPris} {getCurrencySuffix(locale)}</p>
        </div>
      </div>

      {/* Del beregning */}
      <div className="flex justify-center">
        <CopyResultButton text={`${beregninger.aarligtKwh} kWh/år = ${beregninger.aarligPris} ${getCurrencySuffix(locale)}/år`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Elberegner"
          resultSummary={`${beregninger.aarligtKwh} kWh/år = ${beregninger.aarligPris} ${getCurrencySuffix(locale)}/år`}
        />
      </div>

      {/* Per-apparat opdeling */}
      {beregninger.perApparat.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
            <h3 className="font-medium dark:text-white">{l.forbrugPerApparat}</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {beregninger.perApparat.map((a, i) => {
                const maxPris = beregninger.perApparat[0]?.aarligPris || 1;
                const pct = (a.aarligPris / maxPris) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="dark:text-gray-300">{a.navn}</span>
                      <span className="font-medium dark:text-white">{a.maanedligPris.toFixed(0)} {getCurrencySuffix(locale)}/md ({a.aarligPris.toFixed(0)} {getCurrencySuffix(locale)}/år)</span>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sammenligning med gennemsnit */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-medium mb-3 dark:text-white">{l.sammenlignGennemsnit}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(husstandLabels).map(([key, label]) => (
            <button type="button"
              key={key}
              onClick={() => setHusstandType(key as keyof typeof GENNNEMSNIT_KWH)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                husstandType === key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="dark:text-gray-300">{l.ditForbrug}</span>
              <span className="font-medium dark:text-white">{beregninger.aarligtKwh} kWh/år</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  beregninger.forskelPct > 10 ? "bg-red-500" : beregninger.forskelPct > 0 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (parseFloat(beregninger.aarligtKwh) / (beregninger.gennemsnitKwh * 1.5)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-right min-w-[80px]">
            <p className={`text-lg font-bold ${
              beregninger.forskelPct > 10 ? "text-red-600 dark:text-red-400" : beregninger.forskelPct > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"
            }`}>
              {beregninger.forskelPct > 0 ? "+" : ""}{beregninger.forskelPct.toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{l.vsGns} {beregninger.gennemsnitKwh} kWh</p>
          </div>
        </div>
      </div>

      {/* Elpris sammensætning */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3 dark:text-white">{l.elprisHvadBetaler}</h3>
        <div className="flex h-6 rounded-full overflow-hidden mb-3">
          <div className="bg-blue-500" style={{ width: `${beregninger.prisAndele.elspot}%` }} title={l.spotpris} />
          <div className="bg-yellow-500" style={{ width: `${beregninger.prisAndele.transport}%` }} title={l.transportLabel} />
          <div className="bg-red-400" style={{ width: `${beregninger.prisAndele.afgift}%` }} title={l.elafgift} />
          <div className="bg-purple-400" style={{ width: `${beregninger.prisAndele.moms}%` }} title={l.momsLabel} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
            <span className="dark:text-gray-300">{l.spotpris} ({ELPRIS_KOMPONENTER.elspot.toFixed(2)} {getCurrencySuffix(locale)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block" />
            <span className="dark:text-gray-300">{l.transportLabel} ({ELPRIS_KOMPONENTER.transport.toFixed(2)} {getCurrencySuffix(locale)})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
            <span className="dark:text-gray-300">{l.elafgift} ({ELPRIS_KOMPONENTER.elafgift.toFixed(3)} kr)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-purple-400 inline-block" />
            <span className="dark:text-gray-300">{l.momsLabel}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {l.andeleBeskrivelse}
        </p>
      </div>
    </div>
  );
}
