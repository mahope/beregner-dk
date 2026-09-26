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
}

const MS_PER_DAG = 1000 * 60 * 60 * 24;

/**
 * Læser "YYYY-MM-DD" som dato **i lokal tid**. `new Date("1990-03-15")`
 * tolteres som UTC-midnat, og `.getDate()` læser derefter den lokale dag — så
 * en besøgende i en tidszone bag UTC fik dagen i går. Att bygge datoen af
 * kalenderfelterne selv fjerner afhængigheden af TZ, og gør at serverrenderet
 * eksempeltabel og klientværktøjet viser præcis det samme.
 */
function parseDato(input: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!match) return null;
  const aar = Number(match[1]);
  const maaned = Number(match[2]);
  const dag = Number(match[3]);
  if (maaned < 1 || maaned > 12 || dag < 1 || dag > 31) return null;
  const dato = new Date(aar, maaned - 1, dag);
  // F.eks. 31. februar ruller til 1. marts — afvis det frem for at acceptere.
  if (
    dato.getFullYear() !== aar ||
    dato.getMonth() !== maaned - 1 ||
    dato.getDate() !== dag
  ) {
    return null;
  }
  return dato;
}

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
  const foedselsDate = parseDato(input.foedselsdato);
  const beregningsDate = parseDato(input.beregningsdato);
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
  };
}
