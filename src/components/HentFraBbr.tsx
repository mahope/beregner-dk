"use client";

// "Hent fra BBR": an address field that looks the dwelling up in BBR via our own /api/bbr route
// and hands the result to the calculator, which fills its own fields (the user can always edit them).
// Danish locale only: BBR is a Danish register, so the component renders nothing on other domains.
import { useEffect, useId, useRef, useState } from "react";
import { AdresseFelt, type ValgtAdresse } from "@/components/AdresseFelt";
import { useLocale } from "@/components/LocaleProvider";
import { trackBbrLookup } from "@/lib/analytics";
import { BBR_DK, type BbrData, hentBbr } from "@/lib/bbr";
import { formatNumber } from "@/lib/format";

type Tilstand = "klar" | "henter" | "fundet" | "uden_areal" | "ikke_fundet" | "utilgaengelig";

type Props = {
  /** Calculator slug, used for analytics only. */
  beregner: string;
  onData: (data: BbrData) => void;
  titel?: string;
  beskrivelse: string;
  className?: string;
};

export function bbrResume(d: BbrData): string {
  const dele: string[] = [];
  if (d.boligareal) dele.push(`${formatNumber(d.boligareal, "da")} m² bolig`);
  if (d.vaerelser) dele.push(`${d.vaerelser} ${d.vaerelser === 1 ? "værelse" : "værelser"}`);
  if (d.opfoerelsesaar) dele.push(`opført ${d.opfoerelsesaar}`);
  return dele.join(", ");
}

export function HentFraBbr({ beregner, onData, titel = "Hent fra BBR", beskrivelse, className = "" }: Props) {
  const { locale } = useLocale();
  const titelId = useId();
  const abortRef = useRef<AbortController | null>(null);
  const [tilstand, setTilstand] = useState<Tilstand>("klar");
  const [resume, setResume] = useState("");

  useEffect(() => () => abortRef.current?.abort(), []);

  if (locale !== "da") return null;

  const onValg = async (a: ValgtAdresse) => {
    abortRef.current?.abort();
    if (!a.husnummerId) {
      setTilstand("ikke_fundet");
      return;
    }
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setTilstand("henter");
    const svar = await hentBbr(a.husnummerId, a.id, { signal: ctrl.signal });
    if (ctrl.signal.aborted) return;

    let ny: Tilstand;
    if (!svar.tilgaengelig) ny = "utilgaengelig";
    else if (!svar.fundet) ny = "ikke_fundet";
    else {
      const { tilgaengelig: _t, fundet: _f, ...data } = svar;
      ny = data.boligareal ? "fundet" : "uden_areal";
      setResume(bbrResume(data));
      onData(data);
    }
    setTilstand(ny);
    trackBbrLookup(beregner, ny);
  };

  const besked =
    tilstand === "henter"
      ? "Henter oplysninger fra BBR …"
      : tilstand === "fundet"
        ? `Fra BBR: ${resume}. Du kan rette felterne.`
        : tilstand === "uden_areal"
          ? "BBR har ikke et boligareal for netop denne adresse. Vælg en konkret lejlighed, eller udfyld arealet selv."
          : tilstand === "ikke_fundet"
            ? "BBR har ingen bolig registreret på adressen. Udfyld felterne selv."
            : tilstand === "utilgaengelig"
              ? "BBR svarer ikke lige nu. Udfyld felterne selv."
              : "";

  return (
    <section
      aria-labelledby={titelId}
      className={`rounded-xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900 dark:bg-blue-900/20 ${className}`}
    >
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
        <p id={titelId} className="font-semibold text-gray-900 dark:text-white">
          {titel}
        </p>
        <a
          href={BBR_DK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-700 underline hover:text-blue-900 dark:text-blue-300"
        >
          Hvad er BBR?
        </a>
      </div>
      <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">{beskrivelse}</p>
      <AdresseFelt label="Adresse" onValg={onValg} besked={besked} />
    </section>
  );
}

/** Small source note shown next to a field that was filled from BBR. */
export function BbrKilde() {
  return (
    <span className="ml-2 inline-flex items-center rounded first:ml-0 bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
      Fra&nbsp;
      <a href={BBR_DK} target="_blank" rel="noopener noreferrer" className="underline">
        BBR
      </a>
    </span>
  );
}
