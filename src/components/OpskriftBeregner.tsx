"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import { soegMadvarer } from "@/lib/kalorier-madvarer";
import {
  OPSKRIFT_EKSEMPLER,
  OPSKRIFT_STANDARD_PORTIONER,
  eksempelLinjer,
  makroAndel,
  opskriftLinje,
  opskriftPrPortion,
  opskriftTotal,
  type OpskriftLinje,
} from "@/lib/opskrift-kalorier";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/** Tallet i et gram-felt kan skrives med komma — dansk tastatur. */
function gramTal(tekst: string): number {
  return Number(tekst.replace(",", "."));
}

const tal = (vaerdi: number, decimaler = 0) =>
  formatNumber(vaerdi, "da", { maximumFractionDigits: decimaler });

/** Værktøjet starter på retten læseren kan genkende. */
const START_LINJER = eksempelLinjer(OPSKRIFT_EKSEMPLER[0]);

export default function OpskriftBeregner() {
  const [linjer, setLinjer] = useState<OpskriftLinje[]>(START_LINJER);
  const [soegning, setSoegning] = useState("");
  const [nyGram, setNyGram] = useState("100");
  const [portioner, setPortioner] = useState(OPSKRIFT_STANDARD_PORTIONER);

  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kalorier-i-opskrift");
    const timer = setTimeout(() => {
      trackCalculation("kalorier-i-opskrift");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const forslag = useMemo(() => soegMadvarer(soegning).slice(0, 6), [soegning]);
  const total = useMemo(() => opskriftTotal(linjer), [linjer]);
  const prPortion = useMemo(() => opskriftPrPortion(linjer, portioner), [linjer, portioner]);
  const andel = useMemo(() => makroAndel(total), [total]);

  const tilfoej = useCallback(
    (linje: OpskriftLinje) => {
      setLinjer((forrige) => {
        // Den samme vare to gange slås sammen til én linje, så en der trygger
        // for meget på søgeresultatet ikke får to pasta-rækker.
        const fundet = forrige.find((l) => l.madvare.navn === linje.madvare.navn);
        if (fundet) {
          return forrige.map((l) =>
            l.madvare.navn === linje.madvare.navn ? { ...l, gram: l.gram + linje.gram } : l,
          );
        }
        return [...forrige, linje];
      });
      setSoegning("");
      setNyGram("100");
    },
    [],
  );

  const retGram = useCallback((index: number, gram: number) => {
    setLinjer((forrige) => forrige.map((l, i) => (i === index ? { ...l, gram } : l)));
  }, []);

  const fjern = useCallback((index: number) => {
    setLinjer((forrige) => forrige.filter((_, i) => i !== index));
  }, []);

  const handleReset = useCallback(() => {
    setLinjer(START_LINJER);
    setSoegning("");
    setNyGram("100");
    setPortioner(OPSKRIFT_STANDARD_PORTIONER);
  }, []);

  const portionerTekst = () => {
    const antal = Number.isFinite(portioner) && portioner >= 1 ? portioner : 0;
    return antal === 1 ? "1 portion" : `${tal(antal, 1)} portioner`;
  };

  const kopiTekst = () => {
    const ingredienser = linjer
      .map((l) => `${l.madvare.navn} ${tal(l.gram)} g (${tal(opskriftLinje(l).kcal)} kcal)`)
      .join(", ");
    const prPortionTekst = prPortion
      ? `${tal(prPortion.kcal)} kcal pr. portion (${tal(prPortion.protein)} g protein, ${tal(
          prPortion.fedt,
        )} g fedt, ${tal(prPortion.kulhydrat)} g kulhydrat)`
      : "ingen gyldigt antal portioner";
    return `Opskrift: ${ingredienser}. ${portionerTekst()}: ${tal(total.kcal)} kcal i alt, ${prPortionTekst}.`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="opskrift-soegning" className={labelClass}>
              Søg efter ingrediens
            </label>
            <input
              id="opskrift-soegning"
              type="search"
              value={soegning}
              placeholder="f.eks. æg, pasta eller ost"
              onChange={(e) => setSoegning(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Vælg en vare fra listen nedenfor, så lægges den i opskriften med den mængde, du
              skriver her.
            </p>
          </div>

          <div>
            <label htmlFor="opskrift-nyt-gram" className={labelClass}>
              Gram pr. ingrediens
            </label>
            <input
              id="opskrift-nyt-gram"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={nyGram}
              onChange={(e) => setNyGram(e.target.value)}
              className={inputClass}
            />
          </div>

          <ul className="space-y-2" aria-label="Ingredienser ud fra din søgning">
            {forslag.map((madvare) => (
              <li key={madvare.navn}>
                <button
                  type="button"
                  onClick={() =>
                    tilfoej({
                      madvare,
                      gram: Number.isFinite(gramTal(nyGram)) ? Math.max(gramTal(nyGram), 0) : 0,
                    })
                  }
                  className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
                >
                  <span className="text-sm text-gray-900 dark:text-white">{madvare.navn}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {tal(madvare.kcal100g)} kcal pr. 100 g
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div>
            <label htmlFor="opskrift-portioner" className={labelClass}>
              Antal portioner
            </label>
            <input
              id="opskrift-portioner"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={portioner}
              onChange={(e) => setPortioner(Number(e.target.value))}
              className={inputClass}
            />
            {!prPortion && (
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Skriv mindst 1 portion, så kan retten deles ud i et kalorital pr. portion.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {portionerTekst()}
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {prPortion ? `${tal(prPortion.kcal)} kcal` : "—"}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300">pr. portion</div>
            </div>

            {linjer.length > 0 ? (
              <table className="w-full text-sm">
                <caption className="sr-only">Kalorier pr. ingrediens</caption>
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                    <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">
                      Ingrediens
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">Gram</th>
                    <th className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">kcal</th>
                    <th className="py-2">
                      <span className="sr-only">Handling</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {linjer.map((linje, index) => (
                    <tr key={linje.madvare.navn} className="border-b border-gray-100 dark:border-gray-700/50">
                      <td className="py-2 pr-4 text-gray-900 dark:text-white">
                        {linje.madvare.navn}
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={linje.gram}
                          onChange={(e) => retGram(index, gramTal(e.target.value))}
                          aria-label={`Gram ${linje.madvare.navn}`}
                          className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
                        />
                      </td>
                      <td className="py-2 pr-4 font-semibold text-gray-900 dark:text-white">
                        {tal(opskriftLinje(linje).kcal)}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => fjern(index)}
                          className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                        >
                          Fjern
                          <span className="sr-only"> {linje.madvare.navn}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Opskriften er tom. Søg efter en ingrediens til venstre, eller start forfra med
                nulstillingsknappen.
              </p>
            )}

            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Kalorier i alt</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">
                  {tal(total.kcal)} kcal
                </dd>
              </div>
              {prPortion && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Protein pr. portion</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {tal(prPortion.protein)} g
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Fedt pr. portion</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {tal(prPortion.fedt)} g
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600 dark:text-gray-400">Kulhydrat pr. portion</dt>
                    <dd className="font-semibold text-gray-900 dark:text-white">
                      {tal(prPortion.kulhydrat)} g
                    </dd>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <dt>Af energien kommer</dt>
                    <dd>
                      {tal(andel.protein)} % fra protein, {tal(andel.fedt)} % fra fedt,{" "}
                      {tal(andel.kulhydrat)} % fra kulhydrat
                    </dd>
                  </div>
                </>
              )}
            </dl>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tallene pr. 100 g kommer fra USDA FoodData Central og følger varernes
              tilberedningsform: vej tørre varer tørre og kogte varer kogte.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <CopyResultButton text={kopiTekst()} />
      </div>
    </div>
  );
}
