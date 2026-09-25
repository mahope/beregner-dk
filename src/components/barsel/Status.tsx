"use client";

import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { Analyse, Besked, ForaelderAnalyse } from "@/lib/barsel/motor";
import { PERSON_DOT, tal, ugeFarve } from "./farver";
import InfoTip, { type Begreb } from "./InfoTip";

function Maaler({
  label,
  brugt,
  total,
  farve,
  forklaring,
  info,
}: {
  label: string;
  brugt: number;
  total: number;
  farve: string;
  forklaring?: string;
  info?: Begreb;
}) {
  const pct = total > 0 ? Math.min(100, (brugt / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-0.5 text-gray-700 dark:text-gray-200">
          {label}
          {info && <InfoTip begreb={info} className="-my-1" />}
        </span>
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
      <div>
        <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
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
    <div>
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
            farve={ugeFarve("graviditet", index)}
            info="graviditetsorlov"
          />
        )}
        <Maaler
          label="Øremærkede uger"
          brugt={oeBrugt}
          total={oeTotal}
          farve={ugeFarve("oeremaerket", index)}
          info="oeremaerket"
        />
        {egneTotal > 0 && (
          <Maaler
            label={antal > 1 ? "Delbare uger" : "Øvrige uger"}
            info={antal > 1 ? "delbar" : undefined}
            brugt={egneBrugt}
            total={egneTotal}
            farve={ugeFarve("egen", index)}
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

/**
 * One combined field: a headline that says whether the plan follows the rules,
 * the things to fix (if any), and the "good to know" notes underneath.
 */
export function BeskedListe({ beskeder }: { beskeder: Besked[] }) {
  const fejl = beskeder.filter((b) => b.niveau === "fejl");
  const advarsler = beskeder.filter((b) => b.niveau === "advarsel");
  const info = beskeder.filter((b) => b.niveau === "info");
  const alvorlige = [...fejl, ...advarsler];
  const n = alvorlige.length;
  const Ikon = fejl.length > 0 ? CircleAlert : n > 0 ? TriangleAlert : CircleCheck;
  const stil =
    fejl.length > 0
      ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
      : n > 0
        ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
        : "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30";
  const ikonFarve = fejl.length > 0 ? "text-red-700 dark:text-red-300" : n > 0 ? "text-amber-700 dark:text-amber-300" : "text-green-700 dark:text-green-300";
  const overskrift = fejl.length > 0 ? `${n} ting skal rettes` : n > 0 ? `${n} ting at være opmærksom på` : "Planen følger reglerne";

  return (
    <div className={`rounded-lg border p-4 text-gray-900 dark:text-gray-100 ${stil}`}>
      <p className="flex items-center gap-2 font-semibold">
        <Ikon className={`h-5 w-5 shrink-0 ${ikonFarve}`} aria-hidden="true" />
        {overskrift}
      </p>
      {n === 0 && <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">Ingen uger går tabt ved en fejl.</p>}
      {n > 0 && (
        <ul className="mt-3 space-y-3">
          {alvorlige.map((b) => {
            const BIkon = b.niveau === "fejl" ? CircleAlert : TriangleAlert;
            return (
              <li key={b.id} className="flex gap-2 text-sm">
                <BIkon className={`mt-0.5 h-4 w-4 shrink-0 ${b.niveau === "fejl" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`} aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    <span className="sr-only">{b.niveau === "fejl" ? "Skal rettes: " : "Vær opmærksom: "}</span>
                    {b.titel}
                  </p>
                  <p className="mt-0.5 text-gray-800 dark:text-gray-200">{b.tekst}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {info.length > 0 && (
        <div className="mt-3 border-t border-black/10 pt-3 dark:border-white/15">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Info className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-300" aria-hidden="true" />
            Godt at vide
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-sm text-gray-800 dark:text-gray-200">
            {info.map((b) => (
              <li key={b.id}>
                <span className="font-medium">{b.titel}.</span> {b.tekst}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Status({ analyse }: { analyse: Analyse }) {
  const hjemme = new Set<number>();
  for (const a of analyse.foraeldre) for (const u of a.uger.values()) if (u.uge >= 0 && u.andel > 0) hjemme.add(u.uge);
  return (
    <div className="space-y-4">
      <BeskedListe beskeder={analyse.beskeder} />
      <div className={`grid gap-x-8 gap-y-5 ${analyse.foraeldre.length > 1 ? "md:grid-cols-2" : ""}`}>
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
    </div>
  );
}
