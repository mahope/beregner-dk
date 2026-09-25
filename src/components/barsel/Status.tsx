"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { Analyse, Besked, ForaelderAnalyse } from "@/lib/barsel/motor";
import { PERSON_DOT, tal } from "./farver";

function Maaler({ label, brugt, total, farve, forklaring }: { label: string; brugt: number; total: number; farve: string; forklaring?: string }) {
  const pct = total > 0 ? Math.min(100, (brugt / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-gray-700 dark:text-gray-200">{label}</span>
        <span className="font-semibold tabular-nums text-gray-900 dark:text-white">
          {tal(brugt, 1)} / {tal(total, 1)} uger
        </span>
      </div>
      <div
        className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.round(brugt * 10) / 10}
      >
        <div className={`h-full rounded-full ${farve}`} style={{ width: `${pct}%` }} />
      </div>
      {forklaring && <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{forklaring}</p>}
    </div>
  );
}

function ForaelderStatus({ a, index, antal }: { a: ForaelderAnalyse; index: number; antal: number }) {
  const r = a.rettigheder;
  if (r.rolle === "naertstaaende") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span className={`h-3 w-3 rounded-full ${PERSON_DOT[index]}`} aria-hidden="true" />
          {a.navn}
        </h4>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          Holder {tal(a.modtaget, 1)} overdragne uger med barselsdagpenge.
          {a.udenRet > 0 && ` ${tal(a.udenRet, 1)} uger kan ikke dækkes.`}
        </p>
      </div>
    );
  }
  const oe = a.forbrug.filter((b) => b.spand.oeremaerket);
  const oeTotal = oe.reduce((s, b) => s + b.spand.uger, 0);
  const oeBrugt = oe.reduce((s, b) => s + b.brugt, 0);
  const egne = a.forbrug.filter((b) => !b.spand.oeremaerket && b.spand.id !== "foer");
  const egneTotal = egne.reduce((s, b) => s + b.spand.uger, 0);
  const egneBrugt = egne.reduce((s, b) => s + b.brugt + b.afgivet + b.udskudt, 0);
  const foer = a.forbrug.find((b) => b.spand.id === "foer");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h4 className="mb-1 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
        <span className={`h-3 w-3 rounded-full ${PERSON_DOT[index]}`} aria-hidden="true" />
        {a.navn}
      </h4>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        {tal(a.brugtFoer + a.brugtEfter, 1)} uger med barselsdagpenge planlagt
        {r.efterUger > 0 && ` af ${r.foerUger + r.efterUger} egne`}
        {a.modtaget > 0 && `, heraf ${tal(a.modtaget, 1)} overført`}.
      </p>
      <div className="space-y-3">
        {foer && (
          <Maaler
            label={foer.spand.label}
            brugt={foer.brugt}
            total={foer.spand.uger}
            farve="bg-violet-500"
          />
        )}
        <Maaler
          label="Øremærkede uger"
          brugt={oeBrugt}
          total={oeTotal}
          farve="bg-amber-500"
          forklaring="Kan ikke overdrages. Går tabt, hvis de ikke holdes."
        />
        {egneTotal > 0 && (
          <Maaler
            label={antal > 1 ? "Egne delbare uger (brugt, overført eller udskudt)" : "Øvrige uger"}
            brugt={egneBrugt}
            total={egneTotal}
            farve="bg-sky-500"
            forklaring={
              a.afgivet > 0 || a.udskudt > 0
                ? [a.afgivet > 0 ? `${tal(a.afgivet, 1)} overført til den anden` : "", a.udskudt > 0 ? `${tal(a.udskudt, 1)} udskudt` : ""]
                    .filter(Boolean)
                    .join(", ")
                : undefined
            }
          />
        )}
        {a.udenRet > 0 && (
          <p className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-200">
            {tal(a.udenRet, 1)} uger uden barselsdagpenge
          </p>
        )}
      </div>
    </div>
  );
}

const IKON = {
  fejl: CircleAlert,
  advarsel: TriangleAlert,
  info: Info,
} as const;

const STIL = {
  fejl: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100",
  advarsel: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100",
  info: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
} as const;

export function BeskedListe({ beskeder }: { beskeder: Besked[] }) {
  const alvorlige = beskeder.filter((b) => b.niveau !== "info");
  return (
    <div>
      {alvorlige.length === 0 && (
        <p className="mb-2 flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100">
          <CircleCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          Planen overholder reglerne. Ingen uger går tabt ved en fejl.
        </p>
      )}
      <ul className="space-y-2">
        {beskeder.map((b) => {
          const Ikon = IKON[b.niveau];
          return (
            <li key={b.id} className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${STIL[b.niveau]}`}>
              <Ikon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">
                  <span className="sr-only">{b.niveau === "fejl" ? "Fejl: " : b.niveau === "advarsel" ? "Advarsel: " : "Bemærk: "}</span>
                  {b.titel}
                </p>
                <p className="mt-0.5 opacity-90">{b.tekst}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Status({ analyse }: { analyse: Analyse }) {
  const hjemme = new Set<number>();
  for (const a of analyse.foraeldre) for (const u of a.uger.values()) if (u.uge >= 0 && u.andel > 0) hjemme.add(u.uge);
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${analyse.foraeldre.length > 1 ? "md:grid-cols-2" : ""}`}>
        {analyse.foraeldre.map((a, i) => (
          <ForaelderStatus key={a.id} a={a} index={i} antal={analyse.foraeldre.length} />
        ))}
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-200">
        Barnet har en forælder hjemme på orlov i <strong>{hjemme.size} uger</strong> efter fødslen
        {analyse.faellesUger > 0 && (
          <>
            {" "}
            – heraf er I hjemme sammen i <strong>{tal(analyse.faellesUger, 1)} uger</strong>
          </>
        )}
        .
      </p>
      <BeskedListe beskeder={analyse.beskeder} />
    </div>
  );
}
