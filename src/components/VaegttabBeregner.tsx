"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Koen = "mand" | "kvinde";
type Aktivitet = "stillesiddende" | "let" | "moderat" | "aktiv" | "meget_aktiv";

const AKTIVITETSFAKTORER: Record<Aktivitet, { faktor: number; label: string; beskrivelse: string }> = {
  stillesiddende: { faktor: 1.2, label: "Stillesiddende", beskrivelse: "Kontorarbejde, ingen motion" },
  let: { faktor: 1.375, label: "Let aktiv", beskrivelse: "Let motion 1-3 dage/uge" },
  moderat: { faktor: 1.55, label: "Moderat aktiv", beskrivelse: "Motion 3-5 dage/uge" },
  aktiv: { faktor: 1.725, label: "Aktiv", beskrivelse: "Hård motion 6-7 dage/uge" },
  meget_aktiv: { faktor: 1.9, label: "Meget aktiv", beskrivelse: "Fysisk krævende job + motion" },
};

// 1 kg fedt ≈ 7.700 kcal
const KCAL_PR_KG = 7700;

function beregnBMR(vaegt: number, hoejde: number, alder: number, koen: Koen): number {
  // Mifflin-St Jeor formel
  if (koen === "mand") {
    return 10 * vaegt + 6.25 * hoejde - 5 * alder + 5;
  }
  return 10 * vaegt + 6.25 * hoejde - 5 * alder - 161;
}

export default function VaegttabBeregner() {
  const [vaegt, setVaegt] = useState<string>("");
  const [maalVaegt, setMaalVaegt] = useState<string>("");
  const [hoejde, setHoejde] = useState<string>("");
  const [alder, setAlder] = useState<string>("");
  const [koen, setKoen] = useState<Koen>("mand");
  const [aktivitet, setAktivitet] = useState<Aktivitet>("moderat");
  const [uger, setUger] = useState<string>("12");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "vaegttab") {
      const i = urlState.inputs;
      if (i.vaegt !== undefined) setVaegt(String(i.vaegt));
      if (i.maalVaegt !== undefined) setMaalVaegt(String(i.maalVaegt));
      if (i.hoejde !== undefined) setHoejde(String(i.hoejde));
      if (i.alder !== undefined) setAlder(String(i.alder));
      if (i.koen !== undefined) setKoen(i.koen as Koen);
      if (i.aktivitet !== undefined) setAktivitet(i.aktivitet as Aktivitet);
      if (i.uger !== undefined) setUger(String(i.uger));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    const state: CalculationState = {
      type: "vaegttab",
      timestamp: Date.now(),
      inputs: {
        vaegt: Number(vaegt), maalVaegt: Number(maalVaegt), hoejde: Number(hoejde),
        alder: Number(alder), koen, aktivitet, uger: Number(uger),
      },
    };
    return generateShareableLink(state);
  }, [vaegt, maalVaegt, hoejde, alder, koen, aktivitet, uger]);

  useEffect(() => {
    initScrollDepthTracking("vaegttab");
  }, []);

  const resultat = useMemo(() => {
    const v = Number(vaegt);
    const mv = Number(maalVaegt);
    const h = Number(hoejde);
    const a = Number(alder);
    const u = Number(uger);

    if (!v || !mv || !h || !a || !u || v <= 0 || mv <= 0 || h <= 0 || a <= 0 || u <= 0) return null;
    if (mv >= v) return null; // Skal tabe sig

    const totalTab = v - mv;
    const kgPrUge = totalTab / u;
    const totalKcalDeficit = totalTab * KCAL_PR_KG;
    const dagligtDeficit = totalKcalDeficit / (u * 7);

    const bmr = beregnBMR(v, h, a, koen);
    const tdee = bmr * AKTIVITETSFAKTORER[aktivitet].faktor;
    const dagligtMaal = tdee - dagligtDeficit;

    // Advarsler
    const forHurtigt = kgPrUge > 1;
    const forLavtKalorier = dagligtMaal < (koen === "mand" ? 1500 : 1200);
    const sundt = kgPrUge <= 0.75 && dagligtMaal >= (koen === "mand" ? 1500 : 1200);

    // BMI start og slut
    const hoejdeM = h / 100;
    const bmiStart = v / (hoejdeM * hoejdeM);
    const bmiSlut = mv / (hoejdeM * hoejdeM);

    // Anbefalet tempo: 0.5-0.75 kg/uge
    const anbefaletUger = Math.ceil(totalTab / 0.5);
    const anbefaletDeficit = (totalTab * KCAL_PR_KG) / (anbefaletUger * 7);
    const anbefaletKalorier = tdee - anbefaletDeficit;

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("vaegttab");
    }

    return {
      totalTab,
      kgPrUge: Math.round(kgPrUge * 100) / 100,
      dagligtDeficit: Math.round(dagligtDeficit),
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dagligtMaal: Math.round(dagligtMaal),
      forHurtigt,
      forLavtKalorier,
      sundt,
      bmiStart: Math.round(bmiStart * 10) / 10,
      bmiSlut: Math.round(bmiSlut * 10) / 10,
      anbefaletUger,
      anbefaletKalorier: Math.round(anbefaletKalorier),
    };
  }, [vaegt, maalVaegt, hoejde, alder, koen, aktivitet, uger]);

  const handleReset = useCallback(() => {
    setVaegt("");
    setMaalVaegt("");
    setHoejde("");
    setAlder("");
    setKoen("mand");
    setAktivitet("moderat");
    setUger("12");
    hasTracked.current = false;
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Dine oplysninger</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="vaegt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nuværende vægt
            </label>
            <div className="relative">
              <input id="vaegt" type="number" value={vaegt} onChange={(e) => setVaegt(e.target.value)}
                placeholder="F.eks. 85" min="30" max="300"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label htmlFor="maalVaegt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Målvægt
            </label>
            <div className="relative">
              <input id="maalVaegt" type="number" value={maalVaegt} onChange={(e) => setMaalVaegt(e.target.value)}
                placeholder="F.eks. 75" min="30" max="300"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <div>
            <label htmlFor="hoejde" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Højde
            </label>
            <div className="relative">
              <input id="hoejde" type="number" value={hoejde} onChange={(e) => setHoejde(e.target.value)}
                placeholder="F.eks. 180" min="100" max="250"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
          </div>
          <div>
            <label htmlFor="alder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alder
            </label>
            <div className="relative">
              <input id="alder" type="number" value={alder} onChange={(e) => setAlder(e.target.value)}
                placeholder="F.eks. 35" min="15" max="100"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">år</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Køn</label>
          <div className="flex gap-3">
            {(["mand", "kvinde"] as const).map((k) => (
              <button key={k} onClick={() => setKoen(k)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                  koen === k ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {k === "mand" ? "Mand" : "Kvinde"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aktivitetsniveau</label>
          <div className="space-y-2">
            {(Object.entries(AKTIVITETSFAKTORER) as [Aktivitet, typeof AKTIVITETSFAKTORER.stillesiddende][]).map(([key, val]) => (
              <button key={key} onClick={() => setAktivitet(key)}
                className={`w-full text-left py-2.5 px-4 rounded-lg text-sm transition-colors ${
                  aktivitet === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                <span className="font-medium">{val.label}</span>
                <span className={`ml-2 ${aktivitet === key ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}>— {val.beskrivelse}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="uger" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tidsramme
          </label>
          <div className="relative">
            <input id="uger" type="number" value={uger} onChange={(e) => setUger(e.target.value)}
              min="1" max="104"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">uger</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          {/* Advarsler */}
          {resultat.forHurtigt && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
              <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">For hurtigt vægttab</h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {resultat.kgPrUge} kg/uge er mere end anbefalet (&lt; 0,5-1 kg/uge). For hurtigt vægttab kan føre til muskeltab, næringsmangel og jo-jo-effekt. Overvej en længere tidsramme på ca. <strong>{resultat.anbefaletUger} uger</strong>.
              </p>
            </div>
          )}

          {resultat.forLavtKalorier && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">For lavt kalorieindtag</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {resultat.dagligtMaal} kcal/dag er under den anbefalede minimumsgrænse ({koen === "mand" ? "1.500" : "1.200"} kcal). Vælg en længere tidsramme for at undgå sundhedsrisici.
              </p>
            </div>
          )}

          {/* Hovedresultat */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-200">
                Din vægttabsplan
              </h3>
              <div className="flex gap-2">
                <CopyResultButton
                  text={`Vægttab: ${resultat.totalTab} kg på ${uger} uger. Dagligt kaloriemål: ${resultat.dagligtMaal} kcal (underskud: ${resultat.dagligtDeficit} kcal/dag).`}
                />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Vægttab" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Dagligt kaloriemål</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{resultat.dagligtMaal.toLocaleString("da-DK")} kcal</p>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Dagligt underskud</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{resultat.dagligtDeficit.toLocaleString("da-DK")} kcal</p>
              </div>
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Vægttab pr. uge</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{resultat.kgPrUge} kg</p>
              </div>
            </div>

            {resultat.sundt && (
              <p className="mt-3 text-sm text-green-700 dark:text-green-300 bg-green-200/50 dark:bg-green-800/50 rounded-lg px-3 py-2">
                Dit tempo er sundt og realistisk. Du taber ca. {resultat.kgPrUge} kg pr. uge.
              </p>
            )}
          </div>

          {/* Detaljer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Detaljer</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet vægttab</span>
                <span className="font-medium dark:text-white">{resultat.totalTab} kg på {uger} uger</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Basalstofskifte (BMR)</span>
                <span className="font-medium dark:text-white">{resultat.bmr.toLocaleString("da-DK")} kcal/dag</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Dagligt energiforbrug (TDEE)</span>
                <span className="font-medium dark:text-white">{resultat.tdee.toLocaleString("da-DK")} kcal/dag</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">BMI start</span>
                <span className="font-medium dark:text-white">{resultat.bmiStart}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">BMI mål</span>
                <span className="font-medium dark:text-white">{resultat.bmiSlut}</span>
              </div>
            </div>
          </div>

          {/* Anbefaling hvis for hurtigt */}
          {resultat.forHurtigt && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Anbefalet plan</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Med et sundt tempo (0,5 kg/uge) vil det tage ca. <strong>{resultat.anbefaletUger} uger</strong>,
                og du kan spise <strong>{resultat.anbefaletKalorier.toLocaleString("da-DK")} kcal/dag</strong> — en meget mere overkommelig plan.
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende. Konsulter en læge eller diætist ved større vægttab. Individuelle faktorer som stofskifte, medicin og hormoner påvirker resultatet.
          </p>
        </div>
      )}
    </div>
  );
}
