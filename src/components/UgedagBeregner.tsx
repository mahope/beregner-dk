"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { ResetButton } from "@/components/ui";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { iDagPaSiden } from "@/lib/lokal-dato";
import { ugedagResultat, ugenOmkring, type UgedagLocale } from "@/lib/ugedag";

const labels = {
  da: {
    dato: "Dato",
    forUgedagHint: "Skriv din fødselsdato, en dato i en aftale eller hvilken som helst dato.",
    iDag: "I dag",
    ugaar: "ISO-ugenummer",
    ugaarHint: "Uge 1 er den uge, der indeholder årets første torsdag.",
    heleUgen: "Hele ugen",
    hverdagsUge: "Ugedag i ISO-ugenummeren",
    ugeDagTallet: (n: number) => `Ugedag ${n}`,
    ingenDato: "Vælg en gyldig dato for at se ugedagen.",
    fejlDato: "Datoen findes ikke i kalenderen — 31. februar er ikke en dato.",
  },
  se: {
    dato: "Datum",
    forUgedagHint: "Skriv ditt födelsedatum, ett datum i ett avtal eller vilket datum som helst.",
    iDag: "I dag",
    ugaar: "ISO-veckonummer",
    ugaarHint: "Vecka 1 är den vecka som innefattar årets första torsdag.",
    heleUgen: "Hela veckan",
    hverdagsUge: "Vardag i ISO-veckonumret",
    ugeDagTallet: (n: number) => `Vardag ${n}`,
    ingenDato: "Välj ett giltigt datum för att se veckodagen.",
    fejlDato: "Datumet finns inte i kalendern — 31 februari är inget datum.",
  },
} as const;

/**
 * Dagens dato i **sidens** tidszone, udledt på **serveren**.
 *
 * `new Date()` i en klient-komponent giver ikke bare et «flash» ved hydrering —
 * den gør selve siden tom i den HTML, Google og alle uden JavaScript ser. En
 * klient-komponents første render er `useState("")`, altså intet ugedagsnavn,
 * ingen uge og ingen kalenderuge. Derfor kommer den ind som prop fra siden, og
 * `iDagPaSiden` sikrer at den er dansk (eller svensk) tid — ikke UTC.
 */
export default function UgedagBeregner({
  initialDato = "",
}: {
  initialDato?: string;
}) {
  const { locale } = useLocale();
  const lang: UgedagLocale = locale === "se" ? "se" : "da";
  const l = labels[lang];

  // Dagens dato i **sidens** tidszone, ikke serverens. `new Date()` læses i
  // UTC på byggeserveren, så kl. 00-02 dansk tid ville "i dag"-knappen give
  // *i går* — samme fejl `toUtcMidnight` havde i `dage-til.ts` (punkt 4).
  const [dato, setDato] = useState<string>(initialDato);
  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    const oprydningScroll = initScrollDepthTracking("ugedag");
    const timer = setTimeout(() => {
      trackCalculation("ugedag");
      harRegistreret.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const nulstil = useCallback(() => {
    setDato(iDagPaSiden(new Date(), lang === "se" ? "se" : "da"));
  }, [lang]);

  const resultat = useMemo(() => ugedagResultat(dato, lang), [dato, lang]);
  const uge = useMemo(() => ugenOmkring(dato, lang), [dato, lang]);
  const uguelig = dato !== "" && resultat === null;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="ugedag-dato" className="block text-sm font-medium mb-2 dark:text-gray-200">
          {l.dato}
        </label>
        <input
          id="ugedag-dato"
          type="date"
          value={dato}
          onChange={(e) => setDato(e.target.value)}
          aria-describedby="ugedag-hint"
          className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white min-h-[44px]"
        />
        <p id="ugedag-hint" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {l.forUgedagHint}
        </p>
        <button
          type="button"
          onClick={() => setDato(iDagPaSiden(new Date(), lang === "se" ? "se" : "da"))}
          className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 min-h-[44px]"
        >
          <CalendarDays className="w-4 h-4" aria-hidden="true" />
          {l.iDag}
        </button>
      </div>

      {uguelig && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {l.fejlDato}
        </p>
      )}

      {resultat && (
        <>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {resultat.datoTekst}
            </p>
            <p className="text-3xl md:text-4xl font-bold mb-4">
              {resultat.ugedagTekst}
            </p>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">{l.ugaar}</dt>
                <dd className="text-lg font-semibold">{resultat.uge}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600 dark:text-gray-400">{l.hverdagsUge}</dt>
                <dd className="text-lg font-semibold">
                  {l.ugeDagTallet(resultat.ugedagIso)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{l.ugaarHint}</p>
          </div>

          <div>
            <h3 className="font-medium mb-3 dark:text-gray-100">{l.heleUgen}</h3>
            <ol className="grid grid-cols-7 gap-1 sm:gap-2">
              {uge.map((dag) => (
                <li key={dag.iso}>
                  <div
                    aria-current={dag.erValgt ? "date" : undefined}
                    className={[
                      "rounded-lg p-2 text-center min-h-[64px] flex flex-col items-center justify-center",
                      dag.erValgt
                        ? "bg-blue-600 text-white"
                        : dag.weekend
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          : "bg-white dark:bg-gray-800",
                      dag.weekend && !dag.erValgt ? "opacity-90" : "",
                    ].join(" ")}
                  >
                    <span className="text-xs uppercase tracking-wide">
                      {dag.ugedagKort}
                    </span>
                    <span className="text-lg font-semibold">{dag.tekst}</span>
                  </div>
                  <span className="sr-only">
                    {dag.ugedagTekst} {dag.tekst}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {!resultat && !uguelig && (
        <p className="text-gray-600 dark:text-gray-400">{l.ingenDato}</p>
      )}

      <div className="flex justify-end">
        <ResetButton onReset={nulstil} className="min-h-[44px]" />
      </div>
    </div>
  );
}
