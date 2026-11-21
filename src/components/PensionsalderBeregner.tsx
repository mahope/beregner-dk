"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  PENSIONSALDER_EKSEMPEL,
  PENSIONSALDER_KILDE,
  beregnPensionsalder,
} from "@/lib/pensionsalder";

const inputClass =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

/** Dato på dansk: "15. marts 2034". Deles af værktøjet og sidens statiske tabel. */
const danskDato = (d: Date) =>
  d.toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

/** Parse "YYYY-MM-DD" som lokal dato (en date-input giver altid dette format). */
function parserDato(vaerdi: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(vaerdi);
  if (!match) return null;
  const [, a, m, d] = match;
  const dato = new Date(Number(a), Number(m) - 1, Number(d), 0, 0, 0, 0);
  if (dato.getFullYear() !== Number(a) || dato.getMonth() !== Number(m) - 1) return null;
  return dato;
}

/** Hele dage mellem to datoer — diferens i lokal midnat, så klokkeslæt ikke tæller. */
function dageMellem(fra: Date, til: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((til.getTime() - fra.getTime()) / ms);
}

const EKSEMPEL_ISO = `${PENSIONSALDER_EKSEMPEL.getFullYear()}-${String(
  PENSIONSALDER_EKSEMPEL.getMonth() + 1,
).padStart(2, "0")}-${String(PENSIONSALDER_EKSEMPEL.getDate()).padStart(2, "0")}`;

export default function PensionsalderBeregner() {
  const [foedselsdato, setFoedselsdato] = useState(EKSEMPEL_ISO);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "pensionsalder") {
      const i = urlState.inputs;
      const dato = typeof i.foedselsdato === "string" ? i.foedselsdato : undefined;
      if (dato) setFoedselsdato(dato);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("pensionsalder");
    const timer = setTimeout(() => {
      trackCalculation("pensionsalder");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setFoedselsdato(EKSEMPEL_ISO);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "pensionsalder",
      inputs: { foedselsdato },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [foedselsdato]);

  const dato = parserDato(foedselsdato);
  const resultat = useMemo(
    () => (dato ? beregnPensionsalder(dato) : null),
    [dato],
  );

  // Nedtællingen regnes i browservinduet, ikke på serveren: på den måde kan
  // HTML'en være statisk (ingen afhængighed af "dags dato"), og brugeren får
  // alligevel et levende tal. Første rendering efter mount undlader det.
  const [dageTil, setDageTil] = useState<number | null>(null);
  useEffect(() => {
    if (!resultat || resultat.alderNaaet) {
      setDageTil(null);
      return;
    }
    const iDag = new Date();
    setDageTil(dageMellem(new Date(iDag.getFullYear(), iDag.getMonth(), iDag.getDate()), resultat.foerstePensionsdag));
  }, [resultat]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="pensionsalder-foedselsdato" className={labelClass}>
              Hvornår er du født?
            </label>
            <input
              id="pensionsalder-foedselsdato"
              type="date"
              value={foedselsdato}
              onChange={(e) => setFoedselsdato(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Folkepensionsalderen følger fødselsåret, så der skal en dato til for at
              finde din kohort. Skuddage (29. februar) regnes som 28. februar.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Sådan er alderen bygget op
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Folketingsflertallet lægger alderen op i fødselårgange: 67 år for dem
              født 1955-1962, 68 år for 1963-1966, 69 år for 1967-1970 og 70 år fra
              1971. Tallene tilpasses den gennemsnitlige levealder, og
              folkepension udbetales fra den første dag i den måned, du fylder alderen.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skemaet fra borger.dk
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <caption className="sr-only">
                  Folkepensionsalder pr. fødselsdato, fra borger.dk
                </caption>
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="py-2 pr-3 font-medium">Født</th>
                    <th className="py-2 font-medium">Folkepensionsalder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">31. dec. 1953 eller tidligere</td>
                    <td className="py-2">65 år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1. jan. – 30. juni 1954</td>
                    <td className="py-2">65 ½ år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1. juli – 31. dec. 1954</td>
                    <td className="py-2">66 år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1. jan. – 30. juni 1955</td>
                    <td className="py-2">66 ½ år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1. juli 1955 – 31. dec. 1962</td>
                    <td className="py-2">67 år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1963 – 1966</td>
                    <td className="py-2">68 år</td>
                  </tr>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 pr-3">1967 – 1970</td>
                    <td className="py-2">69 år</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">1. jan. 1971 eller senere</td>
                    <td className="py-2">70 år</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {resultat ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-emerald-100 dark:bg-emerald-900/30">
                <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Din folkepensionsalder
                </div>
                <div className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">
                  {resultat.alderTekst}
                </div>
                <div className="text-sm text-emerald-800 dark:text-emerald-300">
                  {resultat.kohort.foedselsdatoLabel}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {resultat.alderNaaet
                    ? "Din folkepensionsalder var nået"
                    : "Du kan få folkepension fra"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {danskDato(resultat.foerstePensionsdag)}
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Du fylder {resultat.alderTekst} {danskDato(resultat.alderFyldesDato)}.{" "}
                  {resultat.alderNaaet
                    ? "Din folkepensionsalder er nået."
                    : dageTil === null
                      ? ""
                      : `Der er ${dageTil.toLocaleString("da-DK")} dage til.`}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Hvad beregneren ser på — og ikke ser på
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  Beregneren slår alderen op i skemaet fra borger.dk. Tidlig pension,
                  seniorpension, ældrecheck og udskudt pension har deres egne regler
                  og indgår ikke — se beregnerne for pension og efterløn.
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tallene er vejledende: folkepensionsalderen kan løbende blive forhøjet,
                fordi den tilpasses den gennemsnitlige levealder. Kilde: borger.dk,
                verificeret {PENSIONSALDER_KILDE.verifiedAt}.
              </p>

              {dato && (
                <div className="flex justify-center gap-3">
                  <CopyResultButton
                    text={`Folkepensionsalder ${resultat.alderTekst}: født ${danskDato(
                      dato,
                    )} = ${dato.getFullYear()}-kohorten, pension fra ${danskDato(
                      resultat.foerstePensionsdag,
                    )}`}
                  />
                  <ShareCalculation
                    getShareableLink={getShareableLink}
                    calculatorName="Pensionsalder-beregner"
                    resultSummary={resultat.alderTekst}
                  />
                  <ResetButton onReset={handleReset} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Indtast en fødselsdato
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Vælg dagen du er født, og beregneren slår din folkepensionsalder op i
                skemaet fra borger.dk.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
