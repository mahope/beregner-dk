"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

// SU-lån satser 2026
const SATSER = {
  renteUnderUddannelse: 4, // % p.a. (variabel, baseret på diskontoen + tillæg)
  renteEfterUddannelse: 4, // % p.a. (variabel)
  standardLoebetid: 7, // år (kan forlænges til 15)
  maxSULaanPrMd: 3234, // kr. pr. md. 2026
  tilbagebetalingsStart: 1, // år efter uddannelse
};

export default function StudielaanBeregner() {
  const [samletGaeld, setSamletGaeld] = useState<string>("");
  const [rente, setRente] = useState<string>(String(SATSER.renteEfterUddannelse));
  const [loebetid, setLoebetid] = useState<string>(String(SATSER.standardLoebetid));
  const [ekstraAfdrag, setEkstraAfdrag] = useState<string>("0");
  const [maanedligIndkomst, setMaanedligIndkomst] = useState<string>("");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "studielaan") {
      const i = urlState.inputs;
      if (i.samletGaeld !== undefined) setSamletGaeld(String(i.samletGaeld));
      if (i.rente !== undefined) setRente(String(i.rente));
      if (i.loebetid !== undefined) setLoebetid(String(i.loebetid));
      if (i.ekstraAfdrag !== undefined) setEkstraAfdrag(String(i.ekstraAfdrag));
      if (i.maanedligIndkomst !== undefined) setMaanedligIndkomst(String(i.maanedligIndkomst));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "studielaan", timestamp: Date.now(),
      inputs: { samletGaeld: Number(samletGaeld), rente: Number(rente), loebetid: Number(loebetid), ekstraAfdrag: Number(ekstraAfdrag), maanedligIndkomst: Number(maanedligIndkomst) },
    });
  }, [samletGaeld, rente, loebetid, ekstraAfdrag, maanedligIndkomst]);

  useEffect(() => { initScrollDepthTracking("studielaan"); }, []);

  const resultat = useMemo(() => {
    const gaeld = Number(samletGaeld);
    const r = Number(rente) / 100 / 12;
    const aar = Number(loebetid);
    const ekstra = Number(ekstraAfdrag) || 0;

    if (!gaeld || gaeld <= 0 || !aar || aar <= 0) return null;

    const n = aar * 12;

    // Standard annuitetsydelse
    let standardYdelse = 0;
    if (r > 0) {
      standardYdelse = gaeld * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      standardYdelse = gaeld / n;
    }

    const totalYdelse = standardYdelse + ekstra;
    const totalBetaling = standardYdelse * n;
    const totalRente = totalBetaling - gaeld;

    // Med ekstra afdrag: beregn ny løbetid
    let faktiskMaaneder = n;
    let totalBetalingMedEkstra = totalBetaling;
    let totalRenteMedEkstra = totalRente;

    if (ekstra > 0) {
      let restgaeld = gaeld;
      let maaneder = 0;
      let totalBetalt = 0;

      while (restgaeld > 0 && maaneder < 360) {
        const renteBeloeb = restgaeld * r;
        const ydelse = Math.min(totalYdelse, restgaeld + renteBeloeb);
        restgaeld = restgaeld + renteBeloeb - ydelse;
        totalBetalt += ydelse;
        maaneder++;
      }

      faktiskMaaneder = maaneder;
      totalBetalingMedEkstra = totalBetalt;
      totalRenteMedEkstra = totalBetalt - gaeld;
    }

    const sparetRente = totalRente - totalRenteMedEkstra;
    const sparetMaaneder = n - faktiskMaaneder;

    // Indkomstafhængig vurdering
    const indkomst = Number(maanedligIndkomst);
    const procentAfIndkomst = indkomst > 0 ? (totalYdelse / indkomst) * 100 : 0;

    // Afdragsplan (første 12 måneder + hvert år)
    const plan: { maaned: number; ydelse: number; rente: number; afdrag: number; restgaeld: number }[] = [];
    let rg = gaeld;
    for (let m = 1; m <= Math.min(faktiskMaaneder, 180); m++) {
      const renteM = rg * r;
      const yd = Math.min(totalYdelse, rg + renteM);
      const afd = yd - renteM;
      rg = Math.max(0, rg - afd);

      if (m <= 12 || m % 12 === 0) {
        plan.push({ maaned: m, ydelse: Math.round(yd), rente: Math.round(renteM), afdrag: Math.round(afd), restgaeld: Math.round(rg) });
      }
    }

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("studielaan");
    }

    return {
      standardYdelse: Math.round(standardYdelse),
      totalYdelse: Math.round(totalYdelse),
      totalBetaling: Math.round(totalBetaling),
      totalRente: Math.round(totalRente),
      faktiskMaaneder,
      faktiskAar: Math.floor(faktiskMaaneder / 12),
      faktiskMdr: faktiskMaaneder % 12,
      totalBetalingMedEkstra: Math.round(totalBetalingMedEkstra),
      totalRenteMedEkstra: Math.round(totalRenteMedEkstra),
      sparetRente: Math.round(sparetRente),
      sparetMaaneder,
      procentAfIndkomst: Math.round(procentAfIndkomst * 10) / 10,
      plan,
      harEkstra: ekstra > 0,
    };
  }, [samletGaeld, rente, loebetid, ekstraAfdrag, maanedligIndkomst]);

  const handleReset = useCallback(() => {
    setSamletGaeld("");
    setRente(String(SATSER.renteEfterUddannelse));
    setLoebetid(String(SATSER.standardLoebetid));
    setEkstraAfdrag("0");
    setMaanedligIndkomst("");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Dit SU-lån</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div>
          <label htmlFor="samletGaeld" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Samlet SU-gæld
          </label>
          <div className="relative">
            <input id="samletGaeld" type="number" value={samletGaeld} onChange={(e) => setSamletGaeld(e.target.value)}
              placeholder="F.eks. 100000" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Find dit beløb på minSU.dk eller i SU-låneoversigten
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rente (p.a.)
            </label>
            <div className="relative">
              <input id="rente" type="number" value={rente} onChange={(e) => setRente(e.target.value)}
                step="0.1" min="0" max="15"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="loebetid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Løbetid
            </label>
            <div className="relative">
              <input id="loebetid" type="number" value={loebetid} onChange={(e) => setLoebetid(e.target.value)}
                min="1" max="15"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">år</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="ekstraAfdrag" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ekstra månedligt afdrag (valgfrit)
          </label>
          <div className="relative">
            <input id="ekstraAfdrag" type="number" value={ekstraAfdrag} onChange={(e) => setEkstraAfdrag(e.target.value)}
              placeholder="0" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>

        <div>
          <label htmlFor="maanedligIndkomst" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Månedlig indkomst efter skat (valgfrit)
          </label>
          <div className="relative">
            <input id="maanedligIndkomst" type="number" value={maanedligIndkomst} onChange={(e) => setMaanedligIndkomst(e.target.value)}
              placeholder="F.eks. 25000" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Din tilbagebetalingsplan</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`SU-lån: ${formatKr(resultat.totalYdelse)}/md i ${resultat.faktiskAar} år${resultat.faktiskMdr > 0 ? ` og ${resultat.faktiskMdr} mdr.` : ""}. Total rente: ${formatKr(resultat.totalRenteMedEkstra)}.`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Studielån" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Månedlig ydelse</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalYdelse)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Afviklingstid</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {resultat.faktiskAar} år{resultat.faktiskMdr > 0 ? ` ${resultat.faktiskMdr} md.` : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total rente</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalRenteMedEkstra)}</p>
              </div>
            </div>

            {resultat.procentAfIndkomst > 0 && (
              <p className="mt-3 text-sm text-blue-700 dark:text-blue-300">
                Ydelsen udgør <strong>{resultat.procentAfIndkomst}%</strong> af din månedlige indkomst
              </p>
            )}
          </div>

          {/* Effekt af ekstra afdrag */}
          {resultat.harEkstra && resultat.sparetRente > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">Effekt af ekstra afdrag</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-600 dark:text-green-400">Sparet rente</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">{formatKr(resultat.sparetRente)}</p>
                </div>
                <div>
                  <p className="text-green-600 dark:text-green-400">Hurtigere gældsfri</p>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200">
                    {Math.floor(resultat.sparetMaaneder / 12) > 0 ? `${Math.floor(resultat.sparetMaaneder / 12)} år ` : ""}
                    {resultat.sparetMaaneder % 12} md.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Detaljer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Detaljer</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet gæld</span>
                <span className="font-medium dark:text-white">{formatKr(Number(samletGaeld))}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Standard ydelse</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.standardYdelse)}/md</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total tilbagebetaling</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.totalBetalingMedEkstra)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Heraf rente</span>
                <span className="font-medium text-red-600 dark:text-red-400">{formatKr(resultat.totalRenteMedEkstra)}</span>
              </div>
            </div>
          </div>

          {/* Afdragsplan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Afdragsplan</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                    <th className="py-2 pr-4">Måned</th>
                    <th className="py-2 pr-4 text-right">Ydelse</th>
                    <th className="py-2 pr-4 text-right">Rente</th>
                    <th className="py-2 pr-4 text-right">Afdrag</th>
                    <th className="py-2 text-right">Restgæld</th>
                  </tr>
                </thead>
                <tbody>
                  {resultat.plan.map((row) => (
                    <tr key={row.maaned} className="border-b dark:border-gray-700/50">
                      <td className="py-2 pr-4 dark:text-gray-300">
                        {row.maaned <= 12 ? `Md. ${row.maaned}` : `År ${Math.floor(row.maaned / 12)}`}
                      </td>
                      <td className="py-2 pr-4 text-right dark:text-white">{formatKr(row.ydelse)}</td>
                      <td className="py-2 pr-4 text-right text-red-600 dark:text-red-400">{formatKr(row.rente)}</td>
                      <td className="py-2 pr-4 text-right text-green-600 dark:text-green-400">{formatKr(row.afdrag)}</td>
                      <td className="py-2 text-right font-medium dark:text-white">{formatKr(row.restgaeld)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende. SU-lån renten er variabel og afhænger af diskontoen. Se aktuelle satser på su.dk.
          </p>
        </div>
      )}
    </div>
  );
}
