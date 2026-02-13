"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

type Koen = "mand" | "kvinde";

export default function BMIBeregner() {
  const [vaegt, setVaegt] = useState<number>(75);
  const [hoejde, setHoejde] = useState<number>(175);
  const [koen, setKoen] = useState<Koen>("mand");
  const [alder, setAlder] = useState<number>(30);
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bmi') {
      const inputs = urlState.inputs;
      if (inputs.vaegt !== undefined) setVaegt(inputs.vaegt);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.koen) setKoen(inputs.koen);
      if (inputs.alder !== undefined) setAlder(inputs.alder);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bmi',
      inputs: { vaegt, hoejde, koen, alder },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [vaegt, hoejde, koen, alder]);

  const resultat = useMemo(() => {
    if (!vaegt || !hoejde || hoejde === 0) {
      return null;
    }

    const hoejdeM = hoejde / 100;
    const bmi = vaegt / (hoejdeM * hoejdeM);

    let kategori: string;
    let farve: string;
    let beskrivelse: string;

    if (bmi < 18.5) {
      kategori = "Undervægtig";
      farve = "text-blue-600";
      beskrivelse = "Din BMI indikerer undervægt. Overvej at tale med en læge.";
    } else if (bmi < 25) {
      kategori = "Normalvægtig";
      farve = "text-green-600";
      beskrivelse = "Din BMI er inden for det normale område. Fortsæt den gode livsstil!";
    } else if (bmi < 30) {
      kategori = "Overvægtig";
      farve = "text-yellow-600";
      beskrivelse = "Din BMI indikerer overvægt. Små livsstilsændringer kan gøre en forskel.";
    } else if (bmi < 35) {
      kategori = "Fedme (klasse 1)";
      farve = "text-orange-600";
      beskrivelse = "Din BMI indikerer fedme. Overvej at tale med en læge om sunde vægttabsstrategier.";
    } else if (bmi < 40) {
      kategori = "Fedme (klasse 2)";
      farve = "text-red-500";
      beskrivelse = "Din BMI indikerer svær fedme. Det anbefales at søge professionel hjælp.";
    } else {
      kategori = "Fedme (klasse 3)";
      farve = "text-red-700";
      beskrivelse = "Din BMI indikerer meget svær fedme. Søg professionel medicinsk hjælp.";
    }

    // Beregn idealvægt (Devine formula)
    let idealVaegtMin: number;
    let idealVaegtMax: number;
    
    if (koen === "mand") {
      idealVaegtMin = 18.5 * (hoejdeM * hoejdeM);
      idealVaegtMax = 24.9 * (hoejdeM * hoejdeM);
    } else {
      idealVaegtMin = 18.5 * (hoejdeM * hoejdeM);
      idealVaegtMax = 24.9 * (hoejdeM * hoejdeM);
    }

    return {
      bmi: bmi.toFixed(1),
      kategori,
      farve,
      beskrivelse,
      idealVaegtMin: idealVaegtMin.toFixed(0),
      idealVaegtMax: idealVaegtMax.toFixed(0),
    };
  }, [vaegt, hoejde, koen, alder]);

  // Track calculation once per session when user changes values
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const timer = setTimeout(() => {
        trackCalculation("bmi");
        hasTracked.current = true;
      }, 2000); // Track after 2 seconds of having a result
      return () => clearTimeout(timer);
    }
  }, [resultat]);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Vægt (kg)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={vaegt}
              onChange={(e) => setVaegt(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Højde (cm)</label>
            <input
              type="number"
              min="100"
              max="250"
              value={hoejde}
              onChange={(e) => setHoejde(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Køn</label>
            <div className="flex gap-4">
              <button
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                👨 Mand
              </button>
              <button
                onClick={() => setKoen("kvinde")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "kvinde"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                👩 Kvinde
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Alder</label>
            <input
              type="number"
              min="18"
              max="120"
              value={alder}
              onChange={(e) => setAlder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="p-6 bg-white rounded-xl shadow-sm border">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Dit BMI</p>
            <p className={`text-5xl font-bold ${resultat.farve}`}>
              {resultat.bmi}
            </p>
            <p className={`text-xl font-medium mt-2 ${resultat.farve}`}>
              {resultat.kategori}
            </p>
          </div>

          <p className="text-gray-600 text-center mb-6">{resultat.beskrivelse}</p>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 text-center">
              Idealvægt for din højde: <strong>{resultat.idealVaegtMin} - {resultat.idealVaegtMax} kg</strong>
            </p>
          </div>

          {/* Share button */}
          <div className="mt-4 flex justify-center">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="BMI Beregner"
              resultSummary={`BMI ${resultat.bmi} - ${resultat.kategori}`}
            />
          </div>
        </div>
      )}

      {/* BMI skala */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-3">BMI kategorier (voksne)</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-600">Under 18,5</span>
            <span>Undervægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600">18,5 - 24,9</span>
            <span>Normalvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600">25,0 - 29,9</span>
            <span>Overvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600">30,0 - 34,9</span>
            <span>Fedme (klasse 1)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500">35,0 - 39,9</span>
            <span>Fedme (klasse 2)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700">40+</span>
            <span>Fedme (klasse 3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
