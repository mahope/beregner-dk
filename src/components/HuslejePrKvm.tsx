"use client";

// Rent per m² on /husleje. The area can be filled from BBR (Danish locale only) and always edited.
import { useState } from "react";
import { BbrKilde, HentFraBbr } from "@/components/HentFraBbr";
import { huslejePrM2, parseDanskTal } from "@/lib/bolig-areal";
import { formatNumber } from "@/lib/format";

const kr = (n: number) => `${formatNumber(n, "da", { maximumFractionDigits: 0 })} kr.`;

export default function HuslejePrKvm() {
  const [husleje, setHusleje] = useState("");
  const [areal, setAreal] = useState("");
  const [arealFraBbr, setArealFraBbr] = useState(false);

  const resultat = huslejePrM2(parseDanskTal(husleje), parseDanskTal(areal));

  return (
    <section aria-labelledby="husleje-pr-kvm-titel" className="mb-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800 md:p-8">
      <h2 id="husleje-pr-kvm-titel" className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        Husleje pr. m²
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        Regn din husleje om til pris pr. kvadratmeter, så du kan sammenligne boliger af forskellig størrelse.
      </p>

      <HentFraBbr
        beregner="husleje"
        beskrivelse="Skriv adressen, så udfylder vi boligens areal fra BBR. Vælg den konkrete etage og dør, hvis du bor i lejlighed."
        onData={(data) => {
          if (!data.boligareal) return;
          setAreal(String(Math.round(data.boligareal)));
          setArealFraBbr(true);
        }}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="husleje-maaned" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Husleje pr. måned
          </label>
          <div className="relative">
            <input
              id="husleje-maaned"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={husleje}
              onChange={(e) => setHusleje(e.target.value)}
              placeholder="Fx 9.000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">kr</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Uden a conto varme, vand og el.</p>
        </div>
        <div className="min-w-0">
          <label htmlFor="husleje-areal" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Boligens areal
            {arealFraBbr && <BbrKilde />}
          </label>
          <div className="relative">
            <input
              id="husleje-areal"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={areal}
              onChange={(e) => {
                setAreal(e.target.value);
                setArealFraBbr(false);
              }}
              placeholder="Fx 65"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
          </div>
        </div>
      </div>

      <div aria-live="polite" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{resultat ? kr(resultat.maaned) : "–"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">pr. m² om måneden</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{resultat ? kr(resultat.aar) : "–"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">pr. m² om året</p>
        </div>
      </div>
    </section>
  );
}
