"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

/** Short explanations of the terms people rarely know. Wording follows docs/barsel/regler-2026.md. */
export const BEGREBER = {
  graviditetsorlov: {
    titel: "Graviditetsorlov",
    tekst: "Mor kan gå på orlov med barselsdagpenge 4 uger før termin. Ugerne kan ikke gives til den anden forælder.",
  },
  oeremaerket: {
    titel: "Øremærkede uger",
    tekst:
      "11 uger pr. forælder, som kun du kan holde: 2 lige efter fødslen og 9, der skal holdes, inden barnet fylder 1 år. Holder du dem ikke, går de tabt. Gælder lønmodtagere.",
  },
  delbar: {
    titel: "Delbare uger",
    tekst:
      "Uger med barselsdagpenge, som I selv fordeler mellem jer. Efter uge 10 har mor 5 og far eller medmor 13, som kan gives til den anden.",
  },
  overfoert: {
    titel: "Overført",
    tekst: "Delbare uger, som den ene forælder har givet til den anden. Den, der holder ugerne, får barselsdagpengene.",
  },
  udskudt: {
    titel: "Udskudte uger",
    tekst:
      "Som lønmodtager kan du gå tilbage på arbejde og gemme op til 5 uger. De holdes samlet, inden barnet fylder 9 år. Flere uger kræver aftale med arbejdsgiveren.",
  },
  deltid: {
    titel: "Deltid",
    tekst:
      "Efter aftale med arbejdsgiveren kan du arbejde en del af tiden under orloven. Så bliver orloven og dagpengene forlænget tilsvarende. Ikke muligt i mors første 2 uger.",
  },
  dagpenge: {
    titel: "Barselsdagpenge og løn under barsel",
    tekst:
      "Barselsdagpenge er statens ydelse, højst 5.085 kr. om ugen før skat i 2026. Mange overenskomster giver løn under barsel i en periode. Så får arbejdsgiveren dagpengene i stedet for dig.",
  },
  varsling: {
    titel: "Varsling",
    tekst:
      "Din besked til arbejdsgiveren om, hvornår du holder orlov. Mor skal give besked 3 måneder før termin, far eller medmor 4 uger før. Orlov efter uge 10 varsles senest 6 uger efter fødslen.",
  },
} as const;

export type Begreb = keyof typeof BEGREBER;

/**
 * A small (i) button that toggles a short explanation. Works with mouse, touch and
 * keyboard: Enter/Space opens, Escape or a click outside closes.
 */
export default function InfoTip({ begreb, className = "" }: { begreb: Begreb; className?: string }) {
  const { titel, tekst } = BEGREBER[begreb];
  const [aaben, setAaben] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const knapRef = useRef<HTMLButtonElement>(null);
  const boksRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!aaben) return;
    const luk = (e: Event) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setAaben(false);
    };
    const tast = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAaben(false);
        knapRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", luk);
    document.addEventListener("focusin", luk);
    document.addEventListener("keydown", tast);
    return () => {
      document.removeEventListener("pointerdown", luk);
      document.removeEventListener("focusin", luk);
      document.removeEventListener("keydown", tast);
    };
  }, [aaben]);

  // The bubble is position: fixed and clamped to the viewport (16px gutter), so it can
  // never cause horizontal scroll. It follows its button while the page scrolls.
  useLayoutEffect(() => {
    if (!aaben) return;
    const placer = () => {
      const knap = knapRef.current;
      const boks = boksRef.current;
      if (!knap || !boks) return;
      const k = knap.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const bredde = boks.offsetWidth;
      const venstre = Math.min(Math.max(16, k.left + k.width / 2 - bredde / 2), vw - 16 - bredde);
      setPos({ top: k.bottom + 6, left: Math.max(16, venstre) });
    };
    placer();
    window.addEventListener("scroll", placer, { passive: true });
    window.addEventListener("resize", placer);
    return () => {
      window.removeEventListener("scroll", placer);
      window.removeEventListener("resize", placer);
    };
  }, [aaben]);

  return (
    <span ref={wrapRef} className={`relative inline-flex align-middle ${className}`}>
      <button
        ref={knapRef}
        type="button"
        aria-expanded={aaben}
        aria-controls={id}
        aria-label={`Hvad betyder ${titel.toLowerCase()}?`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPos(null);
          setAaben((a) => !a);
        }}
        // A 24px icon with an invisible 44px hit area, so it does not push lines apart on touch screens.
        style={{ minHeight: 0 }}
        className="relative inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-500 before:absolute before:-inset-2.5 before:content-[''] hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
      <span
        ref={boksRef}
        id={id}
        role="note"
        hidden={!aaben}
        style={pos ? { top: pos.top, left: pos.left } : { top: 0, left: 0, visibility: "hidden" }}
        className="fixed z-40 block w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-3 text-left text-sm font-normal normal-case leading-snug tracking-normal text-gray-800 shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
      >
        <span className="mb-0.5 block font-semibold text-gray-900 dark:text-white">{titel}</span>
        {tekst}
      </span>
    </span>
  );
}
