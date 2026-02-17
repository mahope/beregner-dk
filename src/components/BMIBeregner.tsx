"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { trackCalculation } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { InputField } from "@/components/InputField";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

type Koen = "mand" | "kvinde";
type Enhed = "metrisk" | "imperial";

// Konverteringsfunktioner
function lbsToKg(lbs: number): number {
  return lbs * 0.453592;
}
function inchesToCm(inches: number): number {
  return inches * 2.54;
}
function kgToLbs(kg: number): number {
  return kg / 0.453592;
}
function cmToInches(cm: number): number {
  return cm / 2.54;
}

// BMI skala konfiguration
const BMI_ZONES = [
  { min: 0, max: 18.5, label: "Undervægtig", color: "bg-blue-400" },
  { min: 18.5, max: 25, label: "Normal", color: "bg-green-500" },
  { min: 25, max: 30, label: "Overvægtig", color: "bg-yellow-400" },
  { min: 30, max: 35, label: "Fedme I", color: "bg-orange-500" },
  { min: 35, max: 40, label: "Fedme II", color: "bg-red-500" },
  { min: 40, max: 50, label: "Fedme III", color: "bg-red-700" },
];

const SCALE_MIN = 10;
const SCALE_MAX = 50;

function BMISkala({ bmi }: { bmi: number }) {
  const clampedBmi = Math.max(SCALE_MIN, Math.min(SCALE_MAX, bmi));
  const position = ((clampedBmi - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;

  return (
    <div className="mt-6">
      <p className="text-sm font-medium mb-2 dark:text-gray-200">BMI skala</p>
      <div className="relative">
        {/* Farvede zoner */}
        <div className="flex h-6 rounded-full overflow-hidden">
          {BMI_ZONES.map((zone) => {
            const zoneStart = Math.max(zone.min, SCALE_MIN);
            const zoneEnd = Math.min(zone.max, SCALE_MAX);
            const width = ((zoneEnd - zoneStart) / (SCALE_MAX - SCALE_MIN)) * 100;
            return (
              <div
                key={zone.label}
                className={`${zone.color} relative`}
                style={{ width: `${width}%` }}
                title={`${zone.label}: ${zone.min}–${zone.max}`}
              />
            );
          })}
        </div>

        {/* Markør */}
        <div
          className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="w-0.5 h-6 bg-gray-900 dark:bg-white" />
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-white" />
          <span className="text-xs font-bold mt-0.5 dark:text-white">{bmi.toFixed(1)}</span>
        </div>

        {/* Tallabels under skala */}
        <div className="flex justify-between mt-5 text-[10px] text-gray-500 dark:text-gray-400 px-0.5">
          <span>10</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>35</span>
          <span>40</span>
          <span>50</span>
        </div>
      </div>
    </div>
  );
}

export default function BMIBeregner() {
  const [vaegt, setVaegt] = useState<number>(75);
  const [hoejde, setHoejde] = useState<number>(175);
  const [koen, setKoen] = useState<Koen>("mand");
  const [alder, setAlder] = useState<number>(30);
  const [enhed, setEnhed] = useState<Enhed>("metrisk");
  const [taljemaal, setTaljemaal] = useState<number>(0);
  const [hoftemaal, setHoftemaal] = useState<number>(0);
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bmi') {
      const inputs = urlState.inputs;
      if (inputs.vaegt !== undefined) setVaegt(inputs.vaegt);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.koen) setKoen(inputs.koen);
      if (inputs.alder !== undefined) setAlder(inputs.alder);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bmi',
      inputs: { vaegt, hoejde, koen, alder },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [vaegt, hoejde, koen, alder]);

  // Konverter input til metriske værdier til beregning
  const metriskVaegt = enhed === "imperial" ? lbsToKg(vaegt) : vaegt;
  const metriskHoejde = enhed === "imperial" ? inchesToCm(hoejde) : hoejde;

  const resultat = useMemo(() => {
    if (!metriskVaegt || !metriskHoejde || metriskHoejde === 0) {
      return null;
    }

    const hoejdeM = metriskHoejde / 100;
    const bmi = metriskVaegt / (hoejdeM * hoejdeM);

    let kategori: string;
    let farve: string;
    let beskrivelse: string;

    if (bmi < 18.5) {
      kategori = "Undervægtig";
      farve = "text-blue-600";
      beskrivelse = "Din BMI indikerer undervægt. Overvej at tale med en læge.";
    } else if (bmi < 25) {
      kategori = "Normalvægtig";
      farve = "text-green-600";
      beskrivelse = "Din BMI er inden for det normale område. Fortsæt den gode livsstil!";
    } else if (bmi < 30) {
      kategori = "Overvægtig";
      farve = "text-yellow-600";
      beskrivelse = "Din BMI indikerer overvægt. Små livsstilsændringer kan gøre en forskel.";
    } else if (bmi < 35) {
      kategori = "Fedme (klasse 1)";
      farve = "text-orange-600";
      beskrivelse = "Din BMI indikerer fedme. Overvej at tale med en læge om sunde vægttabsstrategier.";
    } else if (bmi < 40) {
      kategori = "Fedme (klasse 2)";
      farve = "text-red-500";
      beskrivelse = "Din BMI indikerer svær fedme. Det anbefales at søge professionel hjælp.";
    } else {
      kategori = "Fedme (klasse 3)";
      farve = "text-red-700";
      beskrivelse = "Din BMI indikerer meget svær fedme. Søg professionel medicinsk hjælp.";
    }

    // Beregn idealvægt
    const idealVaegtMinKg = 18.5 * (hoejdeM * hoejdeM);
    const idealVaegtMaxKg = 24.9 * (hoejdeM * hoejdeM);

    return {
      bmi,
      bmiFormatted: bmi.toFixed(1),
      kategori,
      farve,
      beskrivelse,
      idealVaegtMin: idealVaegtMinKg.toFixed(0),
      idealVaegtMax: idealVaegtMaxKg.toFixed(0),
    };
  }, [metriskVaegt, metriskHoejde]);

  // Talje-hofte ratio
  const taljeHofteResultat = useMemo(() => {
    if (!taljemaal || !hoftemaal || hoftemaal === 0) return null;

    const metriskTalje = enhed === "imperial" ? inchesToCm(taljemaal) : taljemaal;
    const metriskHofte = enhed === "imperial" ? inchesToCm(hoftemaal) : hoftemaal;
    const ratio = metriskTalje / metriskHofte;

    let risikoNiveau: string;
    let farve: string;

    if (koen === "mand") {
      if (ratio < 0.90) {
        risikoNiveau = "Lav risiko";
        farve = "text-green-600";
      } else if (ratio < 1.0) {
        risikoNiveau = "Moderat risiko";
        farve = "text-yellow-600";
      } else {
        risikoNiveau = "Høj risiko";
        farve = "text-red-600";
      }
    } else {
      if (ratio < 0.80) {
        risikoNiveau = "Lav risiko";
        farve = "text-green-600";
      } else if (ratio < 0.85) {
        risikoNiveau = "Moderat risiko";
        farve = "text-yellow-600";
      } else {
        risikoNiveau = "Høj risiko";
        farve = "text-red-600";
      }
    }

    return {
      ratio: ratio.toFixed(2),
      risikoNiveau,
      farve,
    };
  }, [taljemaal, hoftemaal, koen, enhed]);

  // Track calculation once per session when user changes values
  useEffect(() => {
    if (resultat && !hasTracked.current) {
      const timer = setTimeout(() => {
        trackCalculation("bmi");
        hasTracked.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resultat]);

  // Håndter enhedsskift med konvertering af værdier
  const handleEnhedSkift = (nyEnhed: Enhed) => {
    if (nyEnhed === enhed) return;

    if (nyEnhed === "imperial") {
      setVaegt(Math.round(kgToLbs(vaegt) * 10) / 10);
      setHoejde(Math.round(cmToInches(hoejde) * 10) / 10);
      if (taljemaal) setTaljemaal(Math.round(cmToInches(taljemaal) * 10) / 10);
      if (hoftemaal) setHoftemaal(Math.round(cmToInches(hoftemaal) * 10) / 10);
    } else {
      setVaegt(Math.round(lbsToKg(vaegt) * 10) / 10);
      setHoejde(Math.round(inchesToCm(hoejde) * 10) / 10);
      if (taljemaal) setTaljemaal(Math.round(inchesToCm(taljemaal) * 10) / 10);
      if (hoftemaal) setHoftemaal(Math.round(inchesToCm(hoftemaal) * 10) / 10);
    }
    setEnhed(nyEnhed);
  };

  const vaegtLabel = enhed === "metrisk" ? "Vægt (kg)" : "Vægt (lbs)";
  const hoejdeLabel = enhed === "metrisk" ? "Højde (cm)" : "Højde (inches)";
  const maalEnhed = enhed === "metrisk" ? "cm" : "inches";

  return (
    <div className="space-y-8 print-area">
      {/* Enhedsvalg */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
          <button
            onClick={() => handleEnhedSkift("metrisk")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              enhed === "metrisk"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            kg / cm
          </button>
          <button
            onClick={() => handleEnhedSkift("imperial")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              enhed === "imperial"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            lbs / inches
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            label={vaegtLabel}
            value={vaegt}
            onChange={setVaegt}
            min={enhed === "metrisk" ? 30 : 66}
            max={enhed === "metrisk" ? 300 : 660}
            step={0.1}
            required
          />

          <InputField
            label={hoejdeLabel}
            value={hoejde}
            onChange={setHoejde}
            min={enhed === "metrisk" ? 100 : 39}
            max={enhed === "metrisk" ? 250 : 98}
            step={0.1}
            required
          />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Køn</label>
            <div className="flex gap-4">
              <button
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                }`}
              >
                Mand
              </button>
              <button
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

          <InputField
            label="Alder"
            value={alder}
            onChange={setAlder}
            min={18}
            max={120}
            required
          />
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Dit BMI</p>
            <p className={`text-5xl font-bold ${resultat.farve}`}>
              {resultat.bmiFormatted}
            </p>
            <p className={`text-xl font-medium mt-2 ${resultat.farve}`}>
              {resultat.kategori}
            </p>
          </div>

          {/* Grafisk BMI skala */}
          <BMISkala bmi={resultat.bmi} />

          <p className="text-gray-600 dark:text-gray-300 text-center mt-6 mb-6">{resultat.beskrivelse}</p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Idealvægt for din højde: <strong className="dark:text-white">{resultat.idealVaegtMin} - {resultat.idealVaegtMax} kg</strong>
            </p>
          </div>

          {/* Share and Print buttons */}
          <div className="mt-4 flex justify-center gap-3">
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="BMI Beregner"
              resultSummary={`BMI ${resultat.bmiFormatted} - ${resultat.kategori}`}
            />
            <PrintResult
              calculatorName="BMI Beregner"
              resultSummary={`BMI ${resultat.bmiFormatted} - ${resultat.kategori}`}
            />
          </div>
        </div>
      )}

      {/* Talje-hofte ratio */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-1 dark:text-white">Talje-hofte ratio (valgfrit)</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Supplerer BMI med en vurdering af fedtfordelingen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label={`Taljemål (${maalEnhed})`}
            value={taljemaal}
            onChange={setTaljemaal}
            min={0}
            max={enhed === "metrisk" ? 200 : 79}
            step={0.1}
            helpText="Mål ved navlen"
          />
          <InputField
            label={`Hoftemål (${maalEnhed})`}
            value={hoftemaal}
            onChange={setHoftemaal}
            min={0}
            max={enhed === "metrisk" ? 200 : 79}
            step={0.1}
            helpText="Mål ved det bredeste punkt"
          />
        </div>

        {taljeHofteResultat && (
          <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Talje-hofte ratio</p>
                <p className="text-2xl font-bold dark:text-white">{taljeHofteResultat.ratio}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${taljeHofteResultat.farve}`}>
                  {taljeHofteResultat.risikoNiveau}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {koen === "mand" ? "Mænd: < 0,90 = lav" : "Kvinder: < 0,80 = lav"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BMI kategorier tabel */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium mb-3 dark:text-white">BMI kategorier (voksne)</h3>
        <div className="space-y-2 text-sm dark:text-gray-300">
          <div className="flex justify-between">
            <span className="text-blue-600 dark:text-blue-400">Under 18,5</span>
            <span>Undervægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-600 dark:text-green-400">18,5 - 24,9</span>
            <span>Normalvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-yellow-600 dark:text-yellow-400">25,0 - 29,9</span>
            <span>Overvægtig</span>
          </div>
          <div className="flex justify-between">
            <span className="text-orange-600 dark:text-orange-400">30,0 - 34,9</span>
            <span>Fedme (klasse 1)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-500 dark:text-red-400">35,0 - 39,9</span>
            <span>Fedme (klasse 2)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-700 dark:text-red-500">40+</span>
            <span>Fedme (klasse 3)</span>
          </div>
        </div>
      </div>

      {/* WHO info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-medium mb-2 dark:text-white">Om talje-hofte ratio</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Talje-hofte ratioen (WHR) supplerer BMI ved at vurdere, hvor fedtet sidder på kroppen.
          Fedt omkring maven (æbleform) giver højere sundhedsrisiko end fedt på hofter og lår (pæreform).
          WHO anbefaler en ratio under 0,90 for mænd og under 0,85 for kvinder.
        </p>
      </div>
    </div>
  );
}
