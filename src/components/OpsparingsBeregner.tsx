"use client";

import { useState, useMemo } from "react";

type Frekvens = "maanedlig" | "kvartal" | "aarlig";

export default function OpsparingsBeregner() {
  const [startBeloeb, setStartBeloeb] = useState<number>(10000);
  const [maanedligIndbetaling, setMaanedligIndbetaling] = useState<number>(1000);
  const [aarligRente, setAarligRente] = useState<number>(5);
  const [periode, setPeriode] = useState<number>(10);
  const [renteFrekvens, setRenteFrekvens] = useState<Frekvens>("aarlig");

  const beregning = useMemo(() => {
    if (periode <= 0) return null;

    const antalMaaneder = periode * 12;
    
    // Beregn periodisk rente baseret på frekvens
    let perioderPerAar: number;
    let maanederPerPeriode: number;
    
    switch (renteFrekvens) {
      case "maanedlig":
        perioderPerAar = 12;
        maanederPerPeriode = 1;
        break;
      case "kvartal":
        perioderPerAar = 4;
        maanederPerPeriode = 3;
        break;
      case "aarlig":
      default:
        perioderPerAar = 1;
        maanederPerPeriode = 12;
    }

    const periodiskRente = aarligRente / 100 / perioderPerAar;
    
    // Simuler måned for måned for præcision
    let saldo = startBeloeb;
    let samletIndskud = startBeloeb;
    let samletRente = 0;
    
    const aarligData: { aar: number; saldo: number; indskud: number; rente: number }[] = [];
    let aarligIndskudTotal = 0;
    let aarligRenteTotal = 0;

    for (let maaned = 1; maaned <= antalMaaneder; maaned++) {
      // Tilføj månedlig indbetaling
      saldo += maanedligIndbetaling;
      samletIndskud += maanedligIndbetaling;
      aarligIndskudTotal += maanedligIndbetaling;

      // Tilskriv rente hvis det er tid
      if (maaned % maanederPerPeriode === 0) {
        const renteBeloeb = saldo * periodiskRente;
        saldo += renteBeloeb;
        samletRente += renteBeloeb;
        aarligRenteTotal += renteBeloeb;
      }

      // Gem årlig data
      if (maaned % 12 === 0) {
        const aar = maaned / 12;
        aarligData.push({
          aar,
          saldo,
          indskud: samletIndskud,
          rente: samletRente,
        });
        aarligIndskudTotal = 0;
        aarligRenteTotal = 0;
      }
    }

    return {
      slutSaldo: saldo,
      samletIndskud,
      samletRente,
      aarligData,
      rentesRenteEffekt: samletRente - (startBeloeb + maanedligIndbetaling * antalMaaneder) * (aarligRente / 100) * periode / 2,
    };
  }, [startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Startbeløb (kr)
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={startBeloeb}
              onChange={(e) => setStartBeloeb(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Månedlig indbetaling (kr)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={maanedligIndbetaling}
              onChange={(e) => setMaanedligIndbetaling(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Årlig rente (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={aarligRente}
              onChange={(e) => setAarligRente(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Opsparingsperiode (år)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={periode}
              onChange={(e) => setPeriode(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Rentetilskrivning
        </label>
        <div className="flex gap-4">
          {[
            { id: "maanedlig" as Frekvens, label: "Månedlig" },
            { id: "kvartal" as Frekvens, label: "Kvartalsvis" },
            { id: "aarlig" as Frekvens, label: "Årlig" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setRenteFrekvens(f.id)}
              className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                renteFrekvens === f.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultat */}
      {beregning && (
        <>
          <div className="p-6 bg-green-100 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-1">
              Din opsparing efter {periode} år
            </p>
            <p className="text-5xl font-bold text-green-700">
              {formatKr(beregning.slutSaldo)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Samlet indskud</p>
              <p className="text-xl font-bold">{formatKr(beregning.samletIndskud)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Samlet rente</p>
              <p className="text-xl font-bold text-blue-600">
                {formatKr(beregning.samletRente)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-sm text-gray-600 mb-1">Gevinst</p>
              <p className="text-xl font-bold text-green-600">
                +{((beregning.samletRente / beregning.samletIndskud) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Årlig oversigt */}
          <details className="bg-gray-50 rounded-lg">
            <summary className="p-4 cursor-pointer font-medium">
              Se årlig udvikling
            </summary>
            <div className="p-4 pt-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">År</th>
                    <th className="py-2 pr-4 text-right">Indskud</th>
                    <th className="py-2 pr-4 text-right">Rente</th>
                    <th className="py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {beregning.aarligData.map((row) => (
                    <tr key={row.aar} className="border-b border-gray-200">
                      <td className="py-2 pr-4">{row.aar}</td>
                      <td className="py-2 pr-4 text-right">{formatKr(row.indskud)}</td>
                      <td className="py-2 pr-4 text-right text-blue-600">
                        {formatKr(row.rente)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatKr(row.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {/* Info box */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium mb-2">💡 Renters rente-effekten</h3>
            <p className="text-sm text-gray-600">
              Med renters rente tjener du ikke kun rente på dit indskud, men også
              på den rente du allerede har tjent. Over {periode} år giver dette
              en ekstra gevinst på {formatKr(beregning.samletRente)} i rente
              oveni dine indbetalinger på {formatKr(beregning.samletIndskud)}.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
