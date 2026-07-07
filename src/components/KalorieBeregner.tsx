"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Koen = "mand" | "kvinde";
type AktivitetsNiveau = "stillesiddende" | "let" | "moderat" | "aktiv" | "meget_aktiv";

const AKTIVITETS_FAKTORER: Record<AktivitetsNiveau, { faktor: number; label: string; beskrivelse: string }> = {
  stillesiddende: { faktor: 1.2, label: "Stillesiddende", beskrivelse: "Kontorarbejde, ingen motion" },
  let: { faktor: 1.375, label: "Let aktivitet", beskrivelse: "Let motion 1-3 dage/uge" },
  moderat: { faktor: 1.55, label: "Moderat aktivitet", beskrivelse: "Moderat motion 3-5 dage/uge" },
  aktiv: { faktor: 1.725, label: "Aktiv", beskrivelse: "Hård træning 6-7 dage/uge" },
  meget_aktiv: { faktor: 1.9, label: "Meget aktiv", beskrivelse: "Atletisk træning 2x dagligt" },
};

export default function KalorieBeregner() {
  const [alder, setAlder] = useState<number>(30);
  const [koen, setKoen] = useState<Koen>("mand");
  const [vaegt, setVaegt] = useState<number>(75);
  const [hoejde, setHoejde] = useState<number>(175);
  const [aktivitet, setAktivitet] = useState<AktivitetsNiveau>("moderat");
  const [maal, setMaal] = useState<"vedligehold" | "tab" | "opbyg">("vedligehold");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'kalorier') {
      const inputs = urlState.inputs;
      if (inputs.alder !== undefined) setAlder(inputs.alder);
      if (inputs.koen) setKoen(inputs.koen);
      if (inputs.vaegt !== undefined) setVaegt(inputs.vaegt);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.aktivitet) setAktivitet(inputs.aktivitet);
      if (inputs.maal) setMaal(inputs.maal);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kalorier");
    const timer = setTimeout(() => {
      trackCalculation("kalorier");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'kalorier',
      inputs: { alder, koen, vaegt, hoejde, aktivitet, maal },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [alder, koen, vaegt, hoejde, aktivitet, maal]);

  const handleReset = useCallback(() => {
    setAlder(30);
    setKoen("mand");
    setVaegt(75);
    setHoejde(175);
    setAktivitet("moderat");
    setMaal("vedligehold");
  }, []);

  const resultat = useMemo(() => {
    // Mifflin-St Jeor formel
    let bmr: number;
    if (koen === "mand") {
      bmr = 10 * vaegt + 6.25 * hoejde - 5 * alder + 5;
    } else {
      bmr = 10 * vaegt + 6.25 * hoejde - 5 * alder - 161;
    }

    const tdee = bmr * AKTIVITETS_FAKTORER[aktivitet].faktor;

    let anbefaletKalorier: number;
    let maalBeskrivelse: string;

    switch (maal) {
      case "tab":
        anbefaletKalorier = tdee - 500;
        maalBeskrivelse = "For at tabe ca. 0.5 kg pr. uge";
        break;
      case "opbyg":
        anbefaletKalorier = tdee + 300;
        maalBeskrivelse = "For at opbygge muskelmasse";
        break;
      default:
        anbefaletKalorier = tdee;
        maalBeskrivelse = "For at vedligeholde din vægt";
    }

    // Makronæringsstoffer
    const protein = vaegt * 1.8;
    const fedt = (anbefaletKalorier * 0.25) / 9;
    const kulhydrater = Math.max(0, (anbefaletKalorier - (protein * 4) - (fedt * 9)) / 4);

    // Alle tre mål til sammenligning
    const tabKcal = Math.round(tdee - 500);
    const vedligKcal = Math.round(tdee);
    const opbygKcal = Math.round(tdee + 300);

    // Makro-procenter
    const proteinKcal = protein * 4;
    const fedtKcal = fedt * 9;
    const kulhKcal = kulhydrater * 4;
    const totalKcal = proteinKcal + fedtKcal + kulhKcal;
    const proteinPct = totalKcal > 0 ? (proteinKcal / totalKcal) * 100 : 0;
    const fedtPct = totalKcal > 0 ? (fedtKcal / totalKcal) * 100 : 0;
    const kulhPct = totalKcal > 0 ? (kulhKcal / totalKcal) * 100 : 0;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      anbefalet: Math.round(anbefaletKalorier),
      maalBeskrivelse,
      protein: Math.round(protein),
      fedt: Math.round(fedt),
      kulhydrater: Math.round(Math.max(0, kulhydrater)),
      tabKcal, vedligKcal, opbygKcal,
      proteinPct, fedtPct, kulhPct,
    };
  }, [alder, koen, vaegt, hoejde, aktivitet, maal]);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Køn</label>
            <div className="flex gap-4">
              <button type="button"
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                Mand
              </button>
              <button type="button"
                onClick={() => setKoen("kvinde")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "kvinde"
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                Kvinde
              </button>
            </div>
          </div>

          <InputField label="Alder" value={alder} onChange={setAlder} min={15} max={100} unit="år" />
          <InputField label="Vægt" value={vaegt} onChange={setVaegt} min={30} max={300} unit="kg" />
          <InputField label="Højde" value={hoejde} onChange={setHoejde} min={100} max={250} unit="cm" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Aktivitetsniveau</label>
            <div className="space-y-2">
              {Object.entries(AKTIVITETS_FAKTORER).map(([key, value]) => (
                <button type="button"
                  key={key}
                  onClick={() => setAktivitet(key as AktivitetsNiveau)}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                    aktivitet === key
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                  }`}
                >
                  <span className="font-medium">{value.label}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({value.beskrivelse})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Dit mål</label>
            <div className="flex gap-2">
              {([
                { id: "tab" as const, label: "Tab vægt", border: "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300" },
                { id: "vedligehold" as const, label: "Vedligehold", border: "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
                { id: "opbyg" as const, label: "Opbyg", border: "border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
              ]).map((m) => (
                <button type="button"
                  key={m.id}
                  onClick={() => setMaal(m.id)}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                    maal === m.id
                      ? m.border
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dagligt kaloriebehov</p>
          <p className="text-5xl font-bold text-green-600 dark:text-green-400">
            {resultat.anbefalet} kcal
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{resultat.maalBeskrivelse}</p>
        </div>

        {/* Alle tre mål sammenlignet */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`p-3 rounded-lg text-center ${maal === "tab" ? "bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500" : "bg-gray-50 dark:bg-gray-700"}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vægttab</p>
            <p className="font-bold text-lg dark:text-white">{resultat.tabKcal}</p>
            <p className="text-xs text-gray-400">-500 kcal</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${maal === "vedligehold" ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500" : "bg-gray-50 dark:bg-gray-700"}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vedligehold</p>
            <p className="font-bold text-lg dark:text-white">{resultat.vedligKcal}</p>
            <p className="text-xs text-gray-400">TDEE</p>
          </div>
          <div className={`p-3 rounded-lg text-center ${maal === "opbyg" ? "bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-500" : "bg-gray-50 dark:bg-gray-700"}`}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Muskelopbyg</p>
            <p className="font-bold text-lg dark:text-white">{resultat.opbygKcal}</p>
            <p className="text-xs text-gray-400">+300 kcal</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Basalstofskifte (BMR)</p>
            <p className="font-bold text-lg dark:text-white">{resultat.bmr} kcal</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Vedligehold (TDEE)</p>
            <p className="font-bold text-lg dark:text-white">{resultat.tdee} kcal</p>
          </div>
        </div>

        {/* Makrofordeling med visuel bar */}
        <div className="border-t dark:border-gray-600 pt-6">
          <h3 className="font-semibold mb-4 text-center dark:text-white">Foreslået makrofordeling</h3>

          {/* Visuel bar */}
          <div className="flex h-6 rounded-full overflow-hidden mb-4">
            <div className="bg-red-400" style={{ width: `${resultat.proteinPct}%` }} title={`Protein: ${resultat.proteinPct.toFixed(0)}%`} />
            <div className="bg-yellow-400" style={{ width: `${resultat.fedtPct}%` }} title={`Fedt: ${resultat.fedtPct.toFixed(0)}%`} />
            <div className="bg-blue-400" style={{ width: `${resultat.kulhPct}%` }} title={`Kulhydrater: ${resultat.kulhPct.toFixed(0)}%`} />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">Protein</p>
              <p className="font-bold text-xl dark:text-white">{resultat.protein}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{resultat.protein * 4} kcal ({resultat.proteinPct.toFixed(0)}%)</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Fedt</p>
              <p className="font-bold text-xl dark:text-white">{resultat.fedt}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{resultat.fedt * 9} kcal ({resultat.fedtPct.toFixed(0)}%)</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">Kulhydrater</p>
              <p className="font-bold text-xl dark:text-white">{resultat.kulhydrater}g</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{resultat.kulhydrater * 4} kcal ({resultat.kulhPct.toFixed(0)}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Del beregning */}
      <div className="flex justify-center">
        <CopyResultButton text={`${resultat.anbefalet} kcal/dag (${resultat.maalBeskrivelse.toLowerCase()})`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Kalorieberegner"
          resultSummary={`${resultat.anbefalet} kcal/dag (${resultat.maalBeskrivelse.toLowerCase()})`}
        />
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-800 dark:text-blue-200">Hvad betyder tallene?</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li><strong>BMR:</strong> Kalorier din krop brænder i hvile (bare for at leve)</li>
          <li><strong>TDEE:</strong> Totalt dagligt forbrug inkl. aktivitet</li>
          <li><strong>-500 kcal:</strong> Giver ca. 0.5 kg vægttab pr. uge</li>
          <li><strong>+300 kcal:</strong> Giver overskud til muskelopbygning</li>
        </ul>
      </div>
    </div>
  );
}
