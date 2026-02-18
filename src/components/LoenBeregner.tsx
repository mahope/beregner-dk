"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { InputField } from "@/components/InputField";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { KOMMUNER } from "@/lib/kommuner";

// 2026 danske skattesatser (ny skattereform med mellemskat/topskat/top-topskat)
// Kilde: skm.dk, skat.dk, martinsen.dk
const SKATTESATSER = {
  amBidrag: 0.08, // 8% AM-bidrag
  bundSkat: 0.1201, // 12,01% bundskat (ned fra 12,22%)
  kommuneSkatSnit: 0.2507, // Gennemsnitlig kommuneskat 2026
  kirkeSkat: 0.0068, // Gennemsnitlig kirkeskat (valgfri)
  // NY 2026: Mellemskat, topskat og top-topskat erstatter gammel topskat
  mellemSkatGraense: 641200, // Mellemskattegrænse (efter AM-bidrag)
  mellemSkat: 0.075, // 7,5% mellemskat
  topSkatGraense: 777900, // Topskattegrænse (efter AM-bidrag)
  topSkat: 0.075, // 7,5% topskat
  topTopSkatGraense: 2592700, // Top-topskattegrænse (efter AM-bidrag)
  topTopSkat: 0.05, // 5,0% top-topskat
  personfradrag: 54100, // Personfradrag 2026 (op fra 49.700)
  beskaeftigelsesfradragMax: 63300, // Max beskæftigelsesfradrag (op fra 45.100)
  beskaeftigelsesfradragPct: 0.1275, // 12,75% af lønindkomst (op fra 10,65%)
};

export default function LoenBeregner() {
  const [bruttoLoen, setBruttoLoen] = useState<number>(40000);
  const [periode, setPeriode] = useState<"maaned" | "aar">("maaned");
  const [medKirkeskat, setMedKirkeskat] = useState(true);
  const [kommuneSkat, setKommuneSkat] = useState(24.94);
  const [valgtKommune, setValgtKommune] = useState("");
  const [pension, setPension] = useState(0);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

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
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("loen-efter-skat");
    const timer = setTimeout(() => {
      trackCalculation("loen-efter-skat");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

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

    // Kirkeskat (valgfri) — brug kommune-specifik sats hvis valgt
    const kirkeSkatPct = valgtKommune
      ? (KOMMUNER.find(k => k.navn === valgtKommune)?.kirkeskat ?? SKATTESATSER.kirkeSkat * 100) / 100
      : SKATTESATSER.kirkeSkat;
    const kirkeSkatBeloeb = medKirkeskat
      ? skattepligtigIndkomst * kirkeSkatPct
      : 0;

    // NY 2026: Mellemskat (7,5% af indkomst over 641.200 kr)
    const mellemSkatGrundlag = Math.max(0, loenEfterAM - SKATTESATSER.mellemSkatGraense);
    const mellemSkat = mellemSkatGrundlag * SKATTESATSER.mellemSkat;

    // NY 2026: Topskat (7,5% af indkomst over 777.900 kr)
    const topSkatGrundlag = Math.max(0, loenEfterAM - SKATTESATSER.topSkatGraense);
    const topSkat = topSkatGrundlag * SKATTESATSER.topSkat;

    // NY 2026: Top-topskat (5% af indkomst over 2.592.700 kr)
    const topTopSkatGrundlag = Math.max(0, loenEfterAM - SKATTESATSER.topTopSkatGraense);
    const topTopSkat = topTopSkatGrundlag * SKATTESATSER.topTopSkat;

    // Samlet skat
    const samletSkat = bundSkat + kommuneSkatBeloeb + kirkeSkatBeloeb + mellemSkat + topSkat + topTopSkat;

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
      mellemSkat,
      topSkat,
      topTopSkat,
      samletSkat,
      aarligNetto,
      maanedligNetto,
      effektivSkat,
      kirkeSkatPct,
    };
  }, [bruttoLoen, periode, medKirkeskat, kommuneSkat, valgtKommune, pension]);

  // Beregn gevinst ved 1.000 kr mere i månedsløn
  const ekstraBeregning = useMemo(() => {
    if (periode !== "maaned") return null;
    const ekstraBrutto = 1000;
    const nyBrutto = (bruttoLoen + ekstraBrutto) * 12;
    const pensionBidrag = nyBrutto * (pension / 100);
    const loenEfterPension = nyBrutto - pensionBidrag;
    const amBidrag = loenEfterPension * SKATTESATSER.amBidrag;
    const loenEfterAM = loenEfterPension - amBidrag;
    const beskaeftigelsesfradrag = Math.min(
      loenEfterAM * SKATTESATSER.beskaeftigelsesfradragPct,
      SKATTESATSER.beskaeftigelsesfradragMax
    );
    const skattepligtigIndkomst = Math.max(0, loenEfterAM - SKATTESATSER.personfradrag - beskaeftigelsesfradrag);
    const kirkeSkatPct = valgtKommune
      ? (KOMMUNER.find(k => k.navn === valgtKommune)?.kirkeskat ?? SKATTESATSER.kirkeSkat * 100) / 100
      : SKATTESATSER.kirkeSkat;
    const bundSkat = skattepligtigIndkomst * SKATTESATSER.bundSkat;
    const kommuneSkatBeloeb = skattepligtigIndkomst * (kommuneSkat / 100);
    const kirkeSkatBeloeb = medKirkeskat ? skattepligtigIndkomst * kirkeSkatPct : 0;
    const mellemSkat = Math.max(0, loenEfterAM - SKATTESATSER.mellemSkatGraense) * SKATTESATSER.mellemSkat;
    const topSkat = Math.max(0, loenEfterAM - SKATTESATSER.topSkatGraense) * SKATTESATSER.topSkat;
    const topTopSkat = Math.max(0, loenEfterAM - SKATTESATSER.topTopSkatGraense) * SKATTESATSER.topTopSkat;
    const samletSkat = bundSkat + kommuneSkatBeloeb + kirkeSkatBeloeb + mellemSkat + topSkat + topTopSkat;
    const nyNetto = (loenEfterAM - samletSkat) / 12;
    return Math.round(nyNetto - beregning.maanedligNetto);
  }, [bruttoLoen, periode, medKirkeskat, kommuneSkat, valgtKommune, pension, beregning.maanedligNetto]);

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
          <InputField
            label={`Bruttoløn (${periode === "maaned" ? "pr. måned" : "pr. år"})`}
            value={bruttoLoen}
            onChange={setBruttoLoen}
            min={0}
            max={periode === "maaned" ? 500000 : 6000000}
            step={1000}
            required
            unit="kr"
            helpText={periode === "maaned" ? "Din månedlige løn før skat" : "Din årlige løn før skat"}
          />

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Periode</label>
            <div className="flex gap-4">
              <button
                onClick={() => setPeriode("maaned")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "maaned"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                Månedlig
              </button>
              <button
                onClick={() => setPeriode("aar")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  periode === "aar"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                Årlig
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Kommune
            </label>
            <select
              value={valgtKommune}
              onChange={(e) => {
                const kommuneNavn = e.target.value;
                setValgtKommune(kommuneNavn);
                if (kommuneNavn) {
                  const kommune = KOMMUNER.find(k => k.navn === kommuneNavn);
                  if (kommune) {
                    setKommuneSkat(kommune.kommuneskat);
                    setMedKirkeskat(true);
                  }
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Manuel indtastning (gennemsnit)</option>
              {KOMMUNER.map(k => (
                <option key={k.navn} value={k.navn}>
                  {k.navn} ({k.kommuneskat}%)
                </option>
              ))}
            </select>
            {valgtKommune && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Kirkeskat: {KOMMUNER.find(k => k.navn === valgtKommune)?.kirkeskat}%
              </p>
            )}
            {!valgtKommune && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Vælg kommune for præcis beregning
              </p>
            )}
          </div>

          {!valgtKommune && (
            <InputField
              label="Kommuneskat (%)"
              value={kommuneSkat}
              onChange={setKommuneSkat}
              min={20}
              max={30}
              step={0.01}
              unit="%"
              helpText="Landsgennemsnit: 24,94%"
            />
          )}

          <InputField
            label="Arbejdsgiver pension (%)"
            value={pension}
            onChange={setPension}
            min={0}
            max={20}
            step={1}
            unit="%"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="kirkeskat"
              checked={medKirkeskat}
              onChange={(e) => setMedKirkeskat(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="kirkeskat" className="text-sm dark:text-gray-300">
              Medlem af folkekirken (kirkeskat)
            </label>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Du får udbetalt (måned)</p>
          <p className="text-4xl font-bold text-green-700 dark:text-green-400">
            {formatKr(beregning.maanedligNetto)}
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Du får udbetalt (år)</p>
          <p className="text-4xl font-bold text-green-600 dark:text-green-400">
            {formatKr(beregning.aarligNetto)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Effektiv skatteprocent: <strong className="dark:text-white">{beregning.effektivSkat.toFixed(1)}%</strong>
          </p>
        </div>
        {ekstraBeregning !== null && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1.000 kr mere i bruttoløn = <strong className="text-green-700 dark:text-green-400">+{ekstraBeregning} kr</strong> netto/md
            </p>
          </div>
        )}
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
      <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          Se detaljeret beregning
        </summary>
        <div className="p-4 pt-0 space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between">
            <span>Årlig bruttoløn</span>
            <span>{formatKr(beregning.aarligBrutto)}</span>
          </div>
          {beregning.pensionsBidrag > 0 && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>- Pension</span>
              <span>{formatKr(beregning.pensionsBidrag)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>- AM-bidrag (8%)</span>
            <span>{formatKr(beregning.amBidrag)}</span>
          </div>
          <div className="flex justify-between font-medium border-t dark:border-gray-600 pt-2">
            <span>A-indkomst før skat</span>
            <span>{formatKr(beregning.loenEfterAM)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>- Personfradrag</span>
            <span>{formatKr(beregning.personfradrag)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>- Beskæftigelsesfradrag</span>
            <span>{formatKr(beregning.beskaeftigelsesfradrag)}</span>
          </div>
          <div className="flex justify-between border-t dark:border-gray-600 pt-2">
            <span>Skattepligtig indkomst</span>
            <span>{formatKr(beregning.skattepligtigIndkomst)}</span>
          </div>
          <div className="flex justify-between text-red-600 dark:text-red-400">
            <span>Bundskat (12,01%)</span>
            <span>{formatKr(beregning.bundSkat)}</span>
          </div>
          <div className="flex justify-between text-red-600 dark:text-red-400">
            <span>Kommuneskat ({kommuneSkat}%)</span>
            <span>{formatKr(beregning.kommuneSkatBeloeb)}</span>
          </div>
          {medKirkeskat && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Kirkeskat ({(beregning.kirkeSkatPct * 100).toFixed(2).replace('.', ',')}%)</span>
              <span>{formatKr(beregning.kirkeSkatBeloeb)}</span>
            </div>
          )}
          {beregning.mellemSkat > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Mellemskat (7,5%)</span>
              <span>{formatKr(beregning.mellemSkat)}</span>
            </div>
          )}
          {beregning.topSkat > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Topskat (7,5%)</span>
              <span>{formatKr(beregning.topSkat)}</span>
            </div>
          )}
          {beregning.topTopSkat > 0 && (
            <div className="flex justify-between text-red-600 dark:text-red-400">
              <span>Top-topskat (5%)</span>
              <span>{formatKr(beregning.topTopSkat)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t dark:border-gray-600 pt-2 text-red-700 dark:text-red-400">
            <span>Samlet skat</span>
            <span>{formatKr(beregning.samletSkat)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t dark:border-gray-600 pt-2 text-green-700 dark:text-green-400">
            <span>Årlig nettoløn</span>
            <span>{formatKr(beregning.aarligNetto)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
