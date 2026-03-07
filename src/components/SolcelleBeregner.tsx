"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Retning = "syd" | "sydvest" | "sydoest" | "vest" | "oest";

const RETNINGSFAKTORER: Record<Retning, { faktor: number; label: string }> = {
  syd: { faktor: 1.0, label: "Syd (optimalt)" },
  sydvest: { faktor: 0.95, label: "Sydvest" },
  sydoest: { faktor: 0.95, label: "Sydøst" },
  vest: { faktor: 0.8, label: "Vest" },
  oest: { faktor: 0.8, label: "Øst" },
};

// Danmark gennemsnit: ca. 950 kWh/kWp/år
const KWH_PR_KWP = 950;

export default function SolcelleBeregner() {
  const [anlaegStr, setAnlaegStr] = useState<string>("6"); // kWp
  const [retning, setRetning] = useState<Retning>("syd");
  const [aarligtForbrug, setAarligtForbrug] = useState<string>("4000"); // kWh
  const [elPris, setElPris] = useState<string>("2.5"); // kr./kWh
  const [anlaegPris, setAnlaegPris] = useState<string>(""); // total pris
  const [prisPrKwp, setPrisPrKwp] = useState<string>("12000"); // kr./kWp

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "solceller") {
      const i = urlState.inputs;
      if (i.anlaegStr !== undefined) setAnlaegStr(String(i.anlaegStr));
      if (i.retning !== undefined) setRetning(i.retning as Retning);
      if (i.aarligtForbrug !== undefined) setAarligtForbrug(String(i.aarligtForbrug));
      if (i.elPris !== undefined) setElPris(String(i.elPris));
      if (i.anlaegPris !== undefined) setAnlaegPris(String(i.anlaegPris));
      if (i.prisPrKwp !== undefined) setPrisPrKwp(String(i.prisPrKwp));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "solceller", timestamp: Date.now(),
      inputs: { anlaegStr: Number(anlaegStr), retning, aarligtForbrug: Number(aarligtForbrug), elPris: Number(elPris), anlaegPris: Number(anlaegPris), prisPrKwp: Number(prisPrKwp) },
    });
  }, [anlaegStr, retning, aarligtForbrug, elPris, anlaegPris, prisPrKwp]);

  useEffect(() => { initScrollDepthTracking("solceller"); }, []);

  // Beregn anlægspris fra kWp hvis ikke angivet manuelt
  const effektivAnlaegPris = useMemo(() => {
    const manuel = Number(anlaegPris);
    if (manuel > 0) return manuel;
    return Number(anlaegStr) * Number(prisPrKwp);
  }, [anlaegPris, anlaegStr, prisPrKwp]);

  const resultat = useMemo(() => {
    const kwp = Number(anlaegStr);
    const forbrug = Number(aarligtForbrug);
    const pris = Number(elPris);

    if (!kwp || kwp <= 0 || !forbrug || forbrug <= 0 || !pris || pris <= 0 || effektivAnlaegPris <= 0) return null;

    const retningsFaktor = RETNINGSFAKTORER[retning].faktor;
    const aarligProduktion = Math.round(kwp * KWH_PR_KWP * retningsFaktor);

    // Egetforbrug: typisk 30% af produktion bruges direkte (uden batteri)
    const egetForbrugPct = 0.30;
    const egetForbrug = Math.round(Math.min(aarligProduktion * egetForbrugPct, forbrug));
    const overskud = aarligProduktion - egetForbrug;

    // Besparelse: egetforbrug sparer fuld elpris, overskud sælges til nettoafregning (ca. 0,80 kr./kWh)
    const nettoPris = 0.80;
    const besparelseEget = egetForbrug * pris;
    const besparelseOverskud = overskud * nettoPris;
    const aarligBesparelse = besparelseEget + besparelseOverskud;

    const tilbagebetalingsAar = effektivAnlaegPris / aarligBesparelse;

    // Over 25 år (typisk levetid)
    const levetid = 25;
    const totalBesparelse = aarligBesparelse * levetid;
    const nettoGevinst = totalBesparelse - effektivAnlaegPris;

    // CO2-reduktion: ca. 0,14 kg CO2/kWh i Danmark (marginal)
    const co2PrKwh = 0.14;
    const aarligCO2 = Math.round(aarligProduktion * co2PrKwh);

    // Selvforsyningsgrad
    const selvforsyning = Math.round((egetForbrug / forbrug) * 100);

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("solceller");
    }

    return {
      aarligProduktion,
      egetForbrug,
      overskud,
      besparelseEget: Math.round(besparelseEget),
      besparelseOverskud: Math.round(besparelseOverskud),
      aarligBesparelse: Math.round(aarligBesparelse),
      tilbagebetalingsAar: Math.round(tilbagebetalingsAar * 10) / 10,
      totalBesparelse: Math.round(totalBesparelse),
      nettoGevinst: Math.round(nettoGevinst),
      aarligCO2,
      selvforsyning: Math.min(selvforsyning, 100),
      anlaegPrisEffektiv: effektivAnlaegPris,
    };
  }, [anlaegStr, retning, aarligtForbrug, elPris, effektivAnlaegPris]);

  const handleReset = useCallback(() => {
    setAnlaegStr("6");
    setRetning("syd");
    setAarligtForbrug("4000");
    setElPris("2.5");
    setAnlaegPris("");
    setPrisPrKwp("12000");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Solcelleanlæg</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="anlaegStr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Anlæg størrelse
            </label>
            <div className="relative">
              <input id="anlaegStr" type="number" value={anlaegStr} onChange={(e) => setAnlaegStr(e.target.value)}
                step="0.5" min="1" max="30"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWp</span>
            </div>
          </div>
          <div>
            <label htmlFor="aarligtForbrug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Årligt elforbrug
            </label>
            <div className="relative">
              <input id="aarligtForbrug" type="number" value={aarligtForbrug} onChange={(e) => setAarligtForbrug(e.target.value)}
                min="100"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagretning</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(Object.entries(RETNINGSFAKTORER) as [Retning, typeof RETNINGSFAKTORER.syd][]).map(([key, val]) => (
              <button key={key} onClick={() => setRetning(key)}
                className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  retning === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="elPris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Elpris (inkl. afgifter)
            </label>
            <div className="relative">
              <input id="elPris" type="number" value={elPris} onChange={(e) => setElPris(e.target.value)}
                step="0.1" min="0.5"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-20 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr./kWh</span>
            </div>
          </div>
          <div>
            <label htmlFor="prisPrKwp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pris pr. kWp
            </label>
            <div className="relative">
              <input id="prisPrKwp" type="number" value={prisPrKwp} onChange={(e) => { setPrisPrKwp(e.target.value); setAnlaegPris(""); }}
                min="5000"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr./kWp</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="anlaegPris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Samlet anlægspris (valgfrit — beregnes ellers fra kWp-pris)
          </label>
          <div className="relative">
            <input id="anlaegPris" type="number" value={anlaegPris} onChange={(e) => setAnlaegPris(e.target.value)}
              placeholder={`Beregnet: ${effektivAnlaegPris.toLocaleString("da-DK")}`} min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">Din solcellebesparelse</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Solceller ${anlaegStr} kWp: ${resultat.aarligProduktion.toLocaleString("da-DK")} kWh/år, besparelse ${formatKr(resultat.aarligBesparelse)}/år, tilbagebetalt på ${resultat.tilbagebetalingsAar} år.`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Solceller" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Årlig besparelse</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatKr(resultat.aarligBesparelse)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Tilbagebetalingstid</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{resultat.tilbagebetalingsAar} år</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">Årlig produktion</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{resultat.aarligProduktion.toLocaleString("da-DK")} kWh</p>
              </div>
            </div>
          </div>

          {/* Detaljer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Økonomi over 25 år</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Anlægspris</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.anlaegPrisEffektiv)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Besparelse egetforbrug ({resultat.egetForbrug.toLocaleString("da-DK")} kWh/år)</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.besparelseEget)}/år</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Salg af overskud ({resultat.overskud.toLocaleString("da-DK")} kWh/år)</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.besparelseOverskud)}/år</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total besparelse (25 år)</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatKr(resultat.totalBesparelse)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Nettogevinst (25 år)</span>
                <span className={`font-bold text-lg ${resultat.nettoGevinst >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatKr(resultat.nettoGevinst)}
                </span>
              </div>
            </div>
          </div>

          {/* Miljø */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 text-center">
              <p className="text-sm text-green-700 dark:text-green-400">CO₂-reduktion pr. år</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{resultat.aarligCO2} kg</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-400">Selvforsyningsgrad</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{resultat.selvforsyning}%</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende. Faktisk produktion afhænger af tagvinkel, skyggeforhold og vejr. Nettoafregningspris varierer. Kontakt en installatør for præcist tilbud.
          </p>
        </div>
      )}
    </div>
  );
}
