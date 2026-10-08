import type { Locale } from "./i18n";
import { getIntlLocale } from "./format";

const MS_PER_DAY = 86_400_000;

export type DageTilKind =
  | "fixed"
  | "easter"
  | "easterOffset"
  | "midsummer"
  | "advent"
  | "summerferie"
  | "efteraarsferie"
  | "skoleaar";

export interface DageTilAnchor {
  kind: DageTilKind;
  /** 1-based month, kun relevant for kind "fixed" */
  month: number;
  /** 1-based day of month, kun relevant for kind "fixed" */
  day: number;
  /** Dage relativt til påskedagen, kun relevant for kind "easterOffset" */
  offsetDays: number;
  /**
   * Dage relativt til 1. advent, kun relevant for kind "advent". Advent har
   * fire søndage, så offset 7/14/21 er de tre næste.
   */
  adventOffsetDays?: number;
  /**
   * ISO-uge, kun relevant for kind "efteraarsferie". Efterårsferien ligger
   * fast i uge 42, så `week: 42` peger på den mandag.
   */
  week?: number;
}

export interface DageTilCopy {
  /** Kort navn i ental, fx "1. december" eller "juledagen" */
  short: string;
  question: string;
  facts: string[];
  faq: { question: string; answer: string }[];
}

export interface DageTilLocaleArm {
  slug: string;
  /**
   * Slugs this arm used to serve, kept so the old URL can 301 instead of 404.
   * A date people search for by its number — 24. og 31. december — was first
   * published under the holiday's name, and the URL is what the two biggest
   * countdown queries on `/dato` literally contain ("hvor mange dage er der til
   * den 24 december", 1.036 visninger på pos. 5 i GSC 5/10). The old slug must
   * resolve to the same event, or the ranking it built is thrown away.
   */
  aliases?: readonly string[];
  copy: DageTilCopy;
}

export interface DageTilEvent {
  id: string;
  /**
   * Per-locale anchor. Most dates are the same in both countries, but
   * Grundlovsdag (5 June) and Sveriges nationaldag (6 June) are not — they
   * are separate questions rather than translations of each other.
   */
  anchor: { da: DageTilAnchor; se?: DageTilAnchor };
  da: DageTilLocaleArm;
  /**
   * Absent when the date has no answer in that country. Summerferien is the
   * only one: the Danish start is fixed by law, but the Swedish sommarlov is
   * set by each kommun and has no national date, so a Swedish page would have
   * to invent the number it counts down to. `da` is required because
   * minberegner.dk is the primary domain.
   */
  se?: DageTilLocaleArm;
}

/**
 * Curated list of Danish/Swedish dates that people actually search for as
 * "how many days until X". Only fixed or computable anchors. A date that is
 * *only* a municipal decision is deliberately left out rather than guessed:
 * the Swedish sommarlov has no national date at all, so it has no `se` arm.
 */
export const DAGE_TIL_EVENTS: DageTilEvent[] = [
  {
    id: "juledagen",
    anchor: {
      da: { kind: "fixed", month: 12, day: 25, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 25, offsetDays: 0 },
    },
    da: {
      slug: "juledagen",
      copy: {
        short: "juledagen",
        question: "Hvor mange dage er der til juledagen?",
        facts: [
          "Juleaften er 24. december, juledag 25. december og 2. juledag 26. december.",
          "Nytårsaften er 31. december, så juledagen og nytårsaften ligger typisk 6 dage fra hinanden.",
          "Bankdagen er altid 31. december, uanset hvilken ugedag den falder på.",
        ],
        faq: [
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og juledagen, så vælger du 24. december som dags dato, står der 1 dag tilbage.",
          },
          {
            question: "Hvornår er juledagen næste gang?",
            answer:
              "Juledagen er altid 25. december. Siden den er fast, skifter den aldrig dato, uanset om den falder på en hverdag eller en weekend.",
          },
          {
            question: "Kan jeg regne dage mellem to andre datoer?",
            answer:
              "Ja. Datoberegneren tæller dage mellem vilkårlige datoer, arbejdsdage og datoer plus uger.",
          },
        ],
      },
    },
    se: {
      slug: "juldagen",
      copy: {
        short: "juldagen",
        question: "Hur många dagar är det till juldagen?",
        facts: [
          "Julafton är 24 december, juldagen 25 december och annandag jul 26 december.",
          "Nyårsafton är 31 december, så juldagen och nyårsafton ligger normalt 6 dagar ifrån varandra.",
          "Bankdagen är alltid 31 december, oavsett vilken veckodag den infaller på.",
        ],
        faq: [
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och juldagen, så väljer du 24 december som dagens datum står det 1 dag kvar.",
          },
          {
            question: "När är juldagen nästa gång?",
            answer:
              "Juldagen är alltid 25 december. Eftersom datumet är fast ändrar det sig aldrig, oavsett om det infaller på en vardag eller ett veckoslut.",
          },
          {
            question: "Kan jag räkna dagar mellan två andra datum?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan valfria datum, arbetsdagar och datum plus veckor.",
          },
        ],
      },
    },
  },
  {
    id: "juleaften",
    anchor: {
      da: { kind: "fixed", month: 12, day: 24, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 24, offsetDays: 0 },
    },
    da: {
      slug: "24-december",
      aliases: ["juleaften"],
      copy: {
        short: "juleaften",
        // 50 tegn. Titlen er `${question} ${count}` (DageTilPage.tsx), så
        // spørgsmålet skal have plads til " 366 dage" — tre-cifrede dage — og
        // stadig være under de 60 tegn, porten i dage-til-routes.test.tsx
        // håndhæver. Juleaften er fast 24. december, så dagene er tre-cifrede
        // fra 15. september til 31. december hvert år. Parentesen "(juleaften)"
        // var to tegn mere end nødvendigt: ordet står allerede i `facts[0]`, i
        // FAQ'en og i `short`, og det er `short` der bruges som slug.
        question: "Hvor mange dage er der til juleaften 24. december?",
        facts: [
          "Juleaften er 24. december — altid samme dato, uanset hvilken ugedag den falder på.",
          "Juleaften er dagen før juledagen, så de to ligger altid én dag fra hinanden.",
          "I 2026 falder juleaften på en torsdag. Juleaften står i kalenderen som helligdag, mens nytårsaften 31. december ikke gør.",
        ],
        faq: [
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og juleaften, så vælger du 23. december som dags dato, står der 1 dag tilbage.",
          },
          {
            question: "Hvornår er juleaften næste gang?",
            answer:
              "Juleaften er altid 24. december. I 2026 falder den på en torsdag og i 2027 på en fredag, så datoen er fast, men ugedagen skifter.",
          },
          {
            question: "Hvad er forskellen på juleaften og juledagen?",
            answer:
              "Juleaften er 24. december og juledagen 25. december. Når juleaften er tællet ned, har du altså præcis én dag tilbage.",
          },
        ],
      },
    },
    se: {
      slug: "24-december",
      aliases: ["julafton"],
      copy: {
        short: "julafton",
        question: "Hur många dagar är det till julafton?",
        facts: [
          "Julafton är 24 december — alltid samma datum, oavsett vilken veckodag den infaller på.",
          "Julafton är dagen före juldagen, så de två ligger alltid en dag ifrån varandra.",
          "År 2026 infaller julafton på en torsdag. Julafton är däremot inte en allmän helgdag enligt lagen (1989:253) — det är juldagen och annandag jul som räknas, inte julafton.",
        ],
        faq: [
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och julafton, så väljer du 23 december som dagens datum står det 1 dag kvar.",
          },
          {
            question: "När är julafton nästa gång?",
            answer:
              "Julafton är alltid 24 december. År 2026 infaller den på en torsdag och 2027 på en fredag, så datumet är fast men veckodagen växlar.",
          },
          {
            question: "Vad är skillnaden mellan julafton och juldagen?",
            answer:
              "Julafton är 24 december och juldagen 25 december. När julafton är räknad ned har du alltså exakt en dag kvar.",
          },
        ],
      },
    },
  },
  {
    // 26. december. Fast i begge lande, og `helligdage.ts` fører den på begge
    // lister ("2. juledag" / "Annandag jul"), så navnet er kildeført her.
    id: "juledag-2",
    anchor: {
      da: { kind: "fixed", month: 12, day: 26, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 26, offsetDays: 0 },
    },
    da: {
      slug: "2-juledag",
      copy: {
        short: "2. juledag",
        // Datoen står i spørgsmålet, fordi den er det folk googler: dansk
        // autocomplete målt 1/10 giver "2 juledag dato" og "2 juledag 2026" som
        // to af ti completioner under "2 juledag". Titlen er `${question}
        // ${count}`, så spørgsmålet skal have plads til " 364 dage" — 26.
        // december er fast, så dagene er tre-cifrede fra 27. december til
        // 15. januar hvert år. Porten i dage-til-routes.test.tsx håndhæver de 60
        // tegn hele året igennem.
        question: "Hvor mange dage er der til 2. juledag 26. december?",
        facts: [
          "2. juledag er 26. december — altid samme dato, uanset hvilken ugedag den falder på.",
          "2. juledag er dagen efter juledagen, og der er 5 dage fra 2. juledag til nytårsaften den 31. december.",
          "I 2026 falder 2. juledag på en lørdag, i 2027 på en søndag — datoen flytter sig aldrig, kun ugedagen.",
        ],
        faq: [
          {
            question: "Hvornår er 2. juledag næste gang?",
            answer:
              "2. juledag er altid 26. december. I 2027 falder den på en søndag, så datoen er fast, men ugedagen skifter.",
          },
          {
            question: "Er 2. juledag en helligdag?",
            answer:
              "Ja. 2. juledag står i listen over Danmarks helligdage sammen med juleaftensdag og juledag.",
          },
          {
            question: "Kan jeg finde ud af, hvor mange dage der er mellem to andre datoer?",
            answer:
              "Ja. Datoberegneren tæller dage mellem to valgte datoer og viser også uger, arbejdsdage og weekenddage.",
          },
        ],
      },
    },
    se: {
      // Svensk titlen har ingen dato: "dagar" er fem tegn mod dansk "dage", så
      // " 364 dagar" ville skubbet spørgsmålet over de 60 tegn. Samme valg som
      // juleaften gjorde.
      slug: "annandag-jul",
      copy: {
        short: "annandag jul",
        question: "Hur många dagar är det till annandag jul?",
        facts: [
          "Annandag jul är 26 december — alltid samma datum, oavsett vilken veckodag det infaller på.",
          "Annandag jul är dagen efter juldagen, och det är 5 dagar till nyårsafton den 31 december.",
          "År 2026 infaller annandag jul på en lördag och 2027 på en söndag — datumet flyttar sig aldrig, bara veckodagen.",
        ],
        faq: [
          {
            question: "När är annandag jul nästa gång?",
            answer:
              "Annandag jul är alltid 26 december. År 2027 infaller det på en söndag, så datumet är fast men veckodagen växlar.",
          },
          {
            question: "Är annandag jul en röd dag?",
            answer:
              "Ja. Annandag jul är en allmän helgdag enligt lagen (1989:253). Det gäller till skillnad från annandag pingst, som inte är en röd dag i Sverige.",
          },
          {
            question: "Kan jag räkna dagar mellan två andra datum?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan två valda datum och visar också veckor, arbetsdagar och helgdagar.",
          },
        ],
      },
    },
  },
  {
    id: "nytaarsaften",
    anchor: {
      da: { kind: "fixed", month: 12, day: 31, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 31, offsetDays: 0 },
    },
    da: {
      slug: "31-december",
      aliases: ["nytaarsaften"],
      copy: {
        short: "nytårsaften",
        question: "Hvor mange dage er der til nytårsaften?",
        facts: [
          "Nytårsaftensdag er 31. december og nytårsdag er 1. januar — de to datoer er altid hinanden følgende.",
          "Nytårsaften er ikke en officiel helligdag, men bankdagen er 31. december.",
          "31. december er månedens sidste dag, uanset hvilken ugedag den falder på, så det er den dato, når året er omme.",
        ],
        faq: [
          {
            question: "Er nytårsaften og nytårsdag det samme?",
            answer:
              "Nej. Nytårsaften er aftenen 31. december, nytårsdag er 1. januar. Er du på udkig efter datoen i titlen, er det 31. december, der menes.",
          },
          {
            question: "Hvor mange dage er der til nytårsdagen?",
            answer:
              "Nytårsdagen ligger præcis 1 dag efter nytårsaften, så tallet på denne side minus 1 er svaret til 1. januar.",
          },
          {
            question: "Kan jeg se nedtællingen til et tidspunkt på dagen?",
            answer:
              "Ja. Nedtælleren viser dage, timer og minutter til et valgfrit klokkeslæt.",
          },
        ],
      },
    },
    se: {
      slug: "31-december",
      aliases: ["nyarsafton"],
      copy: {
        short: "nyårsafton",
        question: "Hur många dagar är det till nyårsafton?",
        facts: [
          "Nyårsaftonsdagen är 31 december och nyårsdagen 1 januari — de två datumen är alltid efter varandra.",
          "Nyårsafton är inte en officiell helgdag, men bankdagen är 31 december.",
          "31 december är månadens sista dag, oavsett vilken veckodag den infaller på, alltså den dagen då året är slut.",
        ],
        faq: [
          {
            question: "Är nyårsafton och nyårsdagen samma sak?",
            answer:
              "Nej. Nyårsafton är kvällen 31 december och nyårsdagen är 1 januari. Det du söker i titeln är 31 december.",
          },
          {
            question: "Hur många dagar är det till nyårsdagen?",
            answer:
              "Nyårsdagen ligger exakt 1 dag efter nyårsafton, så talet på den här sidan minus 1 är svaret för 1 januari.",
          },
          {
            question: "Kan jag se nedräkningen till en tid på dygnet?",
            answer:
              "Ja. Nedräknaren visar dagar, timmar och minuter till valfri klockslag.",
          },
        ],
      },
    },
  },
  {
    id: "nytaarsdag",
    anchor: {
      da: { kind: "fixed", month: 1, day: 1, offsetDays: 0 },
      se: { kind: "fixed", month: 1, day: 1, offsetDays: 0 },
    },
    da: {
      slug: "nytaarsdag",
      copy: {
        short: "nytårsdag",
        question: "Hvor mange dage er der til nytårsdagen?",
        facts: [
          "Nytårsdagen er 1. januar, nytårsaften er 31. december.",
          "Nytårsdag er en officiel helligdag i Danmark, nytårsaften er ikke.",
          "Nytårsdagen er altid årets første dag. Et nyt år har 365 dage, eller 366 hvis det er skudår.",
        ],
        faq: [
          {
            question: "Tæller nytårsaften med i tallet?",
            answer:
              "Nej. Tallet er forskellen til 1. januar, så 31. december ligger 1 dag før nytårsdagen.",
          },
          {
            question: "Er nytårsdagen altid en fridag?",
            answer:
              "Nej. Den falder på den 1. januar, som kan være alle ugedage. Den er dog altid en helligdag.",
          },
          {
            question: "Hvor mange dage er der i et helt år?",
            answer:
              "Et almindeligt år har 365 dage, et skudår har 366. Datoberegneren tæller begge dele korrekt.",
          },
        ],
      },
    },
    se: {
      slug: "nyarsdagen",
      copy: {
        short: "nyårsdagen",
        question: "Hur många dagar är det till nyårsdagen?",
        facts: [
          "Nyårsdagen är 1 januari, nyårsafton är 31 december.",
          "Nyårsdagen är 1 januari och alltid årets första dag. Ett nytt år har 365 dagar, eller 366 om det är skottår.",
          "Nyårsdagen är en officiell helgdag i Sverige, nyårsafton är inte.",
        ],
        faq: [
          {
            question: "Räknas nyårsafton med i talet?",
            answer:
              "Nej. Talet är skillnaden till 1 januari, så 31 december ligger 1 dag före nyårsdagen.",
          },
          {
            question: "Är nyårsdagen alltid en röd dag?",
            answer:
              "Nej. Den infaller på 1 januari, som kan vara alla veckodagar. Den är däremot alltid en helgdag.",
          },
          {
            question: "Hur många dagar är det i ett helt år?",
            answer:
              "Ett vanligt år har 365 dagar, ett skottår har 366. Datumräknaren räknar båda korrekt.",
          },
        ],
      },
    },
  },
  {
    id: "december-1",
    anchor: {
      da: { kind: "fixed", month: 12, day: 1, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 1, offsetDays: 0 },
    },
    da: {
      slug: "1-december",
      copy: {
        short: "1. december",
        question: "Hvor mange dage er der til 1. december?",
        facts: [
          "December har 31 dage, så 1. december er månedens første dag.",
          "1. december er ikke en dansk helligdag, men datoen er fast og flytter sig aldrig.",
          "Fra 1. december er der præcis 23 dage til juleaftensdagen den 24. december.",
        ],
        faq: [
          {
            question: "Hvorfor søger så mange på netop denne dato?",
            answer:
              "Fordi december er den måned, hvor planlægning, juleafslutning og sidste frister falder. Derfor er 1. december en af de mest søgte datoer på dansk.",
          },
          {
            question: "Er der regelmæssigt forskud på løn i december?",
            answer:
              "Nej. Løn udbetales for den måned, den er forfalden i — en rente på 1. december forfalder i januar.",
          },
          {
            question: "Kan jeg finde ud af, hvor mange dage der er mellem to andre datoer?",
            answer:
              "Ja. Datoberegneren tæller dage mellem to valgte datoer og viser også uger, arbejdsdage og weekenddage.",
          },
        ],
      },
    },
    se: {
      slug: "1-december",
      copy: {
        short: "1 december",
        question: "Hur många dagar är det till 1 december?",
        facts: [
          "1 december är första dagen i december, och december har 31 dagar.",
          "1 december är inte en svensk helgdag, men datumet är fast och flyttar sig aldrig.",
          "Från 1 december är det exakt 23 dagar till julafton den 24 december.",
        ],
        faq: [
          {
            question: "Varför söker så många på just detta datum?",
            answer:
              "Eftersom december är månaden då planering, julavslut och sista frister infaller. Därför är 1 december ett av de mest sökta datumen på svenska.",
          },
          {
            question: "Finns det regelbunden förskottslön i december?",
            answer:
              "Nej. Lön betalas för den månad den förfaller i — en ränta 1 december förfaller i januari.",
          },
          {
            question: "Kan jag räkna ut hur många dagar som går mellan två andra datum?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan två valda datum och visar också veckor, arbetsdagar och helgdagar.",
          },
        ],
      },
    },
  },
  {
    // Påskedagen minus 47 dage. Dansk "fastelavn" og svensk "fettisdagen" er
    // samme tirsdag. Dansk autocomplete målt 1/10 har "hvor mange dage er der
    // til fastelavn" (3 completioner, ordet selv plus … 2026 plus "…tilbage
    // til fastelavn"), altså præcis den spørgsmålstype hele sektionen svarer på.
    id: "fastelavn",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: -47 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: -47 },
    },
    da: {
      slug: "fastelavn",
      copy: {
        short: "fastelavn",
        question: "Hvor mange dage er der til fastelavn?",
        facts: [
          "Fastelavn er påskedagen minus 47 dage, så datoen kan beregnes uden et kalenderopslag.",
          "Fastelavn er derfor altid en tirsdag: påskedagen er altid en søndag.",
          "Påskedagen ligger mellem 22. marts og 25. april, så fastelavn ligger mellem 3. februar og 9. marts.",
        ],
        faq: [
          {
            question: "Hvornår er fastelavn næste gang?",
            answer:
              "Fastelavn er tirsdagen 47 dage før påskedagen. Påskedagen er den første søndag efter det fulde måne på eller efter 21. marts, så fastelavn kan regnes ud af påskedagen.",
          },
          {
            question: "Er fastelavn en helligdag?",
            answer:
              "Nej. Fastelavn er ikke en af Danmarks officielle helligdage, men dagen bruges stadig til børnetraditionen med fastelavnsboller.",
          },
          {
            question: "Kan jeg finde ud af, hvor mange dage der er mellem to andre datoer?",
            answer:
              "Ja. Datoberegneren tæller dage mellem to valgte datoer og viser også uger, arbejdsdage og weekenddage.",
          },
        ],
      },
    },
    se: {
      slug: "fettisdagen",
      copy: {
        short: "fettisdagen",
        question: "Hur många dagar är det till fettisdagen?",
        facts: [
          "Fettisdagen är påskdagen minus 47 dagar, så datumet går att räkna ut utan att slå upp i en kalender.",
          "Fettisdagen är därför alltid en tisdag: påskdagen är alltid en söndag.",
          "Påskdagen ligger mellan 22 mars och 25 april, så fettisdagen ligger mellan 3 februari och 9 mars.",
        ],
        faq: [
          {
            question: "När är fettisdagen nästa gång?",
            answer:
              "Fettisdagen är tisdagen 47 dagar före påskdagen. Påskdagen är den första söndagen efter det fulla mån på eller efter 21 mars, så fettisdagen räknas ut av påskdagen.",
          },
          {
            question: "Är fettisdagen en röd dag?",
            answer:
              "Nej. Fettisdagen är inte en allmän helgdag i Sverige. På lagen (1989:253) står påskdagen och annandag påsk, men ikke fettisdagen.",
          },
          {
            question: "Kan jag räkna dagar mellan två andra datum?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan två valda datum och visar också veckor, arbetsdagar och helgdagar.",
          },
        ],
      },
    },
  },
  {
    // Påskedagen minus 7 dage — palmesøndag og palmsöndag er samme søndag, så
    // det er én regel og ikke to.
    id: "palmesondag",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: -7 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: -7 },
    },
    da: {
      slug: "palmesondag",
      copy: {
        short: "palmesøndag",
        question: "Hvor mange dage er der til palmesøndag?",
        facts: [
          "Palmesøndag er påskedagen minus 7 dage — altså søndagen før påskedag.",
          "Palmesøndag er den første søndag i den kristne kirkes fasteperiode og kaldes derfor også første søndag i tiden.",
          "Påskedagen ligger mellem 22. marts og 25. april, så palmesøndag ligger mellem 15. marts og 18. april.",
        ],
        faq: [
          {
            question: "Hvornår er palmesøndag næste gang?",
            answer:
              "Palmesøndag er søndagen før påskedagen. Påskedagen er den første søndag efter det fulde måne på eller efter 21. marts, så palmesøndag kan beregnes uden et kalenderopslag.",
          },
          {
            question: "Er palmesøndag en helligdag?",
            answer:
              "Ja. Palmesøndag står i listen over Danmarks helligdage sammen med skærtorsdag, langfredag og de øvrige påskedage. Den er altid en søndag, så den tælles som weekenddag og ikke som en ekstra fridag.",
          },
          {
            question: "Kan jeg finde ud af, hvor mange dage der er mellem to andre datoer?",
            answer:
              "Ja. Datoberegneren tæller dage mellem to valgte datoer og viser også uger, arbejdsdage og weekenddage.",
          },
        ],
      },
    },
    se: {
      slug: "palmsondagen",
      copy: {
        short: "palmsöndag",
        question: "Hur många dagar är det till palmsöndag?",
        facts: [
          "Palmsöndag är påskdagen minus 7 dagar — alltså söndagen före påskdagen.",
          "Palmsöndag är kyrkans första söndag i fastetiden, och kallas därför också första söndagen i tiden.",
          "Påskdagen ligger mellan 22 mars och 25 april, så palmsöndag ligger mellan 15 mars och 18 april.",
        ],
        faq: [
          {
            question: "När är palmsöndag nästa gång?",
            answer:
              "Palmsöndag är söndagen före påskdagen. Påskdagen är den första söndagen efter det fulla mån på eller efter 21 mars, så palmsöndag går att räkna ut utan att slå upp i en kalender.",
          },
          {
            question: "Är palmsöndag en röd dag?",
            answer:
              "Nej. Palmsöndag är inte en allmän helgdag i Sverige. På lagen (1989:253) står påskdagen och annandag påsk, men inte palmsöndagen.",
          },
          {
            question: "Kan jag räkna dagar mellan två andra datum?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan två valda datum och visar också veckor, arbetsdagar och helgdagar.",
          },
        ],
      },
    },
  },
  {
    id: "paskedag",
    anchor: {
      da: { kind: "easter", month: 0, day: 0, offsetDays: 0 },
      se: { kind: "easter", month: 0, day: 0, offsetDays: 0 },
    },
    da: {
      slug: "paskedag",
      copy: {
        short: "påskedag",
        question: "Hvor mange dage er der til påskedag?",
        facts: [
          "Påskedagen er altid den første søndag efter det fulde måne på eller efter 21. marts. Derfor falder den mellem 22. marts og 25. april.",
          "Påskedagen er en officiel helligdag i Danmark, og 2. påskedag er den følgende mandag.",
          "Skærtorsdag er 3 dage før påskedag, langfredag 2 dage før.",
        ],
        faq: [
          {
            question: "Hvornår er påsken næste gang?",
            answer:
              "Påskedagen følger en fast regel, så datoen kan beregnes helt uden et kalenderopslag: den første søndag efter det fulde måne på eller efter 21. marts.",
          },
          {
            question: "Tæller skærtorsdag og langfredag med?",
            answer:
              "Begge er officielle helligdage og ligger henholdsvis 3 og 2 dage før påskedag.",
          },
          {
            question: "Kan jeg regne dage mellem to helligdage?",
            answer:
              "Ja. Datoberegneren tæller dage mellem to valgte datoer — for eksempel fra påskedag til grundlovsdag.",
          },
        ],
      },
    },
    se: {
      slug: "paskdagen",
      copy: {
        short: "påskdagen",
        question: "Hur många dagar är det till påskdagen?",
        facts: [
          "Påskdagen är alltid den första söndagen efter det fulla mån varje gång det infaller 21 mars eller senare. Därför hamnar den mellan 22 mars och 25 april.",
          "Påskdagen är en officiell helgdag i Sverige, och annandag påsk är den följande måndagen.",
          "Skärtorsdag är 3 dagar före påskdagen, långfredagen 2 dagar före.",
        ],
        faq: [
          {
            question: "När är påsk nästa gång?",
            answer:
              "Påskdagen följer en fast regel, så datumet går att räkna ut helt utan kalkerråfror: den första söndagen efter det fulla mån 21 mars eller senare.",
          },
          {
            question: "Räknas skärtorsdag och långfredag med?",
            answer:
              "Långfredagen är en allmän helgdag enligt lagen (1989:253). Skärtorsdagen är det inte — den räknas visserligen ofta som en röd dag, men det är kollektivavtalet som avgör om du har ledigt.",
          },
          {
            question: "Kan jag räkna dagar mellan två helgdagar?",
            answer:
              "Ja. Datumräknaren räknar dagar mellan två valda datum — till exempel från påskdagen till nationaldagen.",
          },
        ],
      },
    },
  },
  {
    id: "skaertorsdag",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: -3 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: -3 },
    },
    da: {
      slug: "skaertorsdag",
      copy: {
        short: "skærtorsdag",
        question: "Hvor mange dage er der til skærtorsdag?",
        facts: [
          "Skærtorsdag er 3 dage før påskedag og altid en torsdag.",
          "Skærtorsdag, langfredag, påskedag og 2. påskedag er alle officielle danske helligdage.",
          "Er du på arbejde skærtorsdag, har du ikke automatisk ret til dagpenge — det afhænger af din overenskomst.",
        ],
        faq: [
          {
            question: "Hvorfor er skærtorsdag altid en torsdag?",
            answer:
              "Fordi påskedagen er altid en søndag. Tre dage før en søndag er en torsdag.",
          },
          {
            question: "Er skærtorsdag en fridag?",
            answer:
              "Nej. Skærtorsdag er altid en torsdag — tre dage før påskedagen, som altid er en søndag. Den er en helligdag, men du har ikke automatisk ret til dagpenge; det afhænger af din overenskomst.",
          },
          {
            question: "Hvad er forskellen på skærtorsdag og langfredag?",
            answer:
              "Skærtorsdag er 3 dage før påskedag, langfredag er 2 dage før. Begge er helligdage.",
          },
        ],
      },
    },
    se: {
      slug: "skartorsdagen",
      copy: {
        short: "skärtorsdagen",
        question: "Hur många dagar är det till skärtorsdagen?",
        facts: [
          "Skärtorsdagen är 3 dagar före påskdagen och alltid en torsdag.",
          "Långfredag, påskdagen och annandag påsk är alla allmänna helgdagar enligt lagen (1989:253). Skärtorsdag är det inte — det är en vanlig arbetsdag, och det är kollektivavtalet som avgör om du har ledigt.",
          "Om du arbetar skärtorsdagen har du inte automatiskt rätt till dagpenning — det beror på ditt avtal.",
        ],
        faq: [
          {
            question: "Varför är skärtorsdagen alltid en torsdag?",
            answer:
              "Eftersom påskdagen alltid är en söndag. Tre dagar före en söndag är en torsdag.",
          },
          {
            question: "Är skärtorsdagen en röd dag?",
            answer:
              "Nej, inte enligt lagen. Skärtorsdagen står inte i lagens lista över allmänna helgdagar (1989:253), men hon är ändå en röd dag: en röd dag blir hon genom kollektivavtal och sed, medan en allmän helgdag står i lagen. Du har därför ingen automatisk rätt till dagpenge — det avgörs av din överenskomst.",
          },
          {
            question: "Vad är skillnaden mellan skärtorsdag och långfredag?",
            answer:
              "Skärtorsdagen är 3 dagar före påskdagen och långfredagen 2 dagar före. Långfredagen är en allmän helgdag enligt lagen (1989:253), men skärtorsdagen är det inte — den är bara en röd dag.",
          },
        ],
      },
    },
  },
  {
    id: "grundlovsdag",
    anchor: {
      da: { kind: "fixed", month: 6, day: 5, offsetDays: 0 },
      se: { kind: "fixed", month: 6, day: 6, offsetDays: 0 },
    },
    da: {
      slug: "grundlovsdag",
      copy: {
        short: "grundlovsdag",
        question: "Hvor mange dage er der til grundlovsdag?",
        facts: [
          "Grundlovsdag er 5. juni, og datoen er fast — den flytter sig ikke, uanset hvilken ugedag den falder på.",
          "Der er halv fridag for alle, der har grundlovsdag på en hverdag. Falder den på en weekend, udløber den halve fridag ikke automatisk.",
          "Grundlovsdagen er ikke en helligdag, men den er lovens fridag ved grundlovsfejret.",
        ],
        faq: [
          {
            question: "Hvilken dag i året er grundlovsdag?",
            answer:
              "Grundlovsdag er altid 5. juni. Den ligger mellem påske og sankthans, så den kan både være en mandag og en søndag.",
          },
          {
            question: "Er grundlovsdagen altid en halv fridag?",
            answer:
              "I Danmark er der halv fridag, når grundlovsdagen holdes på en hverdag. Kalenderen markerer den derfor ikke automatisk som en rød dag.",
          },
          {
            question: "Hvornår ligger grundlovsdagen?",
            answer:
              "Den ligger 5. juni hvert år — det er datoen, der tæller, ikke ugedagen. 5. juni 2026 var en fredag, så den blev holdt som halv fridag.",
          },
        ],
      },
    },
    se: {
      slug: "nationaldagen",
      copy: {
        short: "nationaldagen",
        question: "Hur många dagar är det till nationaldagen?",
        facts: [
          "Sveriges nationaldag är 6 juni, och datumet är fast — det flyttar inte beroende på vilken veckodag det infaller på.",
          "Nationaldagen har varit 6 juni sedan 2005 och är en allmän helgdag enligt lagen (1989:253). Det är kollektivavtalen, inte lagen, som avgör om du får fri med lön.",
          "Nationaldagen är inte samma sak som midsommarafton, som ligger mellan 19 och 25 juni.",
        ],
        faq: [
          {
            question: "Vilken dag på året är nationaldagen?",
            answer:
              "Nationaldagen är alltid 6 juni. Den ligger efter påsk och före midsommar, så den kan vara både en lördag och en söndag.",
          },
          {
            question: "Är nationaldagen en röd dag?",
            answer:
              "Ja. 6 juni är en allmän helgdag enligt lagen (1989:253) och räknas därför som en röd dag. Lagen säger däremot ingenting om lön — det är kollektivavtalet, der avgør om du har fri med lön på nationaldagen.",
          },
          {
            question: "Hur räknar jag ut datumet helt säkert?",
            answer:
              "Datumet är fast, så du behöver ingen kalkyl: 6 juni är 6 juni varje år.",
          },
        ],
      },
    },
  },
  {
    id: "midsommarafton",
    anchor: {
      da: { kind: "fixed", month: 6, day: 23, offsetDays: 0 },
      se: { kind: "midsummer", month: 6, day: 0, offsetDays: 0 },
    },
    da: {
      slug: "sankthansaftensdag",
      copy: {
        short: "sankthansaftensdag",
        question: "Hvor mange dage er der til sankthansaftensdag?",
        facts: [
          "Sankthansaftensdagen er 23. juni, og datoen er fast hvert år — den flytter sig aldrig, uanset hvilken ugedag den falder på.",
          "Den fejres om aftenen, og det er derfor den hedder *aftens*dagen: bålet brændes den 23. juni.",
          "Sankthans er ikke en dansk helligdag, men den fejres overalt i landet med bål, sang og majstang.",
        ],
        faq: [
          {
            question: "Hvilken dato er sankthansaftensdag?",
            answer:
              "Sankthansaftensdagen er altid 23. juni. Det er en fast dato, ikke en regel om en ugedag, så du kan regne den ud uden at slå den op.",
          },
          {
            question: "Hvornår er sankthansdagen?",
            answer:
              "Sankthansdagen er dagen efter sankthansaftensdagen, altså 24. juni. Tallet på den side er derfor altid 1 dag mindre end her.",
          },
          {
            question: "Er sankthans en helligdag?",
            answer:
              "Nej. Sankthans står ikke på Danmarks liste over helligdage, så det er en almindelig aften — uanset om 23. juni falder på en hverdag eller i en weekend.",
          },
        ],
      },
    },
    se: {
      slug: "midsommarafton",
      copy: {
        short: "midsommarafton",
        question: "Hur många dagar är det till midsommarafton?",
        facts: [
          "Midsommarafton är den fredag som infaller mellan 19 och 25 juni — 19 juni 2026, 25 juni 2027 och 23 juni 2028.",
          "Midsommardagen är dagen efter, alltså en lördag som infaller mellan 20 och 26 juni.",
          "Midsommarafton räknas som en röd dag i den svenska kalendern, eftersom den är en av årets största högtider.",
        ],
        faq: [
          {
            question: "Vilket datum är midsommarafton?",
            answer:
              "Det är fredagen som infaller mellan 19 och 25 juni. Datumet är alltså bestämt varje år, men det hamnar på olika kalenderdatum: 19 juni 2026, 25 juni 2027 och 23 juni 2028.",
            },
            {
              question: "När är midsommardagen?",
              answer:
                "Midsommardagen är dagen efter midsommarafton, alltså en lördag mellan 20 och 26 juni. Talet på den sidan är därför alltid 1 dag större än här.",
            },
            {
              question: "Hur firas midsommarafton traditionellt?",
              answer:
                "Midsommarafton firas med att dansa runt midsommarstången, sjunga traditionella sånger och äta säsongsbetonad mat som sill, färskpotatis och jordgubbar.",
            },
        ],
      },
    },
  },
  {
    id: "midsommardagen",
    anchor: {
      da: { kind: "fixed", month: 6, day: 24, offsetDays: 0 },
      se: { kind: "midsummer", month: 6, day: 0, offsetDays: 1 },
    },
    da: {
      slug: "sankthansdag",
      copy: {
        short: "sankthansdag",
        question: "Hvor mange dage er der til sankthansdag?",
        facts: [
          "Sankthansdagen er 24. juni, altså dagen efter sankthansaftensdagen den 23. juni.",
          "Datoen er fast hvert år — den flytter sig aldrig, uanset hvilken ugedag den falder på.",
          "Sankthansdagen er den dag, børnene klæder sig i sommerens gamle tøj på — og netop derfor ligger den altid 1 dag efter sankthansaftensdagen.",
        ],
        faq: [
          {
            question: "Hvad er forskellen på sankthansdag og sankthansaftensdag?",
            answer:
              "Sankthansaftensdagen er 23. juni, og sankthansdagen er 24. juni. De to ligger derfor altid præcis 1 dag fra hinanden, så tallet her er 1 dag mindre end på sankthansaftenssiden.",
          },
          {
            question: "Hvilken dato er sankthansdagen?",
            answer:
              "Sankthansdagen er altid 24. juni. Det er en fast dato, ikke en regel om en ugedag.",
          },
          {
            question: "Er sankthansdag en helligdag?",
            answer:
              "Nej, den er ikke en helligdag. Den markerer afslutningen på sankthansfejringen, men den står ikke på Danmarks liste over helligdage.",
          },
        ],
      },
    },
    se: {
      slug: "midsommardagen",
      copy: {
        short: "midsommardagen",
        question: "Hur många dagar är det till midsommardagen?",
        facts: [
          "Midsommardagen är lördagen efter midsommarafton, alltså en lördag som infaller mellan 20 och 26 juni.",
          "År 2026 är det 20 juni, 2027 26 juni och 2028 24 juni.",
          "På midsommardagen dansar man runt granröset och sjunger sånger — och netop därför ligger den alltid en dag efter midsommarafton.",
        ],
        faq: [
          {
            question: "Vad är skillnaden mellan midsommardagen och midsommarafton?",
            answer:
              "Midsommarafton är fredagen och midsommardagen är lördagen efter. De två ligger därför alltid exakt 1 dag ifrån varandra, så talet här är 1 dag mindre än på midsommaraftonsidan.",
          },
          {
            question: "Vilket datum är midsommardagen?",
            answer:
              "Det är lördagen mellan 20 och 26 juni: 20 juni 2026, 26 juni 2027 och 24 juni 2028.",
          },
          {
            question: "Är midsommardagen en röd dag?",
            answer:
              "Nej, det är inte en röd dag. Det är en lördag, alltså en vanlig weekend — det speciella är att den markerar slutet på midsommarfirandet.",
          },
        ],
      },
    },
  },
  {
    id: "halloween",
    anchor: {
      da: { kind: "fixed", month: 10, day: 31, offsetDays: 0 },
      se: { kind: "fixed", month: 10, day: 31, offsetDays: 0 },
    },
    da: {
      slug: "halloween",
      copy: {
        short: "Halloween",
        question: "Hvor mange dage er der til Halloween?",
        facts: [
          "Halloween er 31. oktober, og datoen er fast — den flytter sig aldrig, uanset hvilken ugedag den falder på.",
          "Den lette forveksling er 1. november: Halloween er aftenen, Alle helgenes dag er dagen efter. De to ligger altid præcis én dag fra hinanden.",
          "Halloween er ikke en dansk helligdag, så butikker og arbejdsplads har normal åbent både 31. oktober og 1. november.",
          "Ugedagen skifter: 31. oktober 2026 er en lørdag, 2027 en søndag og 2028 en tirsdag.",
        ],
        faq: [
          {
            question: "Er Halloween det samme som Alle helgenes dag?",
            answer:
              "Nej. Halloween er aftenen 31. oktober, og Alle helgenes dag er 1. november. Er du i tvivl om, hvilken af de to du egentlig vil have nedtællet til, er tallet her præcis 1 dag mindre end det er til 1. november.",
          },
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og Halloween, så vælger du 30. oktober som dags dato, står der 1 dag tilbage.",
          },
          {
            question: "Hvornår er Halloween næste gang?",
            answer:
              "Halloween er altid 31. oktober. Datoen er fast, så du kan regne den ud uden at slå den op i en kalender — det er ugedagen, der flytter sig. 2026 er den en lørdag, 2027 en søndag og 2028 en tirsdag.",
          },
        ],
      },
    },
    se: {
      slug: "halloween",
      copy: {
        short: "Halloween",
        question: "Hur många dagar är det till Halloween?",
        facts: [
          "Halloween, som på svenska också kallas allhelgonaafton, är 31 oktober — alltid samma datum.",
          "Det är lätt att förväxla med allhelgonadagen 1 november. De två ligger alltid exakt en dag ifrån varandra.",
          "Halloween är inte en allmän helgdag i Sverige. Det är allhelgonadagen 1 november och alla helgons dag som är helgdagar, och den senare ligger sedan 1953 på den lördag som infaller mellan 31 oktober och 6 november.",
          "Veckodagen växlar: 31 oktober 2026 är en lördag, 2027 en söndag och 2028 en tisdag.",
        ],
        faq: [
          {
            question: "Är Halloween samma sak som allhelgonadagen?",
            answer:
              "Nej. Halloween, eller allhelgonaafton, är 31 oktober och allhelgonadagen är 1 november. Är du osäker på vilken av dem du egentligen räknar ner till, är talet här exakt 1 dag mindre än det är till 1 november.",
          },
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och Halloween, så väljer du 30 oktober som dagens datum står det 1 dag kvar.",
          },
          {
            question: "När är Halloween nästa gång?",
            answer:
              "Halloween är alltid 31 oktober. Datumet är fast, så du kan räkna ut det utan att slå upp något — det är veckodagen som växlar. 2026 är det en lördag, 2027 en söndag och 2028 en tisdag.",
          },
        ],
      },
    },
  },
  {
    id: "paskafton",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: -2 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: -1 },
    },
    da: {
      slug: "langfredag",
      copy: {
        short: "langfredag",
        question: "Hvor mange dage er der til langfredag?",
        facts: [
          "Langfredag er 2 dage før påskedag og altid en fredag, så datoen flytter sig med påsken.",
          "Langfredag, påskedag og 2. påskedag er alle danske helligdage — det gør langfredag til den eneste helligdag i påskeugen, der ikke er en søndag.",
          "I 2026 er langfredag 3. april, i 2027 26. marts og i 2028 14. april.",
        ],
        faq: [
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og langfredag, så vælger du den torsdag der går forud, står der 1 dag tilbage.",
          },
          {
            question: "Hvornår er langfredag næste gang?",
            answer:
              "Langfredag er altid 2 dage før påskedag, så du kan regne den ud fra påskedagen uden at slå den op. I 2027 er påskedagen 28. marts, så langfredagen er 26. marts.",
          },
          {
            question: "Hvad er skærtorsdag?",
            answer:
              "Skærtorsdag er torsdagen før påsken — altså dagen før langfredag. Den er ikke en helligdag i Danmark, men mange har fri eller lukker tidligt. I 2026 falder skærtorsdag 2. april, i 2027 25. marts og i 2028 13. april.",
          },
        ],
      },
    },
    se: {
      slug: "paskafton",
      copy: {
        short: "påskafton",
        question: "Hur många dagar är det till påskafton?",
        facts: [
          "Påskafton är dagen innan påskdagen och alltid en lördag — den ligger alltså 1 dag före påskdagen, inte 2.",
          "Långfredagen är dagen innan påskafton och är en allmän helgdag enligt lag (1989:253) om allmänna helgdagar, men påskafton är inte det.",
          "I 2026 är påskafton 4 april, 2027 27 mars och 2028 15 april.",
          "Påsklovet slutar ofta på påskafton, men det bestäms av din kommun. Påskafton är fast, påsklovet är det inte.",
        ],
        faq: [
          {
            question: "Är påskafton samma sak som långfredagen?",
            answer:
              "Nej. Långfredagen är fredagen och påskafton är lördagen dagen efter, altså dagen innan påskdagen. De ligger derför alltid 1 dag från varandra.",
          },
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och påskafton, så väljer du fredagen innan står det 2 dagar kvar.",
          },
          {
            question: "När är påskafton nästa gång?",
            answer:
              "Påskafton är alltid 1 dag före påskdagen, så du kan räkna ut den utan att slå upp något. 2027 infaller påskdagen 28 mars, så påskafton är 27 mars.",
          },
        ],
      },
    },
  },
  {
    // Påskedag + 39 dage. Det er den 40. dag efter påskedagen, når påskedagen
    // selv tælles med, og derfor er den altid en torsdag: påskedag er en søndag,
    // og 39 dage efter en søndag er en torsdag. Samme fordelingsregel i begge
    // lande, så begge arme bruger det samme `easterOffset`-anker.
    id: "kristi-himmelfartsdag",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: 39 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: 39 },
    },
    da: {
      slug: "kristi-himmelfartsdag",
      copy: {
        short: "kristi himmelfartsdag",
        question: "Hvor mange dage er der til kristi himmelfart?",
        facts: [
          "Kristi himmelfartsdag er altid en torsdag og ligger 39 dage efter påskedag — altså den 40. dag efter påskedagen, når påskedagen selv tælles med.",
          "I 2026 er den 14. maj, i 2027 6. maj og i 2028 25. maj.",
          "Målt fra 1990 til 2050 ligger den mellem 1. maj (2008) og 3. juni (2038), så datoen flytter sig både frem og tilbage med påsken.",
          "Kristi himmelfartsdag er en helligdag i Danmark. Fredagen efter er en hverdag, men fordi torsdagen er en helligdag og lørdagen er weekend, er den en indeklemt fredag — og der er steder, hvor den er lukket.",
        ],
        faq: [
          {
            question: "Hvornår er kristi himmelfartsdag næste gang?",
            answer:
              "Den følger påsken, så du kan regne den ud: påskedag plus 39 dage. I 2027 er påskedagen 28. marts, så kristi himmelfartsdag er 6. maj 2027.",
          },
          {
            question: "Er kristi himmelfartsdag en helligdag?",
            answer:
              "Ja, den er en dansk helligdag, og den er altid en torsdag. Om du har fri den dag afhænger af din overenskomst — helligdagen er ikke automatisk en fridag.",
          },
          {
            question: "Er kristi himmelfartsdag altid en torsdag?",
            answer:
              "Ja, altid. Den er 39 dage efter påskedag, og påskedag er en søndag. 39 dage efter en søndag er en torsdag, hvert eneste år.",
          },
          {
            question: "Hvad er forskellen på kristi himmelfartsdag og pinsedag?",
            answer:
              "Kristi himmelfartsdag er påskedag plus 39 dage, og pinsedag er påskedag plus 49 dage. Der er derfor altid 10 dage imellem dem.",
          },
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og kristi himmelfartsdag, så vælger du 13. maj 2026 som dagens dato, står der 1 dag tilbage.",
          },
        ],
      },
    },
    se: {
      slug: "kristi-himmelsfardsdag",
      copy: {
        short: "kristi himmelsfärdsdag",
        question: "Hur många dagar är det till kristi himmelsfärd?",
        facts: [
          "Kristi himmelsfärdsdag är alltid en torsdag och ligger 39 dagar efter påskdagen — alltså den 40:e dagen när påskdagen räknas in.",
          "I 2026 är den 14 maj, 2027 6 maj och 2028 25 maj.",
          "Mätt mellan åren 1990 och 2050 ligger den mellan 1 maj (2008) och 3 juni (2038), så datumet flyttar sig både framåt och bakåt med påsken.",
          "I Sverige är den en allmän helgdag och en röd dag. Fredagen efter blir en klämdag, och det är den enda klämdagen i Sverige som återkommer varje år.",
        ],
        faq: [
          {
            question: "När är kristi himmelsfärdsdag nästa gång?",
            answer:
              "Den följer påsken, så du kan räkna ut den: påskdagen plus 39 dagar. 2027 infaller påskdagen 28 mars, så kristi himmelsfärdsdagen är 6 maj 2027.",
          },
          {
            question: "Är kristi himmelsfärdsdag en röd dag?",
            answer:
              "Ja. I Sverige är den en allmän helgdag och en röd dag, och eftersom den alltid är en torsdag blir fredagen efter en klämdag. Det är årets enda klämdag som återkommer varje år.",
          },
          {
            question: "Är kristi himmelsfärdsdag alltid en torsdag?",
            answer:
              "Ja, alltid. Den är 39 dagar efter påskdagen, och påskdagen är en söndag. 39 dagar efter en söndag är en torsdag, varje år.",
          },
          {
            question: "Vad är skillnaden på kristi himmelsfärdsdag och pingstdagen?",
            answer:
              "Kristi himmelsfärdsdagen är påskdagen plus 39 dagar, och pingstdagen är påskdagen plus 49 dagar. Det ligger därför alltid 10 dagar emellan dem.",
          },
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och kristi himmelsfärdsdagen, så väljer du 13 maj 2026 som dagens datum står det 1 dag kvar.",
          },
        ],
      },
    },
  },
  {
    // De to arme peger på hver sin dag, og det er ikke en oversættelse. I
    // Danmark er både pinsedag (søndagen) og 2. pinsedag (mandagen) helligdag,
    // så helligdagsstatus ikke kan skelne dem fra hinanden. Den danske side
    // tæller derfor til 2. pinsedag (påskedag + 50), fordi det er mandagen,
    // folk har fri. I Sverige er det omvendt: lagen (1989:253) om allmänna
    // helgdagar räknar pingstdagen (påskdagen + 49) som allmän helgdag, men
    // ikke måndagen efter. Så de to arme deler fordelingsreglen `easterOffset`
    // og adskiller sig netop i den dag, loven peger på.
    id: "pinse",
    anchor: {
      da: { kind: "easterOffset", month: 0, day: 0, offsetDays: 50 },
      se: { kind: "easterOffset", month: 0, day: 0, offsetDays: 49 },
    },
    da: {
      slug: "2-pinsedag",
      copy: {
        short: "2. pinsedag",
        question: "Hvor mange dage er der til 2. pinsedag?",
        facts: [
          "2. pinsedag er påskedag plus 50 dage. Pinsedagen dagen før er påskedag plus 49 dage — altså den 50. dag efter påskedagen, når påskedagen selv tælles med.",
          "I 2026 er den 25. maj, i 2027 17. maj og i 2028 5. juni.",
          "2. pinsedag er altid en mandag. Målt fra 1990 til 2050 ligger den mellem 12. maj (2008) og 14. juni (2038), så datoen flytter sig både frem og tilbage med påsken.",
          "Både pinsedag og 2. pinsedag er danske helligdage. Pinsedag er søndagen, 2. pinsedag er mandagen dagen efter — og mandagen er den, de fleste har fri.",
          "Den ligger i uge 20 til 24 og er altid 11 dage efter kristi himmelfartsdag.",
        ],
        faq: [
          {
            question: "Hvornår er 2. pinsedag næste gang?",
            answer:
              "Den følger påsken, så du kan regne den ud: påskedag plus 50 dage. I 2027 er påskedagen 28. marts, så 2. pinsedag er 17. maj 2027.",
          },
          {
            question: "Hvad er forskellen på pinsedag og 2. pinsedag?",
            answer:
              "Pinsedag er søndagen — påskedag plus 49 dage — og 2. pinsedag er mandagen dagen efter. I Danmark er begge helligdage, men mandagen er den, de fleste har fri. Tallet her tæller til 2. pinsedag.",
          },
          {
            question: "Er 2. pinsedag altid en mandag?",
            answer:
              "Ja, altid. Den er påskedag plus 50 dage, og påskedag er en søndag. 50 dage efter en søndag er en mandag, hvert eneste år.",
          },
          {
            question: "Hvor mange dage er der mellem kristi himmelfartsdag og 2. pinsedag?",
            answer:
              "Altid 11 dage. Kristi himmelfartsdag er påskedag plus 39 dage, og 2. pinsedag er påskedag plus 50 dage, så afstanden aldrig ændrer sig.",
          },
          {
            question: "Tæller dagen i dag med?",
            answer:
              "Nej. Tallet er forskellen mellem dagens dato og 2. pinsedag, så vælger du 24. maj 2026 som dagens dato, står der 1 dag tilbage.",
          },
        ],
      },
    },
    se: {
      slug: "pingstdagen",
      copy: {
        short: "pingstdagen",
        question: "Hur många dagar är det till pingstdagen?",
        facts: [
          "Pingstdagen är påskdagen plus 49 dagar. Lagen (1989:253) om allmänna helgdagar definierar den som den sjunde söndagen efter påskdagen.",
          "I 2026 är den 24 maj, 2027 16 maj och 2028 4 juni.",
          "Pingstdagen är alltid en söndag. Mätt mellan åren 1990 och 2050 ligger den mellan 11 maj (2008) och 13 juni (2038), så datumet flyttar sig både framåt och bakåt med påsken.",
          "Pingstdagen är en allmän helgdag och en röd dag enligt lagen. Måndagen efter är däremot inte en allmän helgdag i Sverige — till skillnad från Danmark, där både pinsedag och 2. pinsedag är helligdage.",
          "Den ligger i vecka 19 till 23 och är alltid 10 dagar efter kristi himmelsfärdsdagen.",
        ],
        faq: [
          {
            question: "När är pingstdagen nästa gång?",
            answer:
              "Den följer påsken, så du kan räkna ut den: påskdagen plus 49 dagar. 2027 infaller påskdagen 28 mars, så pingstdagen är 16 maj 2027.",
          },
          {
            question: "Är pingstdagen en röd dag?",
            answer:
              "Ja. Lagen (1989:253) om allmänna helgdagar räknar pingstdagen som allmän helgdag, så den är en röd dag. Måndagen efter är det inte i Sverige, till skillnad från Danmark där 2. pinsedag är en helligdag.",
          },
          {
            question: "Är pingstdagen alltid en söndag?",
            answer:
              "Ja, alltid. Den är påskdagen plus 49 dagar, och påskdagen är en söndag. 49 dagar efter en söndag är en söndag, varje år.",
          },
          {
            question: "Vad är skillnaden på pingstdagen och kristi himmelsfärdsdagen?",
            answer:
              "Kristi himmelsfärdsdagen är påskdagen plus 39 dagar och pingstdagen är påskdagen plus 49 dagar. Det ligger därför alltid 10 dagar emellan dem.",
          },
          {
            question: "Räknas dagen i dag med?",
            answer:
              "Nej. Talet är skillnaden mellan dagens datum och pingstdagen, så väljer du 23 maj 2026 som dagens datum står det 1 dag kvar.",
          },
        ],
      },
    },
  },
  {
    id: "valborg",
    anchor: {
      da: { kind: "fixed", month: 4, day: 30, offsetDays: 0 },
      se: { kind: "fixed", month: 4, day: 30, offsetDays: 0 },
    },
    da: {
      slug: "valborg",
      copy: {
        short: "valborg",
        question: "Hvor mange dage er der til valborg?",
        facts: [
          "Valborgsmässoaften er 30. april, og datoen er fast — den flytter sig aldrig, uanset hvilken ugedag den falder på.",
          "Valborg er ikke en helligdag, men den er den største danske forårsfest sammen med påske.",
          "Den ligger bagefter askonsdagen og aldrig før: askonsdagen er påskedag minus 46 dage og flytter sig med påsken, mens valborg bliver liggende 30. april. Afstanden er derfor 51-82 dage.",
        ],
        faq: [
          {
            question: "Hvilken dag i året er valborg?",
            answer:
              "Valborg er altid 30. april. Den kan både være en mandag og en søndag, men datoen flytter sig aldrig.",
          },
          {
            question: "Er valborg en helligdag?",
            answer:
              "Nej. Valborg står ikke i listen over danske helligdage, så butikker og arbejdspladser har normal åbent. Den er en fest, ikke en helligdag.",
          },
          {
            question: "Er valborg dagen før askonsdagen?",
            answer:
              "Nej — valborg ligger altid efter askonsdagen. Askonsdagen er påskedag minus 46 dage og kan falde så tidligt som i februar, mens valborg altid er 30. april. I 2027 er askonsdagen 10. februar, altså ligger valborg 79 dage efter den.",
          },
        ],
      },
    },
    se: {
      slug: "valborg",
      copy: {
        short: "valborg",
        question: "Hur många dagar är det till valborg?",
        facts: [
          "Valborgsmässoafton är 30 april — alltid samma datum, oavsett vilken veckodag det infaller på.",
          "Valborg är inte en allmän helgdag enligt lag (1989:253) om allmänna helgdagar, men den firas som en röd dag av de flesta arbetsgivare.",
          "Den ligger alltid efter askonsdagen, aldrig före: askonsdagen är påskdagen minus 46 dagar och flyttar sig, medan valborg ligger kvar 30 april. Avståndet är därför 51-82 dagar.",
        ],
        faq: [
          {
            question: "Vilken dag på året är valborg?",
            answer:
              "Valborg är alltid 30 april. Den kan vara både en måndag och en söndag, men datumet flyttar sig aldrig.",
          },
          {
            question: "Är valborg en röd dag?",
            answer:
              "Inte enligt lagen. Valborg saknas i listan över allmänna helgdagar, så butiker har öppet. I praktiken firas den ändå av de flesta, ungefär som midsommarafton.",
          },
          {
            question: "Är valborg dagen före askonsdagen?",
            answer:
              "Nej — valborg ligger alltid efter askonsdagen. Askonsdagen är påskdagen minus 46 dagar och kan infalla så tidigt som i februari, medan valborg alltid är 30 april. 2027 är askonsdagen 10 februari, alltså ligger valborg 79 dagar efter den.",
          },
        ],
      },
    },
  },
  {
    id: "advent",
    anchor: {
      da: { kind: "advent", month: 0, day: 0, offsetDays: 0, adventOffsetDays: 0 },
      se: { kind: "advent", month: 0, day: 0, offsetDays: 0, adventOffsetDays: 0 },
    },
    da: {
      slug: "1-advent",
      copy: {
        short: "1. advent",
        question: "Hvor mange dage er der til 1. advent?",
        facts: [
          "1. advent er altid den første søndag i advent, og den ligger altid mellem 27. november og 3. december.",
          "Advent har fire søndage, og den fjerde ligger altid mellem 18. og 24. december — altså tæt på juledagen.",
          "I 2026 er 1. advent 29. november, i 2027 28. november og i 2028 3. december.",
          "1. advent er ikke en helligdag, men den er en søndag, så for de fleste er det en fridag.",
        ],
        faq: [
          {
            question: "Hvornår er 1. advent?",
            answer:
              "Advent begynder altid den søndag, der ligger mellem 27. november og 3. december. Det er den eneste regel, du skal kende, for datoen flytter sig hvert år — 2028 er den så sent som 3. december.",
          },
          {
            question: "Hvor lang tid varer advent?",
            answer:
              "Advent er de fire søndage op til juledagen. Siden 1. advent ligger mellem 27. november og 3. december, varer perioden mellem 22 og 28 dage.",
          },
          {
            question: "Er 1. advent en helligdag?",
            answer:
              "Nej. Advent er en kristen festperiode, ikke en helligdag i Danmark. Den er dog altid en søndag, så for de fleste er den en fridag på samme måde som andre søndage.",
          },
        ],
      },
    },
    se: {
      slug: "1-advent",
      copy: {
        short: "1 advent",
        question: "Hur många dagar är det till 1 advent?",
        facts: [
          "1 advent är alltid den första söndagen i advent, och infaller alltid mellan 27 november och 3 december.",
          "Advent har fyra söndagar, och den fjärde infaller alltid mellan 18 och 24 december — alltså nära juldagen.",
          "Första advent är en söndag, och lagen (1989:253) om allmänna helgdagar räknar alla söndagar som allmänna helgdagar. Advent står inte självt i lagen — det är söndagen som gör 1 advent till en helgdag.",
          "2026: 29 november, 2027: 28 november och 2028: 3 december.",
        ],
        faq: [
          {
            question: "När är 1 advent?",
            answer:
              "Advent börjar alltid den söndag som infaller mellan 27 november och 3 december. Det är den enda regeln du behöver, eftersom datumet flyttar sig varje år — 2028 infaller den så sent som 3 december.",
          },
          {
            question: "Hur länge varar advent?",
            answer:
              "Advent är de fyra söndagarna fram till juldagen. Eftersom 1 advent infaller mellan 27 november och 3 december pågår perioden mellan 22 och 28 dagar.",
          },
          {
            question: "Är 1 advent en röd dag?",
            answer:
              "Ja. Lagen (1989:253) om allmänna helgdagar räknar alla söndagar som allmänna helgdagar, så adventssöndagarna är helgdagar. Advent står inte upptaget i lagen själv — det är att de alltid är söndagar.",
          },
        ],
      },
    },
  },
  {
    id: "sommerferien",
    anchor: {
      da: { kind: "summerferie", month: 6, day: 0, offsetDays: 0 },
    },
    da: {
      slug: "sommerferien",
      copy: {
        short: "sommerferien",
        question: "Hvor mange dage er der til sommerferie?",
        facts: [
          "Sommerferien begynder altid den sidste lørdag i juni. I 2026 er det 27. juni, i 2027 26. juni og i 2028 24. juni.",
          "Startdatoen er fastlagt i folkeskoleloven § 14 a stk. 2 (LBK 2025/1100): «Elevernes sommerferie begynder den sidste lørdag i juni», mens **slutdatoen** er kommunal — de fleste holder i tre til fem uger.",
          "Er din kommune ikke færdig med undervisningen, når loven siger, kan den flytte starten, så tjek altid din egen kommunes ferieplan.",
        ],
        faq: [
          {
            question: "Hvornår begynder sommerferien?",
            answer:
              "Lovens dato er den **sidste lørdag i juni** (folkeskoleloven § 14 a stk. 2). I 2026 er det 27. juni 2026, i 2027 26. juni og i 2028 24. juni.",
          },
          {
            question: "Hvornår slutter sommerferien?",
            answer:
              "Det er ikke fastlagt i loven. Hver kommune fastsætter slutdatoen, og den ligger typisk tre til fem uger efter starten, så en klasse kan have fri, når en anden har undervisning.",
          },
          {
            // Spørgsmålet må ikke nævne et årstal eller en dato: nedtællingen
            // peger på *næste* lovlige start, så 6/10 2026 viste siden «27. juni»
            // i spørgsmålet og «26. juni 2027» i målet. Loven har én regel for alle
            // år, så spørgsmålet er skrevet som regel og ikke som dato.
            question: "Kan sommerferien begynde senere end den sidste lørdag i juni?",
            answer:
              "Kun hvis din kommune beslutter det. Folkeskoleloven § 14 a stk. 2 fastlægger starten til den sidste lørdag i juni, og det er den dato, alle børn har fri fra, medmindre kommunen har besluttet andet.",
          },
          {
            question: "Hvornår starter sommerferien, når loven siger den er begyndt?",
            answer:
              "Så har klassen fri, selv om en anden kommune en anden dag. Ferieplanlægningen er kommunal, så det er din egen kommunes dato, der gælder for dit barn.",
          },
        ],
      },
    },
  },
  {
    id: "efteraarsferien",
    anchor: {
      da: { kind: "efteraarsferie", month: 10, day: 0, offsetDays: 0, week: 42 },
    },
    da: {
      slug: "efteraarsferien",
      copy: {
        short: "efterårsferien",
        question: "Hvor mange dage er der til efterårsferien?",
        facts: [
          "Efterårsferien starter altid i **uge 42**, altså en mandag i oktober. I 2026 er det 12. oktober, i 2027 18. oktober og i 2028 16. oktober.",
          "Ugen er den samme i hele landet, så du kan regne den ud uden at slå din kommune op. Det er den eneste ferie ud over sommerferiens start, der har en fast national dato.",
          "Nogle kommuner skriver ferien som skolehverdage (12.-16. oktober 2026), andre som hele perioden med weekender (10.-18. oktober 2026). Tallet her tæller til den **første skoledag** — den mandag, børnene har undervisning igen.",
          "Efterårsferien kaldes også kartoffelferien, fordi børnene før i tiden hjalp til at tage kartofler op.",
        ],
        faq: [
          {
            question: "Hvornår er efterårsferien?",
            answer:
              "Uge 42 hvert år. I 2026 har skolerne fri mandag 12. til fredag 16. oktober 2026, og med weekenderne løber ferien fra lørdag 10. til søndag 18. oktober. Første skoledag igen er mandag 19. oktober.",
          },
          {
            question: "Er efterårsferien samme dato i alle kommuner?",
            answer:
              "Ja, ugen er ens i hele landet. Det, der varierer, er kun hvordan kommunerne skriver den: nogle viser skolehverdage (12.-16. oktober 2026), andre viser hele ferieperioden inklusive weekender (10.-18. oktober 2026). Begge dele er den samme ferieuge.",
          },
          {
            question: "Hvornår starter skolen igen efter efterårsferien?",
            answer:
              "Mandagen efter uge 42. I 2026 er det 19. oktober. Har din kommune enkelte skolelørdage eller ekstra fridage, kan den enkelte skole ligge forud eller bagefter, så tjek barnets egen ferieplan.",
          },
          {
            question: "Hvor lang er efterårsferien?",
            answer:
              "Den er én uge — man-fre i skolehverdage, altså 5 dage. Sammen med weekenderne er hele perioden 9 dage, for uge 42 i 2026 er lørdag 10. til søndag 18. oktober.",
          },
          {
            question: "Er efterårsferien fastsat i loven?",
            answer:
              "Skoleåret begynder 1. august og sommerferien starter den sidste lørdag i juni — det står i folkeskoleloven. Efterårsferien er derimod fastsat til uge 42 for hele landet af undervisningsministeriet, og derfor er den samme dato overalt, selv om den ikke står i selve loven.",
          },
        ],
      },
    },
  },
  {
    id: "skolestart",
    anchor: {
      da: { kind: "skoleaar", month: 8, day: 1, offsetDays: 0 },
    },
    da: {
      slug: "skolestart",
      copy: {
        short: "skolestart",
        question: "Hvor mange dage er der til skolestart?",
        facts: [
          "Skoleåret begynder **1. august** — det står i folkeskoleloven. I 2026 er det en lørdag, i 2027 en søndag og i 2028 en tirsdag.",
          "1. august er en fast dato, men ikke altid en skoledag. Falder den på en weekend, begynder undervisningen først om mandagen, og **nedtællingen følger den første skoledag**: 1. august 2026 er en lørdag, så undervisningen begynder mandag 3. august 2026, og 1. august 2027 er en søndag, så den begynder mandag 2. august 2027.",
          "Ugen varierer, fordi et år ikke altid har 52 ISO-uger. 1. august ligger i uge 31 i 2026 og 2028, men i uge 30 i 2027 — fordi 1. januar 2027 er en fredag og derfor hører til uge 53 i 2026, som gjorde 2026 til et år med 53 ISO-uger.",
          "Sommerferien starter den sidste lørdag i juni (lovens dato), og det er **32 til 38 dage** derfra til skolestart — altså fire til seks uger.",
        ],
        faq: [
          {
            question: "Hvornår starter skolen?",
            answer:
              "Skoleåret begynder 1. august, og falder den på en weekend, starter undervisningen næste hverdag — nedtællingen følger den dag. 1. august 2026 var en lørdag, så undervisningen startede mandag 3. august 2026, og 1. august 2027 er en **søndag**, så den begynder mandag 2. august 2027.",
          },
          {
            question: "Er skolestart altid 1. august?",
            answer:
              "Lovens dato er altid 1. august. Folkeskoleloven fastlægger, at skoleåret begynder 1. august, og det gælder for alle kommunale skoler. Er 1. august en lørdag eller søndag, begynder undervisningen den næste hverdag, og nedtællingen på denne side følger den dag — 2 dage senere i 2026 og 1 dag senere i 2027.",
          },
          {
            question: "Hvilken uge er skolestart i?",
            answer:
              "Den første skoledag ligger i uge 32 i 2026 (3. august), i uge 31 i 2027 (2. august) og i uge 31 i 2028 (1. august). 1. august — lovens dato — ligger derimod i uge 31 i både 2026 og 2028, men i uge 30 i 2027, så de to datoer kan ligge i hvert sit uge. Det er ikke en fejl: 1. januar 2027 er en fredag og hører derfor med til uge 53 i 2026, så 2026 fik 53 ISO-uger. Målt fra 1990 til 2050 ligger 1. august altid i uge 30 eller 31.",
          },
          {
            question: "Hvornår slutter sommerferien?",
            answer:
              "Slutdatoen er ikke fastlagt i loven — den er kommunal. I 2026 starter sommerferien 27. juni, og med de tre til fem uger, der er sædvanlige, ender ferien typisk 18.-31. juli, altså senest dagen før skolen starter igen. Tjek din egen kommunes ferieplan.",
          },
          {
            question: "Hvor lang tid er der mellem sommerferie og skolestart?",
            answer:
              "32 til 38 dage, fordi sommerferien starter den sidste lørdag i juni. I 2026 er det 27. juni til 3. august = 37 dage, i 2027 26. juni til 2. august = 37 dage, og i 2028 24. juni til 1. august = 38 dage.",
          },
        ],
      },
    },
  },
];

/** Locales that have a real dage-til landing page. */
export const DAGE_TIL_LOCALES = ["da", "se"] as const;
export type DageTilLocale = (typeof DAGE_TIL_LOCALES)[number];

export function isDageTilLocale(locale: Locale): locale is DageTilLocale {
  return locale === "da" || locale === "se";
}

/**
 * Timezone per locale for reading the local calendar day.
 * Denmark uses Europe/Copenhagen, Sweden uses Europe/Stockholm.
 * They currently share CET/CEST offsets, but using the correct zone per
 * locale is the right thing to do and avoids future drift.
 */
const DAGE_TIL_TIMEZONE: Record<DageTilLocale, string> = {
  da: "Europe/Copenhagen",
  se: "Europe/Stockholm",
};

/**
 * Midnight UTC of the *calendar day* the instant falls on in the given locale's
 * timezone.
 *
 * Every anchor in this module is stored as a UTC midnight, so a UTC reading
 * is right for the target. It is wrong for `today`: at 00:30 local time the
 * instant is 22:30 UTC the *previous* day in summer and 23:30 UTC the
 * previous day in winter, so a UTC reading makes every countdown one day too
 * high for the first two hours of every day. That window is exactly when
 * people open "how many days until Christmas".
 *
 * UTC midnights are unaffected: 00:00Z is 01:00 or 02:00 in Copenhagen, so a
 * stored anchor keeps the calendar day it was built with.
 */
function toUtcMidnight(date: Date, locale: DageTilLocale = "da"): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DAGE_TIL_TIMEZONE[locale],
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const vaerdi = (type: "year" | "month" | "day") =>
    Number(parts.find((part) => part.type === type)?.value);
  return new Date(
    Date.UTC(vaerdi("year"), vaerdi("month") - 1, vaerdi("day"))
  );
}

/**
 * Easter Sunday for a year, using the anonymous Gregorian algorithm
 * (Meeus/Jones/Butcher). Matches the rule: the first Sunday after the full
 * moon on or after 21 March.
 */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Midsommarafton for a year: the Friday that falls between 19 and 25 June
 * inclusive. `offsetDays` shifts from that Friday, so 0 is midsommarafton
 * (fredag) and 1 is midsommardagen (lørdag). The window is a law, not a
 * convention — Swedish midsummer must be celebrated between those dates.
 */
export function midsommarafton(year: number, offsetDays = 0): Date {
  for (let day = 19; day <= 25; day++) {
    const candidate = new Date(Date.UTC(year, 5, day));
    if (candidate.getUTCDay() === 5) {
      return new Date(candidate.getTime() + offsetDays * MS_PER_DAY);
    }
  }
  // Unreachable: the 19-25 June window is seven days long and therefore
  // always contains exactly one Friday.
  throw new Error(`Ingen fredag 19.-25. juni ${year}`);
}

/**
 * First day of the Danish summer holiday for a year: the last Saturday in
 * June. Danish school holidays are otherwise decided by each municipality,
 * but this one start is fixed by the Folkeskoleloven (2024), so the countdown
 * people actually search for — "hvor mange dage er der til sommerferie" — has
 * one national answer. Only the *end* varies (three to five weeks), so this
 * is a start date and nothing more.
 *
 * The Swedish sommarlov has no equivalent national date; each kommun sets it,
 * so there is deliberately no `se` arm for it.
 */
export function sommerferieStart(year: number): Date {
  // June has 30 days, so the last Saturday is the latest Saturday that falls
  // on or before the 30th.
  for (let day = 30; day >= 24; day--) {
    const candidate = new Date(Date.UTC(year, 5, day));
    if (candidate.getUTCDay() === 6) return candidate;
  }
  // Unreachable: the 24-30 June window is seven days long and therefore always
  // contains exactly one Saturday.
  throw new Error(`Ingen lørdag 24.-30. juni ${year}`);
}

/**
 * 1. advent for a year: the Sunday that falls between 27 November and
 * 3 December inclusive, because advent always has four Sundays and the
 * fourth always lands in the week of 18-24 December. The window is a
 * property of the four-Sunday rule, not a convention, so the date can be
 * computed rather than looked up. `adventOffsetDays` shifts from it, so
 * 0 is 1. advent, 7 is 2. advent.
 */
export function forstaAdvent(year: number, adventOffsetDays = 0): Date {
  for (let day = 27; day <= 33; day++) {
    const candidate = new Date(Date.UTC(year, 10, day));
    if (candidate.getUTCDay() === 0) {
      return new Date(candidate.getTime() + adventOffsetDays * MS_PER_DAY);
    }
  }
  // Unreachable: the 27 November-3 December window is seven days long and
  // therefore always contains exactly one Sunday.
  throw new Error(`Ingen søndag 27. november-3. december ${year}`);
}

/**
 * Mandagen i en ISO-uge for a year, from the same ISO definition used by the
 * kalender: uge 1 er den uge med torsdagen i januar, så mandagen i uge 1 er
 * den mandag mellem 29. december og 4. januar.
 *
 * Efterårsferien ligger fast i uge 42 i hele landet og på tværs af kommuner —
 * det er den eneste danske skoleferie ud over sommerferiens start, der har en
 * national dato, og den flytter sig ikke med påsken. Kommunerne afgiver den
 * samme uge, kun skolehverdage (man-fre 12.-16. oktober 2026) eller hele
 * ferieperioden inkl. weekender (lør-søn 10.-18. oktober 2026). Denne
 * funktion returnerer mandagen, fordi den er det tidspunkt skolen genoptages
 * på, og fordi en nedtælling til en lørdag ville svare på det forkerte
 * spørgsmål.
 */
export function isoUgeMandag(year: number, week: number): Date {
  // 4. januar ligger altid i uge 1, så uge 1's mandag er den mandag der
  // ligger højest oppe før den 4. januar.
  const januar4 = new Date(Date.UTC(year, 0, 4));
  const uge1Mandag = new Date(
    januar4.getTime() - ((januar4.getUTCDay() + 6) % 7) * MS_PER_DAY
  );
  return new Date(uge1Mandag.getTime() + (week - 1) * 7 * MS_PER_DAY);
}

/**
 * Første skoledag for et skoleår: lovens dato er 1. august, men en lørdag
 * eller søndag er ikke en skoledag, så undervisningen begynder den første
 * hverdag — mandag 3. august 2026 (1. august er en lørdag) og mandag
 * 2. august 2027 (1. august er en søndag).
 *
 * Nedtællingen skal pege på den dag undervisningen faktisk begynder. En
 * nedtælling til en lørdag eller søndag ville svare på det forkerte
 * spørgsmål — og det er præcis samme greb som `isoUgeMandag` gør for
 * efterårsferien, hvor uge 42's lørdag ikke er den dag skolen genoptages på.
 */
export function foersteSkoledag(year: number): Date {
  const august = new Date(Date.UTC(year, 7, 1));
  // `getUTCDay()` er 0=søn..6=lør, så en mandag er 1. Lørdag (6) skal
  // springes to dage frem til mandag, søndag (0) én dag frem.
  const ugedag = august.getUTCDay();
  if (ugedag === 6) return new Date(august.getTime() + 2 * MS_PER_DAY);
  if (ugedag === 0) return new Date(august.getTime() + MS_PER_DAY);
  return august;
}

function anchorInYear(anchor: DageTilAnchor, year: number): Date {
  if (anchor.kind === "fixed") {
    return new Date(Date.UTC(year, anchor.month - 1, anchor.day));
  }
  if (anchor.kind === "skoleaar") {
    return foersteSkoledag(year);
  }
  if (anchor.kind === "midsummer") {
    return midsommarafton(year, anchor.offsetDays);
  }
  if (anchor.kind === "summerferie") {
    return sommerferieStart(year);
  }
  if (anchor.kind === "efteraarsferie") {
    return isoUgeMandag(year, anchor.week ?? 42);
  }
  if (anchor.kind === "advent") {
    return forstaAdvent(year, anchor.adventOffsetDays ?? 0);
  }
  const easter = easterSunday(year);
  return new Date(easter.getTime() + anchor.offsetDays * MS_PER_DAY);
}

/**
 * The next occurrence of the event's date, strictly after today. On the day
 * itself the answer is 0 days, so we do not roll over to next year.
 */
export function getNextAnchorDate(
  anchor: DageTilAnchor,
  today: Date,
  locale: DageTilLocale = "da"
): Date {
  const start = toUtcMidnight(today, locale);
  const thisYear = start.getUTCFullYear();
  for (let year = thisYear; year <= thisYear + 1; year++) {
    const candidate = anchorInYear(anchor, year);
    if (candidate.getTime() >= start.getTime()) return candidate;
  }
  return anchorInYear(anchor, thisYear + 1);
}

/**
 * Dagens kalenderdag som UTC-midnat — det samme anker `daysBetween` regner på.
 *
 * Siden skal vise dagens dato sammen med svaret ("Der er 61 dage til 1.
 * december" er ubrugeligt uden at vide hvilken dag de 61 er regnet fra), og den
 * skal kunne læses af søgemaskiner og af en læser der lander kl. 23.50. Derfor
 * må den ikke komme fra et eget `new Date()` i komponenten: mellem 00:00 og
 * 02:00 lokal tid ville den vise dagen i forvegne, altså én dag ved siden af
 * det tal den står ved siden af.
 */
export function dagensDatoAnker(today: Date, locale: DageTilLocale = "da"): Date {
  return toUtcMidnight(today, locale);
}

export function daysBetween(
  from: Date,
  to: Date,
  locale: DageTilLocale = "da"
): number {
  return Math.round(
    (toUtcMidnight(to, locale).getTime() -
      toUtcMidnight(from, locale).getTime()) /
      MS_PER_DAY
  );
}

export interface DageTilbageIAaret {
  year: number;
  dage: number;
  uger: number;
  dageEfterUger: number;
  sidsteDag: Date;
}

/**
 * Days left in the calendar year. "Hvor mange dage er der tilbage af 2026?"
 * (227 visninger, pos. 5 i dansk GSC) er ikke det samme som "hvor mange dage
 * er der til nytår?": året er slut 31. december, uanset hvad man kalder
 * dagen. Tallet er 0 nytårsaften, fordi det sidste døgn *er* 31. december.
 */
export function dageTilbageIAaret(
  today: Date,
  locale: DageTilLocale = "da"
): DageTilbageIAaret {
  const start = toUtcMidnight(today, locale);
  const year = start.getUTCFullYear();
  const sidsteDag = new Date(Date.UTC(year, 11, 31));
  const dage = daysBetween(start, sidsteDag, locale);
  return {
    year,
    dage,
    uger: Math.floor(dage / 7),
    dageEfterUger: dage % 7,
    sidsteDag,
  };
}

export interface DageTilAnswer {
  days: number;
  weeks: number;
  daysLeft: number;
  targetDate: Date;
  isToday: boolean;
}

/**
 * The locale arm of an event, or an error if it has none. Every caller reaches
 * the arm through `getDageTilEvents(locale)`, which filters the events down to
 * the ones that do, so a missing arm means a list was built by hand.
 */
export function dageTilArm(
  event: DageTilEvent,
  locale: DageTilLocale
): DageTilLocaleArm {
  const arm = event[locale];
  if (!arm) {
    throw new Error(`Datoen "${event.id}" har ingen ${locale}-udgave`);
  }
  return arm;
}

export function getDageTilAnswer(
  event: DageTilEvent,
  locale: DageTilLocale,
  today: Date
): DageTilAnswer {
  const anchor = event.anchor[locale];
  if (!anchor) {
    throw new Error(`Datoen "${event.id}" har ingen ${locale}-udgave`);
  }
  const targetDate = getNextAnchorDate(anchor, today, locale);
  const days = daysBetween(today, targetDate, locale);
  return {
    days,
    weeks: Math.floor(days / 7),
    daysLeft: days % 7,
    targetDate,
    isToday: days === 0,
  };
}

/** "1. december" / "1 december", formatted in the locale's own convention. */
export function formatTargetDate(date: Date, locale: DageTilLocale): string {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

/** "2026" — the year the event next happens, used in title and on the page. */
export function formatTargetYear(date: Date): string {
  return String(date.getUTCFullYear());
}

/**
 * Events that actually have a page in this locale. Sommerferien has no
 * Swedish arm, so it must never reach a beraknare.se list.
 */
export function getDageTilEvents(locale: Locale): DageTilEvent[] {
  if (!isDageTilLocale(locale)) return [];
  return DAGE_TIL_EVENTS.filter((event) => event[locale] !== undefined);
}

export function getDageTilSlugs(locale: Locale): string[] {
  if (!isDageTilLocale(locale)) return [];
  return DAGE_TIL_EVENTS.flatMap((event) => {
    const arm = event[locale];
    return arm ? [arm.slug] : [];
  });
}

/**
 * The section's own path, without a trailing slash: `/dage-til` in Danish and
 * `/dagar-till` in Swedish. The per-date pages hang under `getDageTilPrefix`,
 * which ends in a slash, so this is the one place in the module that has to
 * strip it — a sitemap entry of `…/dage-til/` would point at a path the
 * router answers with a 308, and `hreflang` between the two sections would
 * point each language at the other language's directory.
 */
export function getDageTilHubPath(locale: Locale): string | undefined {
  const prefix = getDageTilPrefix(locale);
  return prefix ? prefix.replace(/\/$/, "") : undefined;
}

export interface DageTilHubRække {
  id: string;
  href: string;
  /** The event's own question, which is also that page's <h1>. */
  question: string;
  /** Short name, fx "1. december" / "juledagen". */
  short: string;
  days: number;
  weeks: number;
  daysLeft: number;
  isToday: boolean;
  targetDate: Date;
  /** "2026-12-01" — the target's calendar day, for a <time dateTime>. */
  targetIso: string;
}

/**
 * Every date in the section as one row, nearest first.
 *
 * The section had 23 Danish and 20 Swedish date pages and no page of its own:
 * a visitor who asked the section's question in the plural ("hvor mange dage
 * er der til …", 1.254 visninger, pos. 5) landed on `/dato`, and the date
 * pages were only linked from two other pages. The hub answers the same
 * question as the pages it links to, so every number here is the number
 * `getDageTilAnswer` gives the linked page for the same `today` — the row and
 * the page cannot disagree.
 *
 * Sorted by days ascending, so the answer the visitor came for is the first
 * thing on the page. Ties (two dates that land on the same day) fall back to
 * the question, so the order never depends on the order of the event list.
 */
export function getDageTilHubRækker(
  locale: Locale,
  today: Date
): DageTilHubRække[] {
  const prefix = getDageTilPrefix(locale);
  if (!prefix) return [];
  const sprog = locale as DageTilLocale;
  return getDageTilEvents(sprog)
    .map((event) => {
      const arm = dageTilArm(event, sprog);
      const answer = getDageTilAnswer(event, sprog, today);
      return {
        id: event.id,
        href: `${prefix}${arm.slug}`,
        question: arm.copy.question,
        short: arm.copy.short,
        days: answer.days,
        weeks: answer.weeks,
        daysLeft: answer.daysLeft,
        isToday: answer.isToday,
        targetDate: answer.targetDate,
        targetIso: answer.targetDate.toISOString().slice(0, 10),
      };
    })
    .sort((a, b) => a.days - b.days || a.question.localeCompare(b.question, sprog));
}

/** The event for a slug, or undefined if the slug is not one of ours. */
export function getDageTilEventBySlug(
  slug: string,
  locale: Locale
): DageTilEvent | undefined {
  if (!isDageTilLocale(locale)) return undefined;
  return DAGE_TIL_EVENTS.find((event) => event[locale]?.slug === slug);
}

export interface DageTilSlugResolution {
  /** The event the slug belongs to, regardless of language. */
  event: DageTilEvent;
  /** The slug in the requesting locale, whether or not it is the one requested. */
  localeSlug: string;
  /** True when the requested slug is the locale's own slug. */
  isOwnLocale: boolean;
}

/**
 * Whether an arm serves `slug` — as its own canonical slug, as a slug the other
 * language spells the same way (`1-december`, `halloween`), or as one of its
 * retired aliases. All three must resolve to the event, or the caller either
 * 404s a URL we published or renders a second copy of the same answer.
 */
function armServesSlug(arm: DageTilLocaleArm | undefined, slug: string): boolean {
  if (!arm) return false;
  return arm.slug === slug || (arm.aliases?.includes(slug) ?? false);
}

/**
 * Resolve a dage-til slug for a domain. A slug in the other language resolves
 * to the same event, so the caller can 301 to the locale's own slug instead
 * of serving a duplicate page. So does a retired alias.
 */
export function resolveDageTilSlug(
  slug: string,
  locale: Locale
): DageTilSlugResolution | undefined {
  if (!isDageTilLocale(locale)) return undefined;
  // Either language's slug matches, because resolving across languages is the
  // whole point — that is what makes the caller 301 to the locale's own slug.
  const event = DAGE_TIL_EVENTS.find(
    (candidate) =>
      armServesSlug(candidate.da, slug) || armServesSlug(candidate.se, slug)
  );
  if (!event) return undefined;
  // Sommerferien has no Swedish arm, so on beraknare.se its slug resolves to
  // nothing rather than to a 301 towards a page that does not exist.
  const localeSlug = event[locale]?.slug;
  if (!localeSlug) return undefined;
  // A retired alias is deliberately *not* own-locale: the caller then 301s it
  // to the canonical slug, so the same answer keeps exactly one URL.
  return { event, localeSlug, isOwnLocale: localeSlug === slug };
}

const DA_PREFIX = "/dage-til/";
const SE_PREFIX = "/dagar-till/";

/**
 * The prefix this locale serves dage-til pages under.
 */
export function getDageTilPrefix(locale: Locale): string | undefined {
  if (locale === "da") return DA_PREFIX;
  if (locale === "se") return SE_PREFIX;
  return undefined;
}

/**
 * Parse a pathname into its dage-til slug, regardless of which language
 * prefix it used. Returns undefined for paths outside the section.
 */
export function getDageTilSlugFromPathname(
  pathname: string
): { prefix: string; slug: string } | undefined {
  for (const prefix of [DA_PREFIX, SE_PREFIX]) {
    if (pathname.startsWith(prefix)) {
      const slug = pathname.slice(prefix.length);
      if (slug && !slug.includes("/")) return { prefix, slug };
    }
  }
  return undefined;
}
