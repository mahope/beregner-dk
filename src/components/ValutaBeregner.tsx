"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

// Statiske fallback-kurser (DKK pr. 1 enhed)
const FALLBACK_KURSER: Record<string, { kurs: number; navn: string; symbol: string }> = {
  EUR: { kurs: 7.46, navn: "Euro", symbol: "\u20ac" },
  USD: { kurs: 7.05, navn: "US Dollar", symbol: "$" },
  GBP: { kurs: 8.85, navn: "Britiske Pund", symbol: "\u00a3" },
  SEK: { kurs: 0.64, navn: "Svenske Kroner", symbol: "kr" },
  NOK: { kurs: 0.63, navn: "Norske Kroner", symbol: "kr" },
  CHF: { kurs: 7.95, navn: "Schweizerfranc", symbol: "Fr" },
  JPY: { kurs: 0.047, navn: "Japanske Yen", symbol: "\u00a5" },
  PLN: { kurs: 1.73, navn: "Polske Zloty", symbol: "z\u0142" },
  CZK: { kurs: 0.297, navn: "Tjekkiske Koruna", symbol: "K\u010d" },
  TRY: { kurs: 0.19, navn: "Tyrkiske Lira", symbol: "\u20ba" },
  AUD: { kurs: 4.45, navn: "Australske Dollar", symbol: "A$" },
  CAD: { kurs: 4.95, navn: "Canadiske Dollar", symbol: "C$" },
  THB: { kurs: 0.21, navn: "Thailandske Baht", symbol: "\u0e3f" },
};

const VALUTA_METADATA: Record<string, { navn: string; symbol: string }> = {
  DKK: { navn: "Danske Kroner", symbol: "kr" },
  EUR: { navn: "Euro", symbol: "\u20ac" },
  USD: { navn: "US Dollar", symbol: "$" },
  GBP: { navn: "Britiske Pund", symbol: "\u00a3" },
  SEK: { navn: "Svenske Kroner", symbol: "kr" },
  NOK: { navn: "Norske Kroner", symbol: "kr" },
  CHF: { navn: "Schweizerfranc", symbol: "Fr" },
  JPY: { navn: "Japanske Yen", symbol: "\u00a5" },
  PLN: { navn: "Polske Zloty", symbol: "z\u0142" },
  CZK: { navn: "Tjekkiske Koruna", symbol: "K\u010d" },
  TRY: { navn: "Tyrkiske Lira", symbol: "\u20ba" },
  AUD: { navn: "Australske Dollar", symbol: "A$" },
  CAD: { navn: "Canadiske Dollar", symbol: "C$" },
  THB: { navn: "Thailandske Baht", symbol: "\u0e3f" },
};

// Populære valutapar for danskere
const POPULAERE_PAR = [
  { fra: "DKK", til: "EUR" },
  { fra: "DKK", til: "USD" },
  { fra: "DKK", til: "GBP" },
  { fra: "DKK", til: "SEK" },
  { fra: "DKK", til: "NOK" },
];

export default function ValutaBeregner() {
  const [beloeb, setBeloeb] = useState<number>(1000);
  const [fraValuta, setFraValuta] = useState<string>("DKK");
  const [tilValuta, setTilValuta] = useState<string>("EUR");
  const [liveKurser, setLiveKurser] = useState<Record<string, number> | null>(null);
  const [sidstOpdateret, setSidstOpdateret] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'valuta') {
      const inputs = urlState.inputs;
      if (inputs.beloeb !== undefined) setBeloeb(inputs.beloeb);
      if (inputs.fraValuta) setFraValuta(inputs.fraValuta);
      if (inputs.tilValuta) setTilValuta(inputs.tilValuta);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'valuta',
      inputs: { beloeb, fraValuta, tilValuta },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beloeb, fraValuta, tilValuta]);

  // Hent live kurser fra Frankfurter API (ECB data, gratis, ingen API-nøgle)
  useEffect(() => {
    const hentKurser = async () => {
      try {
        const res = await fetch("https://api.frankfurter.dev/v1/latest?base=DKK");
        if (!res.ok) return;
        const data = await res.json();
        // data.rates giver DKK->X kurser (1 DKK = X enheder)
        // Vi vil have X->DKK (1 enhed = Y DKK), så vi inverterer
        const kurser: Record<string, number> = {};
        for (const [code, rate] of Object.entries(data.rates)) {
          kurser[code] = 1 / (rate as number);
        }
        setLiveKurser(kurser);
        setSidstOpdateret(data.date);
        setIsLive(true);
      } catch {
        // Brug fallback-kurser
      }
    };
    hentKurser();
  }, []);

  // Kurs-opslag: live eller fallback
  const getKurs = useCallback((code: string): number => {
    if (code === "DKK") return 1;
    if (liveKurser && liveKurser[code]) return liveKurser[code];
    return FALLBACK_KURSER[code]?.kurs ?? 1;
  }, [liveKurser]);

  const beregning = useMemo(() => {
    if (fraValuta === tilValuta) {
      return { resultat: beloeb, kurs: 1 };
    }

    const fraKursDKK = getKurs(fraValuta); // 1 fra-enhed = X DKK
    const tilKursDKK = getKurs(tilValuta); // 1 til-enhed = Y DKK

    const iDKK = beloeb * fraKursDKK;
    const resultat = iDKK / tilKursDKK;
    const kurs = fraKursDKK / tilKursDKK;

    return { resultat, kurs };
  }, [beloeb, fraValuta, tilValuta, getKurs]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getValutaSymbol = (code: string) => VALUTA_METADATA[code]?.symbol || code;
  const getValutaNavn = (code: string) => VALUTA_METADATA[code]?.navn || code;

  const byttValutaer = () => {
    setFraValuta(tilValuta);
    setTilValuta(fraValuta);
  };

  const valutaOptions = ["DKK", ...Object.keys(FALLBACK_KURSER)];

  return (
    <div className="space-y-8">
      {/* Live-status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className="text-gray-500 dark:text-gray-400">
            {isLive ? "Live kurser (ECB)" : "Vejledende kurser"}
          </span>
        </div>
        {sidstOpdateret && (
          <span className="text-gray-400 dark:text-gray-500">
            Opdateret: {sidstOpdateret}
          </span>
        )}
      </div>

      {/* Populære valutapar hurtigknapper */}
      <div className="flex flex-wrap gap-2">
        {POPULAERE_PAR.map((par) => (
          <button
            key={`${par.fra}-${par.til}`}
            onClick={() => { setFraValuta(par.fra); setTilValuta(par.til); }}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              fraValuta === par.fra && tilValuta === par.til
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-400"
            }`}
          >
            {par.fra}/{par.til}
          </button>
        ))}
      </div>

      {/* Input sektion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Fra</label>
          <select
            value={fraValuta}
            onChange={(e) => setFraValuta(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
          >
            {valutaOptions.map((code) => (
              <option key={code} value={code}>
                {code} - {getValutaNavn(code)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={byttValutaer}
            className="p-3 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all dark:text-gray-300"
            title="Byt valutaer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Til</label>
          <select
            value={tilValuta}
            onChange={(e) => setTilValuta(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
          >
            {valutaOptions.map((code) => (
              <option key={code} value={code}>
                {code} - {getValutaNavn(code)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Beløb input */}
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium mb-2 dark:text-gray-200">Beløb i {fraValuta}</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            value={beloeb}
            onChange={(e) => setBeloeb(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-2xl text-center bg-white dark:bg-gray-800 dark:text-white"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            {getValutaSymbol(fraValuta)}
          </span>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-8 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {formatNumber(beloeb)} {fraValuta} svarer til
        </p>
        <p className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-400">
          {formatNumber(beregning.resultat)} {tilValuta}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Kurs: 1 {fraValuta} = {formatNumber(beregning.kurs, 4)} {tilValuta}
        </p>
      </div>

      {/* Del beregning */}
      <div className="flex justify-center">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Valutaberegner"
          resultSummary={`${formatNumber(beloeb)} ${fraValuta} = ${formatNumber(beregning.resultat)} ${tilValuta}`}
        />
      </div>

      {/* Populære omregninger */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="font-medium dark:text-white">Populære omregninger fra {fraValuta}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[100, 500, 1000, 5000].map((amount) => {
              const fraK = getKurs(fraValuta);
              const tilK = getKurs(tilValuta);
              const converted = (amount * fraK) / tilK;
              return (
                <div key={amount} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(amount, 0)} {fraValuta}</div>
                  <div className="font-semibold dark:text-white">{formatNumber(converted)} {tilValuta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kursliste */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="font-medium dark:text-white">Valutakurser (DKK pr. enhed)</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.keys(FALLBACK_KURSER).map((code) => {
              const kurs = getKurs(code);
              return (
                <button
                  key={code}
                  onClick={() => { setFraValuta("DKK"); setTilValuta(code); }}
                  className="flex justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors text-left dark:text-gray-300"
                >
                  <span>1 {code}</span>
                  <span className="font-mono">{formatNumber(kurs, kurs < 1 ? 4 : 2)} DKK</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Info boks */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Bemærk om kurser</h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          {isLive
            ? "Kurserne hentes fra ECB (Den Europæiske Centralbank) og opdateres dagligt på hverdage. "
            : "Kurserne er vejledende og opdateres ikke i realtid. "}
          Ved faktisk veksling kan kursen afvige.
          Banker og vekselkontorer tager desuden et gebyr eller spread på valutahandler.
        </p>
      </div>
    </div>
  );
}
