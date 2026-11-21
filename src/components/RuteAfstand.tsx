"use client";

// "Find the distance from two addresses" for Danish calculators. Addresses are resolved in the
// browser via Adressevælger; only the coordinates are sent to /api/rute, which asks the
// OpenStreetMap-based routing service for the shortest driving route. Nothing is stored.
import { useCallback, useEffect, useRef, useState } from "react";
import { AdresseFelt, type ValgtAdresse } from "@/components/AdresseFelt";
import { type AdressePunkt, hentAdressePunkt } from "@/lib/adresse";

type RuteSvar = {
  km: number;
  faerge: boolean | null;
  betalingsbro: boolean | null;
  kmMedFaerge: number | null;
  kilde: "valhalla" | "osrm";
};

type Tilstand =
  | { type: "tom" }
  | { type: "henter" }
  | { type: "fejl"; besked: string }
  | { type: "ok"; rute: RuteSvar };

type Props = {
  /** Called with the one-way driving distance in km once a route is found. */
  onAfstand: (kmEnVej: number) => void;
  fraLabel?: string;
  tilLabel?: string;
};

const fmtKm = (km: number) => km.toLocaleString("da-DK", { maximumFractionDigits: km < 10 ? 1 : 0 });

export function RuteAfstand({ onAfstand, fraLabel = "Hjemadresse", tilLabel = "Arbejdsadresse" }: Props) {
  const [fra, setFra] = useState<ValgtAdresse | null>(null);
  const [til, setTil] = useState<ValgtAdresse | null>(null);
  const [tilstand, setTilstand] = useState<Tilstand>({ type: "tom" });
  const onAfstandRef = useRef(onAfstand);
  onAfstandRef.current = onAfstand;

  const vaelgFra = useCallback((a: ValgtAdresse) => setFra(a), []);
  const vaelgTil = useCallback((a: ValgtAdresse) => setTil(a), []);
  const rydFra = useCallback(() => setFra(null), []);
  const rydTil = useCallback(() => setTil(null), []);

  useEffect(() => {
    if (!fra || !til) {
      setTilstand({ type: "tom" });
      return;
    }
    const ctrl = new AbortController();
    let ryddetOp = false;
    const timer = setTimeout(() => ctrl.abort(), 20000);
    setTilstand({ type: "henter" });
    (async () => {
      try {
        const [a, b] = await Promise.all([
          hentAdressePunkt(fra, { signal: ctrl.signal }),
          hentAdressePunkt(til, { signal: ctrl.signal }),
        ]);
        if (!a || !b) throw new Error("adresse uden koordinater");
        const k = (p: AdressePunkt) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
        const res = await fetch("/api/rute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fra: k(a), til: k(b) }),
          signal: ctrl.signal,
        });
        const data = (await res.json().catch(() => null)) as (RuteSvar & { error?: string }) | null;
        if (!res.ok || !data || typeof data.km !== "number") {
          throw new Error(data?.error || "Afstanden kunne ikke beregnes lige nu.");
        }
        if (ryddetOp) return;
        setTilstand({ type: "ok", rute: data });
        onAfstandRef.current(data.km);
      } catch (e) {
        if (ryddetOp) return; // addresses changed; a newer lookup is running
        const besked = e instanceof Error && e.message.startsWith("Afstanden") ? e.message : "Afstanden kunne ikke beregnes lige nu.";
        setTilstand({ type: "fejl", besked: `${besked} Indtast km direkte i feltet herunder.` });
      } finally {
        clearTimeout(timer);
      }
    })();
    return () => {
      ryddetOp = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [fra, til]);

  return (
    <fieldset className="mb-4 rounded-xl border border-gray-200 p-4 dark:border-gray-600">
      <legend className="px-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Find afstanden ud fra adresser</legend>
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <AdresseFelt
          label={fraLabel}
          placeholder="Fx Rådhuspladsen 1, 1550 København V"
          husnummerNok
          onValg={vaelgFra}
          onRyd={rydFra}
        />
        <AdresseFelt
          label={tilLabel}
          placeholder="Fx Rådhuspladsen 2, 8000 Aarhus C"
          husnummerNok
          onValg={vaelgTil}
          onRyd={rydTil}
        />
      </div>

      <div className="min-h-[3rem] text-sm" aria-live="polite">
        {tilstand.type === "tom" && (
          <p className="text-gray-500 dark:text-gray-400">
            Vælg begge adresser, så udfylder vi km ud fra den korteste køretur. Du kan altid rette tallet.
          </p>
        )}
        {tilstand.type === "henter" && <p className="text-gray-500 dark:text-gray-400">Beregner afstand …</p>}
        {tilstand.type === "fejl" && <p className="text-amber-700 dark:text-amber-400">{tilstand.besked}</p>}
        {tilstand.type === "ok" && (
          <div className="space-y-1">
            <p className="text-gray-800 dark:text-gray-100">
              Ca. <strong>{fmtKm(tilstand.rute.km)} km hver vej</strong> ({fmtKm(tilstand.rute.km * 2)} km tur/retur) — udfyldt
              herunder.
            </p>
            {tilstand.rute.kmMedFaerge !== null && (
              <p className="text-gray-600 dark:text-gray-300">
                Med færge er den korteste rute ca. {fmtKm(tilstand.rute.kmMedFaerge)} km. Ret km, hvis du normalt sejler.
              </p>
            )}
            {tilstand.rute.faerge && tilstand.rute.kmMedFaerge === null && (
              <p className="text-gray-600 dark:text-gray-300">Ruten indeholder en færgeoverfart.</p>
            )}
            {tilstand.rute.betalingsbro && (
              <p className="text-gray-600 dark:text-gray-300">
                Ruten ser ud til at krydse en betalingsbro. Kører du over Storebælt eller Øresund, så udfyld brofradraget.
              </p>
            )}
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Skat bruger den normale (korteste) transportvej og kan vurdere ruten anderledes. Adresser: Adressevælger
        (Klimadatastyrelsen). Rute: {tilstand.type === "ok" && tilstand.rute.kilde === "osrm" ? "OSRM" : "Valhalla"} via
        FOSSGIS. Kortdata ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          OpenStreetMap-bidragydere
        </a>{" "}
        (ODbL),{" "}
        <a
          href="https://www.openstreetmap.org/fixthemap"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          ret fejl i kortet
        </a>
        .
      </p>
    </fieldset>
  );
}
