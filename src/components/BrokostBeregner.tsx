"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  BROKOST_KATEGORIER,
  BROKOST_RABATTER,
  BROKOST_START,
  BROKOST_START_OVERFARTER,
  BROKOST_START_TURE,
  MAX_OVERFARTER,
  MAX_TURE,
  MIN_OVERFARTER,
  MIN_TURE,
  beregnBrokost,
  brokostAarsforskel,
  type Betalingsform,
  type Rabat,
} from "@/lib/brokost";

/**
 * Alle danske strenge ligger i objektet, så ingen af dem kan stå løst i JSX'et
 * og blive hængende på et andet domæne end minberegner.dk.
 */
const labels = {
  calcName: "Brokostberegner",
  intro:
    "Vælg køretøj, betalingsform og antal gange du kører over. Priserne er Storebælts prisliste 2026 for én overfart.",
  køretøj: "Køretøj",
  betaling: "Betalingsform",
  betalingEkspres: "Eksprespris (Bizz eller nummerplade)",
  betalingKort: "Kort- og kontantpris",
  overfarter: "Overfarter i turen",
  ture: "Gange om året",
  rabat: "Fritidsrabat",
  rabatIngen: "Ingen rabat",
  rabatAften: "Aftenrabat (kl. 16-03 samme aften)",
  rabatWeekend: "Weekendrabat (fredag 12 - søndag 24)",
  rabatHelligdag: "Helligdagsrabat (helligdag)",
  prisPrOverfart: "Pris pr. overfart",
  turFoerRabat: "Turen før rabat",
  rabatBesparelse: "Rabat",
  prOverfartEfterRabat: "Pr. overfart: {kr} kr.",
  turEfterRabat: "Turen efter rabat",
  aarsforbrug: "Om året",
  prMaaned: "Pr. måned",
  forbeholdIkkeUnder6:
    "Fritidsrabatten gælder kun køretøjer under 6 m. Denne pris ligger derfor uændret.",
  forbeholdIkkeKort:
    "Fritidsrabatten kræver betaling med Bizz eller nummerplade. Betaler du med kort, er turen dyrere end den er.",
  forbeholdIkkeBilligere:
    "{billet} kr. for tur/retur er mere end de {overfarter} overfarter til {kr} kr., så billetten kan ikke spare noget her.",
  forbeholdIkkeTurRetur:
    "Fritidsrabatten er en tur/retur-pris, så den kan kun bruges ved to overfarter.",
  kortIkkeMulig:
    "Denne pris kræver en autocamperaftale med betalingsmiddel, så den findes kun som eksprespris.",
  aarsForskelDyrere:
    "Betales der med kort i stedet for automatisk betalingsmiddel, koster året {kr} kr. mere.",
  shareSummary: "Brokost",
  forudindstillet: "Forudindstillet på en personbil 3-6 m, tur/retur med eksprespris.",
} as const;

function forbeholdTekst(
  r: NonNullable<ReturnType<typeof beregnBrokost>>,
  l: typeof labels,
  locale: "da"
): string | null {
  switch (r.rabatForbehold) {
    case "ikke-under-6-m":
      return l.forbeholdIkkeUnder6;
    case "ikke-kort":
      return l.forbeholdIkkeKort;
    case "ikke-tur-retur":
      return l.forbeholdIkkeTurRetur;
    case "ikke-billigere":
      return l.forbeholdIkkeBilligere
        .replace("{billet}", formatNumber(BROKOST_RABATTER[r.rabat as Exclude<Rabat, "ingen">], locale, { maximumFractionDigits: 0 }))
        .replace("{overfarter}", String(r.overfarter))
        .replace("{kr}", formatNumber(r.turFoerRabat, locale, { maximumFractionDigits: 0 }));
    default:
      return null;
  }
}

export default function BrokostBeregner() {
  // Siden findes kun på minberegner.dk (`daOnly` i calculator-list), så alle
  // tal formateres dansk. Gik der engang en svensk version, skal `locale` med
  // på hele vejen — ellers får svenske læsere danske tal på dansk tekst.
  const locale = "da" as const;
  const l = labels;
  const kr = (n: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [nokkel, setNokkel] = useState<string>(BROKOST_START);
  const [betalingsform, setBetalingsform] = useState<Betalingsform>("ekspres");
  const [overfarter, setOverfarter] = useState<number>(BROKOST_START_OVERFARTER);
  const [ture, setTure] = useState<number>(BROKOST_START_TURE);
  const [rabat, setRabat] = useState<Rabat>("ingen");

  const harRegistreret = useRef(false);
  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("brokost");
    const timer = setTimeout(() => trackCalculation("brokost"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const resultat = useMemo(
    () => beregnBrokost({ nokkel, betalingsform, overfarter, ture, rabat }),
    [nokkel, betalingsform, overfarter, ture, rabat]
  );

  // Kortbetaling findes ikke for autocamperaftalen. Værktøjet må ikke stå med
  // et tomt svar, så betalingsformen skifter til eksprespris igen, som er den
  // eneste kilden angiver for den køretøjstype.
  useEffect(() => {
    if (resultat === null) setBetalingsform("ekspres");
  }, [resultat]);

  if (!resultat) return null;

  const forbehold = forbeholdTekst(resultat, l, locale);
  const aarsForskel = brokostAarsforskel(resultat.kategori, overfarter, ture);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{l.calcName}</h2>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{l.intro}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="brokost-koeretoej" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.køretøj}
          </label>
          <select
            id="brokost-koeretoej"
            value={nokkel}
            onChange={(e) => setNokkel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {BROKOST_KATEGORIER.map((k) => (
              <option key={k.nokkel} value={k.nokkel}>
                {k.etiket}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col">
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.betaling}
          </legend>
          <div className="flex flex-wrap gap-4">
            <label
              htmlFor="brokost-betaling-ekspres"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                id="brokost-betaling-ekspres"
                type="radio"
                name="brokost-betaling"
                value="ekspres"
                checked={betalingsform === "ekspres"}
                onChange={() => setBetalingsform("ekspres")}
                className="w-4 h-4"
              />
              {l.betalingEkspres}
            </label>
            <label
              htmlFor="brokost-betaling-kort"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                id="brokost-betaling-kort"
                type="radio"
                name="brokost-betaling"
                value="kort"
                checked={betalingsform === "kort"}
                onChange={() => setBetalingsform("kort")}
                disabled={resultat.kategori.kortpris === null}
                className="w-4 h-4"
              />
              {l.betalingKort}
            </label>
          </div>
          {resultat.kategori.kortpris === null && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{l.kortIkkeMulig}</p>
          )}
        </fieldset>

        <div className="flex flex-col">
          <label htmlFor="brokost-overfarter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.overfarter}
          </label>
          <input
            id="brokost-overfarter"
            type="number"
            inputMode="numeric"
            min={MIN_OVERFARTER}
            max={MAX_OVERFARTER}
            value={overfarter}
            onChange={(e) => setOverfarter(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="brokost-ture" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.ture}
          </label>
          <input
            id="brokost-ture"
            type="number"
            inputMode="numeric"
            min={MIN_TURE}
            max={MAX_TURE}
            value={ture}
            onChange={(e) => setTure(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label htmlFor="brokost-rabat" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.rabat}
          </label>
          <select
            id="brokost-rabat"
            value={rabat}
            onChange={(e) => setRabat(e.target.value as Rabat)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            <option value="ingen">{l.rabatIngen}</option>
            <option value="aften">
              {l.rabatAften} ({kr(BROKOST_RABATTER.aften)} kr. tur/retur)
            </option>
            <option value="weekend">
              {l.rabatWeekend} ({kr(BROKOST_RABATTER.weekend)} kr. tur/retur)
            </option>
            <option value="helligdag">
              {l.rabatHelligdag} ({kr(BROKOST_RABATTER.helligdag)} kr. tur/retur)
            </option>
          </select>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-5 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{resultat.kategori.etiket}</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
          {kr(resultat.turEfterRabat)} kr.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {resultat.overfarter === 2 ? "tur/retur" : `${resultat.overfarter} overfarter`} ·{" "}
          {l.prOverfartEfterRabat.replace("{kr}", kr(resultat.prOverfartEfterRabat))} ·{" "}
          {l.aarsforbrug.replace("{kr}", kr(resultat.aarsforbrug))} ({resultat.ture}{" "}
          {resultat.ture === 1 ? "gang" : "gange"})
        </p>
      </div>

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <div className="flex justify-between gap-4">
          <dt>{l.prisPrOverfart}</dt>
          <dd className="font-medium">{kr(resultat.prisPrOverfart)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.turFoerRabat}</dt>
          <dd className="font-medium">{kr(resultat.turFoerRabat)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.rabatBesparelse}</dt>
          <dd className="font-medium">
            {resultat.rabatKr > 0 ? `−${kr(resultat.rabatKr)} kr.` : "0 kr."}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.turEfterRabat}</dt>
          <dd className="font-medium">{kr(resultat.turEfterRabat)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.aarsforbrug}</dt>
          <dd className="font-medium">{kr(resultat.aarsforbrug)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.prMaaned}</dt>
          <dd className="font-medium">{kr(resultat.prMaaned)} kr.</dd>
        </div>
      </dl>

      {forbehold && <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">{forbehold}</p>}

      {aarsForskel !== null && aarsForskel > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {l.aarsForskelDyrere.replace("{kr}", kr(aarsForskel))}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{l.forudindstillet}</p>

      <CopyResultButton
        text={`${l.shareSummary}: ${kr(resultat.turEfterRabat)} kr. ${l.prOverfartEfterRabat.replace("{kr}", kr(resultat.prOverfartEfterRabat))}, ${l.aarsforbrug.replace("{kr}", kr(resultat.aarsforbrug))} (${resultat.kategori.etiket})`}
      />
    </div>
  );
}
