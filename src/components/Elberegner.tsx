"use client";

import { useState, useMemo } from "react";

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

export default function Elberegner() {
  const [apparater, setApparater] = useState<Apparat[]>([
    { id: crypto.randomUUID(), navn: "", watt: 0, timerPerDag: 0 },
  ]);
  const [elpris, setElpris] = useState(2.5);

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
    const dagligtKwh = apparater.reduce((sum, a) => {
      return sum + (a.watt * a.timerPerDag) / 1000;
    }, 0);

    const maanedligtKwh = dagligtKwh * 30;
    const aarligtKwh = dagligtKwh * 365;

    return {
      dagligtKwh: dagligtKwh.toFixed(2),
      maanedligtKwh: maanedligtKwh.toFixed(2),
      aarligtKwh: aarligtKwh.toFixed(2),
      dagligPris: (dagligtKwh * elpris).toFixed(2),
      maanedligPris: (maanedligtKwh * elpris).toFixed(2),
      aarligPris: (aarligtKwh * elpris).toFixed(2),
    };
  }, [apparater, elpris]);

  return (
    <div className="space-y-8">
      {/* Elpris input */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">
          Din elpris (kr/kWh inkl. afgifter)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          value={elpris}
          onChange={(e) => setElpris(parseFloat(e.target.value) || 0)}
          className="w-32 px-3 py-2 border rounded-md"
        />
        <p className="text-xs text-gray-500 mt-1">
          Gennemsnitlig dansk elpris er ca. 2-3 kr/kWh inkl. alle afgifter (2026)
        </p>
      </div>

      {/* Apparater */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dine apparater</h2>

        <div className="space-y-4">
          {apparater.map((apparat, index) => (
            <div
              key={apparat.id}
              className="flex flex-wrap gap-4 items-end p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-1">
                  Apparat {index + 1}
                </label>
                <div className="flex gap-2">
                  <select
                    className="px-3 py-2 border rounded-md bg-white"
                    onChange={(e) => vaelgStandardApparat(apparat.id, e.target.value)}
                    value=""
                  >
                    <option value="">Vælg standard...</option>
                    {STANDARD_APPARATER.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.navn} ({s.watt}W)
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Eller skriv navn"
                    value={apparat.navn}
                    onChange={(e) => opdaterApparat(apparat.id, "navn", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="w-28">
                <label className="block text-sm font-medium mb-1">Watt</label>
                <input
                  type="number"
                  min="0"
                  value={apparat.watt || ""}
                  onChange={(e) =>
                    opdaterApparat(apparat.id, "watt", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>

              <div className="w-28">
                <label className="block text-sm font-medium mb-1">Timer/dag</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  value={apparat.timerPerDag || ""}
                  onChange={(e) =>
                    opdaterApparat(apparat.id, "timerPerDag", parseFloat(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="0"
                />
              </div>

              <button
                onClick={() => fjernApparat(apparat.id)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                disabled={apparater.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={tilfoejApparat}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Tilføj apparat
        </button>
      </div>

      {/* Resultater */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-50 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Dagligt forbrug</p>
          <p className="text-3xl font-bold text-gray-800">{beregninger.dagligtKwh} kWh</p>
          <p className="text-xl text-green-700 font-medium">{beregninger.dagligPris} kr</p>
        </div>

        <div className="p-6 bg-green-100 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Månedligt forbrug</p>
          <p className="text-3xl font-bold text-gray-800">{beregninger.maanedligtKwh} kWh</p>
          <p className="text-xl text-green-700 font-medium">{beregninger.maanedligPris} kr</p>
        </div>

        <div className="p-6 bg-green-200 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Årligt forbrug</p>
          <p className="text-3xl font-bold text-gray-800">{beregninger.aarligtKwh} kWh</p>
          <p className="text-2xl text-green-800 font-bold">{beregninger.aarligPris} kr</p>
        </div>
      </div>
    </div>
  );
}
