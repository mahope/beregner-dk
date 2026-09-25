"use client";

import { formatDato, monthKey, monthLabel, weekStart } from "@/lib/barsel/dato";
import type { Analyse } from "@/lib/barsel/motor";
import { erAdoption } from "@/lib/barsel/regler";
import type { BarselsPlan, Kategori } from "@/lib/barsel/types";
import { FORKLARING, KATEGORI_TEKST, PERSON_DOT, tal, ugeFarve, type ForklaringId } from "./farver";
import InfoTip, { type Begreb } from "./InfoTip";

const FORKLARING_INFO: Partial<Record<ForklaringId, Begreb>> = {
  "kun-dig": "oeremaerket",
  delbar: "delbar",
  overfoert: "overfoert",
};

/** Week range shown in the timeline (same as the printed "Uge for uge"). */
export function tidslinjeUger(analyse: Analyse): number[] {
  const fra = Math.min(-4, analyse.foersteUge);
  const til = Math.max(analyse.sidsteUge, 53);
  return Array.from({ length: til - fra }, (_, i) => fra + i);
}

function cellTitel(w: number, dato: string, kat: Kategori, andel: number): string {
  const uge = w < 0 ? `${-w} uger før` : `uge ${w + 1}`;
  const status = kat === "arbejde" ? "arbejde" : `${KATEGORI_TEKST[kat].toLowerCase()}${andel > 0 && andel < 1 ? ` (${Math.round(andel * 100)} % orlov)` : ""}`;
  return `${stor(uge)}, ${formatDato(dato)}: ${status}`;
}

const stor = (s: string) => s[0].toUpperCase() + s.slice(1);

/**
 * The primary overview: one horizontal bar per parent, one cell per week.
 * Read-only; editing happens in the month grid and the period list.
 */
export default function Tidslinje({ plan, analyse }: { plan: BarselsPlan; analyse: Analyse }) {
  const uger = tidslinjeUger(analyse);
  const n = uger.length;
  const pos = (w: number) => ((w - uger[0]) / n) * 100;
  const adoption = erAdoption(plan.konstellation);
  const nulTekst = adoption ? (plan.datoType === "termin" ? "Forventet modtagelse" : "Modtagelse") : plan.datoType === "termin" ? "Termin" : "Fødsel";

  // Month ticks: first week of every third month, counted from the first full month.
  const maaneder: { w: number; label: string }[] = [];
  let forrige = "";
  let taeller = 0;
  for (const w of uger) {
    const key = monthKey(weekStart(plan.dato, w));
    if (key !== forrige) {
      const sidste = maaneder[maaneder.length - 1];
      // Skip a tick that would collide with the previous one on narrow screens.
      if (forrige && taeller % 3 === 0 && pos(w) <= 88 && (!sidste || pos(w) - pos(sidste.w) >= 20)) maaneder.push({ w, label: stor(monthLabel(key, true)) });
      if (forrige) taeller++;
      forrige = key;
    }
  }

  return (
    <figure className="m-0">
      <div className="relative [--navn-b:0px] sm:[--navn-b:6.5rem]">
        {/* Birth and first birthday markers */}
        <div className="relative mb-1 h-5 text-xs font-medium text-gray-700 dark:text-gray-200" aria-hidden="true">
          {[
            { w: 0, t: `${nulTekst} ${formatDato(plan.dato).replace(/ \d{4}$/, "")}` },
            { w: 52, t: "1 år" },
          ]
            .filter((m) => m.w >= uger[0] && m.w < uger[0] + n)
            .map((m) => (
              <span
                key={m.w}
                className={`absolute top-0 whitespace-nowrap ${pos(m.w) > 80 ? "-translate-x-full pr-1" : "pl-1"}`}
                style={{ left: `calc(var(--navn-b) + (100% - var(--navn-b)) * ${pos(m.w) / 100})` }}
              >
                {m.t}
              </span>
            ))}
        </div>

        <div className="space-y-2">
          {analyse.foraeldre.map((a, pi) => (
            <div key={a.id} className="sm:flex sm:items-center">
              <div className="mb-1 flex items-baseline gap-2 text-sm sm:mb-0 sm:w-[6.5rem] sm:shrink-0 sm:flex-col sm:items-start sm:gap-0 sm:pr-2">
                <span className="flex min-w-0 items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${PERSON_DOT[pi]}`} aria-hidden="true" />
                  <span className="truncate">{a.navn}</span>
                </span>
                <span className="text-xs tabular-nums text-gray-600 dark:text-gray-300">{tal(a.brugtFoer + a.brugtEfter, 1)} uger</span>
              </div>
              <div className="relative flex h-8 flex-1 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700/60" aria-hidden="true">
                {uger.map((w) => {
                  const u = a.uger.get(w);
                  const kat: Kategori = u ? u.kategori : "arbejde";
                  const fyld = u?.celle?.type === "deltid" ? Math.round(u.andel * 100) : 100;
                  return (
                    <span key={w} className="relative h-full flex-1" title={cellTitel(w, weekStart(plan.dato, w), kat, u?.andel ?? 0)}>
                      {kat !== "arbejde" && <span className={`absolute inset-x-0 bottom-0 ${ugeFarve(kat, pi)}`} style={{ height: `${fyld}%` }} />}
                    </span>
                  );
                })}
                {/* Birth and 1-year lines */}
                <span className="absolute inset-y-0 w-0.5 bg-gray-900 dark:bg-white" style={{ left: `${pos(0)}%` }} />
                {52 < uger[0] + n && <span className="absolute inset-y-0 border-l border-dashed border-gray-600 dark:border-gray-300" style={{ left: `${pos(52)}%` }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Month axis */}
        <div className="relative mt-1 h-4 text-[11px] text-gray-600 dark:text-gray-400" aria-hidden="true">
          {maaneder.map((m) => (
            <span
              key={m.w}
              className="absolute top-0 whitespace-nowrap"
              style={{ left: `calc(var(--navn-b) + (100% - var(--navn-b)) * ${pos(m.w) / 100})` }}
            >
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <figcaption className="mt-3">
        <span className="sr-only">
          Tidslinje uge for uge. Samme planer står som tekst i listen over perioder og datoer længere nede.
        </span>
        <Forklaring medInfo />
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">Hver forælder har sin egen farve. Den lodrette streg er {nulTekst.toLowerCase()}.</p>
      </figcaption>
    </figure>
  );
}

/** The legend (max five entries). The info buttons are only shown once, next to the timeline. */
export function Forklaring({ medInfo = false }: { medInfo?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-700 dark:text-gray-300" aria-label="Forklaring til farverne">
      {FORKLARING.map((f) => (
        <li key={f.id} className="inline-flex items-center gap-1.5">
          <span className={`inline-block h-3 w-4 rounded-sm ${f.swatch}`} aria-hidden="true" />
          {f.tekst}
          {medInfo && FORKLARING_INFO[f.id] && <InfoTip begreb={FORKLARING_INFO[f.id]!} className="-my-1 -ml-0.5" />}
        </li>
      ))}
    </ul>
  );
}
