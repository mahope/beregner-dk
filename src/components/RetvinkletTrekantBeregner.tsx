"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Triangle } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  MAX_MAAL_M,
  MIN_MAAL_M,
  RETVINKLET_EKSEMPEL,
  RETVINKLET_FELT,
  loesRetvinklet,
  type RetvinkletSvar,
} from "@/lib/retvinklet-trekant";

const labels = {
  da: {
    calcName: "Retvinklet trekant-beregner",
    resultLabel: "Resultat",
    hypotenuse: "Hypotenusen c",
    katete: "Katete",
    formel: "Pythagoras",
    vinkler: "Vinklerne",
    areal: "Areal",
    omkreds: "Omkreds",
    vinkelA: "Vinkel A",
    vinkelB: "Vinkel B",
    vinkelC: "Vinkel C",
    meter: "i m",
    intro: "Udfyld to af de tre sider — den tredje regnes ud.",
    fejl:
      "Tjek tallene: hypotenusen skal være den længste side, og de tre sider skal passe med a² + b² = c².",
    mangler: "Udfyld mindst to sider for at se et svar.",
    shareSummary: "Retvinklet trekant",
  },
  se: {
    calcName: "Rätvinklig triangel-beräknare",
    resultLabel: "Resultat",
    hypotenuse: "Hypotenusan c",
    katete: "Katet",
    formel: "Pythagoras",
    vinkler: "Vinklarna",
    areal: "Area",
    omkreds: "Omkrets",
    vinkelA: "Vinkel A",
    vinkelB: "Vinkel B",
    vinkelC: "Vinkel C",
    meter: "i m",
    intro: "Fyll i två av de tre sidorna — den tredje räknas ut.",
    fejl:
      "Kontrollera talen: hypotenusan måste vara den längsta sidan, och de tre sidorna ska stämma med a² + b² = c².",
    mangler: "Fyll i minst två sidor för att se ett svar.",
    shareSummary: "Rätvinklig triangel",
  },
} as const;

/** Sidene i meter. `0` betyder «ikke udfyldt», så feltet viser en tom streng. */
const START = { a: RETVINKLET_EKSEMPEL.input.a, b: RETVINKLET_EKSEMPEL.input.b, c: 0 };

export default function RetvinkletTrekantBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number, decimals: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const [sider, setSider] = useState<Record<"a" | "b" | "c", number>>(() => ({ ...START }));

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("retvinklet-trekant");
    const timer = setTimeout(() => trackCalculation("retvinklet-trekant"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const svar = useMemo<RetvinkletSvar | undefined>(() => {
    try {
      return loesRetvinklet({
        a: sider.a > 0 ? sider.a : undefined,
        b: sider.b > 0 ? sider.b : undefined,
        c: sider.c > 0 ? sider.c : undefined,
      });
    } catch {
      // `loesRetvinklet` kaster på en umulig trekant. Værktøjet skal vise en
      // hjælpsom besked og ikke en fejl fra modulet (punkt 8: 5xx er forbigående).
      return undefined;
    }
  }, [sider]);

  const udfyldtAntal = [sider.a, sider.b, sider.c].filter((v) => v > 0).length;
  const visFejl = udfyldtAntal >= 2 && svar === undefined;

  const navnFor = useCallback(
    (side: "a" | "b" | "c") =>
      side === "c" ? l.hypotenuse : `${l.katete} ${side}`,
    [l]
  );

  const resultatTekst = svar
    ? `${navnFor(svar.udregnet)} = ${fmt(svar[svar.udregnet], svar[svar.udregnet] < 1 ? 4 : 3)} ${l.meter}`
    : "";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {RETVINKLET_FELT.map((felt) => {
            const id = `retvinklet-${felt.nogle}`;
            const forLille = sider[felt.nogle] > 0 && sider[felt.nogle] < MIN_MAAL_M;
            const fremhaevet = svar?.udregnet === felt.nogle;
            return (
              <div key={felt.nogle}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {felt[lang]}
                </label>
                <div className="relative">
                  <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    min={MIN_MAAL_M}
                    max={MAX_MAAL_M}
                    step="0.01"
                    value={sider[felt.nogle] === 0 ? "" : sider[felt.nogle]}
                    aria-invalid={forLille || undefined}
                    aria-describedby={`${id}-hjaelp`}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSider((s) => ({ ...s, [felt.nogle]: Number.isFinite(v) ? v : 0 }));
                    }}
                    className={`w-full rounded-lg border px-4 py-2.5 pr-14 dark:bg-gray-700 dark:text-white ${
                      fremhaevet
                        ? "border-blue-600 bg-blue-50 dark:border-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">m</span>
                </div>
                <p id={`${id}-hjaelp`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {felt[lang === "da" ? "hjaelpDa" : "hjaelpSe"]}
                </p>
              </div>
            );
          })}

          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          {svar ? (
            <>
              <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">{l.resultLabel}</p>
                <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
                  <Triangle className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
                  <span>{resultatTekst}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {l.formel}: {svar.regnestykke}
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{l.vinkler}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-900 dark:text-white">
                  <span>
                    {l.vinkelA} = <span className="font-semibold">{fmt(svar.vinkelA, 2)}°</span>
                  </span>
                  <span>
                    {l.vinkelB} = <span className="font-semibold">{fmt(svar.vinkelB, 2)}°</span>
                  </span>
                  <span>
                    {l.vinkelC} = <span className="font-semibold">90°</span>
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{l.areal}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(svar.areal, 3)} m²
                  </p>
                </div>
                <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{l.omkreds}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {fmt(svar.omkreds, 3)} m
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className={visFejl ? "text-sm text-red-700 dark:text-red-300" : "text-sm text-gray-600 dark:text-gray-400"}>
              {visFejl ? l.fejl : l.mangler}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        {svar ? (
          <CopyResultButton
            text={`${l.shareSummary}: ${resultatTekst}, A = ${fmt(svar.vinkelA, 2)}°, B = ${fmt(svar.vinkelB, 2)}°`}
          />
        ) : null}
      </div>
    </div>
  );
}
