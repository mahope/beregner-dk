import { formatHentetDato, type Laangiver } from "@/lib/kredit-eksempler";

/**
 * A lender's own representative example with source and date. Renders nothing
 * when the lender has no published example: then no figures may be shown.
 */
export function KreditEksempel({ laangiver }: { laangiver: Laangiver }) {
  const e = laangiver.eksempel;
  if (!e) return null;

  return (
    <p>
      <strong>Repræsentativt eksempel ({e.produkt}):</strong> Samlet kreditbeløb {e.samletKreditbeloeb}, løbetid{" "}
      {e.loebetid}, {e.rente}, ÅOP {e.aop}, månedlig ydelse {e.maanedligYdelse}, samlede kreditomkostninger{" "}
      {e.samledeKreditomkostninger} og samlet tilbagebetaling {e.samletTilbagebetaling}.
      {e.note && ` ${e.note}`} Eksemplet er hentet fra{" "}
      <a href={e.kilde} target="_blank" rel="nofollow noopener noreferrer">
        {laangiver.navn}
      </a>{" "}
      den {formatHentetDato(e.hentet)}.
    </p>
  );
}
