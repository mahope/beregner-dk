"use client";

import { useState, useMemo } from "react";

type BeregningsMode = "dage-mellem" | "tilfoej-dage" | "arbejdsdage" | "alder";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("da-DK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DatoBeregner() {
  const [mode, setMode] = useState<BeregningsMode>("dage-mellem");

  // Dage mellem mode
  const today = new Date().toISOString().split("T")[0];
  const [startDato, setStartDato] = useState<string>(today);
  const [slutDato, setSlutDato] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });

  // Tilføj dage mode
  const [baseDato, setBaseDato] = useState<string>(today);
  const [antalDage, setAntalDage] = useState<number>(30);

  // Alder mode
  const [foedselsdato, setFoedselsdato] = useState<string>("1990-01-01");

  const resultat = useMemo(() => {
    switch (mode) {
      case "dage-mellem": {
        const start = new Date(startDato);
        const slut = new Date(slutDato);
        const diffTime = slut.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(Math.abs(diffDays) / 7);
        const diffMonths = Math.round(Math.abs(diffDays) / 30.44);

        // Tæl arbejdsdage
        let arbejdsdage = 0;
        const current = new Date(start);
        while (current <= slut) {
          if (!isWeekend(current)) {
            arbejdsdage++;
          }
          current.setDate(current.getDate() + 1);
        }

        return {
          type: "dage-mellem" as const,
          dage: diffDays,
          uger: diffWeeks,
          maaneder: diffMonths,
          arbejdsdage,
          weekenddage: Math.abs(diffDays) - arbejdsdage,
        };
      }

      case "tilfoej-dage": {
        const base = new Date(baseDato);
        const resultatDato = new Date(base);
        resultatDato.setDate(resultatDato.getDate() + antalDage);

        return {
          type: "tilfoej-dage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato),
        };
      }

      case "arbejdsdage": {
        const base = new Date(baseDato);
        let dageAtTilfoeje = antalDage;
        const resultatDato = new Date(base);

        while (dageAtTilfoeje > 0) {
          resultatDato.setDate(resultatDato.getDate() + 1);
          if (!isWeekend(resultatDato)) {
            dageAtTilfoeje--;
          }
        }

        // Tæl samlede dage inkl. weekender
        const diffTime = resultatDato.getTime() - base.getTime();
        const samledeDage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          type: "arbejdsdage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato),
          samledeDage,
          weekenddage: samledeDage - antalDage,
        };
      }

      case "alder": {
        const foedt = new Date(foedselsdato);
        const nu = new Date();

        let aar = nu.getFullYear() - foedt.getFullYear();
        let maaneder = nu.getMonth() - foedt.getMonth();
        let dage = nu.getDate() - foedt.getDate();

        if (dage < 0) {
          maaneder--;
          dage += getDaysInMonth(nu.getFullYear(), nu.getMonth() - 1);
        }
        if (maaneder < 0) {
          aar--;
          maaneder += 12;
        }

        const totalDage = Math.floor(
          (nu.getTime() - foedt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalUger = Math.floor(totalDage / 7);

        // Næste fødselsdag
        const naesteFoedselsdag = new Date(
          nu.getFullYear(),
          foedt.getMonth(),
          foedt.getDate()
        );
        if (naesteFoedselsdag <= nu) {
          naesteFoedselsdag.setFullYear(naesteFoedselsdag.getFullYear() + 1);
        }
        const dageTilFoedselsdag = Math.ceil(
          (naesteFoedselsdag.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          type: "alder" as const,
          aar,
          maaneder,
          dage,
          totalDage,
          totalUger,
          dageTilFoedselsdag,
          naesteFoedselsdag: formatDate(naesteFoedselsdag),
        };
      }

      default:
        return null;
    }
  }, [mode, startDato, slutDato, baseDato, antalDage, foedselsdato]);

  const modes = [
    {
      id: "dage-mellem" as BeregningsMode,
      label: "Dage mellem",
      desc: "Beregn dage mellem to datoer",
    },
    {
      id: "tilfoej-dage" as BeregningsMode,
      label: "Tilføj dage",
      desc: "Tilføj/træk dage fra en dato",
    },
    {
      id: "arbejdsdage" as BeregningsMode,
      label: "Arbejdsdage",
      desc: "Beregn arbejdsdage fremad",
    },
    {
      id: "alder" as BeregningsMode,
      label: "Alder",
      desc: "Beregn præcis alder",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Mode selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              mode === m.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="font-medium block">{m.label}</span>
            <span className="text-xs text-gray-500">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-gray-50 rounded-xl p-6">
        {mode === "dage-mellem" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fra dato</label>
              <input
                type="date"
                value={startDato}
                onChange={(e) => setStartDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Til dato</label>
              <input
                type="date"
                value={slutDato}
                onChange={(e) => setSlutDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        )}

        {(mode === "tilfoej-dage" || mode === "arbejdsdage") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Udgangsdato
              </label>
              <input
                type="date"
                value={baseDato}
                onChange={(e) => setBaseDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Antal {mode === "arbejdsdage" ? "arbejdsdage" : "dage"}
              </label>
              <input
                type="number"
                value={antalDage}
                onChange={(e) => setAntalDage(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Brug negativ værdi for at trække fra
              </p>
            </div>
          </div>
        )}

        {mode === "alder" && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Fødselsdato
            </label>
            <input
              type="date"
              value={foedselsdato}
              onChange={(e) => setFoedselsdato(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Resultat */}
      {resultat && (
        <>
          {resultat.type === "dage-mellem" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Antal dage</p>
                <p className="text-5xl font-bold text-blue-700">
                  {resultat.dage}
                </p>
                <p className="text-gray-600 mt-2">
                  {resultat.uger} uger og {Math.abs(resultat.dage) % 7} dage
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Uger</p>
                  <p className="text-2xl font-bold">{resultat.uger}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Ca. måneder</p>
                  <p className="text-2xl font-bold">{resultat.maaneder}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Arbejdsdage</p>
                  <p className="text-2xl font-bold text-green-600">
                    {resultat.arbejdsdage}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Weekenddage</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {resultat.weekenddage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {resultat.type === "tilfoej-dage" && (
            <div className="p-6 bg-blue-100 rounded-xl text-center">
              <p className="text-sm text-gray-600 mb-1">Resultat</p>
              <p className="text-2xl font-bold text-blue-700 capitalize">
                {resultat.formatteret}
              </p>
            </div>
          )}

          {resultat.type === "arbejdsdage" && (
            <div className="space-y-4">
              <div className="p-6 bg-green-100 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {antalDage} arbejdsdage fra nu
                </p>
                <p className="text-2xl font-bold text-green-700 capitalize">
                  {resultat.formatteret}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Kalenderdage i alt</p>
                  <p className="text-2xl font-bold">{resultat.samledeDage}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Weekenddage sprunget</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {resultat.weekenddage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {resultat.type === "alder" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-1">Din alder</p>
                <p className="text-5xl font-bold text-blue-700">
                  {resultat.aar} år
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  {resultat.maaneder} måneder og {resultat.dage} dage
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total dage</p>
                  <p className="text-xl font-bold">
                    {resultat.totalDage.toLocaleString("da-DK")}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total uger</p>
                  <p className="text-xl font-bold">
                    {resultat.totalUger.toLocaleString("da-DK")}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center col-span-2">
                  <p className="text-sm text-gray-600">Næste fødselsdag</p>
                  <p className="text-lg font-bold text-green-600">
                    Om {resultat.dageTilFoedselsdag} dage
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {resultat.naesteFoedselsdag}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
