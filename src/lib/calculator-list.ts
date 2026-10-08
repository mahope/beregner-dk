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
  { href: "/barselsplanlaegger", daOnly: true, titles: { da: "Barselsplanlægger", no: "Barselsplanlægger", se: "Barselsplanlægger" }, descriptions: { da: "Planlæg barsel uge for uge", no: "Planlæg barsel uge for uge", se: "Planlæg barsel uge for uge" } },
  { href: "/barselsdagpenge", daOnly: true, titles: { da: "Barselsdagpenge", no: "Foreldrepenger", se: "Föräldrapenning" }, descriptions: { da: "Beregn barselsdagpenge", no: "Beregn foreldrepenger", se: "Beräkna föräldrapenning" } },
  { href: "/boernepenge", daOnly: true, titles: { da: "Børnepenge", no: "Barnetrygd", se: "Barnbidrag" }, descriptions: { da: "Se børne- og ungeydelse", no: "Se barnetrygden din", se: "Se ditt barnbidrag" } },
  { href: "/timepris", titles: { da: "Timepris", no: "Timepris", se: "Timpris" }, descriptions: { da: "Beregn din timepris", no: "Beregn timeprisen din", se: "Beräkna ditt timpris" } },
  { href: "/loen-konverter", titles: { da: "Lønberegner", no: "Lønnkalkulator", se: "Lönekalkylator" }, descriptions: { da: "Omregn timeløn, månedsløn og årsløn", no: "Omregn timelønn, månedslønn og årslønn", se: "Omvandla timlön, månadslön och årslön" } },
  // Lån & Bolig
  { href: "/boliglaan", titles: { da: "Boliglån", no: "Boliglån", se: "Bolån" }, descriptions: { da: "Beregn dit boliglån", no: "Beregn boliglånet ditt", se: "Beräkna ditt bolån" } },
  { href: "/renteberegner", titles: { da: "Renteberegner", no: "Rentekalkulator", se: "Räntekalkylator" }, descriptions: { da: "Beregn renter på lån", no: "Beregn renter på lån", se: "Beräkna ränta på lån" } },
  { href: "/husleje", daOnly: true, titles: { da: "Husleje", no: "Husleie", se: "Hyra" }, descriptions: { da: "Beregn rimelig husleje", no: "Beregn rimelig husleie", se: "Beräkna rimlig hyra" } },
  { href: "/boligstoette", daOnly: true, titles: { da: "Boligstøtte", no: "Bostøtte", se: "Bostadsbidrag" }, descriptions: { da: "Se standardmaksima og formuegrænser", no: "Beregn bostøtten din", se: "Beräkna ditt bostadsbidrag" } },
  { href: "/laaneberegner", titles: { da: "Låneberegner", no: "Lånekalkulator", se: "Lånekalkylator" }, descriptions: { da: "Beregn dit lån", no: "Beregn lånet ditt", se: "Beräkna ditt lån" } },
  { href: "/opsparing", titles: { da: "Opsparing", no: "Sparing", se: "Sparande" }, descriptions: { da: "Renters rente beregner", no: "Rentes rente kalkulator", se: "Ränta-på-ränta kalkylator" } },
  { href: "/budget", titles: { da: "Rådighedsbeløb", no: "Rådighetsbeløp", se: "Hushållsbudget" }, descriptions: { da: "Beregn dit rådighedsbeløb", no: "Beregn disponibelt beløp", se: "Räkna ut kvar att leva på" } },
  { href: "/afkast", titles: { da: "Afkastberegner", no: "Avkastningskalkulator", se: "Avkastningskalkylator" }, descriptions: { da: "Beregn ROI og årligt afkast", no: "Beregn ROI og årlig avkastning", se: "Beräkna ROI och årlig avkastning" } },
  { href: "/sparemaal", titles: { da: "Sparemål", no: "Sparemål", se: "Sparmål" }, descriptions: { da: "Hvor meget skal du spare op om måneden?", no: "Hvor mye bør du spare per måned?", se: "Hur mycket ska du spara per månad?" } },
  { href: "/loenstigning", titles: { da: "Lønstigning", no: "Lønnsøkning", se: "Löneökning" }, descriptions: { da: "Beregn lønstigning i procent", no: "Beregn lønnsøkning i prosent", se: "Beräkna löneökning i procent" } },
  { href: "/renteprognose", daOnly: true, titles: { da: "Renteprognose", no: "Renteprognose", se: "Ränteprognos" }, descriptions: { da: "Se hvad dit boliglån koster om 5, 10 og 30 år", no: "Se hva bolånet ditt koster om 5, 10 og 30 år", se: "Se vad ditt bolån kostar om 5, 10 och 30 år" } },
  { href: "/rentefradrag", daOnly: true, titles: { da: "Rentefradrag", no: "Rentefradrag", se: "Ränteavdrag" }, descriptions: { da: "Beregn dit rentefradrag", no: "Beregn rentefradraget ditt", se: "Beräkna ditt ränteavdrag" } },
  { href: "/billaan", titles: { da: "Billån", no: "Billån", se: "Billån" }, descriptions: { da: "Beregn dit billån", no: "Beregn billånet ditt", se: "Beräkna ditt billån" } },
  { href: "/forbrugslaan", titles: { da: "Forbrugslån", no: "Forbrukslån", se: "Konsumtionslån" }, descriptions: { da: "Beregn dit forbrugslån", no: "Beregn forbrukslånet ditt", se: "Beräkna ditt konsumtionslån" } },
  { href: "/ejendomsvaerdiskat", daOnly: true, titles: { da: "Ejendomsværdiskat", no: "Eiendomsskatt", se: "Fastighetsskatt" }, descriptions: { da: "Beregn din boligskat", no: "Beregn eiendomsskatten din", se: "Beräkna din fastighetsskatt" } },
  { href: "/arveafgift", daOnly: true, titles: { da: "Arveafgift", no: "Arveavgift", se: "Arvsskatt" }, descriptions: { da: "Beregn boafgift", no: "Beregn arveavgiften", se: "Beräkna arvsskatt" } },
  { href: "/gaveafgift", daOnly: true, titles: { da: "Gaveafgift", no: "Gaveavgift", se: "Gåvoskatt" }, descriptions: { da: "Beregn gaveafgift og afgiftsfri gave", no: "Beregn gaveavgift", se: "Beräkna gåvoskatt" } },
  { href: "/kirkeskat", daOnly: true, titles: { da: "Kirkeskat", no: "Kirkeskat", se: "Kyrkoskatt" }, descriptions: { da: "Beregn din kirkeskat", no: "Beregn kirkeskatten din", se: "Beräkna din kyrkoskatt" } },
  { href: "/skatteprocent", daOnly: true, titles: { da: "Skatteprocent", no: "Skatteprocent", se: "Skatteprocent" }, descriptions: { da: "Beregn din samlede skat", no: "Beregn den samlede skatten din", se: "Beräkna din totala skatt" } },
  { href: "/topskat", daOnly: true, titles: { da: "Topskat", no: "Toppskatt", se: "Toppskatt" }, descriptions: { da: "Beregn din topskat", no: "Beregn toppskatten din", se: "Beräkna din toppskatt" } },
  { href: "/skattefradrag", daOnly: true, titles: { da: "Skattefradrag", no: "Skattefradrag", se: "Skatteavdrag" }, descriptions: { da: "Beregn dine skattefradrag", no: "Beregn skattefradragene dine", se: "Beräkna dina skatteavdrag" } },
  { href: "/aktieskat", daOnly: true, titles: { da: "Aktieskat", no: "Aksjeskatt", se: "Aktieskatt" }, descriptions: { da: "Beregn skat af aktier", no: "Beregn skatt av aksjer", se: "Beräkna skatt på aktier" } },
  { href: "/andelsbolig", daOnly: true, titles: { da: "Andelsbolig", no: "Andelsbolig", se: "Bostadsrätt" }, descriptions: { da: "Beregn andelsboligøkonomi", no: "Beregn andelsboligøkonomi", se: "Beräkna bostadsrättsekonomi" } },
  { href: "/studielaan", daOnly: true, titles: { da: "Studielån", no: "Studielån", se: "Studielån" }, descriptions: { da: "Beregn tilbagebetaling af SU-lån", no: "Beregn nedbetaling av studielån", se: "Beräkna återbetalning av studielån" } },
  // Moms & Procent
  { href: "/moms", titles: { da: "Moms", no: "Moms", se: "Moms" }, descriptions: { da: "Beregn moms til/fra", no: "Beregn moms til/fra", se: "Beräkna moms till/från" } },
  { href: "/procent", titles: { da: "Procent", no: "Prosent", se: "Procent" }, descriptions: { da: "Beregn procent nemt", no: "Beregn prosent enkelt", se: "Beräkna procent enkelt" } },
  // Sundhed
  { href: "/bmi", titles: { da: "BMI Beregner for voksne", no: "BMI Kalkulator for voksne", se: "BMI Kalkylator för vuxna" }, descriptions: { da: "Beregn BMI for voksne", no: "Beregn BMI for voksne", se: "Beräkna BMI för vuxna" } },
  { href: "/kalorier", titles: { da: "Kalorieberegner", no: "Kaloriekalkulator", se: "Kalorikalkylator" }, descriptions: { da: "Beregn kaloriebehov", no: "Beregn kaloribehovet ditt", se: "Beräkna ditt kaloribehov" } },
  { href: "/promille", titles: { da: "Promilleberegner", no: "Promillekalkulator", se: "Promillekalkylator" }, descriptions: { da: "Anslå din alkoholpromille", no: "Anslå alkoholpromillen din", se: "Uppskatta din alkoholpromille" } },
  { href: "/kropsfedt", titles: { da: "Kropsfedtprocent", no: "Kroppsfettprosent", se: "Kroppsfettprocent" }, descriptions: { da: "Beregn fedtprocent (Navy-metoden)", no: "Beregn fettprosent (Navy-metoden)", se: "Beräkna fettprocent (Navy-metoden)" } },
  { href: "/1rm", titles: { da: "1RM beregner", no: "1RM kalkulator", se: "1RM kalkylator" }, descriptions: { da: "Anslå dit maksimale løft", no: "Anslå ditt maksimale løft", se: "Uppskatta ditt maxlyft" } },
  { href: "/vandbehov", titles: { da: "Vandbehov", no: "Vannbehov", se: "Vattenbehov" }, descriptions: { da: "Hvor meget vand skal du drikke?", no: "Hvor mye vann bør du drikke?", se: "Hur mycket vatten ska du dricka?" } },
  { href: "/skridt", titles: { da: "Skridt til km", no: "Skritt til km", se: "Steg till km" }, descriptions: { da: "Omregn skridt til km, tid og kalorier", no: "Omregn skritt til km, tid og kalorier", se: "Räkna om steg till km, tid och kalorier" } },
  { href: "/motion-kalorier", titles: { da: "Kalorieforbrænding", no: "Kaloriforbrenning", se: "Kaloriförbränning" }, descriptions: { da: "Forbrændte kalorier ved motion", no: "Forbrente kalorier ved trening", se: "Förbrända kalorier vid motion" } },
  { href: "/proteinbehov", titles: { da: "Proteinbehov", no: "Proteinbehov", se: "Proteinbehov" }, descriptions: { da: "Beregn dit daglige proteinbehov", no: "Beregn ditt daglige proteinbehov", se: "Beräkna ditt dagliga proteinbehov" } },
  { href: "/protein-i-madvarer", daOnly: true, titles: { da: "Protein i madvarer", no: "Protein i matvarer", se: "Protein i livsmedel" }, descriptions: { da: "Protein pr. 100 g i æg, kylling og andre madvarer", no: "Se protein per 100 g", se: "Se protein per 100 g" } },
  { href: "/kulhydrater-i-madvarer", daOnly: true, titles: { da: "Kulhydrater i madvarer", no: "Karbohydrater i matvarer", se: "Kolhydrater i livsmedel" }, descriptions: { da: "Kulhydrat pr. 100 g i banan, kartoffel og andre madvarer", no: "Se karbohydrater per 100 g", se: "Se kolhydrater per 100 g" } },
  { href: "/salt-i-madvarer", daOnly: true, titles: { da: "Salt i madvarer", no: "Salt i matvarer", se: "Salt i livsmedel" }, descriptions: { da: "Natrium pr. 100 g i rugbrød, smør og skinke — omregnet til salt", no: "Natrium per 100 g", se: "Natrium per 100 g" } },
  { href: "/fedt-i-madvarer", daOnly: true, titles: { da: "Fedt i madvarer", no: "Fett i matvarer", se: "Fett i livsmedel" }, descriptions: { da: "Fedt pr. 100 g i æg, avocado og andre madvarer", no: "Se fett per 100 g", se: "Se fett per 100 g" } },
  { href: "/sukker-i-madvarer", daOnly: true, titles: { da: "Sukker i madvarer", no: "Sukker i matvarer", se: "Socker i livsmedel" }, descriptions: { da: "Sukker pr. 100 g i banan, æble og andre madvarer", no: "Se sukker per 100 g", se: "Se socker per 100 g" } },
  { href: "/soevnbehov", titles: { da: "Søvnbehov", no: "Søvnbehov", se: "Sömnbehov" }, descriptions: { da: "Hvor meget søvn har du brug for?", no: "Hvor mye søvn trenger du?", se: "Hur mycket sömn behöver du?" } },
  { href: "/koffein", titles: { da: "Koffein", no: "Koffein", se: "Koffein" }, descriptions: { da: "Hvor meget koffein får du om dagen?", no: "Hvor mye koffein får du per dag?", se: "Hur mycket koffein får du per dag?" } },
  { href: "/kalorier-i-alkohol", daOnly: true, titles: { da: "Kalorier i alkohol", no: "Kalorier i alkohol", se: "Kalorier i alkohol" }, descriptions: { da: "Hvor mange kalorier er der i øl, vin og sprits?", no: "Hvor mange kalorier er det i øl, vin og sprit?", se: "Hur många kalorier finns i öl, vin och sprit?" } },
  { href: "/rygestop", daOnly: true, titles: { da: "Rygestop", no: "Røykeslutt", se: "Sluta röka" }, descriptions: { da: "Se hvad du sparer på at holde op med at ryge", no: "Se hvor mye du sparer på å slutte å røyke", se: "Se vad du sparar på att sluta röka" } },
  { href: "/alkoholenheder", daOnly: true, titles: { da: "Alkoholenheder", no: "Alkoholenheter", se: "Alkoholenheter" }, descriptions: { da: "Beregn antal genstande ud fra mængde og alkoholprocent", no: "Beregn alkoholenheter ut fra mengde og alkoholprosent", se: "Beräkna alkoholenheter utifrån mängd och alkoholprocent" } },
  // Tid
  { href: "/dato", titles: { da: "Datoberegner", no: "Datokalkulator", se: "Datumkalkylator" }, descriptions: { da: "Dage mellem datoer", no: "Dager mellom datoer", se: "Dagar mellan datum" } },
  { href: "/pace", titles: { da: "Løbetidsberegner", no: "Løpetidskalkulator", se: "Löptidsberäknare" }, descriptions: { da: "Beregn tempo og holdtider", no: "Beregn tempo og deltider", se: "Beräkna pace och deltider" } },
  { href: "/tidsberegner", titles: { da: "Tidsberegner", no: "Tidskalkulator", se: "Tidskalkylator" }, descriptions: { da: "Beregn tid og varighed", no: "Beregn tid og varighet", se: "Beräkna tid och varaktighet" } },
  { href: "/tidszone", titles: { da: "Tidszone", no: "Tidssone", se: "Tidszon" }, descriptions: { da: "Omregn tidszoner", no: "Omregn tidssoner", se: "Omvandla tidszoner" } },
  { href: "/alder", titles: { da: "Alder", no: "Alder", se: "Ålder" }, descriptions: { da: "Beregn din præcise alder", no: "Beregn din nøyaktige alder", se: "Beräkna din exakta ålder" } },
  // Bil & Energi
  { href: "/bil", titles: { da: "Bil", no: "Bil", se: "Bil" }, descriptions: { da: "Beregn biludgifter", no: "Beregn bilutgifter", se: "Beräkna bilkostnader" } },
  { href: "/braendstof", titles: { da: "Brændstof", no: "Drivstoff", se: "Bränsle" }, descriptions: { da: "Beregn brændstofforbrug", no: "Beregn drivstofforbruk", se: "Beräkna bränsleförbrukning" } },
  { href: "/elbil", titles: { da: "Elbil vs. benzin", no: "Elbil vs. bensin", se: "Elbil vs. bensin" }, descriptions: { da: "Sammenlign elbil og benzinbil", no: "Sammenlign elbil og bensinbil", se: "Jämför elbil och bensinbil" } },
  { href: "/elberegner", titles: { da: "Elberegner", no: "Strømkalkulator", se: "Elkalkylator" }, descriptions: { da: "Beregn dit elforbrug", no: "Beregn strømforbruket ditt", se: "Beräkna din elförbrukning" } },
  { href: "/elbil-lading", titles: { da: "Elbil-lading", no: "Elbil-lading", se: "Laddkostnad elbil" }, descriptions: { da: "Beregn prisen for at lade elbilen", no: "Beregn prisen for å lade elbilen", se: "Beräkna kostnaden för att ladda elbilen" } },
  // Andet
  { href: "/kvadratmeter", titles: { da: "Kvadratmeter", no: "Kvadratmeter", se: "Kvadratmeter" }, descriptions: { da: "Beregn areal", no: "Beregn areal", se: "Beräkna yta" } },
  { href: "/temperatur", titles: { da: "Temperatur", no: "Temperatur", se: "Temperatur" }, descriptions: { da: "Omregn °C, °F og Kelvin", no: "Omregn °C, °F og Kelvin", se: "Omvandla °C, °F och Kelvin" } },
  { href: "/gennemsnit", titles: { da: "Gennemsnit", no: "Gjennomsnitt", se: "Medelvärde" }, descriptions: { da: "Beregn gennemsnit og median", no: "Beregn gjennomsnitt og median", se: "Beräkna medelvärde och median" } },
  { href: "/brok", titles: { da: "Brøkberegner", no: "Brøkkalkulator", se: "Bråkkalkylator" }, descriptions: { da: "Forkort brøk til decimal og procent", no: "Forkort brøk til desimal og prosent", se: "Förkorta bråk till decimal och procent" } },
  { href: "/nedtaelling", titles: { da: "Nedtælling", no: "Nedtelling", se: "Nedräkning" }, descriptions: { da: "Hvor mange dage til en dato?", no: "Hvor mange dager til en dato?", se: "Hur många dagar till ett datum?" } },
  { href: "/ohm", titles: { da: "Ohms lov", no: "Ohms lov", se: "Ohms lag" }, descriptions: { da: "Beregn spænding, strøm og modstand", no: "Beregn spenning, strøm og motstand", se: "Beräkna spänning, ström och resistans" } },
  { href: "/rumfang", titles: { da: "Rumfang", no: "Volum", se: "Volym" }, descriptions: { da: "Beregn rumfang i m³", no: "Beregn volum i m³", se: "Beräkna volym i m³" } },
  { href: "/areal", titles: { da: "Areal", no: "Areal", se: "Area" }, descriptions: { da: "Beregn areal af cirkel, trekant og flerkanter", no: "Beregn areal av sirkel, trekant og mangekanter", se: "Beräkna area av cirkel, triangel och månghörningar" } },
  { href: "/omkreds", titles: { da: "Omkreds", no: "Omkrets", se: "Omkrets" }, descriptions: { da: "Beregn omkreds af cirkel, trekant og flerkanter", no: "Beregn omkrets av sirkel, trekant og mangekanter", se: "Beräkna omkrets av cirkel, triangel och månghörningar" } },
  { href: "/retvinklet-trekant", titles: { da: "Retvinklet trekant", no: "Retvinklet trekant", se: "Rätvinklig triangel" }, descriptions: { da: "Beregn hypotenuse, katete og vinkler med Pythagoras", no: "Beregn hypotenuse, katet og vinkler med Pythagoras", se: "Beräkna hypotenusa, katet och vinklar med Pythagoras" } },
  { href: "/laantype", titles: { da: "Lånetype", no: "Lånetype", se: "Lånetyp" }, descriptions: { da: "Annuitetslån, serielån og stående lån", no: "Annuitetslån, serielån og stående lån", se: "Annuitetslån, serielån och stående lån" } },
  { href: "/idealvaegt", titles: { da: "Idealvægt", no: "Idealvekt", se: "Idealvikt" }, descriptions: { da: "Devines og Hamwis formel", no: "Devines og Hamwis formel", se: "Devines och Hamwis formel" } },
  { href: "/planetvaegt", titles: { da: "Vægt på planeterne", no: "Vekt på planetene", se: "Vikt på planeterna" }, descriptions: { da: "Hvor meget vejer du på Mars?", no: "Hvor mye veier du på Mars?", se: "Hur mycket väger du på Mars?" } },
  { href: "/hundealder", titles: { da: "Hundeår", no: "Hundeår", se: "Hundår" }, descriptions: { da: "Omregn hundeår til menneskeår", no: "Omregn hundeår til menneskeår", se: "Omvandla hundår till människoår" } },
  { href: "/fart", titles: { da: "Fartberegner", no: "Fartkalkulator", se: "Hastighetskalkylator" }, descriptions: { da: "Beregn fart, distance og tid", no: "Beregn fart, distanse og tid", se: "Beräkna hastighet, sträcka och tid" } },
  { href: "/enheder", titles: { da: "Enhedsberegner", no: "Enhetskalkulator", se: "Enhetskalkylator" }, descriptions: { da: "Omregn længde, vægt og volumen", no: "Omregn lengde, vekt og volum", se: "Omvandla längd, vikt och volym" } },
  { href: "/del-regning", titles: { da: "Del regningen", no: "Del regningen", se: "Dela notan" }, descriptions: { da: "Fordel regningen mellem flere", no: "Fordel regningen mellom flere", se: "Fördela notan mellan flera" } },
  { href: "/enhedspris", titles: { da: "Enhedspris", no: "Enhetspris", se: "Jämförpris" }, descriptions: { da: "Find den billigste vare pr. enhed", no: "Finn den billigste varen per enhet", se: "Hitta den billigaste varan per enhet" } },
  { href: "/brokost", daOnly: true, titles: { da: "Brokost Storebælt og Øresund", no: "Brokost Storebælt og Øresund", se: "Brokost Storebælt og Øresund" }, descriptions: { da: "Pris for at krydse Storebælt og Øresund", no: "Pris for å krysse Storebælt og Øresund", se: "Pris för att korsa Storebælt och Öresund" } },
  { href: "/rabat", daOnly: true, titles: { da: "Rabatberegner", no: "Rabattkalkulator", se: "Rabattkalkylator" }, descriptions: { da: "Beregn pris efter rabat", no: "Beregn pris etter rabatt", se: "Beräkna pris efter rabatt" } },
  { href: "/valuta", titles: { da: "Valuta", no: "Valuta", se: "Valuta" }, descriptions: { da: "Omregn valutaer", no: "Omregn valutaer", se: "Omvandla valutor" } },
  { href: "/befordringsfradrag", daOnly: true, titles: { da: "Befordringsfradrag", no: "Befordringsfradrag", se: "Befordringsavdrag" }, descriptions: { da: "Beregn befordringsfradrag 2026", no: "Beregn befordringsfradrag", se: "Beräkna befordringsavdrag" } },
  { href: "/nutidskroner", daOnly: true, titles: { da: "Nutidskroner", no: "Nutidskroner", se: "Nutidskroner" }, descriptions: { da: "Omregn et gammelt beløb til dagens prisniveau", no: "Omregn et gammelt beløp til dagens prisnivå", se: "Räkna om ett gammalt belopp till dagens prisnivå" } },
  { href: "/maling", daOnly: true, titles: { da: "Malingberegner", no: "Malingskalkulator", se: "Färgkalkylator" }, descriptions: { da: "Beregn hvor mange liter maling du skal bruge", no: "Beregn hvor mange liter maling du trenger", se: "Beräkna hur många liter färg du behöver" } },
  { href: "/fliser", daOnly: true, titles: { da: "Fliseberegner", no: "Fliskalkulator", se: "Kakelkalkylator" }, descriptions: { da: "Beregn hvor mange fliser og kasser du skal bruge", no: "Beregn hvor mange fliser og esker du trenger", se: "Beräkna hur många kakelplattor och paket du behöver" } },
  { href: "/sand-og-grus", daOnly: true, titles: { da: "Sand og grus", no: "Sand og grus", se: "Sand och grus" }, descriptions: { da: "Beregn hvor meget sand og grus du skal bruge", no: "Beregn hvor mye sand og grus du trenger", se: "Beräkna hur mycket sand och grus du behöver" } },
  { href: "/gram-til-dl", daOnly: true, titles: { da: "Gram til dl", no: "Gram til dl", se: "Gram till dl" }, descriptions: { da: "Omregn gram til dl og dl til gram for mel, sukker og gryn", no: "Omregn gram til dl og dl til gram", se: "Omvandla gram till dl och dl till gram" } },
  { href: "/portioner", daOnly: true, titles: { da: "Portioner pr. person", no: "Porsjoner per person", se: "Portioner per person" }, descriptions: { da: "Beregn hvor meget mad der skal bruges pr. person", no: "Beregn hvor mye mat du trenger per person", se: "Beräkna hur mycket mat som behövs per person" } },
  { href: "/kalorier-i-opskrift", daOnly: true, titles: { da: "Kalorier i opskrift", no: "Kalorier i oppskrift", se: "Kalorier i oppskrift" }, descriptions: { da: "Beregn kalorier og makroer pr. portion i en opskrift", no: "Beregn kalorier og makroer per porsjon i en oppskrift", se: "Beräkna kalorier och makronäringsämnen per portion i ett recept" } },
  { href: "/tv-storrelse", daOnly: true, titles: { da: "TV-størrelse", no: "TV-størrelse", se: "TV-storlek" }, descriptions: { da: "Omregn tv'ets tommer til cm og se seerafstanden", no: "Regn om TV-ets tommer til cm og se seeravstanden", se: "Räkna om tv:ns tum till cm och se tittaravståndet" } },
  { href: "/laanekapacitet", daOnly: true, titles: { da: "Lånekapacitet", no: "Lånekapasitet", se: "Lånekapacitet" }, descriptions: { da: "Beregn hvor meget du kan låne til bolig", no: "Beregn hvor mye du kan låne til bolig", se: "Beräkna hur mycket du kan låna till bostad" } },
  { href: "/byggepris", daOnly: true, titles: { da: "Byggepris", no: "Byggepris", se: "Byggpris" }, descriptions: { da: "Beregn hvad det koster at bygge et hus", no: "Beregn hvor mye det koster å bygge et hus", se: "Beräkna vad det kostar att bygga ett hus" } },
  // Yderligere
  { href: "/solceller", titles: { da: "Solceller", no: "Solceller", se: "Solceller" }, descriptions: { da: "Beregn solcelleøkonomi", no: "Beregn solcelleøkonomi", se: "Beräkna solcellsekonomi" } },
  { href: "/leasing", titles: { da: "Leasing", no: "Leasing", se: "Leasing" }, descriptions: { da: "Beregn leasingydelse", no: "Beregn leasingytelse", se: "Beräkna leasingavgift" } },
  { href: "/gaeldsfri", titles: { da: "Gældsfri", no: "Gjeldfri", se: "Skuldfri" }, descriptions: { da: "Beregn gældsafvikling", no: "Beregn gjeldsnedbetaling", se: "Beräkna skuldavbetalning" } },
  { href: "/brutto-netto", daOnly: true, titles: { da: "Brutto/Netto", no: "Brutto/Netto", se: "Brutto/Netto" }, descriptions: { da: "Beregn brutto og nettoløn", no: "Beregn brutto og nettolønn", se: "Beräkna brutto och nettolön" } },
  { href: "/konfirmation", titles: { da: "Konfirmation", no: "Konfirmasjon", se: "Konfirmation" }, descriptions: { da: "Beregn konfirmationsbudget", no: "Beregn konfirmasjonsbudsjett", se: "Beräkna konfirmationsbudget" } },
  { href: "/bryllup", titles: { da: "Bryllup", no: "Bryllup", se: "Bröllop" }, descriptions: { da: "Beregn bryllupsbudget", no: "Beregn bryllupsbudsjett", se: "Beräkna bröllopsbudget" } },
  { href: "/afstand-mellem-adresser", daOnly: true, titles: { da: "Afstand mellem adresser", no: "Avstand mellom adresser", se: "Avstånd mellan adresser" }, descriptions: { da: "Beregn kørselsafstanden mellem to adresser", no: "Beregn kjøreavstanden mellom to adresser", se: "Beräkna körsträckan mellan två adresser" } },
  { href: "/rejsebudget", titles: { da: "Rejsebudget", no: "Reisebudsjett", se: "Resebudget" }, descriptions: { da: "Beregn dit rejsebudget", no: "Beregn reisebudsjettet ditt", se: "Beräkna din resebudget" } },
  { href: "/vaegttab", titles: { da: "Vægttab", no: "Vekttap", se: "Viktminskning" }, descriptions: { da: "Beregn vægttab", no: "Beregn vekttap", se: "Beräkna viktminskning" } },
  { href: "/termin", titles: { da: "Terminsdato", no: "Termindato", se: "Beräknat datum" }, descriptions: { da: "Beregn terminsdato", no: "Beregn termindato", se: "Beräkna förlossningsdatum" } },
  { href: "/aegloesning", titles: { da: "Ægløsning", no: "Eggløsning", se: "Ägglossning" }, descriptions: { da: "Find dine frugtbare dage", no: "Finn dine fruktbare dager", se: "Hitta dina fertila dagar" } },
  { href: "/ugenummer", daOnly: true, titles: { da: "Ugenummer", no: "Ukenummer", se: "Veckonummer" }, descriptions: { da: "Hvilken uge er det?", no: "Hvilken uke er det?", se: "Vilken vecka är det?" } },
  { href: "/flyttebudget", daOnly: true, titles: { da: "Flyttebudget", no: "Flyttebudsjett", se: "Flyttbudget" }, descriptions: { da: "Beregn dit samlede flyttebudget", no: "Beregn flyttebudsjettet ditt", se: "Beräkna din flyttbudget" } },
  { href: "/boligsalg", daOnly: true, titles: { da: "Boligsalg", no: "Boligsalg", se: "Bostadsförsäljning" }, descriptions: { da: "Beregn nettoprovenu ved salg af bolig", no: "Beregn nettoproveny ved boligsalg", se: "Beräkna netto vid bostadsförsäljning" } },
];

const calculatorDefsByHref = new Map(
  calculatorDefs.map((definition) => [definition.href, definition])
);

export function getCalculatorHrefs(): string[] {
  return calculatorDefs.map((definition) => definition.href);
}

export function isCalculatorPath(href: string): boolean {
  return calculatorDefsByHref.has(href);
}

export function isCalculatorAvailable(href: string, locale: Locale): boolean {
  const definition = calculatorDefsByHref.get(href);
  if (!definition) return false;
  if (definition.daOnly) return locale === "da";
  if (definition.seOnly) return locale === "se";
  return true;
}

/**
 * Get all calculators for a given locale (filtered to only available ones).
 */
export function getCalculatorsByLocale(locale: Locale): Calculator[] {
  return calculatorDefs
    .filter((definition) => isCalculatorAvailable(definition.href, locale))
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
  "/barselsplanlaegger": ["/barselsdagpenge", "/boernepenge", "/termin", "/loen-efter-skat", "/feriepenge"],
  "/barselsdagpenge": ["/barselsplanlaegger", "/boernepenge", "/dagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/boernepenge": ["/barselsdagpenge", "/su", "/boligstoette", "/loen-efter-skat", "/dagpenge"],
  "/timepris": ["/loen-efter-skat", "/moms", "/procent", "/feriepenge", "/dagpenge"],
  "/loen-konverter": ["/loen-efter-skat", "/timepris", "/brutto-netto", "/feriepenge", "/procent"],
  "/enhedspris": ["/procent", "/moms", "/rabat", "/valuta", "/budget"],
  "/rabat": ["/procent", "/enhedspris", "/moms", "/budget", "/del-regning"],
  "/brokost": ["/bil", "/braendstof", "/rejsebudget", "/budget", "/tidsberegner"],
  "/temperatur": ["/procent", "/kvadratmeter", "/gennemsnit", "/valuta", "/tidszone"],
  "/gennemsnit": ["/procent", "/temperatur", "/kvadratmeter", "/moms", "/dato"],
  "/fart": ["/tidsberegner", "/braendstof", "/kalorier", "/temperatur", "/dato"],
  "/enheder": ["/temperatur", "/kvadratmeter", "/procent", "/gennemsnit", "/valuta", "/tv-storrelse"],
  "/del-regning": ["/procent", "/rabat", "/budget", "/rejsebudget", "/enhedspris"],
  "/boliglaan": ["/renteberegner", "/renteprognose", "/laaneberegner", "/andelsbolig", "/rentefradrag", "/byggepris"],
  "/renteberegner": ["/boliglaan", "/renteprognose", "/laaneberegner", "/opsparing", "/procent", "/rentefradrag"],
  "/husleje": ["/boligstoette", "/boliglaan", "/ejendomsvaerdiskat", "/loen-efter-skat", "/kvadratmeter", "/flyttebudget"],
  "/boligstoette": ["/husleje", "/boernepenge", "/loen-efter-skat", "/su", "/dagpenge", "/flyttebudget"],
  "/laaneberegner": ["/boliglaan", "/renteberegner", "/billaan", "/forbrugslaan", "/rentefradrag", "/laanekapacitet"],
  "/laanekapacitet": ["/boliglaan", "/laaneberegner", "/renteberegner", "/budget", "/boligstoette", "/byggepris"],
  "/byggepris": ["/boliglaan", "/laanekapacitet", "/ejendomsvaerdiskat", "/maling", "/solceller"],
  "/opsparing": ["/renteberegner", "/pension", "/aktieskat", "/laaneberegner", "/loen-efter-skat"],
  "/budget": ["/loen-efter-skat", "/opsparing", "/gaeldsfri", "/rygestop", "/laaneberegner", "/flyttebudget"],
  "/afkast": ["/opsparing", "/renteberegner", "/aktieskat", "/procent", "/pension"],
  "/sparemaal": ["/opsparing", "/afkast", "/renteberegner", "/budget", "/pension"],
  "/loenstigning": ["/loen-efter-skat", "/loen-konverter", "/procent", "/timepris", "/brutto-netto"],
  "/ohm": ["/procent", "/enheder", "/elberegner", "/temperatur", "/kvadratmeter"],
  "/planetvaegt": ["/enheder", "/temperatur", "/ohm", "/procent", "/gennemsnit"],
  "/hundealder": ["/alder", "/idealvaegt", "/bmi", "/kropsfedt", "/vaegttab"],
  "/idealvaegt": ["/bmi", "/kropsfedt", "/vaegttab", "/kalorier", "/alder", "/soevnbehov"],
  "/rumfang": ["/areal", "/kvadratmeter", "/procent", "/enheder", "/sand-og-grus", "/tv-storrelse"],
  "/areal": ["/omkreds", "/rumfang", "/kvadratmeter", "/maling", "/procent", "/gennemsnit"],
  "/omkreds": ["/areal", "/rumfang", "/kvadratmeter", "/retvinklet-trekant", "/procent", "/gennemsnit"],
  "/retvinklet-trekant": ["/areal", "/omkreds", "/rumfang", "/kvadratmeter", "/procent", "/gennemsnit"],
  "/maling": ["/kvadratmeter", "/rumfang", "/areal", "/sand-og-grus", "/procent", "/fliser"],
  "/fliser": ["/maling", "/kvadratmeter", "/areal", "/rumfang", "/sand-og-grus", "/procent"],
  "/sand-og-grus": ["/fliser", "/maling", "/kvadratmeter", "/rumfang", "/areal", "/enheder"],
  "/gram-til-dl": ["/enheder", "/enhedspris", "/kalorier", "/fliser", "/maling", "/portioner"],
  "/portioner": ["/gram-til-dl", "/kalorier", "/protein-i-madvarer", "/kulhydrater-i-madvarer", "/fedt-i-madvarer", "/kalorier-i-opskrift"],
  "/kalorier-i-opskrift": ["/kalorier", "/portioner", "/gram-til-dl", "/protein-i-madvarer", "/kulhydrater-i-madvarer", "/fedt-i-madvarer"],
  "/tv-storrelse": ["/enheder", "/kvadratmeter", "/rumfang", "/procent", "/maling", "/fliser"],
  "/aegloesning": ["/termin", "/nedtaelling", "/dato", "/alder", "/bmi"],
  "/brok": ["/procent", "/gennemsnit", "/kvadratmeter", "/temperatur", "/enheder"],
  "/nedtaelling": ["/dato", "/alder", "/tidsberegner", "/termin", "/tidszone", "/ugenummer"],
  "/rentefradrag": ["/boliglaan", "/renteberegner", "/renteprognose", "/laaneberegner", "/skattefradrag"],
  "/renteprognose": ["/renteberegner", "/boliglaan", "/rentefradrag", "/laaneberegner", "/opsparing"],
  "/billaan": ["/bil", "/laaneberegner", "/renteberegner", "/forbrugslaan", "/braendstof"],
  "/forbrugslaan": ["/laaneberegner", "/renteberegner", "/billaan", "/boliglaan", "/rentefradrag"],
  "/ejendomsvaerdiskat": ["/boliglaan", "/boligstoette", "/husleje", "/rentefradrag", "/loen-efter-skat", "/boligsalg"],
  "/arveafgift": ["/pension", "/efterloen", "/loen-efter-skat", "/opsparing", "/rentefradrag"],
  "/gaveafgift": ["/arveafgift", "/pension", "/opsparing", "/rentefradrag", "/loen-efter-skat"],
  "/moms": ["/procent", "/timepris", "/loen-efter-skat", "/valuta", "/renteberegner"],
  "/procent": ["/moms", "/rabat", "/renteberegner", "/opsparing", "/bmi", "/brok"],
  "/bmi": ["/idealvaegt", "/kalorier", "/alder", "/kropsfedt", "/tidsberegner"],
  "/kalorier": ["/motion-kalorier", "/vaegttab", "/proteinbehov", "/1rm", "/kropsfedt", "/vandbehov"],
  "/promille": ["/bmi", "/kalorier", "/rygestop", "/alkoholenheder", "/alder", "/procent"],
  "/rygestop": ["/opsparing", "/sparemaal", "/budget", "/promille", "/vaegttab"],
  "/kropsfedt": ["/bmi", "/kalorier", "/vaegttab", "/promille", "/procent"],
  "/1rm": ["/kalorier", "/kropsfedt", "/bmi", "/vaegttab", "/procent"],
  "/vandbehov": ["/kalorier", "/bmi", "/kropsfedt", "/motion-kalorier", "/proteinbehov", "/soevnbehov"],
  "/skridt": ["/motion-kalorier", "/pace", "/kalorier", "/vaegttab", "/idealvaegt", "/soevnbehov"],
  "/motion-kalorier": ["/kalorier", "/vaegttab", "/bmi", "/vandbehov", "/skridt", "/soevnbehov"],
  "/proteinbehov": ["/protein-i-madvarer", "/kalorier", "/bmi", "/motion-kalorier", "/vandbehov", "/vaegttab"],
  "/protein-i-madvarer": ["/kulhydrater-i-madvarer", "/fedt-i-madvarer", "/proteinbehov", "/kalorier", "/bmi", "/motion-kalorier"],
  "/kulhydrater-i-madvarer": ["/protein-i-madvarer", "/fedt-i-madvarer", "/kalorier", "/bmi", "/motion-kalorier", "/koffein"],
  "/salt-i-madvarer": ["/kalorier", "/protein-i-madvarer", "/fedt-i-madvarer", "/sukker-i-madvarer", "/kulhydrater-i-madvarer", "/kalorier-i-opskrift"],
  "/sukker-i-madvarer": ["/kalorier", "/kulhydrater-i-madvarer", "/fedt-i-madvarer", "/protein-i-madvarer", "/kalorier-i-opskrift", "/portioner"],
  "/fedt-i-madvarer": ["/protein-i-madvarer", "/kulhydrater-i-madvarer", "/kalorier", "/motion-kalorier", "/vaegttab", "/kropsfedt"],
  "/soevnbehov": ["/vandbehov", "/kalorier", "/motion-kalorier", "/bmi", "/skridt", "/koffein"],
  "/koffein": ["/kalorier", "/soevnbehov", "/vandbehov", "/alder", "/promille"],
  "/kalorier-i-alkohol": ["/alkoholenheder", "/promille", "/kalorier", "/koffein", "/vaegttab", "/motion-kalorier"],
  "/alkoholenheder": ["/promille", "/kalorier-i-alkohol", "/kalorier", "/rygestop", "/motion-kalorier"],
  "/dato": ["/tidsberegner", "/alder", "/tidszone", "/feriepenge", "/pension", "/ugenummer"],
  "/tidsberegner": ["/dato", "/tidszone", "/alder", "/timepris", "/kalorier", "/ugenummer"],
  "/pace": ["/tidsberegner", "/fart", "/kalorier", "/dato", "/alder"],
  "/tidszone": ["/dato", "/tidsberegner", "/valuta", "/alder", "/timepris"],
  "/alder": ["/dato", "/pension", "/bmi", "/tidsberegner", "/efterloen", "/ugenummer"],
  "/bil": ["/braendstof", "/billaan", "/elberegner", "/forbrugslaan", "/loen-efter-skat"],
  "/braendstof": ["/bil", "/elberegner", "/procent", "/valuta", "/kvadratmeter"],
  "/elbil": ["/braendstof", "/bil", "/elberegner", "/leasing", "/billaan"],
  "/elbil-lading": ["/elbil", "/braendstof", "/elberegner", "/bil", "/billaan"],
  "/laantype": ["/renteberegner", "/laaneberegner", "/boliglaan", "/forbrugslaan", "/rentefradrag"],
  "/elberegner": ["/braendstof", "/bil", "/procent", "/husleje", "/boligstoette"],
  "/kvadratmeter": ["/rumfang", "/sand-og-grus", "/boliglaan", "/procent", "/maling", "/flyttebudget"],
  "/valuta": ["/moms", "/procent", "/tidszone", "/loen-efter-skat", "/bil"],
  "/solceller": ["/elberegner", "/braendstof", "/bil", "/boliglaan", "/opsparing", "/byggepris"],
  "/leasing": ["/billaan", "/bil", "/forbrugslaan", "/laaneberegner", "/braendstof"],
  "/gaeldsfri": ["/laaneberegner", "/forbrugslaan", "/opsparing", "/renteberegner", "/billaan"],
  "/brutto-netto": ["/loen-efter-skat", "/timepris", "/feriepenge", "/pension", "/dagpenge"],
  "/konfirmation": ["/bryllup", "/rejsebudget", "/opsparing", "/loen-efter-skat", "/gaeldsfri"],
  "/bryllup": ["/konfirmation", "/rejsebudget", "/opsparing", "/loen-efter-skat", "/gaeldsfri"],
  "/rejsebudget": ["/valuta", "/bryllup", "/konfirmation", "/opsparing", "/tidszone"],
  "/afstand-mellem-adresser": ["/befordringsfradrag", "/bil", "/rejsebudget", "/fart", "/tidsberegner"],
  "/vaegttab": ["/kalorier", "/bmi", "/alder", "/procent", "/tidsberegner"],
  "/termin": ["/barselsdagpenge", "/boernepenge", "/alder", "/dato", "/kalorier"],
  "/sygedagpenge": ["/dagpenge", "/barselsdagpenge", "/loen-efter-skat", "/feriepenge", "/boligstoette"],
  "/topskat": ["/loen-efter-skat", "/brutto-netto", "/skattefradrag", "/pension", "/rentefradrag"],
  "/skatteprocent": ["/kirkeskat", "/topskat", "/brutto-netto", "/loen-efter-skat", "/skattefradrag"],
  "/skattefradrag": ["/rentefradrag", "/loen-efter-skat", "/topskat", "/befordringsfradrag", "/boliglaan"],
  "/befordringsfradrag": ["/skattefradrag", "/topskat", "/loen-efter-skat", "/rentefradrag", "/boliglaan", "/afstand-mellem-adresser"],
  "/aktieskat": ["/opsparing", "/loen-efter-skat", "/pension", "/renteberegner", "/procent"],
  "/andelsbolig": ["/boliglaan", "/husleje", "/laaneberegner", "/rentefradrag", "/ejendomsvaerdiskat", "/boligsalg"],
  "/studielaan": ["/su", "/laaneberegner", "/forbrugslaan", "/renteberegner", "/opsparing"],
  "/ugenummer": ["/dato", "/alder", "/nedtaelling", "/tidsberegner", "/termin"],
  "/flyttebudget": ["/husleje", "/budget", "/boliglaan", "/boligstoette", "/kvadratmeter"],
  "/boligsalg": ["/ejendomsvaerdiskat", "/andelsbolig", "/kvadratmeter", "/flyttebudget", "/boliglaan"],
  "/nutidskroner": ["/loen-efter-skat", "/husleje", "/rentefradrag", "/opsparing", "/moms"],
};

/**
 * The declared related links, exposed so tests can hold `relatedMap` to the
 * same contract the renderer does. Read-only: only this module may edit it.
 */
export const RELATED_CALCULATORS: Readonly<Record<string, readonly string[]>> =
  relatedMap;

/**
 * Get related calculators for a given page, locale-filtered.
 *
 * `relatedMap` is the contract: every href declared there is rendered. An
 * earlier `slice(0, 5)` silently dropped the tail, so 13 pages promised a link
 * they never showed — `/dato`, `/tidsberegner` and `/kvadratmeter` all lost
 * `/ugenummer` or `/flyttebudget`, and `/promille` lost `/procent`. The
 * `MAX_RELATED` ceiling in `calculator-list.test.ts` keeps the grid at a
 * balanced 3x2 instead.
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
    .filter(Boolean);

  if (related.length === 0) {
    return allCalcs.filter((c) => c.href !== currentHref).slice(0, 5);
  }

  return related;
}

/**
 * Get popular calculators for sidebar, locale-aware.
 *
 * Listen er **målt trafik, ikke håndskrevet** — samme grund som `home-data.ts`.
 * Den gamle liste var skrevet i 2024 og holdt seks sider, ingen af dem blandt
 * sitets mest besøgte: `/dato` har 1.100 besøgende/28d og `/tidsberegner` 268,
 * og ingen af dem stod i sidebarlen. Sidebarlen ligger på 58 sider, så hver
 * manglende side tabte ~117 interne links — blandt andet de to sider der ligger
 * på position 5-6 i Search Console med 136.986 og 78.615 visninger.
 *
 * Rækkefølgen er den lærerne kommer i (Plausible 2026-10-05, 28 dage). Der er
 * **intet `slice` i `Sidebar.tsx`**: den gamle liste havde otte pladser og
 * rendereren tog de seks første, så de to nederste var døde nøgler. `/promille`
 * er med, fordi det er den hurtigst voksende danske side (+1.250 %, 162
 * besøgende/28d, 6.878 visninger) — den manglede også i sidebarlen.
 */
export function getPopularCalculators(locale: Locale): Calculator[] {
  const popularHrefs = locale === "da"
    ? [
      // Plausible 2026-10-05, 28 dage: /dato 1100, /bmi 963,
      // /boligstoette 528, /rentefradrag 470, /kvadratmeter 393,
      // /kalorier 271, /tidsberegner 268, /braendstof 252,
      // /barselsdagpenge 239, /husleje 168, /promille 162.
      "/dato", "/bmi", "/boligstoette", "/rentefradrag", "/kvadratmeter",
      "/kalorier", "/tidsberegner", "/braendstof", "/barselsdagpenge",
      "/husleje", "/promille",
      // Brandværktøjet. Ikke i trafiklisten, men sitets mest kendte navn.
      "/loen-efter-skat",
      // De to største **søgesider**: 151.008 og 22.464 visninger. De er ikke
      // blandt de mest besøgte (0,1 % og 0,2 % CTR), så trafikrækken flytter
      // dem ned — men de skal stadig have et link fra de 58 sider, ellers
      // mister de de interne links de har i dag.
      "/procent", "/moms",
    ]
    : locale === "se"
      ? [
        // Plausible 2026-10-05, 28 dage: /tidsberegner 181, /dato 145,
        // /leasing 49, /alder 32, /nedtaelling 25, /tidszone 14,
        // /kalorier 14, /elberegner 12, /loenstigning 11, /timepris 11.
        "/tidsberegner", "/dato", "/leasing", "/alder", "/nedtaelling",
        "/tidszone", "/kalorier", "/elberegner", "/loenstigning", "/timepris",
        // Svensk lön efter skatt och Bolån finns bara på beraknare.se.
        "/lon-efter-skatt", "/bolan",
      ]
      : ["/moms", "/bmi", "/laaneberegner", "/procent", "/valuta", "/boliglaan", "/timepris"];

  const allCalcs = getCalculatorsByLocale(locale);
  return popularHrefs
    .map((href) => allCalcs.find((c) => c.href === href)!)
    .filter(Boolean);
}
