"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

export default function HuslejeBudgetBeregner() {
  // Indkomst
  const [maanedligNettoLoen, setMaanedligNettoLoen] = useState<number>(28000);
  const [partnerLoen, setPartnerLoen] = useState<number>(0);
  const [andreIndkomster, setAndreIndkomster] = useState<number>(0);
  
  // Faste udgifter
  const [madOgDagligvarer, setMadOgDagligvarer] = useState<number>(4000);
  const [transport, setTransport] = useState<number>(2000);
  const [forsikringer, setForsikringer] = useState<number>(1000);
  const [mobilOgInternet, setMobilOgInternet] = useState<number>(500);
  const [abonnementer, setAbonnementer] = useState<number>(500);
  const [andreUdgifter, setAndreUdgifter] = useState<number>(1000);
  
  // Opsparing
  const [opsparingProcent, setOpsparingProcent] = useState<number>(10);
  const hasLoadedUrl = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'husleje-budget') {
      const inputs = urlState.inputs;
      if (inputs.maanedligNettoLoen !== undefined) setMaanedligNettoLoen(inputs.maanedligNettoLoen);
      if (inputs.partnerLoen !== undefined) setPartnerLoen(inputs.partnerLoen);
      if (inputs.andreIndkomster !== undefined) setAndreIndkomster(inputs.andreIndkomster);
      if (inputs.madOgDagligvarer !== undefined) setMadOgDagligvarer(inputs.madOgDagligvarer);
      if (inputs.transport !== undefined) setTransport(inputs.transport);
      if (inputs.forsikringer !== undefined) setForsikringer(inputs.forsikringer);
      if (inputs.mobilOgInternet !== undefined) setMobilOgInternet(inputs.mobilOgInternet);
      if (inputs.abonnementer !== undefined) setAbonnementer(inputs.abonnementer);
      if (inputs.andreUdgifter !== undefined) setAndreUdgifter(inputs.andreUdgifter);
      if (inputs.opsparingProcent !== undefined) setOpsparingProcent(inputs.opsparingProcent);
    }
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'husleje-budget',
      inputs: { maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer, transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer, transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent]);

  const beregning = useMemo(() => {
    // Samlet indkomst
    const samletIndkomst = maanedligNettoLoen + partnerLoen + andreIndkomster;
    
    // Faste udgifter (uden husleje)
    const fasteUdgifter = madOgDagligvarer + transport + forsikringer + 
                          mobilOgInternet + abonnementer + andreUdgifter;
    
    // Opsparing
    const opsparingBeloeb = samletIndkomst * (opsparingProcent / 100);
    
    // Tilgængeligt til husleje
    const tilHusleje = samletIndkomst - fasteUdgifter - opsparingBeloeb;
    
    // Anbefalinger baseret på tommelfingerregler
    const maxHusleje30Pct = samletIndkomst * 0.30; // 30% reglen
    const maxHusleje33Pct = samletIndkomst * 0.33; // 33% reglen
    
    // Anbefalet husleje (den laveste af de to metoder)
    const anbefalet = Math.min(tilHusleje, maxHusleje30Pct);
    
    // Kategorisering
    let vurdering: "god" | "ok" | "risikabel" = "god";
    let vurderingTekst = "";
    
    if (tilHusleje >= maxHusleje30Pct) {
      vurdering = "god";
      vurderingTekst = "Din økonomi tillader en god husleje med plads til opsparing og uforudsete udgifter.";
    } else if (tilHusleje >= maxHusleje30Pct * 0.8) {
      vurdering = "ok";
      vurderingTekst = "Du kan godt betale huslejen, men overvej at reducere andre udgifter for mere buffer.";
    } else {
      vurdering = "risikabel";
      vurderingTekst = "Din økonomi er stram. Overvej billigere bolig eller højere indkomst/lavere udgifter.";
    }
    
    return {
      samletIndkomst,
      fasteUdgifter,
      opsparingBeloeb,
      tilHusleje,
      maxHusleje30Pct,
      maxHusleje33Pct,
      anbefalet,
      vurdering,
      vurderingTekst,
      resterendeEfterHusleje: tilHusleje - anbefalet,
    };
  }, [maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer, 
      transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getVurderingFarve = () => {
    switch (beregning.vurdering) {
      case "god": return "bg-green-100 text-green-800 border-green-300";
      case "ok": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "risikabel": return "bg-red-100 text-red-800 border-red-300";
    }
  };

  return (
    <div className="space-y-8">
      {/* Indkomst */}
      <div>
        <h3 className="text-lg font-medium mb-4">💰 Din indkomst</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Din nettoløn pr. måned</label>
            <input
              type="number"
              min="0"
              step="500"
              value={maanedligNettoLoen}
              onChange={(e) => setMaanedligNettoLoen(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Partner/roommate (valgfrit)</label>
            <input
              type="number"
              min="0"
              step="500"
              value={partnerLoen}
              onChange={(e) => setPartnerLoen(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Andre indkomster</label>
            <input
              type="number"
              min="0"
              step="100"
              value={andreIndkomster}
              onChange={(e) => setAndreIndkomster(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">SU, børnepenge, etc.</p>
          </div>
        </div>
      </div>

      {/* Faste udgifter */}
      <div>
        <h3 className="text-lg font-medium mb-4">📋 Dine faste udgifter (ekskl. husleje)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mad & dagligvarer</label>
            <input
              type="number"
              min="0"
              step="100"
              value={madOgDagligvarer}
              onChange={(e) => setMadOgDagligvarer(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Transport</label>
            <input
              type="number"
              min="0"
              step="100"
              value={transport}
              onChange={(e) => setTransport(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Bil, bus, tog</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Forsikringer</label>
            <input
              type="number"
              min="0"
              step="100"
              value={forsikringer}
              onChange={(e) => setForsikringer(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Mobil & internet</label>
            <input
              type="number"
              min="0"
              step="50"
              value={mobilOgInternet}
              onChange={(e) => setMobilOgInternet(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Abonnementer</label>
            <input
              type="number"
              min="0"
              step="50"
              value={abonnementer}
              onChange={(e) => setAbonnementer(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Streaming, fitness, etc.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Andre udgifter</label>
            <input
              type="number"
              min="0"
              step="100"
              value={andreUdgifter}
              onChange={(e) => setAndreUdgifter(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Tøj, hobby, etc.</p>
          </div>
        </div>
      </div>

      {/* Opsparing */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Ønsket opsparing: {opsparingProcent}% ({formatKr(beregning.opsparingBeloeb)}/måned)
        </label>
        <input
          type="range"
          min="0"
          max="30"
          value={opsparingProcent}
          onChange={(e) => setOpsparingProcent(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>10% (anbefalet min.)</span>
          <span>30%</span>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-center text-white">
        <p className="text-lg opacity-90 mb-2">Du kan bruge på husleje</p>
        <p className="text-5xl md:text-6xl font-bold">
          {formatKr(Math.max(0, beregning.anbefalet))}
        </p>
        <p className="text-sm opacity-75 mt-2">pr. måned inkl. el, vand og varme</p>
      </div>

      {/* Vurdering */}
      <div className={`p-4 rounded-lg border ${getVurderingFarve()}`}>
        <p className="font-medium mb-1">
          {beregning.vurdering === "god" && "✅ God økonomi"}
          {beregning.vurdering === "ok" && "⚠️ Acceptabel økonomi"}
          {beregning.vurdering === "risikabel" && "🚨 Stram økonomi"}
        </p>
        <p className="text-sm">{beregning.vurderingTekst}</p>
      </div>

      {/* Detaljeret oversigt */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700">{formatKr(beregning.samletIndkomst)}</p>
          <p className="text-sm text-gray-500">Samlet indkomst</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-xl font-bold text-red-600">{formatKr(beregning.fasteUdgifter)}</p>
          <p className="text-sm text-gray-500">Faste udgifter</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-xl font-bold text-blue-600">{formatKr(beregning.opsparingBeloeb)}</p>
          <p className="text-sm text-gray-500">Opsparing</p>
        </div>
        <div className="p-4 bg-white border rounded-lg text-center">
          <p className="text-xl font-bold text-green-600">{formatKr(beregning.maxHusleje30Pct)}</p>
          <p className="text-sm text-gray-500">30% reglen</p>
        </div>
      </div>

      {/* Budget oversigt */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">Dit budget</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Samlet månedlig indkomst</span>
              <span className="font-bold text-green-600">+{formatKr(beregning.samletIndkomst)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Mad & dagligvarer</span>
              <span>-{formatKr(madOgDagligvarer)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Transport</span>
              <span>-{formatKr(transport)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Forsikringer</span>
              <span>-{formatKr(forsikringer)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Mobil & internet</span>
              <span>-{formatKr(mobilOgInternet)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Abonnementer</span>
              <span>-{formatKr(abonnementer)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Andre udgifter</span>
              <span>-{formatKr(andreUdgifter)}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Opsparing ({opsparingProcent}%)</span>
              <span>-{formatKr(beregning.opsparingBeloeb)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Tilgængeligt til husleje</span>
              <span className={beregning.tilHusleje >= 0 ? "text-green-600" : "text-red-600"}>
                {formatKr(beregning.tilHusleje)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Huslejebudget-beregner"
          resultSummary={`Max husleje: ${formatKr(Math.max(0, beregning.anbefalet))}/måned`}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tommelfingerregler for husleje</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>30% reglen:</strong> Husleje bør max være 30% af din nettoindkomst</li>
          <li>• <strong>Inkluder alt:</strong> Husleje + el + vand + varme + evt. internet</li>
          <li>• <strong>Buffer:</strong> Hav altid 3-6 måneders udgifter i opsparing</li>
          <li>• <strong>Depositor:</strong> Husk at spare op til 3 måneders husleje i depositum</li>
        </ul>
      </div>
    </div>
  );
}
