/**
 * Lenders' own published representative examples (markedsføringsloven § 18,
 * stk. 2-5, from 20 November 2026). Every figure is copied verbatim from the
 * lender's page on the `hentet` date. Never compute or round them here: the law
 * requires the lender's own example, and a stale one must be refetched, not
 * adjusted. `kredit-eksempler.test.ts` fails once an example is older than
 * `MAKS_ALDER_DAGE`.
 *
 * A lender without a published example gets `eksempel: null`, and the site
 * shows only its name and link, with no rate, ÅOP or amount.
 */

export const MAKS_ALDER_DAGE = 90;

export interface KreditEksempel {
  /** Product the example belongs to, as the lender names it. */
  produkt: string;
  samletKreditbeloeb: string;
  loebetid: string;
  /** Rate label and value as published, e.g. "variabel debitorrente 9,37 % til 20,73 %". */
  rente: string;
  aop: string;
  maanedligYdelse: string;
  samledeKreditomkostninger: string;
  samletTilbagebetaling: string;
  /** Extra published conditions that belong to the example. */
  note?: string;
  /** Page the example was copied from. */
  kilde: string;
  /** ISO date (YYYY-MM-DD) the example was copied. */
  hentet: string;
}

export interface Laangiver {
  navn: string;
  url: string;
  /** ISO date the lender's site was last checked for an example. */
  tjekket: string;
  eksempel: KreditEksempel | null;
}

export const PANTSAT: Laangiver = {
  navn: "Pantsat.dk",
  url: "https://pantsat.dk/hvad-koster-det-at-laane/",
  tjekket: "2026-11-18",
  // Only a calculator for "salg med tilbagekøbsret"; no ÅOP or debitorrente.
  eksempel: null,
};

/** Banks shown under "Eksempler fra bankerne" on /billaan. */
export const BILLAAN_LAANGIVERE: Laangiver[] = [
  {
    navn: "Nordea",
    url: "https://www.nordea.dk/privat/produkter/laan-og-kreditter/billaan/",
    tjekket: "2026-11-18",
    eksempel: {
      produkt: "Lån til elbil",
      samletKreditbeloeb: "300.000 kr.",
      loebetid: "10 år",
      rente: "variabel rente 2,75 % til 6,55 %",
      aop: "3,1 % til 7,0 %",
      maanedligYdelse: "2.901 kr. til 3.456 kr.",
      samledeKreditomkostninger: "43.976 kr. til 110.534 kr.",
      samletTilbagebetaling: "348.126 kr. til 414.684 kr.",
      note: "Lånebeløb inkl. tinglysningsafgift: 304.150 kr.",
      kilde: "https://www.nordea.dk/privat/produkter/laan-og-kreditter/billaan/",
      hentet: "2026-11-18",
    },
  },
  {
    navn: "Bank Norwegian",
    url: "https://www.banknorwegian.dk/lan/billan/",
    tjekket: "2026-11-18",
    eksempel: {
      produkt: "Billån uden sikkerhed",
      samletKreditbeloeb: "85.000 kr.",
      loebetid: "7 år",
      rente: "variabel debitorrente 9,37 % til 20,73 %",
      aop: "9,37 % til 20,73 %",
      maanedligYdelse: "1.367 kr. til 1.836 kr.",
      samledeKreditomkostninger: "29.840 kr. til 69.239 kr.",
      samletTilbagebetaling: "114.840 kr. til 154.239 kr.",
      kilde: "https://www.banknorwegian.dk/lan/billan/",
      hentet: "2026-11-18",
    },
  },
  {
    navn: "Santander Consumer Bank",
    url: "https://santanderconsumer.dk/bil-og-fritid/billaan",
    tjekket: "2026-11-18",
    // Only an interactive calculator; no published example on the billån pages.
    eksempel: null,
  },
];

/** All lenders the site shows, for the freshness test. */
export const ALLE_LAANGIVERE: Laangiver[] = [PANTSAT, ...BILLAAN_LAANGIVERE];

/** "2026-11-18" -> "18. november 2026". */
export function formatHentetDato(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Whole days from `iso` to `nu`. */
export function alderIDage(iso: string, nu: Date = new Date()): number {
  return Math.floor((nu.getTime() - Date.parse(`${iso}T00:00:00Z`)) / 86_400_000);
}
