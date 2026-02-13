"use client";

import { useState, useMemo } from "react";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";

export default function PensionBeregner() {
  const [alder, setAlder] = useState<number>(30);
  const [pensionsalder, setPensionsalder] = useState<number>(68);
  const [maanedligIndbetaling, setMaanedligIndbetaling] = useState<number>(3000);
  const [nuværendeOpsparing, setNuværendeOpsparing] = useState<number>(200000);
  const [forventetAfkast, setForventetAfkast] = useState<number>(5);
  const [inflation, setInflation] = useState<number>(2);
  const [udbetalingsperiode, setUdbetalingsperiode] = useState<number>(20);

  // Loading state for beregning
  const isLoading = useCalculationLoading([
    alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing, 
    forventetAfkast, inflation, udbetalingsperiode
  ]);

  const resultat = useMemo(() => {
    const aarTilPension = pensionsalder - alder;
    if (aarTilPension <= 0) return null;

    // Real afkast (efter inflation)
    const realAfkast = (1 + forventetAfkast / 100) / (1 + inflation / 100) - 1;
    const maanedligRealAfkast = realAfkast / 12;
    const antalMaaneder = aarTilPension * 12;

    // Fremtidig værdi af nuværende opsparing
    const fvNuvaerende = nuværendeOpsparing * Math.pow(1 + realAfkast, aarTilPension);

    // Fremtidig værdi af månedlige indbetalinger (annuitet)
    let fvIndbetalinger: number;
    if (maanedligRealAfkast === 0) {
      fvIndbetalinger = maanedligIndbetaling * antalMaaneder;
    } else {
      fvIndbetalinger = maanedligIndbetaling * 
        ((Math.pow(1 + maanedligRealAfkast, antalMaaneder) - 1) / maanedligRealAfkast);
    }

    const samletOpsparing = fvNuvaerende + fvIndbetalinger;

    // Månedlig udbetaling i pensionen
    const udbetalingsMaaneder = udbetalingsperiode * 12;
    let maanedligUdbetaling: number;
    if (maanedligRealAfkast === 0) {
      maanedligUdbetaling = samletOpsparing / udbetalingsMaaneder;
    } else {
      maanedligUdbetaling = samletOpsparing * 
        (maanedligRealAfkast * Math.pow(1 + maanedligRealAfkast, udbetalingsMaaneder)) /
        (Math.pow(1 + maanedligRealAfkast, udbetalingsMaaneder) - 1);
    }

    // Samlet indbetaling
    const samletIndbetalt = nuværendeOpsparing + (maanedligIndbetaling * antalMaaneder);
    const samletAfkast = samletOpsparing - samletIndbetalt;

    // Beregn ekstra scenarier
    const ekstraPr500 = 500 * 
      ((Math.pow(1 + maanedligRealAfkast, antalMaaneder) - 1) / maanedligRealAfkast);
    
    // Folkepension (2026 satser, ca.)
    const folkepensionGrundbeloeb = 6900; // månedlig
    const folkepensionTillaeg = 8200; // månedlig for enlige, ca. 4100 for samboende
    const anslaaetFolkepension = folkepensionGrundbeloeb + (folkepensionTillaeg * 0.7); // modregning antaget

    return {
      aarTilPension,
      samletOpsparing: Math.round(samletOpsparing),
      maanedligUdbetaling: Math.round(maanedligUdbetaling),
      samletIndbetalt: Math.round(samletIndbetalt),
      samletAfkast: Math.round(samletAfkast),
      ekstraPr500: Math.round(ekstraPr500),
      folkepension: Math.round(anslaaetFolkepension),
      samletMaanedlig: Math.round(maanedligUdbetaling + anslaaetFolkepension),
    };
  }, [alder, pensionsalder, maanedligIndbetaling, nuværendeOpsparing, forventetAfkast, inflation, udbetalingsperiode]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Din alder</label>
            <input
              type="number"
              min="18"
              max="70"
              value={alder}
              onChange={(e) => setAlder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ønsket pensionsalder</label>
            <input
              type="number"
              min={alder + 1}
              max="80"
              value={pensionsalder}
              onChange={(e) => setPensionsalder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Folkepensionsalder er 68 år (stigende)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nuværende pensionsopsparing</label>
            <input
              type="number"
              min="0"
              max="50000000"
              step="10000"
              value={nuværendeOpsparing}
              onChange={(e) => setNuværendeOpsparing(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">{formatKr(nuværendeOpsparing)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Månedlig indbetaling</label>
            <input
              type="number"
              min="0"
              max="100000"
              step="500"
              value={maanedligIndbetaling}
              onChange={(e) => setMaanedligIndbetaling(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Inkl. arbejdsgiverbidrag (ofte 12-17% af løn)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Forventet årligt afkast (%)</label>
            <input
              type="number"
              min="0"
              max="15"
              step="0.5"
              value={forventetAfkast}
              onChange={(e) => setForventetAfkast(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Historisk gennemsnit: 5-7% (aktier), 2-4% (obligationer)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Forventet inflation (%)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={inflation}
              onChange={(e) => setInflation(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Historisk gennemsnit: ca. 2%
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Udbetalingsperiode (år)</label>
            <select
              value={udbetalingsperiode}
              onChange={(e) => setUdbetalingsperiode(parseInt(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            >
              <option value="10">10 år</option>
              <option value="15">15 år</option>
              <option value="20">20 år</option>
              <option value="25">25 år</option>
              <option value="30">Livsvarig (ca. 30 år)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <CalculationLoading 
        isLoading={isLoading} 
        loadingText="Beregner din pension..."
        minHeight="300px"
      >
      {resultat && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Forventet månedlig pension</p>
            <p className="text-5xl font-bold text-green-600">
              {formatKr(resultat.samletMaanedlig)}
            </p>
            <p className="text-gray-500 mt-2">
              (i dag's kroner • {resultat.aarTilPension} år til pension)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-sm text-blue-600">Fra din opsparing</p>
              <p className="font-bold text-xl">{formatKr(resultat.maanedligUdbetaling)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <p className="text-sm text-purple-600">Folkepension (ca.)</p>
              <p className="font-bold text-xl">{formatKr(resultat.folkepension)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Ved pension</p>
              <p className="font-bold text-lg">{formatKr(resultat.samletOpsparing)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Indbetalt</p>
              <p className="font-bold text-lg">{formatKr(resultat.samletIndbetalt)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Afkast</p>
              <p className="font-bold text-lg text-green-600">{formatKr(resultat.samletAfkast)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">År til pension</p>
              <p className="font-bold text-lg">{resultat.aarTilPension}</p>
            </div>
          </div>
        </div>
      )}

      </CalculationLoading>

      {/* Ekstra info */}
      {resultat && !isLoading && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-medium mb-2 text-green-800">💡 Vidste du?</h3>
          <p className="text-green-700">
            Hvis du øger din månedlige indbetaling med <strong>500 kr</strong>, 
            vil din opsparing vokse med yderligere <strong>{formatKr(resultat.ekstraPr500)}</strong> til pension.
          </p>
        </div>
      )}

      {/* Aldersbaseret anbefaling */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-3 text-blue-800">📊 Tommelfingerregel: Opsparing efter alder</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">30 år</span>
            <p>1x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">40 år</span>
            <p>3x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">50 år</span>
            <p>6x årsløn opsparet</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">60 år</span>
            <p>8x årsløn opsparet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
