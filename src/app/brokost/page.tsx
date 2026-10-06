import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BrokostBeregner from "@/components/BrokostBeregner";
import OresundsbroenBeregner from "@/components/OresundsbroenBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  BROKOST_KATEGORIER,
  BROKOST_MAX_EKSPRESPRIS,
  BROKOST_MIN_EKSPRESPRIS,
  BROKOST_RABATTER,
  BROKOST_START,
  BROKOST_START_OVERFARTER,
  BROKOST_START_TURE,
  brokostAarsforskel,
  brokostForskel,
} from "@/lib/brokost";
import {
  ORESUND_GO_AARSAFGIFT,
  ORESUND_KATEGORIER,
  ORESUND_MAX_NORMALPRIS,
  ORESUND_MIN_NORMALPRIS,
  ORESUND_START,
  ORESUND_START_TURE,
  oresundKategori,
  oresundGoBreakEven,
} from "@/lib/oresundsbroen";
import { formatNumber } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("brokost");
}

export default async function BrokostPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("brokost", locale) || getPageData("brokost", "da")!;

  // Alle tal i brødteksten læser `brokost.ts`, altså de samme tal værktøjet
  // bruger. Skriver brødteksten dem i hånden, kan den og værktøjet sige hver sit,
  // og de står i Googles svar via FAQSchema.
  const start = BROKOST_KATEGORIER.find((k) => k.nokkel === BROKOST_START)!;
  const forskel = brokostForskel(start)!;
  const aarsForskel = brokostAarsforskel(start, BROKOST_START_OVERFARTER, BROKOST_START_TURE)!;
  const kr = (n: number) => formatNumber(n, locale, { maximumFractionDigits: 0 });

  const rækker = BROKOST_KATEGORIER.map((k) => {
    const kort = k.kortpris === null ? "Kun eksprespris" : `${kr(k.kortpris)} kr.`;
    return { etiket: k.etiket, eksprespris: `${kr(k.eksprespris)} kr.`, kort };
  });

  // Øresundsbron har tre betalingsformer. Tallene læses samme sted som værktøjet.
  const oresundStart = oresundKategori(ORESUND_START)!;
  const oresundBreakEven = oresundGoBreakEven(oresundStart);
  const oresundGoAar = ORESUND_GO_AARSAFGIFT + oresundStart.go * 2 * ORESUND_START_TURE;
  const oresundNormalAar = oresundStart.normal * 2 * ORESUND_START_TURE;
  const oresundBesparelse = oresundNormalAar - oresundGoAar;
  const oresundRækker = ORESUND_KATEGORIER.map((k) => ({
    etiket: k.etiket,
    go: `${kr(k.go)} kr.`,
    online: `${kr(k.online)} kr.`,
    normal: `${kr(k.normal)} kr.`,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/brokost`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/brokost" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <BrokostBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Hvad koster det at krydse Storebæltsbroen?</h2>
          <p>
            En personbil på 3-6 m koster <strong>{kr(start.eksprespris)} kr.</strong> for én overfart,
            hvis du betaler med Bizz eller nummerplade i en grøn ekspresbane. Betaler du med kort eller
            kontanter i de blå og gule baner, er den samme tur{" "}
            <strong>{kr(start.eksprespris + forskel)} kr.</strong> — altså{" "}
            <strong>{kr(forskel)} kr. mere</strong> pr. overfart. Er turen tur/retur og du kører den
            samme aften, er den med betalingsmiddel{" "}
            <strong>{kr(start.eksprespris * 2 - BROKOST_RABATTER.aften)} kr.</strong> med
            aftenrabat.
          </p>
          <p>
            Prisen afhænger af køretøjets samlede længde og højde, målt i betalingsanlægget. Alt
            påmonteret udstyr — anhænger, cykelstativ, bagageboks, tagboks — tæller med, så det er
            totallængden, der afgør prisen.
          </p>

          <h2>Prisliste 2026 for en tur over Storebælt</h2>
          <p>
            Priserne er Storebælts egen prisliste for 2026. Ekspresprisen kræver et automatisk
            betalingsmiddel, altså en Bizz eller en nummerpladebetaling.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="py-2 pr-4">Køretøj</th>
                  <th className="py-2 pr-4">Eksprespris</th>
                  <th className="py-2">Kort- og kontantpris</th>
                </tr>
              </thead>
              <tbody>
                {rækker.map((r) => (
                  <tr
                    key={r.etiket}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-2 pr-4">{r.etiket}</td>
                    <td className="py-2 pr-4">{r.eksprespris}</td>
                    <td className="py-2">{r.kort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Ekspresprisen i listen ligger mellem {kr(BROKOST_MIN_EKSPRESPRIS)} kr. og{" "}
            {kr(BROKOST_MAX_EKSPRESPRIS)} kr. for én overfart. Det dyreste er særtransport over 20 m
            og over 100 t, og det billigste er biler og motorcykler på op til 3 m.
          </p>

          <h2>Sådan sparer du på turen over Storebælt</h2>
          <ul>
            <li>
              <strong>Betal med Bizz eller nummerplade.</strong> Ekspresprisen er{" "}
              {kr(forskel)} kr. billigere pr. overfart end kort- og kontantprisen. Gør du det i
              året {BROKOST_START_TURE} gange tur/retur med en personbil 3-6 m, er det{" "}
              <strong>{kr(aarsForskel)} kr.</strong> om året.
            </li>
            <li>
              <strong>Samle turen i én aften.</strong> Aftenrabatten mellem kl. 16 og kl. 03 samme
              aften er {kr(BROKOST_RABATTER.aften)} kr. på hele turen.
            </li>
            <li>
              <strong>Weekend- og helligdagsrabat.</strong> Begge er{" "}
              {kr(BROKOST_RABATTER.weekend)} kr. for tur/retur. Weekendrabatten gælder fra fredag kl.
              12 til søndag kl. 24.
            </li>
          </ul>
          <p>
            Alle tre fritidsrabatter kræver en Storebælt Privataftale, at du betaler med automatisk
            betalingsmiddel, og at køretøjet er under 6 m. Over 6 m kan du ikke bruge
            fritidsbilletterne — betalingsanlægget måler totallængden, også med anhænger.
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Hvad koster det at krydse Øresundsbroen?</h2>
          <p>
            En personbil på max 6 m koster <strong>{kr(oresundStart.go)} kr.</strong> for én overfart
            med rabataftalen ØresundGO, <strong>{kr(oresundStart.online)} kr.</strong> som
            onlinebillet og <strong>{kr(oresundStart.normal)} kr.</strong> i betalingsanlægget.
            ØresundGO kræver en årsafgift på <strong>{kr(ORESUND_GO_AARSAFGIFT)} kr.</strong>, men
            den er tjent ind allerede på den første tur tur/retur. Kører du{" "}
            {ORESUND_START_TURE} ture tur/retur om året i den samme bil, koster rejsen{" "}
            <strong>{kr(oresundGoAar)} kr.</strong> med ØresundGO mod{" "}
            <strong>{kr(oresundNormalAar)} kr.</strong> til normalpris — altså{" "}
            <strong>{kr(oresundBesparelse)} kr. mindre</strong>.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <OresundsbroenBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Prisliste for en tur over Øresundsbron</h2>
          <p>
            Priserne er Øresundsbrons egen prisliste fra 14. september 2026, i danske kroner pr.
            enkelttur inklusive 25 % moms. Onlinebilletten er gyldig i 30 dage og giver yderligere
            10 % rabat, hvis du tilmelder dig nyhedsbrevet.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="py-2 pr-4">Køretøj</th>
                  <th className="py-2 pr-4">ØresundGO</th>
                  <th className="py-2 pr-4">Onlinebillet</th>
                  <th className="py-2">Betalingsanlæg</th>
                </tr>
              </thead>
              <tbody>
                {oresundRækker.map((r) => (
                  <tr
                    key={r.etiket}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <td className="py-2 pr-4">{r.etiket}</td>
                    <td className="py-2 pr-4">{r.go}</td>
                    <td className="py-2 pr-4">{r.online}</td>
                    <td className="py-2">{r.normal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Normalprisen i listen ligger mellem {kr(ORESUND_MIN_NORMALPRIS)} kr. og{" "}
            {kr(ORESUND_MAX_NORMALPRIS)} kr. for én overfart. ØresundGOs årsafgift på{" "}
            {kr(ORESUND_GO_AARSAFGIFT)} kr. er tjent ind efter{" "}
            {oresundBreakEven === 1 ? "én tur" : `${oresundBreakEven} ture`} tur/retur for en
            personbil på max 6 m.
          </p>

          <h2>Brokost og resten af bilens omkostninger</h2>
          <p>
            Broen er sjældent den største post. Vil du se hele regningen for bilen, regner{" "}
            <Link href="/bil">bilomkostningsberegneren</Link> den sammen med benzin, forsikring,
            service og værditab. Skal du kende forbruget på turen, står det i{" "}
            <Link href="/braendstof">brændstofberegneren</Link>, og er du på vej til udlandet, er{" "}
            <Link href="/rejsebudget">rejsebudgetten</Link> det samme tal fordelt på hele rejsen.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/brokost" />
      </div>
      <Sidebar currentHref="/brokost" adSlotId="brokost-sidebar" />
    </div>
  );
}
