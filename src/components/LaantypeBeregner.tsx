"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Scale } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  LAANETYPE_EKSEMPEL_AARSRENTE as EKSPEL_AARSRENTE,
  LAANETYPE_EKSEMPEL_HOVEDSTOL as EKSPEL_HOVEDSTOL,
  LAANETYPE_EKSEMPEL_LOEBETID as EKSPEL_LOEBETID,
  LAANETYPER,
  MAX_AARSRENTE,
  MAX_HOVEDSTOL,
  MAX_LOEBETID_AAR,
  MIN_HOVEDSTOL,
  krydsMaaned,
  laanetyperSammenlign,
  type LaanetypeResultat,
} from "@/lib/laantype";

const labels = {
  da: {
    calcName: "Lånetypeberegner",
    belob: "Lånebeløb",
    rente: "Årlig rente",
    loebetid: "Løbetid",
    aar: "år",
    sammenlign: "Sammenligning af lånetyper",
    foersteYdelse: "Første ydelse",
    sidsteYdelse: "Sidste ydelse",
    maanedligtAfdrag: "Månedsafdrag i måned 1",
    samletRente: "Samlet rente",
    samletBetaling: "Samlet betaling",
    renteAndel: "Renteandel",
    krydsMaaned: "Måneder til afdragskrydset",
    kryds: "Serielånets ydelse bliver lavere end annuitetslånets fra måned",
    krydsIngen: "Ved 0 % rente er de to ydelser ens hele vejen, så de krydser ikke.",
    shareSummary: "Lånetype",
    intro:
      "Vælg beløb, rente og løbetid, så regner værktøjet alle tre lånetyper på de samme tal.",
    forudindstillet: `Eksempel: ${formatNumber(EKSPEL_HOVEDSTOL, "da", { maximumFractionDigits: 0 })} kr. over ${EKSPEL_LOEBETID} år til ${EKSPEL_AARSRENTE} %.`,
    typeLabels: {
      annuitet: "Annuitetslån",
      serielaan: "Serielån",
      staende: "Stående lån",
    },
    typeShort: {
      annuitet: "Fast ydelse",
      serielaan: "Fast afdrag",
      staende: "Kun renter",
    },
    fejlBelob: `Skriv et beløb mellem ${formatNumber(MIN_HOVEDSTOL, "da", { maximumFractionDigits: 0 })} og ${formatNumber(MAX_HOVEDSTOL, "da", { maximumFractionDigits: 0 })} kr.`,
    fejlRente: `Skriv en rente mellem 0 og ${MAX_AARSRENTE} %.`,
    fejlLoebetid: `Skriv en løbetid på mindst 1 år og højst ${MAX_LOEBETID_AAR} år.`,
  },
  se: {
    calcName: "Lånetypeberäknare",
    belob: "Lånebelopp",
    rente: "Årlig ränta",
    loebetid: "Löptid",
    aar: "år",
    sammenlign: "Jämförelse av lånetyper",
    foersteYdelse: "Första betalningen",
    sidsteYdelse: "Sista betalningen",
    maanedligtAfdrag: "Månadsamortisering i månad 1",
    samletRente: "Total ränta",
    samletBetaling: "Total att betala",
    renteAndel: "Ränteandel",
    krydsMaaned: "Månader till amortiseringskorsningen",
    kryds: "Serielånets betalning blir lägre än annuitetslånets från månad",
    krydsIngen: "Vid 0 % ränta är de två betalningarna lika hela vägen, så de korsar aldrig.",
    shareSummary: "Lånetyp",
    intro:
      "Välj belopp, ränta och löptid, så räknar verktyget alla tre lånetyper på samma siffror.",
    forudindstillet: `Exempel: ${formatNumber(EKSPEL_HOVEDSTOL, "se", { maximumFractionDigits: 0 })} kr. över ${EKSPEL_LOEBETID} år till ${EKSPEL_AARSRENTE} %.`,
    typeLabels: {
      annuitet: "Annuitetslån",
      serielaan: "Serielån",
      staende: "Stående lån",
    },
    typeShort: {
      annuitet: "Fast betalning",
      serielaan: "Fast amortering",
      staende: "Endast ränta",
    },
    fejlBelob: `Skriv ett belopp mellan ${formatNumber(MIN_HOVEDSTOL, "se", { maximumFractionDigits: 0 })} och ${formatNumber(MAX_HOVEDSTOL, "se", { maximumFractionDigits: 0 })} kr.`,
    fejlRente: `Skriv en ränta mellan 0 och ${MAX_AARSRENTE} %.`,
    fejlLoebetid: `Skriv en löptid på minst 1 år och högst ${MAX_LOEBETID_AAR} år.`,
  },
} as const;

/**
 * De forudindstillede tal er eksemplet i `laantype.ts`, så side og værktøj er
 * ens — og de skrives **fra** de konstanter, så en streng ikke kan vise et
 * beløb, værktøjet ikke regner på (`regnestykker`-porten dømmer netop det).
 */
const START = {
  hovedstol: EKSPEL_HOVEDSTOL,
  aarligRente: EKSPEL_AARSRENTE,
  loebetidAar: EKSPEL_LOEBETID,
} as const;

export default function LaantypeBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const kr = (n: number) => formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const tal = (n: number, dec = 2) =>
    formatNumber(n, locale, { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const [hovedstol, setHovedstol] = useState<number>(START.hovedstol);
  const [aarligRente, setAarligRente] = useState<number>(START.aarligRente);
  const [loebetidAar, setLoebetidAar] = useState<number>(START.loebetidAar);

  const harRegistreret = useRef(false);
  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("laantype");
    const timer = setTimeout(() => trackCalculation("laantype"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const gyldig =
    hovedstol >= MIN_HOVEDSTOL &&
    hovedstol <= MAX_HOVEDSTOL &&
    aarligRente >= 0 &&
    aarligRente <= MAX_AARSRENTE &&
    loebetidAar >= 1 &&
    loebetidAar <= MAX_LOEBETID_AAR;

  const raekker = useMemo(() => {
    if (!gyldig) return [];
    try {
      return laanetyperSammenlign(hovedstol, aarligRente, loebetidAar);
    } catch {
      // Modulet kaster på input uden for grænsen; værktøjet skal vise
      // «skriv et tal» og ikke en fejl (punkt 8: 5xx er forbigående).
      return [];
    }
  }, [hovedstol, aarligRente, loebetidAar, gyldig]);

  const kryds = useMemo(() => {
    if (!gyldig) return null;
    try {
      return krydsMaaned(hovedstol, aarligRente, loebetidAar);
    } catch {
      return null;
    }
  }, [hovedstol, aarligRente, loebetidAar, gyldig]);

  const onBelob = useCallback((v: string) => setHovedstol(Number(v) || 0), []);
  const onRente = useCallback((v: string) => setAarligRente(Number(v) || 0), []);
  const onLoebetid = useCallback((v: string) => setLoebetidAar(Number(v) || 0), []);

  const belobFejl = hovedstol !== 0 && (hovedstol < MIN_HOVEDSTOL || hovedstol > MAX_HOVEDSTOL);
  const renteFejl = aarligRente < 0 || aarligRente > MAX_AARSRENTE;
  const loebetidFejl = loebetidAar < 1 || loebetidAar > MAX_LOEBETID_AAR;

  // De to forskelle er hele svaret på «annuitetslån vs serielån»: serielånet
  // koster mere i måned 1 og mindre over hele løbetiden. Begge regnes her fra
  // de samme to rækker, tabellen viser, så et tal i kortet og et i tabellen
  // ikke kan komme fra hver sin beregning.
  const annuitet = raekker.find((r) => r.type === "annuitet");
  const serielaan = raekker.find((r) => r.type === "serielaan");
  const serielaanDifferens =
    annuitet && serielaan ? serielaan.foersteYdelse - annuitet.foersteYdelse : 0;
  const renteDifferens = annuitet && serielaan ? annuitet.samletRente - serielaan.samletRente : 0;

  const felter: {
    id: string;
    label: string;
    value: number;
    onChange: (v: string) => void;
    min: number;
    max: number;
    step: string;
    enhed?: string;
    fejl: boolean;
    fejlTekst: string;
  }[] = [
    {
      id: "laantype-hovedstol",
      label: l.belob,
      value: hovedstol,
      onChange: onBelob,
      min: MIN_HOVEDSTOL,
      max: MAX_HOVEDSTOL,
      step: "10000",
      enhed: "kr",
      fejl: belobFejl,
      fejlTekst: l.fejlBelob,
    },
    {
      id: "laantype-rente",
      label: l.rente,
      value: aarligRente,
      onChange: onRente,
      min: 0,
      max: MAX_AARSRENTE,
      step: "0.1",
      enhed: "%",
      fejl: renteFejl,
      fejlTekst: l.fejlRente,
    },
    {
      id: "laantype-loebetid",
      label: l.loebetid,
      value: loebetidAar,
      onChange: onLoebetid,
      min: 1,
      max: MAX_LOEBETID_AAR,
      step: "1",
      enhed: l.aar,
      fejl: loebetidFejl,
      fejlTekst: l.fejlLoebetid,
    },
  ];

  const resumé = raekker
    .map((r) => `${l.typeLabels[r.type]}: ${kr(r.foersteYdelse)} kr./${lang === "se" ? "mån" : "md."}`)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {felter.map((felt) => (
            <div key={felt.id}>
              <label htmlFor={felt.id} className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                {felt.label}
              </label>
              <div className="relative">
                <input
                  id={felt.id}
                  type="number"
                  inputMode="decimal"
                  min={felt.min}
                  max={felt.max}
                  step={felt.step}
                  value={felt.value === 0 ? "" : felt.value}
                  aria-invalid={felt.fejl || undefined}
                  aria-describedby={felt.fejl ? `${felt.id}-fejl` : undefined}
                  onChange={(e) => felt.onChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-16 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {felt.enhed}
                </span>
              </div>
              {felt.fejl ? (
                <p id={`${felt.id}-fejl`} className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {felt.fejlTekst}
                </p>
              ) : null}
            </div>
          ))}
          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{l.forudindstillet}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.sammenlign}</p>
            {raekker.length > 0 ? (
              <>
                <p className="mt-2 flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
                  <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
                  <span>{kr(raekker[0].foersteYdelse)}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lang === "da"
                    ? "kr. pr. måned i et annuitetslån"
                    : "kr. per månad i ett annuitetslån"}
                </p>
              </>
            ) : (
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">–</p>
            )}
          </div>
          {raekker.length > 0 ? (
            <dl className="mt-3 space-y-2">
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                <dt className="text-xs text-gray-600 dark:text-gray-400">
                  {lang === "da" ? "Serielånets forskel i måned 1" : "Serielånets skillnad i månad 1"}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {kr(serielaanDifferens)} kr.
                </dd>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                <dt className="text-xs text-gray-600 dark:text-gray-400">
                  {lang === "da" ? "Serielånets rentebesparelse" : "Serielånets räntebesparing"}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {kr(renteDifferens)} kr.
                </dd>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
                <dt className="text-xs text-gray-600 dark:text-gray-400">
                  {l.krydsMaaned}
                </dt>
                <dd className="text-sm font-semibold text-gray-900 dark:text-white">
                  {kryds === null ? "–" : kryds}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      </div>

      {raekker.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left border-collapse text-sm">
              <caption className="sr-only">{l.sammenlign}</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-3">
                    {l.sammenlign}
                  </th>
                  {LAANETYPER.map((type) => (
                    <th key={type} scope="col" className="py-2 pr-3">
                      {l.typeLabels[type]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    { noegle: l.foersteYdelse, vaerdi: (r: LaanetypeResultat) => kr(r.foersteYdelse) },
                    { noegle: l.sidsteYdelse, vaerdi: (r: LaanetypeResultat) => kr(r.sidsteYdelse) },
                    {
                      noegle: l.maanedligtAfdrag,
                      vaerdi: (r: LaanetypeResultat) => kr(r.foersteAfdrag),
                    },
                    {
                      noegle: l.samletRente,
                      vaerdi: (r: LaanetypeResultat) => kr(r.samletRente),
                    },
                    {
                      noegle: l.samletBetaling,
                      vaerdi: (r: LaanetypeResultat) => kr(r.samletBetaling),
                    },
                    {
                      noegle: l.renteAndel,
                      vaerdi: (r: LaanetypeResultat) => `${tal(r.renteAndel, 1)} %`,
                    },
                  ] as const
                ).map((række) => (
                  <tr key={række.noegle} className="border-b last:border-0">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-gray-900 dark:text-white">
                      {række.noegle}
                    </th>
                    {raekker.map((r) => (
                      <td key={r.type} className="py-2 pr-3 tabular-nums">
                        {række.vaerdi(r)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-200">
            {kryds === null
              ? l.krydsIngen
              : lang === "da"
                ? `${l.kryds} ${kryds} — måned ${kryds} af ${raekker[0]?.antalMaaneder ?? 0}.`
                : `${l.kryds} ${kryds} — månad ${kryds} av ${raekker[0]?.antalMaaneder ?? 0}.`}
          </p>

          <div className="flex justify-center">
            <CopyResultButton text={resumé} />
          </div>
        </>
      ) : null}
    </div>
  );
}
