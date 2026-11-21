"use client";

import { useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { trackCalculation } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  PROCENTPOINT_START,
  procentpointForskel,
  procentpointRelativ,
} from "@/lib/procentpoint";

const labels = {
  da: {
    gammelLabel: "Første procenttal",
    nyLabel: "Andet procenttal",
    gammelHint: "Procenttalet før ændringen",
    nyHint: "Procenttalet efter ændringen",
    resultat: "Procentpoint",
    relativt: "Det svarer til",
    stigning: "stigning",
    fald: "fald",
    uændret: "uændret",
    tomTekst:
      "Skriv to procenttal og tryk på «Regn ud», så får du forskellen i procentpoint — og hvor stor den ændring er i procent.",
    nulBeskyldigelse:
      "Et gammelt procenttal på 0 kan ikke være heltalet, så den procentvise ændring kan ikke regnes. Procentpoint kan stadig.",
    advarsel:
      "Procentpoint og procent er ikke det samme. Ét procentpoint kan være 5 % eller 50 %, alt efter hvilket tal du startede fra.",
    formelPoint: "Procentpoint = nyt procenttal − gammelt procenttal",
    formelRelativ:
      "Procentvis ændring = ((nyt − gammelt) ÷ gammelt) × 100",
    deltTekst: (a: string, b: string, point: string, procent: string) =>
      `Procentpoint: ${a} → ${b} er ${point} procentpoint, svarende til ${procent} %`,
    knap: "Regn ud",
  },
  se: {
    gammelLabel: "Första procenttalet",
    nyLabel: "Andra procenttalet",
    gammelHint: "Procenttalet före ändringen",
    nyHint: "Procenttalet efter ändringen",
    resultat: "Procentenheter",
    relativt: "Det motsvarar",
    stigning: "ökning",
    fald: "minskning",
    uændret: "oförändrat",
    tomTekst:
      "Skriv två procenttal och tryck på «Räkna ut», så får du skillnaden i procentenheter — och hur stor förändringen är i procent.",
    nulBeskyldigelse:
      "Ett gammalt procenttal på 0 kan inte vara heltalet, så den procentuella förändringen går inte att räkna ut. Procentenheterna kan fortfarande.",
    advarsel:
      "Procentenheter och procent är inte samma sak. En procentenhet kan vara 5 % eller 50 %, beroende på vilket tal du startade från.",
    formelPoint: "Procentenheter = nytt procenttal − gammalt procenttal",
    formelRelativ:
      "Procentuell förändring = ((nytt − gammalt) ÷ gammalt) × 100",
    deltTekst: (a: string, b: string, point: string, procent: string) =>
      `Procentenheter: ${a} → ${b} är ${point} procentenheter, vilket motsvarar ${procent} %`,
    knap: "Räkna ut",
  },
};

export default function ProcentpointBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [gammel, setGammel] = useState(PROCENTPOINT_START.gammel);
  const [ny, setNy] = useState(PROCENTPOINT_START.ny);
  const [regnet, setRegnet] = useState(false);

  const harSvar = regnet && Number.isFinite(gammel) && Number.isFinite(ny);
  const nulGrundlag = harSvar && gammel === 0;

  const point = harSvar ? procentpointForskel(gammel, ny) : 0;
  const relativ = harSvar ? procentpointRelativ(gammel, ny) : 0;

  const gammelTekst = `${formatNumber(gammel, locale, { maximumFractionDigits: 1 })} %`;
  const nyTekst = `${formatNumber(ny, locale, { maximumFractionDigits: 1 })} %`;
  const pointTekst = formatNumber(point, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const relativTekst = formatNumber(relativ, locale, {
    maximumFractionDigits: 1,
  });
  const retning =
    point > 0 ? l.stigning : point < 0 ? l.fald : l.uændret;


  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <ProcentFelt
            id="procentpoint-gammel"
            label={l.gammelLabel}
            hint={l.gammelHint}
            value={gammel}
            onChange={(v) => {
              setGammel(v);
              setRegnet(false);
            }}
          />
          <ProcentFelt
            id="procentpoint-ny"
            label={l.nyLabel}
            hint={l.nyHint}
            value={ny}
            onChange={(v) => {
              setNy(v);
              setRegnet(false);
            }}
          />

          <div className="flex justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setRegnet(true);
                trackCalculation("procentpoint");
              }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {l.knap}
            </button>
            <ResetButton
              onReset={() => {
                setGammel(PROCENTPOINT_START.gammel);
                setNy(PROCENTPOINT_START.ny);
                setRegnet(false);
              }}
            />
          </div>
        </div>

        {/* aria-live sidder på beholderen og ikke på den betingede indhold, så
            den er i DOM'en FØR læseren trykker. En boks der først opstår
            samtidig med ændringen, giver skærmlæseren intet at læse den i. */}
        <div
          className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 self-start"
          aria-live="polite"
        >
          {harSvar ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {l.resultat}
                </div>
                <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {pointTekst}
                </div>
                <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {retning}
                </div>
              </div>

              {nulGrundlag ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {l.nulBeskyldigelse}
                </p>
              ) : (
                <div className="rounded-lg bg-white dark:bg-gray-800 p-4 text-center">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {l.relativt}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {`${formatNumber(relativ, locale, {
                      maximumFractionDigits: 1,
                    })} %`}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-1">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {l.formelPoint}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {l.formelRelativ}
                </p>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {l.advarsel}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              {l.tomTekst}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <CopyResultButton
          text={
            harSvar && !nulGrundlag
              ? l.deltTekst(gammelTekst, nyTekst, pointTekst, relativTekst)
              : ""
          }
        />
      </div>
    </div>
  );
}

function ProcentFelt({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs text-gray-600 dark:text-gray-400 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-describedby={`${id}-help`}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">
          %
        </span>
      </div>
      <p id={`${id}-help`} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {hint}
      </p>
    </div>
  );
}
