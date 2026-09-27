"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { getIntlLocale, formatNumber } from '@/lib/format';
import {
  foegArbejdsdage,
  taellArbejdsdage,
  taellHelligdagePaaHverdag,
  taellNytarsaften,
  taellWeekender,
  type HelligdagLocale,
} from '@/lib/helligdage';
import { heleDageMellem, parseIsoDato, plusIsoMaaneder, tilIsoDato } from '@/lib/lokal-dato';
import { beregnAlder } from '@/lib/alder';

type BeregningsMode = "dage-mellem" | "tilfoej-dage" | "arbejdsdage" | "alder";

function helligdagLocale(locale: string): HelligdagLocale {
  return locale === "se" ? "se" : "da";
}

function formatDate(date: Date, intlLocale: string): string {
  return date.toLocaleDateString(intlLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Kort dato til deleteksten: "27. september 2026". Uden ugedagsnavn, fordi
 * teksten skal kunne ligge i én linje i en mail eller en besked.
 */
function formatDateShort(date: Date, intlLocale: string): string {
  return date.toLocaleDateString(intlLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const labels = {
  da: {
    modeDageMellemLabel: "Dage mellem",
    modeDageMellemDesc: "Beregn dage mellem to datoer",
    modeTilfoejLabel: "Tilføj dage",
    modeTilfoejDesc: "Tilføj/træk dage fra en dato",
    modeArbejdsdageLabel: "Arbejdsdage",
    modeArbejdsdageDesc: "Beregn arbejdsdage fremad",
    modeAlderLabel: "Alder",
    modeAlderDesc: "Beregn præcis alder",
    fraDato: "Fra dato",
    tilDato: "Til dato",
    udgangsdato: "Udgangsdato",
    antal: "Antal",
    arbejdsdageWord: "arbejdsdage",
    dageWord: "dage",
    dageSuffix: "dage",
    negativHint: "Brug negativ værdi for at trække fra",
    foedselsdato: "Fødselsdato",
    antalDage: "Antal dage",
    ugerWord: "uger",
    ogWord: "og",
    uger: "Uger",
    caMaaneder: "Ca. måneder",
    arbejdsdage: "Arbejdsdage",
    fridage: "Weekenddage",
    helligdage: "Helligdage",
    resultat: "Resultat",
    arbejdsdageFra: "arbejdsdage fra",
    kalenderdageIAlt: "Kalenderdage i alt",
    fridageSprunget: "Weekenddage sprunget",
    helligdageIPerioden: "helligdage i perioden",
    nytarsaftenNote:
      "Nytårsaften er ikke en officiel helligdag og tælles heller ikke som arbejdsdag. Derfor ligger der {n} dag i antal dage, som ikke er fordelt på felterne ovenfor.",
    dinAlder: "Din alder",
    aarWord: "år",
    maanederWord: "måneder",
    totalDage: "Total dage",
    totalUger: "Total uger",
    naesteFoedselsdag: "Næste fødselsdag",
    om: "Om",
    dageMellem: "mellem",
    dagEntyd: "dag",
    fra: "fra",
    foer: "før",
    aarSummary: "år",
    mdrSummary: "mdr",
    dageSummary: "dage",
    calculatorName: "Datoberegner",
  },
  se: {
    modeDageMellemLabel: "Dagar mellan",
    modeDageMellemDesc: "Beräkna dagar mellan två datum",
    modeTilfoejLabel: "Lägg till dagar",
    modeTilfoejDesc: "Lägg till/dra av dagar från ett datum",
    modeArbejdsdageLabel: "Arbetsdagar",
    modeArbejdsdageDesc: "Beräkna arbetsdagar framåt",
    modeAlderLabel: "Ålder",
    modeAlderDesc: "Beräkna exakt ålder",
    fraDato: "Från datum",
    tilDato: "Till datum",
    udgangsdato: "Utgångsdatum",
    antal: "Antal",
    arbejdsdageWord: "arbetsdagar",
    dageWord: "dagar",
    dageSuffix: "dagar",
    negativHint: "Använd negativt värde för att dra av",
    foedselsdato: "Födelsedatum",
    antalDage: "Antal dagar",
    ugerWord: "veckor",
    ogWord: "och",
    uger: "Veckor",
    caMaaneder: "Ca. månader",
    arbejdsdage: "Arbetsdagar",
    fridage: "Lördagar/söndagar",
    helligdage: "Helgdagar",
    resultat: "Resultat",
    arbejdsdageFra: "arbetsdagar från",
    kalenderdageIAlt: "Kalenderdagar totalt",
    fridageSprunget: "Skippade lörd/sön",
    helligdageIPerioden: "helgdagar i perioden",
    nytarsaftenNote:
      "Nyårsafton är inte en officiell helgdag och räknas inte heller som arbetsdag. Därför finns {n} dag i antalet dagar som inte är fördelad på rutorna ovan.",
    dinAlder: "Din ålder",
    aarWord: "år",
    maanederWord: "månader",
    totalDage: "Totalt dagar",
    totalUger: "Totalt veckor",
    naesteFoedselsdag: "Nästa födelsedag",
    om: "Om",
    dageMellem: "mellan",
    dagEntyd: "dag",
    fra: "från",
    foer: "före",
    aarSummary: "år",
    mdrSummary: "mån",
    dageSummary: "dagar",
    calculatorName: "Datumberäknare",
  },
} as const;

export default function DatoBeregner() {
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [mode, setMode] = useState<BeregningsMode>("dage-mellem");

  // Dage mellem mode. Datoerne er kalenderdatoer i læserens egen tidszone:
  // `toISOString()` skriver dem i UTC, så en dansk læser kl. 01.00 ville få
  // dagen i går som standard.
  const today = tilIsoDato(new Date());
  const [startDato, setStartDato] = useState<string>(today);
  const [slutDato, setSlutDato] = useState<string>(
    () => plusIsoMaaneder(today, 1) ?? today
  );

  // Tilføj dage mode
  const [baseDato, setBaseDato] = useState<string>(today);
  const [antalDage, setAntalDage] = useState<number>(30);

  // Alder mode
  const [foedselsdato, setFoedselsdato] = useState<string>("1990-01-01");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'dato') {
      const inputs = urlState.inputs;
      if (inputs.mode) setMode(inputs.mode);
      if (inputs.startDato) setStartDato(inputs.startDato);
      if (inputs.slutDato) setSlutDato(inputs.slutDato);
      if (inputs.baseDato) setBaseDato(inputs.baseDato);
      if (inputs.antalDage !== undefined) setAntalDage(inputs.antalDage);
      if (inputs.foedselsdato) setFoedselsdato(inputs.foedselsdato);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("dato");
    const timer = setTimeout(() => {
      trackCalculation("dato");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'dato',
      inputs: { mode, startDato, slutDato, baseDato, antalDage, foedselsdato },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [mode, startDato, slutDato, baseDato, antalDage, foedselsdato]);

  const handleReset = useCallback(() => {
    const iDag = tilIsoDato(new Date());
    setMode("dage-mellem");
    setStartDato(iDag);
    setSlutDato(plusIsoMaaneder(iDag, 1) ?? iDag);
    setBaseDato(iDag);
    setAntalDage(30);
    setFoedselsdato("1990-01-01");
  }, []);

  const resultat = useMemo(() => {
    switch (mode) {
      case "dage-mellem": {
        // Et tomt datofelt giver ingen dato at regne på, så der vises intet
        // resultat frem for "NaN dage".
        const start = parseIsoDato(startDato);
        const slut = parseIsoDato(slutDato);
        if (!start || !slut) return null;
        const diffDays = heleDageMellem(start, slut);
        const diffWeeks = Math.floor(Math.abs(diffDays) / 7);
        const diffMonths = Math.round(Math.abs(diffDays) / 30.44);
        const hl = helligdagLocale(locale);

        // Slutdatoen kan ligge før startdatoen, så intervallet sorteres før
        // tællerne kører. `dage` beholder sin fortegn, så et negativt tal stadig
        // kan trækkes fra.
        const fra = slut < start ? slut : start;
        const til = slut < start ? start : slut;

        // "Antal dage" er forskellen mellem datoerne, altså intervallet
        // [fra, til). Tællerne skal derfor starte dagen efter `fra`, ellers
        // summerer de tre dagstyper til ét mere end det store tal.
        const dagEfterFra = new Date(fra);
        dagEfterFra.setDate(dagEfterFra.getDate() + 1);

        const arbejdsdage = taellArbejdsdage(dagEfterFra, til, hl);
        // En helligdag på en lørdag eller søndag tælles som weekenddag, ellers
        // tælles samme dag to gange, og felterne kan så summere til mere end
        // "Antal dage".
        const helligdage = taellHelligdagePaaHverdag(dagEfterFra, til, hl);
        const nytarsaften = taellNytarsaften(dagEfterFra, til);

        return {
          type: "dage-mellem" as const,
          dage: diffDays,
          uger: diffWeeks,
          maaneder: diffMonths,
          arbejdsdage,
          helligdage,
          nytarsaften,
          fridage: taellWeekender(dagEfterFra, til),
        };
      }

      case "tilfoej-dage": {
        const base = parseIsoDato(baseDato);
        if (!base) return null;
        const resultatDato = new Date(base);
        resultatDato.setDate(resultatDato.getDate() + antalDage);

        return {
          type: "tilfoej-dage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato, intlLocale),
        };
      }

      case "arbejdsdage": {
        const base = parseIsoDato(baseDato);
        if (!base) return null;
        const hl = helligdagLocale(locale);
        const resultatDato = foegArbejdsdage(base, antalDage, hl);

        // Tæl samlede dage inkl. weekender
        const samledeDage = heleDageMellem(base, resultatDato);

        // Et negativt antal løber baglæns, så intervallet skal vendes for tællingerne.
        const fra = antalDage >= 0 ? base : resultatDato;
        const til = antalDage >= 0 ? resultatDato : base;

        return {
          type: "arbejdsdage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato, intlLocale),
          samledeDage,
          fridage: taellWeekender(fra, til),
          helligdage: taellHelligdagePaaHverdag(fra, til, hl),
        };
      }

      case "alder": {
        // Samme modul som `/alder` bruger, så de to værktøjer ikke kan give
        // forskellige svar på den samme fødselsdato. Et tomt eller umuligt
        // felt, og en fødselsdato i fremtiden, giver intet resultat.
        const alder = beregnAlder({
          foedselsdato,
          beregningsdato: tilIsoDato(new Date()),
        });
        if (!alder) return null;

        return {
          type: "alder" as const,
          aar: alder.aar,
          maaneder: alder.maaneder,
          dage: alder.dage,
          totalDage: alder.totalDage,
          totalUger: alder.totalUger,
          dageTilFoedselsdag: alder.dageTilFoedselsdag,
          naesteFoedselsdag: formatDate(alder.naesteFoedselsdagDato, intlLocale),
        };
      }

      default:
        return null;
    }
  }, [mode, startDato, slutDato, baseDato, antalDage, foedselsdato]);

  const baseDatoKort = useMemo(() => {
    const base = parseIsoDato(baseDato);
    return base ? formatDateShort(base, intlLocale) : "";
  }, [baseDato, intlLocale]);

  // Én tekst til både kopier og deling, så de to aldrig kan komme til at sige
  // hver sit (/moms gjorde det, før C52 lagde dem i samme kald). Et dag-tal er
  // værd intet uden de datoer det gælder, så datoerne er med i alle tre
  // datotilstande: modtageren får ellers "61 dage mellem datoer" og ingen
  // idé om hvilke.
  const resultatTekst = useMemo(() => {
    if (!resultat) return "";
    switch (resultat.type) {
      case "dage-mellem": {
        const fra = parseIsoDato(startDato);
        const til = parseIsoDato(slutDato);
        if (!fra || !til) return "";
        const antal = Math.abs(resultat.dage);
        return `${formatNumber(antal, locale)} ${antal === 1 ? l.dagEntyd : l.dageWord} ${l.dageMellem} ${formatDateShort(fra, intlLocale)} ${l.ogWord} ${formatDateShort(til, intlLocale)}`;
      }
      case "tilfoej-dage": {
        if (!baseDatoKort) return "";
        const antal = Math.abs(antalDage);
        return `${formatNumber(antal, locale)} ${antal === 1 ? l.dagEntyd : l.dageWord} ${antalDage < 0 ? l.foer : l.fra} ${baseDatoKort}`;
      }
      case "arbejdsdage": {
        if (!baseDatoKort) return "";
        const antal = Math.abs(antalDage);
        return `${formatNumber(antal, locale)} ${l.arbejdsdageWord} ${antalDage < 0 ? l.foer : l.fra} ${baseDatoKort}`;
      }
      case "alder":
        return `${formatNumber(resultat.aar, locale)} ${l.aarSummary}, ${formatNumber(resultat.maaneder, locale)} ${l.mdrSummary}, ${formatNumber(resultat.dage, locale)} ${l.dageSummary}`;
      default:
        return "";
    }
  }, [resultat, startDato, slutDato, antalDage, baseDatoKort, locale, intlLocale, l]);

  const modes = [
    {
      id: "dage-mellem" as BeregningsMode,
      label: l.modeDageMellemLabel,
      desc: l.modeDageMellemDesc,
    },
    {
      id: "tilfoej-dage" as BeregningsMode,
      label: l.modeTilfoejLabel,
      desc: l.modeTilfoejDesc,
    },
    {
      id: "arbejdsdage" as BeregningsMode,
      label: l.modeArbejdsdageLabel,
      desc: l.modeArbejdsdageDesc,
    },
    {
      id: "alder" as BeregningsMode,
      label: l.modeAlderLabel,
      desc: l.modeAlderDesc,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Mode selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modes.map((m) => (
          <button type="button"
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              mode === m.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <span className="font-medium block dark:text-gray-200">{m.label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        {mode === "dage-mellem" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dato-fra-dato" className="block text-sm font-medium mb-2 dark:text-gray-200">{l.fraDato}</label>
              <input
                id="dato-fra-dato"
                type="date"
                value={startDato}
                onChange={(e) => setStartDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="dato-til-dato" className="block text-sm font-medium mb-2 dark:text-gray-200">{l.tilDato}</label>
              <input
                id="dato-til-dato"
                type="date"
                value={slutDato}
                onChange={(e) => setSlutDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {(mode === "tilfoej-dage" || mode === "arbejdsdage") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dato-udgangsdato" className="block text-sm font-medium mb-2 dark:text-gray-200">
                {l.udgangsdato}
              </label>
              <input
                id="dato-udgangsdato"
                type="date"
                value={baseDato}
                onChange={(e) => setBaseDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="dato-antal" className="block text-sm font-medium mb-2 dark:text-gray-200">
                {l.antal} {mode === "arbejdsdage" ? l.arbejdsdageWord : l.dageWord}
              </label>
              <div className="relative">
                <input
                  id="dato-antal"
                  type="number"
                  value={antalDage}
                  onChange={(e) => setAntalDage(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-16 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{l.dageSuffix}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {l.negativHint}
              </p>
            </div>
          </div>
        )}

        {mode === "alder" && (
          <div>
            <label htmlFor="dato-foedselsdato" className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.foedselsdato}
            </label>
            <input
              id="dato-foedselsdato"
              type="date"
              value={foedselsdato}
              onChange={(e) => setFoedselsdato(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      {resultat && (
        <>
          {resultat.type === "dage-mellem" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.antalDage}</p>
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  {resultat.dage}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {resultat.uger} {l.ugerWord} {l.ogWord} {Math.abs(resultat.dage) % 7} {l.dageWord}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.uger}</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.uger}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.caMaaneder}</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.maaneder}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.arbejdsdage}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {resultat.arbejdsdage}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.fridage}</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {resultat.fridage}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.helligdage}</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {resultat.helligdage}
                  </p>
                </div>
              </div>
              {resultat.nytarsaften > 0 && locale === "da" && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {l.nytarsaftenNote.replace("{n}", String(resultat.nytarsaften))}
                </p>
              )}
            </div>
          )}

          {resultat.type === "tilfoej-dage" && (
            <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.resultat}</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 capitalize">
                {resultat.formatteret}
              </p>
            </div>
          )}

          {resultat.type === "arbejdsdage" && (
            <div className="space-y-4">
              <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {antalDage} {l.arbejdsdageFra} {baseDatoKort}
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 capitalize">
                  {resultat.formatteret}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.kalenderdageIAlt}</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.samledeDage}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.fridageSprunget}</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {resultat.fridage}
                  </p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.helligdageIPerioden}</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {resultat.helligdage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {resultat.type === "alder" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.dinAlder}</p>
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  {resultat.aar} {l.aarWord}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {resultat.maaneder} {l.maanederWord} {l.ogWord} {resultat.dage} {l.dageWord}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.totalDage}</p>
                  <p className="text-xl font-bold dark:text-gray-200">
                    {resultat.totalDage.toLocaleString(intlLocale)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.totalUger}</p>
                  <p className="text-xl font-bold dark:text-gray-200">
                    {resultat.totalUger.toLocaleString(intlLocale)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{l.naesteFoedselsdag}</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {l.om} {resultat.dageTilFoedselsdag} {l.dageWord}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {resultat.naesteFoedselsdag}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-center">
        <CopyResultButton text={resultatTekst} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calculatorName}
          resultSummary={resultatTekst || undefined}
        />
      </div>
    </div>
  );
}
