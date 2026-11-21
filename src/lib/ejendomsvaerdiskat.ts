/**
 * Ejendomsskatten efter boligskattereformen (2024).
 *
 * Kilde: skm.dk, info.skat.dk, vurderingsportalen.dk.
 *
 * Satsene lå tidligere som et konstant-objekt inde i
 * `src/components/EjendomsvaerdiskatBeregner.tsx`, og `/ejendomsvaerdiskat`s
 * brødtekst skrev «5,1‰», «9.007.000 kr» og regnestykket
 * «3.000.000 × 80% × 5,1‰ = 12.240 kr/år» med hånden. Tallene var rigtige, men
 * de hang ikke ved satsen: en satsændring ville have ændret beregneren og ladt
 * eksemplet stå. Derfor ligger både matematikken og eksemplet her, og siden
 * læser dem herfra — `regnestykker`-porten tæller beløb i side-tekst, så et
 * håndskrevet beløb er rødt med det samme.
 */

/** Satserne for 2026-2027. */
export const EJENDOMSVAERDISKAT = {
  /** 5,1‰ (0,51 %) af beskatningsgrundlaget op til progressionsgrænsen. */
  lavSats: 0.0051,
  /** 14‰ (1,4 %) af beskatningsgrundlaget over progressionsgrænsen. */
  hoejSats: 0.014,
  /** 9.007.000 kr i beskatningsgrundlag (2026-2027). */
  progressionsgraense: 9007000,
  /** 20 % forsigtighedsfradrag, så der betales skat af 80 %. */
  forsigtighedsfradrag: 0.2,
} as const;


/** Andelen af værdien, der betales skat af: 80 %, fordi fradraget er 20 %. */
export const BESKATTET_ANDEL = 1 - EJENDOMSVAERDISKAT.forsigtighedsfradrag;

/** Grundskyldspromiller for de største kommuner (2024-2028). */
export interface KommunePromille {
  navn: string;
  promille: number;
}

export const GRUNDSKYLD_KOMMUNER: Record<string, KommunePromille> = {
  koebenhavn: { navn: "København", promille: 5.1 },
  frederiksberg: { navn: "Frederiksberg", promille: 3.1 },
  aarhus: { navn: "Aarhus", promille: 6.0 },
  aalborg: { navn: "Aalborg", promille: 7.4 },
  odense: { navn: "Odense", promille: 5.7 },
  vejle: { navn: "Vejle", promille: 10.5 },
  roskilde: { navn: "Roskilde", promille: 7.4 },
  kolding: { navn: "Kolding", promille: 11.1 },
  helsingoer: { navn: "Helsingør", promille: 9.5 },
  silkeborg: { navn: "Silkeborg", promille: 11.0 },
  herning: { navn: "Herning", promille: 9.9 },
  horsens: { navn: "Horsens", promille: 8.7 },
  randers: { navn: "Randers", promille: 13.9 },
  esbjerg: { navn: "Esbjerg", promille: 9.9 },
  gentofte: { navn: "Gentofte", promille: 5.1 },
  gladsaxe: { navn: "Gladsaxe", promille: 5.9 },
  lyngby: { navn: "Lyngby-Taarbæk", promille: 6.7 },
  hvidovre: { navn: "Hvidovre", promille: 6.5 },
  ballerup: { navn: "Ballrup", promille: 8.3 },
  hilleroed: { navn: "Hillerød", promille: 6.6 },
  koege: { navn: "Køge", promille: 5.3 },
  holbaek: { navn: "Holbæk", promille: 8.1 },
  naestved: { navn: "Næstved", promille: 9.8 },
  slagelse: { navn: "Slagelse", promille: 11.1 },
  viborg: { navn: "Viborg", promille: 11.5 },
  fredericia: { navn: "Fredericia", promille: 13.0 },
  greve: { navn: "Greve", promille: 5.5 },
  rudersdal: { navn: "Rudersdal", promille: 9.6 },
  svendborg: { navn: "Svendborg", promille: 8.8 },
  bornholm: { navn: "Bornholm", promille: 10.7 },
};

/** Promillen for en kommune. `custom` er brugerens egen værdi. */
export function grundskyldPromilleFor(
  kommune: string,
  customPromille: number,
  fallback = 6.0,
): number {
  if (kommune === "custom") return customPromille;
  return GRUNDSKYLD_KOMMUNER[kommune]?.promille ?? fallback;
}

export interface EjendomsvaerdiskatInput {
  /** Vurderet ejendomsværdi i kroner. */
  ejendomsvaerdi: number;
  /** Grundværdi i kroner. */
  grundvaerdi: number;
  /** Kommunens grundskyldspromille. */
  grundskyldPromille: number;
}

export interface EjendomsvaerdiskatResultat {
  /** 80 % af ejendomsværdien. */
  beskatningsgrundlag: number;
  ejendomsvaerdiskat: number;
  /** 80 % af grundværdien. */
  grundvaerdiBeskatning: number;
  grundskyld: number;
  samlet: number;
  maanedligt: number;
  /** Sandt når beskatningsgrundlaget overstiger progressionsgrænsen. */
  overProgressionsgraensen: boolean;
}

/**
 * Ejendomsværdiskat + grundskyld for ét år, i hele kroner.
 *
 * Fradraget er 20 %, så beskatningsgrundlaget er 80 % af værdien. Over
 * progressionsgrænsen betales 5,1‰ af den del under grænsen og 14‰ af resten —
 * ikke 14‰ af hele beløbet.
 */
export function beregnEjendomsvaerdiskat(
  input: EjendomsvaerdiskatInput,
): EjendomsvaerdiskatResultat {
  const { ejendomsvaerdi, grundvaerdi, grundskyldPromille } = input;
  const vurderingsgrundlag = BESKATTET_ANDEL;

  const beskatningsgrundlag = ejendomsvaerdi * vurderingsgrundlag;
  const overProgressionsgraensen =
    beskatningsgrundlag > EJENDOMSVAERDISKAT.progressionsgraense;
  const under = Math.min(
    beskatningsgrundlag,
    EJENDOMSVAERDISKAT.progressionsgraense,
  );
  const over = Math.max(0, beskatningsgrundlag - under);
  const ejendomsvaerdiskat =
    under * EJENDOMSVAERDISKAT.lavSats + over * EJENDOMSVAERDISKAT.hoejSats;

  const grundvaerdiBeskatning = grundvaerdi * vurderingsgrundlag;
  const grundskyld = grundvaerdiBeskatning * (grundskyldPromille / 1000);
  const samlet = ejendomsvaerdiskat + grundskyld;

  return {
    beskatningsgrundlag: Math.round(beskatningsgrundlag),
    ejendomsvaerdiskat: Math.round(ejendomsvaerdiskat),
    grundvaerdiBeskatning: Math.round(grundvaerdiBeskatning),
    grundskyld: Math.round(grundskyld),
    samlet: Math.round(samlet),
    maanedligt: Math.round(samlet / 12),
    overProgressionsgraensen,
  };
}

// ─── Sidens eksempel ────────────────────────────────────────────────────────
//
// København, ejendomsværdi 3.000.000 kr og grundværdi 1.000.000 kr. Både
// regnestykkerne og de danske beløb dannes her, så de ikke kan glide fra
// satsen. Siden renderer `EKSEMPEL_TEKST` og intet håndskrevet tal.

/** Indgangene i eksemplet, så de kan læses både i tekst og i test. */
export const EKSEMPEL_INPUT: EjendomsvaerdiskatInput = {
  ejendomsvaerdi: 3000000,
  grundvaerdi: 1000000,
  grundskyldPromille: GRUNDSKYLD_KOMMUNER.koebenhavn.promille,
};

export const EKSEMPEL = beregnEjendomsvaerdiskat(EKSEMPEL_INPUT);

const helt = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 0 });
const sats = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 });

/** Et helt kronetal som «3.000.000» — samme skrivemåde som resten af siden. */
export function kr(tal: number): string {
  return helt.format(tal);
}

/**
 * 5,1 → «5,1» (så sætteren kan skrive «5,1&permil;»).
 *
 * `minDecimaler` er 1 i tabellen over kommuner, fordi dansk skrivemåde skriver
 * «6,0» og ikke «6» — de to tal må se ens ud, som de gjorde da de var
 * håndskrevne.
 */
export function satsTilPromille(promille: number, minDecimaler = 0): string {
  return new Intl.NumberFormat("da-DK", {
    minimumFractionDigits: minDecimaler,
    maximumFractionDigits: 1,
  }).format(promille);
}

/** 0,0051 → «0,51», altså den procentværdi der står i parentes ved satsen. */
export function satsTilProcent(andel: number): string {
  return new Intl.NumberFormat("da-DK", { maximumFractionDigits: 2 }).format(
    andel * 100,
  );
}

/** De tre regnestykker + indgangssætningen, med beløb fra `EKSEMPEL`. */
export const EKSEMPEL_TEKST = {
  intro: `En bolig i ${GRUNDSKYLD_KOMMUNER.koebenhavn.navn} med ejendomsværdi ${kr(EKSEMPEL_INPUT.ejendomsvaerdi)} kr og grundværdi ${kr(EKSEMPEL_INPUT.grundvaerdi)} kr:`,
  ejendomsvaerdiskat: `${kr(EKSEMPEL_INPUT.ejendomsvaerdi)} × ${helt.format(BESKATTET_ANDEL * 100)} % × ${satsTilPromille(EJENDOMSVAERDISKAT.lavSats * 1000)}‰ = ${kr(EKSEMPEL.ejendomsvaerdiskat)} kr/år`,
  grundskyld: `${kr(EKSEMPEL_INPUT.grundvaerdi)} × ${helt.format(BESKATTET_ANDEL * 100)} % × ${satsTilPromille(EKSEMPEL_INPUT.grundskyldPromille)}‰ = ${kr(EKSEMPEL.grundskyld)} kr/år`,
  samlet: `${kr(EKSEMPEL.samlet)} kr/år (${kr(EKSEMPEL.maanedligt)} kr/måned)`,
};
