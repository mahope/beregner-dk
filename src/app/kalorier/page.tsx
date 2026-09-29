import KalorieBeregner from "@/components/KalorieBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PROTEIN_G_PER_KG, kaloriePrAlderRaekker, kaloriePrDagRaekker, type KalorieMaal } from "@/lib/makroer";
import { formatNumber } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("kalorier");
}

export default async function KalorierPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kalorier", locale) || getPageData("kalorier", "da")!;
  const dec = (value: number) => formatNumber(value, locale, { maximumFractionDigits: 1 });
  const proteinRange = (maal: KalorieMaal) => {
    const { min, max } = PROTEIN_G_PER_KG[maal];
    return `${dec(min)}-${dec(max)}`;
  };

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/kalorier`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/kalorier" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <KalorieBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Hvor mange kalorier pr dag?</h2>
        <p>
          Det er det tal de fleste søger på, og det afhænger af{" "}
          <strong>vægt, højde, alder, køn og hvor aktiv du er</strong> — altså
          af alle fem felter i værktøjet ovenfor. Herunder er tallene for en
          mand og en kvinde på <strong>180 cm og 30 år</strong> med{" "}
          <strong>moderat aktivitet</strong> (træner 1-3 gange om ugen), som er
          den aktivitet de fleste ligger på.
        </p>
        <table>
          <thead>
            <tr>
              <th>Vægt</th>
              <th>Mand, kalorier pr dag</th>
              <th>Kvinde, kalorier pr dag</th>
              <th>Mand, vægttab</th>
              <th>Kvinde, vægttab</th>
            </tr>
          </thead>
          <tbody>
            {kaloriePrDagRaekker().map((raekke) => (
              <tr key={raekke.vaegtKg}>
                <td>{dec(raekke.vaegtKg)} kg</td>
                <td>{dec(raekke.mand)} kcal</td>
                <td>{dec(raekke.kvinde)} kcal</td>
                <td>{dec(raekke.tabMand)} kcal</td>
                <td>{dec(raekke.tabKvinde)} kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Kolonnen <strong>vægttab</strong> er 500 kcal under dagens forbrug, så
          tallet <strong>2.259 kcal</strong> for en mand på 80 kg er både det
          værktøjet viser og det, <a href="/vaegttab">/vaegttab</a> regner ud fra
          0,5 kg tab pr. uge. Er du lille og inaktiv, kan 500 kcal ikke tages
          uden at komme under dit basalstofskifte — så lægger værktøjet et
          mindre underskud i stedet.
        </p>
        <p>
          Er tallene højere eller lavere end du forventer, er det
          aktivitetsniveauet der er forkert, ikke din vægt. Svarer du{" "}
          <a href="/motion-kalorier">stillesiddende</a> men træner tre gange om
          ugen, er du ikke stillesiddende.
        </p>

        <h2>Forstå dit kaloriebehov</h2>
        <p>
          Dit <strong>kaloriebehov</strong> afhænger af flere faktorer: alder, køn, vægt, højde
          og hvor aktiv du er. Denne beregner bruger{" "}
          <strong>Mifflin-St Jeor formlen</strong>, som er den mest præcise
          metode til at estimere dit basalstofskifte.
        </p>

        <h2>BMR vs. TDEE</h2>

        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Dit <strong>basalstofskifte</strong> er antallet af kalorier din krop brænder bare for
          at holde dig i live — hjertet pumper, lungerne trækker vejret,
          cellerne fornyer sig. Selv hvis du lå stille i sengen hele dagen,
          ville du brænde disse kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          <strong>TDEE</strong> er dit <strong>totale daglige kalorieforbrug</strong> — BMR plus alle de kalorier
          du brænder gennem aktivitet: gåture, træning, arbejde, selv at tænke
          bruger kalorier.
        </p>

        <h2>Vægttab og kalorieunderskud</h2>
        <p>
          For at tabe vægt skal du spise <strong>færre kalorier end du forbrænder</strong>. En
          god tommelfingerregel:
        </p>
        <ul>
          <li>
            <strong>500 kcal underskud/dag</strong> = ca. 0,5 kg tab/uge
          </li>
          <li>
            <strong>1000 kcal underskud/dag</strong> = ca. 1 kg tab/uge (ikke
            anbefalet længe)
          </li>
        </ul>
        <p>
          Beregneren <strong>regner aldrig et underskud, der fører dig under dit
          basalstofskifte</strong> — kroppen skal bruge BMR bare for at leve. Er
          du lille og inaktiv, kan 500 kcal underskud ikke lade sig gøre, og
          værktøjet skriver da det underskud, der faktisk er muligt, i stedet for
          500.
        </p>

        <h2>Makronæringsstoffer</h2>

        <h3>Protein</h3>
        <p>
          <strong>Protein</strong> er essentielt for muskler, hår, hud og hundredvis af
          kropsprocesser.
        </p>
        <ul>
          <li>
            <strong>Vedligehold:</strong> {proteinRange("vedligehold")} g per kg kropsvægt
          </li>
          <li>
            <strong>Vægttab:</strong> {proteinRange("tab")} g per kg (bevarer muskler)
          </li>
          <li>
            <strong>Muskelopbygning:</strong> {proteinRange("opbyg")} g per kg
          </li>
          <li>
            Beregneren bruger midten af det valgte interval, så proteinmængden følger dit mål
          </li>
        </ul>
        <p>1g protein = 4 kalorier</p>

        <h3>Fedt</h3>
        <p>
          <strong>Fedt</strong> er vigtigt for hormoner, vitaminoptagelse og cellestruktur.
          Minimum <strong>20-25% af kalorier</strong> bør komme fra fedt.
        </p>
        <p>1g fedt = 9 kalorier</p>

        <h3>Kulhydrater</h3>
        <p>
          <strong>Kulhydrater</strong> er kroppens <strong>foretrukne energikilde</strong>, især under træning.
          Mængden kan variere meget baseret på dine mål og præferencer.
        </p>
        <p>1g kulhydrat = 4 kalorier</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitsværdier.
            Individuelle variationer kan være betydelige. Ved større
            vægtændringer eller helbredsproblemer, konsulter altid en læge eller
            diætist.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Hur många kalorier per dag?</h2>
        <p>
          Det är det talet de flesta söker på, och det beror på{" "}
          <strong>vikt, längd, ålder, kön och hur aktiv du är</strong> — alltså
          alla fem fälten i verktyget ovan. Här är talen för en man och en
          kvinna på <strong>180 cm och 30 år</strong> med{" "}
          <strong>måttlig aktivitet</strong> (tränar 1-3 gånger i veckan), vilket
          är den aktivitet de flesta ligger på.
        </p>
        <table>
          <thead>
            <tr>
              <th>Vikt</th>
              <th>Man, kcal per dag</th>
              <th>Kvinna, kcal per dag</th>
              <th>Man, viktnedgång</th>
              <th>Kvinna, viktnedgång</th>
            </tr>
          </thead>
          <tbody>
            {kaloriePrDagRaekker().map((raekke) => (
              <tr key={raekke.vaegtKg}>
                <td>{dec(raekke.vaegtKg)} kg</td>
                <td>{dec(raekke.mand)} kcal</td>
                <td>{dec(raekke.kvinde)} kcal</td>
                <td>{dec(raekke.tabMand)} kcal</td>
                <td>{dec(raekke.tabKvinde)} kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Spalten <strong>viktnedgång</strong> ligger 500 kcal under dagsförbrukningen,
          så talet <strong>2.259 kcal</strong> för en man på 80 kg är både det
          verktyget visar och det som <a href="/vaegttab">/vaegttab</a> räknar
          fram till 0,5 kg viktnedgång per vecka. Är du liten och inaktiv går 500
          kcal inte att dra av utan att komma under ditt basalomsättning — då
          lägger verktyget in ett mindre underskott i stället.
        </p>
        <p>
          Blir talen högre eller lägre än du väntat dig är det
          aktivitetsnivån som är fel, inte din vikt. Svarar du{" "}
          <a href="/motion-kalorier">stillsittande</a> men tränar tre gånger i
          veckan är du inte stillsittande.
        </p>

        <h2>Kaloribehov efter ålder</h2>
        <p>
          Åldern påverkar behovet, och det är den sista termen i formeln: varje år
          du blir äldre räknar Mifflin-St Jeor av <strong>5 kcal</strong> från
          ditt basalomsättning, för män och kvinnor lika. Det låter lite, men
          tio år blir 50 kcal i BMR — och vid måttlig aktivitet{" "}
          <strong>77 kcal i dagsförbrukningen</strong>. Här är samma person på
          80 kg och 180 cm, bara äldre:
        </p>
        <table>
          <thead>
            <tr>
              <th>Ålder</th>
              <th>Man, kcal per dag</th>
              <th>Kvinna, kcal per dag</th>
              <th>Kvinna, viktnedgång</th>
            </tr>
          </thead>
          <tbody>
            {kaloriePrAlderRaekker().map((raekke) => (
              <tr key={raekke.alder}>
                <td>{raekke.alder} år</td>
                <td>{dec(raekke.mand)} kcal</td>
                <td>{dec(raekke.kvinde)} kcal</td>
                <td>{dec(raekke.tabKvinde)} kcal</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Rad 30 år är den samma som 80 kg-raden i tabellen ovan — samma
          person, olika ingång. Ligger du under 30 eller över 80 år skriver du
          ditt eget ålderstal i verktyget; raderna är bara beräkningarna för de
          ålderstal som faktiskt sätts i fråga.
        </p>
        <p>
          <strong>Kaloribehovet för barn räknas inte ut med den här formeln.</strong>
          Formeln är validerad för vuxna, och barn har ett helt annat behov per
          kilo — där ska du använda en tabell för barn eller fråga en
          barnläkare. Verktyget räknar alltså bara ut vuxnas behov.
        </p>

        <h2>Förstå ditt kaloriebehov</h2>
        <p>
          Ditt <strong>kaloriebehov</strong> beror på flera faktorer: ålder, kön, vikt, längd
          och hur aktiv du är. Denna kalkylator använder{" "}
          <strong>Mifflin-St Jeor-formeln</strong>, som är den mest exakta
          metoden för att uppskatta din basalämnesomsättning.
        </p>

        <h2>BMR vs. TDEE</h2>

        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Din <strong>basalämnesomsättning</strong> är antalet kalorier din kropp förbränner bara för
          att hålla dig vid liv — hjärtat pumpar, lungorna andas,
          cellerna förnyas. Även om du låg stilla i sängen hela dagen
          skulle du förbränna dessa kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          <strong>TDEE</strong> är din <strong>totala dagliga kaloriförbrukning</strong> — BMR plus alla kalorier
          du förbränner genom aktivitet: promenader, träning, arbete, till och med att tänka
          förbrukar kalorier.
        </p>

        <h2>Viktnedgång och kaloriunderskott</h2>
        <p>
          För att gå ner i vikt måste du äta <strong>färre kalorier än du förbränner</strong>. En
          bra tumregel:
        </p>
        <ul>
          <li>
            <strong>500 kcal underskott/dag</strong> = ca 0,5 kg viktnedgång/vecka
          </li>
          <li>
            <strong>1000 kcal underskott/dag</strong> = ca 1 kg viktnedgång/vecka (inte
            rekommenderat under längre tid)
          </li>
        </ul>
        <p>
          Kalkylatorn räknar <strong>aldrig ett underskott som tar dig under din
          basalämnesomsättning</strong> — kroppen behöver BMR bara för att leva. Är
          du liten och inaktiv går 500 kcal underskott inte att genomföra, och
          verktyget skriver då det underskott som faktiskt går, i stället för 500.
        </p>

        <h2>Makronäringsämnen</h2>

        <h3>Protein</h3>
        <p>
          <strong>Protein</strong> är essentiellt för muskler, hår, hud och hundratals
          kroppsprocesser.
        </p>
        <ul>
          <li>
            <strong>Underhåll:</strong> {proteinRange("vedligehold")} g per kg kroppsvikt
          </li>
          <li>
            <strong>Viktnedgång:</strong> {proteinRange("tab")} g per kg (bevarar muskler)
          </li>
          <li>
            <strong>Muskeluppbyggnad:</strong> {proteinRange("opbyg")} g per kg
          </li>
          <li>
            Kalkylatorn använder mitten av det valda intervallet, så proteinmängden följer ditt mål
          </li>
        </ul>
        <p>1 g protein = 4 kalorier</p>

        <h3>Fett</h3>
        <p>
          <strong>Fett</strong> är viktigt för hormoner, vitaminupptag och cellstruktur.
          Minst <strong>20-25 % av kalorierna</strong> bör komma från fett.
        </p>
        <p>1 g fett = 9 kalorier</p>

        <h3>Kolhydrater</h3>
        <p>
          <strong>Kolhydrater</strong> är kroppens <strong>föredragna energikälla</strong>, särskilt under träning.
          Mängden kan variera mycket beroende på dina mål och preferenser.
        </p>
        <p>1 g kolhydrat = 4 kalorier</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Denna kalkylator ger en uppskattning baserad på genomsnittsvärden.
            Individuella variationer kan vara betydande. Vid större
            viktförändringar eller hälsoproblem, rådgör alltid med en läkare eller
            dietist.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/kalorier" />
    </div>
  );
}
