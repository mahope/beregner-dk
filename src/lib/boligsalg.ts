export interface BoligsalgInput {
  salgspris: number;
  maeglerType: "procent" | "fast";
  maeglerProcent: number;
  maeglerFast: number;
  markedsfoering: number;
  energimaerke: number;
  tilstandsrapport: number;
  elRapport: number;
  ejerskifteforsikring: number;
  dataRapport: number;
  istaendsaettelse: number;
  flytning: number;
  advokat: number;
  indfrielseGebyrer: number;
  tinglysningNyBolig: number;
  andre: number;
  nyBoligPris: number;
  tinglysningInkluderet: boolean;
}

export interface BoligsalgResultat {
  samledeOmkostninger: number;
  nettoProvenu: number;
  poster: { navn: string; beloeb: number }[];
  fordelinger: { navn: string; beloeb: number; procent: number }[];
}

/**
 * Salgsprisen i beregnerens standardindstilling. Brødteksten på `/boligsalg`
 * beskriver omkostningerne ved «en bolig til 3 mio. kr.», så prisen skal være
 * den samme i modulet og i teksten — ellers ville siden regne omkostninger ved
 * en anden pris end den, den læser op.
 */
export const BOLIGSALG_STANDARD_SALGSPRIS = 3000000;

const DEFAULT_VALUES: BoligsalgInput = {
  salgspris: BOLIGSALG_STANDARD_SALGSPRIS,
  maeglerType: "procent",
  maeglerProcent: 4,
  maeglerFast: 40000,
  markedsfoering: 10000,
  energimaerke: 7500,
  tilstandsrapport: 6500,
  elRapport: 4000,
  ejerskifteforsikring: 4000,
  dataRapport: 105,
  istaendsaettelse: 20000,
  flytning: 10000,
  advokat: 10000,
  indfrielseGebyrer: 3000,
  tinglysningNyBolig: 0,
  andre: 0,
  nyBoligPris: 0,
  tinglysningInkluderet: false,
};

export function beregnMaegler(input: BoligsalgInput): number {
  if (input.maeglerType === "procent") {
    return (input.maeglerProcent / 100) * input.salgspris;
  }
  return input.maeglerFast;
}

/**
 * Tinglysningens to faste beløb — skoedens 1.850 kr. og pantebrevets 1.825 kr.
 * De lå begge hårdkodet i `beregnTinglysning`, mens beregnerens egen
 * disclaimer skrev dem igen som tekst («0,6% + 1.850 kr (skøde)»): to steder,
 * ingen kilde til hinanden, og de svenske og norske sider får samme danske
 * satser, fordi de deler denne funktion. Derfor er de **eksporterede navngivne
 * konstanter**, så teksten kan læse det beløb, beregningen bruger.
 *
 * Beløbene er et 2026-estimat, ikke en lavest læst sats fra et offentligt
 * register — samme forbehold som resten af modulets omkostninger.
 */
export const TINGLYSNING_SKOEDEBELOB = 1850;
export const TINGLYSNING_PANTEBREVBELOB = 1825;

/**
 * Tinglysningens to procentdele og pantebrevets låneandel, eksporteret af samme
 * grund som de to faste beløb: brødteksten skrev «1,45 % af vurderingssummen»,
 * mens koden ganged med `0,0145 * pris * 0,8` — to steder, ingen kilde til
 * hinanden. Procenttallet er nu samme konstant i beregningen og i teksten, og
 * lånedelen er en del af pantesatsen, ikke en valgfri faktor.
 */
export const TINGLYSNING_SKOEDEPROCENT = 0.006;
export const TINGLYSNING_PANTEBREVPROCENT = 0.0145;
export const TINGLYSNING_PANTEBREVLAANEDEL = 0.8;

function beregnTinglysning(input: BoligsalgInput): number {
  if (!input.tinglysningInkluderet || input.nyBoligPris <= 0) return 0;
  const skoede =
    TINGLYSNING_SKOEDEPROCENT * input.nyBoligPris + TINGLYSNING_SKOEDEBELOB;
  const pantebrev =
    TINGLYSNING_PANTEBREVPROCENT *
    input.nyBoligPris *
    TINGLYSNING_PANTEBREVLAANEDEL +
    TINGLYSNING_PANTEBREVBELOB;
  return Math.round(skoede + pantebrev);
}

export function beregnBoligsalg(input: BoligsalgInput): BoligsalgResultat | null {
  if (input.salgspris <= 0 || isNaN(input.salgspris)) return null;

  const maegler = beregnMaegler(input);
  const tinglysning = beregnTinglysning(input);
  const poster = [
    { navn: "Ejendomsmægler", beloeb: maegler },
    { navn: "Markedsføring", beloeb: input.markedsfoering },
    { navn: "Energimærke", beloeb: input.energimaerke },
    { navn: "Tilstandsrapport", beloeb: input.tilstandsrapport },
    { navn: "Elinstallationsrapport", beloeb: input.elRapport },
    { navn: "Ejerskifteforsikring (sælgerandel)", beloeb: input.ejerskifteforsikring },
    { navn: "Ejendomsdatarapport", beloeb: input.dataRapport },
    { navn: "Istandsættelse før salg", beloeb: input.istaendsaettelse },
    { navn: "Flytning", beloeb: input.flytning },
    { navn: "Advokat/berigtigelse", beloeb: input.advokat },
    { navn: "Indfrielsesgebyrer", beloeb: input.indfrielseGebyrer },
  ];

  if (tinglysning > 0) {
    poster.push({ navn: "Tinglysning af ny bolig", beloeb: tinglysning });
  }

  if (input.andre > 0) {
    poster.push({ navn: "Andre udgifter", beloeb: input.andre });
  }

  const samledeOmkostninger = poster.reduce((sum, p) => sum + p.beloeb, 0);
  const nettoProvenu = input.salgspris - samledeOmkostninger;

  const fordelinger = poster
    .filter((p) => p.beloeb > 0)
    .map((p) => ({
      navn: p.navn,
      beloeb: p.beloeb,
      procent: samledeOmkostninger > 0 ? (p.beloeb / samledeOmkostninger) * 100 : 0,
    }))
    .sort((a, b) => b.beloeb - a.beloeb);

  return { samledeOmkostninger, nettoProvenu, poster, fordelinger };
}

export { DEFAULT_VALUES };
