"use client";

import { useState, useMemo } from "react";

// Valutakurser (omtrentlige - opdateres i praksis fra API)
// Kurs = hvor mange DKK for 1 enhed af valutaen
const VALUTAKURSER: Record<string, { kurs: number; navn: string; symbol: string }> = {
  EUR: { kurs: 7.46, navn: "Euro", symbol: "€" },
  USD: { kurs: 7.05, navn: "US Dollar", symbol: "$" },
  GBP: { kurs: 8.85, navn: "Britiske Pund", symbol: "£" },
  SEK: { kurs: 0.64, navn: "Svenske Kroner", symbol: "kr" },
  NOK: { kurs: 0.63, navn: "Norske Kroner", symbol: "kr" },
  CHF: { kurs: 7.95, navn: "Schweizerfranc", symbol: "Fr" },
  JPY: { kurs: 0.047, navn: "Japanske Yen", symbol: "¥" },
  PLN: { kurs: 1.73, navn: "Polske Zloty", symbol: "zł" },
  CZK: { kurs: 0.297, navn: "Tjekkiske Koruna", symbol: "Kč" },
  TRY: { kurs: 0.19, navn: "Tyrkiske Lira", symbol: "₺" },
  AUD: { kurs: 4.45, navn: "Australske Dollar", symbol: "A$" },
  CAD: { kurs: 4.95, navn: "Canadiske Dollar", symbol: "C$" },
  THB: { kurs: 0.21, navn: "Thailandske Baht", symbol: "฿" },
};

export default function ValutaBeregner() {
  const [beloeb, setBeloeb] = useState<number>(1000);
  const [fraValuta, setFraValuta] = useState<string>("DKK");
  const [tilValuta, setTilValuta] = useState<string>("EUR");

  const beregning = useMemo(() => {
    if (fraValuta === tilValuta) {
      return { resultat: beloeb, kurs: 1 };
    }

    let resultat: number;
    let kurs: number;

    if (fraValuta === "DKK") {
      // DKK til fremmed valuta
      const valutaInfo = VALUTAKURSER[tilValuta];
      kurs = valutaInfo.kurs;
      resultat = beloeb / kurs;
    } else if (tilValuta === "DKK") {
      // Fremmed valuta til DKK
      const valutaInfo = VALUTAKURSER[fraValuta];
      kurs = valutaInfo.kurs;
      resultat = beloeb * kurs;
    } else {
      // Mellem to fremmede valutaer - konverter via DKK
      const fraInfo = VALUTAKURSER[fraValuta];
      const tilInfo = VALUTAKURSER[tilValuta];
      const iDKK = beloeb * fraInfo.kurs;
      resultat = iDKK / tilInfo.kurs;
      kurs = fraInfo.kurs / tilInfo.kurs;
    }

    return { resultat, kurs };
  }, [beloeb, fraValuta, tilValuta]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getValutaSymbol = (code: string) => {
    if (code === "DKK") return "kr";
    return VALUTAKURSER[code]?.symbol || code;
  };

  const getValutaNavn = (code: string) => {
    if (code === "DKK") return "Danske Kroner";
    return VALUTAKURSER[code]?.navn || code;
  };

  const byttValutaer = () => {
    setFraValuta(tilValuta);
    setTilValuta(fraValuta);
  };

  const valutaOptions = ["DKK", ...Object.keys(VALUTAKURSER)];

  return (
    <div className="space-y-8">
      {/* Input sektion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* Fra valuta */}
        <div>
          <label className="block text-sm font-medium mb-2">Fra</label>
          <select
            value={fraValuta}
            onChange={(e) => setFraValuta(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg"
          >
            {valutaOptions.map((code) => (
              <option key={code} value={code}>
                {code} - {getValutaNavn(code)}
              </option>
            ))}
          </select>
        </div>

        {/* Byt knap */}
        <div className="flex justify-center">
          <button
            onClick={byttValutaer}
            className="p-3 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            title="Byt valutaer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* Til valuta */}
        <div>
          <label className="block text-sm font-medium mb-2">Til</label>
          <select
            value={tilValuta}
            onChange={(e) => setTilValuta(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg"
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
        <label className="block text-sm font-medium mb-2">Beløb i {fraValuta}</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="any"
            value={beloeb}
            onChange={(e) => setBeloeb(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-4 border rounded-lg text-2xl text-center"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
            {getValutaSymbol(fraValuta)}
          </span>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-8 bg-green-100 rounded-xl text-center">
        <p className="text-sm text-gray-600 mb-2">
          {formatNumber(beloeb)} {fraValuta} svarer til
        </p>
        <p className="text-4xl md:text-5xl font-bold text-green-700">
          {formatNumber(beregning.resultat)} {tilValuta}
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Kurs: 1 {fraValuta} = {formatNumber(beregning.kurs, 4)} {tilValuta}
        </p>
      </div>

      {/* Populære omregninger */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Populære omregninger fra {fraValuta}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[100, 500, 1000, 5000].map((amount) => {
              let converted: number;
              if (fraValuta === "DKK" && tilValuta !== "DKK") {
                converted = amount / VALUTAKURSER[tilValuta].kurs;
              } else if (fraValuta !== "DKK" && tilValuta === "DKK") {
                converted = amount * VALUTAKURSER[fraValuta].kurs;
              } else if (fraValuta === tilValuta) {
                converted = amount;
              } else {
                const inDKK = amount * VALUTAKURSER[fraValuta].kurs;
                converted = inDKK / VALUTAKURSER[tilValuta].kurs;
              }
              return (
                <div key={amount} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">{formatNumber(amount, 0)} {fraValuta}</div>
                  <div className="font-semibold">{formatNumber(converted)} {tilValuta}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Kursliste */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Valutakurser (DKK)</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {Object.entries(VALUTAKURSER).map(([code, info]) => (
              <div key={code} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                <span>1 {code}</span>
                <span className="font-mono">{formatNumber(info.kurs, 2)} DKK</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info boks */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">⚠️ Bemærk om kurser</h3>
        <p className="text-sm text-yellow-700">
          Kurserne er vejledende og opdateres ikke i realtid. Ved faktisk veksling kan kursen afvige. 
          Banker og vekselkontorer tager desuden et gebyr eller spread på valutahandler.
          Tjek altid den aktuelle kurs hos din bank inden større transaktioner.
        </p>
      </div>
    </div>
  );
}
