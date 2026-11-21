"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  FORBRUGS_ENHEDER,
  erGyldigtForbrug,
  omregnTilAlleForbrug,
  rundForbrug,
  omregnForbrug,
  type ForbrugsEnhedId,
} from "@/lib/forbrugs-omregner";

const enhedLabels: Record<ForbrugsEnhedId, { da: string; se: string }> = {
  kmPerLiter: { da: "Kilometer pr. liter (km/l)", se: "Kilometer per liter (km/l)" },
  literPr100km: { da: "Liter pr. 100 km (l/100km)", se: "Liter per 100 km (l/100km)" },
  mpg: { da: "Mil pr. gallon, USA (mpg)", se: "Mil per gallon, USA (mpg)" },
  mpgUk: { da: "Mil pr. gallon, Storbritannien (mpg)", se: "Mil per gallon, Storbritannien (mpg)" },
};

const labels = {
  da: {
    overskrift: "Omregn bilens forbrug",
    vaerdi: "Forbrug",
    enhed: "Enhed",
    resultat: "Samme forbrug i",
    note: (mpgUs: string, mpgUk: string) =>
      `1 mil er præcis 1,609344 km, og en US gallon er præcis 3,785411784 liter, så 1 km/l er ${mpgUs} mpg i USA og ${mpgUk} mpg i Storbritannien. De to gallon-enheder er derfor ikke det samme.`,
    ugyldig: "Skriv et tal i feltet for at se forbruget i de andre enheder.",
    negativt:
      "Et forbrug skal være større end 0. Skriver du 0 liter pr. 100 km, svarer det til en bil der ikke bruger brændstof.",
  },
  se: {
    overskrift: "Omvandla bilens förbrukning",
    vaerdi: "Förbrukning",
    enhed: "Enhet",
    resultat: "Samma förbrukning i",
    note: (mpgUs: string, mpgUk: string) =>
      `1 mil är exakt 1,609344 km och en US gallon är exakt 3,785411784 liter, så 1 km/l är ${mpgUs} mpg i USA och ${mpgUk} mpg i Storbritannien. De två gallon-enheterna är alltså inte samma sak.`,
    ugyldig: "Skriv ett tal i fältet för att se förbrukningen i de andra enheterna.",
    negativt:
      "En förbrukning måste vara större än 0. Skriver du 0 liter per 100 km motsvarar det en bil som inte använder bränsle.",
  },
} as const;

export default function Forbrugsomregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [vaerdi, setVaerdi] = useState<string>("6.7");
  const [enhed, setEnhed] = useState<ForbrugsEnhedId>("literPr100km");

  const tal = Number(vaerdi.replace(",", "."));
  const gyldig = vaerdi.trim() !== "" && erGyldigtForbrug(tal);

  const alle = useMemo(
    () => (gyldig ? omregnTilAlleForbrug(tal, enhed) : null),
    [gyldig, tal, enhed],
  );

  const fmt = (n: number, decimaler: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });

  const feltCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <section
      aria-labelledby="forbrugsomregner-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="forbrugsomregner-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {l.overskrift}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="forbrugsomregner-vaerdi"
            className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
          >
            {l.vaerdi}
          </label>
          <input
            id="forbrugsomregner-vaerdi"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={vaerdi}
            onChange={(e) => setVaerdi(e.target.value)}
            className={feltCls}
          />
        </div>
        <div>
          <label
            htmlFor="forbrugsomregner-enhed"
            className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
          >
            {l.enhed}
          </label>
          <select
            id="forbrugsomregner-enhed"
            value={enhed}
            onChange={(e) => setEnhed(e.target.value as ForbrugsEnhedId)}
            className={feltCls}
          >
            {FORBRUGS_ENHEDER.map((e) => (
              <option key={e.id} value={e.id}>
                {enhedLabels[e.id][lang]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alle ? (
        <>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {l.resultat}
          </h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FORBRUGS_ENHEDER.map((e) => {
              const valgt = e.id === enhed;
              return (
                <li
                  key={e.id}
                  className={`p-3 rounded-lg text-center ${
                    valgt ? "bg-blue-50 dark:bg-blue-900/30" : "bg-gray-50 dark:bg-gray-900/50"
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {fmt(rundForbrug(alle[e.id], e.id), e.decimaler)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {enhedLabels[e.id][lang]}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : tal <= 0 && vaerdi.trim() !== "" ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.negativt}</p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.ugyldig}</p>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {l.note(
          fmt(rundForbrug(omregnForbrug(1, "kmPerLiter", "mpg"), "mpg"), 1),
          fmt(rundForbrug(omregnForbrug(1, "kmPerLiter", "mpgUk"), "mpgUk"), 1),
        )}
      </p>
    </section>
  );
}