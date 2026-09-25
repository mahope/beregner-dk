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

  // Gennemsnitlige kommunale satser (kilde: svmn.dk, 2026-gennemsnit)
  kommuneskatSnit: 0.25049, // 25,049 %
  kirkeskatSnit: 0.00639, // 0,639 %

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
  koerselSatsLav: 3.17, // kr./km for 25-120 km (2026: 3,17 kr/km, kilde: skat.dk)
  koerselSatsHoej: 1.59, // kr./km over 120 km (2026: 1,59 kr/km, kilde: skat.dk)
  koerselYderkommuneSats: 3.51, // forhøjet sats for yderkommuner og visse småøer (2026)
  koerselEkstraFradragMax: 30800, // maks. ekstra befordringsfradrag (2026)
  koerselEkstraIndkomstGraense: 391500, // indkomstgrænse for ekstra fradrag, før AM-bidrag (2026)
  koerselEkstraAftrapningFra: 341500, // ekstra fradrag aftrappes for indkomst herover (2026, JV C.A.4.3.3.1.3)
  koerselEkstraPct: 0.64, // ekstra fradrag = 64 % af det normale kørselsfradrag (LL § 9 C, stk. 4)
  koerselEkstraAftrapningPct: 0.0128, // procentsatsen nedsættes 1,28 pct.-point pr. 1.000 kr. over grænsen
  koerselEkstraMaxAftrapning: 0.02, // maksimumbeløbet nedsættes 2 % pr. 1.000 kr. over grænsen
  koerselBroStorebaelt: 110, // Storebæltsbroen, bil/motorcykel, pr. tur (2026)
  koerselBroStorebaeltOff: 15, // Storebæltsbroen, tog/offentlig, pr. tur (2026)
  koerselBroOeresund: 50, // Øresundsbroen, bil/motorcykel, pr. tur (2026)
  koerselBroOeresundOff: 8, // Øresundsbroen, tog/offentlig, pr. tur (2026)

  // Rentefradrag (skattemæssig fradragsværdi)
  rentefradragVaerdi: 0.256, // 25,6 % under grænsen
  rentefradragVaerdiHoej: 0.336, // 33,6 % for negativ kapitalindkomst over grænsen

  // Pension (kilde: skat.dk)
  ratepensionMax: 68700, // privat ratepension, fuldt fradrag
  aldersopsparingMax: 9900, // > 7 år til folkepensionsalder
} as const;

export const BARSEL_2026 = {
  source:
    "https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel",
  verifiedAt: "2026-09-23",
  maxWeeklyRate: 5085,
  maxHourlyRate: 137.43,
  fullTimeHours: 37,
  maxHoursForEstimate: 40,
  defaultWeeks: 24,
  maxWeeks: 52,
  afterBirthWeeks: 24,
  motherBeforeBirthWeeks: 4,
  motherAtBirthWeeks: 2,
  motherEarlyAfterBirthWeeks: 8,
  motherLateTransferableWeeks: 5,
  fatherAtBirthWeeks: 2,
  firstTenWeeksAfterBirth: 10,
  earmarkedWeeks: 9,
  maxTransferableWeeks: 13,
  applicationDeadlineWeeks: 8,
  applicationProcessingDays: 11,
  earmarkedModelStart: "2. august 2022",
  employmentHours: 160,
  employmentMonths: 4,
  monthlyHoursThreshold: 40,
  monthsWithMonthlyHours: 3,
} as const;

export const SU_2026 = {
  verifiedAt: "2026-09-24",
  sources: {
    homewardVideregaaende:
      "https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-hjemmeboende",
    homewardUngdomsuddannelse:
      "https://www.su.dk/satser/ungdomsuddannelse-satser-for-su-til-hjemmeboende",
    udeboendeVideregaaende:
      "https://www.su.dk/satser/videregaaende-uddannelser-satser-for-su-til-udeboende",
    udeboendeUngdomsuddannelse:
      "https://www.su.dk/satser/ungdomsuddannelse-satser-for-su-til-udeboende",
    freeAllowance:
      "https://www.su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/satser-for-maanedsfribeloeb",
    enhancedFreeAllowance:
      "https://www.su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/om-aarsfribeloeb/forhoejet-aarsfribeloeb",
    parents: "https://www.su.dk/satser/satser-for-stoette-til-foraeldre",
    singleParentEligibility:
      "https://www.su.dk/stoette-til-foraeldre/du-er-forsoerger/enlig-forsoerger",
    parentalIncome:
      "https://www.su.dk/su/om-su-til-videregaaende-uddannelser/dine-foraeldres-indkomst-videregaaende-uddannelse/kun-en-foraelder",
    youthHousing:
      "https://www.su.dk/su/om-su-til-ungdomsuddannelser/bopael-og-su-satser",
    disability: "https://www.su.dk/satser/satser-for-handicaptillaeg",
    disabilityFreeAllowance:
      "https://www.su.dk/handicaptillaeg/dit-fribeloeb-er-nedsat-naar-du-modtager-handicaptillaeg",
    loan: "https://www.su.dk/satser/satser-for-su-laan",
    finalLoan: "https://www.su.dk/su-laan/slutlaan",
    loanInterest:
      "https://www.su.dk/su-laan/naar-du-skal-betale-laan-tilbage/renter-paa-dit-su-laan",
    loanRepayment:
      "https://www.su.dk/su-laan/naar-du-skal-betale-laan-tilbage",
    suKlip:
      "https://www.su.dk/su/om-su-til-videregaaende-uddannelser/su-klippekort-til-videregaaende-uddannelser",
    freeAllowanceCalculator:
      "https://www.su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/beregn-fribeloeb",
  },
  parentalIncomeYear: 2024,
  currentHomewardSchemeStart: "1. juli 2014",
  rules: {
    youthEducationAge: 18,
    youthAwayApprovalMaxAge: 19,
    youthAwayMinimumDistanceKm: 20,
    youthAwayMinimumTravelMinutes: 75,
    youthAwayRequiredPriorMonths: 12,
    minimumLoanAge: 18,
    finalLoanStandardMonths: 12,
    finalLoanExtendedMonths: 24,
  },
  udeboende: 7426,
  homewardBase: 1154,
  homewardMaximum: 3202,
  homewardMaximumSupplement: 2048,
  homewardLegacy: 3692,
  youthLegacy18To19Base: 1643,
  youthAway18To19Base: 4764,
  singleParentSupplement: 7426,
  disabilitySupplement: {
    videregaaende: 10562,
    erhverv: 6624,
  },
  freeAllowance: {
    youthWithSu: 15297,
    videregaaendeWithSu: 20749,
    enrolledWithoutSu: 23598,
    notStudying: 45420,
    disabilityMonth: 3921,
    childUnder18Annual: 34129,
  },
  loan: {
    ordinaryMonthly: 3799,
    parentMonthly: 1900,
    combinedMonthly: 5699,
    finalMonthly: 9801,
    duringStudyRate: 0.04,
    afterGraduationRate: 0.0285,
    repaymentMinYears: 7,
    repaymentMaxYears: 15,
    repaymentFrequencyMonths: 2,
    repaymentFirstBandMaxDebt: 39999,
    repaymentLastBandMinDebt: 180000,
  },
  suKlip: 70,
  suKlipExtraSupportMonths: 12,
} as const;

export const BOLIGSTOETTE_2026 = {
  verifiedAt: "2026-09-24",
  sources: {
    officialRules:
      "https://www.borger.dk/bolig-og-flytning/Boligstoette-oversigt/soeg-boligstoette",
    officialCalculator:
      "https://www.boligstoette.dk/bos-selvbetjening/beregner/basisoplysninger",
    officialFormula:
      "https://www.retsinformation.dk/eli/retsinfo/2026/9156",
    officialRates:
      "https://www.retsinformation.dk/eli/retsinfo/2026/9336",
  },
  maximumMonthly: {
    nonPensioner: {
      noChildren: 1194,
      oneToThreeChildren: 4201,
      fourPlusChildren: 5251,
    },
    newDisabilityPension: {
      noChildren: 4201,
      oneToThreeChildren: 4201,
      fourPlusChildren: 5251,
    },
    oldPension: {
      noChildren: 4969,
      oneToThreeChildren: 4969,
      fourPlusChildren: 6211,
    },
  },
  wealth: {
    considerationRates: {
      tenPercent: 0.1,
      twentyPercent: 0.2,
    },
    nonPensioner: {
      noEffect: 896400,
      tenPercent: 1793000,
    },
    pensioner: {
      noEffect: 1060300,
      tenPercent: 2120800,
    },
  },
  rentExcludes: [
    "el",
    "varme",
    "varmt vand",
    "fællesantenne",
    "telefon, internet eller bredbånd",
    "leje betalt forud",
    "indskud og afdrag på indskud",
    "garage eller carport",
    "møbler i en møbleret bolig",
    "vaskeri",
  ],
} as const;

export type Barsel2026 = typeof BARSEL_2026;
export type Su2026 = typeof SU_2026;
export type Satser2026 = typeof SATSER_2026;
