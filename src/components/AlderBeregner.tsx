"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { getIntlLocale } from '@/lib/format';

export default function AlderBeregner() {
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const [foedselsdato, setFoedselsdato] = useState<string>("");
  const [beregningsDato, setBeregningsDato] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'alder') {
      const inputs = urlState.inputs;
      if (inputs.foedselsdato) setFoedselsdato(inputs.foedselsdato);
      if (inputs.beregningsDato) setBeregningsDato(inputs.beregningsDato);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("alder");
    const timer = setTimeout(() => {
      trackCalculation("alder");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'alder',
      inputs: { foedselsdato, beregningsDato },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [foedselsdato, beregningsDato]);

  const handleReset = useCallback(() => {
    setFoedselsdato("");
    setBeregningsDato(new Date().toISOString().split("T")[0]);
  }, []);

  const beregning = useMemo(() => {
    if (!foedselsdato) {
      return null;
    }

    const foedselsDate = new Date(foedselsdato);
    const beregningsDate = new Date(beregningsDato);

    if (foedselsDate > beregningsDate) {
      return null;
    }

    // Beregn præcis alder
    let aar = beregningsDate.getFullYear() - foedselsDate.getFullYear();
    let maaneder = beregningsDate.getMonth() - foedselsDate.getMonth();
    let dage = beregningsDate.getDate() - foedselsDate.getDate();

    // Juster for negative dage
    if (dage < 0) {
      maaneder--;
      const sidsteMaaned = new Date(beregningsDate.getFullYear(), beregningsDate.getMonth(), 0);
      dage += sidsteMaaned.getDate();
    }

    // Juster for negative måneder
    if (maaneder < 0) {
      aar--;
      maaneder += 12;
    }

    // Beregn totaler
    const diffTime = beregningsDate.getTime() - foedselsDate.getTime();
    const totalDage = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalUger = Math.floor(totalDage / 7);
    const totalMaaneder = aar * 12 + maaneder;
    const totalTimer = totalDage * 24;
    const totalMinutter = totalTimer * 60;

    // Find næste fødselsdag
    let naesteFoedselsdag = new Date(
      beregningsDate.getFullYear(),
      foedselsDate.getMonth(),
      foedselsDate.getDate()
    );
    if (naesteFoedselsdag <= beregningsDate) {
      naesteFoedselsdag = new Date(
        beregningsDate.getFullYear() + 1,
        foedselsDate.getMonth(),
        foedselsDate.getDate()
      );
    }
    const dageTilFoedselsdag = Math.ceil(
      (naesteFoedselsdag.getTime() - beregningsDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Stjernetegn
    const stjernetegn = getStjernetegn(foedselsDate);

    // Ugedag født
    const ugedage = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
    const ugedagFoedt = ugedage[foedselsDate.getDay()];

    return {
      aar,
      maaneder,
      dage,
      totalDage,
      totalUger,
      totalMaaneder,
      totalTimer,
      totalMinutter,
      dageTilFoedselsdag,
      naesteFoedselsdagAlder: aar + (maaneder > 0 || dage > 0 ? 1 : 1),
      stjernetegn,
      ugedagFoedt,
    };
  }, [foedselsdato, beregningsDato]);

  function getStjernetegn(dato: Date): { navn: string; symbol: string; periode: string } {
    const dag = dato.getDate();
    const maaned = dato.getMonth() + 1;

    if ((maaned === 3 && dag >= 21) || (maaned === 4 && dag <= 19)) {
      return { navn: "Vædder", symbol: "♈", periode: "21. mar - 19. apr" };
    } else if ((maaned === 4 && dag >= 20) || (maaned === 5 && dag <= 20)) {
      return { navn: "Tyr", symbol: "♉", periode: "20. apr - 20. maj" };
    } else if ((maaned === 5 && dag >= 21) || (maaned === 6 && dag <= 20)) {
      return { navn: "Tvilling", symbol: "♊", periode: "21. maj - 20. jun" };
    } else if ((maaned === 6 && dag >= 21) || (maaned === 7 && dag <= 22)) {
      return { navn: "Krebs", symbol: "♋", periode: "21. jun - 22. jul" };
    } else if ((maaned === 7 && dag >= 23) || (maaned === 8 && dag <= 22)) {
      return { navn: "Løve", symbol: "♌", periode: "23. jul - 22. aug" };
    } else if ((maaned === 8 && dag >= 23) || (maaned === 9 && dag <= 22)) {
      return { navn: "Jomfru", symbol: "♍", periode: "23. aug - 22. sep" };
    } else if ((maaned === 9 && dag >= 23) || (maaned === 10 && dag <= 22)) {
      return { navn: "Vægt", symbol: "♎", periode: "23. sep - 22. okt" };
    } else if ((maaned === 10 && dag >= 23) || (maaned === 11 && dag <= 21)) {
      return { navn: "Skorpion", symbol: "♏", periode: "23. okt - 21. nov" };
    } else if ((maaned === 11 && dag >= 22) || (maaned === 12 && dag <= 21)) {
      return { navn: "Skytte", symbol: "♐", periode: "22. nov - 21. dec" };
    } else if ((maaned === 12 && dag >= 22) || (maaned === 1 && dag <= 19)) {
      return { navn: "Stenbuk", symbol: "♑", periode: "22. dec - 19. jan" };
    } else if ((maaned === 1 && dag >= 20) || (maaned === 2 && dag <= 18)) {
      return { navn: "Vandmand", symbol: "♒", periode: "20. jan - 18. feb" };
    } else {
      return { navn: "Fisk", symbol: "♓", periode: "19. feb - 20. mar" };
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(intlLocale).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Fødselsdato</label>
          <input
            type="date"
            value={foedselsdato}
            onChange={(e) => setFoedselsdato(e.target.value)}
            max={beregningsDato}
            className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Beregn alder pr. dato</label>
          <input
            type="date"
            value={beregningsDato}
            onChange={(e) => setBeregningsDato(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={() => setBeregningsDato(new Date().toISOString().split("T")[0])}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          >
            Brug i dag
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {beregning && (
        <>
          {/* Hovedresultat */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">Din præcise alder</p>
            <p className="text-5xl md:text-6xl font-bold mb-2">
              {beregning.aar} år
            </p>
            <p className="text-xl opacity-90">
              {beregning.maaneder} måneder og {beregning.dage} dage
            </p>
          </div>

          {/* Næste fødselsdag */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-300">
              🎂 Der er <strong>{beregning.dageTilFoedselsdag} dage</strong> til din næste fødselsdag
              (du fylder {beregning.naesteFoedselsdagAlder} år)
            </p>
          </div>

          {/* Statistikker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalDage)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dage levet</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalUger)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Uger levet</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalMaaneder)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Måneder levet</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalTimer)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Timer levet</p>
            </div>
          </div>

          {/* Fun facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{beregning.stjernetegn.symbol}</span>
                <div>
                  <p className="font-medium dark:text-gray-200">Stjernetegn: {beregning.stjernetegn.navn}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{beregning.stjernetegn.periode}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-4xl">📅</span>
                <div>
                  <p className="font-medium dark:text-gray-200">Født på en {beregning.ugedagFoedt}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(foedselsdato).toLocaleDateString(intlLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detaljeret tabel */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <h3 className="font-medium dark:text-white">Detaljeret aldersberegning</h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm dark:text-gray-200">
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Alder i år</td>
                    <td className="py-2 text-right font-mono">{beregning.aar}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Alder i måneder</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalMaaneder)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Alder i uger</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalUger)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Alder i dage</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalDage)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">Alder i timer</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalTimer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Alder i minutter</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalMinutter)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={`${beregning.aar} år, ${beregning.maaneder} mdr, ${beregning.dage} dage`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Aldersberegner"
              resultSummary={beregning ? `${beregning.aar} år, ${beregning.maaneder} mdr, ${beregning.dage} dage` : undefined}
            />
          </div>
        </>
      )}

      {!beregning && foedselsdato && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-center text-red-700 dark:text-red-400">
          Fødselsdatoen kan ikke være efter beregningsdatoen.
        </div>
      )}

      {!foedselsdato && (
        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400">
          Indtast din fødselsdato for at se din præcise alder
        </div>
      )}
    </div>
  );
}
