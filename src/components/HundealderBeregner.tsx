"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Dog } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  HUNDE_STANDARD_STORRELSE,
  HUNDE_STORRELSER,
  HUNDE_STORRELSE_ORDER,
  LIVSFASE_NAVN,
  MAX_HUNDE_AAR,
  hundealderSvar,
  regnestykke,
  type HundeStorrelse,
} from "@/lib/hundealder";

const labels = {
  da: {
    calcName: "Hundealderberegner",
    aar: "Hundens alder (år)",
    maaneder: "Måneder",
    storrelse: "Størrelse",
    resultat: "Menneskeår",
    aarEnhed: "menneskeår",
    livsfase: "Livsfase",
    regnestykke: "Sådan regnes det",
    vaegt: "Vægt",
    intro:
      "Skriv hundens alder og vælg dens størrelse. En hund ældes hurtigst i de første to år, og store hunde ældes hurtigere end små.",
    shareSummary: "Hundealder",
  },
  se: {
    calcName: "Hundåldersberäknare",
    aar: "Hundens ålder (år)",
    maaneder: "Månader",
    storrelse: "Storlek",
    resultat: "Människoår",
    aarEnhed: "människoår",
    livsfase: "Livsfas",
    regnestykke: "Så räknas det",
    vaegt: "Vikt",
    intro:
      "Skriv hundens ålder och välj dess storlek. En hund åldras snabbast under de första två åren, och stora hundar åldras snabbare än små.",
    shareSummary: "Hundålder",
  },
} as const;

export default function HundealderBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: 1 });

  const [aar, setAar] = useState(3);
  const [maaneder, setMaaneder] = useState(0);
  const [storrelse, setStorrelse] = useState<HundeStorrelse>(HUNDE_STANDARD_STORRELSE);

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("hundealder");
    const timer = setTimeout(() => trackCalculation("hundealder"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const hundAar = aar + maaneder / 12;

  const svar = useMemo(() => {
    try {
      return hundealderSvar(hundAar, storrelse);
    } catch {
      // `hundealderSvar` kaster på en alder uden for grænsen. Værktøjet skal
      // vise «skriv et tal» og ikke en fejl fra modulet (punkt 8).
      return undefined;
    }
  }, [hundAar, storrelse]);

  const menneske = svar ? fmt(svar.menneskeAar) : "–";
  const info = HUNDE_STORRELSER[storrelse];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              {l.storrelse}
            </span>
            <div className="flex flex-wrap gap-2">
              {HUNDE_STORRELSE_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={storrelse === s}
                  onClick={() => setStorrelse(s)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    storrelse === s
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {HUNDE_STORRELSER[s][lang]}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {l.vaegt}: {info[lang === "da" ? "vaegtDa" : "vaegtSe"]}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hundealder-aar" className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                {l.aar}
              </label>
              <input
                id="hundealder-aar"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_HUNDE_AAR}
                step="1"
                value={aar}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAar(Number.isFinite(v) ? Math.max(0, Math.min(MAX_HUNDE_AAR, Math.floor(v))) : 0);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="hundealder-maaneder" className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                {l.maaneder}
              </label>
              <input
                id="hundealder-maaneder"
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                step="1"
                value={maaneder}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaaneder(Number.isFinite(v) ? Math.max(0, Math.min(11, Math.floor(v))) : 0);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.resultat}</p>
            <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Dog className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
              <span>
                {menneske} <span className="text-xl font-semibold">{l.aarEnhed}</span>
              </span>
            </p>
            {svar ? (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                {l.livsfase}: <span className="font-semibold">{LIVSFASE_NAVN[svar.livsfase][lang]}</span>
              </p>
            ) : null}
          </div>
          <div className="mt-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-200">{l.regnestykke}: </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {regnestykke(hundAar, storrelse)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton
          text={`${l.shareSummary}: ${menneske} ${l.aarEnhed}`}
        />
      </div>
    </div>
  );
}
