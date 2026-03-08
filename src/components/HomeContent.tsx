import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function HomeContent({ locale, siteName }: { locale: Locale; siteName: string }) {
  if (locale === "no") return <HomeContentNO siteName={siteName} />;
  if (locale === "se") return <HomeContentSE siteName={siteName} />;
  return <HomeContentDA />;
}

function HomeContentDA() {
  return (
    <section className="prose dark:prose-invert max-w-none mb-16">
      <h2>Om MinBeregner.dk — Danmarks gratis beregnerportal</h2>
      <p>
        MinBeregner.dk samler over <strong>44 gratis online beregnere</strong> til danskere.
        Alle beregnere er opdateret med de nyeste satser og regler for 2026, og beregningerne
        sker lokalt i din browser — vi gemmer ingen persondata.
      </p>

      <h2>Økonomi og skat</h2>
      <p>
        Vores mest brugte beregner er <Link href="/loen-efter-skat">løn efter skat</Link>, hvor
        du kan se hvad du får udbetalt efter AM-bidrag, kommuneskat, bundskat og eventuelt topskat.
        Beregneren er opdateret med <strong>2026-skattesatserne</strong>, herunder det nye mellemskat-trin.
      </p>
      <h3>Populære økonomi-beregnere</h3>
      <ul>
        <li><Link href="/moms"><strong>Momsberegner</strong></Link> — tillæg eller fratræk 25% moms</li>
        <li><Link href="/procent"><strong>Procentberegner</strong></Link> — beregn procent af et tal, stigning og fald</li>
        <li><Link href="/rentefradrag"><strong>Rentefradrag</strong></Link> — se din skattebesparelse på renteudgifter</li>
        <li><Link href="/arveafgift"><strong>Arveafgift</strong></Link> — beregn boafgift (15%) og tillægsafgift (25%)</li>
        <li><Link href="/aktieskat"><strong>Aktieskat</strong></Link> — beregn skat på aktiegevinst</li>
        <li><Link href="/topskat"><strong>Topskat</strong></Link> — tjek om du betaler mellemskat eller topskat</li>
      </ul>

      <h2>Pension, dagpenge og offentlige ydelser</h2>
      <p>
        Planlæg din fremtid med vores <Link href="/pension">pensionsberegner</Link> — se hvad du
        kan forvente i folkepension, arbejdsmarkedspension og privat opsparing.
      </p>
      <h3>Ydelser og offentlig støtte</h3>
      <ul>
        <li><Link href="/efterloen"><strong>Efterløn</strong></Link> — beregn din efterlønssats baseret på 2026-reglerne</li>
        <li><Link href="/dagpenge"><strong>Dagpenge</strong></Link> — se din dagpengesats ved ledighed</li>
        <li><Link href="/barselsdagpenge"><strong>Barselsdagpenge</strong></Link> — planlæg økonomi under barsel</li>
        <li><Link href="/boernepenge"><strong>Børnepenge</strong></Link> — aktuelle satser for børne- og ungeydelse</li>
        <li><Link href="/su"><strong>SU beregner</strong></Link> — tjek satser og fribeløb</li>
        <li><Link href="/sygedagpenge"><strong>Sygedagpenge</strong></Link> — beregn sygedagpengesats</li>
        <li><Link href="/feriepenge"><strong>Feriepenge</strong></Link> — se hvad du får udbetalt i ferie</li>
      </ul>

      <h2>Bolig og lån</h2>
      <p>
        Skal du <strong>købe bolig</strong>? Start med vores <Link href="/boliglaan">boliglåns-beregner</Link> for
        at se ydelsen på dit lån. <strong>Lejer du</strong>, kan du tjekke om du har ret
        til <Link href="/boligstoette">boligstøtte</Link> eller bruge <Link href="/husleje">huslejebudget-beregneren</Link>.
      </p>
      <h3>Boligberegnere</h3>
      <ul>
        <li><Link href="/boliglaan"><strong>Boliglån</strong></Link> — beregn ydelse og omkostninger</li>
        <li><Link href="/ejendomsvaerdiskat"><strong>Ejendomsværdiskat</strong></Link> — beregn boligskat</li>
        <li><Link href="/andelsbolig"><strong>Andelsbolig</strong></Link> — beregn omkostninger ved køb af andelsbolig</li>
        <li><Link href="/solceller"><strong>Solceller</strong></Link> — beregn besparelse og tilbagebetalingstid</li>
      </ul>
      <h3>Låneberegnere</h3>
      <ul>
        <li><Link href="/laaneberegner"><strong>Generel låneberegner</strong></Link> — beregn ydelse og sammenlign lån</li>
        <li><Link href="/billaan"><strong>Billån</strong></Link> — beregn månedlig ydelse og rente</li>
        <li><Link href="/forbrugslaan"><strong>Forbrugslån</strong></Link> — beregn ydelse og ÅOP</li>
        <li><Link href="/renteberegner"><strong>Renteberegner</strong></Link> — detaljeret rente med afdragsplan</li>
        <li><Link href="/opsparing"><strong>Opsparingsberegner</strong></Link> — se renters rente</li>
        <li><Link href="/gaeldsfri"><strong>Gældsfri beregner</strong></Link> — beregn din vej ud af gæld</li>
      </ul>

      <h2>Sundhed og krop</h2>
      <ul>
        <li><Link href="/bmi"><strong>BMI beregner</strong></Link> — beregn dit Body Mass Index</li>
        <li><Link href="/kalorier"><strong>Kalorieberegner</strong></Link> — se dit daglige kaloriebehov</li>
        <li><Link href="/vaegttab"><strong>Vægttab</strong></Link> — beregn kalorieunderskud for vægttab</li>
      </ul>

      <h2>Hverdag og praktisk</h2>
      <h3>Bil og transport</h3>
      <ul>
        <li><Link href="/elberegner"><strong>Elberegner</strong></Link> — se hvad dine apparater koster i strøm</li>
        <li><Link href="/braendstof"><strong>Brændstofberegner</strong></Link> — beregn transportomkostninger</li>
        <li><Link href="/bil"><strong>Bil værdtab</strong></Link> — se hvad din bil koster at eje</li>
        <li><Link href="/leasing"><strong>Leasing</strong></Link> — beregn leasingydelse</li>
      </ul>
      <h3>Tid, dato og valuta</h3>
      <ul>
        <li><Link href="/dato"><strong>Datoberegner</strong></Link> — beregn dage mellem datoer</li>
        <li><Link href="/alder"><strong>Aldersberegner</strong></Link> — beregn din præcise alder</li>
        <li><Link href="/tidsberegner"><strong>Tidsberegner</strong></Link> — beregn timer og minutter</li>
        <li><Link href="/tidszone"><strong>Tidszoneberegner</strong></Link> — se klokken i andre lande</li>
        <li><Link href="/valuta"><strong>Valutaberegner</strong></Link> — omregn valutaer</li>
      </ul>
      <h3>Erhverv og planlægning</h3>
      <ul>
        <li><Link href="/timepris"><strong>Timeprisberegner</strong></Link> — find din timepris som freelancer</li>
        <li><Link href="/rejsebudget"><strong>Rejsebudget</strong></Link> — beregn rejsebudget</li>
        <li><Link href="/bryllup"><strong>Bryllupsbudget</strong></Link> — beregn komplet bryllupsbudget</li>
        <li><Link href="/konfirmation"><strong>Konfirmationsbudget</strong></Link> — beregn budget for konfirmation</li>
      </ul>
    </section>
  );
}

function HomeContentNO({ siteName }: { siteName: string }) {
  return (
    <section className="prose dark:prose-invert max-w-none mb-16">
      <h2>Om {siteName} — Gratis kalkulatorer for nordmenn</h2>
      <p>
        {siteName} samler <strong>gratis kalkulatorer</strong> for nordmenn.
        Alle beregninger skjer lokalt i nettleseren din — vi lagrer ingen persondata.
      </p>

      <h2>Økonomi og lån</h2>
      <p>
        Beregn <Link href="/moms">MVA (merverdiavgift)</Link> raskt, sammenlign
        lån med vår <Link href="/laaneberegner">lånekalkulator</Link>, eller se hvordan
        sparepengene dine vokser med <Link href="/opsparing">sparekalkulator</Link>.
      </p>
      <ul>
        <li><Link href="/moms"><strong>MVA-kalkulator</strong></Link> — legg til eller trekk fra 25% MVA</li>
        <li><Link href="/valuta"><strong>Valutakalkulator</strong></Link> — regn om mellom NOK, EUR, USD og andre valutaer</li>
        <li><Link href="/renteberegner"><strong>Rentekalkulator</strong></Link> — beregn renter og avdrag på lån</li>
        <li><Link href="/procent"><strong>Prosentkalkulator</strong></Link> — beregn prosent av et tall</li>
        <li><Link href="/timepris"><strong>Timepriskalkulator</strong></Link> — finn din timepris som frilanser</li>
      </ul>

      <h2>Bolig</h2>
      <ul>
        <li><Link href="/boliglaan"><strong>Boliglånskalkulator</strong></Link> — beregn ytelse og kostnader</li>
        <li><Link href="/elberegner"><strong>Strømkalkulator</strong></Link> — se hva apparatene dine koster i strøm</li>
        <li><Link href="/solceller"><strong>Solcellekalkulator</strong></Link> — beregn besparelse og tilbakebetalingstid</li>
        <li><Link href="/kvadratmeter"><strong>Kvadratmeterkalkulator</strong></Link> — beregn areal</li>
      </ul>

      <h2>Helse og kropp</h2>
      <ul>
        <li><Link href="/bmi"><strong>BMI-kalkulator</strong></Link> — beregn din Body Mass Index</li>
        <li><Link href="/kalorier"><strong>Kalorikalkulator</strong></Link> — se ditt daglige kaloriforbruk</li>
        <li><Link href="/vaegttab"><strong>Vekttap</strong></Link> — beregn kaloriunderskudd</li>
      </ul>

      <h2>Hverdag og praktisk</h2>
      <ul>
        <li><Link href="/braendstof"><strong>Drivstoffkalkulator</strong></Link> — beregn kjørekostnader</li>
        <li><Link href="/bil"><strong>Bil verditap</strong></Link> — se hva bilen koster å eie</li>
        <li><Link href="/dato"><strong>Datokalkulator</strong></Link> — beregn dager mellom datoer</li>
        <li><Link href="/tidsberegner"><strong>Tidskalkulator</strong></Link> — beregn timer og minutter</li>
        <li><Link href="/tidszone"><strong>Tidssoner</strong></Link> — se klokken i andre land</li>
        <li><Link href="/rejsebudget"><strong>Reisebudsjett</strong></Link> — beregn reisebudsjettet ditt</li>
      </ul>
    </section>
  );
}

function HomeContentSE({ siteName }: { siteName: string }) {
  return (
    <section className="prose dark:prose-invert max-w-none mb-16">
      <h2>Om {siteName} — Gratis kalkylatorer för svenskar</h2>
      <p>
        {siteName} samlar <strong>gratis kalkylatorer</strong> för svenskar.
        Alla beräkningar sker lokalt i din webbläsare — vi sparar ingen persondata.
      </p>

      <h2>Ekonomi och lån</h2>
      <p>
        Beräkna <Link href="/moms">moms</Link> snabbt, jämför lån med
        vår <Link href="/laaneberegner">låneberäknare</Link>, eller se hur
        ditt sparande växer med <Link href="/opsparing">sparberäknaren</Link>.
      </p>
      <ul>
        <li><Link href="/moms"><strong>Momsberäknare</strong></Link> — lägg till eller dra av 25% moms</li>
        <li><Link href="/valuta"><strong>Valutaberäknare</strong></Link> — räkna om mellan SEK, EUR, USD och andra valutor</li>
        <li><Link href="/renteberegner"><strong>Ränteberäknare</strong></Link> — beräkna ränta och amortering</li>
        <li><Link href="/procent"><strong>Procentberäknare</strong></Link> — beräkna procent av ett tal</li>
        <li><Link href="/timepris"><strong>Timprisberäknare</strong></Link> — hitta din timpris som frilansare</li>
      </ul>

      <h2>Bostad</h2>
      <ul>
        <li><Link href="/boliglaan"><strong>Bolåneberäknare</strong></Link> — beräkna månadskostnad och ränta</li>
        <li><Link href="/elberegner"><strong>Elberäknare</strong></Link> — se vad dina apparater kostar i el</li>
        <li><Link href="/solceller"><strong>Solcellsberäknare</strong></Link> — beräkna besparing och återbetalningstid</li>
        <li><Link href="/kvadratmeter"><strong>Kvadratmeterberäknare</strong></Link> — beräkna area</li>
      </ul>

      <h2>Hälsa och kropp</h2>
      <ul>
        <li><Link href="/bmi"><strong>BMI-beräknare</strong></Link> — beräkna ditt Body Mass Index</li>
        <li><Link href="/kalorier"><strong>Kaloriberäknare</strong></Link> — se ditt dagliga kaloribehov</li>
        <li><Link href="/vaegttab"><strong>Viktnedgång</strong></Link> — beräkna kaloriunderskott</li>
      </ul>

      <h2>Vardag och praktiskt</h2>
      <ul>
        <li><Link href="/braendstof"><strong>Bränsleberäknare</strong></Link> — beräkna körkostnader</li>
        <li><Link href="/bil"><strong>Bil värdeminskning</strong></Link> — se vad bilen kostar att äga</li>
        <li><Link href="/dato"><strong>Datumberäknare</strong></Link> — beräkna dagar mellan datum</li>
        <li><Link href="/tidsberegner"><strong>Tidsberäknare</strong></Link> — beräkna timmar och minuter</li>
        <li><Link href="/tidszone"><strong>Tidszoner</strong></Link> — se klockan i andra länder</li>
        <li><Link href="/rejsebudget"><strong>Resebudget</strong></Link> — beräkna din resebudget</li>
      </ul>
    </section>
  );
}
