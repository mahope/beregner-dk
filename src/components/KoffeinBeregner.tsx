"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Coffee, Plus, Trash2 } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  KOFFEIN_GRAENSER,
  KOFFEIN_KILDER,
  KOFFEIN_KILDE_MAP,
  koffeinBeregning,
  type KoffeinKildeId,
  type KoffeinProfil,
} from "@/lib/koffein";
import { formatNumber } from "@/lib/format";

const labels = {
  da: {
    calcName: "Koffeinberegner",
    tilfoej: "Tilføj drik eller mad",
    kilde: "Drik eller mad",
    gram: "Mængde (g eller ml)",
    portion: "Typisk portion",
    koffeinIportion: "Koffein i portion",
    total: "Total koffein",
    graense: "Daglig grænse",
    profil: "Din profil",
    voksen: "Voksen",
    gravid: "Gravid eller ammende",
    barn: "Barn eller unge",
    vaegt: "Vægt (kg)",
    overGrænse: "Over grænsen",
    underGrænse: "Inden for grænsen",
    overEnkelt: "En enkeltdosis overstiger grænsen",
    intro: "Vælg hvad du har drukket eller spist, og se hvor meget koffein du har fået. Sammenlign med EFSA's anbefalede grænser.",
    shareSummary: "Koffeinindtag",
    koffein: "koffein",
    mg: "mg",
    kilder: "Kilder",
    kildeNavn: "Navn",
    kildeMg: "mg/100 g",
    kildePortion: "Portion",
    kildePortionMg: "mg",
    fjern: "Fjern",
  },
  se: {
    calcName: "Koffeinkalkylator",
    tilfoej: "Lägg till dryck eller mat",
    kilde: "Dryck eller mat",
    gram: "Mängd (g eller ml)",
    portion: "Typisk portion",
    koffeinIportion: "Koffein i portion",
    total: "Totalt koffein",
    graense: "Daglig gräns",
    profil: "Din profil",
    voksen: "Vuxen",
    gravid: "Gravid eller ammande",
    barn: "Barn eller ung",
    vaegt: "Vikt (kg)",
    overGrænse: "Över gränsen",
    underGrænse: "Inom gränsen",
    overEnkelt: "En endos överstiger gränsen",
    intro: "Välj vad du har druckit eller ätit och se hur mycket koffein du har fått. Jämföra med EFSA:s rekommenderade gränser.",
    shareSummary: "Koffeintag",
    koffein: "koffein",
    mg: "mg",
    kilder: "Källor",
    kildeNavn: "Namn",
    kildeMg: "mg/100 g",
    kildePortion: "Portion",
    kildePortionMg: "mg",
    fjern: "Ta bort",
  },
} as const;

interface KoffeinItem {
  kilde: KoffeinKildeId;
  gram: number;
}

export default function KoffeinBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [items, setItems] = useState<KoffeinItem[]>([{ kilde: "filterkaffe", gram: 200 }]);
  const [profil, setProfil] = useState<KoffeinProfil>("voksen");
  const [vaegt, setVaegt] = useState(30);

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("koffein");
    const timer = setTimeout(() => trackCalculation("koffein"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const svar = useMemo(() => {
    try {
      return koffeinBeregning(items, profil, profil === "barn" ? vaegt : undefined);
    } catch {
      return undefined;
    }
  }, [items, profil, vaegt]);

  const dec = (v: number) => formatNumber(v, locale, { maximumFractionDigits: 0 });

  const tilfoejItem = () => {
    setItems([...items, { kilde: "filterkaffe", gram: 200 }]);
  };

  const fjernItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const opdaterItem = (index: number, felt: keyof KoffeinItem, value: string | number) => {
    setItems(
      items.map((item, i) => {
        if (i !== index) return item;
        if (felt === "kilde") return { ...item, kilde: value as KoffeinKildeId };
        return { ...item, gram: Number(value) || 0 };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="koffein-profil" className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
              {l.profil}
            </label>
            <select
              id="koffein-profil"
              value={profil}
              onChange={(e) => setProfil(e.target.value as KoffeinProfil)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="voksen">{l.voksen}</option>
              <option value="gravid">{l.gravid}</option>
              <option value="barn">{l.barn}</option>
            </select>
          </div>

          {profil === "barn" && (
            <div>
              <label htmlFor="koffein-vaegt" className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                {l.vaegt}
              </label>
              <input
                id="koffein-vaegt"
                type="number"
                inputMode="numeric"
                min={5}
                max={100}
                step="1"
                value={vaegt}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVaegt(Number.isFinite(v) ? Math.max(5, Math.min(100, Math.round(v))) : 30);
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, index) => {
              const kilde = KOFFEIN_KILDE_MAP[item.kilde];
              return (
                <div key={index} className="flex items-end gap-2">
                  <div className="flex-1">
                    <label htmlFor={`koffein-kilde-${index}`} className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      {l.kilde}
                    </label>
                    <select
                      id={`koffein-kilde-${index}`}
                      value={item.kilde}
                      onChange={(e) => opdaterItem(index, "kilde", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      {KOFFEIN_KILDER.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <label htmlFor={`koffein-gram-${index}`} className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                      {l.gram}
                    </label>
                    <input
                      id={`koffein-gram-${index}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={2000}
                      step={10}
                      value={item.gram}
                      onChange={(e) => opdaterItem(index, "gram", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fjernItem(index)}
                    className="rounded-lg border border-gray-300 p-2.5 text-gray-500 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label={l.fjern}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={tilfoejItem}
            className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            {l.tilfoej}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
        </div>

        <div className="rounded-xl bg-amber-50 p-6 dark:bg-amber-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.total}</p>
            <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Coffee className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" focusable="false" />
              <span>
                {svar ? dec(svar.totalMg) : "–"} <span className="text-xl font-semibold">{l.mg}</span>
              </span>
            </p>
            {svar && (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                {svar.graense[lang]} · {l.graense}: {dec(svar.graense.dagligMg)} {l.mg}
              </p>
            )}
          </div>

          {svar && (
            <div className="mt-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">
                  {svar.overGraense ? l.overGrænse : l.underGrænse}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {dec(svar.pctAfGraense)} %
                </p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${svar.overGraense ? "bg-red-500" : "bg-green-500"}`}
                  style={{ width: `${Math.min(100, svar.pctAfGraense)}%` }}
                />
              </div>
              {svar.overEnkelt && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{l.overEnkelt}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${l.shareSummary}: ${svar ? dec(svar.totalMg) : "–"} ${l.mg}`} />
      </div>
    </div>
  );
}
