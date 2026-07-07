import type { Locale } from "./i18n";

export interface Calculator {
  title: string;
  description: string;
  href: string;
  icon?: string;
}

interface CalculatorDef {
  href: string;
  icon: string;
  daOnly?: boolean;
  titles: { da: string; no: string; se: string };
  descriptions: { da: string; no: string; se: string };
}

const calculatorDefs: CalculatorDef[] = [
  // Økonomi & Løn
  { href: "/loen-efter-skat", icon: "💰", daOnly: true, titles: { da: "Løn efter skat", no: "Lønn etter skatt", se: "Lön efter skatt" }, descriptions: { da: "Beregn din nettoløn efter skat", no: "Beregn din nettolønn etter skatt", se: "Beräkna din nettolön efter skatt" } },
  { href: "/dagpenge", icon: "📋", daOnly: true, titles: { da: "Dagpenge", no: "Dagpenger", se: "Dagpenning" }, descriptions: { da: "Beregn dine dagpenge", no: "Beregn dagpengene dine", se: "Beräkna din dagpenning" } },
  { href: "/feriepenge", icon: "🏖️", daOnly: true, titles: { da: "Feriepenge", no: "Feriepenger", se: "Semesterpengar" }, descriptions: { da: "Beregn dine feriepenge", no: "Beregn feriepengene dine", se: "Beräkna dina semesterpengar" } },
  { href: "/su", icon: "🎓", daOnly: true, titles: { da: "SU Beregner", no: "Studiestøtte", se: "Studiestöd" }, descriptions: { da: "Beregn din SU", no: "Beregn studiestøtten din", se: "Beräkna ditt studiestöd" } },
  { href: "/pension", icon: "👴", daOnly: true, titles: { da: "Pension", no: "Pensjon", se: "Pension" }, descriptions: { da: "Beregn din pension", no: "Beregn pensjonen din", se: "Beräkna din pension" } },
  { href: "/efterloen", icon: "🏡", daOnly: true, titles: { da: "Efterløn", no: "Tidligpensjon", se: "Förtidspension" }, descriptions: { da: "Beregn din efterløn", no: "Beregn tidligpensjonen din", se: "Beräkna din förtidspension" } },
  { href: "/sygedagpenge", icon: "🤒", daOnly: true, titles: { da: "Sygedagpenge", no: "Sykepenger", se: "Sjukpenning" }, descriptions: { da: "Beregn dine sygedagpenge", no: "Beregn sykepengene dine", se: "Beräkna din sjukpenning" } },
  { href: "/barselsdagpenge", icon: "👶", daOnly: true, titles: { da: "Barselsdagpenge", no: "Foreldrepenger", se: "Föräldrapenning" }, descriptions: { da: "Beregn barselsdagpenge", no: "Beregn foreldrepenger", se: "Beräkna föräldrapenning" } },
  { href: "/boernepenge", icon: "👧", daOnly: true, titles: { da: "Børnepenge", no: "Barnetrygd", se: "Barnbidrag" }, descriptions: { da: "Se børne- og ungeydelse", no: "Se barnetrygden din", se: "Se ditt barnbidrag" } },
  { href: "/timepris", icon: "⏰", titles: { da: "Timepris", no: "Timepris", se: "Timpris" }, descriptions: { da: "Beregn din timepris", no: "Beregn timeprisen din", se: "Beräkna ditt timpris" } },
  // Lån & Bolig
  { href: "/boliglaan", icon: "🏠", titles: { da: "Boliglån", no: "Boliglån", se: "Bolån" }, descriptions: { da: "Beregn dit boliglån", no: "Beregn boliglånet ditt", se: "Beräkna ditt bolån" } },
  { href: "/renteberegner", icon: "🏦", titles: { da: "Renteberegner", no: "Rentekalkulator", se: "Räntekalkylator" }, descriptions: { da: "Beregn renter på lån", no: "Beregn renter på lån", se: "Beräkna ränta på lån" } },
  { href: "/husleje", icon: "🔑", daOnly: true, titles: { da: "Husleje", no: "Husleie", se: "Hyra" }, descriptions: { da: "Beregn rimelig husleje", no: "Beregn rimelig husleie", se: "Beräkna rimlig hyra" } },
  { href: "/boligstoette", icon: "🏘️", daOnly: true, titles: { da: "Boligstøtte", no: "Bostøtte", se: "Bostadsbidrag" }, descriptions: { da: "Beregn din boligstøtte", no: "Beregn bostøtten din", se: "Beräkna ditt bostadsbidrag" } },
  { href: "/laaneberegner", icon: "💳", titles: { da: "Låneberegner", no: "Lånekalkulator", se: "Lånekalkylator" }, descriptions: { da: "Beregn dit lån", no: "Beregn lånet ditt", se: "Beräkna ditt lån" } },
  { href: "/opsparing", icon: "📈", titles: { da: "Opsparing", no: "Sparing", se: "Sparande" }, descriptions: { da: "Renters rente beregner", no: "Rentes rente kalkulator", se: "Ränta-på-ränta kalkylator" } },
  { href: "/rentefradrag", icon: "📉", daOnly: true, titles: { da: "Rentefradrag", no: "Rentefradrag", se: "Ränteavdrag" }, descriptions: { da: "Beregn dit rentefradrag", no: "Beregn rentefradraget ditt", se: "Beräkna ditt ränteavdrag" } },
  { href: "/billaan", icon: "🚙", titles: { da: "Billån", no: "Billån", se: "Billån" }, descriptions: { da: "Beregn dit billån", no: "Beregn billånet ditt", se: "Beräkna ditt billån" } },
  { href: "/forbrugslaan", icon: "💸", titles: { da: "Forbrugslån", no: "Forbrukslån", se: "Konsumtionslån" }, descriptions: { da: "Beregn dit forbrugslån", no: "Beregn forbrukslånet ditt", se: "Beräkna ditt konsumtionslån" } },
  { href: "/ejendomsvaerdiskat", icon: "🏡", daOnly: true, titles: { da: "Ejendomsværdiskat", no: "Eiendomsskatt", se: "Fastighetsskatt" }, descriptions: { da: "Beregn din boligskat", no: "Beregn eiendomsskatten din", se: "Beräkna din fastighetsskatt" } },
  { href: "/arveafgift", icon: "📜", daOnly: true, titles: { da: "Arveafgift", no: "Arveavgift", se: "Arvsskatt" }, descriptions: { da: "Beregn boafgift", no: "Beregn arveavgiften", se: "Beräkna arvsskatt" } },
  { href: "/topskat", icon: "📊", daOnly: true, titles: { da: "Topskat", no: "Toppskatt", se: "Toppskatt" }, descriptions: { da: "Beregn din topskat", no: "Beregn toppskatten din", se: "Beräkna din toppskatt" } },
  { href: "/skattefradrag", icon: "🧮", daOnly: true, titles: { da: "Skattefradrag", no: "Skattefradrag", se: "Skatteavdrag" }, descriptions: { da: "Beregn dine skattefradrag", no: "Beregn skattefradragene dine", se: "Beräkna dina skatteavdrag" } },
  { href: "/aktieskat", icon: "💹", daOnly: true, titles: { da: "Aktieskat", no: "Aksjeskatt", se: "Aktieskatt" }, descriptions: { da: "Beregn skat af aktier", no: "Beregn skatt av aksjer", se: "Beräkna skatt på aktier" } },
  { href: "/andelsbolig", icon: "🏢", daOnly: true, titles: { da: "Andelsbolig", no: "Andelsbolig", se: "Bostadsrätt" }, descriptions: { da: "Beregn andelsboligøkonomi", no: "Beregn andelsboligøkonomi", se: "Beräkna bostadsrättsekonomi" } },
  { href: "/studielaan", icon: "📚", daOnly: true, titles: { da: "Studielån", no: "Studielån", se: "Studielån" }, descriptions: { da: "Beregn tilbagebetaling af SU-lån", no: "Beregn nedbetaling av studielån", se: "Beräkna återbetalning av studielån" } },
  // Moms & Procent
  { href: "/moms", icon: "🧾", titles: { da: "Moms", no: "Moms", se: "Moms" }, descriptions: { da: "Beregn moms til/fra", no: "Beregn moms til/fra", se: "Beräkna moms till/från" } },
  { href: "/procent", icon: "➗", titles: { da: "Procent", no: "Prosent", se: "Procent" }, descriptions: { da: "Beregn procent nemt", no: "Beregn prosent enkelt", se: "Beräkna procent enkelt" } },
  // Sundhed
  { href: "/bmi", icon: "⚖️", titles: { da: "BMI Beregner", no: "BMI Kalkulator", se: "BMI Kalkylator" }, descriptions: { da: "Beregn dit Body Mass Index", no: "Beregn din BMI", se: "Beräkna ditt BMI" } },
  { href: "/kalorier", icon: "🍎", titles: { da: "Kalorieberegner", no: "Kaloriekalkulator", se: "Kalorikalkylator" }, descriptions: { da: "Beregn kaloriebehov", no: "Beregn kaloribehovet ditt", se: "Beräkna ditt kaloribehov" } },
  // Tid
  { href: "/dato", icon: "📅", titles: { da: "Datoberegner", no: "Datokalkulator", se: "Datumkalkylator" }, descriptions: { da: "Dage mellem datoer", no: "Dager mellom datoer", se: "Dagar mellan datum" } },
  { href: "/tidsberegner", icon: "⏱️", titles: { da: "Tidsberegner", no: "Tidskalkulator", se: "Tidskalkylator" }, descriptions: { da: "Beregn tid og varighed", no: "Beregn tid og varighet", se: "Beräkna tid och varaktighet" } },
  { href: "/tidszone", icon: "🌍", titles: { da: "Tidszone", no: "Tidssone", se: "Tidszon" }, descriptions: { da: "Omregn tidszoner", no: "Omregn tidssoner", se: "Omvandla tidszoner" } },
  { href: "/alder", icon: "🎂", titles: { da: "Alder", no: "Alder", se: "Ålder" }, descriptions: { da: "Beregn din præcise alder", no: "Beregn din nøyaktige alder", se: "Beräkna din exakta ålder" } },
  // Bil & Energi
  { href: "/bil", icon: "🚗", titles: { da: "Bil", no: "Bil", se: "Bil" }, descriptions: { da: "Beregn biludgifter", no: "Beregn bilutgifter", se: "Beräkna bilkostnader" } },
  { href: "/braendstof", icon: "⛽", titles: { da: "Brændstof", no: "Drivstoff", se: "Bränsle" }, descriptions: { da: "Beregn brændstofforbrug", no: "Beregn drivstofforbruk", se: "Beräkna bränsleförbrukning" } },
  { href: "/elberegner", icon: "⚡", titles: { da: "Elberegner", no: "Strømkalkulator", se: "Elkalkylator" }, descriptions: { da: "Beregn dit elforbrug", no: "Beregn strømforbruket ditt", se: "Beräkna din elförbrukning" } },
  // Andet
  { href: "/kvadratmeter", icon: "📐", titles: { da: "Kvadratmeter", no: "Kvadratmeter", se: "Kvadratmeter" }, descriptions: { da: "Beregn areal", no: "Beregn areal", se: "Beräkna yta" } },
  { href: "/valuta", icon: "💱", titles: { da: "Valuta", no: "Valuta", se: "Valuta" }, descriptions: { da: "Omregn valutaer", no: "Omregn valutaer", se: "Omvandla valutor" } },
  // Yderligere
  { href: "/solceller", icon: "☀️", titles: { da: "Solceller", no: "Solceller", se: "Solceller" }, descriptions: { da: "Beregn solcelleøkonomi", no: "Beregn solcelleøkonomi", se: "Beräkna solcellsekonomi" } },
  { href: "/leasing", icon: "🚗", titles: { da: "Leasing", no: "Leasing", se: "Leasing" }, descriptions: { da: "Beregn leasingydelse", no: "Beregn leasingytelse", se: "Beräkna leasingavgift" } },
  { href: "/gaeldsfri", icon: "🎯", titles: { da: "Gældsfri", no: "Gjeldfri", se: "Skuldfri" }, descriptions: { da: "Beregn gældsafvikling", no: "Beregn gjeldsnedbetaling", se: "Beräkna skuldavbetalning" } },
  { href: "/brutto-netto", icon: "💸", daOnly: true, titles: { da: "Brutto/Netto", no: "Brutto/Netto", se: "Brutto/Netto" }, descriptions: { da: "Beregn brutto og nettoløn", no: "Beregn brutto og nettolønn", se: "Beräkna brutto och nettolön" } },
  { href: "/konfirmation", icon: "🎉", titles: { da: "Konfirmation", no: "Konfirmasjon", se: "Konfirmation" }, descriptions: { da: "Beregn konfirmationsbudget", no: "Beregn konfirmasjonsbudsjett", se: "Beräkna konfirmationsbudget" } },
  { href: "/bryllup", icon: "💒", titles: { da: "Bryllup", no: "Bryllup", se: "Bröllop" }, descriptions: { da: "Beregn bryllupsbudget", no: "Beregn bryllupsbudsjett", se: "Beräkna bröllopsbudget" } },
  { href: "/rejsebudget", icon: "✈️", titles: { da: "Rejsebudget", no: "Reisebudsjett", se: "Resebudget" }, descriptions: { da: "Beregn dit rejsebudget", no: "Beregn reisebudsjettet ditt", se: "Beräkna din resebudget" } },
  { href: "/vaegttab", icon: "📉", titles: { da: "Vægttab", no: "Vekttap", se: "Viktminskning" }, descriptions: { da: "Beregn vægttab", no: "Beregn vekttap", se: "Beräkna viktminskning" } },
  { href: "/termin", icon: "🤰", titles: { da: "Terminsdato", no: "Termindato", se: "Beräknat datum" }, descriptions: { da: "Beregn terminsdato", no: "Beregn termindato", se: "Beräkna förlossningsdatum" } },
];

// DA-only slugs (not available on NO/SE)
const daOnlySlugs = new Set(
  calculatorDefs.filter((d) => d.daOnly).map((d) => d.href)
);

/**
 * Get all calculators for a given locale (filtered to only available ones).
 */
export function getCalculatorsByLocale(locale: Locale): Calculator[] {
  return calculatorDefs
    .filter((d) => locale === "da" || !d.daOnly)
    .map((d) => ({
      title: d.titles[locale] || d.titles.da,
      description: d.descriptions[locale] || d.descriptions.da,
      href: d.href,
      icon: d.icon,
    }));
}

// Map related calculators by topic
const relatedMap: Record<string, string[]> = {
  "/loen-efter-skat": ["/feriepenge", "/dagpenge", "/pension", "/topskat", "/rentefradrag"],
  "/dagpenge": ["/loen-efter-skat", "/sygedagpenge", "/efterloen", "/barselsdagpenge", "/feriepenge"],
  "/feriepenge": ["/loen-efter-skat", "/dagpenge", "/barselsdagpenge", "/pension", "/timepris"],
  "/su": ["/loen-efter-skat", "/studielaan", "/boernepenge", "/boligstoette", "/dagpenge"],
  "/pension": ["/loen-efter-skat", "/efterloen", "/opsparing", "/arveafgift", "/feriepenge"],
  "/efterloen": ["/pension", "/dagpenge", "/loen-efter-skat", "/arveafgift", "/opsparing"],
  "/barselsdagpenge": ["/boernepenge", "/dagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/boernepenge": ["/barselsdagpenge", "/su", "/boligstoette", "/loen-efter-skat", "/dagpenge"],
  "/timepris": ["/loen-efter-skat", "/moms", "/procent", "/feriepenge", "/dagpenge"],
  "/boliglaan": ["/renteberegner", "/laaneberegner", "/andelsbolig", "/ejendomsvaerdiskat", "/rentefradrag"],
  "/renteberegner": ["/boliglaan", "/laaneberegner", "/opsparing", "/procent", "/rentefradrag"],
  "/husleje": ["/boligstoette", "/boliglaan", "/ejendomsvaerdiskat", "/loen-efter-skat", "/kvadratmeter"],
  "/boligstoette": ["/husleje", "/boernepenge", "/loen-efter-skat", "/su", "/dagpenge"],
  "/laaneberegner": ["/boliglaan", "/renteberegner", "/billaan", "/forbrugslaan", "/rentefradrag"],
  "/opsparing": ["/renteberegner", "/pension", "/aktieskat", "/laaneberegner", "/loen-efter-skat"],
  "/rentefradrag": ["/boliglaan", "/renteberegner", "/laaneberegner", "/skattefradrag", "/loen-efter-skat"],
  "/billaan": ["/bil", "/laaneberegner", "/renteberegner", "/forbrugslaan", "/braendstof"],
  "/forbrugslaan": ["/laaneberegner", "/renteberegner", "/billaan", "/boliglaan", "/rentefradrag"],
  "/ejendomsvaerdiskat": ["/boliglaan", "/boligstoette", "/husleje", "/rentefradrag", "/loen-efter-skat"],
  "/arveafgift": ["/pension", "/efterloen", "/loen-efter-skat", "/opsparing", "/rentefradrag"],
  "/moms": ["/procent", "/timepris", "/loen-efter-skat", "/valuta", "/renteberegner"],
  "/procent": ["/moms", "/renteberegner", "/opsparing", "/bmi", "/kalorier"],
  "/bmi": ["/kalorier", "/alder", "/procent", "/dato", "/tidsberegner"],
  "/kalorier": ["/bmi", "/procent", "/alder", "/dato", "/tidsberegner"],
  "/dato": ["/tidsberegner", "/alder", "/tidszone", "/feriepenge", "/pension"],
  "/tidsberegner": ["/dato", "/tidszone", "/alder", "/timepris", "/kalorier"],
  "/tidszone": ["/dato", "/tidsberegner", "/valuta", "/alder", "/timepris"],
  "/alder": ["/dato", "/pension", "/bmi", "/tidsberegner", "/efterloen"],
  "/bil": ["/braendstof", "/billaan", "/elberegner", "/forbrugslaan", "/loen-efter-skat"],
  "/braendstof": ["/bil", "/elberegner", "/procent", "/valuta", "/kvadratmeter"],
  "/elberegner": ["/braendstof", "/bil", "/procent", "/husleje", "/boligstoette"],
  "/kvadratmeter": ["/husleje", "/boliglaan", "/procent", "/braendstof", "/elberegner"],
  "/valuta": ["/moms", "/procent", "/tidszone", "/loen-efter-skat", "/bil"],
  "/solceller": ["/elberegner", "/braendstof", "/bil", "/boliglaan", "/opsparing"],
  "/leasing": ["/billaan", "/bil", "/forbrugslaan", "/laaneberegner", "/braendstof"],
  "/gaeldsfri": ["/laaneberegner", "/forbrugslaan", "/opsparing", "/renteberegner", "/billaan"],
  "/brutto-netto": ["/loen-efter-skat", "/timepris", "/feriepenge", "/pension", "/dagpenge"],
  "/konfirmation": ["/bryllup", "/rejsebudget", "/opsparing", "/loen-efter-skat", "/gaeldsfri"],
  "/bryllup": ["/konfirmation", "/rejsebudget", "/opsparing", "/loen-efter-skat", "/gaeldsfri"],
  "/rejsebudget": ["/valuta", "/bryllup", "/konfirmation", "/opsparing", "/tidszone"],
  "/vaegttab": ["/kalorier", "/bmi", "/alder", "/procent", "/tidsberegner"],
  "/termin": ["/barselsdagpenge", "/boernepenge", "/alder", "/dato", "/kalorier"],
  "/sygedagpenge": ["/dagpenge", "/barselsdagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/topskat": ["/loen-efter-skat", "/brutto-netto", "/skattefradrag", "/pension", "/rentefradrag"],
  "/skattefradrag": ["/rentefradrag", "/loen-efter-skat", "/topskat", "/pension", "/boliglaan"],
  "/aktieskat": ["/opsparing", "/loen-efter-skat", "/pension", "/renteberegner", "/procent"],
  "/andelsbolig": ["/boliglaan", "/husleje", "/laaneberegner", "/rentefradrag", "/ejendomsvaerdiskat"],
  "/studielaan": ["/su", "/laaneberegner", "/forbrugslaan", "/renteberegner", "/opsparing"],
};

/**
 * Get related calculators for a given page, locale-filtered.
 */
export function getRelatedCalculators(
  currentHref: string,
  locale: Locale
): Calculator[] {
  const allCalcs = getCalculatorsByLocale(locale);
  const relatedHrefs = relatedMap[currentHref] || [];

  // Filter to only available calculators for this locale
  const availableHrefs = new Set(allCalcs.map((c) => c.href));
  const related = relatedHrefs
    .filter((href) => availableHrefs.has(href))
    .map((href) => allCalcs.find((c) => c.href === href)!)
    .filter(Boolean)
    .slice(0, 5);

  if (related.length === 0) {
    return allCalcs.filter((c) => c.href !== currentHref).slice(0, 5);
  }

  return related;
}

/**
 * Get popular calculators for sidebar, locale-aware.
 */
export function getPopularCalculators(locale: Locale): Calculator[] {
  const popularHrefs = locale === "da"
    ? ["/loen-efter-skat", "/moms", "/bmi", "/laaneberegner", "/procent", "/valuta", "/feriepenge", "/boliglaan"]
    : ["/moms", "/bmi", "/laaneberegner", "/procent", "/valuta", "/boliglaan", "/pension", "/timepris"];

  const allCalcs = getCalculatorsByLocale(locale);
  return popularHrefs
    .map((href) => allCalcs.find((c) => c.href === href)!)
    .filter(Boolean);
}
