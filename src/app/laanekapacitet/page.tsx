import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LaanekapacitetBeregner from "@/components/LaanekapacitetBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";
import {
  GAELDSFAKTOR_STANDARD,
  LAANEKAPACITET_EKSEMPEL,
  LAANEKAPACITET_KILDE,
  REALKREDIT_MAKS_PCT,
  UDBETALING_MIN_PCT,
  beregnLaanekapacitet,
  laanekapacitetEksempelRækker,
} from "@/lib/laanekapacitet";

export async function generateMetadata() {
  return generatePageMetadata("laanekapacitet");
}

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });

export default async function LaanekapacitetPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("laanekapacitet", locale) || getPageData("laanekapacitet", "da")!;

  const eksempel = beregnLaanekapacitet(LAANEKAPACITET_EKSEMPEL);
  const rækker = laanekapacitetEksempelRækker();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/laanekapacitet`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/laanekapacitet" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <LaanekapacitetBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget kan du låne til bolig?</h2>
          <p>
            Det korte svar er, at det er den <strong>laveste</strong> af to grænser, der
            bestemmer dit boligkøb: hvor meget gæld du må have i forhold til din indkomst
            (<strong>gældsfaktoren</strong>), og hvor meget du kan lægge i
            <strong> udbetaling</strong>. Banken regner på begge og siger ja til det laveste.
          </p>
          <p>
            Gældsfaktoren er husstandens samlede gæld delt med den årlige bruttoløn.{" "}
            {GAELDSFAKTOR_STANDARD} er Finanstilsynets referencepunkt, og en højere faktor
            kræver en bedre begrundelse — derfor kan du vælge mellem 3,5, {GAELDSFAKTOR_STANDARD}{" "}
            og 5 i beregneren. Udbetalingen skal som udgangspunkt være mindst{" "}
            {UDBETALING_MIN_PCT} % af købesummen, og den del skal være dine egne penge.
          </p>
          <p>
            Med {kr(LAANEKAPACITET_EKSEMPEL.husstandsindkomst)} kr. i husstandsindkomst og{" "}
            {kr(LAANEKAPACITET_EKSEMPEL.udbetaling)} kr. i udbetaling giver gældsfaktor{" "}
            {GAELDSFAKTOR_STANDARD} en låneramme på <strong>{kr(eksempel.laaneramme)} kr.</strong>.
            Det svarer til en bolig til op til <strong>{kr(eksempel.maksBoligpris)} kr.</strong>,
            hvoraf de {UDBETALING_MIN_PCT} % — <strong>{kr(eksempel.kraevUdbetaling)} kr.</strong>{" "}
            — skal lægges kontant. Udbetalingen alene ville række til{" "}
            {kr(eksempel.maksPrisEfterUdbetaling)} kr., så her er det{" "}
            {eksempel.bindendeGraense === "gaeldsfaktor"
              ? "gældsfaktoren"
              : "udbetalingen"}{" "}
            der sætter grænsen.
          </p>

          <h2>Så meget kan du købe bolig for</h2>
          <p>
            Tabellen er regnet med {kr(LAANEKAPACITET_EKSEMPEL.udbetaling)} kr. i udbetaling,
            ingen anden gæld og gældsfaktor {GAELDSFAKTOR_STANDARD} — de samme tal, som
            beregneren starter på.
          </p>
          <table>
            <thead>
              <tr>
                <th>Indkomst (kr./år)</th>
                <th>Lån op til</th>
                <th>Boligpris</th>
                <th>Udbetaling ({UDBETALING_MIN_PCT} %)</th>
              </tr>
            </thead>
            <tbody>
              {rækker.map((r) => (
                <tr key={r.husstandsindkomst}>
                  <td>{kr(r.husstandsindkomst)}</td>
                  <td>{kr(r.laanVedMaks)} kr.</td>
                  <td>
                    <strong>{kr(r.maksBoligpris)} kr.</strong>
                  </td>
                  <td>{kr(r.kraevUdbetaling)} kr.</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Sådan er boligkøbet finansieret</h2>
          <p>
            Når du køber en ejerbolig, deler bankerne købesummen op i tre dele:
          </p>
          <ul>
            <li>
              <strong>Realkredit:</strong> op til {REALKREDIT_MAKS_PCT} % af boligens værdi.
              Det er den billigste del, fordi lånet er sikret i boligen.
            </li>
            <li>
              <strong>Banklån:</strong> de næste 15 % — typisk et dyrere lån med højere rente.
            </li>
            <li>
              <strong>Udbetaling:</strong> de sidste {UDBETALING_MIN_PCT} %, som du skal lægge
              selv.
            </li>
          </ul>
          <p>
            På en bolig til {kr(eksempel.maksBoligpris)} kr. er det ca.{" "}
            <strong>{kr(eksempel.realkreditDel)} kr. i realkredit</strong>,{" "}
            <strong>{kr(eksempel.banklaanDel)} kr. i banklån</strong> og{" "}
            <strong>{kr(eksempel.kraevUdbetaling)} kr. i udbetaling</strong>. Vil du regne den
            månedlige ydelse på lånet, kan du bruge{" "}
            <Link href="/boliglaan" className="underline font-medium">
              boliglånsberegneren
            </Link>{" "}
            eller{" "}
            <Link href="/laaneberegner" className="underline font-medium">
              låneberegneren
            </Link>
            .
          </p>

          <h2>Hvad sænker din lånekapacitet?</h2>
          <p>
            Al anden gæld tæller med i gældsfaktoren — billån, studielån, forbrugslån og hele
            kassekreditten, også selv om du ikke har brugt den. Derfor flytter det ofte mere at
            betale gæld ud end at få en tilsvarende lønstigning. Skriv din gæld ind i feltet{" "}
            <strong>«Anden gæld»</strong>, så ser du effekten med det samme.
          </p>
          <p>
            Ud over gældsfaktoren og udbetalingen vurderer banken dit{" "}
            <strong>rådighedsbeløb</strong> — hvor meget du har tilbage hver måned efter alle
            faste udgifter. Har du børn eller en dyr bil, kan rådighedsbeløbet blive den grænse,
            der binder, selv om gældsfaktoren ser fin ud.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Beregneren er et skøn ud fra de offentligt kendte grænser. Banken laver altid sin
              egen kreditvurdering, hvor rådighedsbeløb, formue og jobsikkerhed også indgår. Læs
              mere i{" "}
              <a
                href={LAANEKAPACITET_KILDE.gaeldsfaktor}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                bekendtgørelsen om god skik for boligkredit
              </a>{" "}
              og{" "}
              <a
                href={LAANEKAPACITET_KILDE.realkredit}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                realkreditlovens lånegrænser
              </a>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om lånekapacitet" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/laanekapacitet" />
        </section>
      </div>

      <Sidebar currentHref="/laanekapacitet" adSlotId="laanekapacitet-sidebar" />
    </div>
  );
}
