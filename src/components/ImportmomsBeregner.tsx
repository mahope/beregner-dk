"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency } from "@/lib/format";
import {
  beregnImportmoms,
  EGENVAERDI_GRENSE_KR_OMRUND,
  MOMS_UDEN_FOR_EU,
  TOLD_FLAT_KR_PR_VARELINJE_OMRUND,
  type ImportmomsInput,
} from "@/lib/importmoms";

const labels = {
  da: {
    overskrift: "Moms på varer købt uden for EU",
    egenvaerdi: "Varens pris (kr.)",
    egenvaerdiHjælp: "uden fragt",
    fragt: "Fragt (kr.)",
    vareposter: "Antal vareposter",
    vareposterHjælp: "en varepost er én varetype — 3 t-shirts og et par bukser er 2 vareposter",
    toldsats: "Toldsats (%)",
    toldsatsHjælp: "find den i EU's toldtarif under din vares kode",
    resultat: "Sådan meget kommer pakken til at koste",
    værdiOgFragt: "Værdi + fragt",
    told: "Told",
    moms: "Moms",
    iAlt: "I alt",
    tom: "Skriv varens pris for at se tolden og momsen.",
    ugyldig:
      "Prisen skal være et tal over 0, og antal vareposter skal være 1 eller mere. En pakke uden varer koster heller ikke told.",
    overGraense: (kr: string) =>
      `Varen er over grænsen på ${kr}, så tolden er den sats, EU's toldtarif giver for netop den vare.`,
    underGraense: (kr: string) =>
      `Varen er under grænsen på ${kr}, så tolden er ${TOLD_FLAT_KR_PR_VARELINJE_OMRUND} kr. pr. varepost uanset prisen.`,
    note: (grænse: string) =>
      `Momsen er ${MOMS_UDEN_FOR_EU} % af varens pris, fragten og tolden — det er momsgrundlaget i momslovens § 32 stk. 1. Under eller på 150 EUR (${grænse}) er der fra 1. juli 2026 3 EUR i told pr. varepost, og over det gælder den tarifmæssige toldsats. Fragt og forsikring frem til EU tæller med i momsgrundlaget, fordi de er afgifter, der er foranlediget af indførslen.`,
  },
  se: {
    overskrift: "Moms på varor köpta utanför EU",
    egenvaerdi: "Varans pris (kr)",
    egenvaerdiHjælp: "utan frakt",
    fragt: "Frakt (kr)",
    vareposter: "Antal varuposter",
    vareposterHjælp: "en varupost är en varutyp — 3 t-shirts och ett par byxor är 2 varuposter",
    toldsats: "Tullsats (%)",
    toldsatsHjælp: "läs av den i EU:s tulltaxa under din varus kod",
    resultat: "Så mycket kostar paketet",
    værdiOgFragt: "Värde + fragt",
    told: "Tull",
    moms: "Moms",
    iAlt: "Totalt",
    tom: "Skriv varans pris för att se tullen och momsen.",
    ugyldig:
      "Priset måste vara ett tal över 0, och antalet varuposter måste vara 1 eller mer. Ett paket utan varor kostar inte tull heller.",
    overGraense: (kr: string) =>
      `Varan är över gränsen på ${kr}, så tullen är den sats som EU:s tulltaxa anger för just den varan.`,
    underGraense: (kr: string) =>
      `Varan är under gränsen på ${kr}, så tullen är ${TOLD_FLAT_KR_PR_VARELINJE_OMRUND} kr per varupost oavsett priset.`,
    note: (grænse: string) =>
      `Momsen är ${MOMS_UDEN_FOR_EU} % av varans pris, frakten och tullen — det är beskattningsunderlaget enligt EU:s momsdirektiv artikel 74. Under eller på 150 EUR (${grænse}) gäller från 1 juli 2026 3 EUR i tull per varupost, och över det gäller tullsatsen i tulltaxan. Frakt och försäkring fram till EU räknas med i underlaget.`,
  },
} as const;

export default function ImportmomsBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [vaerdi, setVaerdi] = useState("800");
  const [fragt, setFragt] = useState("100");
  const [vareposter, setVareposter] = useState("3");
  const [toldsats, setToldsats] = useState("");

  const tal = (vaerdi: string) => Number(vaerdi.replace(",", "."));
  const input: ImportmomsInput = useMemo(
    () => ({
      egenvaerdi: tal(vaerdi),
      fragt: tal(fragt),
      vareposter: Math.round(tal(vareposter)),
      ...(toldsats.trim() === "" ? {} : { toldsats: tal(toldsats) }),
    }),
    [vaerdi, fragt, vareposter, toldsats],
  );

  const resultat = useMemo(() => beregnImportmoms(input), [input]);
  const grænse = `${formatCurrency(EGENVAERDI_GRENSE_KR_OMRUND, lang)} (150 EUR)`;
  const kr = (n: number) => formatCurrency(n, locale);

  const feltCls =
    "w-full px-4 py-3 border border-gray-300 rounded-lg text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <section
      aria-labelledby="importmoms-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="importmoms-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {l.overskrift}
      </h2>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="importmoms-vaerdi" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.egenvaerdi}
          </label>
          <input
            id="importmoms-vaerdi"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={vaerdi}
            onChange={(e) => setVaerdi(e.target.value)}
            className={feltCls}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.egenvaerdiHjælp}</p>
        </div>
        <div>
          <label htmlFor="importmoms-fragt" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.fragt}
          </label>
          <input
            id="importmoms-fragt"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={fragt}
            onChange={(e) => setFragt(e.target.value)}
            className={feltCls}
          />
        </div>
        <div>
          <label htmlFor="importmoms-vareposter" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            {l.vareposter}
          </label>
          <input
            id="importmoms-vareposter"
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            value={vareposter}
            onChange={(e) => setVareposter(e.target.value)}
            className={feltCls}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.vareposterHjælp}</p>
        </div>
        {resultat && !resultat.laevVaerdi && (
          <div>
            <label htmlFor="importmoms-toldsats" className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              {l.toldsats}
            </label>
            <input
              id="importmoms-toldsats"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={toldsats}
              placeholder="0"
              onChange={(e) => setToldsats(e.target.value)}
              className={feltCls}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.toldsatsHjælp}</p>
          </div>
        )}
      </div>

      {resultat ? (
        <>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{l.resultat}</h3>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <li className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {kr(resultat.toldgrundlag)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.værdiOgFragt}</div>
            </li>
            <li className="p-3 rounded-lg text-center bg-gray-50 dark:bg-gray-900/50">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-100 tabular-nums">
                {kr(resultat.told)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.told}</div>
            </li>
            <li className="p-3 rounded-lg text-center bg-blue-50 dark:bg-blue-900/30">
              <div className="text-lg font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                {kr(resultat.moms)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {l.moms} ({MOMS_UDEN_FOR_EU} %)
              </div>
            </li>
            <li className="p-3 rounded-lg text-center bg-green-50 dark:bg-green-900/20">
              <div className="text-lg font-semibold text-green-700 dark:text-green-400 tabular-nums">
                {kr(resultat.iAlt)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.iAlt}</div>
            </li>
          </ul>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {resultat.laevVaerdi ? l.underGraense(grænse) : l.overGraense(grænse)}
          </p>
        </>
      ) : vaerdi.trim() !== "" && vareposter.trim() !== "" ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.ugyldig}</p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.tom}</p>
      )}

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{l.note(grænse)}</p>
    </section>
  );
}