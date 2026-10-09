"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { kvadratmeterOmregningsFakta } from "@/lib/kvadratmeter-eksempler";
import {
  erGyldigArealvaerdi,
  omregnTilAlle,
  rundAreal,
  synligeArealEnheder,
  type ArealEnhedId,
} from "@/lib/areal-omregner";

const enhedLabels: Record<ArealEnhedId, { da: string; se: string }> = {
  m2: { da: "Kvadratmeter (m²)", se: "Kvadratmeter (m²)" },
  cm2: { da: "Kvadratcentimeter (cm²)", se: "Kvadratcentimeter (cm²)" },
  km2: { da: "Kvadratkilometer (km²)", se: "Kvadratkilometer (km²)" },
  hektar: { da: "Hektar (ha)", se: "Hektar (ha)" },
  kvadratfod: { da: "Kvadratfod (sq ft)", se: "Kvadratfot (sq ft)" },
  acre: { da: "Acre", se: "Acre" },
  "tonder-land": { da: "Tønde land", se: "Tønde land" },
  kvadratalen: { da: "Kvadratalen", se: "Kvadratalen" },
};

const labels = {
  da: {
    overskrift: "Omregn areal",
    vaerdi: "Areal",
    enhed: "Enhed",
    resultat: "Samme areal i",
    note: (f: OmregningsFakta) =>
      `1 kvadratfod er præcis ${f.kvadratfodM2} m², og 1 acre er de ${f.kvadratfodPrAcre} kvadratfod i en acre = ${f.acreM2} m². Foden er præcis ${f.fodMeter} m i både Danmark og Sverige, så tallene er de samme i begge lande.`,
    ugyldig: "Skriv et tal i feltet for at se arealet i de andre enheder.",
    negativt: "Et areal kan ikke være negativt. Hvis du vil omregne en forskel, kan du trække de to arealer fra hinanden.",
  },
  se: {
    overskrift: "Omvandla area",
    vaerdi: "Area",
    enhed: "Enhet",
    resultat: "Samma area i",
    note: (f: OmregningsFakta) =>
      `1 kvadratfot är exakt ${f.kvadratfodM2} m², och 1 acre är de ${f.kvadratfodPrAcre} kvadratfoten i en acre = ${f.acreM2} m². Foten är exakt ${f.fodMeter} m i både Danmark och Sverige, så talen är desamma i båda länderna.`,
    ugyldig: "Skriv ett tal i fältet för att se arean i de andra enheterna.",
    negativt: "En area kan inte vara negativ. Vill du omvandla en skillnad kan du dra av de två areaerna.",
  },
} as const;

/** De fire eksakte faktorer, formateret i det sprog de læses i. */
type OmregningsFakta = ReturnType<typeof kvadratmeterOmregningsFakta>;

export default function ArealOmregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [vaerdi, setVaerdi] = useState<string>("500");
  const [enhed, setEnhed] = useState<ArealEnhedId>("kvadratfod");

  // Gamle danske landmålingsenheder hører kun til på dansk, så den svenske
  // udgave af /kvadratmeter ikke viser «tønde land».
  const synlige = synligeArealEnheder(lang === "da");

  const tal = Number(vaerdi.replace(",", "."));
  const gyldig = vaerdi.trim() !== "" && erGyldigArealvaerdi(tal);

  const alle = useMemo(
    () => (gyldig ? omregnTilAlle(tal, enhed) : null),
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
    <section aria-labelledby="arealomregner-overskrift" className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
      <h2 id="arealomregner-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {l.overskrift}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="areal-omregner-vaerdi" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.vaerdi}
          </label>
          <input
            id="areal-omregner-vaerdi"
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
          <label htmlFor="areal-omregner-enhed" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.enhed}
          </label>
          <select
            id="areal-omregner-enhed"
            value={enhed}
            onChange={(e) => setEnhed(e.target.value as ArealEnhedId)}
            className={feltCls}
          >
            {synlige.map((e) => (
              <option key={e.id} value={e.id}>
                {enhedLabels[e.id][lang]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {alle ? (
        <>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{l.resultat}</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {synlige.map((e) => {
              const valgt = e.id === enhed;
              return (
                <li
                  key={e.id}
                  className={`p-3 rounded-lg text-center ${
                    valgt
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-900/50"
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                    {fmt(rundAreal(alle[e.id], e.id), e.decimaler)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{enhedLabels[e.id][lang]}</div>
                </li>
              );
            })}
          </ul>
        </>
      ) : tal < 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.negativt}</p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.ugyldig}</p>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {l.note(kvadratmeterOmregningsFakta(locale))}
      </p>
    </section>
  );
}
