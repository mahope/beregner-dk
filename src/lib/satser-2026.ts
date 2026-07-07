/**
 * Danish 2026 tax and benefit rates — single source of truth.
 *
 * Every calculator that needs a 2026 rate should import it from here instead
 * of redeclaring a local constant, so the figures can never drift apart
 * between calculators, prose and blog articles again.
 *
 * Verified against the official sources noted per field (skm.dk / skat.dk).
 * When SKAT publishes new numbers, update them HERE only.
 *
 * Rates are decimals (0.08 = 8 %); amounts are DKK per year unless noted;
 * bracket thresholds are measured AFTER AM-bidrag.
 */
export const SATSER_2026 = {
  // Arbejdsmarkedsbidrag
  amBidrag: 0.08,

  // Statslige indkomstskatter (personskattereform 2026, kilde: skm.dk)
  bundskat: 0.1201, // 12,01 %
  mellemskat: 0.075, // 7,5 % over grænsen
  mellemskatGraense: 641200,
  topskat: 0.075, // 7,5 % over grænsen
  topskatGraense: 777900,
  topTopskat: 0.05, // 5 % over grænsen
  topTopskatGraense: 2592700,

  // Fradrag (kilde: skm.dk / skat.dk)
  personfradrag: 54100,
  beskaeftigelsesfradragPct: 0.1275, // 12,75 % af arbejdsindkomst efter AM
  beskaeftigelsesfradragMax: 63300,

  // Gennemsnitlige kommunale satser
  kommuneskatSnit: 0.2507, // 25,07 %
  kirkeskatSnit: 0.0068, // 0,68 %

  // Aktieindkomst (kilde: skm.dk / skat.dk)
  aktieProgressionsgraense: 79400,
  aktieSatsLav: 0.27, // 27 % under grænsen
  aktieSatsHoej: 0.42, // 42 % over grænsen
  askLoft: 174200, // maks. indskud på aktiesparekonto
  askSats: 0.17, // 17 % lagerbeskatning

  // Arveafgift / boafgift (kilde: skm.dk)
  arveBundfradrag: 392300, // pr. bo
  boafgift: 0.15, // 15 %
  tillaegsboafgift: 0.25, // 25 % (søskende m.fl.)

  // Kørselsfradrag / befordringsfradrag (daglige tur-retur-km, kilde: skat.dk)
  koerselBundgraense: 24, // ingen fradrag for de første 24 km/dag
  koerselHoejGraense: 120, // høj sats op til 120 km/dag
  koerselSatsLav: 2.28, // kr./km for 25-120 km
  koerselSatsHoej: 1.14, // kr./km over 120 km

  // Rentefradrag (skattemæssig fradragsværdi)
  rentefradragVaerdi: 0.256, // 25,6 % under grænsen
  rentefradragVaerdiHoej: 0.336, // 33,6 % for negativ kapitalindkomst over grænsen

  // Pension (kilde: skat.dk)
  ratepensionMax: 68700, // privat ratepension, fuldt fradrag
  aldersopsparingMax: 9900, // > 7 år til folkepensionsalder
} as const;

export type Satser2026 = typeof SATSER_2026;
