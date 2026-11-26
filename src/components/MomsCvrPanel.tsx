"use client";

// "Din virksomhed": optional CVR field under the VAT calculator on minberegner.dk/moms.
// Shows VAT status, VAT period and the next deadlines (with an .ics download) via our own
// /api/cvr route. The consent checkbox only appears once a CVR is entered and is unticked;
// everything works without it. No cookies or local storage. Never rendered in /embed.
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { formatNumber } from "@/lib/format";
import {
  CVRRADAR_TILBAGETRAEK_URL,
  type CvrApiSvar,
  erGyldigtCvr,
  isMomsCvrEnabled,
  rensCvr,
} from "@/lib/moms-cvr";
import {
  MOMS_GRAENSE_KVARTAL,
  MOMS_GRAENSE_MAANED,
  MOMSPERIODE_NAVN,
  type Momsfrist,
  momsfristerIcs,
  naesteMomsfrister,
} from "@/lib/momsfrister";

type Fundet = Extract<CvrApiSvar, { fundet: true }>;
type Tilstand = "klar" | "henter" | "fundet" | "ikke_fundet" | "utilgaengelig" | "for_mange";

const datoFormat = new Intl.DateTimeFormat("da-DK", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function periodeForklaring(d: Fundet): string {
  if (d.momsperiodeKilde === "cvrradar") return "Ifølge cvrradar.dk.";
  if (d.momsperiodeKilde === "standard") {
    return "Vi kender ikke omsætningen. Nye og mindre virksomheder starter på halvårlig moms.";
  }
  const oms = `${formatNumber(d.omsaetning ?? 0, "da")} kr.`;
  if (d.momsperiode === "maaned") return `Ud fra en omsætning på ${oms} (over ${formatNumber(MOMS_GRAENSE_MAANED / 1e6, "da")} mio. kr.).`;
  if (d.momsperiode === "kvartal") {
    return `Ud fra en omsætning på ${oms} (mellem ${formatNumber(MOMS_GRAENSE_KVARTAL / 1e6, "da")} og ${formatNumber(MOMS_GRAENSE_MAANED / 1e6, "da")} mio. kr.).`;
  }
  return `Ud fra en omsætning på ${oms} (under ${formatNumber(MOMS_GRAENSE_KVARTAL / 1e6, "da")} mio. kr.).`;
}

function hentIcs(frister: Momsfrist[], d: Fundet) {
  const blob = new Blob([momsfristerIcs(frister, { cvr: d.cvr, navn: d.navn })], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `momsfrister-${d.cvr}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function MomsCvrPanel() {
  const { locale } = useLocale();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultatRef = useRef<HTMLHeadingElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [cvrTekst, setCvrTekst] = useState("");
  const [samtykke, setSamtykke] = useState(false);
  const [fejl, setFejl] = useState("");
  const [tilstand, setTilstand] = useState<Tilstand>("klar");
  const [data, setData] = useState<Fundet | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    if (tilstand === "fundet" || tilstand === "ikke_fundet") resultatRef.current?.focus();
  }, [tilstand, data]);

  // Danish site only and behind the feature flag. The page also gates this.
  if (!isMomsCvrEnabled() || locale !== "da") return null;

  const cvr = rensCvr(cvrTekst);
  const visSamtykke = /^\d{8}$/.test(cvr);

  const onCvr = (v: string) => {
    // Consent belongs to one CVR: changing the number withdraws the tick.
    if (rensCvr(v) !== cvr) setSamtykke(false);
    setCvrTekst(v);
    if (fejl) setFejl("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!erGyldigtCvr(cvr)) {
      setFejl(cvr === "" ? "Skriv et CVR-nummer." : "CVR-nummeret skal være 8 cifre og gyldigt. Tjek, om du har tastet rigtigt.");
      inputRef.current?.focus();
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTilstand("henter");
    setData(null);
    try {
      const res = await fetch("/api/cvr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cvr, samtykke }),
        signal: ctrl.signal,
        credentials: "omit",
      });
      if (res.status === 429) return setTilstand("for_mange");
      if (res.status === 400) {
        setTilstand("klar");
        setFejl("CVR-nummeret skal være 8 cifre og gyldigt. Tjek, om du har tastet rigtigt.");
        inputRef.current?.focus();
        return;
      }
      const svar = (await res.json()) as CvrApiSvar;
      if (!res.ok || !svar.tilgaengelig) return setTilstand("utilgaengelig");
      if (!svar.fundet) return setTilstand("ikke_fundet");
      setData(svar);
      setTilstand("fundet");
    } catch {
      if (!ctrl.signal.aborted) setTilstand("utilgaengelig");
    }
  };

  const frister = data && data.momsregistreret !== false ? naesteMomsfrister(data.momsperiode, new Date(), 3) : [];
  const fejlId = `${id}-fejl`;
  const hjaelpId = `${id}-hjaelp`;

  return (
    <section
      aria-labelledby={`${id}-titel`}
      className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:p-6 dark:border-blue-900 dark:bg-blue-900/20"
      data-testid="moms-cvr"
    >
      <h2 id={`${id}-titel`} className="text-lg font-semibold text-gray-900 dark:text-white">
        Din virksomhed <span className="font-normal text-gray-600 dark:text-gray-300">(valgfrit)</span>
      </h2>
      <p id={hjaelpId} className="mt-1 text-sm text-gray-600 dark:text-gray-300">
        Skriv dit CVR-nummer og se, om virksomheden er momsregistreret, hvilken momsperiode den har, og hvornår de næste
        momsfrister er.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
        <div>
          <label htmlFor={`${id}-cvr`} className="mb-1 block text-sm font-medium text-gray-900 dark:text-gray-100">
            CVR-nummer
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              ref={inputRef}
              id={`${id}-cvr`}
              name="cvr"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={14}
              placeholder="12345678"
              value={cvrTekst}
              onChange={(e) => onCvr(e.target.value)}
              aria-invalid={fejl ? true : undefined}
              aria-describedby={fejl ? `${fejlId} ${hjaelpId}` : hjaelpId}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg tabular-nums text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-600 sm:max-w-xs dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={tilstand === "henter"}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-gray-900"
            >
              {tilstand === "henter" ? "Henter …" : "Vis momsstatus"}
            </button>
          </div>
          {fejl && (
            <p id={fejlId} className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
              {fejl}
            </p>
          )}
        </div>

        {visSamtykke && (
          <div className="flex items-start gap-3 rounded-lg bg-white/70 p-3 dark:bg-gray-800/60">
            <input
              id={`${id}-samtykke`}
              type="checkbox"
              checked={samtykke}
              onChange={(e) => setSamtykke(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-blue-600"
            />
            <label htmlFor={`${id}-samtykke`} className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              Det er min virksomhed, og I må bruge mit besøg til at genkende vores netværk. Mahope (CVR 39413892), som
              driver minberegner.dk og cvrradar.dk, gemmer, at virksomhedens internetforbindelse (de første tre dele af
              IP-adressen, ikke den fulde adresse) hører til dette CVR-nummer. Vi bruger det til at genkende besøg fra
              virksomhedens netværk på vores egne sites og i cvrradar.dk&apos;s tjenester til virksomheder. Vi gemmer
              ikke din IP-adresse, dit navn eller din beregning. Oplysningen slettes 30 dage efter sidste besøg. Du kan
              trække samtykket tilbage når som helst.{" "}
              <Link href="/privatlivspolitik#cvr" className="text-blue-700 underline hover:text-blue-900 dark:text-blue-300">
                Læs mere
              </Link>
            </label>
          </div>
        )}
      </form>

      <div aria-live="polite" className="mt-4">
        {tilstand === "henter" && <p className="text-sm text-gray-600 dark:text-gray-300">Henter oplysninger …</p>}
        {tilstand === "utilgaengelig" && (
          <p className="text-sm text-gray-700 dark:text-gray-200">
            Vi kan ikke hente oplysningerne lige nu. Momsberegneren virker stadig. Prøv igen senere.
          </p>
        )}
        {tilstand === "for_mange" && (
          <p className="text-sm text-gray-700 dark:text-gray-200">For mange opslag. Prøv igen om et minut.</p>
        )}
        {tilstand === "ikke_fundet" && (
          <h3 ref={resultatRef} tabIndex={-1} className="text-sm font-medium text-gray-900 focus:outline-none dark:text-white">
            Vi fandt ingen virksomhed med CVR {cvr}.
          </h3>
        )}
        {tilstand === "fundet" && data && (
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <h3 ref={resultatRef} tabIndex={-1} className="text-base font-semibold text-gray-900 focus:outline-none dark:text-white">
              {data.navn ?? "Virksomheden"} <span className="font-normal text-gray-500 dark:text-gray-400">CVR {data.cvr}</span>
            </h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Momsstatus</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {data.momsregistreret === true
                    ? "Momsregistreret"
                    : data.momsregistreret === false
                      ? "Ikke momsregistreret"
                      : "Ukendt"}
                </dd>
              </div>
              {data.momsregistreret !== false && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">Momsperiode</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">{MOMSPERIODE_NAVN[data.momsperiode]}</dd>
                  <dd className="text-gray-600 dark:text-gray-300">{periodeForklaring(data)}</dd>
                </div>
              )}
            </dl>
            {data.momsregistreret === false && (
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-200">
                Virksomheden står ikke som momsregistreret, så der er ingen momsfrister. Den skal registreres, når den
                momspligtige omsætning passerer 50.000 kr. på 12 måneder.
              </p>
            )}
            {frister.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Næste momsfrister</h4>
                <ul className="mt-2 divide-y divide-gray-100 text-sm dark:divide-gray-700">
                  {frister.map((f) => (
                    <li key={f.periodeNavn} className="flex flex-wrap justify-between gap-x-4 py-2">
                      <span className="text-gray-700 dark:text-gray-200">{f.periodeNavn}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{datoFormat.format(f.frist)}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => hentIcs(frister, data)}
                  className="mt-3 w-full rounded-lg border border-blue-600 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto dark:text-blue-300 dark:hover:bg-blue-900/30"
                >
                  Hent fristerne til din kalender (.ics)
                </button>
              </div>
            )}
            {data.laert && (
              <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">
                Tak. Vi genkender nu besøg fra jeres netværk, indtil 30 dage efter sidste besøg.{" "}
                <a
                  href={CVRRADAR_TILBAGETRAEK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900 dark:text-blue-300"
                >
                  Slet vores virksomheds netværk
                </a>
              </p>
            )}
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Oplysningerne kommer fra cvrradar.dk og CVR-registret. Tjek altid fristerne i TastSelv Erhverv.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
