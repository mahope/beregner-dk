import { parseIsoDato } from "@/lib/lokal-dato";

export interface AlderInput {
  /** "YYYY-MM-DD" */
  foedselsdato: string;
  /** "YYYY-MM-DD" */
  beregningsdato: string;
}

export interface AlderResultat {
  aar: number;
  maaneder: number;
  dage: number;
  totalDage: number;
  totalUger: number;
  totalMaaneder: number;
  totalTimer: number;
  totalMinutter: number;
  dageTilFoedselsdag: number;
  naesteFoedselsdagAlder: number;
  /** Datoen for næste fødselsdag, så værktøjet ikke skal finde den igen. */
  naesteFoedselsdagDato: Date;
}

const MS_PER_DAG = 1000 * 60 * 60 * 24;

/**
 * Alderen mellem to datoer, i hele år, måneder og dage.
 *
 * Månederne og dagene lånes fra den måned, der går umiddelbart forud for
 * beregningsdatoens måned, så en fødselsdato den 31. og en beregningsdato i
 * en kortere måned ikke taber en dag. Totalerne er hele dage mellem datoerne,
 * så de er uafhængige af denne konvention.
 *
 * Fødselsdatoen efter beregningsdatoen giver `null`.
 */
export function beregnAlder(input: AlderInput): AlderResultat | null {
  const foedselsDate = parseIsoDato(input.foedselsdato);
  const beregningsDate = parseIsoDato(input.beregningsdato);
  if (!foedselsDate || !beregningsDate) return null;
  if (foedselsDate.getTime() > beregningsDate.getTime()) return null;

  let aar = beregningsDate.getFullYear() - foedselsDate.getFullYear();
  let maaneder = beregningsDate.getMonth() - foedselsDate.getMonth();
  let dage = beregningsDate.getDate() - foedselsDate.getDate();

  if (dage < 0) {
    maaneder--;
    const sidsteMaaned = new Date(
      beregningsDate.getFullYear(),
      beregningsDate.getMonth(),
      0
    );
    dage += sidsteMaaned.getDate();
  }

  if (maaneder < 0) {
    aar--;
    maaneder += 12;
  }

  const totalDage = Math.floor(
    (beregningsDate.getTime() - foedselsDate.getTime()) / MS_PER_DAG
  );
  const totalTimer = totalDage * 24;

  // Næste fødselsdag er altid næste årsdag, så alderen der er altid ett år
  // mere end den fulde alder, man har nået.
  const naesteFoedselsdag = new Date(
    beregningsDate.getFullYear(),
    foedselsDate.getMonth(),
    foedselsDate.getDate()
  );
  if (naesteFoedselsdag.getTime() <= beregningsDate.getTime()) {
    naesteFoedselsdag.setFullYear(beregningsDate.getFullYear() + 1);
  }

  return {
    aar,
    maaneder,
    dage,
    totalDage,
    totalUger: Math.floor(totalDage / 7),
    totalMaaneder: aar * 12 + maaneder,
    totalTimer,
    totalMinutter: totalTimer * 60,
    dageTilFoedselsdag: Math.floor(
      (naesteFoedselsdag.getTime() - beregningsDate.getTime()) / MS_PER_DAG
    ),
    naesteFoedselsdagAlder: aar + 1,
    naesteFoedselsdagDato: naesteFoedselsdag,
  };
}
