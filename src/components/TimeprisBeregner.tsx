"use client";

import { useState, useMemo } from "react";

export default function TimeprisBeregner() {
  const [beregningsType, setBeregningsType] = useState<"fraLoen" | "fraTimepris">("fraLoen");
  
  // Fra ønsket løn
  const [oensketNettoLoen, setOensketNettoLoen] = useState<number>(35000);
  const [arbejdstimerUge, setArbejdstimerUge] = useState<number>(37);
  const [ferieUger, setFerieUger] = useState<number>(5);
  const [sygdomsBuffer, setSygdomsBuffer] = useState<number>(5);
  const [administrativTid, setAdministrativTid] = useState<number>(20);
  const [driftsomkostninger, setDriftsomkostninger] = useState<number>(3000);
  
  // Fra timepris
  const [timepris, setTimepris] = useState<number>(600);
  const [fakturerbareTimer, setFakturerbareTimer] = useState<number>(120);

  const beregningFraLoen = useMemo(() => {
    // Beregn skattetillæg (ca. 45% effektiv skat for selvstændige)
    const skatProcent = 0.45;
    const oensketBruttoLoen = oensketNettoLoen / (1 - skatProcent);
    
    // Årlige arbejdsuger
    const arbejdsugerAar = 52 - ferieUger;
    const effektiveUger = arbejdsugerAar * (1 - sygdomsBuffer / 100);
    
    // Fakturerbare timer
    const timerUgeEfterAdmin = arbejdstimerUge * (1 - administrativTid / 100);
    const fakturerbareTimerAar = effektiveUger * timerUgeEfterAdmin;
    const fakturerbareTimerMaaned = fakturerbareTimerAar / 12;
    
    // Årlig omsætning nødvendig
    const aarligLoen = oensketBruttoLoen * 12;
    const aarligeDriftsomkostninger = driftsomkostninger * 12;
    const noedvendigOmsaetning = aarligLoen + aarligeDriftsomkostninger;
    
    // Timepris
    const beregnetTimepris = noedvendigOmsaetning / fakturerbareTimerAar;
    
    return {
      oensketBruttoLoen,
      effektiveUger,
      fakturerbareTimerAar,
      fakturerbareTimerMaaned,
      aarligLoen,
      aarligeDriftsomkostninger,
      noedvendigOmsaetning,
      beregnetTimepris,
    };
  }, [oensketNettoLoen, arbejdstimerUge, ferieUger, sygdomsBuffer, administrativTid, driftsomkostninger]);

  const beregningFraTimepris = useMemo(() => {
    const maanedligOmsaetning = timepris * fakturerbareTimer;
    const aarligOmsaetning = maanedligOmsaetning * 12;
    
    // Estimer skat (ca. 45%)
    const skatProcent = 0.45;
    const bruttoLoenMaaned = maanedligOmsaetning - driftsomkostninger;
    const nettoLoenMaaned = bruttoLoenMaaned * (1 - skatProcent);
    
    return {
      maanedligOmsaetning,
      aarligOmsaetning,
      bruttoLoenMaaned,
      nettoLoenMaaned,
      skatBeloeb: bruttoLoenMaaned * skatProcent,
    };
  }, [timepris, fakturerbareTimer, driftsomkostninger]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Valg af beregningstype */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setBeregningsType("fraLoen")}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            beregningsType === "fraLoen"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="font-medium">💰 Find din timepris</div>
          <div className="text-sm text-gray-500">Ud fra ønsket løn</div>
        </button>
        <button
          onClick={() => setBeregningsType("fraTimepris")}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            beregningsType === "fraTimepris"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="font-medium">📊 Se din indtjening</div>
          <div className="text-sm text-gray-500">Ud fra timepris</div>
        </button>
      </div>

      {beregningsType === "fraLoen" ? (
        <>
          {/* Input sektion - Fra løn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ønsket nettoløn pr. måned
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={oensketNettoLoen}
                  onChange={(e) => setOensketNettoLoen(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Hvad vil du have udbetalt?</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Arbejdstimer pr. uge
                </label>
                <input
                  type="number"
                  min="1"
                  max="80"
                  value={arbejdstimerUge}
                  onChange={(e) => setArbejdstimerUge(parseFloat(e.target.value) || 37)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ferie (uger pr. år)
                </label>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={ferieUger}
                  onChange={(e) => setFerieUger(parseFloat(e.target.value) || 5)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Buffer for sygdom/stille perioder (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={sygdomsBuffer}
                  onChange={(e) => setSygdomsBuffer(parseFloat(e.target.value) || 5)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Administrativ tid (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={administrativTid}
                  onChange={(e) => setAdministrativTid(parseFloat(e.target.value) || 20)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Salg, mails, bogføring, etc.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Driftsomkostninger pr. måned
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={driftsomkostninger}
                  onChange={(e) => setDriftsomkostninger(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Software, kontor, forsikring, etc.</p>
              </div>
            </div>
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Din anbefalede timepris</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraLoen.beregnetTimepris)}
            </p>
            <p className="text-sm opacity-75 mt-2">ekskl. moms</p>
          </div>

          {/* Detaljer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {beregningFraLoen.fakturerbareTimerMaaned.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">Timer/måned</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {beregningFraLoen.fakturerbareTimerAar.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500">Timer/år</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {formatKr(beregningFraLoen.noedvendigOmsaetning)}
              </p>
              <p className="text-sm text-gray-500">Årlig omsætning</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {formatKr(beregningFraLoen.oensketBruttoLoen)}
              </p>
              <p className="text-sm text-gray-500">Bruttoløn/måned</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Input sektion - Fra timepris */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Timepris (ekskl. moms)</label>
              <input
                type="number"
                min="0"
                step="50"
                value={timepris}
                onChange={(e) => setTimepris(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fakturerbare timer/måned</label>
              <input
                type="number"
                min="0"
                max="200"
                value={fakturerbareTimer}
                onChange={(e) => setFakturerbareTimer(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Driftsomkostninger/måned</label>
              <input
                type="number"
                min="0"
                step="500"
                value={driftsomkostninger}
                onChange={(e) => setDriftsomkostninger(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg text-lg"
              />
            </div>
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Estimeret nettoløn pr. måned</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraTimepris.nettoLoenMaaned)}
            </p>
            <p className="text-sm opacity-75 mt-2">efter skat</p>
          </div>

          {/* Detaljer */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {formatKr(beregningFraTimepris.maanedligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500">Omsætning/måned</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {formatKr(beregningFraTimepris.bruttoLoenMaaned)}
              </p>
              <p className="text-sm text-gray-500">Før skat</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-red-600">
                {formatKr(beregningFraTimepris.skatBeloeb)}
              </p>
              <p className="text-sm text-gray-500">Skat (ca. 45%)</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700">
                {formatKr(beregningFraTimepris.aarligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500">Omsætning/år</p>
            </div>
          </div>
        </>
      )}

      {/* Vejledning */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips til at sætte din timepris</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Undersøg markedspriser for din branche og kompetencer</li>
          <li>• Husk at inkludere buffer for sygdom og stille perioder</li>
          <li>• Som freelancer har du ikke betalt ferie, så indregn dette</li>
          <li>• Overvej dine driftsomkostninger: software, udstyr, forsikring</li>
          <li>• Start ikke for lavt - det er svært at hæve prisen bagefter</li>
        </ul>
      </div>

      {/* Typiske timepriser */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Typiske timepriser i Danmark (2026)</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">IT & Udvikling</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Junior udvikler: 500-700 kr</li>
                <li>Senior udvikler: 800-1.200 kr</li>
                <li>IT-konsulent: 900-1.500 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Kreativ & Marketing</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Grafisk designer: 500-800 kr</li>
                <li>Tekstforfatter: 600-1.000 kr</li>
                <li>Marketing konsulent: 700-1.200 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Rådgivning</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Konsulent: 800-1.500 kr</li>
                <li>Advokat: 1.500-3.500 kr</li>
                <li>Revisor: 900-1.800 kr</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Håndværk & Service</h4>
              <ul className="space-y-1 text-gray-600">
                <li>Håndværker: 400-600 kr</li>
                <li>Fotograf: 500-1.500 kr</li>
                <li>Underviser: 500-1.000 kr</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Priserne er vejledende og ekskl. moms. Faktiske priser afhænger af erfaring, speciale og geografi.
          </p>
        </div>
      </div>
    </div>
  );
}
