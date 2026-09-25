import { formatKlokkeslaet, KILDER, type Tariffer } from "@/lib/energi/elpriser";

type Props = {
  hentet: string;
  tariffer?: Tariffer;
  className?: string;
};

/** Source attribution with fetch time for live electricity prices. */
export default function EnergiKilde({ hentet, tariffer, className = "" }: Props) {
  const link = "underline hover:text-blue-700 dark:hover:text-blue-400";
  return (
    <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
      Priser hentet kl. {formatKlokkeslaet(hentet)}. Kilde: spotpriser fra{" "}
      <a href={KILDER.energidataservice} className={link} target="_blank" rel="noopener noreferrer">
        Energi Data Service (Energinet)
      </a>
      {tariffer?.kilde === "live" ? (
        <>
          , nettarif ({tariffer.netselskab}, C-kunde) og Energinets tariffer fra{" "}
          <a href={KILDER.datahubPricelist} className={link} target="_blank" rel="noopener noreferrer">
            DatahubPricelist
          </a>
        </>
      ) : (
        <>, nettarif er en standardværdi (gennemsnitlig C-kunde)</>
      )}
      . Elafgift 0,8 øre/kWh i 2026 jf.{" "}
      <a href={KILDER.elafgift} className={link} target="_blank" rel="noopener noreferrer">
        Skattestyrelsen
      </a>
      . Elselskabets eget tillæg er ikke med.
    </p>
  );
}
