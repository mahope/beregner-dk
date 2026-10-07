import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import HundealderBeregner from "@/components/HundealderBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  HUNDEALDER_EKSEMPEL,
  HUNDE_STORRELSER,
  HUNDE_STORRELSE_ORDER,
  HUNDE_TABEL_AAR,
  LIVSFASE_NAVN,
  menneskeAar,
} from "@/lib/hundealder";

export async function generateMetadata() {
  return generatePageMetadata("hundealder");
}

export default async function HundealderPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData =
    getPageData("hundealder", locale) || getPageData("hundealder", "da")!;
  const se = locale === "se";
  const fmt = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 1 });
  const eksempel = fmt(HUNDEALDER_EKSEMPEL.menneskeAar);
  const eksempelLivsfase = LIVSFASE_NAVN[HUNDEALDER_EKSEMPEL.livsfase][se ? "se" : "da"];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/hundealder`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/hundealder" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <HundealderBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Hundår till människoår, per storlek" : "Hundeår til menneskeår, pr. størrelse"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                {se ? "Människoår per hundår och storlek" : "Menneskeår pr. hundeår og størrelse"}
              </caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4">
                    {se ? "Ålder (hund)" : "Alder (hund)"}
                  </th>
                  {HUNDE_STORRELSE_ORDER.map((s) => (
                    <th key={s} scope="col" className="py-2 pr-4">
                      {HUNDE_STORRELSER[s][se ? "se" : "da"]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HUNDE_TABEL_AAR.map((hundAar) => (
                  <tr key={hundAar} className="border-b last:border-0">
                    <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                      {hundAar} år
                    </th>
                    {HUNDE_STORRELSE_ORDER.map((s) => (
                      <td key={s} className="py-2 pr-4">
                        {fmt(menneskeAar(hundAar, s))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Tabellen följer AVMA:s och AKC:s storleksjusterade metod. Tomma rutor finns inte: även de högsta åldrarna visas, även om de sällan nås av stora hundar."
              : "Tabellen følger AVMA's og AKC's størrelsesjusterede metode. Der er ingen tomme felter: også de højeste aldre står der, selv om store hunde sjældent når dem."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Så räknas hundår om" : "Sådan regnes hundeår om"}</h2>
          <p>
            {se
              ? `Metoden kommer från American Veterinary Medical Association (AVMA): det första hundåret räknas som 15 människoår, det andra lägger till 9 (alltså 24 efter två år), och varje år därefter lägger till 4 till 7 människoår beroende på hundens storlek. En mellanstor hund på ${HUNDEALDER_EKSEMPEL.hundAar} år blir ${eksempel} människoår.`
              : `Metoden kommer fra American Veterinary Medical Association (AVMA): det første hundår regnes som 15 menneskeår, det andet lægger 9 til (altså 24 efter to år), og hvert år derefter lægger 4 til 7 menneskeår til afhængigt af hundens størrelse. En mellemstor hund på ${HUNDEALDER_EKSEMPEL.hundAar} år bliver ${eksempel} menneskeår.`}
          </p>
          <p>
            {se
              ? "De två första åren är lika för alla storlekar — en valp växer lika fort oavsett ras. Det är först efter två års ålder som storleken avgör takten: små hundar lägger till 4 människoår per hundår, mellanstora 5, stora 6 och jättehundar 7."
              : "De to første år er ens for alle størrelser — en hvalp vokser lige hurtigt uanset race. Det er først efter to års alder, at størrelsen afgør takten: små hunde lægger 4 menneskeår til pr. hundår, mellemstore 5, store 6 og kæmpehunde 7."}
          </p>

          <h2>{se ? "Varför 7-regeln är fel" : "Hvorfor ×7-reglen er forkert"}</h2>
          <p>
            {se
              ? "Regeln «1 hundår = 7 människoår» stämmer inte, därför att en hund åldras olinjärt. En ettårig hund är redan färdigvuxen och könsmogen — närmast en tonåring på 15, inte ett barn på 7. Om man multiplicerar med 7 blir gamla hundar dessutom för gamla: en stor hund på 10 år skulle bli 70, men ligger enligt tabellen på 72, medan en liten hund på 10 år bara är 56."
              : "Reglen «1 hundår = 7 menneskeår» passer ikke, fordi en hund ældes ujævnt. En etårig hund er allerede udvokset og kønsmoden — nærmest en teenager på 15, ikke et barn på 7. Ganger man med 7, bliver gamle hunde samtidig for gamle: en stor hund på 10 år ville blive 70, men ligger ifølge tabellen på 72, mens en lille hund på 10 år kun er 56."}
          </p>

          <h2>{se ? "Livsfaser i människoår" : "Livsfaser i menneskeår"}</h2>
          <p>
            {se
              ? "Räknaren sätter också en livsfas på hunden. En valp är under ett år, en ung hund mellan ett och två. Därefter är hunden vuxen till dess att den räknas som senior: vid 7 år för små och mellanstora hundar, vid 6 för stora och vid 5 för jättehundar. Det är samma gränser som AVMA använder, och därför går de tidigare för de stora raserna."
              : "Beregneren sætter også en livsfase på hunden. En hvalp er under et år, en unghund mellem et og to. Derefter er hunden voksen, indtil den regnes som senior: ved 7 år for små og mellemstore hunde, ved 6 for store og ved 5 for kæmpehunde. Det er de samme grænser, AVMA bruger, og derfor falder de tidligere for de store racer."}
          </p>
          <p>
            {se
              ? `I exemplet ovan är hunden ${eksempel} människoår och därmed ${eksempelLivsfase.toLowerCase()}.`
              : `I eksemplet ovenfor er hunden ${eksempel} menneskeår og dermed ${eksempelLivsfase.toLowerCase()}.`}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/hundealder" />
      </div>
      <Sidebar currentHref="/hundealder" adSlotId="hundealder-sidebar" />
    </div>
  );
}
