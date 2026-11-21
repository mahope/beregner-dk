"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  ORESUND_GO_AARSAFGIFT,
  ORESUND_KATEGORIER,
  ORESUND_MAX_TURE,
  ORESUND_MIN_TURE,
  ORESUND_START,
  ORESUND_START_TURE,
  beregnOresundsbroen,
  type OresundBetalingsform,
} from "@/lib/oresundsbroen";

/**
 * Alle danske strenge ligger i objektet, så ingen af dem kan stå løst i JSX'et
 * og blive hængende på et andet domæne end minberegner.dk.
 */
const labels = {
  calcName: "Øresundsbroberegner",
  intro:
    "Vælg køretøj, betalingsform og antal ture om året. Priserne er Øresundsbrons prisliste fra 14. september 2026 for én overfart.",
  køretøj: "Køretøj",
  betaling: "Betalingsform",
  betalingGo: "ØresundGO (aftale)",
  betalingOnline: "Onlinebillet",
  betalingNormal: "Betalingsanlægget (normalpris)",
  ture: "Tur/retur om året",
  prisPrOverfart: "Pris pr. overfart",
  turReturPris: "Tur/retur",
  aarsafgift: "Årsafgift for ØresundGO",
  aarsforbrug: "Om året",
  prMaaned: "Pr. måned",
  normalAarsforbrug: "Samme rejse til normalpris",
  goTekst:
    "Med ØresundGO koster {go} kr. i årsafgift, og du sparer {kr} kr. om året mod at betale i betalingsanlægget.",
  goHint:
    "Med ØresundGO ville samme tur koste {go} kr. pr. overfart plus {aarsafgift} kr. i årsafgift — vælg den for at se, hvad du sparer.",
  shareSummary: "Øresundsbroen",
  forudindstillet: "Forudindstillet på en personbil (max 6 m) og tolv ture tur/retur om året.",
} as const;

export default function OresundsbroenBeregner() {
  // Siden findes kun på minberegner.dk, så alle tal formateres dansk.
  const locale = "da" as const;
  const l = labels;
  const kr = (n: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [nokkel, setNokkel] = useState<string>(ORESUND_START);
  const [betalingsform, setBetalingsform] = useState<OresundBetalingsform>("go");
  const [ture, setTure] = useState<number>(ORESUND_START_TURE);

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
    () => beregnOresundsbroen({ nokkel, betalingsform, ture }),
    [nokkel, betalingsform, ture]
  );

  if (!resultat) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-5 h-5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{l.calcName}</h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{l.intro}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col">
          <label htmlFor="oresund-koeretoej" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.køretøj}
          </label>
          <select
            id="oresund-koeretoej"
            value={nokkel}
            onChange={(e) => setNokkel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          >
            {ORESUND_KATEGORIER.map((k) => (
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
          <div className="flex flex-col gap-2">
            {(
              [
                ["go", l.betalingGo],
                ["online", l.betalingOnline],
                ["normal", l.betalingNormal],
              ] as const
            ).map(([vaerdi, tekst]) => (
              <label
                key={vaerdi}
                htmlFor={`oresund-betaling-${vaerdi}`}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  id={`oresund-betaling-${vaerdi}`}
                  type="radio"
                  name="oresund-betaling"
                  value={vaerdi}
                  checked={betalingsform === vaerdi}
                  onChange={() => setBetalingsform(vaerdi)}
                  className="w-4 h-4"
                />
                {tekst}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col md:col-span-2">
          <label htmlFor="oresund-ture" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.ture}
          </label>
          <input
            id="oresund-ture"
            type="number"
            inputMode="numeric"
            min={ORESUND_MIN_TURE}
            max={ORESUND_MAX_TURE}
            value={ture}
            onChange={(e) => setTure(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 p-5 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">{resultat.kategori.etiket}</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
          {kr(resultat.aarsforbrug)} kr.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {resultat.ture} {resultat.ture === 1 ? "tur" : "ture"} tur/retur ·{" "}
          {l.prisPrOverfart.toLowerCase()} {kr(resultat.prisPrOverfart)} kr. ·{" "}
          {l.prMaaned.toLowerCase()} {kr(resultat.prMaaned)} kr.
        </p>
      </div>

      <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
        <div className="flex justify-between gap-4">
          <dt>{l.prisPrOverfart}</dt>
          <dd className="font-medium">{kr(resultat.prisPrOverfart)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.turReturPris}</dt>
          <dd className="font-medium">{kr(resultat.turReturPris)} kr.</dd>
        </div>
        {resultat.aarsafgift > 0 && (
          <div className="flex justify-between gap-4">
            <dt>{l.aarsafgift}</dt>
            <dd className="font-medium">{kr(resultat.aarsafgift)} kr.</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>{l.aarsforbrug}</dt>
          <dd className="font-medium">{kr(resultat.aarsforbrug)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.prMaaned}</dt>
          <dd className="font-medium">{kr(resultat.prMaaned)} kr.</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>{l.normalAarsforbrug}</dt>
          <dd className="font-medium">{kr(resultat.normalAarsforbrug)} kr.</dd>
        </div>
      </dl>

      {resultat.betalingsform === "go" ? (
        <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-4">
          {l.goTekst
            .replace("{go}", kr(ORESUND_GO_AARSAFGIFT))
            .replace("{kr}", kr(resultat.besparelseModNormal ?? 0))}
        </p>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {l.goHint
            .replace("{go}", kr(resultat.kategori.go))
            .replace("{aarsafgift}", kr(ORESUND_GO_AARSAFGIFT))}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{l.forudindstillet}</p>

      <CopyResultButton
        text={`${l.shareSummary}: ${kr(resultat.aarsforbrug)} kr. om året (${resultat.ture} ture tur/retur, ${resultat.kategori.etiket})`}
      />
    </div>
  );
}
