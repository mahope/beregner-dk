"use client";

// "Slå din bolig op" on /kvadratmeter: shows BBR's registered areas next to your own measurement.
// Danish locale only (HentFraBbr renders nothing elsewhere, and the page only mounts this on da).
import { useState } from "react";
import { BbrKilde, HentFraBbr } from "@/components/HentFraBbr";
import type { BbrData } from "@/lib/bbr";
import { arealForskel, parseDanskTal } from "@/lib/bolig-areal";
import { formatNumber } from "@/lib/format";

const tal = (n: number, decimaler = 0) => formatNumber(n, "da", { maximumFractionDigits: decimaler });

export default function BoligOpslag() {
  const [bbr, setBbr] = useState<BbrData | null>(null);
  const [egetMaal, setEgetMaal] = useState("");

  const forskel = arealForskel(parseDanskTal(egetMaal), bbr?.boligareal ?? null);

  const fakta: { label: string; vaerdi: string }[] = [
    { label: "Boligareal", vaerdi: bbr?.boligareal ? `${tal(bbr.boligareal)} m²` : "–" },
    {
      label: "Grundareal (matrikel)",
      vaerdi: bbr?.grundareal ? `${tal(bbr.grundareal)} m²` : bbr?.lejlighed ? "Fælles" : "–",
    },
    { label: "Værelser", vaerdi: bbr?.vaerelser ? String(bbr.vaerelser) : "–" },
    {
      label: "Byggeår",
      vaerdi: bbr?.opfoerelsesaar ? String(bbr.opfoerelsesaar) : "–",
    },
  ];

  return (
    <section aria-labelledby="bolig-opslag-titel" className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-8">
      <h2 id="bolig-opslag-titel" className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Slå din bolig op
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Se det areal, der er registreret i BBR, og sammenlign med dine egne mål.
      </p>

      <HentFraBbr
        beregner="kvadratmeter"
        titel="Hent fra BBR"
        beskrivelse="Vælg en adresse. For lejligheder skal du vælge den konkrete etage og dør."
        onData={setBbr}
      />

      {/* The fact grid is always rendered (with dashes) so the page does not jump when data arrives. */}
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {fakta.map((f) => (
          <div key={f.label} className="min-w-0 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{f.label}</dt>
            <dd className="mt-1 break-words text-lg font-semibold text-gray-900 dark:text-white">{f.vaerdi}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 min-h-[3rem] text-xs leading-6 text-gray-500 dark:text-gray-400">
        {bbr ? (
          <>
            <BbrKilde />{" "}
            {bbr.anvendelse ? `${bbr.anvendelse}. ` : ""}
            {bbr.ombygningsaar ? `Om- eller tilbygget ${bbr.ombygningsaar}.` : ""}
          </>
        ) : null}
      </p>

      <div className="mt-4">
        <label htmlFor="eget-maal" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Dit eget mål af boligen (m²)
        </label>
        <div className="relative max-w-xs">
          <input
            id="eget-maal"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={egetMaal}
            onChange={(e) => setEgetMaal(e.target.value)}
            placeholder="Fx 120"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
        </div>
        <p aria-live="polite" className="mt-2 min-h-[5rem] text-sm sm:min-h-[2.5rem] text-gray-700 dark:text-gray-300">
          {forskel
            ? Math.abs(forskel.m2) < 0.5
              ? "Dit mål svarer til BBR's boligareal."
              : `Dit mål er ${tal(Math.abs(forskel.m2), 1)} m² (${tal(Math.abs(forskel.procent), 1)} %) ${
                  forskel.m2 > 0 ? "større" : "mindre"
                } end BBR's boligareal. BBR måler til ydersiden af ydervæggene, så indvendige mål er typisk mindre.`
            : bbr?.boligareal
              ? "Skriv dit eget mål for at se forskellen."
              : ""}
        </p>
      </div>
    </section>
  );
}
