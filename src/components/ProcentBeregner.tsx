"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { trackCalculation } from "@/lib/analytics";

type BeregningsMode = "find-procent" | "find-resultat" | "find-heltal" | "stigning";

export default function ProcentBeregner() {
  const [mode, setMode] = useState<BeregningsMode>("find-procent");
  
  // Find procent mode
  const [deltal, setDeltal] = useState<number>(25);
  const [heltal, setHeltal] = useState<number>(100);
  
  // Find resultat mode
  const [procent, setProcent] = useState<number>(25);
  const [baseVal, setBaseVal] = useState<number>(200);
  
  // Stigning mode
  const [fra, setFra] = useState<number>(100);
  const [til, setTil] = useState<number>(125);
  
  const hasTracked = useRef(false);

  const resultat = useMemo(() => {
    switch (mode) {
      case "find-procent":
        if (heltal === 0) return null;
        const procentAfHeltal = (deltal / heltal) * 100;
        return {
          type: "find-procent" as const,
          resultat: procentAfHeltal,
          forklaring: `${deltal} er ${procentAfHeltal.toFixed(2)}% af ${heltal}`,
        };
      
      case "find-resultat":
        const resultatVaerdi = (procent / 100) * baseVal;
        return {
          type: "find-resultat" as const,
          resultat: resultatVaerdi,
          forklaring: `${procent}% af ${baseVal} er ${resultatVaerdi.toFixed(2)}`,
        };
      
      case "find-heltal":
        if (procent === 0) return null;
        const heltalVaerdi = (deltal / procent) * 100;
        return {
          type: "find-heltal" as const,
          resultat: heltalVaerdi,
          forklaring: `Hvis ${deltal} er ${procent}%, så er 100% = ${heltalVaerdi.toFixed(2)}`,
        };
      
      case "stigning":
        if (fra === 0) return null;
        const aendring = til - fra;
        const procentAendring = (aendring / fra) * 100;
        const erStigning = aendring >= 0;
        return {
          type: "stigning" as const,
          resultat: procentAendring,
          aendring,
          erStigning,
          forklaring: `${erStigning ? "Stigning" : "Fald"} fra ${fra} til ${til} er ${Math.abs(procentAendring).toFixed(2)}%`,
        };
      
      default:
        return null;
    }
  }, [mode, deltal, heltal, procent, baseVal, fra, til]);

  // Track calculation once per session
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const timer = setTimeout(() => {
        trackCalculation("procent");
        hasTracked.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resultat]);

  const modes = [
    { id: "find-procent" as BeregningsMode, label: "Find procent", desc: "X er ? % af Y" },
    { id: "find-resultat" as BeregningsMode, label: "Find resultat", desc: "X % af Y = ?" },
    { id: "find-heltal" as BeregningsMode, label: "Find heltal", desc: "X er Y% af ?" },
    { id: "stigning" as BeregningsMode, label: "Procentvis ændring", desc: "Fra X til Y = ?%" },
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

      {/* Input fields based on mode */}
      <div className="bg-gray-50 rounded-xl p-6">
        {mode === "find-procent" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={deltal}
              onChange={(e) => setDeltal(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">er</span>
            <span className="text-2xl font-bold text-blue-600">?%</span>
            <span className="text-gray-600">af</span>
            <input
              type="number"
              value={heltal}
              onChange={(e) => setHeltal(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
          </div>
        )}

        {mode === "find-resultat" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={procent}
              onChange={(e) => setProcent(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">% af</span>
            <input
              type="number"
              value={baseVal}
              onChange={(e) => setBaseVal(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">=</span>
            <span className="text-2xl font-bold text-blue-600">?</span>
          </div>
        )}

        {mode === "find-heltal" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <input
              type="number"
              value={deltal}
              onChange={(e) => setDeltal(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">er</span>
            <input
              type="number"
              value={procent}
              onChange={(e) => setProcent(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">% af</span>
            <span className="text-2xl font-bold text-blue-600">?</span>
          </div>
        )}

        {mode === "stigning" && (
          <div className="flex flex-wrap items-center gap-4 text-lg">
            <span className="text-gray-600">Fra</span>
            <input
              type="number"
              value={fra}
              onChange={(e) => setFra(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">til</span>
            <input
              type="number"
              value={til}
              onChange={(e) => setTil(parseFloat(e.target.value) || 0)}
              className="w-28 px-4 py-3 border rounded-lg text-center text-xl"
            />
            <span className="text-gray-600">=</span>
            <span className="text-2xl font-bold text-blue-600">?%</span>
          </div>
        )}
      </div>

      {/* Result */}
      {resultat && (
        <div className={`p-6 rounded-xl text-center ${
          resultat.type === "stigning" && !resultat.erStigning 
            ? "bg-red-50" 
            : "bg-green-50"
        }`}>
          <p className="text-sm text-gray-600 mb-2">Resultat</p>
          <p className={`text-5xl font-bold ${
            resultat.type === "stigning" && !resultat.erStigning
              ? "text-red-600"
              : "text-green-600"
          }`}>
            {resultat.type === "find-procent" || resultat.type === "stigning"
              ? `${resultat.resultat.toFixed(2)}%`
              : resultat.resultat.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-2">{resultat.forklaring}</p>
        </div>
      )}

      {/* Quick reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Hurtig reference</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>10% = 1/10</li>
            <li>25% = 1/4</li>
            <li>33% ≈ 1/3</li>
            <li>50% = 1/2</li>
            <li>75% = 3/4</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Formler</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Procent = (Del / Heltal) × 100</li>
            <li>Del = (Procent / 100) × Heltal</li>
            <li>Heltal = Del × (100 / Procent)</li>
            <li>Ændring = ((Ny - Gammel) / Gammel) × 100</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
