"use client";

import { beregnAlder } from "@/lib/alder";
import { formatAlder } from "@/lib/alder-eksempler";
import { folkepensionsdatoer, formatFolkepensionsalder } from "@/lib/folkepension";
import { getIntlLocale } from "@/lib/format";
import { tilIsoDato } from "@/lib/lokal-dato";
import { Cake } from "lucide-react";
import { useMemo, useState } from "react";

/**
 * "Hvornår kan jeg gå på folkepension?" — fødselsdatoen ind, datoen ud.
 *
 * /pension havde en tabel over folkepensionsalderen pr. fødselsår, men intet
 * der svarede på læserens eget spørgsmål. Tre danske autocomplete-træffere
 * målt 4/10 spørger netop om det: "hvad er min pensionsalder", "beregn min
 * pensionsalder" og "hvornår kan jeg gå på pension".
 *
 * Alle tal kommer fra `folkepensionsdatoer`, som læser den samme
 * `alderSkala` som tabellen på siden, og fra `beregnAlder`, som /alder
 * bruger — så værktøjet og brødteksten ikke kan komme til at sige hver deres
 * alder. Den halve alder (65½, 66½) regnes som seks måneder, fordi den er
 * skrevet med ½ i skalaen.
 *
 * **Kun dansk.** `alderSkala` er dansk lov (borger.dk, verificeret 25.9.2026),
 * så en svensk eller norsk udgave af de samme tal ville være opfundet — og
 * svensk holdes ude på /pension fordi hele brødteksten og tabellen er
 * dansk. Punkt 11 i kvalitetslisten, ikke en mangel på sprog.
 */

const l = {
  foedselsdato: "Fødselsdato",
    help: "Fødselsdatoen bestemmer folkepensionsalderen. Jo senere du er født, desto højere er den.",
    dinAlder: "Din folkepensionsalder",
    kanGaa: "Du kan gå på folkepension",
    soegSenest: "Søg senest",
    soegRegel: "Du skal selv søge — ansøgningen kan sendes seks måneder før.",
    tidTil: "Det er",
    nu: "Du kan gå på folkepension nu",
    foraeldre: "Født før 1954? Så er folkepensionsalderen 65 år, uanset datoen.",
  tom: "Indtast din fødselsdato for at se, hvornår du kan gå på folkepension",
} as const;

export default function FolkepensionsalderBeregner() {
  const [foedselsdato, setFoedselsdato] = useState("");
  const iDag = tilIsoDato(new Date());

  const resultat = useMemo(() => {
    if (!foedselsdato) return null;
    const datoer = folkepensionsdatoer(foedselsdato);
    if (!datoer) return null;
    const formatDato = (iso: string) =>
      new Date(`${iso}T00:00:00`).toLocaleDateString(getIntlLocale("da"), {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    // `beregnAlder` regner fra fødselsdatoen til en dato, så "tid til" er
    // alderen mellem i dag og alderdatoen — og null, når den ligger forude.
    const til = beregnAlder({ foedselsdato: iDag, beregningsdato: datoer.alderDato });
    return {
      ...datoer,
      alderTekst: formatFolkepensionsalder(datoer.alder),
      alderDatoTekst: formatDato(datoer.alderDato),
      soegDatoTekst: formatDato(datoer.soegDato),
      foedselsdatoTekst: formatDato(datoer.foedselsdato),
      tidTil: til ? formatAlder(til, "da") : null,
    };
  }, [foedselsdato, iDag]);

  return (
    <div className="my-6 rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-700 dark:bg-blue-900/30">
      <label
        htmlFor="folkepensionsalder-foedselsdato"
        className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-100"
      >
        {l.foedselsdato}
      </label>
      <input
        id="folkepensionsalder-foedselsdato"
        type="date"
        value={foedselsdato}
        max={iDag}
        onChange={(e) => setFoedselsdato(e.target.value)}
        className="w-full max-w-xs rounded-lg border px-4 py-3 text-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{l.help}</p>

      {resultat && (
        <div className="mt-5 rounded-xl border border-blue-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">{l.dinAlder}</p>
          <p className="flex items-center gap-2 text-3xl font-bold text-blue-700 dark:text-blue-400">
            <Cake className="h-7 w-7 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />
            {resultat.alderTekst}
          </p>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-300">{l.foedselsdato}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {resultat.foedselsdatoTekst}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-300">{l.kanGaa}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {resultat.alderDatoTekst}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-300">{l.soegSenest}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {resultat.soegDatoTekst}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            {resultat.tidTil ? `${l.tidTil} ${resultat.tidTil}.` : l.nu}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{l.soegRegel}</p>
          {resultat.foedselsdato < "1954-01-01" && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{l.foraeldre}</p>
          )}
        </div>
      )}

      {!resultat && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{l.tom}</p>
      )}
    </div>
  );
}