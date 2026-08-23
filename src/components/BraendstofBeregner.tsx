"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Car, ChartColumn, Droplets, Fuel, PlugZap, TrendingUp } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency, formatNumber as formatNum } from '@/lib/format';

export default function BraendstofBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      fuelType: "Brændstoftype",
      benzin: "Benzin",
      diesel: "Diesel",
      el: "El",
      whatCalc: "Hvad vil du beregne?",
      tripPrice: "Pris for en tur",
      kmPrice: "Pris pr. km",
      calcConsumption: "Beregn forbrug",
      elPrice: "El-pris (kr/kWh)",
      elPriceHint: "Typisk 2-4 kr/kWh hjemme, 3-6 kr på ladestander",
      elConsumption: "Forbrug (kWh/100 km)",
      elConsumptionHint: "Typisk 15-20 kWh/100km",
      distance: "Distance (km)",
      fuelTanked: (fuel: string) => `${fuel} tanket (liter)`,
      kmDriven: "Kilometer kørt",
      fuelPrice: (fuel: string) => `${fuel}pris (kr/liter)`,
      carKmPerLiter: "Bilens km/liter",
      carKmPerLiterHint: "Typisk 10-20 km/l afhængig af bil",
      yourConsumption: "Dit forbrug",
      priceForKm: (km: number) => `Pris for ${km} km`,
      perKilometer: "Pr. kilometer",
      per100km: "Pr. 100 km",
      perYear: "Pr. år (15.000 km)",
      perMonth: "Pr. måned",
      compareTitle: "Sammenlign brændstofpriser",
      colDistance: "Distance",
      colBenzin: "Benzin (15 km/l)",
      colDiesel: "Diesel (18 km/l)",
      colEl: "El (17 kWh/100km)",
      compareNote: "Baseret på benzin 13,50 kr/l, diesel 12,80 kr/l, el 2,50 kr/kWh",
      calcName: "Brændstofberegner",
    },
    se: {
      fuelType: "Bränsletyp",
      benzin: "Bensin",
      diesel: "Diesel",
      el: "El",
      whatCalc: "Vad vill du beräkna?",
      tripPrice: "Pris för en resa",
      kmPrice: "Pris per km",
      calcConsumption: "Beräkna förbrukning",
      elPrice: "Elpris (kr/kWh)",
      elPriceHint: "Vanligtvis 2-4 kr/kWh hemma, 3-6 kr vid laddstation",
      elConsumption: "Förbrukning (kWh/100 km)",
      elConsumptionHint: "Vanligtvis 15-20 kWh/100km",
      distance: "Sträcka (km)",
      fuelTanked: (fuel: string) => `${fuel} tankat (liter)`,
      kmDriven: "Kilometer körda",
      fuelPrice: (fuel: string) => `${fuel}pris (kr/liter)`,
      carKmPerLiter: "Bilens km/liter",
      carKmPerLiterHint: "Vanligtvis 10-20 km/l beroende på bil",
      yourConsumption: "Din förbrukning",
      priceForKm: (km: number) => `Pris för ${km} km`,
      perKilometer: "Per kilometer",
      per100km: "Per 100 km",
      perYear: "Per år (15 000 km)",
      perMonth: "Per månad",
      compareTitle: "Jämför bränslepriser",
      colDistance: "Sträcka",
      colBenzin: "Bensin (15 km/l)",
      colDiesel: "Diesel (18 km/l)",
      colEl: "El (17 kWh/100km)",
      compareNote: "Baserat på bensin 13,50 kr/l, diesel 12,80 kr/l, el 2,50 kr/kWh",
      calcName: "Bränslekalkylator",
    },
  } as const;
  const l = labels[locale as keyof typeof labels] || labels.da;

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

  const formatKr = (amount: number) => formatCurrency(amount, locale);

  const formatNumber = (num: number, decimals: number = 2) => formatNum(num, locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  return (
    <div className="space-y-8">
      {/* Brændstoftype */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-gray-200">{l.fuelType}</label>
        <div className="grid grid-cols-3 gap-3">
          <button type="button"
            onClick={() => setBraendstofType("benzin")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "benzin"
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <Fuel className="h-6 w-6 mx-auto mb-1" strokeWidth={1.75} aria-hidden="true" focusable="false" />
            <div className="font-medium dark:text-gray-200">{l.benzin}</div>
          </button>
          <button type="button"
            onClick={() => setBraendstofType("diesel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "diesel"
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <Droplets className="h-6 w-6 mx-auto mb-1" strokeWidth={1.75} aria-hidden="true" focusable="false" />
            <div className="font-medium dark:text-gray-200">{l.diesel}</div>
          </button>
          <button type="button"
            onClick={() => setBraendstofType("el")}
            className={`p-4 rounded-lg border-2 transition-all ${
              braendstofType === "el"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <PlugZap className="h-6 w-6 mx-auto mb-1" strokeWidth={1.75} aria-hidden="true" focusable="false" />
            <div className="font-medium dark:text-gray-200">{l.el}</div>
          </button>
        </div>
      </div>

      {braendstofType !== "el" && (
        <div>
          <label className="block text-sm font-medium mb-3 dark:text-gray-200">{l.whatCalc}</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button type="button"
              onClick={() => setBeregningsType("turPris")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "turPris"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200 flex items-center gap-1.5"><Car className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.tripPrice}</div>
            </button>
            <button type="button"
              onClick={() => setBeregningsType("kmPris")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "kmPris"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200 flex items-center gap-1.5"><ChartColumn className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.kmPrice}</div>
            </button>
            <button type="button"
              onClick={() => setBeregningsType("forbrug")}
              className={`p-3 rounded-lg border-2 text-left ${
                beregningsType === "forbrug"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium dark:text-gray-200 flex items-center gap-1.5"><TrendingUp className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.calcConsumption}</div>
            </button>
          </div>
        </div>
      )}

      {/* Input baseret på type */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        {braendstofType === "el" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.elPrice}</label>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.elPriceHint}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.elConsumption}</label>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.elConsumptionHint}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.distance}</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.fuelTanked(braendstofType === "benzin" ? l.benzin : l.diesel)}</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.kmDriven}</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.fuelPrice(braendstofType === "benzin" ? l.benzin : l.diesel)}</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.fuelPrice(braendstofType === "benzin" ? l.benzin : l.diesel)}</label>
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
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.carKmPerLiter}</label>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.carKmPerLiterHint}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.distance}</label>
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
          <p className="text-lg opacity-90 mb-2">{l.yourConsumption}</p>
          <p className="text-5xl md:text-6xl font-bold">
            {formatNumber(beregning.forbrugPr100km, 1)} l/100km
          </p>
          <p className="text-lg mt-2">
            ({formatNumber((beregning as { beregnetKmPerLiter?: number }).beregnetKmPerLiter || 0, 1)} km/liter)
          </p>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
          <p className="text-lg opacity-90 mb-2">{l.priceForKm(distance)}</p>
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
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.perKilometer}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatNumber(beregning.forbrugPr100km, 1)} {beregning.enhed}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.per100km}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatKr(beregning.prisPrKm * 15000)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.perYear}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
            {formatKr(beregning.prisPrKm * 15000 / 12)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.perMonth}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${formatKr(beregning.prisPrKm)}/km – ${formatNumber(beregning.forbrugPr100km, 1)} ${beregning.enhed}/100km`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calcName}
          resultSummary={`${formatKr(beregning.prisPrKm)}/km – ${formatNumber(beregning.forbrugPr100km, 1)} ${beregning.enhed}/100km`}
        />
      </div>

      {/* Sammenligningstabel */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white">{l.compareTitle}</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm dark:text-gray-200">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">{l.colDistance}</th>
                <th className="text-right py-2">{l.colBenzin}</th>
                <th className="text-right py-2">{l.colDiesel}</th>
                <th className="text-right py-2">{l.colEl}</th>
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
            {l.compareNote}
          </p>
        </div>
      </div>
    </div>
  );
}
