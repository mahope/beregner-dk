"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Home, Percent, Calculator } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

// Nyt ejendomsskattesystem fra 2024 (boligskattereformen)
// Kilde: skm.dk, info.skat.dk, vurderingsportalen.dk
const EJENDOMSVAERDISKAT = {
  lavSats: 0.0051, // 5,1‰ (0,51%)
  hoejSats: 0.014, // 14‰ (1,4%)
  progressionsgraense: 9007000, // 9.007.000 kr beskatningsgrundlag (2026-2027)
  forsigtighedsfradrag: 0.20, // 20% forsigtighedsfradrag
};

// Grundskyldspromiller for de største kommuner (2024-2028)
// Kilde: skm.dk, bolig.guide, vurderingsportalen.dk
interface KommuneData {
  navn: string;
  promille: number;
}

const KOMMUNER: Record<string, KommuneData> = {
  koebenhavn: { navn: "København", promille: 5.1 },
  frederiksberg: { navn: "Frederiksberg", promille: 3.1 },
  aarhus: { navn: "Aarhus", promille: 6.0 },
  aalborg: { navn: "Aalborg", promille: 7.4 },
  odense: { navn: "Odense", promille: 5.7 },
  vejle: { navn: "Vejle", promille: 10.5 },
  roskilde: { navn: "Roskilde", promille: 7.4 },
  kolding: { navn: "Kolding", promille: 11.1 },
  helsingoer: { navn: "Helsingør", promille: 9.5 },
  silkeborg: { navn: "Silkeborg", promille: 11.0 },
  herning: { navn: "Herning", promille: 9.9 },
  horsens: { navn: "Horsens", promille: 8.7 },
  randers: { navn: "Randers", promille: 13.9 },
  esbjerg: { navn: "Esbjerg", promille: 9.9 },
  gentofte: { navn: "Gentofte", promille: 5.1 },
  gladsaxe: { navn: "Gladsaxe", promille: 5.9 },
  lyngby: { navn: "Lyngby-Taarbæk", promille: 6.7 },
  hvidovre: { navn: "Hvidovre", promille: 6.5 },
  ballerup: { navn: "Ballerup", promille: 8.3 },
  hilleroed: { navn: "Hillerød", promille: 6.6 },
  koege: { navn: "Køge", promille: 5.3 },
  holbaek: { navn: "Holbæk", promille: 8.1 },
  naestved: { navn: "Næstved", promille: 9.8 },
  slagelse: { navn: "Slagelse", promille: 11.1 },
  viborg: { navn: "Viborg", promille: 11.5 },
  fredericia: { navn: "Fredericia", promille: 13.0 },
  greve: { navn: "Greve", promille: 5.5 },
  rudersdal: { navn: "Rudersdal", promille: 9.6 },
  svendborg: { navn: "Svendborg", promille: 8.8 },
  bornholm: { navn: "Bornholm", promille: 10.7 },
};

const sortedKommuner = Object.entries(KOMMUNER).sort((a, b) =>
  a[1].navn.localeCompare(b[1].navn, "da")
);

export default function EjendomsvaerdiskatBeregner() {
  const [ejendomsvaerdi, setEjendomsvaerdi] = useState<number>(3000000);
  const [grundvaerdi, setGrundvaerdi] = useState<number>(1000000);
  const [valgtKommune, setValgtKommune] = useState<string>("koebenhavn");
  const [customPromille, setCustomPromille] = useState<number>(6.0);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'ejendomsvaerdiskat') {
      const inputs = urlState.inputs;
      if (inputs.ejendomsvaerdi !== undefined) setEjendomsvaerdi(inputs.ejendomsvaerdi);
      if (inputs.grundvaerdi !== undefined) setGrundvaerdi(inputs.grundvaerdi);
      if (inputs.valgtKommune) setValgtKommune(inputs.valgtKommune);
      if (inputs.customPromille !== undefined) setCustomPromille(inputs.customPromille);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("ejendomsvaerdiskat");
    const timer = setTimeout(() => {
      trackCalculation("ejendomsvaerdiskat");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'ejendomsvaerdiskat',
      inputs: { ejendomsvaerdi, grundvaerdi, valgtKommune, customPromille },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [ejendomsvaerdi, grundvaerdi, valgtKommune, customPromille]);

  const grundskyldPromille =
    valgtKommune === "custom"
      ? customPromille
      : KOMMUNER[valgtKommune]?.promille ?? 6.0;

  const resultat = useMemo(() => {
    // Beskatningsgrundlag = 80% af ejendomsværdi (20% forsigtighedsfradrag)
    const beskatningsgrundlag =
      ejendomsvaerdi * (1 - EJENDOMSVAERDISKAT.forsigtighedsfradrag);

    // Ejendomsværdiskat: 5,1‰ op til progressionsgrænse, 14‰ over
    let ejendomsvaerdiskat = 0;
    if (beskatningsgrundlag <= EJENDOMSVAERDISKAT.progressionsgraense) {
      ejendomsvaerdiskat = beskatningsgrundlag * EJENDOMSVAERDISKAT.lavSats;
    } else {
      const under = EJENDOMSVAERDISKAT.progressionsgraense;
      const over = beskatningsgrundlag - under;
      ejendomsvaerdiskat =
        under * EJENDOMSVAERDISKAT.lavSats +
        over * EJENDOMSVAERDISKAT.hoejSats;
    }

    // Grundskyld: grundskyldspromille × 80% af grundværdi
    const grundvaerdiBeskatning =
      grundvaerdi * (1 - EJENDOMSVAERDISKAT.forsigtighedsfradrag);
    const grundskyld = grundvaerdiBeskatning * (grundskyldPromille / 1000);

    // Samlet
    const samlet = ejendomsvaerdiskat + grundskyld;
    const maanedligt = samlet / 12;

    return {
      beskatningsgrundlag: Math.round(beskatningsgrundlag),
      ejendomsvaerdiskat: Math.round(ejendomsvaerdiskat),
      grundvaerdiBeskatning: Math.round(grundvaerdiBeskatning),
      grundskyld: Math.round(grundskyld),
      samlet: Math.round(samlet),
      maanedligt: Math.round(maanedligt),
    };
  }, [ejendomsvaerdi, grundvaerdi, grundskyldPromille]);

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
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              <Home className="inline w-4 h-4 mr-1" />
              Ejendomsværdi (kr)
            </label>
            <input
              type="number"
              min="0"
              max="50000000"
              step="50000"
              value={ejendomsvaerdi}
              onChange={(e) =>
                setEjendomsvaerdi(parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Vurdering fra Vurderingsstyrelsen ({formatKr(ejendomsvaerdi)})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              <Percent className="inline w-4 h-4 mr-1" />
              Grundværdi (kr)
            </label>
            <input
              type="number"
              min="0"
              max="20000000"
              step="25000"
              value={grundvaerdi}
              onChange={(e) =>
                setGrundvaerdi(parseFloat(e.target.value) || 0)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Grundens vurdering ({formatKr(grundvaerdi)})
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              <Calculator className="inline w-4 h-4 mr-1" />
              Kommune
            </label>
            <select
              value={valgtKommune}
              onChange={(e) => setValgtKommune(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg dark:bg-gray-700 dark:text-white"
            >
              {sortedKommuner.map(([key, data]) => (
                <option key={key} value={key}>
                  {data.navn} ({data.promille}‰)
                </option>
              ))}
              <option value="custom">Anden kommune (indtast selv)</option>
            </select>
            {valgtKommune === "custom" && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Grundskyldspromille (‰)
                </label>
                <input
                  type="number"
                  min="1"
                  max="35"
                  step="0.1"
                  value={customPromille}
                  onChange={(e) =>
                    setCustomPromille(parseFloat(e.target.value) || 6)
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Grundskyldspromille: {grundskyldPromille}‰
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Nyt system fra 2024:</strong> Ejendomsværdiskat beregnes
              af 80% af vurderet ejendomsværdi (20% forsigtighedsfradrag).
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              5,1‰ op til {formatKr(EJENDOMSVAERDISKAT.progressionsgraense)} |
              14‰ over (2026)
            </p>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Samlet årlig ejendomsskat
          </p>
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {formatKr(resultat.samlet)}
          </p>
          <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">
            {formatKr(resultat.maanedligt)} / måned
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-center">
            <p className="text-sm text-purple-600 dark:text-purple-400">
              <Home className="inline w-4 h-4 mr-1" />
              Ejendomsværdiskat
            </p>
            <p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
              {formatKr(resultat.ejendomsvaerdiskat)}/år
            </p>
            <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">
              5,1‰ af {formatKr(resultat.beskatningsgrundlag)}
              {resultat.beskatningsgrundlag >
                EJENDOMSVAERDISKAT.progressionsgraense && " (+ 14‰ over grænse)"}
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <Percent className="inline w-4 h-4 mr-1" />
              Grundskyld
            </p>
            <p className="font-bold text-2xl text-orange-700 dark:text-orange-300">
              {formatKr(resultat.grundskyld)}/år
            </p>
            <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
              {grundskyldPromille}‰ af {formatKr(resultat.grundvaerdiBeskatning)}
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            <strong>Bemærk:</strong> Disse tal er estimater baseret på 2026-satser
            og det nye ejendomsskattesystem. Den faktiske skat afhænger af din
            ejendomsskattebillet fra kommunen.
          </p>
        </div>
      </div>

      {/* Detaljeret breakdown */}
      <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          Se detaljeret beregning
        </summary>
        <div className="p-4 pt-0 space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600">
            <span>Ejendomsværdi (vurdering)</span>
            <span>{formatKr(ejendomsvaerdi)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            <span>− 20% forsigtighedsfradrag</span>
            <span>
              {formatKr(ejendomsvaerdi * EJENDOMSVAERDISKAT.forsigtighedsfradrag)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 font-medium">
            <span>Beskatningsgrundlag (80%)</span>
            <span>{formatKr(resultat.beskatningsgrundlag)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 text-purple-700 dark:text-purple-400">
            <span>Ejendomsværdiskat (5,1‰{resultat.beskatningsgrundlag > EJENDOMSVAERDISKAT.progressionsgraense ? " / 14‰" : ""})</span>
            <span>{formatKr(resultat.ejendomsvaerdiskat)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 mt-4">
            <span>Grundværdi (vurdering)</span>
            <span>{formatKr(grundvaerdi)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400">
            <span>− 20% forsigtighedsfradrag</span>
            <span>
              {formatKr(grundvaerdi * EJENDOMSVAERDISKAT.forsigtighedsfradrag)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-600 text-orange-700 dark:text-orange-400">
            <span>Grundskyld ({grundskyldPromille}‰)</span>
            <span>{formatKr(resultat.grundskyld)}</span>
          </div>
          <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-gray-300 dark:border-gray-600 mt-2 text-blue-700 dark:text-blue-400">
            <span>Samlet ejendomsskat</span>
            <span>{formatKr(resultat.samlet)}</span>
          </div>
        </div>
      </details>

      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatKr(resultat.samlet)}/år (${formatKr(resultat.maanedligt)}/md)`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Ejendomsværdiskat-beregner"
          resultSummary={`${formatKr(resultat.samlet)}/år (${formatKr(resultat.maanedligt)}/md)`}
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
          Om det nye ejendomsskattesystem (2024+)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Ejendomsværdiskat
            </h4>
            <ul className="mt-2 space-y-1">
              <li>
                - Beregnes af 80% af ejendomsværdien (forsigtighedsfradrag)
              </li>
              <li>- 5,1‰ op til progressionsgrænsen</li>
              <li>
                - 14‰ af beløb over {formatKr(EJENDOMSVAERDISKAT.progressionsgraense)}
              </li>
              <li>- Betales til staten</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">
              Grundskyld
            </h4>
            <ul className="mt-2 space-y-1">
              <li>- Beregnes af 80% af grundværdien</li>
              <li>- Satsen (promille) varierer efter kommune</li>
              <li>- Fra 3,1‰ (Frederiksberg) til 17,7‰ (Varde)</li>
              <li>- Betales til din kommune</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
