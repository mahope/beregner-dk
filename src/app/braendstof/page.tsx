import Link from "next/link";
import dynamic from "next/dynamic";
const BraendstofBeregner = dynamic(() => import("@/components/BraendstofBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { BilforsikringAffiliate } from "@/components/AffiliateBox";
import { formatNumber } from "@/lib/format";
import {
  MIL_KM,
  BRAENDSTOF_EKSEMPEL_KM,
  BRAENDSTOF_EGENT_FORBRUG,
  BRAENDSTOF_FORUDSETNINGER,
  braendstofEksempelRækker,
  braendstofForudsætninger,
  literPrMil,
  prisPrMil,
  procent1Decimals,
  kmPrLiter,
  literPr100km,
} from "@/lib/braendstof";

export async function generateMetadata() {
  return generatePageMetadata("braendstof");
}

export default async function BraendstofPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("braendstof", locale) || getPageData("braendstof", "da")!;

  /** Danish decimals, so every number in the prose is checkable by hand. */
  const tal = (value: number, dec = 1) => formatNumber(value, "da", { maximumFractionDigits: dec });
  /** Priser får altid to decimaler, så "13,50 kr." og "0,90 kr." kan efterprøves. */
  const kr = (value: number) =>
    formatNumber(value, "da", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const heleKroner = (value: number) => formatNumber(value, "da", { maximumFractionDigits: 0 });
  const drivmiddelNavn: Record<string, string> = { benzin: "Benzin", diesel: "Diesel", el: "El" };
  const braendstofKm = BRAENDSTOF_EKSEMPEL_KM;
  const eksempelRækker = braendstofEksempelRækker();
  const benzinRække = eksempelRækker.find((r) => r.type === "benzin")!;
  const dieselRække = eksempelRækker.find((r) => r.type === "diesel")!;
  const egentForbrug = BRAENDSTOF_EGENT_FORBRUG;
  const egentForbrugKmPrLiter = egentForbrug.km / egentForbrug.liter;
  const egentForbrugLiterPr100km = literPr100km(egentForbrugKmPrLiter);
  const benzinForbrug = BRAENDSTOF_FORUDSETNINGER.benzin.kmPerLiter;
  const benzinPr100 = literPr100km(benzinForbrug);
  const benzinKmPrLiter = kmPrLiter(benzinPr100);
  const benzinLav = 12;
  const benzinHoej = 18;

  /** Swedish decimals and kronor, so the Swedish prose never shows a Danish comma. */
  const talSe = (value: number, dec = 1) =>
    formatNumber(value, "se", { maximumFractionDigits: dec });
  const krSe = (value: number) =>
    formatNumber(value, "se", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const heleKronerSe = (value: number) =>
    formatNumber(value, "se", { maximumFractionDigits: 0 });
  const seForuds = braendstofForudsætninger("se");
  const seRækker = braendstofEksempelRækker(BRAENDSTOF_EKSEMPEL_KM, "se");
  const seBenzin = seRækker.find((r) => r.type === "benzin")!;
  const seDiesel = seRækker.find((r) => r.type === "diesel")!;
  const drivmiddelNavnSe: Record<string, string> = { benzin: "Bensin", diesel: "Diesel", el: "El" };
  const egentForbrugSe = BRAENDSTOF_EGENT_FORBRUG;
  const egentForbrugSeKmPrLiter = egentForbrugSe.km / egentForbrugSe.liter;
  const helTalMil = BRAENDSTOF_EKSEMPEL_KM / MIL_KM;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/braendstof`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/braendstof" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <BraendstofBeregner />
        <BilforsikringAffiliate className="mt-8" />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Sådan regner du benzinforbrug og pris ud med tal</h2>
        <p>
          Regnestykket er det samme hver gang: <strong>distance delt med forbrug</strong> giver
          mængden, og mængden ganget med <strong>literprisen</strong> giver prisen. Her er de tre
          drivmidler regnet på {braendstofKm} km med de forudsætninger, beregneren selv bruger.
        </p>
        <table>
          <thead>
            <tr>
              <th>Drivmiddel</th>
              <th>Forbrug</th>
              <th>Regnestykke</th>
              <th>Pris</th>
              <th>Pr. km</th>
            </tr>
          </thead>
          <tbody>
            {eksempelRækker.map((r) => (
              <tr key={r.type}>
                <td>{drivmiddelNavn[r.type]}</td>
                <td>{tal(r.forbrug)} {r.forbrugsEnhed}</td>
                <td>
                  {r.type === "el"
                    ? `${braendstofKm} × ${tal(r.forbrug)} ÷ 100 = ${tal(r.maengde)} kWh`
                    : `${braendstofKm} ÷ ${tal(r.forbrug)} = ${tal(r.maengde)} l`}
                  <br />
                  {tal(r.maengde)} {r.enhed} × {kr(r.enhedPris)} kr. ={" "}
                  <strong>{heleKroner(r.pris)} kr.</strong>
                </td>
                <td>{heleKroner(r.pris)} kr.</td>
                <td>{kr(r.prisPrKm)} kr.</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Priserne er rundet op til hele kroner, så benzinrækken er den 450 kr., titlen lover.
          Bemærk at benzin er dyrere pr. km end diesel, selv om benzin ofte står billigere pr. liter
          — det er afstanden pr. liter, der afgør prisen pr. km.
        </p>

        <h3>Sådan finder du dit eget forbrug</h3>
        <p>
          Har din bil ikke en turcomputer, så find forbruget selv: <strong>liter påfyldt delt med
          km kørt</strong> er dit km/l. Fire påfyldninger på {egentForbrug.liter} liter over{" "}
          {egentForbrug.km} km giver {egentForbrug.km} ÷ {egentForbrug.liter} ={" "}
          <strong>{tal(egentForbrugKmPrLiter)} km/l</strong>, altså{" "}
          {tal(egentForbrugLiterPr100km)} l/100 km. Kør gerne 300-400 km på fire fulde tankfyld —
          en enkelt fyldning rammes let af en forkert aflæsning.
        </p>

        <h3>km/l eller l/100 km?</h3>
        <p>
          Tankinstrumentet viser l/100 km, mens værktøjer og manualer bruger km/l, og det er derfor
          de samme tal kan se ud til at modsige hinanden. Omregningen er bare 100 divideret med
          den anden enhed: {benzinForbrug} km/l er {tal(benzinPr100)} l/100 km, og{" "}
          {tal(benzinPr100)} l/100 km er igen {tal(benzinKmPrLiter)} km/l. Et typisk dansk benzinbil
          kører {benzinLav}-{benzinHoej} km/l, altså{" "}
          {tal(literPr100km(benzinHoej))}-{tal(literPr100km(benzinLav))} l/100 km.
        </p>
      </div>
      )}

      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om brændstofforbrug</h2>
        <p>
          At forstå dit <strong>brændstofforbrug</strong> hjælper dig med at <strong>budgettere bilkørsel</strong>
          og vælge den rigtige bil. Forbruget varierer betydeligt mellem <strong>biltyper</strong>,
          <strong>kørestil</strong> og <strong>kørselsforhold</strong>.
        </p>

        <h3>Typiske forbrug</h3>
        <ul>
          <li><strong>Benzin:</strong> 12-18 km/l ({tal(literPr100km(18))}-{tal(literPr100km(12))} l/100km)</li>
          <li><strong>Diesel:</strong> 15-22 km/l ({tal(literPr100km(22))}-{tal(literPr100km(15))} l/100km)</li>
          <li><strong>El:</strong> 15-20 kWh/100km (svarer til ca. 5-7 km/kWh)</li>
          <li><strong>Hybrid:</strong> 18-25 km/l (benzin-ækvivalent)</li>
        </ul>

        <h3>Sådan reducerer du forbruget</h3>
        <ul>
          <li>Kør jævnt - undgå hård acceleration og opbremsning</li>
          <li>Hold jævn hastighed på motorvejen (optimal 80-100 km/t)</li>
          <li>Tjek dæktryk regelmæssigt (for lavt tryk øger forbrug)</li>
          <li>Fjern unødvendig vægt og tagboks</li>
          <li>Brug klimaanlæg med måde</li>
          <li>Planlæg ruter for at undgå kø</li>
        </ul>

        <h3>Benzin vs. Diesel vs. El</h3>
        <p>
          Ved valg af <strong>brændstoftype</strong> bør du overveje:
        </p>
        <ul>
          <li><strong>Benzin:</strong> Lavere indkøbspris, højere km-pris</li>
          <li><strong>Diesel:</strong> Bedre for lange afstande, højere afgifter</li>
          <li><strong>El:</strong> Lavest km-pris, men højere indkøbspris og behov for ladeinfrastruktur</li>
        </ul>

        <h2>Hvorfor er diesel dyrere end benzin?</h2>
        <p>
          Spørgsmålet kan betyde to forskellige ting, og svaret er modsat for dem:
          <strong> prisen pr. liter</strong> og <strong>prisen pr. kilometer</strong>.
        </p>
        <p>
          <strong>Pr. liter</strong> ligger diesel højere, fordi de to brændsler
          afgiftsbeskattes forskelligt: energi- og CO2-afgiften er højere pr.
          liter for diesel end for benzin. Derfor følger de to pumperpriser heller
          ikke hinanden 1:1, og diesel har i de fleste af de seneste år ligget
          tæt på benzin — nogle dage billigere, andre dage dyrere.
        </p>
        <p>
          <strong>Pr. kilometer</strong> er det derimod næsten altid benzin,
          der er dyrest, fordi en dieselbil kører længere på literen: 15-22 km/l
          mod benzins 12-18 km/l. Forskellen i literpris bliver mere end
          udlignet af det lavere forbrug. De samme 500 km, regnet på de
          forudsætninger beregneren selv bruger:
        </p>
        <table>
          <thead>
            <tr>
              <th>{braendstofKm} km</th>
              <th>Benzin</th>
              <th>Diesel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Förbrukning</td>
              <td>{tal(benzinRække.forbrug)} {benzinRække.forbrugsEnhed}</td>
              <td>{tal(dieselRække.forbrug)} {dieselRække.forbrugsEnhed}</td>
            </tr>
            <tr>
              <td>Literpris</td>
              <td>{kr(benzinRække.enhedPris)} kr./l</td>
              <td>{kr(dieselRække.enhedPris)} kr./l</td>
            </tr>
            <tr>
              <td>Pris för {braendstofKm} km</td>
              <td>{heleKroner(benzinRække.pris)} kr.</td>
              <td>{heleKroner(dieselRække.pris)} kr.</td>
            </tr>
            <tr>
              <td>Pris per km</td>
              <td>{kr(benzinRække.prisPrKm)} kr.</td>
              <td>{kr(dieselRække.prisPrKm)} kr.</td>
            </tr>
          </tbody>
        </table>
        <p>
          Diesel kostar altså {heleKroner(benzinRække.pris - dieselRække.pris)}{" "}
          kr. mindre for de {braendstofKm} km — {tal(dieselRække.maengde)} l
          mod benzins {tal(benzinRække.maengde)} l. Beregningen bruger faste
          modelpriser på {kr(benzinRække.enhedPris)} kr./l for benzin og{" "}
          {kr(dieselRække.enhedPris)} kr./l for diesel, så skriv dagens pris fra
          pumperen ind i værktøjet ovenfor, hvis den afviger. Er forskellen mellem
          de to literpriser stor, eller kører bilen langt på motorvejen, så kan
          rækkefølgen tippe.
        </p>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om bränsleförbrukning</h2>
        <p>
          Att förstå din <strong>bränsleförbrukning</strong> hjälper dig att <strong>budgetera för bilkörning</strong>
          och välja rätt bil. Förbrukningen varierar betydligt mellan <strong>biltyper</strong>,
          <strong>körstil</strong> och <strong>körförhållanden</strong>.
        </p>

        <h3>Typisk förbrukning</h3>
        <ul>
          <li><strong>Bensin:</strong> 0,55-0,83 l/mil (5,5-8,3 l/100 km)</li>
          <li><strong>Diesel:</strong> 0,45-0,67 l/mil (4,5-6,7 l/100 km)</li>
          <li><strong>El:</strong> 1,5-2,0 kWh/mil (15-20 kWh/100 km)</li>
          <li><strong>Hybrid:</strong> lägre förbrukning än ren bensin, särskilt i stadstrafik</li>
        </ul>

        <h3>Så minskar du förbrukningen</h3>
        <ul>
          <li>Kör jämnt - undvik hård acceleration och inbromsning</li>
          <li>Håll jämn hastighet på motorvägen (optimalt 80-100 km/tim)</li>
          <li>Kontrollera däcktrycket regelbundet (för lågt tryck ökar förbrukningen)</li>
          <li>Ta bort onödig vikt och takbox</li>
          <li>Använd luftkonditioneringen med måtta</li>
          <li>Planera rutter för att undvika köer</li>
        </ul>

        <h3>Bensin vs. diesel vs. el</h3>
        <p>
          När du väljer <strong>drivmedel</strong> bör du tänka på:
        </p>
        <ul>
          <li><strong>Bensin:</strong> Lägre inköpspris, högre kostnad per mil</li>
          <li><strong>Diesel:</strong> Bra för långa sträckor, ofta högre pris per liter</li>
          <li><strong>El:</strong> Lägst kostnad per mil, men högre inköpspris och behov av laddinfrastruktur</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Så räknar du ut bränslekostnaden med siffror</h2>
        <p>
          Regnestycket är detsamma varje gång: <strong>sträckan delad med förbrukningen</strong>{" "}
          ger mängden, och mängden gånger med <strong>literpriset</strong> ger kostnaden. Här är de
          tre drivmedlen räknade på {braendstofKm} km, alltså {helTalMil} mil, med de
          förutsättningar som vården använder.
        </p>
        <table>
          <thead>
            <tr>
              <th>Drivmedel</th>
              <th>Förbrukning</th>
              <th>Beräkning</th>
              <th>Kostnad</th>
              <th>Per mil</th>
            </tr>
          </thead>
          <tbody>
            {seRækker.map((r) => (
              <tr key={r.type}>
                <td>{drivmiddelNavnSe[r.type]}</td>
                <td>{talSe(r.forbrug)} {r.forbrugsEnhed}</td>
                <td>
                  {r.type === "el"
                    ? `${braendstofKm} × ${talSe(r.forbrug)} ÷ 100 = ${talSe(r.maengde)} kWh`
                    : `${braendstofKm} ÷ ${talSe(r.forbrug)} = ${talSe(r.maengde)} l`}
                  <br />
                  {talSe(r.maengde)} {r.enhed} × {krSe(r.enhedPris)} kr. ={" "}
                  <strong>{heleKronerSe(r.pris)} kr.</strong>
                </td>
                <td>{heleKronerSe(r.pris)} kr.</td>
                <td>{krSe(prisPrMil(r.type, "se"))} kr.</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Kostnaderna är avrundade till hela kronor. Observera att <strong>bensin är billigare
          både per liter och per kilometer</strong> i Sverige just nu, så skillnaden mellan
          drivmedlen är större än den är i Danmark — och det är avståndet per liter, inte
          priset per liter, som avgör kostnaden per mil.
        </p>

        <h2>Varför är diesel dyrare än bensin?</h2>
        <p>
          Frågan har två svar, och i Sverige pekar de åt <strong>samma håll</strong> till skillnaden
          mellan dem. Mätningen bakom sidan är från <strong>21 september 2026</strong>: bensin
          kostar <strong>{krSe(seForuds.benzin.literPris)} kr./liter</strong> och diesel{" "}
          <strong>{krSe(seForuds.diesel.literPris)} kr./liter</strong> (GlobalPetrolPrices) — diesel
          är alltså {talSe(procent1Decimals(((seForuds.diesel.literPris / seForuds.benzin.literPris) - 1) * 100))}{" "}
          % dyrare pr. liter.
        </p>
        <p>
          <strong>Pr. kilometer</strong> går det åt samma håll: eftersom dieseln också är
          dyrare per liter håller dess lägre förbrukning inte. Dieseln kör{" "}
          {seForuds.diesel.kmPerLiter} km/l mot bensins {seForuds.benzin.kmPerLiter} km/l, men
          skillnaden i literpris är så stor att bensin ändå blir billigast per kilometer. Samma{" "}
          {braendstofKm} km med förutsättningarna i verktyget:
        </p>
        <table>
          <thead>
            <tr>
              <th>{braendstofKm} km</th>
              <th>Bensin</th>
              <th>Diesel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Förbrukning</td>
              <td>{talSe(seBenzin.forbrug)} {seBenzin.forbrugsEnhed}</td>
              <td>{talSe(seDiesel.forbrug)} {seDiesel.forbrugsEnhed}</td>
            </tr>
            <tr>
              <td>Literpris</td>
              <td>{krSe(seBenzin.enhedPris)} kr./l</td>
              <td>{krSe(seDiesel.enhedPris)} kr./l</td>
            </tr>
            <tr>
              <td>Pris för {braendstofKm} km</td>
              <td>{heleKronerSe(seBenzin.pris)} kr.</td>
              <td>{heleKronerSe(seDiesel.pris)} kr.</td>
            </tr>
            <tr>
              <td>Pris per km</td>
              <td>{krSe(seBenzin.prisPrKm)} kr.</td>
              <td>{krSe(seDiesel.prisPrKm)} kr.</td>
            </tr>
            <tr>
              <td>Pris per mil</td>
              <td>{krSe(prisPrMil("benzin", "se"))} kr.</td>
              <td>{krSe(prisPrMil("diesel", "se"))} kr.</td>
            </tr>
          </tbody>
        </table>
        <p>
          Diesel kostar altså {heleKronerSe(seDiesel.pris - seBenzin.pris)}{" "}
          kr. mer för de {braendstofKm} km — {talSe(seDiesel.maengde)} l mot bensins{" "}
          {talSe(seBenzin.maengde)} l. Priserna på bensin och diesel följer inte heller varandra
          1:1, så siffrorna ändras från vecka till vecka. Skriv in dagens pris från pumpen i
          verktyget ovan, så räknar det med dina egna siffror.
        </p>
        <p>
          Vill du jämföra med elbilens kostnad per mil, gör du det i{" "}
          <Link href="/elbil">elbilskalkylatorn</Link>.
        </p>

        <h2>Så hittar du din egen förbrukning</h2>
        <p>
          Har bilen ingen resaivare, så hittar du förbrukningen själv:{" "}
          <strong>liter som fylls på delat med kilometer som körts</strong> ger ditt km/l. Fyra
          påfyllningar på {egentForbrugSe.liter} liter över {egentForbrugSe.km} km ger{" "}
          {egentForbrugSe.km} ÷ {egentForbrugSe.liter} ={" "}
          <strong>{talSe(egentForbrugSeKmPrLiter)} km/l</strong>, alltså{" "}
          {talSe(egentForbrugSe.liter / egentForbrugSe.km * 100)} liter per 100 km. Kör gärna
          300-400 km på fyra fulla tankar — en enda påfyllning träffas lätt av en
          felavläsning.
        </p>

        <h3>km/l, liter per 100 km eller liter per mil?</h3>
        <p>
          Instrumentpanelen visar liter per 100 km, medan verktyg och manualer använder km/l, och
          svenskar räknar dessutom i liter per mil. Det är samma tal i tre kläder: omregningen är
          100 dividerat med det ena och 10 delat med det andra. {seForuds.benzin.kmPerLiter} km/l är{" "}
          {talSe(literPr100km(seForuds.benzin.kmPerLiter))} l/100 km, som i sin tur är{" "}
          {talSe(literPrMil(seForuds.benzin.kmPerLiter))} l/mil. Ett typiskt bensinbil kör 12-18 km/l,
          alltså {talSe(literPr100km(18))}-{talSe(literPr100km(12))} l/100 km.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/braendstof" />

      <RelateredeArtikler current="/braendstof" locale={locale} />
    </div>
  );
}
