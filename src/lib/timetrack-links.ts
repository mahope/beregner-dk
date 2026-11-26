/**
 * Links to timetrack.dk (sister product). One contextual link per page at most,
 * always with UTM parameters so the referral shows up in TimeTrack analytics.
 * timetrack.dk's canonical ignores query strings, so UTM creates no duplicates.
 */
export const TIMETRACK_ORIGIN = "https://timetrack.dk";

export function timetrackUrl(path: string, content?: string): string {
  const params = new URLSearchParams({
    utm_source: "minberegner",
    utm_medium: "referral",
    utm_campaign: "sostersites",
  });
  if (content) params.set("utm_content", content);
  return `${TIMETRACK_ORIGIN}${path}?${params.toString()}`;
}

export interface TimeTrackTip {
  id: string;
  path: string;
  before: string;
  anchor: string;
  after: string;
}

export const TIMETRACK_TIPS: Record<string, TimeTrackTip> = {
  timepris: {
    id: "timepris",
    path: "/timeregistrering-freelancer",
    before:
      "En timepris er kun så god som dit overblik over de timer, du faktisk bruger. Mange freelancere opdager først bagefter, at administration og tilbud æder en stor del af ugen. Registrerer du løbende, kan du se din reelle timeløn og justere prisen. Se fx",
    anchor: "tidsregistrering for freelancere",
    after: "hos TimeTrack.",
  },
  moms: {
    id: "moms",
    path: "/timeregistrering-til-faktura",
    before:
      "Når du fakturerer på timer, skal både antal timer og moms stemme på fakturaen. Det er lettere, hvis timerne er registreret undervejs, så du kan trække dem direkte ind i fakturagrundlaget. Læs mere om at",
    anchor: "registrere timer til fakturering",
    after: "i TimeTrack.",
  },
  "loen-konverter": {
    id: "loen-konverter",
    path: "/arbejdstimer-beregner",
    before:
      "Skal du omregne en timeløn til månedsløn, afhænger resultatet af, hvor mange timer du reelt arbejder. Vil du følge det op i praksis, kan du holde styr på dine faktiske arbejdstimer med",
    anchor: "TimeTrack",
    after: ", som også har sin egen arbejdstimer-beregner.",
  },
};
