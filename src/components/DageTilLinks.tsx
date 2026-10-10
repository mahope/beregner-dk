import Link from "next/link";
import { formatNumber } from "@/lib/format";
import {
  formatTargetDate,
  getDageTilHubRækker,
  isDageTilLocale,
  type DageTilLocale,
} from "@/lib/dage-til";
import type { Locale } from "@/lib/i18n";

/**
 * Blokken «Hvor mange dage er der til …?» er delt mellem `/dato` og
 * `/tidsberegner`: `/dato` har haft den siden opgave C7, og `/tidsberegner` —
 * GSCs tredjestørste side (79.641 visninger, pos. 6,7) med netop søgningerne
 * «hvor lang tid er der til» — havde **0** links til `/dage-til/*`. Blokken
 * blev ud her i stedet for at blive kopieret, så de to sider ikke kan komme
 * til at slæbe hen på forskellige rækker.
 *
 * Rækkerne kommer fra `getDageTilHubRækker` — samme funktion `/dage-til`-hubben
 * og `/dage-til/*` selv bruger — så et tal i listen ikke kan slide fra sit eget
 * regnestykke, og rækkerne står nærmeste-først.
 */

/**
 * Hvor sidens eget tidsværktøj står, når læseren skal tælle til en dato uden
 * for listen. «ovenfor» er sandt på `/dato`, hvor værktøjet står på siden;
 * «datoberegner» sender videre til `/dato` fra en side uden værktøjet.
 */
export type DageTilLinksVaerktoej = "ovenfor" | "datoberegner";

const heading: Record<DageTilLocale, string> = {
  da: "Hvor mange dage er der til …?",
  se: "Hur många dagar är det till …?",
};

const intro: Record<DageTilLocale, string> = {
  da: "Vil du se det præcise antal dage til en bestemt dato? Siden for hver dato tæller sig selv frem hver dag, så tallet er altid aktuelt.",
  se: "Vill du veta exakt hur många dagar som är kvar till ett bestämt datum? Sidan för varje datum räknar om sig själv varje dag, så talet är alltid aktuellt.",
};

const recalc: Record<DageTilLocale, string> = {
  da: "Tallet nedenfor er dagens antal dage, og det genberegnes hver dag.",
  se: "Talet nedan är dagens antal dagar, och räknas om varje dag.",
};

const listIntro: Record<DageTilLocale, Record<DageTilLinksVaerktoej, string>> = {
  da: {
    ovenfor:
      "Listen dækker de datoer, der altid søges på. Skal du tælle til en helt anden dato — en fødselsdag, en deadline eller noget uden for listen — vælger du den i værktøjet «Dage til dato» ovenfor.",
    datoberegner:
      "Listen dækker de datoer, der altid søges på. Skal du tælle til en helt anden dato — en fødselsdag, en deadline eller noget uden for listen — regner datoberegneren mellem to valgfrie datoer.",
  },
  se: {
    ovenfor:
      "Listan tar upp de datum som alltid efterfrågas. Vill du räkna till ett helt annat datum — ett födelsedatum, en deadline eller något utanför listan — väljer du det i verktyget «Dagar till datum» ovanför.",
    datoberegner:
      "Listan tar upp de datum som alltid efterfrågas. Vill du räkna till ett helt annat datum — ett födelsedatum, en deadline eller något utanför listan — räknar datumberäknaren mellan två valfria datum.",
  },
};

/**
 * Ordene «datoberegneren» / «datumberäknaren» er et link til `/dato` på den
 * side, hvor værktøjet ikke selv står — så læseren får vejen videre og
 * `/tidsberegner` ikke bare påstår, at et andet sted kan regne det.
 */
const listIntroLink: Record<DageTilLocale, { foer: string; ord: string; efter: string }> = {
  da: {
    foer:
      "Listen dækker de datoer, der altid søges på. Skal du tælle til en helt anden dato — en fødselsdag, en deadline eller noget uden for listen — regner ",
    ord: "datoberegneren",
    efter: " mellem to valgfrie datoer.",
  },
  se: {
    foer:
      "Listan tar upp de datum som alltid efterfrågas. Vill du räkna till ett helt annat datum — ett födelsedatum, en deadline eller något utanför listan — räknar ",
    ord: "datumberäknaren",
    efter: " mellan två valfria datum.",
  },
};

export default function DageTilLinks({
  locale,
  vaerktoej,
}: {
  locale: Locale;
  vaerktoej: DageTilLinksVaerktoej;
}) {
  if (!isDageTilLocale(locale)) return null;

  const raekker = getDageTilHubRækker(locale, new Date());
  if (raekker.length === 0) return null;

  return (
    <div className="prose dark:prose-invert max-w-none mt-12">
      <h2>{heading[locale]}</h2>
      <p>{intro[locale]}</p>
      <p>{recalc[locale]}</p>
      {vaerktoej === "datoberegner" ? (
        <p>
          {listIntroLink[locale].foer}
          <Link href="/dato">{listIntroLink[locale].ord}</Link>
          {listIntroLink[locale].efter}
        </p>
      ) : (
        <p>{listIntro[locale].ovenfor}</p>
      )}
      <ul>
        {raekker.map((raekke) => (
          <li key={raekke.href}>
            <Link href={raekke.href}>{raekke.question}</Link>{" "}
            {locale === "se" ? (
              <>
                {formatTargetDate(raekke.targetDate, locale)}{" "}
                {formatNumber(raekke.days, "se")}{" "}
                {raekke.days === 1 ? "dag" : "dagar"}
                {raekke.days === 0
                  ? " — det är dagen i dag."
                  : ` (${formatNumber(raekke.weeks, "se")} ${
                      raekke.weeks === 1 ? "vecka" : "veckor"
                    }${
                      raekke.daysLeft === 0
                        ? ""
                        : ` och ${formatNumber(raekke.daysLeft, "se")} ${
                            raekke.daysLeft === 1 ? "dag" : "dagar"
                          }`
                    }).`}
              </>
            ) : (
              <>
                {formatTargetDate(raekke.targetDate, locale)}:{" "}
                <strong>{formatNumber(raekke.days, "da")} dage</strong>
                {raekke.days === 0
                  ? " — det er dagen i dag."
                  : ` (${formatNumber(raekke.weeks, "da")} ${
                      raekke.weeks === 1 ? "uge" : "uger"
                    }${
                      raekke.daysLeft === 0
                        ? ""
                        : ` og ${formatNumber(raekke.daysLeft, "da")} ${
                            raekke.daysLeft === 1 ? "dag" : "dage"
                          }`
                    }).`}
              </>
            )}
          </li>
        ))}
      </ul>
      <p>
        {locale === "se" ? (
          <>
            Du kan också se{" "}
            <Link href="/dagar-till">alla datum samlade på en sida</Link>.
          </>
        ) : (
          <>
            Du kan også se{" "}
            <Link href="/dage-til">alle datoer samlet på én side</Link>.
          </>
        )}
      </p>
      <p>
        {locale === "se" ? (
          <>
            Vill du bara räkna ner till ett datum och se det som veckor och dagar kan du
            använda <Link href="/nedtaelling">nedräkningen</Link>.
          </>
        ) : (
          <>
            Vil du bare tælle ned til én dato og se det som uger og dage, kan du bruge{" "}
            <Link href="/nedtaelling">nedtællingen</Link>.
          </>
        )}
      </p>
    </div>
  );
}
