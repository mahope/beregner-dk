"use client";

import { useState, useMemo } from "react";
import { BoliglaanAffiliate } from "./AffiliateBox";
import { PrintResult } from "./PrintResult";

type LaanType = "fastforrentet" | "variabel" | "afdragsfrit";

export default function BoliglaanBeregner() {
  const [boligpris, setBoligpris] = useState<number>(3000000);
  const [udbetaling, setUdbetaling] = useState<number>(150000);
  const [rente, setRente] = useState<number>(4.5);
  const [loebetid, setLoebetid] = useState<number>(30);
  const [laanType, setLaanType] = useState<LaanType>("fastforrentet");
  const [bidragssats, setBidragssats] = useState<number>(0.75);

  const resultat = useMemo(() => {
    const laanBeloeb = boligpris - udbetaling;
    
    if (laanBeloeb <= 0 || rente <= 0 || loebetid <= 0) {
      return null;
    }

    // Beregn antal månedlige betalinger
    const antalBetalinger = loebetid * 12;
    
    // Månedlig rente inkl. bidrag
    const samletRente = rente + bidragssats;
    const maanedligRente = samletRente / 100 / 12;
    
    // Annuitetsberegning (månedlig ydelse)
    let maanedligYdelse: number;
    
    if (laanType === "afdragsfrit") {
      // Kun renter de første 10 år (typisk)
      maanedligYdelse = laanBeloeb * maanedligRente;
    } else {
      // Standard annuitetslån
      maanedligYdelse = 
        (laanBeloeb * maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger)) /
        (Math.pow(1 + maanedligRente, antalBetalinger) - 1);
    }
    
    // Samlet betaling over løbetiden
    const samletBetaling = maanedligYdelse * antalBetalinger;
    const samletRenter = samletBetaling - laanBeloeb;
    
    // Beregn første års ydelse
    const aarligYdelse = maanedligYdelse * 12;
    
    // Simpel beregning af skattefradrag (ca. 25.6% af renteudgifter for 2024)
    const foersteAarsRenter = laanBeloeb * (samletRente / 100);
    const skattefradrag = foersteAarsRenter * 0.256;
    const aarligYdelseEfterSkat = aarligYdelse - skattefradrag;
    const maanedligYdelseEfterSkat = aarligYdelseEfterSkat / 12;
    
    // Belåningsgrad
    const belaaningsgrad = (laanBeloeb / boligpris) * 100;
    
    // Vurdering
    let vurdering: { tekst: string; farve: string };
    if (belaaningsgrad > 95) {
      vurdering = { 
        tekst: "Meget høj belåning - de fleste banker kræver mindst 5% udbetaling", 
        farve: "text-red-600" 
      };
    } else if (belaaningsgrad > 80) {
      vurdering = { 
        tekst: "Over 80% belåning kræver bankgaranti eller tillægslån med højere rente", 
        farve: "text-yellow-600" 
      };
    } else if (belaaningsgrad > 60) {
      vurdering = { 
        tekst: "Normal belåningsgrad - du får adgang til realkreditlån op til 80%", 
        farve: "text-green-600" 
      };
    } else {
      vurdering = { 
        tekst: "Lav belåningsgrad - du får de bedste vilkår og laveste bidragssats", 
        farve: "text-green-700" 
      };
    }

    return {
      laanBeloeb,
      maanedligYdelse: Math.round(maanedligYdelse),
      maanedligYdelseEfterSkat: Math.round(maanedligYdelseEfterSkat),
      aarligYdelse: Math.round(aarligYdelse),
      samletBetaling: Math.round(samletBetaling),
      samletRenter: Math.round(samletRenter),
      skattefradrag: Math.round(skattefradrag),
      belaaningsgrad: belaaningsgrad.toFixed(1),
      vurdering,
    };
  }, [boligpris, udbetaling, rente, loebetid, laanType, bidragssats]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 print-area">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Boligpris</label>
            <input
              type="number"
              min="100000"
              max="50000000"
              step="50000"
              value={boligpris}
              onChange={(e) => setBoligpris(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">{formatKr(boligpris)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Udbetaling</label>
            <input
              type="number"
              min="0"
              max={boligpris}
              step="10000"
              value={udbetaling}
              onChange={(e) => setUdbetaling(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formatKr(udbetaling)} ({((udbetaling / boligpris) * 100).toFixed(1)}%)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rente (% p.a.)</label>
            <input
              type="number"
              min="0"
              max="15"
              step="0.1"
              value={rente}
              onChange={(e) => setRente(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Løbetid (år)</label>
            <select
              value={loebetid}
              onChange={(e) => setLoebetid(parseInt(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            >
              <option value="10">10 år</option>
              <option value="15">15 år</option>
              <option value="20">20 år</option>
              <option value="25">25 år</option>
              <option value="30">30 år</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Låntype</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setLaanType("fastforrentet")}
                className={`py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                  laanType === "fastforrentet"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                🔒 Fastforrentet
              </button>
              <button
                onClick={() => setLaanType("variabel")}
                className={`py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                  laanType === "variabel"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                📈 Variabel rente (F-kort)
              </button>
              <button
                onClick={() => setLaanType("afdragsfrit")}
                className={`py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                  laanType === "afdragsfrit"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                ⏸️ Afdragsfrit (10 år)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bidragssats (% p.a.)</label>
            <input
              type="number"
              min="0"
              max="3"
              step="0.05"
              value={bidragssats}
              onChange={(e) => setBidragssats(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Typisk 0.5-1.5% afhængigt af belåningsgrad</p>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Månedlig ydelse</p>
            <p className="text-5xl font-bold text-blue-600">
              {formatKr(resultat.maanedligYdelse)}
            </p>
            <p className="text-lg text-green-600 mt-2">
              Ca. {formatKr(resultat.maanedligYdelseEfterSkat)} efter skattefradrag
            </p>
          </div>

          <div className={`text-center p-4 rounded-lg bg-gray-50 mb-6 ${resultat.vurdering.farve}`}>
            <p className="font-medium">{resultat.belaaningsgrad}% belåning</p>
            <p className="text-sm mt-1">{resultat.vurdering.tekst}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Lånebeløb</p>
              <p className="font-bold text-lg">{formatKr(resultat.laanBeloeb)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Årlig ydelse</p>
              <p className="font-bold text-lg">{formatKr(resultat.aarligYdelse)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Skattefradrag/år</p>
              <p className="font-bold text-lg text-green-600">-{formatKr(resultat.skattefradrag)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Samlet betaling</p>
              <p className="font-bold text-lg">{formatKr(resultat.samletBetaling)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Heraf renter</p>
              <p className="font-bold text-lg text-red-600">{formatKr(resultat.samletRenter)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Samlet rente</p>
              <p className="font-bold text-lg">{rente + bidragssats}% p.a.</p>
            </div>
          </div>

          {/* Print button */}
          <div className="mt-6 flex justify-center">
            <PrintResult
              calculatorName="Boliglån Beregner"
              resultSummary={`Lån: ${formatKr(resultat.laanBeloeb)} • Ydelse: ${formatKr(resultat.maanedligYdelse)}/md`}
            />
          </div>
        </div>
      )}

      {/* Affiliate box - vises når brugeren har beregnet */}
      {resultat && (
        <BoliglaanAffiliate className="mt-6" />
      )}

      {/* Aktuelle renter */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-blue-800 dark:text-blue-200">📊 Typiske renter (februar 2026)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">4% fast (30 år)</span>
            <p>ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">5% fast (30 år)</span>
            <p>ca. 4.5-5.0%</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">F-kort</span>
            <p>ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Banklån</span>
            <p>ca. 5.0-7.0%</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">Renterne er vejledende. Kontakt din bank for aktuelle tilbud.</p>
      </div>
    </div>
  );
}
