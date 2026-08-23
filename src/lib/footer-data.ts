import type { Locale } from "./i18n";

export interface FooterCategory {
  name: string;
  links: { name: string; href: string }[];
}

export interface FooterBlogLink {
  name: string;
  href: string;
}

/**
 * Footer calculator links organized by category per locale.
 * Only include calculators that are verified/available for the locale.
 */
const footerData: Record<Locale, FooterCategory[]> = {
  da: [
    {
      name: "Økonomi",

      links: [
        { name: "Løn efter skat", href: "/loen-efter-skat" },
        { name: "Brutto/Netto", href: "/brutto-netto" },
        { name: "Momsberegner", href: "/moms" },
        { name: "Feriepenge", href: "/feriepenge" },
        { name: "Dagpenge", href: "/dagpenge" },
        { name: "Sygedagpenge", href: "/sygedagpenge" },
        { name: "Pension", href: "/pension" },
        { name: "Efterløn", href: "/efterloen" },
        { name: "Topskat", href: "/topskat" },
        { name: "Skattefradrag", href: "/skattefradrag" },
        { name: "Aktieskat", href: "/aktieskat" },
        { name: "Arveafgift", href: "/arveafgift" },
        { name: "Rentefradrag", href: "/rentefradrag" },
        { name: "Procent", href: "/procent" },
        { name: "Valuta", href: "/valuta" },
        { name: "Timepris", href: "/timepris" },
      ],
    },
    {
      name: "Bolig",

      links: [
        { name: "Boliglån", href: "/boliglaan" },
        { name: "Boligstøtte", href: "/boligstoette" },
        { name: "Husleje Budget", href: "/husleje" },
        { name: "Andelsbolig", href: "/andelsbolig" },
        { name: "Ejendomsskat", href: "/ejendomsvaerdiskat" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
        { name: "Elberegner", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
      ],
    },
    {
      name: "Lån & Rente",

      links: [
        { name: "Låneberegner", href: "/laaneberegner" },
        { name: "Renteberegner", href: "/renteberegner" },
        { name: "Opsparing", href: "/opsparing" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Forbrugslån", href: "/forbrugslaan" },
        { name: "Gældsfri", href: "/gaeldsfri" },
        { name: "Studielån", href: "/studielaan" },
      ],
    },
    {
      name: "Familie & Sundhed",

      links: [
        { name: "Børnepenge", href: "/boernepenge" },
        { name: "Barselsdagpenge", href: "/barselsdagpenge" },
        { name: "Terminsdato", href: "/termin" },
        { name: "SU Beregner", href: "/su" },
        { name: "Konfirmation", href: "/konfirmation" },
        { name: "Bryllup", href: "/bryllup" },
        { name: "BMI Beregner", href: "/bmi" },
        { name: "Kalorieberegner", href: "/kalorier" },
        { name: "Vægttab", href: "/vaegttab" },
        { name: "Aldersberegner", href: "/alder" },
      ],
    },
    {
      name: "Hverdag",

      links: [
        { name: "Brændstof", href: "/braendstof" },
        { name: "Bil Værdtab", href: "/bil" },
        { name: "Rejsebudget", href: "/rejsebudget" },
        { name: "Datoberegner", href: "/dato" },
        { name: "Tidsberegner", href: "/tidsberegner" },
        { name: "Tidszoner", href: "/tidszone" },
      ],
    },
  ],
  no: [
    {
      name: "Økonomi",

      links: [
        { name: "Moms (MVA)", href: "/moms" },
        { name: "Valuta", href: "/valuta" },
        { name: "Renteberegner", href: "/renteberegner" },
        { name: "Opsparing", href: "/opsparing" },
        { name: "Prosent", href: "/procent" },
        { name: "Timepris", href: "/timepris" },
      ],
    },
    {
      name: "Bolig",

      links: [
        { name: "Boliglån", href: "/boliglaan" },
        { name: "Strømberegner", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
      ],
    },
    {
      name: "Lån & Rente",

      links: [
        { name: "Låneberegner", href: "/laaneberegner" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Gjeldfri", href: "/gaeldsfri" },
        { name: "Forbrukslån", href: "/forbrugslaan" },
      ],
    },
    {
      name: "Familie & Helse",

      links: [
        { name: "Termin", href: "/termin" },
        { name: "Konfirmasjon", href: "/konfirmation" },
        { name: "Bryllup", href: "/bryllup" },
        { name: "BMI", href: "/bmi" },
        { name: "Kalorier", href: "/kalorier" },
        { name: "Vekttap", href: "/vaegttab" },
        { name: "Alder", href: "/alder" },
      ],
    },
    {
      name: "Verktøy",

      links: [
        { name: "Drivstoff", href: "/braendstof" },
        { name: "Bil (verditap)", href: "/bil" },
        { name: "Reisebudsjett", href: "/rejsebudget" },
        { name: "Datoberegner", href: "/dato" },
        { name: "Tidsberegner", href: "/tidsberegner" },
        { name: "Tidssoner", href: "/tidszone" },
      ],
    },
  ],
  se: [
    {
      name: "Ekonomi",

      links: [
        { name: "Moms", href: "/moms" },
        { name: "Valuta", href: "/valuta" },
        { name: "Ränteberäknare", href: "/renteberegner" },
        { name: "Sparande", href: "/opsparing" },
        { name: "Procent", href: "/procent" },
        { name: "Timpris", href: "/timepris" },
      ],
    },
    {
      name: "Bostad",

      links: [
        { name: "Bolån", href: "/boliglaan" },
        { name: "Elberäknare", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
      ],
    },
    {
      name: "Lån & Ränta",

      links: [
        { name: "Låneberäknare", href: "/laaneberegner" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Skuldfri", href: "/gaeldsfri" },
        { name: "Konsumtionslån", href: "/forbrugslaan" },
      ],
    },
    {
      name: "Familj & Hälsa",

      links: [
        { name: "Beräknad förlossning", href: "/termin" },
        { name: "Konfirmation", href: "/konfirmation" },
        { name: "Bröllop", href: "/bryllup" },
        { name: "BMI", href: "/bmi" },
        { name: "Kalorier", href: "/kalorier" },
        { name: "Viktnedgång", href: "/vaegttab" },
        { name: "Ålder", href: "/alder" },
      ],
    },
    {
      name: "Verktyg",

      links: [
        { name: "Bränsle", href: "/braendstof" },
        { name: "Bil (värdeminskning)", href: "/bil" },
        { name: "Resebudget", href: "/rejsebudget" },
        { name: "Datumberäknare", href: "/dato" },
        { name: "Tidsberäknare", href: "/tidsberegner" },
        { name: "Tidszoner", href: "/tidszone" },
      ],
    },
  ],
};

const blogLinks: Record<Locale, FooterBlogLink[]> = {
  da: [
    { name: "Børnepenge 2026: Satser og regler", href: "/blog/boernepenge-2026-satser-og-regler" },
    { name: "Månedsbudget 2026: Komplet guide", href: "/blog/maanedsbudget-2026-komplet-guide" },
    { name: "Biløkonomi 2026: Guide til eje bil", href: "/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil" },
  ],
  no: [],
  se: [],
};

export function getFooterCategories(locale: Locale): FooterCategory[] {
  return footerData[locale] || footerData.da;
}

export function getFooterBlogLinks(locale: Locale): FooterBlogLink[] {
  return blogLinks[locale] || [];
}
