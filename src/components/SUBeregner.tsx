"use client";

import { useState, useMemo } from "react";

// SU-satser 2026 (estimat baseret på 2025 + regulering)
const SU_SATSER_2026 = {
  // Grundsatser pr. måned (før skat)
  udeboende: 7076,      // Udeboende
  hjemmeboende: 3044,   // Hjemmeboende
  foraelder: 8575,      // Forsørger/forælder
  
  // Fribeløb pr. år (før AM-bidrag)
  fribeloebLavt: 14943,    // Månedligt fribeløb (lav sats)
  fribeloebHoejt: 20810,   // Månedligt fribeløb (høj sats - slut/start måned)
  
  // Tillæg
  handicaptillaeg: 9463,   // Pr. måned (skattefrit)
  forsorgertillaeg: 6000,  // Pr. måned ekstra for enlige forsørgere
};

type Boligstatus = "udeboende" | "hjemmeboende" | "foraelder";

export default function SUBeregner() {
  const [boligstatus, setBoligstatus] = useState<Boligstatus>("udeboende");
  const [arbejdsindkomst, setArbejdsindkomst] = useState<number>(5000);
  const [antalMaaneder, setAntalMaaneder] = useState<number>(12);
  const [harHandicap, setHarHandicap] = useState(false);
  const [erEnligForsorger, setErEnligForsorger] = useState(false);

  const beregning = useMemo(() => {
    // Basis SU-sats
    let basisSU: number;
    switch (boligstatus) {
      case "udeboende":
        basisSU = SU_SATSER_2026.udeboende;
        break;
      case "hjemmeboende":
        basisSU = SU_SATSER_2026.hjemmeboende;
        break;
      case "foraelder":
        basisSU = SU_SATSER_2026.foraelder;
        break;
    }

    // Tillæg
    let tillaeg = 0;
    if (harHandicap) {
      tillaeg += SU_SATSER_2026.handicaptillaeg;
    }
    if (erEnligForsorger && boligstatus === "foraelder") {
      tillaeg += SU_SATSER_2026.forsorgertillaeg;
    }

    const samletBrutto = basisSU + tillaeg;

    // Skat (estimat ~38% af skattepligtig del)
    // Handicaptillæg er skattefrit
    const skattepligtigDel = samletBrutto - (harHandicap ? SU_SATSER_2026.handicaptillaeg : 0);
    const skat = skattepligtigDel * 0.38;
    const samletNetto = samletBrutto - skat;

    // Fribeløb
    const maanedligtFribeloeb = SU_SATSER_2026.fribeloebLavt;
    const aarligtFribeloeb = maanedligtFribeloeb * antalMaaneder;
    
    // Beregn om indkomst overstiger fribeløb
    const aarligArbejdsindkomst = arbejdsindkomst * 12;
    const overFribeloeb = Math.max(0, aarligArbejdsindkomst - aarligtFribeloeb);
    
    // Tilbagebetaling: 1 kr for hver 1 kr over fribeløb
    const tilbagebetaling = overFribeloeb > 0 ? overFribeloeb : 0;

    return {
      basisSU,
      tillaeg,
      samletBrutto,
      skat,
      samletNetto,
      maanedligtFribeloeb,
      aarligtFribeloeb,
      aarligArbejdsindkomst,
      overFribeloeb,
      tilbagebetaling,
      aarligSUBrutto: samletBrutto * antalMaaneder,
      aarligSUNetto: samletNetto * antalMaaneder,
    };
  }, [boligstatus, arbejdsindkomst, antalMaaneder, harHandicap, erEnligForsorger]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
      {/* Boligstatus */}
      <div>
        <label className="block text-sm font-medium mb-3">Din boligsituation</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setBoligstatus("udeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "udeboende"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">🏠 Udeboende</div>
            <div className="text-sm text-gray-500">Bor ikke hos forældre</div>
          </button>
          <button
            onClick={() => setBoligstatus("hjemmeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "hjemmeboende"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">👨‍👩‍👧 Hjemmeboende</div>
            <div className="text-sm text-gray-500">Bor hos forældre</div>
          </button>
          <button
            onClick={() => setBoligstatus("foraelder")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "foraelder"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">👶 Forsørger</div>
            <div className="text-sm text-gray-500">Har børn</div>
          </button>
        </div>
      </div>

      {/* Andre inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Forventet arbejdsindkomst (pr. måned, før skat)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            value={arbejdsindkomst}
            onChange={(e) => setArbejdsindkomst(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Antal SU-måneder i år
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={antalMaaneder}
            onChange={(e) => setAntalMaaneder(parseInt(e.target.value) || 12)}
            className="w-full px-4 py-3 border rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="handicap"
            checked={harHandicap}
            onChange={(e) => setHarHandicap(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="handicap" className="text-sm">
            Modtager handicaptillæg
          </label>
        </div>
        {boligstatus === "foraelder" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enlig"
              checked={erEnligForsorger}
              onChange={(e) => setErEnligForsorger(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="enlig" className="text-sm">
              Enlig forsørger
            </label>
          </div>
        )}
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-100 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Månedlig SU (efter skat)</p>
          <p className="text-4xl font-bold text-green-700">
            {formatKr(beregning.samletNetto)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            (før skat: {formatKr(beregning.samletBrutto)})
          </p>
        </div>
        <div className="p-6 bg-blue-50 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Årlig SU ({antalMaaneder} mdr)</p>
          <p className="text-4xl font-bold text-blue-600">
            {formatKr(beregning.aarligSUNetto)}
          </p>
        </div>
      </div>

      {/* Fribeløb warning */}
      {beregning.overFribeloeb > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
          <p className="font-medium text-red-800">⚠️ Du overskrider dit fribeløb!</p>
          <p className="text-red-700">
            Din forventede indkomst ({formatKr(beregning.aarligArbejdsindkomst)}) overstiger 
            dit fribeløb ({formatKr(beregning.aarligtFribeloeb)}) med {formatKr(beregning.overFribeloeb)}.
          </p>
          <p className="text-red-700 mt-1">
            Du skal tilbagebetale ca. <strong>{formatKr(beregning.tilbagebetaling)}</strong>
          </p>
        </div>
      )}

      {beregning.overFribeloeb <= 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-green-800">
            ✅ Du holder dig under fribeløbet! Resterende: {formatKr(beregning.aarligtFribeloeb - beregning.aarligArbejdsindkomst)}
          </p>
        </div>
      )}

      {/* Info boks */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3">SU-satser 2026 (estimat)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between py-1">
              <span>Udeboende</span>
              <span>{formatKr(SU_SATSER_2026.udeboende)}/md</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Hjemmeboende</span>
              <span>{formatKr(SU_SATSER_2026.hjemmeboende)}/md</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Forsørger</span>
              <span>{formatKr(SU_SATSER_2026.foraelder)}/md</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between py-1">
              <span>Månedligt fribeløb</span>
              <span>{formatKr(SU_SATSER_2026.fribeloebLavt)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Handicaptillæg</span>
              <span>{formatKr(SU_SATSER_2026.handicaptillaeg)}/md</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
