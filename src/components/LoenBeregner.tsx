"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

// 2026 danske skattesatser (tilnærmede)
const SKATTESATSER = {
  amBidrag: 0.08, // 8% AM-bidrag
  bundSkat: 0.1222, // 12,22% bundskat
  kommuneSkatSnit: 0.2494, // Gennemsnitlig kommuneskat
  kirkeSkat: 0.0068, // Gennemsnitlig kirkeskat (valgfri)
  topSkatGraense: 588900, // Topskattegrænse 2026
  topSkat: 0.15, // 15% topskat
  personfradrag: 49700, // Personfradrag 2026
  beskaeftigelsesfradragMax: 45100, // Max beskæftigelsesfradrag
  beskaeftigelsesfradragPct: 0.1065, // 10,65% af lønindkomst
};

export default function LoenBeregner() {
  const [bruttoLoen, setBruttoLoen] = useState<number>(40000);
  const [periode, setPeriode] = useState<"maaned" | "aar">("maaned");
  const [medKirkeskat, setMedKirkeskat] = useState(true);
  const [kommuneSkat, setKommuneSkat] = useState(24.94);
  const [pension, setPension] = useState(0);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'loen') {
      const inputs = urlState.inputs;
      if (inputs.bruttoLoen !== undefined) setBruttoLoen(inputs.bruttoLoen);
      if (inputs.periode) setPeriode(inputs.periode);
      if (inputs.medKirkeskat !== undefined) setMedKirkeskat(inputs.medKirkeskat);
      if (inputs.kommuneSkat !== undefined) setKommuneSkat(inputs.kommuneSkat);
      if (inputs.pension !== undefined) setPension(inputs.pension);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'loen',
      inputs: { bruttoLoen, periode, medKirkeskat, kommuneSkat, pension },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bruttoLoen, periode, medKirkeskat, kommuneSkat, pension]);

  const beregning = useMemo(() => {
    // Konverter til årlig
    const aarligBrutto = periode === "maaned" ? bruttoLoen * 12 : bruttoLoen;
    
    // Fradrag pension før AM-bidrag
    const pensionsBidrag = aarligBrutto * (pension / 100);
    const loenEfterPension = aarligBrutto - pensionsBidrag;
    
    // AM-bidrag (8%)
    const amBidrag = loenEfterPension * SKATTESATSER.amBidrag;
    const loenEfterAM = loenEfterPension - amBidrag;

    // Beskæftigelsesfradrag
    const beskaeftigelsesfradrag = Math.min(
      loenEfterAM * SKATTESATSER.beskaeftigelsesfradragPct,
      SKATTESATSER.beskaeftigelsesfradragMax
    );

    // Skattepligtig indkomst
    const personfradrag = SKATTESATSER.personfradrag;
    const skattepligtigIndkomst = Math.max(0, loenEfterAM - personfradrag - beskaeftigelsesfradrag);

    // Bundskat
    const bundSkat = skattepligtigIndkomst * SKATTESATSER.bundSkat;

    // Kommuneskat
    const kommuneSkatBeloeb = skattepligtigIndkomst * (kommuneSkat / 100);

    // Kirkeskat (valgfri)
    const kirkeSkatBeloeb = medKirkeskat 
      ? skattepligtigIndkomst * SKATTESATSER.kirkeSkat 
      : 0;

    // Topskat
    const topSkatGrundlag = Math.max(0, loenEfterAM - SKATTESATSER.topSkatGraense);
    const topSkat = topSkatGrundlag * SKATTESATSER.topSkat;

    // Samlet skat
    const samletSkat = bundSkat + kommuneSkatBeloeb + kirkeSkatBeloeb + topSkat;

    // Nettoløn
    const aarligNetto = loenEfterAM - samletSkat;
    const maanedligNetto = aarligNetto / 12;

    // Effektiv skatteprocent
    const effektivSkat = aarligBrutto > 0 
      ? ((amBidrag + samletSkat + pensionsBidrag) / aarligBrutto) * 100 
      : 0;

    return {
      aarligBrutto,
      maanedligBrutto: aarligBrutto / 12,
      pensionsBidrag,
      amBidrag,
      loenEfterAM,
      beskaeftigelsesfradrag,
      personfradrag,
      skattepligtigIndkomst,
      bundSkat,
      kommuneSkatBeloeb,
      kirkeSkatBeloeb,
      topSkat,
      samletSkat,
      aarligNetto,
      maanedligNetto,
      effektivSkat,
    };
  }, [bruttoLoen, periode, medKirkeskat, kommuneSkat, pension]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8 print-area">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Bruttoløn ({periode === "maaned" ? "pr. måned" : "pr. år"})
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={bruttoLoen}
              onChange={(e) => setBruttoLoen(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Periode</label>
            <div className="flex gap-4">
              <button
                onClick={() => setPeriode("maaned")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "maaned"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Månedlig
              </button>
              <button
                onClick={() => setPeriode("aar")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "aar"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Årlig
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Kommuneskat (%)
            </label>
            <input
              type="number"
              min="20"
              max="30"
              step="0.01"
              value={kommuneSkat}
              onChange={(e) => setKommuneSkat(parseFloat(e.target.value) || 24.94)}
              className="w-full px-4 py-3 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Landsgennemsnit: 24,94%. Tjek din kommunes sats.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Arbejdsgiver pension (%)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              step="1"
              value={pension}
              onChange={(e) => setPension(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="kirkeskat"
              checked={medKirkeskat}
              onChange={(e) => setMedKirkeskat(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="kirkeskat" className="text-sm">
              Medlem af folkekirken (kirkeskat)
            </label>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-100 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Du får udbetalt (måned)</p>
          <p className="text-4xl font-bold text-green-700">
            {formatKr(beregning.maanedligNetto)}
          </p>
        </div>
        <div className="p-6 bg-green-50 rounded-xl text-center">
          <p className="text-sm text-gray-600 mb-1">Du får udbetalt (år)</p>
          <p className="text-4xl font-bold text-green-600">
            {formatKr(beregning.aarligNetto)}
          </p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          Effektiv skatteprocent: <strong>{beregning.effektivSkat.toFixed(1)}%</strong>
        </p>
      </div>

      {/* Share and Print buttons */}
      <div className="flex justify-center gap-3">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Lønberegner"
          resultSummary={`${formatKr(beregning.maanedligBrutto)} brutto → ${formatKr(beregning.maanedligNetto)} netto`}
        />
        <PrintResult
          calculatorName="Lønberegner"
          resultSummary={`${formatKr(beregning.maanedligBrutto)} brutto → ${formatKr(beregning.maanedligNetto)} netto`}
        />
      </div>

      {/* Detaljeret breakdown */}
      <details className="bg-gray-50 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium">
          Se detaljeret beregning
        </summary>
        <div className="p-4 pt-0 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Årlig bruttoløn</span>
            <span>{formatKr(beregning.aarligBrutto)}</span>
          </div>
          {beregning.pensionsBidrag > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>- Pension</span>
              <span>{formatKr(beregning.pensionsBidrag)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>- AM-bidrag (8%)</span>
            <span>{formatKr(beregning.amBidrag)}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>A-indkomst før skat</span>
            <span>{formatKr(beregning.loenEfterAM)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>- Personfradrag</span>
            <span>{formatKr(beregning.personfradrag)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>- Beskæftigelsesfradrag</span>
            <span>{formatKr(beregning.beskaeftigelsesfradrag)}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>Skattepligtig indkomst</span>
            <span>{formatKr(beregning.skattepligtigIndkomst)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Bundskat (12,22%)</span>
            <span>{formatKr(beregning.bundSkat)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Kommuneskat ({kommuneSkat}%)</span>
            <span>{formatKr(beregning.kommuneSkatBeloeb)}</span>
          </div>
          {medKirkeskat && (
            <div className="flex justify-between text-red-600">
              <span>Kirkeskat (0,68%)</span>
              <span>{formatKr(beregning.kirkeSkatBeloeb)}</span>
            </div>
          )}
          {beregning.topSkat > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Topskat (15%)</span>
              <span>{formatKr(beregning.topSkat)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-2 text-red-700">
            <span>Samlet skat</span>
            <span>{formatKr(beregning.samletSkat)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 text-green-700">
            <span>Årlig nettoløn</span>
            <span>{formatKr(beregning.aarligNetto)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
