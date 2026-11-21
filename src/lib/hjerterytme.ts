export interface HjerterytmeZone {
  zone: number;
  navn: string;
  beskrivelse: string;
  pctMin: number;
  pctMax: number;
  pulsMin: number;
  pulsMax: number;
  hrrMin?: number;
  hrrMax?: number;
}

export interface HjerterytmeResultat {
  alder: number;
  maxPuls: number;
  maxPulsSimpel: number;
  hvilepuls?: number;
  zones: HjerterytmeZone[];
}

const ZONE_DEFINITIONER: {
  zone: number;
  navn: string;
  beskrivelse: string;
  pctMin: number;
  pctMax: number;
}[] = [
  { zone: 1, navn: "Genoptræning", beskrivelse: "Meget let. Varm op og kør ned.", pctMin: 0.5, pctMax: 0.6 },
  { zone: 2, navn: "Fedtforbrænding", beskrivelse: "Let. Kan holde en samtale.", pctMin: 0.6, pctMax: 0.7 },
  { zone: 3, navn: "Aerob", beskrivelse: "Moderat. Forbedrer udholdenhed.", pctMin: 0.7, pctMax: 0.8 },
  { zone: 4, navn: "Anaerob", beskrivelse: "Hurtig. Forbedrer hastighed.", pctMin: 0.8, pctMax: 0.9 },
  { zone: 5, navn: "VO2-max", beskrivelse: "Maksimal. Kortvarige intervaller.", pctMin: 0.9, pctMax: 1.0 },
];

export function beregnMaxPuls(alder: number): number {
  return Math.round(208 - 0.7 * alder);
}

export function beregnMaxPulsSimpel(alder: number): number {
  return 220 - alder;
}

export function beregnHrr(maxPuls: number, hvilepuls: number, pct: number): number {
  return Math.round((maxPuls - hvilepuls) * pct + hvilepuls);
}

export function beregnHjerterytme(alder: number, hvilepuls?: number): HjerterytmeResultat {
  const maxPuls = beregnMaxPuls(alder);
  const maxPulsSimpel = beregnMaxPulsSimpel(alder);

  const zones: HjerterytmeZone[] = ZONE_DEFINITIONER.map((z) => {
    const pulsMin = Math.round(maxPuls * z.pctMin);
    const pulsMax = Math.round(maxPuls * z.pctMax);
    const zone: HjerterytmeZone = {
      zone: z.zone,
      navn: z.navn,
      beskrivelse: z.beskrivelse,
      pctMin: z.pctMin,
      pctMax: z.pctMax,
      pulsMin,
      pulsMax,
    };
    if (hvilepuls !== undefined) {
      zone.hrrMin = beregnHrr(maxPuls, hvilepuls, z.pctMin);
      zone.hrrMax = beregnHrr(maxPuls, hvilepuls, z.pctMax);
    }
    return zone;
  });

  return { alder, maxPuls, maxPulsSimpel, hvilepuls, zones };
}
