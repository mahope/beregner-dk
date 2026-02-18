import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Cookiepolitik | MinBeregner.dk",
  description:
    "Læs om vores brug af cookies på MinBeregner.dk. Vi bruger som udgangspunkt ikke cookies. Eventuelle annonce-cookies aktiveres først efter samtykke, når vi er AdSense-godkendt.",
  robots: { index: true, follow: true },
};

export default function CookiePolitikPage() {
  return (
    <div className="prose max-w-3xl">
      <Breadcrumbs items={[{ name: "Cookiepolitik", href: "/cookiepolitik" }]} />

      <h1>Cookiepolitik</h1>
      <p>
        Denne side forklarer, hvordan MinBeregner.dk forholder sig til cookies
        og lignende teknologier. Vi værner om dit privatliv og indsamler ikke
        personhenførbare oplysninger til markedsføring uden dit udtrykkelige
        samtykke.
      </p>

      <h2>Bruger vi cookies?</h2>
      <p>
        Som udgangspunkt bruger MinBeregner.dk <strong>ingen cookies</strong> til
        tracking eller annoncer. Vores beregnere kører lokalt i din browser, og
        dine data sendes ikke til vores servere.
      </p>

      <h2>Analysering af trafik</h2>
      <p>
        Vi kan anvende Plausible Analytics til anonym trafikmåling. Plausible
        benytter ikke cookies og indsamler ikke personhenførbare oplysninger.
        Data er aggregerede og anvendes udelukkende til at forbedre siden.
      </p>

      <h2>Annoncecookies (fremtidigt)</h2>
      <p>
        I forbindelse med en kommende ansøgning til Google AdSense kan der på et
        senere tidspunkt blive brugt cookies til annoncering. Disse vil i så
        fald først blive aktiveret <strong>efter dit samtykke</strong>, og du
        vil få tydelig information og mulighed for at ændre dit valg.
      </p>

      <h2>Sådan styrer du cookies</h2>
      <p>
        Du kan til enhver tid justere dine browserindstillinger for at blokere
        eller slette cookies. Se vejledninger for din browser for detaljer.
      </p>

      <h2>Kontakt</h2>
      <p>
        Har du spørgsmål til vores cookiepolitik, er du velkommen til at
        kontakte os via siden <a href="/om">Om MinBeregner.dk</a>.
      </p>

      <h2>Opdateringer</h2>
      <p>
        Denne cookiepolitik kan blive opdateret. Den seneste version vil altid
        være tilgængelig på denne side.
      </p>
    </div>
  );
}
