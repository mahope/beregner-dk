import type { Locale } from "./i18n";

export interface Calculator {
  title: string;
  description: string;
  href: string;
}

interface CalculatorDef {
  href: string;
  daOnly?: boolean;
  seOnly?: boolean;
  titles: { da: string; no: string; se: string };
  descriptions: { da: string; no: string; se: string };
}

const calculatorDefs: CalculatorDef[] = [
  // Økonomi & Løn
  { href: "/loen-efter-skat", daOnly: true, titles: { da: "Løn efter skat", no: "Lønn etter skatt", se: "Lön efter skatt" }, descriptions: { da: "Beregn din nettoløn efter skat", no: "Beregn din nettolønn etter skatt", se: "Beräkna din nettolön efter skatt" } },
  { href: "/lon-efter-skatt", seOnly: true, titles: { da: "Lön efter skatt", no: "Lön efter skatt", se: "Lön efter skatt" }, descriptions: { da: "Beräkna nettolön", no: "Beräkna nettolön", se: "Beräkna din nettolön efter skatt" } },
  { href: "/bolan", seOnly: true, titles: { da: "Bolån", no: "Bolån", se: "Bolånekalkylator" }, descriptions: { da: "Beräkna bolån", no: "Beräkna bolån", se: "Beräkna månadskostnad för bolån" } },
  { href: "/dagpenge", daOnly: true, titles: { da: "Dagpenge", no: "Dagpenger", se: "Dagpenning" }, descriptions: { da: "Beregn dine dagpenge", no: "Beregn dagpengene dine", se: "Beräkna din dagpenning" } },
  { href: "/feriepenge", daOnly: true, titles: { da: "Feriepenge", no: "Feriepenger", se: "Semesterpengar" }, descriptions: { da: "Beregn dine feriepenge", no: "Beregn feriepengene dine", se: "Beräkna dina semesterpengar" } },
  { href: "/su", daOnly: true, titles: { da: "SU Beregner", no: "Studiestøtte", se: "Studiestöd" }, descriptions: { da: "Beregn din SU", no: "Beregn studiestøtten din", se: "Beräkna ditt studiestöd" } },
  { href: "/pension", daOnly: true, titles: { da: "Pension", no: "Pensjon", se: "Pension" }, descriptions: { da: "Beregn din pension", no: "Beregn pensjonen din", se: "Beräkna din pension" } },
  { href: "/efterloen", daOnly: true, titles: { da: "Efterløn", no: "Tidligpensjon", se: "Förtidspension" }, descriptions: { da: "Beregn din efterløn", no: "Beregn tidligpensjonen din", se: "Beräkna din förtidspension" } },
  { href: "/sygedagpenge", daOnly: true, titles: { da: "Sygedagpenge", no: "Sykepenger", se: "Sjukpenning" }, descriptions: { da: "Beregn dine sygedagpenge", no: "Beregn sykepengene dine", se: "Beräkna din sjukpenning" } },
  { href: "/barselsdagpenge", daOnly: true, titles: { da: "Barselsdagpenge", no: "Foreldrepenger", se: "Föräldrapenning" }, descriptions: { da: "Beregn barselsdagpenge", no: "Beregn foreldrepenger", se: "Beräkna föräldrapenning" } },
  { href: "/boernepenge", daOnly: true, titles: { da: "Børnepenge", no: "Barnetrygd", se: "Barnbidrag" }, descriptions: { da: "Se børne- og ungeydelse", no: "Se barnetrygden din", se: "Se ditt barnbidrag" } },
  { href: "/timepris", titles: { da: "Timepris", no: "Timepris", se: "Timpris" }, descriptions: { da: "Beregn din timepris", no: "Beregn timeprisen din", se: "Beräkna ditt timpris" } },
  { href: "/loen-konverter", titles: { da: "Lønberegner", no: "Lønnkalkulator", se: "Lönekalkylator" }, descriptions: { da: "Omregn timeløn, månedsløn og årsløn", no: "Omregn timelønn, månedslønn og årslønn", se: "Omvandla timlön, månadslön och årslön" } },
  // Lån & Bolig
  { href: "/boliglaan", titles: { da: "Boliglån", no: "Boliglån", se: "Bolån" }, descriptions: { da: "Beregn dit boliglån", no: "Beregn boliglånet ditt", se: "Beräkna ditt bolån" } },
  { href: "/renteberegner", titles: { da: "Renteberegner", no: "Rentekalkulator", se: "Räntekalkylator" }, descriptions: { da: "Beregn renter på lån", no: "Beregn renter på lån", se: "Beräkna ränta på lån" } },
  { href: "/husleje", daOnly: true, titles: { da: "Husleje", no: "Husleie", se: "Hyra" }, descriptions: { da: "Beregn rimelig husleje", no: "Beregn rimelig husleie", se: "Beräkna rimlig hyra" } },
  { href: "/boligstoette", daOnly: true, titles: { da: "Boligstøtte", no: "Bostøtte", se: "Bostadsbidrag" }, descriptions: { da: "Beregn din boligstøtte", no: "Beregn bostøtten din", se: "Beräkna ditt bostadsbidrag" } },
  { href: "/laaneberegner", titles: { da: "Låneberegner", no: "Lånekalkulator", se: "Lånekalkylator" }, descriptions: { da: "Beregn dit lån", no: "Beregn lånet ditt", se: "Beräkna ditt lån" } },
  { href: "/opsparing", titles: { da: "Opsparing", no: "Sparing", se: "Sparande" }, descriptions: { da: "Renters rente beregner", no: "Rentes rente kalkulator", se: "Ränta-på-ränta kalkylator" } },
  { href: "/budget", titles: { da: "Rådighedsbeløb", no: "Rådighetsbeløp", se: "Hushållsbudget" }, descriptions: { da: "Beregn dit rådighedsbeløb", no: "Beregn disponibelt beløp", se: "Räkna ut kvar att leva på" } },
  { href: "/afkast", titles: { da: "Afkastberegner", no: "Avkastningskalkulator", se: "Avkastningskalkylator" }, descriptions: { da: "Beregn ROI og årligt afkast", no: "Beregn ROI og årlig avkastning", se: "Beräkna ROI och årlig avkastning" } },
  { href: "/sparemaal", titles: { da: "Sparemål", no: "Sparemål", se: "Sparmål" }, descriptions: { da: "Hvor meget skal du spare op om måneden?", no: "Hvor mye bør du spare per måned?", se: "Hur mycket ska du spara per månad?" } },
  { href: "/loenstigning", titles: { da: "Lønstigning", no: "Lønnsøkning", se: "Löneökning" }, descriptions: { da: "Beregn lønstigning i procent", no: "Beregn lønnsøkning i prosent", se: "Beräkna löneökning i procent" } },
  { href: "/rentefradrag", daOnly: true, titles: { da: "Rentefradrag", no: "Rentefradrag", se: "Ränteavdrag" }, descriptions: { da: "Beregn dit rentefradrag", no: "Beregn rentefradraget ditt", se: "Beräkna ditt ränteavdrag" } },
  { href: "/billaan", titles: { da: "Billån", no: "Billån", se: "Billån" }, descriptions: { da: "Beregn dit billån", no: "Beregn billånet ditt", se: "Beräkna ditt billån" } },
  { href: "/forbrugslaan", titles: { da: "Forbrugslån", no: "Forbrukslån", se: "Konsumtionslån" }, descriptions: { da: "Beregn dit forbrugslån", no: "Beregn forbrukslånet ditt", se: "Beräkna ditt konsumtionslån" } },
  { href: "/ejendomsvaerdiskat", daOnly: true, titles: { da: "Ejendomsværdiskat", no: "Eiendomsskatt", se: "Fastighetsskatt" }, descriptions: { da: "Beregn din boligskat", no: "Beregn eiendomsskatten din", se: "Beräkna din fastighetsskatt" } },
  { href: "/arveafgift", daOnly: true, titles: { da: "Arveafgift", no: "Arveavgift", se: "Arvsskatt" }, descriptions: { da: "Beregn boafgift", no: "Beregn arveavgiften", se: "Beräkna arvsskatt" } },
  { href: "/topskat", daOnly: true, titles: { da: "Topskat", no: "Toppskatt", se: "Toppskatt" }, descriptions: { da: "Beregn din topskat", no: "Beregn toppskatten din", se: "Beräkna din toppskatt" } },
  { href: "/skattefradrag", daOnly: true, titles: { da: "Skattefradrag", no: "Skattefradrag", se: "Skatteavdrag" }, descriptions: { da: "Beregn dine skattefradrag", no: "Beregn skattefradragene dine", se: "Beräkna dina skatteavdrag" } },
  { href: "/aktieskat", daOnly: true, titles: { da: "Aktieskat", no: "Aksjeskatt", se: "Aktieskatt" }, descriptions: { da: "Beregn skat af aktier", no: "Beregn skatt av aksjer", se: "Beräkna skatt på aktier" } },
  { href: "/andelsbolig", daOnly: true, titles: { da: "Andelsbolig", no: "Andelsbolig", se: "Bostadsrätt" }, descriptions: { da: "Beregn andelsboligøkonomi", no: "Beregn andelsboligøkonomi", se: "Beräkna bostadsrättsekonomi" } },
  { href: "/studielaan", daOnly: true, titles: { da: "Studielån", no: "Studielån", se: "Studielån" }, descriptions: { da: "Beregn tilbagebetaling af SU-lån", no: "Beregn nedbetaling av studielån", se: "Beräkna återbetalning av studielån" } },
  // Moms & Procent
  { href: "/moms", titles: { da: "Moms", no: "Moms", se: "Moms" }, descriptions: { da: "Beregn moms til/fra", no: "Beregn moms til/fra", se: "Beräkna moms till/från" } },
  { href: "/procent", titles: { da: "Procent", no: "Prosent", se: "Procent" }, descriptions: { da: "Beregn procent nemt", no: "Beregn prosent enkelt", se: "Beräkna procent enkelt" } },
  // Sundhed
  { href: "/bmi", titles: { da: "BMI Beregner", no: "BMI Kalkulator", se: "BMI Kalkylator" }, descriptions: { da: "Beregn dit Body Mass Index", no: "Beregn din BMI", se: "Beräkna ditt BMI" } },
  { href: "/kalorier", titles: { da: "Kalorieberegner", no: "Kaloriekalkulator", se: "Kalorikalkylator" }, descriptions: { da: "Beregn kaloriebehov", no: "Beregn kaloribehovet ditt", se: "Beräkna ditt kaloribehov" } },
  { href: "/promille", titles: { da: "Promilleberegner", no: "Promillekalkulator", se: "Promillekalkylator" }, descriptions: { da: "Anslå din alkoholpromille", no: "Anslå alkoholpromillen din", se: "Uppskatta din alkoholpromille" } },
  { href: "/kropsfedt", titles: { da: "Kropsfedtprocent", no: "Kroppsfettprosent", se: "Kroppsfettprocent" }, descriptions: { da: "Beregn fedtprocent (Navy-metoden)", no: "Beregn fettprosent (Navy-metoden)", se: "Beräkna fettprocent (Navy-metoden)" } },
  { href: "/1rm", titles: { da: "1RM beregner", no: "1RM kalkulator", se: "1RM kalkylator" }, descriptions: { da: "Anslå dit maksimale løft", no: "Anslå ditt maksimale løft", se: "Uppskatta ditt maxlyft" } },
  { href: "/vandbehov", titles: { da: "Vandbehov", no: "Vannbehov", se: "Vattenbehov" }, descriptions: { da: "Hvor meget vand skal du drikke?", no: "Hvor mye vann bør du drikke?", se: "Hur mycket vatten ska du dricka?" } },
  { href: "/motion-kalorier", titles: { da: "Kalorieforbrænding", no: "Kaloriforbrenning", se: "Kaloriförbränning" }, descriptions: { da: "Forbrændte kalorier ved motion", no: "Forbrente kalorier ved trening", se: "Förbrända kalorier vid motion" } },
  { href: "/proteinbehov", titles: { da: "Proteinbehov", no: "Proteinbehov", se: "Proteinbehov" }, descriptions: { da: "Beregn dit daglige proteinbehov", no: "Beregn ditt daglige proteinbehov", se: "Beräkna ditt dagliga proteinbehov" } },
  { href: "/rygestop", daOnly: true, titles: { da: "Rygestop", no: "Røykeslutt", se: "Sluta röka" }, descriptions: { da: "Se hvad du sparer på at holde op med at ryge", no: "Se hvor mye du sparer på å slutte å røyke", se: "Se vad du sparar på att sluta röka" } },
  // Tid
  { href: "/dato", titles: { da: "Datoberegner", no: "Datokalkulator", se: "Datumkalkylator" }, descriptions: { da: "Dage mellem datoer", no: "Dager mellom datoer", se: "Dagar mellan datum" } },
  { href: "/tidsberegner", titles: { da: "Tidsberegner", no: "Tidskalkulator", se: "Tidskalkylator" }, descriptions: { da: "Beregn tid og varighed", no: "Beregn tid og varighet", se: "Beräkna tid och varaktighet" } },
  { href: "/tidszone", titles: { da: "Tidszone", no: "Tidssone", se: "Tidszon" }, descriptions: { da: "Omregn tidszoner", no: "Omregn tidssoner", se: "Omvandla tidszoner" } },
  { href: "/alder", titles: { da: "Alder", no: "Alder", se: "Ålder" }, descriptions: { da: "Beregn din præcise alder", no: "Beregn din nøyaktige alder", se: "Beräkna din exakta ålder" } },
  // Bil & Energi
  { href: "/bil", titles: { da: "Bil", no: "Bil", se: "Bil" }, descriptions: { da: "Beregn biludgifter", no: "Beregn bilutgifter", se: "Beräkna bilkostnader" } },
  { href: "/braendstof", titles: { da: "Brændstof", no: "Drivstoff", se: "Bränsle" }, descriptions: { da: "Beregn brændstofforbrug", no: "Beregn drivstofforbruk", se: "Beräkna bränsleförbrukning" } },
  { href: "/elbil", titles: { da: "Elbil vs. benzin", no: "Elbil vs. bensin", se: "Elbil vs. bensin" }, descriptions: { da: "Sammenlign elbil og benzinbil", no: "Sammenlign elbil og bensinbil", se: "Jämför elbil och bensinbil" } },
  { href: "/elberegner", titles: { da: "Elberegner", no: "Strømkalkulator", se: "Elkalkylator" }, descriptions: { da: "Beregn dit elforbrug", no: "Beregn strømforbruket ditt", se: "Beräkna din elförbrukning" } },
  // Andet
  { href: "/kvadratmeter", titles: { da: "Kvadratmeter", no: "Kvadratmeter", se: "Kvadratmeter" }, descriptions: { da: "Beregn areal", no: "Beregn areal", se: "Beräkna yta" } },
  { href: "/temperatur", titles: { da: "Temperatur", no: "Temperatur", se: "Temperatur" }, descriptions: { da: "Omregn °C, °F og Kelvin", no: "Omregn °C, °F og Kelvin", se: "Omvandla °C, °F och Kelvin" } },
  { href: "/gennemsnit", titles: { da: "Gennemsnit", no: "Gjennomsnitt", se: "Medelvärde" }, descriptions: { da: "Beregn gennemsnit og median", no: "Beregn gjennomsnitt og median", se: "Beräkna medelvärde och median" } },
  { href: "/brok", titles: { da: "Brøkberegner", no: "Brøkkalkulator", se: "Bråkkalkylator" }, descriptions: { da: "Forkort brøk til decimal og procent", no: "Forkort brøk til desimal og prosent", se: "Förkorta bråk till decimal och procent" } },
  { href: "/nedtaelling", titles: { da: "Nedtælling", no: "Nedtelling", se: "Nedräkning" }, descriptions: { da: "Hvor mange dage til en dato?", no: "Hvor mange dager til en dato?", se: "Hur många dagar till ett datum?" } },
  { href: "/ohm", titles: { da: "Ohms lov", no: "Ohms lov", se: "Ohms lag" }, descriptions: { da: "Beregn spænding, strøm og modstand", no: "Beregn spenning, strøm og motstand", se: "Beräkna spänning, ström och resistans" } },
  { href: "/planetvaegt", titles: { da: "Vægt på planeterne", no: "Vekt på planetene", se: "Vikt på planeterna" }, descriptions: { da: "Hvor meget vejer du på Mars?", no: "Hvor mye veier du på Mars?", se: "Hur mycket väger du på Mars?" } },
  { href: "/fart", titles: { da: "Fartberegner", no: "Fartkalkulator", se: "Hastighetskalkylator" }, descriptions: { da: "Beregn fart, distance og tid", no: "Beregn fart, distanse og tid", se: "Beräkna hastighet, sträcka och tid" } },
  { href: "/enheder", titles: { da: "Enhedsberegner", no: "Enhetskalkulator", se: "Enhetskalkylator" }, descriptions: { da: "Omregn længde, vægt og volumen", no: "Omregn lengde, vekt og volum", se: "Omvandla längd, vikt och volym" } },
  { href: "/del-regning", titles: { da: "Del regningen", no: "Del regningen", se: "Dela notan" }, descriptions: { da: "Fordel regningen mellem flere", no: "Fordel regningen mellom flere", se: "Fördela notan mellan flera" } },
  { href: "/enhedspris", titles: { da: "Enhedspris", no: "Enhetspris", se: "Jämförpris" }, descriptions: { da: "Find den billigste vare pr. enhed", no: "Finn den billigste varen per enhet", se: "Hitta den billigaste varan per enhet" } },
  { href: "/rabat", daOnly: true, titles: { da: "Rabatberegner", no: "Rabattkalkulator", se: "Rabattkalkylator" }, descriptions: { da: "Beregn pris efter rabat", no: "Beregn pris etter rabatt", se: "Beräkna pris efter rabatt" } },
  { href: "/valuta", titles: { da: "Valuta", no: "Valuta", se: "Valuta" }, descriptions: { da: "Omregn valutaer", no: "Omregn valutaer", se: "Omvandla valutor" } },
  { href: "/befordringsfradrag", daOnly: true, titles: { da: "Befordringsfradrag", no: "Befordringsfradrag", se: "Befordringsavdrag" }, descriptions: { da: "Beregn befordringsfradrag 2026", no: "Beregn befordringsfradrag", se: "Beräkna befordringsavdrag" } },
  // Yderligere
  { href: "/solceller", titles: { da: "Solceller", no: "Solceller", se: "Solceller" }, descriptions: { da: "Beregn solcelleøkonomi", no: "Beregn solcelleøkonomi", se: "Beräkna solcellsekonomi" } },
  { href: "/leasing", titles: { da: "Leasing", no: "Leasing", se: "Leasing" }, descriptions: { da: "Beregn leasingydelse", no: "Beregn leasingytelse", se: "Beräkna leasingavgift" } },
  { href: "/gaeldsfri", titles: { da: "Gældsfri", no: "Gjeldfri", se: "Skuldfri" }, descriptions: { da: "Beregn gældsafvikling", no: "Beregn gjeldsnedbetaling", se: "Beräkna skuldavbetalning" } },
  { href: "/brutto-netto", daOnly: true, titles: { da: "Brutto/Netto", no: "Brutto/Netto", se: "Brutto/Netto" }, descriptions: { da: "Beregn brutto og nettoløn", no: "Beregn brutto og nettolønn", se: "Beräkna brutto och nettolön" } },
  { href: "/konfirmation", titles: { da: "Konfirmation", no: "Konfirmasjon", se: "Konfirmation" }, descriptions: { da: "Beregn konfirmationsbudget", no: "Beregn konfirmasjonsbudsjett", se: "Beräkna konfirmationsbudget" } },
  { href: "/bryllup", titles: { da: "Bryllup", no: "Bryllup", se: "Bröllop" }, descriptions: { da: "Beregn bryllupsbudget", no: "Beregn bryllupsbudsjett", se: "Beräkna bröllopsbudget" } },
  { href: "/rejsebudget", titles: { da: "Rejsebudget", no: "Reisebudsjett", se: "Resebudget" }, descriptions: { da: "Beregn dit rejsebudget", no: "Beregn reisebudsjettet ditt", se: "Beräkna din resebudget" } },
  { href: "/vaegttab", titles: { da: "Vægttab", no: "Vekttap", se: "Viktminskning" }, descriptions: { da: "Beregn vægttab", no: "Beregn vekttap", se: "Beräkna viktminskning" } },
  { href: "/termin", titles: { da: "Terminsdato", no: "Termindato", se: "Beräknat datum" }, descriptions: { da: "Beregn terminsdato", no: "Beregn termindato", se: "Beräkna förlossningsdatum" } },
  { href: "/aegloesning", titles: { da: "Ægløsning", no: "Eggløsning", se: "Ägglossning" }, descriptions: { da: "Find dine frugtbare dage", no: "Finn dine fruktbare dager", se: "Hitta dina fertila dagar" } },
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
    .filter((d) => (d.daOnly ? locale === "da" : d.seOnly ? locale === "se" : true))
    .map((d) => ({
      title: d.titles[locale] || d.titles.da,
      description: d.descriptions[locale] || d.descriptions.da,
      href: d.href,
    }));
}

// Map related calculators by topic
const relatedMap: Record<string, string[]> = {
  "/loen-efter-skat": ["/feriepenge", "/dagpenge", "/pension", "/topskat", "/rentefradrag"],
  "/lon-efter-skatt": ["/moms", "/procent", "/laaneberegner", "/opsparing", "/timepris"],
  "/bolan": ["/laaneberegner", "/renteberegner", "/opsparing", "/lon-efter-skatt", "/valuta"],
  "/dagpenge": ["/loen-efter-skat", "/sygedagpenge", "/efterloen", "/barselsdagpenge", "/feriepenge"],
  "/feriepenge": ["/loen-efter-skat", "/dagpenge", "/barselsdagpenge", "/pension", "/timepris"],
  "/su": ["/loen-efter-skat", "/studielaan", "/boernepenge", "/boligstoette", "/dagpenge"],
  "/pension": ["/loen-efter-skat", "/efterloen", "/opsparing", "/arveafgift", "/feriepenge"],
  "/efterloen": ["/pension", "/dagpenge", "/loen-efter-skat", "/arveafgift", "/opsparing"],
  "/barselsdagpenge": ["/boernepenge", "/dagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/boernepenge": ["/barselsdagpenge", "/su", "/boligstoette", "/loen-efter-skat", "/dagpenge"],
  "/timepris": ["/loen-efter-skat", "/moms", "/procent", "/feriepenge", "/dagpenge"],
  "/loen-konverter": ["/loen-efter-skat", "/timepris", "/brutto-netto", "/feriepenge", "/procent"],
  "/enhedspris": ["/procent", "/moms", "/rabat", "/valuta", "/budget"],
  "/rabat": ["/procent", "/enhedspris", "/moms", "/budget", "/del-regning"],
  "/temperatur": ["/procent", "/kvadratmeter", "/gennemsnit", "/valuta", "/tidszone"],
  "/gennemsnit": ["/procent", "/temperatur", "/kvadratmeter", "/moms", "/dato"],
  "/fart": ["/tidsberegner", "/braendstof", "/kalorier", "/temperatur", "/dato"],
  "/enheder": ["/temperatur", "/kvadratmeter", "/procent", "/gennemsnit", "/valuta"],
  "/del-regning": ["/procent", "/rabat", "/budget", "/rejsebudget", "/enhedspris"],
  "/boliglaan": ["/renteberegner", "/laaneberegner", "/andelsbolig", "/ejendomsvaerdiskat", "/rentefradrag"],
  "/renteberegner": ["/boliglaan", "/laaneberegner", "/opsparing", "/procent", "/rentefradrag"],
  "/husleje": ["/boligstoette", "/boliglaan", "/ejendomsvaerdiskat", "/loen-efter-skat", "/kvadratmeter"],
  "/boligstoette": ["/husleje", "/boernepenge", "/loen-efter-skat", "/su", "/dagpenge"],
  "/laaneberegner": ["/boliglaan", "/renteberegner", "/billaan", "/forbrugslaan", "/rentefradrag"],
  "/opsparing": ["/renteberegner", "/pension", "/aktieskat", "/laaneberegner", "/loen-efter-skat"],
  "/budget": ["/loen-efter-skat", "/opsparing", "/gaeldsfri", "/rygestop", "/laaneberegner"],
  "/afkast": ["/opsparing", "/renteberegner", "/aktieskat", "/procent", "/pension"],
  "/sparemaal": ["/opsparing", "/afkast", "/renteberegner", "/budget", "/pension"],
  "/loenstigning": ["/loen-efter-skat", "/loen-konverter", "/procent", "/timepris", "/brutto-netto"],
  "/ohm": ["/procent", "/enheder", "/elberegner", "/temperatur", "/kvadratmeter"],
  "/planetvaegt": ["/enheder", "/procent", "/temperatur", "/gennemsnit", "/kvadratmeter"],
  "/aegloesning": ["/termin", "/nedtaelling", "/dato", "/alder", "/bmi"],
  "/brok": ["/procent", "/gennemsnit", "/kvadratmeter", "/temperatur", "/enheder"],
  "/nedtaelling": ["/dato", "/alder", "/tidsberegner", "/termin", "/tidszone"],
  "/rentefradrag": ["/boliglaan", "/renteberegner", "/laaneberegner", "/skattefradrag", "/loen-efter-skat"],
  "/billaan": ["/bil", "/laaneberegner", "/renteberegner", "/forbrugslaan", "/braendstof"],
  "/forbrugslaan": ["/laaneberegner", "/renteberegner", "/billaan", "/boliglaan", "/rentefradrag"],
  "/ejendomsvaerdiskat": ["/boliglaan", "/boligstoette", "/husleje", "/rentefradrag", "/loen-efter-skat"],
  "/arveafgift": ["/pension", "/efterloen", "/loen-efter-skat", "/opsparing", "/rentefradrag"],
  "/moms": ["/procent", "/timepris", "/loen-efter-skat", "/valuta", "/renteberegner"],
  "/procent": ["/moms", "/rabat", "/renteberegner", "/opsparing", "/bmi"],
  "/bmi": ["/kalorier", "/alder", "/procent", "/dato", "/tidsberegner"],
  "/kalorier": ["/bmi", "/procent", "/alder", "/dato", "/tidsberegner"],
  "/promille": ["/bmi", "/kalorier", "/rygestop", "/alder", "/procent"],
  "/rygestop": ["/opsparing", "/sparemaal", "/budget", "/promille", "/vaegttab"],
  "/kropsfedt": ["/bmi", "/kalorier", "/vaegttab", "/promille", "/procent"],
  "/1rm": ["/kalorier", "/kropsfedt", "/bmi", "/vaegttab", "/procent"],
  "/vandbehov": ["/kalorier", "/bmi", "/kropsfedt", "/motion-kalorier", "/proteinbehov"],
  "/motion-kalorier": ["/kalorier", "/vaegttab", "/bmi", "/vandbehov", "/proteinbehov"],
  "/proteinbehov": ["/kalorier", "/bmi", "/motion-kalorier", "/vandbehov", "/vaegttab"],
  "/dato": ["/tidsberegner", "/alder", "/tidszone", "/feriepenge", "/pension"],
  "/tidsberegner": ["/dato", "/tidszone", "/alder", "/timepris", "/kalorier"],
  "/tidszone": ["/dato", "/tidsberegner", "/valuta", "/alder", "/timepris"],
  "/alder": ["/dato", "/pension", "/bmi", "/tidsberegner", "/efterloen"],
  "/bil": ["/braendstof", "/billaan", "/elberegner", "/forbrugslaan", "/loen-efter-skat"],
  "/braendstof": ["/bil", "/elberegner", "/procent", "/valuta", "/kvadratmeter"],
  "/elbil": ["/braendstof", "/bil", "/elberegner", "/leasing", "/billaan"],
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
  "/skattefradrag": ["/rentefradrag", "/loen-efter-skat", "/topskat", "/befordringsfradrag", "/boliglaan"],
  "/befordringsfradrag": ["/skattefradrag", "/topskat", "/loen-efter-skat", "/rentefradrag", "/boliglaan"],
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
