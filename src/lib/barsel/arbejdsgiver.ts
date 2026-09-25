/**
 * Ready-to-send message to the employer with exact dates for every period.
 */

import { formatDato, formatLang } from "./dato";

export interface ArbejdsgiverPeriode {
  fra: string;
  til: string;
  /** e.g. "Barselsorlov (øremærket)" or "Delvis genoptagelse: 60 % arbejde" */
  beskrivelse: string;
}

export interface ArbejdsgiverInput {
  navn: string;
  /** "termin" when the birth date is still expected. */
  datoType: "termin" | "foedsel";
  dato: string;
  adoption: boolean;
  perioder: ArbejdsgiverPeriode[];
  udskudteUger: number;
}

function datoSaetning(input: ArbejdsgiverInput): string {
  if (input.adoption) {
    return input.datoType === "termin"
      ? `Vi forventer at modtage vores barn ${formatLang(input.dato)}.`
      : `Vi modtog vores barn ${formatLang(input.dato)}.`;
  }
  return input.datoType === "termin"
    ? `Vores barn har termin ${formatLang(input.dato)}.`
    : `Vores barn blev født ${formatLang(input.dato)}.`;
}

export function periodeLinje(p: ArbejdsgiverPeriode): string {
  return p.fra === p.til
    ? `- ${formatLang(p.fra)}: ${p.beskrivelse}`
    : `- ${formatLang(p.fra)} til og med ${formatLang(p.til)}: ${p.beskrivelse}`;
}

export function arbejdsgiverBesked(input: ArbejdsgiverInput): string {
  const navn = input.navn.trim() || "[dit navn]";
  const linjer: string[] = [
    "Emne: Varsling af barselsorlov",
    "",
    "Kære [navn på leder]",
    "",
    `Jeg skriver for at varsle min barselsorlov. ${datoSaetning(input)}`,
    "",
  ];

  if (input.perioder.length === 0) {
    linjer.push("Jeg har endnu ikke lagt min orlov endeligt fast og vender tilbage med datoer.");
  } else {
    linjer.push("Jeg forventer at holde orlov i disse perioder:", "");
    for (const p of input.perioder) linjer.push(periodeLinje(p));
  }

  if (input.udskudteUger > 0) {
    linjer.push(
      "",
      `Derudover ønsker jeg at udskyde ${input.udskudteUger} ${input.udskudteUger === 1 ? "uge" : "uger"} af min orlov til senere. Jeg varsler tidspunktet for dem særskilt.`
    );
  }

  if (input.datoType === "termin" && !input.adoption) {
    linjer.push(
      "",
      "Datoerne efter fødslen er beregnet ud fra terminsdatoen og flytter sig tilsvarende, hvis barnet kommer før eller efter termin. Jeg giver besked, så snart barnet er født."
    );
  }

  linjer.push(
    "",
    "Jeg vil gerne høre, om perioderne passer jer, og hvordan I ønsker at håndtere løn under barsel og refusion. Sig endelig til, hvis der er noget, I har brug for fra mig.",
    "",
    "Venlig hilsen",
    navn
  );

  return linjer.join("\n");
}

/** Short one-line summary for print and previews. */
export function periodeResume(p: ArbejdsgiverPeriode): string {
  return p.fra === p.til
    ? `${formatDato(p.fra)}: ${p.beskrivelse}`
    : `${formatDato(p.fra)} – ${formatDato(p.til)}: ${p.beskrivelse}`;
}
