"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InputField } from "@/components/InputField";
import { useLocale } from "@/components/LocaleProvider";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { trackCalculation } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  type Laanetype,
  type LaaneState,
  aarsOversigt,
  beregnLaaneplan,
  fraQuery,
  restgaeldPrAar,
  sammenlign,
  tilQuery,
  validerInput,
} from "@/lib/laaneplan";

export type LaaneplanVariant = "annuitet" | "forbrugslaan";

/** Startværdier pr. side: et boliglignende annuitetslån og et typisk forbrugslån. */
export const STANDARD_STATE: Record<LaaneplanVariant, LaaneState> = {
  annuitet: { hovedstol: 1_000_000, aarsrente: 5, loebetidAar: 30, stiftelsesgebyr: 0, maanedsgebyr: 0, type: "annuitet" },
  forbrugslaan: { hovedstol: 100_000, aarsrente: 9, loebetidAar: 5, stiftelsesgebyr: 1_500, maanedsgebyr: 0, type: "annuitet" },
};

const kr = (n: number) => `${formatNumber(n, "da", { maximumFractionDigits: 0 })} kr.`;
const kr2 = (n: number) => `${formatNumber(n, "da", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr.`;
const pct = (n: number) => `${formatNumber(n, "da", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

const TYPE_NAVN: Record<Laanetype, string> = { annuitet: "Annuitetslån", serielaan: "Serielån" };

function Graf({ hovedstol, annuitet, serielaan }: {
  hovedstol: number;
  annuitet: ReturnType<typeof beregnLaaneplan>;
  serielaan: ReturnType<typeof beregnLaaneplan>;
}) {
  const B = 600;
  const H = 240;
  const m = { l: 56, r: 12, t: 12, b: 28 };
  const a = restgaeldPrAar(annuitet, hovedstol);
  const s = restgaeldPrAar(serielaan, hovedstol);
  const maxAar = a[a.length - 1].aar;
  const x = (aar: number) => m.l + (aar / maxAar) * (B - m.l - m.r);
  const y = (v: number) => m.t + (1 - v / hovedstol) * (H - m.t - m.b);
  const linje = (p: { aar: number; restgaeld: number }[]) => p.map((q, i) => `${i ? "L" : "M"}${x(q.aar).toFixed(1)},${y(q.restgaeld).toFixed(1)}`).join(" ");
  const tick = Math.max(1, Math.ceil(maxAar / 6));
  const aarTicks: number[] = [];
  for (let t = 0; t <= maxAar; t += tick) aarTicks.push(t);

  return (
    <figure>
      <svg viewBox={`0 0 ${B} ${H}`} className="w-full h-auto" role="img" aria-labelledby="graf-titel graf-beskrivelse">
        <title id="graf-titel">Restgæld over tid</title>
        <desc id="graf-beskrivelse">
          Restgælden falder fra {kr(hovedstol)} til 0 kr. over {formatNumber(maxAar, "da", { maximumFractionDigits: 1 })} år. Annuitetslånet afdrages langsomt i starten, serielånet jævnt.
        </desc>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={m.l} x2={B - m.r} y1={y(hovedstol * f)} y2={y(hovedstol * f)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth={1} />
            <text x={m.l - 6} y={y(hovedstol * f) + 4} textAnchor="end" className="fill-gray-500 dark:fill-gray-400" fontSize={11}>
              {formatNumber(hovedstol * f, "da", { maximumFractionDigits: 0 })}
            </text>
          </g>
        ))}
        {aarTicks.map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize={11}>
            {t} år
          </text>
        ))}
        <path d={linje(a)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth={2.5} />
        <path d={linje(s)} fill="none" className="stroke-emerald-600 dark:stroke-emerald-400" strokeWidth={2.5} strokeDasharray="6 4" />
      </svg>
      <figcaption className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
        <span><span className="inline-block w-5 border-t-2 border-blue-600 dark:border-blue-400 align-middle mr-2" />Annuitetslån</span>
        <span><span className="inline-block w-5 border-t-2 border-dashed border-emerald-600 dark:border-emerald-400 align-middle mr-2" />Serielån</span>
      </figcaption>
    </figure>
  );
}

function RenteAfdragGraf({ plan }: { plan: ReturnType<typeof beregnLaaneplan> }) {
  const aar = aarsOversigt(plan);
  const B = 600;
  const H = 220;
  const m = { l: 56, r: 12, t: 12, b: 28 };
  const maks = Math.max(...aar.map((r) => r.rente + r.afdrag));
  const bw = (B - m.l - m.r) / aar.length;
  const h = (v: number) => (v / maks) * (H - m.t - m.b);
  const bund = H - m.b;
  return (
    <figure>
      <svg viewBox={`0 0 ${B} ${H}`} className="w-full h-auto" role="img" aria-labelledby="sojle-titel sojle-beskrivelse">
        <title id="sojle-titel">Rente og afdrag pr. år</title>
        <desc id="sojle-beskrivelse">
          Hver søjle viser, hvor meget af årets betalinger der går til rente og til afdrag på lånet.
        </desc>
        <line x1={m.l} x2={B - m.r} y1={bund} y2={bund} className="stroke-gray-300 dark:stroke-gray-600" />
        <text x={m.l - 6} y={m.t + 8} textAnchor="end" className="fill-gray-500 dark:fill-gray-400" fontSize={11}>
          {formatNumber(maks, "da", { maximumFractionDigits: 0 })}
        </text>
        <text x={m.l - 6} y={bund + 4} textAnchor="end" className="fill-gray-500 dark:fill-gray-400" fontSize={11}>0</text>
        {aar.map((r, i) => {
          const bx = m.l + i * bw + bw * 0.1;
          const w = bw * 0.8;
          return (
            <g key={r.aar}>
              <rect x={bx} y={bund - h(r.afdrag)} width={w} height={h(r.afdrag)} className="fill-blue-600 dark:fill-blue-400" />
              <rect x={bx} y={bund - h(r.afdrag) - h(r.rente)} width={w} height={h(r.rente)} className="fill-amber-500 dark:fill-amber-400" />
              {(aar.length <= 12 || r.aar % Math.ceil(aar.length / 8) === 0) && (
                <text x={bx + w / 2} y={H - 8} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize={11}>{r.aar}</text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-2">
        <span><span className="inline-block w-3 h-3 bg-blue-600 dark:bg-blue-400 mr-2 align-middle" />Afdrag</span>
        <span><span className="inline-block w-3 h-3 bg-amber-500 dark:bg-amber-400 mr-2 align-middle" />Rente</span>
        <span>Vandret: år</span>
      </figcaption>
    </figure>
  );
}

export default function LaaneplanBeregner({ variant }: { variant: LaaneplanVariant }) {
  const { locale } = useLocale();
  const standard = STANDARD_STATE[variant];
  const [state, setState] = useState<LaaneState>(standard);
  const [kopieret, setKopieret] = useState(false);
  const indlaest = useRef(false);
  const tracked = useRef(false);

  // Læs del-link ved mount; skriv derefter hver ændring tilbage i adressen.
  useEffect(() => {
    const fraUrl = window.location.search ? fraQuery(window.location.search, standard) : null;
    if (fraUrl) setState(fraUrl);
    indlaest.current = true;
  }, [standard]);

  useEffect(() => {
    if (!indlaest.current) return;
    const url = `${window.location.pathname}?${tilQuery(state)}`;
    window.history.replaceState(null, "", url);
  }, [state]);

  useEffect(() => {
    if (tracked.current) return;
    const t = setTimeout(() => {
      trackCalculation(variant === "annuitet" ? "renteberegner" : "forbrugslaan");
      tracked.current = true;
    }, 2000);
    return () => clearTimeout(t);
  }, [variant]);

  const set = useCallback(<K extends keyof LaaneState>(k: K, v: LaaneState[K]) => setState((s) => ({ ...s, [k]: v })), []);

  const fejl = validerInput({ ...state, type: state.type });
  const sam = useMemo(() => (fejl ? null : sammenlign(state)), [fejl, state]);
  const valgt = sam ? sam[state.type] : null;
  const aarOversigt = useMemo(() => (valgt ? aarsOversigt(valgt) : []), [valgt]);

  if (locale !== "da") return null;

  const kopierLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${tilQuery(state)}`);
      setKopieret(true);
      setTimeout(() => setKopieret(false), 2000);
    } catch {
      setKopieret(false);
    }
  };

  const delTekst = valgt
    ? `${TYPE_NAVN[state.type]} på ${kr(state.hovedstol)} til ${formatNumber(state.aarsrente, "da")} % over ${formatNumber(state.loebetidAar, "da")} år: ${
        state.type === "annuitet" ? `ydelse ${kr2(valgt.foersteYdelse)} pr. måned` : `ydelse fra ${kr2(valgt.foersteYdelse)} til ${kr2(valgt.sidsteYdelse)}`
      }, samlede renter ${kr(valgt.samletRente)}, ÅOP ${pct(valgt.aop)}.`
    : "";

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField value={state.hovedstol} onChange={(v) => set("hovedstol", v)} label="Lånebeløb" min={1000} max={20000000} step={variant === "annuitet" ? 10000 : 5000} unit="kr." />
          <InputField
            value={state.aarsrente}
            onChange={(v) => set("aarsrente", v)}
            label="Rente (debitorrente, pr. år)"
            min={0}
            max={40}
            step={0.1}
            unit="%"
            helpText="Den nominelle rente uden gebyrer. ÅOP regnes ud nedenfor."
          />
          <InputField value={state.loebetidAar} onChange={(v) => set("loebetidAar", v)} label="Løbetid" min={0.1} max={50} step={0.5} unit="år" />
          <InputField value={state.stiftelsesgebyr} onChange={(v) => set("stiftelsesgebyr", v)} label="Stiftelsesgebyr (engang)" min={0} max={100000} step={500} unit="kr." />
          <InputField value={state.maanedsgebyr} onChange={(v) => set("maanedsgebyr", v)} label="Gebyr pr. måned" min={0} max={100000} step={5} unit="kr." />
          <fieldset>
            <legend className="block text-sm font-medium mb-2 dark:text-gray-200">Lånetype</legend>
            <div className="grid grid-cols-2 gap-2">
              {(["annuitet", "serielaan"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  aria-pressed={state.type === t}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    state.type === t
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {TYPE_NAVN[t]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="space-y-4" aria-live="polite">
          {fejl || !valgt ? (
            <p role="alert" className="p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">{fejl}</p>
          ) : (
            <>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {state.type === "annuitet" ? "Ydelse pr. måned" : "Første ydelse (falder hver måned)"}
                </p>
                <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                  {kr(valgt.foersteYdelse + state.maanedsgebyr)}
                </p>
                {state.type === "serielaan" && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Sidste ydelse: {kr(valgt.sidsteYdelse + state.maanedsgebyr)}
                  </p>
                )}
                {state.maanedsgebyr > 0 && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Inkl. {kr(state.maanedsgebyr)} i månedligt gebyr.</p>
                )}
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                    <dt className="text-gray-600 dark:text-gray-400">Samlede renter</dt>
                    <dd className="font-medium">{kr(valgt.samletRente)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                    <dt className="text-gray-600 dark:text-gray-400">Gebyrer i alt</dt>
                    <dd className="font-medium">{kr(valgt.samletGebyr)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                    <dt className="text-gray-600 dark:text-gray-400">Samlet tilbagebetaling</dt>
                    <dd className="font-bold">{kr(valgt.samletTilbagebetaling)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                    <dt className="text-gray-600 dark:text-gray-400">Rente (debitorrente)</dt>
                    <dd className="font-medium">{pct(state.aarsrente)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 dark:border-blue-800 pt-2">
                    <dt className="text-gray-600 dark:text-gray-400">ÅOP</dt>
                    <dd className="font-bold">{pct(valgt.aop)}</dd>
                  </div>
                </dl>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ÅOP er den årlige samlede omkostning i procent: renten <em>plus</em> gebyrerne, regnet som én årlig rente. Den er højere end debitorrenten, når der er gebyrer, og den er den, du skal sammenligne lån på.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <CopyResultButton text={delTekst} />
                <button
                  type="button"
                  onClick={kopierLink}
                  className="min-h-11 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  {kopieret ? "Link kopieret!" : "Kopiér link til beregningen"}
                </button>
                <ResetButton onReset={() => setState(standard)} />
              </div>
            </>
          )}
        </div>
      </div>

      {sam && valgt && (
        <>
          <section aria-labelledby="sammenligning-overskrift">
            <h2 id="sammenligning-overskrift" className="text-xl font-semibold mb-3 dark:text-white">Annuitetslån eller serielån på de samme tal</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Annuitetslån og serielån side om side</caption>
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th scope="col" className="px-3 py-2 text-left" />
                    <th scope="col" className="px-3 py-2 text-right">Annuitetslån</th>
                    <th scope="col" className="px-3 py-2 text-right">Serielån</th>
                  </tr>
                </thead>
                <tbody className="[&_th]:text-left [&_th]:font-normal [&_td]:text-right [&_td]:px-3 [&_th]:px-3 [&_td]:py-2 [&_th]:py-2 [&_tr]:border-b [&_tr]:border-gray-100 dark:[&_tr]:border-gray-700">
                  <tr><th scope="row">Første ydelse</th><td>{kr(sam.annuitet.foersteYdelse + state.maanedsgebyr)}</td><td>{kr(sam.serielaan.foersteYdelse + state.maanedsgebyr)}</td></tr>
                  <tr><th scope="row">Sidste ydelse</th><td>{kr(sam.annuitet.sidsteYdelse + state.maanedsgebyr)}</td><td>{kr(sam.serielaan.sidsteYdelse + state.maanedsgebyr)}</td></tr>
                  <tr><th scope="row">Samlede renter</th><td>{kr(sam.annuitet.samletRente)}</td><td>{kr(sam.serielaan.samletRente)}</td></tr>
                  <tr><th scope="row">Samlet tilbagebetaling</th><td className="font-semibold">{kr(sam.annuitet.samletTilbagebetaling)}</td><td className="font-semibold">{kr(sam.serielaan.samletTilbagebetaling)}</td></tr>
                  <tr><th scope="row">ÅOP</th><td>{pct(sam.annuitet.aop)}</td><td>{pct(sam.serielaan.aop)}</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {sam.renteForskel > 0.5
                ? `Serielånet koster ${kr(sam.renteForskel)} mindre i renter, men ydelsen er ${kr(sam.foersteYdelseForskel)} højere i første måned${
                    sam.krydsMaaned ? ` og først lavere end annuitetslånets fra måned ${sam.krydsMaaned}` : ""
                  }.`
                : "Uden rente er de to lånetyper lige dyre."}
            </p>
            <div className="mt-6">
              <Graf hovedstol={state.hovedstol} annuitet={sam.annuitet} serielaan={sam.serielaan} />
            </div>
          </section>

          <section aria-labelledby="amortisering-overskrift">
            <h2 id="amortisering-overskrift" className="text-xl font-semibold mb-3 dark:text-white">Amortiseringsplan ({TYPE_NAVN[state.type].toLowerCase()})</h2>
            <RenteAfdragGraf plan={valgt} />
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm">
                <caption className="sr-only">Amortiseringsplan pr. år</caption>
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th scope="col" className="px-3 py-2 text-left">År</th>
                    <th scope="col" className="px-3 py-2 text-right">Ydelser</th>
                    <th scope="col" className="px-3 py-2 text-right">Rente</th>
                    <th scope="col" className="px-3 py-2 text-right">Afdrag</th>
                    <th scope="col" className="px-3 py-2 text-right">Restgæld</th>
                  </tr>
                </thead>
                <tbody>
                  {aarOversigt.map((r) => (
                    <tr key={r.aar} className="border-b border-gray-100 dark:border-gray-700">
                      <th scope="row" className="px-3 py-2 text-left font-normal">{r.aar}</th>
                      <td className="px-3 py-2 text-right">{kr(r.ydelse)}</td>
                      <td className="px-3 py-2 text-right">{kr(r.rente)}</td>
                      <td className="px-3 py-2 text-right">{kr(r.afdrag)}</td>
                      <td className="px-3 py-2 text-right">{kr(r.restgaeld)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300">Vis alle {valgt.antalMaaneder} måneder</summary>
              <div className="overflow-x-auto mt-3 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Amortiseringsplan pr. måned</caption>
                  <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left">Måned</th>
                      <th scope="col" className="px-3 py-2 text-right">Ydelse</th>
                      <th scope="col" className="px-3 py-2 text-right">Rente</th>
                      <th scope="col" className="px-3 py-2 text-right">Afdrag</th>
                      <th scope="col" className="px-3 py-2 text-right">Restgæld</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valgt.raekker.map((r) => (
                      <tr key={r.maaned} className="border-b border-gray-100 dark:border-gray-700">
                        <th scope="row" className="px-3 py-1.5 text-left font-normal">{r.maaned}</th>
                        <td className="px-3 py-1.5 text-right">{kr2(r.ydelse)}</td>
                        <td className="px-3 py-1.5 text-right">{kr2(r.rente)}</td>
                        <td className="px-3 py-1.5 text-right">{kr2(r.afdrag)}</td>
                        <td className="px-3 py-1.5 text-right">{kr2(r.restgaeld)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </>
      )}
    </div>
  );
}
