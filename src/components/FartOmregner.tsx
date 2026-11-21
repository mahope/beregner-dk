"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  HASTIGHED_ENHEDER,
  erGyldigFartvaerdi,
  fartOmregningsFakta,
  omregnFartTilAlle,
  rundFart,
  sekunderPr100m,
  tempoMinPrKm,
  type HastighedId,
} from "@/lib/fart-omregner";

const enhedLabels: Record<HastighedId, { da: string; se: string }> = {
  km_t: { da: "Kilometer i timen (km/t)", se: "Kilometer i timmen (km/h)" },
  m_s: { da: "Meter i sekundet (m/s)", se: "Meter i sekunden (m/s)" },
  mph: { da: "Miles i timen (mph)", se: "Miles i timmen (mph)" },
  knop: { da: "Knob (kn)", se: "Knop (kn)" },
};

const labels = {
  da: {
    overskrift: "Omregn hastighed",
    vaerdi: "Hastighed",
    enhed: "Enhed",
    resultat: "Samme hastighed i",
    tilLaeb: "Det samme i løbetal",
    tempo: "Tempo",
    sek100: "Sekunder pr. 100 m",
    note: (f: ReturnType<typeof fartOmregningsFakta>) =>
      `1 mile er præcis ${f.milKm} km, fordi 1 yard er præcis 0,9144 m, og 1 sømil er præcis ${f.somermilKm} km. 1 m/s er præcis ${f.meterPerSekund} km/t, fordi der er ${f.sekPerTime} sekunder i en time. Derfor er faktorerne ovenfor hele omregningen — ikke afrundede tal.`,
    ugyldig: "Skriv et tal i feltet for at se hastigheden i de andre enheder.",
    nulpraxis:
      "Ved 0 km/t kan du ikke løbe — derfor står der ikke noget tempo. Skriv en fart over 0 for at se det.",
  },
  se: {
    overskrift: "Omvandla hastighet",
    vaerdi: "Hastighet",
    enhed: "Enhet",
    resultat: "Samma hastighet i",
    tilLaeb: "Samma i löpningstal",
    tempo: "Tempo",
    sek100: "Sekunder per 100 m",
    note: (f: ReturnType<typeof fartOmregningsFakta>) =>
      `1 mile är exakt ${f.milKm} km, eftersom 1 yard är exakt 0,9144 m, och 1 sjömil är exakt ${f.somermilKm} km. 1 m/s är exakt ${f.meterPerSekund} km/h, eftersom det går ${f.sekPerTime} sekunder på en timme. Därför är faktorerna ovan hela omvandlingen — inte avrundade tal.`,
    ugyldig: "Skriv ett tal i fältet för att se hastigheten i de andra enheterna.",
    nulpraxis:
      "Vid 0 km/h kan du inte springa — därför står det inget tempo. Skriv en fart över 0 för att se det.",
  },
} as const;

export default function FartOmregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [vaerdi, setVaerdi] = useState<string>("100");
  const [enhed, setEnhed] = useState<HastighedId>("km_t");

  const tal = Number(vaerdi.replace(",", "."));
  const gyldig = vaerdi.trim() !== "" && erGyldigFartvaerdi(tal);

  const alle = useMemo(
    () => (gyldig ? omregnFartTilAlle(tal, enhed) : null),
    [gyldig, tal, enhed],
  );

  const tempo = alle ? tempoMinPrKm(alle.km_t) : null;
  const sek100 = alle ? sekunderPr100m(alle.km_t) : null;

  const fmt = (n: number, decimaler: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });

  const feltCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <section aria-labelledby="fartomregner-overskrift" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
      <h2 id="fartomregner-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {l.overskrift}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="fart-omregner-vaerdi" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.vaerdi}
          </label>
          <input
            id="fart-omregner-vaerdi"
            type="number"
            inputMode="decimal"
            step="any"
            value={vaerdi}
            onChange={(e) => setVaerdi(e.target.value)}
            className={feltCls}
          />
        </div>
        <div>
          <label htmlFor="fart-omregner-enhed" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.enhed}
          </label>
          <select
            id="fart-omregner-enhed"
            value={enhed}
            onChange={(e) => setEnhed(e.target.value as HastighedId)}
            className={feltCls}
          >
            {HASTIGHED_ENHEDER.map((enh) => (
              <option key={enh.id} value={enh.id}>
                {enhedLabels[enh.id][lang]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alle ? (
        <>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{l.resultat}</h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {HASTIGHED_ENHEDER.map((enh) => {
              const valgt = enh.id === enhed;
              return (
                <li
                  key={enh.id}
                  className={`p-3 rounded-lg text-center ${
                    valgt
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-900/50"
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {fmt(rundFart(alle[enh.id], enh.id), enh.decimaler)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {enhedLabels[enh.id][lang]}
                  </div>
                </li>
              );
            })}
          </ul>

          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {l.tilLaeb}
          </h3>
          <ul className="grid grid-cols-2 gap-3">
            <li className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {tempo === null ? "—" : fmt(tempo, 2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {l.tempo} (min/km)
              </div>
            </li>
            <li className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {sek100 === null ? "—" : fmt(sek100, 1)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.sek100}</div>
            </li>
          </ul>
          {tempo === null && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{l.nulpraxis}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.ugyldig}</p>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {l.note(fartOmregningsFakta(locale))}
      </p>
    </section>
  );
}
