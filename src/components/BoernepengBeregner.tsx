"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency } from '@/lib/format';

// 2026 satser for børne- og ungeydelse (officielle satser)
// Kilde: borger.dk/familie-og-boern/Familieydelser-oversigt/Boerne-ungeydelse
const SATSER_2026 = {
  barn_0_2: 5370, // 0-2 år, pr. kvartal (21.480 kr/år)
  barn_3_6: 4251, // 3-6 år, pr. kvartal (17.004 kr/år)
  barn_7_14: 3345, // 7-14 år, pr. kvartal (13.380 kr/år)
  unge_15_17_maaned: 1115, // 15-17 år, pr. måned (13.380 kr/år)
  indkomstgraense: 961100, // Årlig indkomstgrænse for aftrapning (2026)
  aftrapningPct: 0.02, // 2% aftrapning af beløb over grænsen
};

interface Barn {
  id: string;
  alder: number;
}

export default function BoernepengBeregner() {
  const { locale } = useLocale();
  const [boern, setBoern] = useState<Barn[]>([
    { id: "1", alder: 5 },
  ]);
  const [husstandsIndkomst, setHusstandsIndkomst] = useState<number>(600000);
  const [enlig, setEnlig] = useState(false);
  const [deltForaeldremyndighed, setDeltForaeldremyndighed] = useState(true);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'boernepenge') {
      const inputs = urlState.inputs;
      if (inputs.boern !== undefined) setBoern(inputs.boern);
      if (inputs.husstandsIndkomst !== undefined) setHusstandsIndkomst(inputs.husstandsIndkomst);
      if (inputs.enlig !== undefined) setEnlig(inputs.enlig);
      if (inputs.deltForaeldremyndighed !== undefined) setDeltForaeldremyndighed(inputs.deltForaeldremyndighed);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("boernepenge");
    const timer = setTimeout(() => {
      trackCalculation("boernepenge");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'boernepenge',
      inputs: { boern, husstandsIndkomst, enlig, deltForaeldremyndighed },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [boern, husstandsIndkomst, enlig, deltForaeldremyndighed]);

  const handleReset = useCallback(() => {
    setBoern([{ id: "1", alder: 5 }]);
    setHusstandsIndkomst(600000);
    setEnlig(false);
    setDeltForaeldremyndighed(true);
  }, []);

  const tilfoejBarn = () => {
    setBoern([...boern, { id: crypto.randomUUID(), alder: 0 }]);
  };

  const fjernBarn = (id: string) => {
    if (boern.length > 1) {
      setBoern(boern.filter((b) => b.id !== id));
    }
  };

  const opdaterAlder = (id: string, alder: number) => {
    setBoern(boern.map((b) => (b.id === id ? { ...b, alder } : b)));
  };

  const beregning = useMemo(() => {
    // Beregn ydelse per barn
    const ydelsePrBarn = boern.map((barn) => {
      let aarligYdelse: number;
      let kategori: string;
      let udbetalingstype: string;

      if (barn.alder <= 2) {
        aarligYdelse = SATSER_2026.barn_0_2 * 4;
        kategori = "0-2 år";
        udbetalingstype = "kvartal";
      } else if (barn.alder <= 6) {
        aarligYdelse = SATSER_2026.barn_3_6 * 4;
        kategori = "3-6 år";
        udbetalingstype = "kvartal";
      } else if (barn.alder <= 14) {
        aarligYdelse = SATSER_2026.barn_7_14 * 4;
        kategori = "7-14 år";
        udbetalingstype = "kvartal";
      } else if (barn.alder <= 17) {
        aarligYdelse = SATSER_2026.unge_15_17_maaned * 12;
        kategori = "15-17 år";
        udbetalingstype = "maaned";
      } else {
        aarligYdelse = 0;
        kategori = "Over 18";
        udbetalingstype = "ingen";
      }

      return {
        alder: barn.alder,
        kategori,
        udbetalingstype,
        aarlig: aarligYdelse,
        kvartal: aarligYdelse / 4,
        maanedlig: aarligYdelse / 12,
      };
    });

    // Samlet før aftrapning
    const samletAarlig = ydelsePrBarn.reduce((sum, y) => sum + y.aarlig, 0);

    // Beregn evt. aftrapning (kun for høje indkomster)
    // Aftrapning: 2% af beløbet over indkomstgrænsen
    let aftrapning = 0;
    if (husstandsIndkomst > SATSER_2026.indkomstgraense) {
      const overGraense = husstandsIndkomst - SATSER_2026.indkomstgraense;
      aftrapning = overGraense * SATSER_2026.aftrapningPct;
      aftrapning = Math.min(aftrapning, samletAarlig);
    }

    const samletEfterAftrapning = Math.max(0, samletAarlig - aftrapning);

    // Siden 2022 deles ydelsen som standard mellem forældre med fælles forældremyndighed
    const dinAndel = deltForaeldremyndighed ? samletEfterAftrapning / 2 : samletEfterAftrapning;

    return {
      boern: ydelsePrBarn,
      samletAarlig,
      aftrapning,
      samletEfterAftrapning,
      dinAndel,
      maanedlig: dinAndel / 12,
      kvartal: dinAndel / 4,
      deltMellemForaeldre: deltForaeldremyndighed,
    };
  }, [boern, husstandsIndkomst, enlig, deltForaeldremyndighed]);

  const formatKr = (beloeb: number) => formatCurrency(beloeb, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Børn input */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Dine børn</h2>
        <div className="space-y-3">
          {boern.map((barn, index) => (
            <div key={barn.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">Barn {index + 1}:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={barn.alder}
                  onChange={(e) => opdaterAlder(barn.id, parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  aria-label={`Alder for barn ${index + 1}`}
                />
                <span className="text-gray-600 dark:text-gray-300">år</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({beregning.boern[index]?.kategori})
              </span>
              {boern.length > 1 && (
                <button type="button"
                  onClick={() => fjernBarn(barn.id)}
                  className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label={`Fjern barn ${index + 1}`}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button"
          onClick={tilfoejBarn}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          + Tilføj barn
        </button>
      </div>

      {/* Indkomst og indstillinger */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Husstandens samlede indkomst (årlig)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="10000"
              value={husstandsIndkomst}
              onChange={(e) => setHusstandsIndkomst(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 pr-14 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-label="Husstandens samlede årlige indkomst"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr/år</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Bruges til at beregne evt. aftrapning (over {formatKr(SATSER_2026.indkomstgraense)})
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enlig"
              checked={enlig}
              onChange={(e) => setEnlig(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="enlig" className="text-sm text-gray-700 dark:text-gray-300">
              Enlig forsørger
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="deltForaeldremyndighed"
              checked={deltForaeldremyndighed}
              onChange={(e) => setDeltForaeldremyndighed(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="deltForaeldremyndighed" className="text-sm text-gray-700 dark:text-gray-300">
              Fælles forældremyndighed (ydelsen deles)
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {beregning.deltMellemForaeldre ? "Din månedlige andel" : "Månedlig udbetaling"}
          </p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {formatKr(beregning.maanedlig)}
          </p>
        </div>
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {beregning.deltMellemForaeldre ? "Din kvartalsvise andel" : "Kvartalsvis"}
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatKr(beregning.kvartal)}
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {beregning.deltMellemForaeldre ? "Din årlige andel" : "Årlig total"}
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatKr(beregning.dinAndel)}
          </p>
        </div>
      </div>

      {beregning.deltMellemForaeldre && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Delt ydelse:</strong> Siden 2022 deles ydelsen som standard mellem forældre med fælles forældremyndighed. Den samlede årlige ydelse er {formatKr(beregning.samletEfterAftrapning)} — du modtager halvdelen.
          </p>
        </div>
      )}

      {beregning.aftrapning > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Bemærk:</strong> Din indkomst er over grænsen på {formatKr(SATSER_2026.indkomstgraense)}, så ydelsen aftrappes med {formatKr(beregning.aftrapning)} årligt.
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <CopyResultButton text={`${formatKr(beregning.maanedlig)}/md (${formatKr(beregning.dinAndel)}/år)`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Børnepengeberegner"
          resultSummary={`${formatKr(beregning.maanedlig)}/md (${formatKr(beregning.dinAndel)}/år)`}
        />
      </div>

      {/* Detaljer per barn */}
      {beregning.boern.length > 1 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Ydelse per barn (før evt. deling)</h3>
          <div className="space-y-2 text-sm">
            {beregning.boern.map((barn, index) => (
              <div key={index} className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Barn {index + 1} ({barn.kategori})</span>
                <span>{formatKr(barn.aarlig)} årligt</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Satser tabel */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Officielle satser 2026</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>0-2 år</span>
            <span>{formatKr(SATSER_2026.barn_0_2)} pr. kvartal ({formatKr(SATSER_2026.barn_0_2 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>3-6 år</span>
            <span>{formatKr(SATSER_2026.barn_3_6)} pr. kvartal ({formatKr(SATSER_2026.barn_3_6 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>7-14 år</span>
            <span>{formatKr(SATSER_2026.barn_7_14)} pr. kvartal ({formatKr(SATSER_2026.barn_7_14 * 4)} årligt)</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>15-17 år (ungeydelse)</span>
            <span>{formatKr(SATSER_2026.unge_15_17_maaned)} pr. måned ({formatKr(SATSER_2026.unge_15_17_maaned * 12)} årligt)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Kilde: borger.dk — Aftrapningsgrænse: {formatKr(SATSER_2026.indkomstgraense)}
        </p>
      </div>
    </div>
  );
}
