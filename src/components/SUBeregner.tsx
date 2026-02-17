"use client";

import { useState, useMemo } from "react";

// SU-satser 2026 (officielle satser fra su.dk)
// Kilde: su.dk/satser
const SU_SATSER_2026 = {
  // Videregående uddannelser - pr. måned (før skat)
  videregaaende_udeboende: 7426,
  videregaaende_hjemmeboende: 3692, // Studerende påbegyndt før 1. juli 2014
  videregaaende_hjemmeboende_ny: 1154, // Grundsats (1. juli 2014+), tillæg afhænger af forældres indkomst

  // Ungdomsuddannelser - pr. måned (før skat)
  ungdom_udeboende_20plus: 7426,
  ungdom_udeboende_18_19: 4764, // + evt. indkomstafhængigt tillæg
  ungdom_hjemmeboende: 1154, // Grundsats, tillæg afhænger af forældres indkomst

  // Forsørger (estimat baseret på regulering)
  forsorger: 8575,

  // Fribeløb pr. måned (før AM-bidrag)
  fribeloeb_ungdom: 15297,
  fribeloeb_videregaaende: 20749,

  // SU-lån
  studielaan: 3799, // Pr. måned

  // Tillæg
  handicaptillaeg: 9463, // Pr. måned (skattefrit)
  forsorgertillaeg: 6000, // Pr. måned ekstra for enlige forsørgere (estimat)
};

type Boligstatus = "udeboende" | "hjemmeboende" | "foraelder";
type Uddannelsestype = "videregaaende" | "ungdom";

export default function SUBeregner() {
  const [uddannelse, setUddannelse] = useState<Uddannelsestype>("videregaaende");
  const [boligstatus, setBoligstatus] = useState<Boligstatus>("udeboende");
  const [arbejdsindkomst, setArbejdsindkomst] = useState<number>(5000);
  const [antalMaaneder, setAntalMaaneder] = useState<number>(12);
  const [harHandicap, setHarHandicap] = useState(false);
  const [erEnligForsorger, setErEnligForsorger] = useState(false);

  const beregning = useMemo(() => {
    // Basis SU-sats afhængig af uddannelse og boligstatus
    let basisSU: number;
    if (boligstatus === "foraelder") {
      basisSU = SU_SATSER_2026.forsorger;
    } else if (boligstatus === "udeboende") {
      basisSU = uddannelse === "videregaaende"
        ? SU_SATSER_2026.videregaaende_udeboende
        : SU_SATSER_2026.ungdom_udeboende_20plus;
    } else {
      basisSU = uddannelse === "videregaaende"
        ? SU_SATSER_2026.videregaaende_hjemmeboende
        : SU_SATSER_2026.ungdom_hjemmeboende;
    }

    // Tillæg
    let tillaeg = 0;
    if (harHandicap) {
      tillaeg += SU_SATSER_2026.handicaptillaeg;
    }
    if (erEnligForsorger && boligstatus === "foraelder") {
      tillaeg += SU_SATSER_2026.forsorgertillaeg;
    }

    const samletBrutto = basisSU + tillaeg;

    // Skat (estimat ~38% af skattepligtig del)
    // Handicaptillæg er skattefrit
    const skattepligtigDel = samletBrutto - (harHandicap ? SU_SATSER_2026.handicaptillaeg : 0);
    const skat = skattepligtigDel * 0.38;
    const samletNetto = samletBrutto - skat;

    // Fribeløb afhænger af uddannelsestype
    const maanedligtFribeloeb = uddannelse === "videregaaende"
      ? SU_SATSER_2026.fribeloeb_videregaaende
      : SU_SATSER_2026.fribeloeb_ungdom;
    const aarligtFribeloeb = maanedligtFribeloeb * antalMaaneder;

    // Beregn om indkomst overstiger fribeløb
    const aarligArbejdsindkomst = arbejdsindkomst * 12;
    const overFribeloeb = Math.max(0, aarligArbejdsindkomst - aarligtFribeloeb);

    return {
      basisSU,
      tillaeg,
      samletBrutto,
      skat,
      samletNetto,
      maanedligtFribeloeb,
      aarligtFribeloeb,
      aarligArbejdsindkomst,
      overFribeloeb,
      tilbagebetaling: overFribeloeb,
      aarligSUBrutto: samletBrutto * antalMaaneder,
      aarligSUNetto: samletNetto * antalMaaneder,
      studielaan: SU_SATSER_2026.studielaan,
    };
  }, [uddannelse, boligstatus, arbejdsindkomst, antalMaaneder, harHandicap, erEnligForsorger]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
      {/* Uddannelsestype */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Uddannelsestype</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            onClick={() => setUddannelse("videregaaende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              uddannelse === "videregaaende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Videregående uddannelse</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Universitet, professionsbachelor, erhvervsakademi</div>
          </button>
          <button
            onClick={() => setUddannelse("ungdom")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              uddannelse === "ungdom"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Ungdomsuddannelse</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Gymnasium, HF, EUX, erhvervsuddannelse</div>
          </button>
        </div>
      </div>

      {/* Boligstatus */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Din boligsituation</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setBoligstatus("udeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "udeboende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Udeboende</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bor ikke hos forældre</div>
          </button>
          <button
            onClick={() => setBoligstatus("hjemmeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "hjemmeboende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Hjemmeboende</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bor hos forældre</div>
          </button>
          <button
            onClick={() => setBoligstatus("foraelder")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "foraelder"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Forsørger</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Har børn under 18</div>
          </button>
        </div>
      </div>

      {/* Andre inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Forventet arbejdsindkomst (pr. måned, før skat)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            value={arbejdsindkomst}
            onChange={(e) => setArbejdsindkomst(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Månedlig arbejdsindkomst før skat"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Antal SU-måneder i år
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value={antalMaaneder}
            onChange={(e) => setAntalMaaneder(parseInt(e.target.value) || 12)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            aria-label="Antal måneder med SU i år"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="handicap"
            checked={harHandicap}
            onChange={(e) => setHarHandicap(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="handicap" className="text-sm text-gray-700 dark:text-gray-300">
            Modtager handicaptillæg
          </label>
        </div>
        {boligstatus === "foraelder" && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enlig"
              checked={erEnligForsorger}
              onChange={(e) => setErEnligForsorger(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="enlig" className="text-sm text-gray-700 dark:text-gray-300">
              Enlig forsørger
            </label>
          </div>
        )}
      </div>

      {/* Resultat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Månedlig SU (efter skat)</p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {formatKr(beregning.samletNetto)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            (før skat: {formatKr(beregning.samletBrutto)})
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Årlig SU ({antalMaaneder} mdr)</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatKr(beregning.aarligSUNetto)}
          </p>
        </div>
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Muligt SU-lån</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {formatKr(beregning.studielaan)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">pr. måned</p>
        </div>
      </div>

      {/* Fribeløb warning */}
      {beregning.overFribeloeb > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-lg">
          <p className="font-medium text-red-800 dark:text-red-300">Du overskrider dit fribeløb!</p>
          <p className="text-red-700 dark:text-red-400">
            Din forventede årsindkomst ({formatKr(beregning.aarligArbejdsindkomst)}) overstiger
            dit fribeløb ({formatKr(beregning.aarligtFribeloeb)}) med {formatKr(beregning.overFribeloeb)}.
          </p>
          <p className="text-red-700 dark:text-red-400 mt-1">
            Du risikerer at skulle tilbagebetale ca. <strong>{formatKr(beregning.tilbagebetaling)}</strong>
          </p>
        </div>
      )}

      {beregning.overFribeloeb <= 0 && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-green-800 dark:text-green-300">
            Du holder dig under fribeløbet. Resterende: {formatKr(beregning.aarligtFribeloeb - beregning.aarligArbejdsindkomst)}
          </p>
        </div>
      )}

      {/* Info boks */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-white">Officielle SU-satser 2026</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Videregående</p>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Udeboende</span>
              <span>{formatKr(SU_SATSER_2026.videregaaende_udeboende)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Hjemmeboende</span>
              <span>{formatKr(SU_SATSER_2026.videregaaende_hjemmeboende)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Forsørger</span>
              <span>{formatKr(SU_SATSER_2026.forsorger)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Fribeløb</span>
              <span>{formatKr(SU_SATSER_2026.fribeloeb_videregaaende)}/md</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Ungdomsuddannelse</p>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Udeboende (20+)</span>
              <span>{formatKr(SU_SATSER_2026.ungdom_udeboende_20plus)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Udeboende (18-19)</span>
              <span>{formatKr(SU_SATSER_2026.ungdom_udeboende_18_19)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Fribeløb</span>
              <span>{formatKr(SU_SATSER_2026.fribeloeb_ungdom)}/md</span>
            </div>
            <div className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>SU-lån</span>
              <span>{formatKr(SU_SATSER_2026.studielaan)}/md</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Kilde: su.dk/satser — Alle beløb er før skat
        </p>
      </div>
    </div>
  );
}
