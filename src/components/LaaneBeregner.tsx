"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type LaaneType = "annuitet" | "serie" | "sammenlign";

export default function LaaneBeregner() {
  const [laaneType, setLaaneType] = useState<LaaneType>("annuitet");
  const [hovedstol, setHovedstol] = useState<number>(100000);
  const [loebetidAar, setLoebetidAar] = useState<number>(5);
  const [renteSats, setRenteSats] = useState<number>(8);
  const [stiftelsesgebyr, setStiftelsesgebyr] = useState<number>(0);

  // Til sammenligning
  const [rente2, setRente2] = useState<number>(12);
  const [loebetid2, setLoebetid2] = useState<number>(3);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'laaneberegner') {
      const inputs = urlState.inputs;
      if (inputs.laaneType) setLaaneType(inputs.laaneType);
      if (inputs.hovedstol !== undefined) setHovedstol(inputs.hovedstol);
      if (inputs.loebetidAar !== undefined) setLoebetidAar(inputs.loebetidAar);
      if (inputs.renteSats !== undefined) setRenteSats(inputs.renteSats);
      if (inputs.stiftelsesgebyr !== undefined) setStiftelsesgebyr(inputs.stiftelsesgebyr);
      if (inputs.rente2 !== undefined) setRente2(inputs.rente2);
      if (inputs.loebetid2 !== undefined) setLoebetid2(inputs.loebetid2);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("laaneberegner");
    const timer = setTimeout(() => {
      trackCalculation("laaneberegner");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setLaaneType("annuitet");
    setHovedstol(100000);
    setLoebetidAar(5);
    setRenteSats(8);
    setStiftelsesgebyr(0);
    setRente2(12);
    setLoebetid2(3);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'laaneberegner',
      inputs: { laaneType, hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2 },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laaneType, hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2]);

  const beregning = useMemo(() => {
    const r = renteSats / 100 / 12; // Månedlig rente
    const n = loebetidAar * 12; // Antal måneder
    
    // Annuitetslån (fast ydelse)
    let annuitetYdelse = 0;
    let annuitetTotal = 0;
    let annuitetRenter = 0;
    
    if (r > 0 && n > 0) {
      annuitetYdelse = hovedstol * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      annuitetTotal = annuitetYdelse * n + stiftelsesgebyr;
      annuitetRenter = annuitetTotal - hovedstol - stiftelsesgebyr;
    }
    
    // Serielån (fast afdrag, faldende ydelse)
    const serieAfdrag = hovedstol / n;
    const serieForsteYdelse = serieAfdrag + (hovedstol * r);
    const serieSidsteYdelse = serieAfdrag + (serieAfdrag * r);
    const serieGennemsnitYdelse = (serieForsteYdelse + serieSidsteYdelse) / 2;
    const serieRenter = hovedstol * r * (n + 1) / 2;
    const serieTotal = hovedstol + serieRenter + stiftelsesgebyr;
    
    // ÅOP beregning (forenklet)
    const aopAnnuitet = annuitetRenter > 0 
      ? ((annuitetRenter + stiftelsesgebyr) / hovedstol) / loebetidAar * 100 
      : 0;
    
    // Lån 2 til sammenligning
    const r2 = rente2 / 100 / 12;
    const n2 = loebetid2 * 12;
    let laan2Ydelse = 0;
    let laan2Total = 0;
    let laan2Renter = 0;
    
    if (r2 > 0 && n2 > 0) {
      laan2Ydelse = hovedstol * (r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1);
      laan2Total = laan2Ydelse * n2;
      laan2Renter = laan2Total - hovedstol;
    }
    
    // Afdragsplan (første 12 måneder)
    const afdragsplan = [];
    let restgaeld = hovedstol;
    for (let i = 1; i <= Math.min(12, n); i++) {
      const renteBeloeb = restgaeld * r;
      const afdrag = annuitetYdelse - renteBeloeb;
      restgaeld -= afdrag;
      afdragsplan.push({
        maaned: i,
        ydelse: annuitetYdelse,
        rente: renteBeloeb,
        afdrag: afdrag,
        restgaeld: Math.max(0, restgaeld),
      });
    }
    
    return {
      // Annuitet
      annuitetYdelse,
      annuitetTotal,
      annuitetRenter,
      aopAnnuitet,
      // Serie
      serieAfdrag,
      serieForsteYdelse,
      serieSidsteYdelse,
      serieGennemsnitYdelse,
      serieRenter,
      serieTotal,
      // Sammenligning
      laan2Ydelse,
      laan2Total,
      laan2Renter,
      forskelTotal: annuitetTotal - laan2Total,
      // Afdragsplan
      afdragsplan,
    };
  }, [hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Lånetype valg */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-gray-200">Beregningstype</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setLaaneType("annuitet")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "annuitet"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">Annuitetslån</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Fast månedlig ydelse</div>
          </button>
          <button
            onClick={() => setLaaneType("serie")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "serie"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">Serielån</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Faldende ydelse</div>
          </button>
          <button
            onClick={() => setLaaneType("sammenlign")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "sammenlign"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">Sammenlign lån</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">To lån side om side</div>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Lånebeløb</label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="1000"
                value={hovedstol}
                onChange={(e) => setHovedstol(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">kr</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Årlig rente (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={renteSats}
                onChange={(e) => setRenteSats(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Løbetid (år)</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={loebetidAar}
                onChange={(e) => setLoebetidAar(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">år</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">Stiftelsesgebyr</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={stiftelsesgebyr}
                onChange={(e) => setStiftelsesgebyr(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">kr</span>
            </div>
          </div>
        </div>

        {laaneType === "sammenlign" && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="font-medium mb-3 dark:text-white">Lån 2 (til sammenligning)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Årlig rente (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={rente2}
                    onChange={(e) => setRente2(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Løbetid (år)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    value={loebetid2}
                    onChange={(e) => setLoebetid2(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">år</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      {laaneType === "annuitet" && (
        <>
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Månedlig ydelse</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregning.annuitetYdelse)}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(hovedstol)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Lånebeløb</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatKr(beregning.annuitetRenter)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Samlede renter</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.annuitetTotal)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Samlet tilbagebetaling</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{beregning.aopAnnuitet.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">ÅOP (ca.)</p>
            </div>
          </div>
        </>
      )}

      {laaneType === "serie" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
              <p className="text-sm opacity-90 mb-1">Første ydelse</p>
              <p className="text-3xl font-bold">{formatKr(beregning.serieForsteYdelse)}</p>
            </div>
            <div className="p-6 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl text-center text-white">
              <p className="text-sm opacity-90 mb-1">Sidste ydelse</p>
              <p className="text-3xl font-bold">{formatKr(beregning.serieSidsteYdelse)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieAfdrag)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Fast afdrag/md</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieGennemsnitYdelse)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gennemsnit ydelse</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatKr(beregning.serieRenter)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Samlede renter</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieTotal)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Samlet tilbagebetaling</p>
            </div>
          </div>
        </>
      )}

      {laaneType === "sammenlign" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white border-2 border-blue-500 rounded-xl dark:bg-gray-800">
              <h4 className="font-medium text-blue-600 mb-4 dark:text-blue-400">Lån 1: {renteSats}% i {loebetidAar} år</h4>
              <div className="space-y-2 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Månedlig ydelse</span>
                  <span className="font-bold">{formatKr(beregning.annuitetYdelse)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Samlede renter</span>
                  <span className="text-red-600 dark:text-red-400">{formatKr(beregning.annuitetRenter)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                  <span>Total</span>
                  <span className="font-bold">{formatKr(beregning.annuitetTotal)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border-2 border-green-500 rounded-xl dark:bg-gray-800">
              <h4 className="font-medium text-green-600 mb-4 dark:text-green-400">Lån 2: {rente2}% i {loebetid2} år</h4>
              <div className="space-y-2 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Månedlig ydelse</span>
                  <span className="font-bold">{formatKr(beregning.laan2Ydelse)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Samlede renter</span>
                  <span className="text-red-600 dark:text-red-400">{formatKr(beregning.laan2Renter)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                  <span>Total</span>
                  <span className="font-bold">{formatKr(beregning.laan2Total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${beregning.forskelTotal > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <p className={beregning.forskelTotal > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {beregning.forskelTotal > 0 
                ? `Lån 2 er ${formatKr(Math.abs(beregning.forskelTotal))} billigere totalt`
                : `Lån 1 er ${formatKr(Math.abs(beregning.forskelTotal))} billigere totalt`
              }
            </p>
          </div>
        </>
      )}

      {/* Afdragsplan */}
      {laaneType === "annuitet" && (
        <div className="bg-white border rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 bg-gray-50 border-b dark:bg-gray-900/50 dark:border-gray-700">
            <h3 className="font-medium dark:text-white">Afdragsplan (første 12 måneder)</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm dark:text-gray-300">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 dark:text-gray-300">Md.</th>
                  <th className="text-right py-2 dark:text-gray-300">Ydelse</th>
                  <th className="text-right py-2 dark:text-gray-300">Rente</th>
                  <th className="text-right py-2 dark:text-gray-300">Afdrag</th>
                  <th className="text-right py-2 dark:text-gray-300">Restgæld</th>
                </tr>
              </thead>
              <tbody>
                {beregning.afdragsplan.map((row) => (
                  <tr key={row.maaned} className="border-b last:border-b-0 dark:border-gray-700">
                    <td className="py-2 dark:text-gray-300">{row.maaned}</td>
                    <td className="py-2 text-right dark:text-gray-300">{formatKr(row.ydelse)}</td>
                    <td className="py-2 text-right text-red-600 dark:text-red-400">{formatKr(row.rente)}</td>
                    <td className="py-2 text-right text-green-600 dark:text-green-400">{formatKr(row.afdrag)}</td>
                    <td className="py-2 text-right font-mono dark:text-gray-300">{formatKr(row.restgaeld)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={`Lån ${formatKr(hovedstol)} i ${loebetidAar} år til ${renteSats}% - ydelse ${formatKr(beregning.annuitetYdelse)}/md`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Låneberegner"
          resultSummary={`Lån ${formatKr(hovedstol)} i ${loebetidAar} år til ${renteSats}% - ydelse ${formatKr(beregning.annuitetYdelse)}/md`}
        />
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-800 mb-2 dark:text-yellow-300">⚠️ Vigtigt om lån</h3>
        <ul className="text-sm text-yellow-700 space-y-1 dark:text-yellow-400">
          <li>• Sammenlign altid ÅOP (årlig omkostning i procent), ikke kun renten</li>
          <li>• Tjek alle gebyrer: stiftelse, administration, indfrielse</li>
          <li>• Kortere løbetid = højere ydelse, men færre renteudgifter</li>
          <li>• Overvej om du kan klare uforudsete udgifter ved siden af lånet</li>
        </ul>
      </div>
    </div>
  );
}
