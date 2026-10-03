"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency } from "@/lib/format";
import { SU_2026 } from "@/lib/satser-2026";
import {
  beregnIndtaegtsgraense,
  type FribeloeStatus,
  type IndtaegtsgraenseInput,
} from "@/lib/su-indtaegtsgraense";

/**
 * "Hvor meget må jeg tjene ved siden af min SU?" — the income ceiling, as a
 * tool rather than a table. The rates on /su were already listed; what was
 * missing was the answer, which is a sum over 12 months plus a gross figure
 * a student can compare with a payslip. All numbers come from
 * {@link beregnIndtaegtsgraense}, which reads the same `SU_2026.freeAllowance`
 * the table and the FAQ read.
 */
export default function SuIndtaegtsgraense() {
  const { locale } = useLocale();
  const [uddannelse, setUddannelse] = useState<"videregaaende" | "ungdom">("videregaaende");
  const [suMaaneder, setSuMaaneder] = useState(12);
  const [statusUdenSu, setStatusUdenSu] = useState<"mellemste" | "hoejeste">("mellemste");
  const [barnUnder18, setBarnUnder18] = useState(0);
  const [handicaptillaeg, setHandicaptillaeg] = useState(false);

  const input: IndtaegtsgraenseInput = useMemo(
    () => ({ education: uddannelse, suMonths: suMaaneder, statusUdenSu, childUnder18: barnUnder18, handicaptillaeg }),
    [uddannelse, suMaaneder, statusUdenSu, barnUnder18, handicaptillaeg],
  );
  const result = useMemo(() => beregnIndtaegtsgraense(input), [input]);

  const kr = (beloeb: number) =>
    formatCurrency(beloeb, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const feltKlasse =
    "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
  const labelKlasse = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

  return (
    <section aria-labelledby="su-indtaegtsgraense-overskrift" className="mt-12">
      <h2 id="su-indtaegtsgraense-overskrift" className="text-2xl font-bold mb-2">
        Hvor meget må jeg tjene ved siden af min SU?
      </h2>
      <p className="text-gray-600 mb-6 dark:text-gray-400">
        Fribeløbet er din egen indtægtsgrænse. Årsfribeløbet er de 12 månedsfribeløb
        lagt sammen, og du skal bare holde hele årets indkomst inden for det — så
        en måned med meget og en måned med intet kan godt gå op i mellem.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="su-graense-uddannelse" className={labelKlasse}>
            Jeg går på
          </label>
          <select
            id="su-graense-uddannelse"
            value={uddannelse}
            onChange={(event) =>
              setUddannelse(event.target.value === "ungdom" ? "ungdom" : "videregaaende")
            }
            className={feltKlasse}
          >
            <option value="videregaaende">Videregående uddannelse</option>
            <option value="ungdom">Ungdomsuddannelse</option>
          </select>
        </div>

        <div>
          <label htmlFor="su-graense-maaneder" className={labelKlasse}>
            Antal måneder med SU eller slutlån i 2026
          </label>
          <select
            id="su-graense-maaneder"
            value={suMaaneder}
            onChange={(event) => setSuMaaneder(Number(event.target.value))}
            className={feltKlasse}
          >
            {[12, 11, 10, 9, 8, 6, 4, 2, 1, 0].map((maaneder) => (
              <option key={maaneder} value={maaneder}>
                {maaneder} {maaneder === 1 ? "måned" : "måneder"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="su-graense-status" className={labelKlasse}>
            I de {12 - suMaaneder} øvrige måneder er jeg
          </label>
          <select
            id="su-graense-status"
            value={statusUdenSu}
            onChange={(event) =>
              setStatusUdenSu(event.target.value === "hoejeste" ? "hoejeste" : "mellemste")
            }
            className={feltKlasse}
            disabled={suMaaneder === 12}
          >
            <option value="mellemste">
              Indskrevet, men uden SU (orlov, studieinaktiv, ulønnet praktik)
            </option>
            <option value="hoejeste">Ikke under uddannelse</option>
          </select>
        </div>

        <div>
          <label htmlFor="su-graense-born" className={labelKlasse}>
            Børn under 18 år
          </label>
          <select
            id="su-graense-born"
            value={barnUnder18}
            onChange={(event) => setBarnUnder18(Number(event.target.value))}
            className={feltKlasse}
          >
            {[0, 1, 2, 3, 4].map((antal) => (
              <option key={antal} value={antal}>
                {antal}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Hvert barn hæver årsfribeløbet med {kr(SU_2026.freeAllowance.childUnder18Annual)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-start gap-2" htmlFor="su-graense-handicap">
          <input
            type="checkbox"
            id="su-graense-handicap"
            checked={handicaptillaeg}
            onChange={(event) => setHandicaptillaeg(event.target.checked)}
            className="mt-1 w-4 h-4"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Jeg har handicaptillæg, så mine SU-måneder bruger det nedsatte fribeløb på{" "}
            {kr(SU_2026.freeAllowance.disabilityMonth)}
          </span>
        </label>
      </div>

      {result && (
        <div
          aria-live="polite"
          className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950"
        >
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Du må højst tjene{" "}
            <strong className="text-lg">{kr(result.aarsfribeloeb)}</strong> i løbet af 2026
            ved siden af din SU, efter AM-bidrag.
          </p>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-blue-900 dark:text-blue-100">
            <div className="flex justify-between gap-4">
              <dt>Det svarer til pr. måned</dt>
              <dd className="font-medium">{kr(result.aarsGennemsnitPrMaaned)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Før AM-bidrag pr. måned</dt>
              <dd className="font-medium">{kr(result.maanedBrutto)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Før AM-bidrag for hele året</dt>
              <dd className="font-medium">{kr(result.aarsBrutto)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Fribeløb i dine SU-måneder</dt>
              <dd className="font-medium">{kr(result.maanedMedSu)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Fribeløb i de øvrige måneder</dt>
              <dd className="font-medium">{kr(result.maanedUdenSu)}</dd>
            </div>
            {barnUnder18 > 0 && (
              <div className="flex justify-between gap-4">
                <dt>Tillæg for børn under 18</dt>
                <dd className="font-medium">
                  +{kr(result.barnUnder18 * barnUnder18)}
                </dd>
              </div>
            )}
          </dl>
          <p className="mt-4 text-sm text-blue-900 dark:text-blue-100">
            {result.maanederUdenSu === 0 ? (
              <>
                Alle 12 måneder bruger den samme sats på {kr(result.maanedMedSu)}, så hele
                årets grænse er det tal gang 12.
              </>
            ) : (
              <>
                {result.maanederUdenSu} af de 12 måneder er uden SU og bruger den højere sats
                på {kr(result.maanedUdenSu)}, så grænsen varierer med din situation måned for
                måned.
              </>
            )}{" "}
            Overstiger årets indkomst grænsen, kan en del af din SU og dit SU-lån blive
            nedsat eller tilbagebetalt — det endelige beløb beregnes af Udbetaling Danmark.
          </p>
          <p className="mt-2 text-xs text-blue-800 dark:text-blue-200">
            Satserne er fra su.dk og gælder for 2026. De er før skat, men efter
            AM-bidrag, så fribeløbet ikke kan læses som et løntal.
          </p>
        </div>
      )}
    </section>
  );
}
