"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { InputField } from "@/components/InputField";
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
    <div className="space-y-8 print-area">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            label="Vægt (kg)"
            value={vaegt}
            onChange={setVaegt}
            min={30}
            max={300}
            required
          />

          <InputField
            label="Højde (cm)"
            value={hoejde}
            onChange={setHoejde}
            min={100}
            max={250}
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Køn</label>
            <div className="flex gap-4">
              <button
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                👨 Mand
              </button>
              <button
                onClick={() => setKoen("kvinde")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "kvinde"
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                👩 Kvinde
              </button>
            </div>
          </div>

          <InputField
            label="Alder"
            value={alder}
            onChange={setAlder}
            min={18}
            max={120}
            required
          />
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dit BMI</p>
            <p className={`text-5xl font-bold ${resultat.farve}`}>
              {resultat.bmi}
            </p>
            <p className={`text-xl font-medium mt-2 ${resultat.farve}`}>
              {resultat.kategori}
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{resultat.beskrivelse}</p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Idealvægt for din højde: <strong className="dark:text-white">{resultat.idealVaegtMin} - {resultat.idealVaegtMax} kg</strong>
            </p>
          </div>

          {/* Share and Print buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="BMI Beregner"
              resultSummary={`BMI ${resultat.bmi} - ${resultat.kategori}`}
            />
            <PrintResult
              calculatorName="BMI Beregner"
              resultSummary={`BMI ${resultat.bmi} - ${resultat.kategori}`}
            />
          </div>
        </div>
      )}

      {/* BMI skala */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3 dark:text-white">BMI kategorier (voksne)</h3>
        <div className="space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Under 18,5</span>
            <span>Undervægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">18,5 - 24,9</span>
            <span>Normalvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">25,0 - 29,9</span>
            <span>Overvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600 dark:text-orange-400">30,0 - 34,9</span>
            <span>Fedme (klasse 1)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500 dark:text-red-400">35,0 - 39,9</span>
            <span>Fedme (klasse 2)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700 dark:text-red-500">40+</span>
            <span>Fedme (klasse 3)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
