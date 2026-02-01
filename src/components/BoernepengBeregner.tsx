"use client";

import { useState, useMemo } from "react";

// 2026 satser for børne- og ungeydelse (estimat baseret på 2025 + regulering)
const SATSER_2026 = {
  barn_0_2: 19476, // 0-2 år, pr. kvartal
  barn_3_6: 15420, // 3-6 år, pr. kvartal  
  barn_7_14: 12132, // 7-14 år, pr. kvartal
  unge_15_17: 12132, // 15-17 år, pr. kvartal (udbetales månedligt)
  indkomstgraense: 828100, // Årlig indkomstgrænse for aftrapning
  aftrapningPct: 0.02, // 2% aftrapning per 2.500 kr over grænsen
};

interface Barn {
  id: string;
  alder: number;
}

export default function BoernepengBeregner() {
  const [boern, setBoern] = useState<Barn[]>([
    { id: "1", alder: 5 },
  ]);
  const [husstandsIndkomst, setHusstandsIndkomst] = useState<number>(600000);
  const [enlig, setEnlig] = useState(false);

  const tilfoejBarn = () => {
    setBoern([...boern, { id: crypto.randomUUID(), alder: 0 }]);
  };

  const fjernBarn = (id: string) => {
    if (boern.length > 1) {
      setBoern(boern.filter((b) => b.id !== id));
    }
  };

  const opdaterAlder = (id: string, alder: number) => {
    setBoern(boern.map((b) => (b.id === id ? { ...b, alder } : b)));
  };

  const beregning = useMemo(() => {
    // Beregn ydelse per barn
    const ydelsePrBarn = boern.map((barn) => {
      let kvartalYdelse: number;
      let kategori: string;

      if (barn.alder <= 2) {
        kvartalYdelse = SATSER_2026.barn_0_2;
        kategori = "0-2 år";
      } else if (barn.alder <= 6) {
        kvartalYdelse = SATSER_2026.barn_3_6;
        kategori = "3-6 år";
      } else if (barn.alder <= 14) {
        kvartalYdelse = SATSER_2026.barn_7_14;
        kategori = "7-14 år";
      } else if (barn.alder <= 17) {
        kvartalYdelse = SATSER_2026.unge_15_17;
        kategori = "15-17 år";
      } else {
        kvartalYdelse = 0;
        kategori = "Over 18";
      }

      return {
        alder: barn.alder,
        kategori,
        kvartal: kvartalYdelse,
        aarlig: kvartalYdelse * 4,
        maanedlig: (kvartalYdelse * 4) / 12,
      };
    });

    // Samlet før aftrapning
    const samletAarlig = ydelsePrBarn.reduce((sum, y) => sum + y.aarlig, 0);

    // Beregn evt. aftrapning (kun for høje indkomster)
    let aftrapning = 0;
    const graense = enlig 
      ? SATSER_2026.indkomstgraense 
      : SATSER_2026.indkomstgraense; // Samme grænse, men evt. fordelt på 2

    if (husstandsIndkomst > graense) {
      const overGraense = husstandsIndkomst - graense;
      const antalTrin = Math.floor(overGraense / 2500);
      aftrapning = samletAarlig * SATSER_2026.aftrapningPct * antalTrin;
      aftrapning = Math.min(aftrapning, samletAarlig); // Kan ikke blive negativ
    }

    const samletEfterAftrapning = Math.max(0, samletAarlig - aftrapning);

    return {
      boern: ydelsePrBarn,
      samletAarlig,
      aftrapning,
      samletEfterAftrapning,
      maanedlig: samletEfterAftrapning / 12,
      kvartal: samletEfterAftrapning / 4,
    };
  }, [boern, husstandsIndkomst, enlig]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
      {/* Børn input */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Dine børn</h2>
        <div className="space-y-3">
          {boern.map((barn, index) => (
            <div key={barn.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Barn {index + 1}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={barn.alder}
                  onChange={(e) => opdaterAlder(barn.id, parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border rounded-md"
                />
                <span className="text-gray-600">år</span>
              </div>
              <span className="text-sm text-gray-500">
                ({beregning.boern[index]?.kategori})
              </span>
              {boern.length > 1 && (
                <button
                  onClick={() => fjernBarn(barn.id)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={tilfoejBarn}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Tilføj barn
        </button>
      </div>

      {/* Indkomst */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Husstandens samlede indkomst (årlig)
          </label>
          <input
            type="number"
            min="0"
            step="10000"
            value={husstandsIndkomst}
            onChange={(e) => setHusstandsIndkomst(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Bruges til at beregne evt. aftrapning (over {formatKr(SATSER_2026.indkomstgraense)})
          </p>
        </div>
        <div className="flex items-center gap-2 pt-8">
          <input
            type="checkbox"
            id="enlig"
            checked={enlig}
            onChange={(e) => setEnlig(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="enlig" className="text-sm">
            Enlig forsørger
          </label>
        </div>
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-100 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Månedlig udbetaling</p>
          <p className="text-3xl font-bold text-green-700">
            {formatKr(beregning.maanedlig)}
          </p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Kvartalsvis</p>
          <p className="text-3xl font-bold text-green-600">
            {formatKr(beregning.kvartal)}
          </p>
        </div>
        <div className="p-6 bg-blue-50 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Årlig total</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatKr(beregning.samletEfterAftrapning)}
          </p>
        </div>
      </div>

      {beregning.aftrapning > 0 && (
        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Bemærk:</strong> Din indkomst er over grænsen, så ydelsen 
            aftrappes med {formatKr(beregning.aftrapning)} årligt.
          </p>
        </div>
      )}

      {/* Satser tabel */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3">Satser 2026 (estimat)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>0-2 år</span>
            <span>{formatKr(SATSER_2026.barn_0_2)} pr. kvartal ({formatKr(SATSER_2026.barn_0_2 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between">
            <span>3-6 år</span>
            <span>{formatKr(SATSER_2026.barn_3_6)} pr. kvartal ({formatKr(SATSER_2026.barn_3_6 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between">
            <span>7-14 år</span>
            <span>{formatKr(SATSER_2026.barn_7_14)} pr. kvartal ({formatKr(SATSER_2026.barn_7_14 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between">
            <span>15-17 år</span>
            <span>{formatKr(SATSER_2026.unge_15_17)} pr. kvartal ({formatKr(SATSER_2026.unge_15_17 * 4)} årligt)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
