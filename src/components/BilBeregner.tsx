"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BilforsikringAffiliate } from "./AffiliateBox";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Braendstoftype = "benzin" | "diesel" | "el" | "hybrid";

export default function BilBeregner() {
  const [bilpris, setBilpris] = useState<number>(250000);
  const [braendstof, setBraendstof] = useState<Braendstoftype>("benzin");
  const [kmPrLiter, setKmPrLiter] = useState<number>(15);
  const [kmPrAar, setKmPrAar] = useState<number>(15000);
  const [braendstofpris, setBraendstofpris] = useState<number>(13.5);
  const [forsikring, setForsikring] = useState<number>(8000);
  const [vaerditab, setVaerditab] = useState<number>(15);

  // El-bil specifikt
  const [kwh100km, setKwh100km] = useState<number>(17);
  const [elpris, setElpris] = useState<number>(2.5);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bil') {
      const inputs = urlState.inputs;
      if (inputs.bilpris !== undefined) setBilpris(inputs.bilpris);
      if (inputs.braendstof) setBraendstof(inputs.braendstof);
      if (inputs.kmPrLiter !== undefined) setKmPrLiter(inputs.kmPrLiter);
      if (inputs.kmPrAar !== undefined) setKmPrAar(inputs.kmPrAar);
      if (inputs.braendstofpris !== undefined) setBraendstofpris(inputs.braendstofpris);
      if (inputs.forsikring !== undefined) setForsikring(inputs.forsikring);
      if (inputs.vaerditab !== undefined) setVaerditab(inputs.vaerditab);
      if (inputs.kwh100km !== undefined) setKwh100km(inputs.kwh100km);
      if (inputs.elpris !== undefined) setElpris(inputs.elpris);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("bil");
    const timer = setTimeout(() => {
      trackCalculation("bil");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bil',
      inputs: { bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris]);

  const resultat = useMemo(() => {
    // Brændstof/strøm omkostninger
    let braendstofOmkostning: number;
    
    if (braendstof === "el") {
      // kWh pr. 100km * (km/100) * pris pr. kWh
      braendstofOmkostning = (kwh100km / 100) * kmPrAar * elpris;
    } else {
      // (km/år) / (km/l) * pris/l
      braendstofOmkostning = (kmPrAar / kmPrLiter) * braendstofpris;
    }
    
    // Vægtafgift (forenklet - 2026 satser)
    let vaegt: number;
    if (braendstof === "el") {
      vaegt = 0; // El-biler har 0 kr i afgift til 2026
    } else if (braendstof === "benzin") {
      vaegt = 4000; // Ca. gennemsnit for benzinbil
    } else if (braendstof === "diesel") {
      vaegt = 5500; // Diesel er dyrere
    } else {
      vaegt = 3000; // Hybrid
    }
    
    // Værditab
    const aarligtVaerditab = bilpris * (vaerditab / 100);
    
    // Service og reparationer (ca. 3% af bilpris)
    const service = bilpris * 0.03;
    
    // Dæk (ca. 3000 kr/år ved normalt forbrug)
    const daek = 3000;
    
    // Samlet pr. år
    const aarligtTotal = braendstofOmkostning + forsikring + vaegt + aarligtVaerditab + service + daek;
    
    // Pr. måned
    const maanedligtTotal = aarligtTotal / 12;
    
    // Pr. km
    const prKm = aarligtTotal / kmPrAar;
    
    return {
      braendstof: Math.round(braendstofOmkostning),
      forsikring: Math.round(forsikring),
      vaegt: Math.round(vaegt),
      vaerditab: Math.round(aarligtVaerditab),
      service: Math.round(service),
      daek: Math.round(daek),
      aarligt: Math.round(aarligtTotal),
      maanedligt: Math.round(maanedligtTotal),
      prKm: prKm.toFixed(2),
    };
  }, [bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris]);

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
            <label className="block text-sm font-medium mb-2">Bilens pris</label>
            <input
              type="number"
              min="10000"
              max="5000000"
              step="10000"
              value={bilpris}
              onChange={(e) => setBilpris(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">{formatKr(bilpris)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brændstoftype</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "benzin", label: "⛽ Benzin" },
                { key: "diesel", label: "🛢️ Diesel" },
                { key: "el", label: "⚡ Elbil" },
                { key: "hybrid", label: "🔋 Hybrid" },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setBraendstof(type.key as Braendstoftype)}
                  className={`py-2 px-4 rounded-lg border-2 transition-colors text-sm ${
                    braendstof === type.key
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kørsel pr. år (km)</label>
            <input
              type="number"
              min="1000"
              max="100000"
              step="1000"
              value={kmPrAar}
              onChange={(e) => setKmPrAar(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">Gennemsnitligt: 15.000 km/år</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Forsikring (kr/år)</label>
            <input
              type="number"
              min="0"
              max="50000"
              step="500"
              value={forsikring}
              onChange={(e) => setForsikring(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          {braendstof === "el" ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Forbrug (kWh/100 km)</label>
                <input
                  type="number"
                  min="10"
                  max="40"
                  step="0.5"
                  value={kwh100km}
                  onChange={(e) => setKwh100km(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">Typisk: 15-20 kWh/100 km</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Elpris (kr/kWh)</label>
                <input
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.1"
                  value={elpris}
                  onChange={(e) => setElpris(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">Hjemme: 2-3 kr, Offentlig: 3-5 kr</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Forbrug (km/liter)</label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  step="0.5"
                  value={kmPrLiter}
                  onChange={(e) => setKmPrLiter(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {braendstof === "diesel" ? "Typisk diesel: 18-25 km/l" : "Typisk benzin: 12-18 km/l"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brændstofpris (kr/liter)</label>
                <input
                  type="number"
                  min="5"
                  max="25"
                  step="0.1"
                  value={braendstofpris}
                  onChange={(e) => setBraendstofpris(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border rounded-lg text-lg"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Årligt værditab (%)</label>
            <input
              type="number"
              min="5"
              max="30"
              step="1"
              value={vaerditab}
              onChange={(e) => setVaerditab(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              Nye biler: 15-20%, ældre: 8-12%
            </p>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Samlet månedlig omkostning</p>
          <p className="text-5xl font-bold text-blue-600">
            {formatKr(resultat.maanedligt)}
          </p>
          <p className="text-xl text-gray-500 mt-2">
            {resultat.prKm} kr/km
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-sm text-red-600">Brændstof/strøm</p>
            <p className="font-bold text-lg">{formatKr(resultat.braendstof)}/år</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-sm text-orange-600">Værditab</p>
            <p className="font-bold text-lg">{formatKr(resultat.vaerditab)}/år</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-600">Forsikring</p>
            <p className="font-bold text-lg">{formatKr(resultat.forsikring)}/år</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-purple-600">Vægtafgift</p>
            <p className="font-bold text-lg">{formatKr(resultat.vaegt)}/år</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600">Service</p>
            <p className="font-bold text-lg">{formatKr(resultat.service)}/år</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Dæk</p>
            <p className="font-bold text-lg">{formatKr(resultat.daek)}/år</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-800 text-center">
            Samlet årlig omkostning: {formatKr(resultat.aarligt)}
          </p>
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatKr(resultat.maanedligt)}/md - ${resultat.prKm} kr/km (${formatKr(resultat.aarligt)}/år)`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Bilberegner"
          resultSummary={`${formatKr(resultat.maanedligt)}/md - ${resultat.prKm} kr/km (${formatKr(resultat.aarligt)}/år)`}
        />
      </div>

      {/* Tips */}
      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-green-800 dark:text-green-200">💡 Sådan sparer du på bilomkostninger</h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
          <li>• <strong>Sammenlign forsikringer</strong> - priser varierer op til 50%</li>
          <li>• <strong>Kør jævnt</strong> - op til 20% bedre brændstoføkonomi</li>
          <li>• <strong>Tjek dæktryk</strong> - korrekt tryk sparer brændstof</li>
          <li>• <strong>Overvej elbil</strong> - lavere driftsomkostninger trods højere pris</li>
          <li>• <strong>Køb brugt</strong> - undgå det største værditab (år 1-3)</li>
        </ul>
      </div>

      {/* Affiliate box - sammenlign bilforsikringer */}
      <BilforsikringAffiliate className="mt-6" />
    </div>
  );
}
