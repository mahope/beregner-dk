"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

export default function AndelsboligBeregner() {
  const [andelPris, setAndelPris] = useState<string>("");
  const [boligafgift, setBoligafgift] = useState<string>("");
  const [forbedringer, setForbedringer] = useState<string>("0");
  const [udbetalingProcent, setUdbetalingProcent] = useState<string>("5");
  const [laanRente, setLaanRente] = useState<string>("5.5");
  const [laanAar, setLaanAar] = useState<string>("20");
  const [andelskrone, setAndelskrone] = useState<string>("1.0");
  // Sammenligning
  const [maanedligHusleje, setMaanedligHusleje] = useState<string>("");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "andelsbolig") {
      const i = urlState.inputs;
      if (i.andelPris !== undefined) setAndelPris(String(i.andelPris));
      if (i.boligafgift !== undefined) setBoligafgift(String(i.boligafgift));
      if (i.forbedringer !== undefined) setForbedringer(String(i.forbedringer));
      if (i.udbetalingProcent !== undefined) setUdbetalingProcent(String(i.udbetalingProcent));
      if (i.laanRente !== undefined) setLaanRente(String(i.laanRente));
      if (i.laanAar !== undefined) setLaanAar(String(i.laanAar));
      if (i.andelskrone !== undefined) setAndelskrone(String(i.andelskrone));
      if (i.maanedligHusleje !== undefined) setMaanedligHusleje(String(i.maanedligHusleje));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    const state: CalculationState = {
      type: "andelsbolig",
      timestamp: Date.now(),
      inputs: {
        andelPris: Number(andelPris), boligafgift: Number(boligafgift),
        forbedringer: Number(forbedringer), udbetalingProcent: Number(udbetalingProcent),
        laanRente: Number(laanRente), laanAar: Number(laanAar),
        andelskrone: Number(andelskrone), maanedligHusleje: Number(maanedligHusleje),
      },
    };
    return generateShareableLink(state);
  }, [andelPris, boligafgift, forbedringer, udbetalingProcent, laanRente, laanAar, andelskrone, maanedligHusleje]);

  useEffect(() => {
    initScrollDepthTracking("andelsbolig");
  }, []);

  const resultat = useMemo(() => {
    const pris = Number(andelPris);
    const afgift = Number(boligafgift);
    if (!pris || pris <= 0 || !afgift || afgift <= 0) return null;

    const forb = Number(forbedringer) || 0;
    const samletPris = pris + forb;
    const udbPct = Number(udbetalingProcent) / 100;
    const udbetaling = samletPris * udbPct;
    const laanBeloeb = samletPris - udbetaling;
    const r = Number(laanRente) / 100 / 12;
    const n = Number(laanAar) * 12;

    // Annuitetsydelse
    let maanedligYdelse = 0;
    if (r > 0 && n > 0 && laanBeloeb > 0) {
      maanedligYdelse = laanBeloeb * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalMaanedlig = maanedligYdelse + afgift;
    const totalLaanBetaling = maanedligYdelse * n;
    const totalRente = totalLaanBetaling - laanBeloeb;

    // Andelskroneberegning
    const ak = Number(andelskrone);
    const boligVaerdi = pris * ak; // Simplificeret

    // Sammenligning med leje
    const huslejeNum = Number(maanedligHusleje);
    const harSammenligning = huslejeNum > 0;
    const besparelse = harSammenligning ? huslejeNum - totalMaanedlig : 0;

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("andelsbolig");
    }

    return {
      samletPris,
      udbetaling: Math.round(udbetaling),
      laanBeloeb: Math.round(laanBeloeb),
      maanedligYdelse: Math.round(maanedligYdelse),
      totalMaanedlig: Math.round(totalMaanedlig),
      totalRente: Math.round(totalRente),
      boligVaerdi: Math.round(boligVaerdi),
      harSammenligning,
      besparelse: Math.round(besparelse),
      huslejeNum,
    };
  }, [andelPris, boligafgift, forbedringer, udbetalingProcent, laanRente, laanAar, andelskrone, maanedligHusleje]);

  const handleReset = useCallback(() => {
    setAndelPris("");
    setBoligafgift("");
    setForbedringer("0");
    setUdbetalingProcent("5");
    setLaanRente("5.5");
    setLaanAar("20");
    setAndelskrone("1.0");
    setMaanedligHusleje("");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => n.toLocaleString("da-DK") + " kr.";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">Andelsbolig</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="andelPris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Andelpris
            </label>
            <div className="relative">
              <input id="andelPris" type="number" value={andelPris} onChange={(e) => setAndelPris(e.target.value)}
                placeholder="F.eks. 500000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>
          <div>
            <label htmlFor="boligafgift" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Månedlig boligafgift
            </label>
            <div className="relative">
              <input id="boligafgift" type="number" value={boligafgift} onChange={(e) => setBoligafgift(e.target.value)}
                placeholder="F.eks. 5000" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr./md</span>
            </div>
          </div>
          <div>
            <label htmlFor="forbedringer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Forbedringer (tilkøb)
            </label>
            <div className="relative">
              <input id="forbedringer" type="number" value={forbedringer} onChange={(e) => setForbedringer(e.target.value)}
                placeholder="0" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>
          <div>
            <label htmlFor="andelskrone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Andelskrone
            </label>
            <input id="andelskrone" type="number" value={andelskrone} onChange={(e) => setAndelskrone(e.target.value)}
              step="0.01" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Typisk mellem 0,5 og 3,0. Findes i foreningens årsrapport.
            </p>
          </div>
        </div>
      </div>

      {/* Finansiering */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold dark:text-white">Finansiering</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="udbetalingProcent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Udbetaling
            </label>
            <div className="relative">
              <input id="udbetalingProcent" type="number" value={udbetalingProcent} onChange={(e) => setUdbetalingProcent(e.target.value)}
                min="0" max="100" step="1"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="laanRente" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lånerente (ÅOP)
            </label>
            <div className="relative">
              <input id="laanRente" type="number" value={laanRente} onChange={(e) => setLaanRente(e.target.value)}
                step="0.1" min="0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="laanAar" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Løbetid
            </label>
            <div className="relative">
              <input id="laanAar" type="number" value={laanAar} onChange={(e) => setLaanAar(e.target.value)}
                min="1" max="30"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">år</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sammenligning med leje */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <h2 className="text-lg font-semibold dark:text-white">Sammenlign med lejebolig</h2>
        <div>
          <label htmlFor="maanedligHusleje" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tilsvarende husleje (valgfrit)
          </label>
          <div className="relative">
            <input id="maanedligHusleje" type="number" value={maanedligHusleje} onChange={(e) => setMaanedligHusleje(e.target.value)}
              placeholder="F.eks. 8000" min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr./md</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                Månedlige omkostninger
              </h3>
              <div className="flex gap-2">
                <CopyResultButton
                  text={`Andelsbolig: ${formatKr(resultat.totalMaanedlig)}/md (boligafgift ${formatKr(Number(boligafgift))} + lån ${formatKr(resultat.maanedligYdelse)}). Udbetaling: ${formatKr(resultat.udbetaling)}.`}
                />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Andelsbolig" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Samlet pr. måned</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.totalMaanedlig)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Lånydelse</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(resultat.maanedligYdelse)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Boligafgift</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatKr(Number(boligafgift))}</p>
              </div>
            </div>
          </div>

          {/* Køb detaljer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">Købsdetaljer</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Andelpris + forbedringer</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.samletPris)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Udbetaling ({udbetalingProcent}%)</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.udbetaling)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Lån</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.laanBeloeb)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Total rente over {laanAar} år</span>
                <span className="font-medium text-red-600 dark:text-red-400">{formatKr(resultat.totalRente)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">Boligværdi (andelskrone {andelskrone})</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.boligVaerdi)}</span>
              </div>
            </div>
          </div>

          {/* Sammenligning */}
          {resultat.harSammenligning && (
            <div className={`rounded-2xl p-6 ${resultat.besparelse > 0
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
            }`}>
              <h3 className="font-semibold dark:text-white mb-3">Andel vs. leje</h3>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Andelsbolig</p>
                  <p className="text-xl font-bold dark:text-white">{formatKr(resultat.totalMaanedlig)}/md</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lejebolig</p>
                  <p className="text-xl font-bold dark:text-white">{formatKr(resultat.huslejeNum)}/md</p>
                </div>
              </div>
              <p className={`text-sm font-medium ${resultat.besparelse > 0 ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                {resultat.besparelse > 0
                  ? `Du sparer ${formatKr(resultat.besparelse)}/md (${formatKr(resultat.besparelse * 12)}/år) ved andelsbolig`
                  : `Andelsbolig er ${formatKr(Math.abs(resultat.besparelse))}/md dyrere end leje`}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Husk: Ved andel opbygger du egenkapital, mens leje er en ren udgift. Ved salg kan du få din andel tilbage (justeret for andelskronen).
              </p>
            </div>
          )}

          {/* Vigtig info */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5">
            <h3 className="font-semibold dark:text-white mb-3">Vigtigt at vide om andelsbolig</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p><strong>Fællesslån:</strong> Boligafgiften dækker bl.a. afdrag på foreningens fælleslån. Du hæfter solidarisk for fælleslånet sammen med de øvrige andelshavere.</p>
              <p><strong>Andelskrone:</strong> Bestemmer boligens værdi. En andelskrone på 1,0 = pålydende værdi. Under 1,0 = rabat, over 1,0 = tillæg. Fastsættes på generalforsamlingen.</p>
              <p><strong>Forbedringer:</strong> Du kan tilføje værdi via forbedringer (nyt køkken, bad mv.), som tillægges prisen ved salg.</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Beregningen er vejledende. Kontakt foreningen for præcise tal om fælleslån, vedligeholdelse og andelskrone.
          </p>
        </div>
      )}
    </div>
  );
}
