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

const DEFAULT_VALUES: BoligsalgInput = {
  salgspris: 3000000,
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

function beregnMaegler(input: BoligsalgInput): number {
  if (input.maeglerType === "procent") {
    return (input.maeglerProcent / 100) * input.salgspris;
  }
  return input.maeglerFast;
}

function beregnTinglysning(input: BoligsalgInput): number {
  if (!input.tinglysningInkluderet || input.nyBoligPris <= 0) return 0;
  const skoede = 0.006 * input.nyBoligPris + 1850;
  const pantebrev = 0.0145 * input.nyBoligPris * 0.8 + 1825;
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