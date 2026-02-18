"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type FormType = "rektangel" | "cirkel" | "trekant" | "trapez";

export default function KvadratmeterBeregner() {
  const [formType, setFormType] = useState<FormType>("rektangel");
  
  // Rektangel
  const [laengde, setLaengde] = useState<number>(10);
  const [bredde, setBredde] = useState<number>(8);
  
  // Cirkel
  const [radius, setRadius] = useState<number>(5);
  
  // Trekant
  const [grundlinje, setGrundlinje] = useState<number>(10);
  const [hoejde, setHoejde] = useState<number>(6);
  
  // Trapez
  const [side1, setSide1] = useState<number>(8);
  const [side2, setSide2] = useState<number>(12);
  const [trapezHoejde, setTrapezHoejde] = useState<number>(5);
  
  // Ekstra beregninger
  const [prisPerKvm, setPrisPerKvm] = useState<number>(0);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'kvadratmeter') {
      const inputs = urlState.inputs;
      if (inputs.formType) setFormType(inputs.formType);
      if (inputs.laengde !== undefined) setLaengde(inputs.laengde);
      if (inputs.bredde !== undefined) setBredde(inputs.bredde);
      if (inputs.radius !== undefined) setRadius(inputs.radius);
      if (inputs.grundlinje !== undefined) setGrundlinje(inputs.grundlinje);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.side1 !== undefined) setSide1(inputs.side1);
      if (inputs.side2 !== undefined) setSide2(inputs.side2);
      if (inputs.trapezHoejde !== undefined) setTrapezHoejde(inputs.trapezHoejde);
      if (inputs.prisPerKvm !== undefined) setPrisPerKvm(inputs.prisPerKvm);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kvadratmeter");
    const timer = setTimeout(() => {
      trackCalculation("kvadratmeter");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'kvadratmeter',
      inputs: { formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm]);

  const beregning = useMemo(() => {
    let areal = 0;
    let omkreds = 0;
    let formel = "";
    
    switch (formType) {
      case "rektangel":
        areal = laengde * bredde;
        omkreds = 2 * (laengde + bredde);
        formel = `${laengde} × ${bredde} = ${areal} m²`;
        break;
      case "cirkel":
        areal = Math.PI * radius * radius;
        omkreds = 2 * Math.PI * radius;
        formel = `π × ${radius}² = ${areal.toFixed(2)} m²`;
        break;
      case "trekant":
        areal = (grundlinje * hoejde) / 2;
        // Omkreds kan ikke beregnes uden alle sider
        omkreds = 0;
        formel = `(${grundlinje} × ${hoejde}) / 2 = ${areal} m²`;
        break;
      case "trapez":
        areal = ((side1 + side2) / 2) * trapezHoejde;
        omkreds = 0; // Kan ikke beregnes uden alle sider
        formel = `((${side1} + ${side2}) / 2) × ${trapezHoejde} = ${areal} m²`;
        break;
    }
    
    const totalPris = prisPerKvm > 0 ? areal * prisPerKvm : 0;
    
    return { areal, omkreds, formel, totalPris };
  }, [formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat("da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Form valg */}
      <div>
        <label className="block text-sm font-medium mb-3">Vælg form</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setFormType("rektangel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "rektangel"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">▭</div>
            <div className="font-medium text-sm">Rektangel</div>
          </button>
          <button
            onClick={() => setFormType("cirkel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "cirkel"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">◯</div>
            <div className="font-medium text-sm">Cirkel</div>
          </button>
          <button
            onClick={() => setFormType("trekant")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "trekant"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">△</div>
            <div className="font-medium text-sm">Trekant</div>
          </button>
          <button
            onClick={() => setFormType("trapez")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "trapez"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-3xl mb-2">⏢</div>
            <div className="font-medium text-sm">Trapez</div>
          </button>
        </div>
      </div>

      {/* Input baseret på form */}
      <div className="bg-gray-50 rounded-lg p-6">
        {formType === "rektangel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Længde (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={laengde}
                onChange={(e) => setLaengde(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bredde (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={bredde}
                onChange={(e) => setBredde(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        )}

        {formType === "cirkel" && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-2">Radius (meter)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={radius}
              onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Radius = halvdelen af diameteren</p>
          </div>
        )}

        {formType === "trekant" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Grundlinje (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={grundlinje}
                onChange={(e) => setGrundlinje(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Højde (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={hoejde}
                onChange={(e) => setHoejde(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Vinkelret afstand til grundlinjen</p>
            </div>
          </div>
        )}

        {formType === "trapez" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Øverste side (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={side1}
                onChange={(e) => setSide1(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nederste side (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={side2}
                onChange={(e) => setSide2(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Højde (meter)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={trapezHoejde}
                onChange={(e) => setTrapezHoejde(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Resultat */}
      <div className="p-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-center text-white">
        <p className="text-lg opacity-90 mb-2">Areal</p>
        <p className="text-5xl md:text-6xl font-bold">
          {formatNumber(beregning.areal)} m²
        </p>
        <p className="text-sm opacity-75 mt-2">{beregning.formel}</p>
      </div>

      {beregning.omkreds > 0 && (
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-600">
            Omkreds: <strong>{formatNumber(beregning.omkreds)} meter</strong>
          </p>
        </div>
      )}

      {/* Prisberegning */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-medium mb-4">Beregn pris</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Pris pr. m² (valgfrit)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={prisPerKvm || ""}
              placeholder="0"
              onChange={(e) => setPrisPerKvm(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          {beregning.totalPris > 0 && (
            <div className="flex-1 p-4 bg-green-100 rounded-lg text-center">
              <p className="text-sm text-gray-600">Samlet pris</p>
              <p className="text-2xl font-bold text-green-700">{formatKr(beregning.totalPris)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Omregningsliste */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Omregn dit areal</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{formatNumber(beregning.areal)} m²</div>
              <div className="text-gray-500">Kvadratmeter</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{formatNumber(beregning.areal * 10000)} cm²</div>
              <div className="text-gray-500">Kvadratcentimeter</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{formatNumber(beregning.areal / 10000, 6)} ha</div>
              <div className="text-gray-500">Hektar</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-semibold">{formatNumber(beregning.areal * 10.764)} sq ft</div>
              <div className="text-gray-500">Kvadratfod</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Kvadratmeterberegner"
          resultSummary={`${formatNumber(beregning.areal)} m² (${formType})`}
        />
      </div>

      {/* Formler */}
      <details className="bg-gray-50 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium">
          Se formler for arealberegning
        </summary>
        <div className="p-4 pt-0 space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Rektangel:</h4>
            <code className="block bg-white p-2 rounded border">Areal = Længde × Bredde</code>
          </div>
          <div>
            <h4 className="font-medium mb-1">Cirkel:</h4>
            <code className="block bg-white p-2 rounded border">Areal = π × r² (hvor r = radius)</code>
          </div>
          <div>
            <h4 className="font-medium mb-1">Trekant:</h4>
            <code className="block bg-white p-2 rounded border">Areal = (Grundlinje × Højde) / 2</code>
          </div>
          <div>
            <h4 className="font-medium mb-1">Trapez:</h4>
            <code className="block bg-white p-2 rounded border">Areal = ((Side 1 + Side 2) / 2) × Højde</code>
          </div>
        </div>
      </details>
    </div>
  );
}
