"use client";

// Address field with autocomplete following the ARIA 1.2 combobox pattern (input + listbox).
// Keyboard: arrow up/down, Enter selects, Escape closes. Road and entrance suggestions refine the search.
// The suggestion list is positioned absolutely, so opening it never shifts the layout.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { type Forslag, soegAdresser } from "@/lib/adresse";

export type ValgtAdresse = Extract<Forslag, { type: "adresse" }>;

type Props = {
  onValg: (a: ValgtAdresse) => void;
  /** Called when Adressevælger does not answer. */
  onFejl?: () => void;
  label?: string;
  /** id of an element that further describes the field. */
  describedBy?: string;
  /** Message from the caller (e.g. the BBR lookup), shown in the field's reserved status line. */
  besked?: React.ReactNode;
  placeholder?: string;
  /**
   * Accept a house number with several addresses as the final choice instead of asking for the
   * floor (for callers that only need the location, e.g. the route distance). The chosen value then
   * has `id` = `husnummerId` = the house number id.
   */
  husnummerNok?: boolean;
  /** Called when the user edits the text after a choice, i.e. the choice is no longer valid. */
  onRyd?: () => void;
};

export function AdresseFelt({
  onValg,
  onFejl,
  label = "Din adresse",
  describedBy,
  besked,
  placeholder = "Fx Vejers Havvej 5, 6853",
  husnummerNok = false,
  onRyd,
}: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tekst, setTekst] = useState("");
  const [forslag, setForslag] = useState<Forslag[]>([]);
  const [aaben, setAaben] = useState(false);
  const [aktiv, setAktiv] = useState(-1);
  const [status, setStatus] = useState("");
  const [sr, setSr] = useState("");
  const valgtRef = useRef(false);

  const inputId = `${id}-input`;
  const listeId = `${id}-liste`;
  const statusId = `${id}-status`;
  const optId = (i: number) => `${id}-opt-${i}`;

  const soeg = useCallback(
    async (q: string) => {
      abortRef.current?.abort();
      if (q.trim().length < 2) {
        setForslag([]);
        setAaben(false);
        setStatus("");
        return;
      }
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const r = await soegAdresser(q, { signal: ctrl.signal });
        if (ctrl.signal.aborted) return;
        setForslag(r);
        setAktiv(-1);
        setAaben(r.length > 0);
        setStatus(r.length === 0 ? "Ingen adresser passer. Prøv med vejnavn, husnummer og postnummer." : "");
        setSr(r.length === 0 ? "" : `${r.length} forslag. Brug pil op og ned for at vælge.`);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setForslag([]);
        setAaben(false);
        setStatus("Adressesøgningen svarer ikke lige nu. Du kan stadig udfylde felterne selv.");
        onFejl?.();
      }
    },
    [onFejl],
  );

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const planlaegSoegning = (q: string, forsinkelse = 150) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void soeg(q), forsinkelse);
  };

  const vaelg = (valgt: Forslag) => {
    const f: Forslag =
      husnummerNok && valgt.type === "fortsaet" && valgt.kilde === "husnummer" && valgt.husnummerId
        ? { type: "adresse", id: valgt.husnummerId, titel: valgt.titel, husnummerId: valgt.husnummerId }
        : valgt;
    if (f.type === "fortsaet") {
      setTekst(f.naesteTekst);
      planlaegSoegning(f.naesteTekst, 0);
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(f.markoer, f.markoer);
      });
      return;
    }
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    setTekst(f.titel);
    setAaben(false);
    setForslag([]);
    setStatus("");
    setSr("");
    valgtRef.current = true;
    onValg(f);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!aaben && forslag.length) setAaben(true);
      setAktiv((i) => (forslag.length ? (i + 1) % forslag.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((i) => (forslag.length ? (i <= 0 ? forslag.length - 1 : i - 1) : -1));
    } else if (e.key === "Enter") {
      if (aaben && forslag.length) {
        e.preventDefault();
        vaelg(forslag[aktiv >= 0 ? aktiv : 0]);
      }
    } else if (e.key === "Escape") {
      if (aaben) {
        e.preventDefault();
        setAaben(false);
        setAktiv(-1);
      }
    } else if (e.key === "Tab") {
      setAaben(false);
    }
  };

  useEffect(() => {
    if (aktiv < 0) return;
    document.getElementById(optId(aktiv))?.scrollIntoView({ block: "nearest" });
  }, [aktiv]);

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={aaben}
          aria-controls={listeId}
          aria-activedescendant={aaben && aktiv >= 0 ? optId(aktiv) : undefined}
          aria-describedby={[statusId, describedBy].filter(Boolean).join(" ")}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={placeholder}
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            if (valgtRef.current) {
              valgtRef.current = false;
              onRyd?.();
            }
            planlaegSoegning(e.target.value);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => forslag.length > 0 && setAaben(true)}
          onBlur={() => setAaben(false)}
          className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <ul
          id={listeId}
          role="listbox"
          aria-label="Adresseforslag"
          hidden={!aaben}
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800"
        >
          {forslag.map((f, i) => (
            <li
              key={`${f.titel}-${i}`}
              id={optId(i)}
              role="option"
              aria-selected={i === aktiv}
              onMouseDown={(e) => {
                e.preventDefault();
                vaelg(f);
              }}
              onMouseMove={() => i !== aktiv && setAktiv(i)}
              className={`flex cursor-pointer flex-wrap items-baseline justify-between gap-x-2 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 ${
                i === aktiv ? "bg-blue-50 dark:bg-blue-900/40" : ""
              }`}
            >
              <span className="min-w-0 break-words">{f.titel}</span>
              {f.type === "fortsaet" && !(husnummerNok && f.kilde === "husnummer" && f.husnummerId) && (
                <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                  {f.kilde === "husnummer" ? "vælg etage" : "skriv husnummer"}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Two reserved lines so messages never push the calculator down. */}
      <p id={statusId} aria-live="polite" className="mt-1 min-h-[2rem] text-xs leading-4 text-gray-600 dark:text-gray-400">
        {status || besked}
        <span className="sr-only">{sr}</span>
      </p>
    </div>
  );
}
