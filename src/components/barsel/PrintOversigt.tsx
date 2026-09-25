"use client";

import { formatDato, monthLabel } from "@/lib/barsel/dato";
import { blokBeskrivelse, blokke, type Analyse } from "@/lib/barsel/motor";
import type { Oekonomi } from "@/lib/barsel/oekonomi";
import { KONSTELLATIONER, erAdoption } from "@/lib/barsel/regler";
import type { BarselsPlan, Kategori } from "@/lib/barsel/types";
import { KATEGORI_BG, KATEGORI_TEKST, LEGEND, kr, tal } from "./farver";
import { ugeLabel } from "./Kalender";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  oekonomi: Oekonomi;
  idag: string;
}

export default function PrintOversigt({ plan, analyse, oekonomi, idag }: Props) {
  const adoption = erAdoption(plan.konstellation);
  const titel = KONSTELLATIONER.find((k) => k.id === plan.konstellation)?.titel ?? "";
  const fra = Math.min(-4, analyse.foersteUge);
  const til = Math.max(analyse.sidsteUge, 53);
  const uger = Array.from({ length: til - fra }, (_, i) => fra + i);

  return (
    <div className="barsel-print hidden print:block">
      <header className="mb-3 flex items-end justify-between border-b-2 border-gray-900 pb-2">
        <div>
          <h2 className="text-2xl font-bold">Barselsplan</h2>
          <p className="text-sm">
            {titel}
            {plan.antalBoern > 1 ? ` · ${plan.antalBoern === 2 ? "tvillinger" : "flerlinger"}` : ""} ·{" "}
            {adoption ? (plan.datoType === "termin" ? "Forventet modtagelse" : "Modtaget") : plan.datoType === "termin" ? "Termin" : "Født"}{" "}
            {formatDato(plan.dato)}
          </p>
        </div>
        <p className="text-right text-xs">
          MinBeregner.dk/barselsplanlaegger
          <br />
          Udskrevet {formatDato(idag)}
        </p>
      </header>

      <section className="mb-3 break-inside-avoid">
        <h3 className="mb-1 text-sm font-bold">Uge for uge</h3>
        <table className="w-full border-collapse text-[8px]">
          <thead>
            <tr>
              <th className="w-16 text-left font-normal">Uge</th>
              {uger.map((w) => (
                <th key={w} className={`p-0 text-center font-normal ${w === 0 ? "font-bold" : ""}`}>
                  {w % 4 === 0 || w === -4 ? ugeLabel(w) : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analyse.foraeldre.map((a) => (
              <tr key={a.id}>
                <th className="truncate pr-1 text-left text-[9px] font-semibold">{a.navn}</th>
                {uger.map((w) => {
                  const k: Kategori = a.uger.get(w)?.kategori ?? "arbejde";
                  return (
                    <td key={w} className={`h-4 border border-white p-0 ${KATEGORI_BG[k]} ${w === 0 ? "border-l-2 border-l-gray-900" : ""}`} />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-1 flex flex-wrap gap-x-3 text-[9px]">
          {LEGEND.map((k) => (
            <li key={k} className="inline-flex items-center gap-1">
              <span className={`inline-block h-2.5 w-2.5 border border-gray-400 ${KATEGORI_BG[k]}`} />
              {KATEGORI_TEKST[k]}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-3 grid grid-cols-2 gap-4">
        {analyse.foraeldre.map((a) => (
          <div key={a.id} className="break-inside-avoid">
            <h3 className="mb-1 text-sm font-bold">{a.navn}</h3>
            <table className="w-full border-collapse text-[10px]">
              <tbody>
                {blokke(plan, a).map((b) => (
                  <tr key={`${b.start}-${b.type}`} className="border-b border-gray-300">
                    <td className="py-0.5 pr-2 align-top tabular-nums whitespace-nowrap">
                      {formatDato(b.fra)} – {formatDato(b.til)}
                    </td>
                    <td className="py-0.5 align-top">{blokBeskrivelse(b, adoption)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-1 text-[10px]">
              Uger med barselsdagpenge: {tal(a.brugtFoer + a.brugtEfter, 1)}
              {a.modtaget > 0 ? ` (heraf ${tal(a.modtaget, 1)} overført)` : ""}
              {a.udskudt > 0 ? ` · udskudt: ${tal(a.udskudt, 1)}` : ""}
              {a.tabteOeremaerkede > 0 ? ` · øremærkede uger der går tabt: ${tal(a.tabteOeremaerkede, 1)}` : ""}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-3 break-inside-avoid">
        <h3 className="mb-1 text-sm font-bold">Økonomi pr. måned (efter skat, vejledende)</h3>
        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="border-b border-gray-900 text-left">
              <th className="py-0.5">Måned</th>
              {analyse.foraeldre.map((a) => (
                <th key={a.id} className="py-0.5 text-right">
                  {a.navn}
                </th>
              ))}
              <th className="py-0.5 text-right">Husstand</th>
              <th className="py-0.5 text-right">Normalt</th>
              <th className="py-0.5 text-right">Forskel</th>
            </tr>
          </thead>
          <tbody>
            {oekonomi.husstand.map((h, mi) => (
              <tr key={h.maaned} className="border-b border-gray-200">
                <td className="py-0.5 capitalize">{monthLabel(h.maaned)}</td>
                {oekonomi.foraeldre.map((f) => (
                  <td key={f.id} className="py-0.5 text-right tabular-nums">
                    {kr(f.maaneder[mi].netto)}
                  </td>
                ))}
                <td className="py-0.5 text-right font-semibold tabular-nums">{kr(h.netto)}</td>
                <td className="py-0.5 text-right tabular-nums">{kr(h.normalNetto)}</td>
                <td className="py-0.5 text-right tabular-nums">{Math.abs(h.netto - h.normalNetto) < 1 ? "–" : kr(h.netto - h.normalNetto)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-gray-900 font-bold">
              <td className="py-0.5">I alt</td>
              {oekonomi.foraeldre.map((f) => (
                <td key={f.id} className="py-0.5 text-right tabular-nums">
                  {kr(f.nettoIAlt)}
                </td>
              ))}
              <td className="py-0.5 text-right tabular-nums">{kr(oekonomi.husstand.reduce((s, h) => s + h.netto, 0))}</td>
              <td className="py-0.5 text-right tabular-nums">{kr(oekonomi.husstand.reduce((s, h) => s + h.normalNetto, 0))}</td>
              <td className="py-0.5 text-right tabular-nums">{kr(-oekonomi.tabNetto)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {analyse.varsler.length > 0 && (
        <section className="mb-3 break-inside-avoid">
          <h3 className="mb-1 text-sm font-bold">Frister</h3>
          <ul className="text-[10px]">
            {analyse.varsler.map((v) => (
              <li key={`${v.foraelder}-${v.titel}`}>
                <strong>{formatDato(v.dato)}</strong> – {analyse.foraeldre.find((a) => a.id === v.foraelder)?.navn}: {v.titel}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="border-t border-gray-400 pt-1 text-[9px]">
        Vejledende plan efter barselsloven (LBK nr. 206 af 22/01/2026) og satser for 2026. Tjek altid med borger.dk, Udbetaling Danmark og din arbejdsgiver.
      </p>
    </div>
  );
}
