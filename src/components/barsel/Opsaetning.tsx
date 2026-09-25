"use client";

import { Plus, Trash2 } from "lucide-react";
import { KONSTELLATIONER, erAdoption, rolleFor } from "@/lib/barsel/regler";
import { saetNaertstaaende, skiftKonstellation } from "@/lib/barsel/skabeloner";
import { isIsoDate } from "@/lib/barsel/dato";
import type { Beskaeftigelse, BarselsPlan, Foraelder } from "@/lib/barsel/types";
import { PERSON_DOT } from "./farver";
import { Segment, TalFelt, inputKlasse, labelKlasse } from "./Felter";

interface Props {
  plan: BarselsPlan;
  opdater: (fn: (p: BarselsPlan) => BarselsPlan) => void;
}

const BESKAEFTIGELSER: { value: Beskaeftigelse; label: string }[] = [
  { value: "loenmodtager", label: "Lønmodtager" },
  { value: "selvstaendig", label: "Selvstændig" },
  { value: "ledig", label: "Ledig (a-kasse)" },
  { value: "studerende", label: "Studerende (SU)" },
];

const KONSTELLATION_BESKRIVELSE: Record<string, string> = {
  "mor-far": "24 uger hver + 4 før fødslen",
  "mor-medmor": "Medmor har samme ret som far",
  "to-foraeldre": "Surrogataftale: 6 + 18 uger hver",
  solo: "46 uger efter fødslen",
  "adoption-par": "Orlov før modtagelse + 24 uger hver",
  "adoption-solo": "46 uger efter modtagelsen",
};

export default function Opsaetning({ plan, opdater }: Props) {
  const adoption = erAdoption(plan.konstellation);

  const opdaterForaelder = (index: number, fn: (f: Foraelder) => Foraelder) =>
    opdater((p) => ({ ...p, foraeldre: p.foraeldre.map((f, i) => (i === index ? fn(f) : f)) }));

  return (
    <div className="space-y-6">
      <Segment
        label="Hvem skal holde barsel?"
        value={plan.konstellation}
        kolonner="grid-cols-2 lg:grid-cols-3"
        options={KONSTELLATIONER.map((k) => ({
          value: k.id,
          label: k.titel,
          beskrivelse: KONSTELLATION_BESKRIVELSE[k.id],
        }))}
        onChange={(k) => opdater((p) => skiftKonstellation(p, k))}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="barsel-datotype" className={labelKlasse}>
            {adoption ? "Modtagelse" : "Fødsel"}
          </label>
          <select
            id="barsel-datotype"
            className={inputKlasse}
            value={plan.datoType}
            onChange={(e) => opdater((p) => ({ ...p, datoType: e.target.value === "foedsel" ? "foedsel" : "termin" }))}
          >
            <option value="termin">{adoption ? "Forventet modtagelse" : "Terminsdato (ikke født endnu)"}</option>
            <option value="foedsel">{adoption ? "Barnet er modtaget" : "Barnet er født"}</option>
          </select>
        </div>
        <div>
          <label htmlFor="barsel-dato" className={labelKlasse}>
            {plan.datoType === "termin" ? (adoption ? "Forventet dato" : "Terminsdato") : adoption ? "Modtaget den" : "Født den"}
          </label>
          <input
            id="barsel-dato"
            type="date"
            className={inputKlasse}
            value={plan.dato}
            onChange={(e) => {
              if (isIsoDate(e.target.value)) {
                const dato = e.target.value;
                opdater((p) => ({ ...p, dato }));
              }
            }}
          />
        </div>
        <div>
          <label htmlFor="barsel-antal" className={labelKlasse}>
            Antal børn
          </label>
          <select
            id="barsel-antal"
            className={inputKlasse}
            value={plan.antalBoern}
            onChange={(e) =>
              opdater((p) => ({ ...p, antalBoern: Number(e.target.value) as BarselsPlan["antalBoern"] }))
            }
          >
            <option value={1}>1 barn</option>
            <option value={2}>Tvillinger</option>
            <option value={3}>Trillinger</option>
            <option value={4}>4 eller flere</option>
          </select>
        </div>
        <TalFelt
          label="Barnet indlagt (uger)"
          value={plan.indlaeggelsesUger}
          min={0}
          max={52}
          onChange={(v) => opdater((p) => ({ ...p, indlaeggelsesUger: Math.round(v) }))}
          hjaelp="Fx for tidligt født. Forlænger orloven."
        />
      </div>

      {(adoption || plan.konstellation === "solo") && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {adoption && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300"
                checked={plan.adoptionUdland}
                onChange={(e) => {
                  const on = e.target.checked;
                  opdater((p) => ({ ...p, adoptionUdland: on }));
                }}
              />
              Adoption fra udlandet (4 uger før modtagelsen i stedet for 1)
            </label>
          )}
          {plan.konstellation === "solo" && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-gray-300"
                checked={plan.naertstaaende}
                onChange={(e) => {
                  const on = e.target.checked;
                  opdater((p) => saetNaertstaaende(p, on));
                }}
              />
              Overdrag uger til en nærtstående (forælder eller søskende over 18 år)
            </label>
          )}
        </div>
      )}

      <div className={`grid gap-4 ${plan.foraeldre.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {plan.foraeldre.map((f, i) => (
          <ForaelderKort
            key={f.id}
            f={f}
            index={i}
            rolle={rolleFor(plan.konstellation, i)}
            opdater={(fn) => opdaterForaelder(i, fn)}
          />
        ))}
      </div>

      <details className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700">
        <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">Skat i beregningen</summary>
        <div className="mt-3 max-w-xs">
          <TalFelt
            label="Kommuneskat"
            value={plan.kommuneskatPct}
            min={20}
            max={30}
            step={0.01}
            suffix="%"
            onChange={(v) => opdater((p) => ({ ...p, kommuneskatPct: v }))}
            hjaelp="Gennemsnit 2026 er ca. 25 %. Kirkeskat er ikke medregnet."
          />
        </div>
      </details>
    </div>
  );
}

function ForaelderKort({
  f,
  index,
  rolle,
  opdater,
}: {
  f: Foraelder;
  index: number;
  rolle: ReturnType<typeof rolleFor>;
  opdater: (fn: (f: Foraelder) => Foraelder) => void;
}) {
  const idPrefix = `barsel-${f.id}`;
  const erLoenmodtager = f.beskaeftigelse === "loenmodtager";
  return (
    <fieldset className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-gray-900 dark:text-white">
        <span className={`inline-block h-3 w-3 rounded-full ${PERSON_DOT[index]}`} aria-hidden="true" />
        {rolle === "naertstaaende" ? "Nærtstående" : `Person ${index + 1}`}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-navn`} className={labelKlasse}>
            Navn eller rolle
          </label>
          <input
            id={`${idPrefix}-navn`}
            type="text"
            maxLength={40}
            className={inputKlasse}
            value={f.navn}
            onChange={(e) => {
              const navn = e.target.value;
              opdater((x) => ({ ...x, navn }));
            }}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-besk`} className={labelKlasse}>
            Beskæftigelse
          </label>
          <select
            id={`${idPrefix}-besk`}
            className={inputKlasse}
            value={f.beskaeftigelse}
            onChange={(e) => {
              const beskaeftigelse = e.target.value as Beskaeftigelse;
              opdater((x) => ({ ...x, beskaeftigelse }));
            }}
          >
            {BESKAEFTIGELSER.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {(f.beskaeftigelse === "loenmodtager" || f.beskaeftigelse === "selvstaendig") && (
          <TalFelt
            id={`${idPrefix}-loen`}
            label={erLoenmodtager ? "Månedsløn før skat" : "Overskud pr. måned"}
            value={f.maanedsloen}
            min={0}
            max={500000}
            step={500}
            suffix="kr."
            onChange={(v) => opdater((x) => ({ ...x, maanedsloen: v }))}
            hjaelp={erLoenmodtager ? undefined : "Fuld sats kræver ca. 22.035 kr. om måneden (264.420 kr. om året)."}
          />
        )}
        {erLoenmodtager && (
          <TalFelt
            id={`${idPrefix}-timer`}
            label="Timer pr. uge"
            value={f.ugentligeTimer}
            min={1}
            max={60}
            step={0.5}
            suffix="timer"
            onChange={(v) => opdater((x) => ({ ...x, ugentligeTimer: v }))}
          />
        )}
        {(f.beskaeftigelse === "ledig" || f.beskaeftigelse === "studerende") && (
          <TalFelt
            id={`${idPrefix}-ydelse`}
            label={f.beskaeftigelse === "ledig" ? "Dagpenge pr. måned" : "SU pr. måned"}
            value={f.ydelseMaaned}
            min={0}
            max={100000}
            step={100}
            suffix="kr."
            onChange={(v) => opdater((x) => ({ ...x, ydelseMaaned: v }))}
            hjaelp={
              f.beskaeftigelse === "ledig"
                ? "Barselsdagpenge svarer til din a-dagpengesats (højst 5.085 kr. om ugen)."
                : "Udeboende SU 2026: 7.426 kr. Forsørgertillæg kommer oveni."
            }
          />
        )}
      </div>

      {erLoenmodtager && (
        <div className="mt-4">
          <p className={labelKlasse}>Løn under barsel fra arbejdsgiveren</p>
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">
            Se din overenskomst eller kontrakt. Ugerne tæller dine orlovsuger i rækkefølge, fx 14 uger med 100 % løn.
          </p>
          <ul className="space-y-2">
            {f.loenUnderBarsel.map((s, si) => (
              <li key={si} className="flex items-end gap-2">
                <div className="w-24">
                  <TalFelt
                    id={`${idPrefix}-seg-${si}-uger`}
                    label="Uger"
                    value={s.uger}
                    min={0}
                    max={60}
                    onChange={(v) =>
                      opdater((x) => ({
                        ...x,
                        loenUnderBarsel: x.loenUnderBarsel.map((y, yi) => (yi === si ? { ...y, uger: Math.round(v) } : y)),
                      }))
                    }
                  />
                </div>
                <div className="w-28">
                  <TalFelt
                    id={`${idPrefix}-seg-${si}-pct`}
                    label="Af lønnen"
                    value={s.procent}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={(v) =>
                      opdater((x) => ({
                        ...x,
                        loenUnderBarsel: x.loenUnderBarsel.map((y, yi) => (yi === si ? { ...y, procent: Math.round(v) } : y)),
                      }))
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => opdater((x) => ({ ...x, loenUnderBarsel: x.loenUnderBarsel.filter((_, yi) => yi !== si) }))}
                  className="mb-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-label={`Fjern lønperiode ${si + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {f.loenUnderBarsel.length < 4 && (
            <button
              type="button"
              onClick={() =>
                opdater((x) => ({
                  ...x,
                  loenUnderBarsel: [...x.loenUnderBarsel, { uger: x.loenUnderBarsel.length === 0 ? (rolle === "foedende" ? 14 : 10) : 4, procent: 100 }],
                }))
              }
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tilføj uger med løn
            </button>
          )}
        </div>
      )}

      {erLoenmodtager && rolle !== "naertstaaende" && (
        <div className="mt-4 max-w-[12rem]">
          <TalFelt
            id={`${idPrefix}-udskudt`}
            label="Udskudte uger"
            value={f.udskudteUger}
            min={0}
            max={32}
            onChange={(v) => opdater((x) => ({ ...x, udskudteUger: Math.round(v) }))}
            hjaelp="Op til 5 uger kan gemmes til barnet er 9 år."
          />
        </div>
      )}
    </fieldset>
  );
}
