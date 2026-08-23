import type { Locale } from "./i18n";

export type NavChild = { name: string; href: string };
export type NavItem = {
  name: string;
  href?: string;
  children?: NavChild[];
};

/**
 * Navigation items per locale.
 * Calculator URLs stay the same across locales (Danish slugs),
 * but display names are translated.
 *
 * When a calculator is NOT yet available for a locale,
 * it can be removed from that locale's navigation.
 */
const navigationData: Record<Locale, NavItem[]> = {
  da: [
    {
      name: "Økonomi",
      children: [
        { name: "Løn efter skat", href: "/loen-efter-skat" },
        { name: "Brutto/Netto", href: "/brutto-netto" },
        { name: "Feriepenge", href: "/feriepenge" },
        { name: "Timepris", href: "/timepris" },
        { name: "Moms", href: "/moms" },
        { name: "Dagpenge", href: "/dagpenge" },
        { name: "Sygedagpenge", href: "/sygedagpenge" },
        { name: "Pension", href: "/pension" },
        { name: "Efterløn", href: "/efterloen" },
        { name: "Topskat", href: "/topskat" },
        { name: "Skattefradrag", href: "/skattefradrag" },
        { name: "Aktieskat", href: "/aktieskat" },
        { name: "Arveafgift", href: "/arveafgift" },
      ],
    },
    {
      name: "Bolig",
      children: [
        { name: "Boliglån", href: "/boliglaan" },
        { name: "Boligstøtte", href: "/boligstoette" },
        { name: "Husleje", href: "/husleje" },
        { name: "Andelsbolig", href: "/andelsbolig" },
        { name: "Rentefradrag", href: "/rentefradrag" },
        { name: "Elberegner", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
        { name: "Ejendomsskat", href: "/ejendomsvaerdiskat" },
      ],
    },
    {
      name: "Lån & Rente",
      children: [
        { name: "Renteberegner", href: "/renteberegner" },
        { name: "Låneberegner", href: "/laaneberegner" },
        { name: "Forbrugslån", href: "/forbrugslaan" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Gældsfri", href: "/gaeldsfri" },
        { name: "Studielån", href: "/studielaan" },
        { name: "Opsparing", href: "/opsparing" },
      ],
    },
    {
      name: "Familie & Sundhed",
      children: [
        { name: "Børnepenge", href: "/boernepenge" },
        { name: "Barselsdagpenge", href: "/barselsdagpenge" },
        { name: "Terminsdato", href: "/termin" },
        { name: "SU", href: "/su" },
        { name: "Konfirmation", href: "/konfirmation" },
        { name: "Bryllup", href: "/bryllup" },
        { name: "BMI", href: "/bmi" },
        { name: "Kalorier", href: "/kalorier" },
        { name: "Vægttab", href: "/vaegttab" },
        { name: "Alder", href: "/alder" },
      ],
    },
    {
      name: "Værktøjer",
      children: [
        { name: "Procent", href: "/procent" },
        { name: "Bil (værdtab)", href: "/bil" },
        { name: "Brændstof", href: "/braendstof" },
        { name: "Valuta", href: "/valuta" },
        { name: "Rejsebudget", href: "/rejsebudget" },
        { name: "Tidsberegner", href: "/tidsberegner" },
        { name: "Dato", href: "/dato" },
        { name: "Tidszone", href: "/tidszone" },
      ],
    },
    { name: "Blog", href: "/blog" },
  ],
  no: [
    {
      name: "Økonomi",
      children: [
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
      children: [
        { name: "Boliglån", href: "/boliglaan" },
        { name: "Strømberegner", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
      ],
    },
    {
      name: "Lån & Rente",
      children: [
        { name: "Låneberegner", href: "/laaneberegner" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Gjeldfri", href: "/gaeldsfri" },
        { name: "Forbrukslån", href: "/forbrugslaan" },
      ],
    },
    {
      name: "Familie & Helse",
      children: [
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
      children: [
        { name: "Bil (verditap)", href: "/bil" },
        { name: "Drivstoff", href: "/braendstof" },
        { name: "Reisebudsjett", href: "/rejsebudget" },
        { name: "Tidsberegner", href: "/tidsberegner" },
        { name: "Dato", href: "/dato" },
        { name: "Tidssone", href: "/tidszone" },
      ],
    },
  ],
  se: [
    {
      name: "Ekonomi",
      children: [
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
      children: [
        { name: "Bolån", href: "/boliglaan" },
        { name: "Elberäknare", href: "/elberegner" },
        { name: "Solceller", href: "/solceller" },
        { name: "Kvadratmeter", href: "/kvadratmeter" },
      ],
    },
    {
      name: "Lån & Ränta",
      children: [
        { name: "Låneberäknare", href: "/laaneberegner" },
        { name: "Billån", href: "/billaan" },
        { name: "Leasing", href: "/leasing" },
        { name: "Skuldfri", href: "/gaeldsfri" },
        { name: "Konsumtionslån", href: "/forbrugslaan" },
      ],
    },
    {
      name: "Familj & Hälsa",
      children: [
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
      children: [
        { name: "Bil (värdeminskning)", href: "/bil" },
        { name: "Bränsle", href: "/braendstof" },
        { name: "Resebudget", href: "/rejsebudget" },
        { name: "Tidsberäknare", href: "/tidsberegner" },
        { name: "Datum", href: "/dato" },
        { name: "Tidszon", href: "/tidszone" },
      ],
    },
  ],
};

export function getNavigation(locale: Locale): NavItem[] {
  return navigationData[locale] || navigationData.da;
}
