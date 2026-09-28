import type { Locale } from "./i18n";
import { getIntlLocale } from "./format";

const MS_PER_DAY = 86_400_000;

export type DageTilKind = "fixed" | "easter" | "easterOffset" | "midsummer";

export interface DageTilAnchor {
  kind: DageTilKind;
  /** 1-based month, kun relevant for kind "fixed" */
  month: number;
  /** 1-based day of month, kun relevant for kind "fixed" */
  day: number;
  /** Dage relativt til påskedagen, kun relevant for kind "easterOffset" */
  offsetDays: number;
}

export interface DageTilCopy {
  /** Kort navn i ental, fx "1. december" eller "juledagen" */
  short: string;
  question: string;
  facts: string[];
  faq: { question: string; answer: string }[];
}

export interface DageTilEvent {
  id: string;
  /**
   * Per-locale anchor. Most dates are the same in both countries, but
   * Grundlovsdag (5 June) and Sveriges nationaldag (6 June) are not — they
   * are separate questions rather than translations of each other.
   */
  anchor: Record<DageTilLocale, DageTilAnchor>;
  da: { slug: string; copy: DageTilCopy };
  se: { slug: string; copy: DageTilCopy };
}

/**
 * Curated list of Danish/Swedish dates that people actually search for as
 * "how many days until X". Only fixed or computable anchors — a variable
 * anchor such as "sommerferie" (municipality specific) is deliberately left
 * out rather than guessed.
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
      slug: "juleaften",
      copy: {
        short: "juleaften",
        question: "Hvor mange dage er der til juleaften?",
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
      slug: "julafton",
      copy: {
        short: "julafton",
        question: "Hur många dagar är det till julafton?",
        facts: [
          "Julafton är 24 december — alltid samma datum, oavsett vilken veckodag den infaller på.",
          "Julafton är dagen före juldagen, så de två ligger alltid en dag ifrån varandra.",
          "År 2026 infaller julafton på en torsdag. Både julafton och nyårsafton 31 december räknas som helgdagar i den svenska kalendern.",
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
    id: "nytaarsaften",
    anchor: {
      da: { kind: "fixed", month: 12, day: 31, offsetDays: 0 },
      se: { kind: "fixed", month: 12, day: 31, offsetDays: 0 },
    },
    da: {
      slug: "nytaarsaften",
      copy: {
        short: "nytårsaften",
        question: "Hvor mange dage er der til nytårsaften?",
        facts: [
          "Nytårsaftensdag er 31. december og nytårsdag er 1. januar — de to datoer er altid hinanden følgende.",
          "Nytårsaften er ikke en officiel helligdag, men bankdagen er 31. december.",
          "Sidste hverdag i december er 31. december, så det er den dato, når året er omme.",
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
      slug: "nyarsafton",
      copy: {
        short: "nyårsafton",
        question: "Hur många dagar är det till nyårsafton?",
        facts: [
          "Nyårsaftonsdagen är 31 december och nyårsdagen 1 januari — de två datumen är alltid efter varandra.",
          "Nyårsafton är inte en officiell helgdag, men bankdagen är 31 december.",
          "Sista vardagen i december är 31 december, alltså den dagen då året är slut.",
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
          "Fra 1. december er der præcis 30 dage til juleaftensdagen den 24. december.",
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
          "Från 1 december är det exakt 30 dagar till julafton den 24 december.",
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
              "Båda är officiella helgdagar och ligger 3 respektive 2 dagar före påskdagen.",
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
              "Ja, den er en fridag og en helligdag, men den er ikke automatisk en frivillig fridag eller dagpenge.",
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
          "Skärtorsdag, långfredag, påskdagen och annandag påsk är alla officiella svenska helgdagar.",
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
              "Ja, den är en torsdag och en helgdag, men den är inte automatiskt en frivillig heldag eller dagpenning.",
          },
          {
            question: "Vad är skillnaden mellan skärtorsdag och långfredag?",
            answer:
              "Skärtorsdagen är 3 dagar före påskdagen och långfredagen 2 dagar före. Båda är helgdagar.",
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
            question: "Hvornår ligger grundlovsdagen i 2026?",
            answer:
              "Den ligger 5. juni 2026 uanset hvilken kalender du slår op — det er datoen, der tæller, ikke ugedagen.",
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
          "Nationaldagen har varit 6 juni sedan 2005. Den är inte en laglig helgdag, men de flesta arbetsgivare ger ändå ledigt med lön.",
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
              "Nej. Sedan 2005 är 6 juni nationaldag, men den är inte en laglig helgdag i Sverige. De flesta arbetsgivare ger ändå ledigt.",
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
      da: { kind: "midsummer", month: 6, day: 0, offsetDays: 0 },
      se: { kind: "midsummer", month: 6, day: 0, offsetDays: 0 },
    },
    da: {
      slug: "sankthansaftensdag",
      copy: {
        short: "sankthansaftensdag",
        question: "Hvor mange dage er der til sankthansaftensdag?",
        facts: [
          "Sankthansaftensdagen er den fredag, der ligger mellem 19. og 25. juni — i 2026 er det 19. juni, i 2027 25. juni.",
          "Sankthansdagen er dagen efter, altså en lørdag mellem 20. juni og 26. juni.",
          "Sankthans er ikke en dansk helligdag, men den fejres overalt i landet med bål, sang og majstang.",
        ],
        faq: [
          {
            question: "Hvilken dato er sankthansaftensdag?",
            answer:
              "Det er den fredag, der ligger mellem 19. og 25. juni. Datoen er derfor fast hvert år, men den falder på forskellige kalenderdatoer: 19. juni 2026, 25. juni 2027 og 23. juni 2028.",
          },
          {
            question: "Hvornår er sankthansdagen?",
            answer:
              "Sankthansdagen er dagen efter sankthansaftensdagen, altså en lørdag mellem 20. og 26. juni. Tallet på den side er derfor altid 1 dag større end her.",
          },
          {
            question: "Er sankthans en helligdag?",
            answer:
              "Nej. Sankthans står ikke på Danmarks liste over helligdage, men det er en af årets mest markerede festdage, og mange arbejdspladser giver fri med løn.",
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
            question: "Är midsommarafton en röd dag?",
            answer:
              "Ja, midsommarafton räknas som en röd dag och de flesta arbetsgivare ger ledigt med lön. Den är inte en laglig helgdag, men den behandlas som en.",
          },
        ],
      },
    },
  },
  {
    id: "midsommardagen",
    anchor: {
      da: { kind: "midsummer", month: 6, day: 0, offsetDays: 1 },
      se: { kind: "midsummer", month: 6, day: 0, offsetDays: 1 },
    },
    da: {
      slug: "sankthansdag",
      copy: {
        short: "sankthansdag",
        question: "Hvor mange dage er der til sankthansdag?",
        facts: [
          "Sankthansdagen er lørdagen efter sankthansaftensdagen, altså en lørdag mellem 20. juni og 26. juni.",
          "I 2026 er det 20. juni, i 2027 26. juni og i 2028 24. juni.",
          "Sankthansdagen er den dag, børnene klæder sig i sommerens gamle tøj på — og netop derfor ligger den altid en dag efter sankthansaftensdagen.",
        ],
        faq: [
          {
            question: "Hvad er forskellen på sankthansdag og sankthansaftensdag?",
            answer:
              "Sankthansaftensdagen er fredagen, og sankthansdagen er lørdagen efter. De to ligger derfor altid præcis 1 dag fra hinanden, så tallet her er 1 dag mindre end på sankthansaftenssiden.",
          },
          {
            question: "Hvilken dato er sankthansdagen?",
            answer:
              "Det er lørdagen mellem 20. og 26. juni: 20. juni 2026, 26. juni 2027 og 24. juni 2028.",
          },
          {
            question: "Er sankthansdag en helligdag?",
            answer:
              "Nej, den er ikke en helligdag. Den er en lørdag, som er weekend i sig selv — det særlige ved den er, at den markerer afslutningen på sankthansfejringen.",
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
];

/** Locales that have a real dage-til landing page. */
export const DAGE_TIL_LOCALES = ["da", "se"] as const;
export type DageTilLocale = (typeof DAGE_TIL_LOCALES)[number];

export function isDageTilLocale(locale: Locale): locale is DageTilLocale {
  return locale === "da" || locale === "se";
}

function toUtcMidnight(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
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

function anchorInYear(anchor: DageTilAnchor, year: number): Date {
  if (anchor.kind === "fixed") {
    return new Date(Date.UTC(year, anchor.month - 1, anchor.day));
  }
  if (anchor.kind === "midsummer") {
    return midsommarafton(year, anchor.offsetDays);
  }
  const easter = easterSunday(year);
  return new Date(easter.getTime() + anchor.offsetDays * MS_PER_DAY);
}

/**
 * The next occurrence of the event's date, strictly after today. On the day
 * itself the answer is 0 days, so we do not roll over to next year.
 */
export function getNextAnchorDate(anchor: DageTilAnchor, today: Date): Date {
  const start = toUtcMidnight(today);
  const thisYear = start.getUTCFullYear();
  for (let year = thisYear; year <= thisYear + 1; year++) {
    const candidate = anchorInYear(anchor, year);
    if (candidate.getTime() >= start.getTime()) return candidate;
  }
  return anchorInYear(anchor, thisYear + 1);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (toUtcMidnight(to).getTime() - toUtcMidnight(from).getTime()) / MS_PER_DAY
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
export function dageTilbageIAaret(today: Date): DageTilbageIAaret {
  const start = toUtcMidnight(today);
  const year = start.getUTCFullYear();
  const sidsteDag = new Date(Date.UTC(year, 11, 31));
  const dage = daysBetween(start, sidsteDag);
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

export function getDageTilAnswer(
  event: DageTilEvent,
  locale: DageTilLocale,
  today: Date
): DageTilAnswer {
  const targetDate = getNextAnchorDate(event.anchor[locale], today);
  const days = daysBetween(today, targetDate);
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

export function getDageTilEvents(locale: Locale): DageTilEvent[] {
  return isDageTilLocale(locale) ? DAGE_TIL_EVENTS : [];
}

export function getDageTilSlugs(locale: Locale): string[] {
  if (!isDageTilLocale(locale)) return [];
  return DAGE_TIL_EVENTS.map((event) => event[locale].slug);
}

/** The event for a slug, or undefined if the slug is not one of ours. */
export function getDageTilEventBySlug(
  slug: string,
  locale: Locale
): DageTilEvent | undefined {
  if (!isDageTilLocale(locale)) return undefined;
  return DAGE_TIL_EVENTS.find((event) => event[locale].slug === slug);
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
 * Resolve a dage-til slug for a domain. A slug in the other language resolves
 * to the same event, so the caller can 301 to the locale's own slug instead
 * of serving a duplicate page.
 */
export function resolveDageTilSlug(
  slug: string,
  locale: Locale
): DageTilSlugResolution | undefined {
  if (!isDageTilLocale(locale)) return undefined;
  const event = DAGE_TIL_EVENTS.find(
    (candidate) =>
      candidate.da.slug === slug || candidate.se.slug === slug
  );
  if (!event) return undefined;
  const localeSlug = event[locale].slug;
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
