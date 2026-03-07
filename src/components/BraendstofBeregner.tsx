"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

export default function BraendstofBeregner() {
  const [beregningsType, setBeregningsType] = useState<"turPris" | "kmPris" | "forbrug">("turPris");
  
  // Fælles
  const [braendstofType, setBraendstofType] = useState<"benzin" | "diesel" | "el">("benzin");
  const [literPris, setLiterPris] = useState<number>(13.5);
  const [kmPerLiter, setKmPerLiter] = useState<number>(15);
  
  // El-bil
  const [kwhPris, setKwhPris] = useState<number>(2.5);
  const [kwhPer100km, setKwhPer100km] = useState<number>(17);
  
  // Tur beregning
  const [distance, setDistance] = useState<number>(100);
  
  // Forbrugsberegning
  const [literBrugt, setLiterBrugt] = useState<number>(50);
  const [kmKoert, setKmKoert] = useState<number>(750);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'braendstof') {
      const inputs = urlState.inputs;
      if (inputs.beregningsType) setBeregningsType(inputs.beregningsType);
      if (inputs.braendstofType) setBraendstofType(inputs.braendstofType);
      if (inputs.literPris !== undefined) setLiterPris(inputs.literPris);
      if (inputs.kmPerLiter !== undefined) setKmPerLiter(inputs.kmPerLiter);
      if (inputs.kwhPris !== undefined) setKwhPris(inputs.kwhPris);
      if (inputs.kwhPer100km !== undefined) setKwhPer100km(inputs.kwhPer100km);
      if (inputs.distance !== undefined) setDistance(inputs.distance);
      if (inputs.literBrugt !== undefined) setLiterBrugt(inputs.literBrugt);
      if (inputs.kmKoert !== undefined) setKmKoert(inputs.kmKoert);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("braendstof");
    const timer = setTimeout(() => {
      trackCalculation("braendstof");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'braendstof',
      inputs: { beregningsType, braendstofType, literPris, kmPerLiter, kwhPris, kwhPer100km, distance, literBrugt, kmKoert },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beregningsType, braendstofType, literPris, kmPerLiter, kwhPris, kwhPer100km, distance, literBrugt, kmKoert]);

  const handleReset = useCallback(() => {
    setBeregningsType("turPris");
    setBraendstofType("benzin");
    setLiterPris(13.5);
    setKmPerLiter(15);
    setKwhPris(2.5);
    setKwhPer100km(17);
    setDistance(100);
    setLiterBrugt(50);
    setKmKoert(750);
  }, []);

  const beregning = useMemo(() => {
    if (braendstofType === "el") {
      // El-bil beregninger
      const forbrugPr100km = kwhPer100km;
      const kwhForTur = (distance / 100) * forbrugPr100km;
      const turPris = kwhForTur * kwhPris;
      const prisPrKm = (forbrugPr100km / 100) * kwhPris;
      
      return {
        turPris,
        prisPrKm,
        forbrugPr100km: forbrugPr100km,
        enhed: "kWh",
        braendstofForTur: kwhForTur,
      };
    }
    
    // Benzin/Diesel beregninger
    switch (beregningsType) {
      case "turPris": {
        const literForTur = distance / kmPerLiter;
        const turPris = literForTur * literPris;
        const prisPrKm = literPris / kmPerLiter;
        const forbrugPr100km = 100 / kmPerLiter;
        
        return {
          turPris,
          prisPrKm,
          forbrugPr100km,
          enhed: "liter",
          braendstofForTur: literForTur,
        };
      }
      case "kmPris": {
        const prisPrKm = literPris / kmPerLiter;
        const forbrugPr100km = 100 / kmPerLiter;
        
        return {
          turPris: distance * prisPrKm,
          prisPrKm,
          forbrugPr100km,
          enhed: "liter",
          braendstofForTur: distance / kmPerLiter,
        };
      }
      case "forbrug": {
        const beregnetKmPerLiter = kmKoert / literBrugt;
        const forbrugPr100km = 100 / beregnetKmPerLiter;
        const prisPrKm = literPris / beregnetKmPerLiter;
        
        return {
          turPris: 0,
          prisPrKm,
          forbrugPr100km,
          enhed: "liter",
          braendstofForTur: 0,
          beregnetKmPerLiter,
        };
      }
      default:
        return {
          turPris: 0,
          prisPrKm: 0,
          forbrugPr100km: 0,
          enhed: "liter",
          braendstofForTur: 0,
        };
    }
  }, [beregningsType, braendstofType, literPris, kmPerLiter, distance, kwhPris, kwhPer100km, literBrugt, kmKoert]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Brændstoftype */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-gray-200">Brændstoftype</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setBraendstofType("benzin")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "benzin"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-2xl mb-1">⛽</div>
            <div className="font-medium dark:text-gray-200">Benzin</div>
          </button>
          <button
            onClick={() => setBraendstofType("diesel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "diesel"
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-2xl mb-1">🛢️</div>
            <div className="font-medium dark:text-gray-200">Diesel</div>
          </button>
          <button
            onClick={() => setBraendstofType("el")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "el"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-2xl mb-1">🔌</div>
            <div className="font-medium dark:text-gray-200">El</div>
          </button>
        </div>
      </div>

      {braendstofType !== "el" && (
        <div>
          <label className="block text-sm font-medium mb-3 dark:text-gray-200">Hvad vil du beregne?</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setBeregningsType("turPris")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "turPris"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200">🚗 Pris for en tur</div>
            </button>
            <button
              onClick={() => setBeregningsType("kmPris")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "kmPris"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200">📊 Pris pr. km</div>
            </button>
            <button
              onClick={() => setBeregningsType("forbrug")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "forbrug"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200">📈 Beregn forbrug</div>
            </button>
          </div>
        </div>
      )}

      {/* Input baseret på type */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        {braendstofType === "el" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">El-pris (kr/kWh)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={kwhPris}
                  onChange={(e) => setKwhPris(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-16 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 text-sm">kr/kWh</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Typisk 2-4 kr/kWh hjemme, 3-6 kr på ladestander</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Forbrug (kWh/100 km)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={kwhPer100km}
                  onChange={(e) => setKwhPer100km(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-16 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400 text-sm">kWh/100km</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Typisk 15-20 kWh/100km</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Distance (km)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
              </div>
            </div>
          </div>
        ) : beregningsType === "forbrug" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{braendstofType === "benzin" ? "Benzin" : "Diesel"} tanket (liter)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={literBrugt}
                  onChange={(e) => setLiterBrugt(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">l</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Kilometer kørt</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={kmKoert}
                  onChange={(e) => setKmKoert(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{braendstofType === "benzin" ? "Benzin" : "Diesel"}pris (kr/liter)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={literPris}
                  onChange={(e) => setLiterPris(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kr/l</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{braendstofType === "benzin" ? "Benzin" : "Diesel"}pris (kr/liter)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={literPris}
                  onChange={(e) => setLiterPris(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">kr/l</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Bilens km/liter</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={kmPerLiter}
                  onChange={(e) => setKmPerLiter(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/l</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Typisk 10-20 km/l afhængig af bil</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Distance (km)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      {beregningsType === "forbrug" && braendstofType !== "el" ? (
        <div className="p-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-center text-white">
          <p className="text-lg opacity-90 mb-2">Dit forbrug</p>
          <p className="text-5xl md:text-6xl font-bold">
            {formatNumber(beregning.forbrugPr100km, 1)} l/100km
          </p>
          <p className="text-lg mt-2">
            ({formatNumber((beregning as { beregnetKmPerLiter?: number }).beregnetKmPerLiter || 0, 1)} km/liter)
          </p>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
          <p className="text-lg opacity-90 mb-2">Pris for {distance} km</p>
          <p className="text-5xl md:text-6xl font-bold">
            {formatKr(beregning.turPris)}
          </p>
          <p className="text-sm opacity-75 mt-2">
            {formatNumber(beregning.braendstofForTur, 1)} {beregning.enhed}
          </p>
        </div>
      )}

      {/* Statistikker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.prisPrKm)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pr. kilometer</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatNumber(beregning.forbrugPr100km, 1)} {beregning.enhed}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pr. 100 km</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatKr(beregning.prisPrKm * 15000)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pr. år (15.000 km)</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatKr(beregning.prisPrKm * 15000 / 12)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pr. måned</p>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${formatKr(beregning.prisPrKm)}/km – ${formatNumber(beregning.forbrugPr100km, 1)} ${beregning.enhed}/100km`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Brændstofberegner"
          resultSummary={`${formatKr(beregning.prisPrKm)}/km – ${formatNumber(beregning.forbrugPr100km, 1)} ${beregning.enhed}/100km`}
        />
      </div>

      {/* Sammenligningstabel */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white">Sammenlign brændstofpriser</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm dark:text-gray-200">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Distance</th>
                <th className="text-right py-2">Benzin (15 km/l)</th>
                <th className="text-right py-2">Diesel (18 km/l)</th>
                <th className="text-right py-2">El (17 kWh/100km)</th>
              </tr>
            </thead>
            <tbody>
              {[50, 100, 200, 500, 1000].map((km) => {
                const benzinPris = (km / 15) * 13.5;
                const dieselPris = (km / 18) * 12.8;
                const elPris = (km / 100) * 17 * 2.5;
                return (
                  <tr key={km} className="border-b last:border-b-0 dark:border-gray-700">
                    <td className="py-2 font-medium">{km} km</td>
                    <td className="py-2 text-right">{formatKr(benzinPris)}</td>
                    <td className="py-2 text-right">{formatKr(dieselPris)}</td>
                    <td className="py-2 text-right text-green-600 dark:text-green-400">{formatKr(elPris)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Baseret på benzin 13,50 kr/l, diesel 12,80 kr/l, el 2,50 kr/kWh
          </p>
        </div>
      </div>
    </div>
  );
}
