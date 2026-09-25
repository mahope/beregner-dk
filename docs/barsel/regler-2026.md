# Danske barselsregler 2026 – regelgrundlag for regelmotoren

> Researchet 2026-09-25. Gælder børn født/modtaget **2. august 2022 eller senere** (den "nye orlovsmodel"), med de senere ændringer der er indarbejdet i gældende lovbekendtgørelse.
>
> **Primær kilde:** Barselsloven, **LBK nr. 206 af 22. januar 2026** (udgivet 31/1-2026) – <https://www.retsinformation.dk/eli/lta/2026/206> (PDF: <https://www.retsinformation.dk/eli/lta/2026/206/pdf>). Den afløser LBK nr. 114 af 29/01/2025 og indarbejder lov nr. 437 og 706 af 2025, lov nr. 1648 af 16/12/2025 og lov nr. 1750 af 29/12/2025.
> Paragrafhenvisninger nedenfor ("§ 21, stk. 3") er til LBK 206/2026, medmindre andet står.
>
> Alt markeret **⚠️ Usikker:** er ikke verificeret direkte i en primærkilde.

---

## 1. Tal til regelmotoren (konstanter)

| Navn | Værdi | Kilde |
|---|---|---|
| `SATS_MAKS_UGE_2026` | 5.085 kr/uge før skat (ved 37 t/uge) | [borger.dk – Lønmodtager på barsel](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel) |
| `SATS_MAKS_TIME_2026` | 137,43 kr/time | samme |
| `SATS_MAKS_UGE_2025` | 4.865 kr/uge | [borger.dk – Surrogataftaler](https://www.borger.dk/familie-og-boern/barsel-oversigt/surrogataftaler-fra-efter-den-1--januar-2025) |
| `SATS_LOVENS_GRUNDBELOEB` | 3.332 kr/uge (reguleres årligt, første mandag i januar; afrundes til nærmeste beløb delbart med 5) | § 35, stk. 1, § 38 |
| `SATS_MIN_SELVST_FRIVILLIG_FORSIKRING` | min. 2/3 af maks-satsen (2/3 × 5.085 = 3.390 kr/uge – afledt) | § 37, stk. 1; [borger.dk – Selvstændig](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-selvstaendige-ny-orlovsmodel) |
| `SELVST_OVERSKUD_FOR_MAKS_2026` | 264.420 kr/år | [borger.dk – Selvstændig](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-selvstaendige-ny-orlovsmodel) |
| `SELVST_TIMER_UDEN_GENOPTAGELSE` | 3,5 t/uge (fra 5/1-2026) | § 22, stk. 2; borger.dk – Selvstændig |
| `NYUDD_SATS_FOER_FOEDSEL_2026` | 3.635 kr/uge (fuldtidsforsikret nyuddannet) | [borger.dk – Studerende og nyuddannede](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-studerende-job-nyuddannede-ny-orlovsmodel) |
| `NYUDD_SATS_EFTER_FOEDSEL_2026` | 4.170 kr/uge | samme |
| `BESK_KRAV_TIMER` | 160 timer inden for de seneste 4 afsluttede kalendermåneder | § 27, stk. 1, nr. 1 |
| `BESK_KRAV_MD_TIMER` | mindst 40 timer i mindst 3 af de 4 måneder | § 27, stk. 1, nr. 1 |
| `BESK_KRAV_SELVST` | ≥ halvdelen af normal ugentlig arbejdstid (borger.dk: 18,5 t/uge) i ≥ 6 af de seneste 12 måneder, heraf den seneste måned | § 28, stk. 1 |
| `BESK_KRAV_NYUDD_UDD_MD` | afsluttet erhvervsmæssig uddannelse på ≥ 18 måneder inden for seneste måned | § 27, stk. 1, nr. 3 |
| `ANSOEGNINGSFRIST_UGER` | 8 uger efter fødsel/modtagelse eller 1. fraværsdag i senere periode; ved løn: 8 uger efter lønophør | § 30, stk. 2-3 |
| `MOR_FOER_FOEDSEL_UGER` | 4 | § 6, stk. 1 |
| `MOR_EFTER_FOEDSEL_PLIGT_UGER` | 2 (ret og pligt) | § 7, stk. 1 |
| `MOR_EFTER_FOEDSEL_YDERLIGERE_UGER` | 8 (uge 3-10) | § 7, stk. 1 |
| `MOR_OVERDRAG_FOERSTE_10_UGER_MAKS` | 8 (til far/medmor eller social forælder) | § 7 a; § 23 b, stk. 1-2 |
| `FAR_MEDMOR_OMKRING_FOEDSEL_UGER` | 2 (inden for de første 10 uger) | § 7, stk. 3 |
| `ORLOV_EFTER_UGE10_FRAVAER_UGER` | 32 pr. forælder (fraværsret) | § 9, stk. 1 |
| `ORLOV_FORLAENG_MAKS_UGER` | 40 (alle) / 46 (beskæftigede lønmodtagere og selvstændige) | § 10 |
| `DAGPENGE_EFTER_UGE10_MOR` | 14 uger | § 21, stk. 1 |
| `DAGPENGE_EFTER_UGE10_FAR_MEDMOR` | 22 uger | § 21, stk. 1 |
| `DAGPENGE_UGER_I_ALT_MOR` | 28 (4 + 10 + 14) → 24 efter fødsel | afledt af §§ 6, 7, 21 |
| `DAGPENGE_UGER_I_ALT_FAR_MEDMOR` | 24 (2 + 22) | afledt af §§ 7, 21 |
| `OEREMAERKET_EFTER_UGE10` | 9 uger pr. forælder (kun beskæftigede lønmodtagere) | § 21, stk. 3 |
| `OEREMAERKET_I_ALT_PR_FORAELDER` | 11 (2 + 9) | § 7, stk. 1 og 3; § 21, stk. 3 |
| `OVERDRAGELIG_MOR_EFTER_UGE10` | 5 (14 − 9) | § 21, stk. 2-3; borger.dk |
| `OVERDRAGELIG_FAR_EFTER_UGE10` | 13 (22 − 9) | § 21, stk. 2-3; borger.dk |
| `OEREMAERKET_FRIST` | inden 1 år efter fødsel/modtagelse (ved særlige forhold: 3 år) | § 21, stk. 3 |
| `SOLO_EKSTRA_UGER` | 22 (i alt 46 efter fødsel/modtagelse) | § 21 c, stk. 1 |
| `IKKE_SAMBOENDE_BOPAELSFORAELDER_EKSTRA` | 13 uger | § 21 b, stk. 1, 1. pkt. |
| `IKKE_SAMBOENDE_ENEFORAELDREMYNDIGHED_EKSTRA` | + 9 uger (oven i de 13) | § 21 b, stk. 1, 2. pkt. |
| `IKKE_SAMBOENDE_ANDEN_FORAELDER` | 9 uger (i stedet for § 21, stk. 1) | § 21 b, stk. 2 |
| `FLERLINGER_EKSTRA_UGER` | 13 pr. forælder (fast, uanset antal børn) | § 14 a, stk. 1 |
| `FLERLINGER_SOCIAL_FORAELDER_MAKS` | 13 | § 14 a, stk. 4 |
| `UDSKUD_RET_UGER` | op til 5 uger (lønmodtager, ret) | § 11 |
| `UDSKUD_SENEST_ALDER` | barnet fylder 9 år | §§ 11, 12, stk. 4, 23, stk. 7 |
| `ADOPTION_FOER_UDLAND_UGER` | 4 (+ op til 4) | § 8, stk. 1 |
| `ADOPTION_FOER_DK_UGER` | 1 (+ op til 1) | § 8, stk. 4 |
| `ADOPTION_FOERSTE_10_UGER_PR_ADOPTANT` | 6 (heraf op til 4 overdragelige) | § 8, stk. 6 |
| `ADOPTION_DAGPENGE_EFTER_UGE10` | 18 uger pr. adoptant | § 21, stk. 1, 2. pkt. |
| `SURROGAT_FOERSTE_10_UGER_PR_FORAELDER` | 6 (heraf op til 4 overdragelige) | § 8 a, stk. 1 |
| `SURROGAT_DAGPENGE_EFTER_UGE10` | 18 uger pr. forælder | § 21, stk. 1, 2. pkt. |
| `STEDBARN_ADOPTION_FRAVAER` / `_DAGPENGE` | 32 uger fravær / op til 9 uger dagpenge (+ 2 uger hvis adopteret inden 10 uger) | § 8 b; § 21, stk. 1, 3. pkt. |
| `INDLAEGGELSE_VINDUE_UGER` | indlæggelse inden for de første 46 uger | § 14, stk. 2 |
| `INDLAEGGELSE_FORLAENG_MAKS` | 12 måneder pr. forælder (børn født/modtaget fra 1/1-2026; før: 3 måneder i alt) | § 14, stk. 2; [bm.dk](https://bm.dk/nyheder/pressemeddelelser/2025/06/foraeldre-i-sorg-eller-med-indlagte-spaedboern-faar-bedre-vilkaar) |
| `INDLAEGGELSE_UDSKRIVNING_SENEST_UGER` | 60 (ved udsættelse) | § 14, stk. 3 |
| `DAGPENGE_OVER_52_UGER_FRIST_MD` | 16 måneder | § 21 d |
| `SORGORLOV_UGER` | 26 pr. forælder | § 13, stk. 1 |
| `BORTADOPTION_UGER` | 14 pr. forælder | § 13, stk. 2 |
| `SYGT_BARN_MAKS` | 52 uger inden for 18 kalendermåneder | § 26, stk. 5 |
| `PENSION_OBLIGATORISK_PCT_2026` | 2,1 % (fra 5/1-2026; 2,4 % fra 4/1-2027) – betales af staten | § 47, § 47 a |
| `ATP_BIDRAG` | dobbelt ATP-bidrag; lønmodtager betaler 1/3, tilbageholdes i dagpengene | § 44 |
| `AM_BIDRAG_PAA_BARSELSDAGPENGE` | 0 (ikke bidragspligtig) – løn under barsel er bidragspligtig | se afsnit 5.2 |
| `SU_FOEDSELSSTOETTE_MD` | 9 måneder (12 hvis enlig forsørger) | [su.dk – Fødsels-støtte](https://www.su.dk/stoette-til-foraeldre/foedsels-stoette-til-dig-der-faar-barn) |
| `SU_FORSOERGERTILLAEG_ENLIG_2026` | 7.426 kr/md før skat | [su.dk – Satser for støtte til forældre](https://www.su.dk/satser/satser-for-stoette-til-foraeldre) |
| `SU_FORSOERGERTILLAEG_PAR_2026` | 2.966 kr/md (samboende med SU-/kontanthjælpsmodtager) | samme |
| `SU_SUPPL_LAAN_FORSOERGER_2026` | 1.900 kr/md | samme |

---

## 2. Orlovsregler

### 2.1 Graviditetsorlov
- Mor har ret til fravær, når der skønnes at være **4 uger til fødslen** – [§ 6, stk. 1](https://www.retsinformation.dk/eli/lta/2026/206).
- **Tidligere fravær** ved lægeligt vurderet sygeligt forløb med risiko for mor/foster, eller når arbejdets karakter udgør en risiko og arbejdsgiveren ikke kan tilbyde andet passende arbejde – § 6, stk. 2. Anmeldes og dokumenteres – § 30, stk. 1. Disse uger tæller ikke af de 4 uger (dagpenge efter § 20).
- Fravær til graviditetsundersøgelser i arbejdstiden – § 6, stk. 3; arbejdsgiveren betaler – § 18.

### 2.2 De første 10 uger efter fødslen
- **Mor:** ret *og pligt* til fravær i **2 uger** efter fødslen, derefter ret til yderligere **8 uger** – § 7, stk. 1. Hun kan ikke genoptage arbejdet i de 2 første uger – § 12, stk. 5; § 22, stk. 1.
- **Overdragelse af mors 8 uger (uge 3-10):** En *beskæftiget* mor kan overdrage op til **8 uger** til far/medmor – § 7 a:
  - stk. 1: hvis hun genoptager arbejdet på fuld tid → holdes inden for de første 10 uger.
  - stk. 2: hvis hun i stedet påbegynder § 9-orlov på fuld tid → far/medmor kan holde ugerne inden for det første år.
  - Samme mulighed over for en *social forælder* – § 23 b, stk. 1-2.
  - Varsel: senest 4 uger før forventet fødsel – § 15, stk. 1, 2. pkt.
- **Far/medmor:** **2 sammenhængende uger** efter fødslen/hjemkomst, eller efter aftale med arbejdsgiveren på et andet tidspunkt inden for de første 10 uger – § 7, stk. 3.
  - **Kan deles op:** Lønmodtagere og selvstændige kan holde de 2 uger som ikke-sammenhængende perioder inden for de første 10 uger; *for lønmodtagere kræver det aftale med arbejdsgiveren* – § 7, stk. 3, 2.-3. pkt.
- Far/medmor kan også påbegynde sin § 9-orlov inden for de første 10 uger – § 9, stk. 1, 2. pkt.
- Dør mor eller bliver hun ude af stand til at passe barnet pga. sygdom, indtræder far/medmor i hendes ret – § 7, stk. 2.

**Afklaring – hvordan mors 10 uger tæller:** Mors uge 1-10 (2 + 8) ligger *uden for* de 24/14 uger i § 21. Hendes samlede dagpengeret er 4 (før) + 10 (uge 1-10) + 14 (efter uge 10) = **28 uger**, heraf 24 efter fødslen. Hendes 11 øremærkede uger = de 2 pligt-uger + 9 af de 14 uger. De 8 uger i uge 3-10 er ikke "øremærkede", men kan kun overdrages på betingelserne i § 7 a. Far/medmors 24 uger = 2 (§ 7, stk. 3) + 22 (§ 21), heraf 11 øremærkede (2 + 9).

Oversigt (borger.dk, [Lønmodtager på barsel](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel)):

| | Mor | Far/medmor |
|---|---|---|
| Før fødsel | 4 uger | – |
| Lige efter fødsel, ikke-overdragelige | 2 uger | 2 uger |
| Øvrige uger i de første 10 uger | 8 uger (overdragelige efter § 7 a) | – |
| Øremærkede efter uge 10 (inden 1 år) | 9 uger | 9 uger |
| Overdragelige efter uge 10 | 5 uger | 13 uger |
| **I alt med dagpenge efter fødsel** | **24** | **24** |

### 2.3 Orlov efter 10. uge (forældreorlov)
- Hver forælder har **fraværsret i 32 uger** efter uge 10 – § 9, stk. 1 – men **dagpengeret** er 14 uger (mor) / 22 uger (far/medmor) inden 1 år efter fødslen – § 21, stk. 1.
- **Øremærkning:** En *beskæftiget lønmodtager* skal holde **9 af ugerne** inden 1 år; de kan ikke overdrages. Ved særlige forhold kan de holdes inden 3 år – § 21, stk. 3.
  - Selvstændige og ledige er ikke omfattet af § 21, stk. 3 (borger.dk om surrogatforældre: "For ikke-lønmodtagere: alle 18 uger kan overdrages"). Bliver forælderen lønmodtager inden 1 år, gælder øremærkningen – § 21 a.
- **Overdragelse mellem forældre:** Den ikke-øremærkede del kan overdrages til den anden forælder; det gælder også en forælder, der ikke selv opfylder beskæftigelseskravet (overdrager de uger, hun/han ville have haft) – § 21, stk. 2.

### 2.4 Forlængelse af fravær (32 → 40/46 uger)
- Hver forælder kan forlænge fraværet efter § 9 fra 32 op til **40 uger**; beskæftigede lønmodtagere og selvstændige op til **46 uger** – § 10.
- Forlængelsen giver **ikke** flere dagpengeuger (dagpengeretten er fastlagt i § 21).
- ⚠️ Usikker: Om dagpengene kan "strækkes"/nedsættes forholdsmæssigt over den forlængede periode (som i den gamle 32/46-model). Jeg fandt ingen bestemmelse herom i LBK 206/2026; reglen kan ligge i bekendtgørelse om barselsdagpenge. Modellér ikke nedsat sats uden verifikation.

### 2.5 Samlet maksimum – 52 uger
- Summen for et forældrepar er 28 + 24 = **52 uger** med dagpenge (afledt af §§ 6, 7, 21).
- Har en forælder ret til **mere end 52 uger** (fx solo, flerlinger), kan ugerne ud over 52 holdes senest **16 måneder** efter fødslen – § 21 d.
- Dagpengeuger efter § 21 skal ellers holdes inden 1 år (§ 21, stk. 1), dog kan udskudte uger holdes senere (afsnit 2.6).

### 2.6 Udskudt orlov
- **Ret** (uden aftale): beskæftigede lønmodtagere kan genoptage arbejdet og udskyde **op til 5 uger** af § 9-fraværet; holdes i én sammenhængende periode, inden barnet fylder **9 år** – § 11.
- **Efter aftale** med arbejdsgiveren kan fraværsretten udskydes med den tid, arbejdet har været genoptaget på fuld tid (§ 7 a, stk. 2 og § 9) – § 12, stk. 3. Skal være brugt inden 9 år; skifter man job, kræver det aftale med den nye arbejdsgiver – § 12, stk. 4.
- **Dagpenge** kan udskydes tilsvarende – § 23, stk. 2. Betingelser: dagpengeret i perioden hvor der arbejdes, beskæftigelse i det første år svarende til perioden, opfyldt beskæftigelseskrav og beskæftigelse umiddelbart før den udskudte orlov; bortfalder når barnet fylder 9 år – § 23, stk. 2-7. Udskudte dagpenge kan overdrages til den anden forælder – § 23, stk. 3.

### 2.7 Delvis genoptagelse af arbejdet
- Efter **aftale med arbejdsgiveren** kan en lønmodtager genoptage arbejdet helt eller delvis under fravær efter §§ 6-11 (ikke mors 2 første uger) – § 12, stk. 1 og 5.
- Ved delvis genoptagelse (under § 7, § 7 a, stk. 2, § 8, stk. 6, § 8 a, stk. 1, § 8 b, stk. 2 og § 9) kan det aftales, at **fraværsretten forlænges** med den tid, arbejdet er genoptaget – § 12, stk. 2; **dagpengeretten forlænges** tilsvarende – § 23, stk. 1.
- Der udbetales ikke dagpenge for uger, hvor arbejdet er genoptaget på fuld tid – § 22, stk. 3.
- Selvstændige kan genoptage helt/delvis uden aftale (§ 22, stk. 1) og kan arbejde op til 3,5 t/uge uden at det regnes som genoptagelse (§ 22, stk. 2).

### 2.8 Varslingsfrister (lønmodtagere) – § 15-17
| Situation | Frist | Kilde |
|---|---|---|
| Mor: forventet fødselstidspunkt + om hun holder fravær før fødslen | 3 måneder før forventet fødsel | § 15, stk. 1, 1. pkt. |
| Mor: overdragelse efter § 7 a (og om hun i stedet holder § 9-orlov) | senest 4 uger før forventet fødsel | § 15, stk. 1, 2. pkt. |
| Mor: hvornår hun genoptager arbejdet efter de 10 uger | inden 6 uger efter fødslen | § 15, stk. 2 |
| Far/medmor: 2 uger, overdraget § 7 a-orlov eller § 9-orlov inden for de første 10 uger | senest 4 uger før forventet fødsel (inkl. længde) | § 15, stk. 3 |
| Orlov efter §§ 9-10 og overdraget orlov efter uge 10 (§ 7 a, stk. 2) | inden 6 uger efter fødsel/modtagelse (start + længde, også for senere perioder) | § 15, stk. 4 |
| Hvis man ikke kunne varsle inden 6 uger (fx ny ansættelse) | 8 ugers varsel | § 15 a |
| Adoption/surrogati (§§ 8-8 b) | så vidt muligt tilsvarende frister | § 15, stk. 5 |
| Sorgorlov (§ 13) | uden ugrundet ophold | § 15, stk. 6 |
| Indlæggelse (§ 14) | uden ugrundet ophold; nyt varsel inden 2 uger efter hjemkomst | § 15, stk. 7 |
| Ønske om at udskyde op til 5 uger (§ 11) | senest 6 uger efter fødsel/modtagelse | § 16, stk. 1 |
| Afholdelse af udskudt orlov | 16 ugers varsel; dog 8 uger når den udskudte ret efter § 11 er på op til 5 uger | § 16, stk. 2 |
| Afholdelse af resterende orlov efter ændring pga. uforudsete omstændigheder | 16 uger før | § 17 |
| Nærtstående familiemedlem, der holder overdraget orlov | 8 ugers varsel | § 23 c, stk. 3 |
| Social forælder | fristerne i § 15, stk. 3 og 4 | § 23 b, stk. 6 |

- Varslet kan ændres, hvis nyt varsel afgives inden fristens udløb, eller hvis omstændigheder gør det urimeligt at fastholde – § 17.

### 2.9 Ferie under barsel
- Du kan **ikke holde ferie under orloven**, men kan afbryde orloven for at holde ferie ([borger.dk – Barsel, adoption og ferie](https://www.borger.dk/arbejde-dagpenge-ferie/Oversigt-ferie/barsel--adoption-og-ferie)).
- **Med løn** under orloven optjenes ferie med løn/feriegodtgørelse som normalt. **Kun barselsdagpenge:** ingen ferie med løn/feriepenge optjenes (samme kilde).
- **Ferieydelse** (fra Udbetaling Danmark) optjenes af lønmodtagere under fravær efter § 6, stk. 1 (4 uger før), § 7, stk. 1-2 (mors 10 uger), overdraget fravær efter § 7 a, stk. 1, § 8, stk. 6, 1. pkt., § 8 a, stk. 1 og 4, § 9, stk. 2 i indtil 10 uger efter fødslen, og overdraget fravær efter § 23 b, stk. 1 – *uanset om der er udbetalt barselsdagpenge* – § 25 b, stk. 1. Solo-far/medmor (§ 21 c) optjener tilsvarende for fravær indtil 10 uger efter fødslen. Ikke-ansatte: § 25 d (kræver udbetalte dagpenge).
  - Retten gælder ikke i det omfang, der optjenes ferie med løn, feriegodtgørelse ≥ dagpengesatsen eller feriedagpenge – § 25 b, stk. 2.
  - Ferieydelsen beregnes som barselsdagpenge (§§ 33 og 35) – § 25 b, stk. 7.
  - ⚠️ Usikker: Far/medmors almindelige 2 uger (§ 7, stk. 3) står ikke eksplicit i § 25 b's opregning (kun ved solo-far/medmor). Tolk ikke som ferieydelsesberettiget uden yderligere kilde.
- Ved delvis genoptagelse optjenes 0,07 feriedage pr. dag med løn (borger.dk, samme side).

### 2.10 Pension under barsel
- Udbetaling Danmark indbetaler **ATP** med dobbelt bidrag; lønmodtageren betaler 1/3 (tilbageholdes i dagpengene), UDK 2/3 – § 44.
- Staten indbetaler et **obligatorisk pensionsbidrag** på **2,1 %** af dagpengene (efter ATP-fradrag) fra 5/1-2026; det fratrækkes ikke dagpengene – §§ 47, 47 a. Stiger 0,3 pct.-point pr. år til 3,3 % i 2030.
- Arbejdsgiverbetalt pension under lønnet barsel afhænger af overenskomst/kontrakt (se afsnit 5.3).

---

## 3. Konstellationer

### 3.1 Mor + far / mor + medmor
- "Forælder" = mor, far, medmor, adoptant eller forælder med forældreskab efter surrogataftale – § 23 a, stk. 1. **Medmor** (juridisk forælder efter børneloven) har præcis samme rettigheder som far i barselsloven (§ 7, stk. 3; § 9; § 21 nævner "far eller medmor").
- Fordeling: se afsnit 2.2-2.3.

### 3.2 To fædre / surrogati
- Forældre med forældreskab fastslået på grundlag af surrogataftale (børnelovens kap. 1 b, 5 b eller 5 c): **6 uger hver** i de første 10 uger, heraf op til **4 overdragelige** – § 8 a, stk. 1; derefter **18 ugers dagpenge hver** (9 øremærkede for lønmodtagere) – § 21, stk. 1, 2. pkt. = 24 uger hver. Retten gælder fra fødslen, selv om forældreskab fastslås senere – § 8 a, stk. 3.
- Surrogatmoren (socialt sikret i DK) har ret til § 6 (4 uger før) og § 7, stk. 1 (10 uger efter), forlænget ved graviditetsbetinget sygdom op til 46 uger – § 8 a, stk. 4.
- Kilde: [borger.dk – Surrogataftaler indgået 1/1-2025 eller senere](https://www.borger.dk/familie-og-boern/barsel-oversigt/surrogataftaler-fra-efter-den-1--januar-2025).
- ⚠️ Usikker: Reglerne gælder efter borger.dk for **surrogataftaler indgået 1. januar 2025 eller senere**. To fædre med ældre aftaler/uden surrogataftale (fx via adoption) følger adoptionsreglerne; den præcise overgangsregel er ikke verificeret.

### 3.3 Stedbarnsadoption
- Forælder, der stedbarnsadopterer (adoptionslovens § 5 a) inden 1 år efter fødslen: fraværsret op til 32 uger inden for det første år (kan påbegyndes i de første 10 uger); + op til 2 uger i de første 10 uger, hvis adopteret inden for de første 10 uger – § 8 b. Dagpenge: op til **9 uger** inden 1 år – § 21, stk. 1, 3. pkt.
- ⚠️ Usikker: borger.dk angiver ordningen for børn født 1/1-2025 eller senere ([Adoption og orlov](https://www.borger.dk/familie-og-boern/barsel-oversigt/adoption-og-orlov)); ikrafttrædelsesdato ikke verificeret i lovteksten.

### 3.4 Soloforælder (barnet har kun én juridisk forælder)
- Ud over sin almindelige ret (§ 21, stk. 1) får forælderen **22 ekstra uger** med dagpenge ved fravær efter §§ 9-10 inden 1 år – § 21 c, stk. 1. I alt **46 uger** efter fødslen/modtagelsen (borger.dk). For solomor + 4 uger før fødslen.
- Beskæftigede lønmodtagere har stadig 9 øremærkede uger – § 21 c, stk. 3.
- **Overdragelse til nærtstående familiemedlem** (børn født/adopteret 1/1-2024 eller senere): en soloforælder, der opfylder beskæftigelseskravet, kan helt eller delvis overdrage sin *ikke-øremærkede* § 9-orlov med dagpenge (inkl. de 22 ekstra uger) – § 23 c, stk. 1. Nærtstående = forælderens egne forældre og søskende over 18 år, samt forældre og søskende over 18 år til en afdød forælder – § 23 c, stk. 2. Holdes inden 1 år; 8 ugers varsel – § 23 c, stk. 1 og 3. Kilde: [borger.dk – Nærtstående familiemedlem](https://www.borger.dk/familie-og-boern/barsel-oversigt/hvis-du-er-naertstaaende-familiemedlem).
  - Konkret: solomor kan overdrage 5 af 14 + op til 22 = **op til 27 uger**; solo-far/medmor 13 af 22 + 22 = **op til 35 uger** (afledt af borger.dk-opdelingen).
- Flerlinger: soloforælder kan søge om at tildele op til **13 ugers** flerlingeorlov til nærtstående eller social forælder – § 14 a, stk. 3.
- Dør en forælder, overtager den efterlevende den afdødes uudnyttede uger – § 21 c, stk. 2.

### 3.5 Forældre, der ikke bor sammen ved fødslen
- Forælderen med barnet boende: **+13 uger**; har vedkommende også eneforældremyndighed: **+9 uger** mere – § 21 b, stk. 1.
- Den anden forælder: ikke § 21, stk. 1, men **9 uger** ved fravær efter § 9 inden 1 år – § 21 b, stk. 2.
- Kilde også: [Ankestyrelsen – fordeling når forældrene ikke bor sammen](https://www.ast.dk/for-myndigheder/artikler/2024/dec/hvordan-fordeles-orlov-med-ret-til-barselsdagpenge-naar-foraeldrene-ikke-bor-sammen-paa-foedselstidspunktet) (børn født 1/1-2024 eller senere).

### 3.6 Sociale forældre (LGBT+-familier, papforældre, kendt donor)
- Social forælder = forælders ægtefælle/samlever (samlever: ≥ 2 års ægteskabslignende forhold), kendt donor, eller kendt donors ægtefælle/samlever – som er tiltænkt en forældrelignende relation og ikke er juridisk forælder – § 23 a, stk. 2-3.
- En forælder kan helt eller delvis overdrage sin **ikke-øremærkede** § 9-orlov med dagpenge til en social forælder – § 23 b, stk. 3. Mor kan desuden overdrage op til 8 af sine uge 3-10 – § 23 b, stk. 1-2.
- Flerlingeorlov: højst 13 uger i alt til en social forælder – § 14 a, stk. 4.
- Kilde: [borger.dk – Social forælder](https://www.borger.dk/familie-og-boern/barsel-oversigt/hvis-du-er-social-foraelder); ordningen gælder børn født/modtaget 1/1-2024 eller senere.
- ⚠️ Usikker: Sekundære kilder (fx fagforeninger) siger "op til to sociale forældre". Lovteksten i LBK 206/2026 angiver ikke et loft over antal; det kan stå i bekendtgørelsen. Heller ikke verificeret: "op til 4 omsorgspersoner" – ikke fundet i nogen primærkilde.

### 3.7 Adoption
- **Før modtagelse:** udland 4 uger hver (+ op til 4 ved forsinkelse) – § 8, stk. 1; Danmark 1 uge (+ op til 1) – § 8, stk. 4. Kræver godkendt formidling – § 8, stk. 3.
- **Første 10 uger efter modtagelse:** 6 uger hver, op til 4 kan overdrages til den anden adoptant (dvs. 2 ikke-overdragelige) – § 8, stk. 6.
- **Efter uge 10:** 18 ugers dagpenge hver (9 øremærkede for lønmodtagere) – § 21, stk. 1, 2. pkt. I alt 24 uger hver.
- **Eneadoptant:** 6 + 18 + 22 = 46 uger ([borger.dk – Barselsregler for adoptanter](https://www.borger.dk/familie-og-boern/barsel-oversigt/adoption-og-orlov/adoption-og-orlov-ny-orlovsmodel)); kan påbegynde § 9-orlov i de første 10 uger – § 9, stk. 1.

### 3.8 Flerfødsel
- Forældre til **to eller flere** levendefødte børn ved samme fødsel: hver **13 ugers ekstra fravær** med dagpenge (fast 13, ikke pr. ekstra barn) – § 14 a, stk. 1; § 20. Adoptanter: børnene skal være under 1 år ved modtagelsen.
- Holdes inden 1 år efter fødslen – § 14 a, stk. 6. Kan overdrages helt/delvis til social forælder – § 14 a, stk. 2.

### 3.9 For tidligt født / indlagt barn
- Er barnet indlagt (eller i **tidligt hjemmeophold**), forlænges eller udsættes fraværsperioden – § 14, stk. 1.
- Genoptages arbejdet ikke: forlængelse med indlæggelsesperioden, hvis indlæggelsen sker inden for de første **46 uger**; **højst 12 måneder pr. forælder** – § 14, stk. 2. Gælder børn født/modtaget **1/1-2026 eller senere**; tidligere regel var 3 måneder i alt ([bm.dk pressemeddelelse juni 2025](https://bm.dk/nyheder/pressemeddelelser/2025/06/foraeldre-i-sorg-eller-med-indlagte-spaedboern-faar-bedre-vilkaar)).
- Genoptages/fortsættes arbejdet: resterende fravær udsættes til efter udskrivning, som skal ske inden **60 uger** – § 14, stk. 3.
- ⚠️ Usikker: borger.dk-sider nævner stadig "højst 3 måneder" – sandsynligvis for børn født før 1/1-2026. Brug fødselsdato som skæringskriterium.

### 3.10 Barnets død, bortadoption og alvorlig sygdom
- **Sorgorlov:** 26 uger pr. forælder, hvis barnet er dødfødt eller dør før 18 år – § 13, stk. 1. Udsætter § 9-fravær for et andet barn (brug inden 9 år) – § 13, stk. 4. Mor med graviditetsbetinget sygdom: forlængelse op til 46 uger – § 13, stk. 3. [borger.dk – Sorgorlov](https://www.borger.dk/familie-og-boern/barsel-oversigt/sorgorlov).
- **Bortadoption** før uge 32: 14 uger pr. forælder – § 13, stk. 2.
- **Alvorligt syge børn** under 18 år: dagpenge ved forventet ≥ 12 dages hospitalsophold; højst 52 uger inden for 18 måneder – § 26. [borger.dk – Pasning af alvorligt syge børn](https://www.borger.dk/familie-og-boern/barn-syg-og-omsorgsdage/pasning-alvorligt-syge-boern).

### 3.11 Selvstændige
- Beskæftigelseskrav: selvstændig virksomhed i mindst halvdelen af normal ugentlig arbejdstid (borger.dk: 18,5 t/uge) i mindst 6 af de seneste 12 måneder, heraf den seneste måned; lønmodtagerperioder kan medregnes ved kortere virksomhed – § 28, stk. 1.
- Sats beregnes af virksomhedens **overskud** (+ evt. indkomst overført til medarbejdende ægtefælle); maks 5.085 kr/uge; kræver ≥ 264.420 kr årligt overskud for fuld sats (2026). Med frivillig sygedagpengeforsikring (tegnet ≥ 6 mdr. før) mindst 2/3 af maks – § 37; [borger.dk – Selvstændig](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-selvstaendige-ny-orlovsmodel).
- Udbetales efter 5-dages-uge man-fre – § 37, stk. 2. Op til 3,5 t/uge arbejde (fra 5/1-2026) – § 22, stk. 2.
- Ikke omfattet af øremærkning (§ 21, stk. 3 gælder beskæftigede lønmodtagere).

### 3.12 Ledige
- Ledigt a-kassemedlem får barselsdagpenge med **samme sats som arbejdsløshedsdagpenge** på første dag med ret – § 36, stk. 1; højst 5.085 kr/uge ([borger.dk – Ledig på barsel](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-ledige-ny-orlovsmodel)).
- Beskæftigelseskrav opfyldt, hvis personen ville have været berettiget til a-dagpenge – § 27, stk. 1, nr. 2.
- Procedure: anmeld fraværet til a-kassen senest 8 uger efter fødsel/1. fraværsdag; a-kassen anmelder via NemRefusion inden 1 uge; søg UDK senest 8 uger efter underretningsbrevet – § 30, stk. 4-6.
- Bliver man lønmodtager inden 1 år, gælder øremærkning og evt. op til 9 ugers dagpenge efter § 21 a.

### 3.13 Studerende og nyuddannede
- **Nyuddannede** (erhvervsmæssig uddannelse ≥ 18 mdr. afsluttet inden for seneste måned) opfylder beskæftigelseskravet – § 27, stk. 1, nr. 3. Sats (fuldtidsforsikret) 2026: 3.635 kr/uge før fødslen, 4.170 kr/uge efter ([borger.dk](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-studerende-job-nyuddannede-ny-orlovsmodel)).
- **Studiejob:** almindeligt lønmodtagerkrav (160/40 timer).
- **Elever i lønnet praktik** opfylder kravet – § 27, stk. 1, nr. 4.
- **SU-modtagere** har ikke ret til barselsdagpenge alene pga. SU. **Fødsels-støtte**: op til **9 måneder** (mor og far/medmor hver), **12 måneder** for enlige forsørgere; mor fra 2 mdr. før terminsmåneden, far/medmor fra fødselsmåneden ([su.dk – Fødsels-støtte](https://www.su.dk/stoette-til-foraeldre/foedsels-stoette-til-dig-der-faar-barn)). Forsørgertillæg 2026: 7.426 kr/md (enlig), 2.966 kr/md (par med SU-/kontanthjælpsmodtager); supplerende lån 1.900 kr/md ([su.dk – Satser](https://www.su.dk/satser/satser-for-stoette-til-foraeldre)).
- ⚠️ Usikker: borger.dk nævner "9 ekstra SU-klip", su.dk "op til 9 måneder med fødsels-støtte". Det gamle tal "12 klip til mor / 6 til far" gælder støtte søgt før 1/8-2022 og er ikke længere aktuelt. Antal ved flerlinger: pr. fødsel, ikke pr. barn (su.dk).

---

## 4. Ansøgning og betingelser
- Ansøg Udbetaling Danmark senest **8 uger** efter fødsel/modtagelse eller efter 1. fraværsdag i en senere periode; ved løn under fravær: 8 uger efter lønophør – § 30, stk. 2-3. For sen ansøgning: retten bortfalder for perioden før ansøgningen – § 30, stk. 7.
- Beskæftigelseskravet vurderes ved start af hver fraværsperiode, men anses for opfyldt i efterfølgende perioder inden 1 år, hvis man fortsat er lønmodtager/selvstændig/dagpengeberettiget ledig – § 29, stk. 1.
- Udbetaling: sidste torsdag i måneden (borger.dk).

---

## 5. Økonomi

### 5.1 Barselsdagpenge 2026
- **Lønmodtager:** beregnes af det ugentlige timetal under fraværet × den gennemsnitlige timefortjeneste i de seneste **3 afsluttede kalendermåneder** før fraværet, **efter AM-bidrag** – § 33, stk. 1. Maks **137,43 kr/time** og **5.085 kr/uge** (37 timer) – [borger.dk](https://www.borger.dk/familie-og-boern/barsel-oversigt/barsel-loenmodtagere-ny-orlovsmodel); § 35, stk. 1 (timeloft = ugebeløb ÷ normal overenskomstmæssig ugentlig arbejdstid).
- Formel: `ugesats = min(timer_pr_uge × min(timeløn_efter_AM, 137,43), 5.085)`.
- Feriegodtgørelse, søgnehelligdage, pensions-, ATP- og AM-bidrag indgår ikke i timefortjenesten ([Vejledning om beregning af barselsdagpenge](https://www.retsinformation.dk/api/pdf/210372), via søgeresultat – ⚠️ ikke læst direkte).
- Udbetales efter 5-dages-uge med lige store dagsandele – § 35, stk. 2.
- **Selvstændige** og **ledige**: se 3.11-3.12.
- Arbejdsgiver, der betaler løn, får dagpengene som refusion (højst den udbetalte løn) – § 39.

### 5.2 AM-bidrag og skat
- **Barselsdagpenge er ikke AM-bidragspligtige.** Skattestyrelsens juridiske vejledning ([C.A.12.1](https://info.skat.dk/data.aspx?oid=1976911)) nævner udtrykkeligt "løn under sygdom og barsel" som bidragspligtig, mens barselsdagpenge (overførselsindkomst) ikke er på listen. Understøttes af § 33, der beregner dagpengene af lønnen *efter* AM-bidrag.
  - ⚠️ Usikker (lav): Konklusionen hviler på opregningen i C.A.12.1 og sekundære kilder; jeg fandt ikke én sætning i en primærkilde, der ordret siger "barselsdagpenge er ikke AM-bidragspligtige".
- **Konsekvens for netto:** Løn under barsel: `netto = (løn − 8 % AM) − A-skat`. Barselsdagpenge: `netto = dagpenge − ATP-andel − A-skat` (ingen AM).
- Barselsdagpenge er skattepligtige; der trækkes A-skat.
- ATP: lønmodtagerens 1/3 af dobbelt ATP-bidrag tilbageholdes – § 44, stk. 3-5. ⚠️ Usikker: det konkrete kronebeløb pr. uge for 2026 er ikke fundet.

### 5.3 Typiske overenskomstmodeller (eksempler – ikke udtømmende)
Løn under barsel følger af overenskomst/kontrakt, ikke barselsloven. Mønster: fuld løn i en del af perioden; arbejdsgiveren får dagpengerefusion.

| Område | Mor | Far/medmor | Delbare | Gælder børn født | Kilde |
|---|---|---|---|---|---|
| **Staten** | Løn fra 6. uge før (6. og 5. uge altid + fra det tidspunkt, hvor der er fuld refusion); 10 uger efter; 10 uger efter uge 10 | 2 uger; 10 uger efter uge 10 (+ op til 8 uger i uge 3-10 ved overdragelse fra mor) | 8 deleuger | 1/4-2026 eller senere | [Medst. cirkulære 028-26 af 25/6-2026](https://cirkulaere.medst.dk/media/ehgjlxki/028-26.pdf) §§ 3, 5, 6. Soloforælder +10 ugers løn; flerlinger +13 uger |
| **Kommuner/regioner** | 8 uger før; 10 uger efter; 10 ugers forældreorlov | 2 uger + 10 ugers forældreorlov | 6 uger | ⚠️ OK24-model, fra 1/4-2024 | [HK – kommunale barselsrettigheder](https://www.hk.dk/raadogstoette/barsel/barselsrettigheder/barselsrettigheder-i-det-kommunale) |
| **Industrien (DI/CO-industri)** | 4 uger før + 10 uger efter; + 9 uger | 2 uger + 10 uger | 7 deleuger (inden barnet fylder 1) | 1/6-2025 eller senere; 9 mdr. anciennitet | [DI – Betaling ved graviditet og barsel](https://www.danskindustri.dk/vi-radgiver-dig/personale/graviditet-og-barsel/betaling-ved-graviditet-og-barsel/) |

- ⚠️ Usikker: Tallene for kommuner/regioner og industrien stammer fra en opsummering af siderne, ikke fra selve overenskomstteksten. Finanssektoren er ikke undersøgt. Brug kun tallene som eksempler i UI og ikke som regler.

### 5.4 Ferieoptjening under barsel
Se afsnit 2.9. Kort: løn → normal optjening; kun dagpenge → ingen ferie med løn, men ferieydelse for 4 uger før + mors 10 uger (og visse overdragne uger) efter § 25 b/§ 25 d, medmindre der optjenes feriedagpenge/feriegodtgørelse.

---

## 6. Rettelser til sitets nuværende tal

| Sitets påstand | Status |
|---|---|
| Maks 5.085 kr/uge før skat ved 37 timer; 137,43 kr/time | ✅ Bekræftet (borger.dk 2026) |
| Mor 4 uger før, 2 uger efter ikke-overdragelige | ✅ Bekræftet (§ 6, § 7) |
| Far/medmor 2 uger i de første 10 uger | ✅ Bekræftet (§ 7, stk. 3). Tilføj: kan deles op; lønmodtagere kun efter aftale |
| Hver 24 uger efter fødsel | ✅ Bekræftet (mor 10 + 14; far/medmor 2 + 22) |
| 9 øremærkede | ✅ Bekræftet, men **kun for beskæftigede lønmodtagere** (§ 21, stk. 3); i alt 11 inkl. de 2 uger |
| Op til 13 kan overdrages | ⚠️ **Præcisér:** 13 gælder far/medmor. Mor kan overdrage **5** af sine 14 uger efter uge 10 (+ op til 8 af uge 3-10 efter § 7 a). borger.dk skriver "Som mor kan du vælge at overdrage op til 13 ugers orlov" – det stemmer, når de 8 § 7 a-uger regnes med (8 + 5 = 13); krydstjekket 2026-09-25 |
| Beskæftigelseskrav 160 t på 4 mdr., ≥ 40 t i 3 af dem | ✅ Bekræftet (§ 27, stk. 1, nr. 1) |
| Ansøgningsfrist 8 uger | ✅ Bekræftet (§ 30, stk. 2); ved løn: 8 uger efter lønophør |

---

## 7. Usikkerheder

1. **Forlænget orlov (40/46 uger) og dagpengesats:** Det er ikke verificeret, om dagpenge kan nedsættes forholdsmæssigt og strækkes over den forlængede periode. LBK 206/2026 indeholder ingen sådan regel. Det skal tjekkes i bekendtgørelse om barselsdagpenge eller hos UDK.
2. **AM-bidrag:** Konklusionen "ingen AM-bidrag af barselsdagpenge" bygger på Skats positivliste (C.A.12.1) og § 33, ikke på en eksplicit sætning i en primærkilde.
3. **Antal sociale forældre:** Påstanden om "op til 2" er ikke fundet i lovteksten, og "op til 4 omsorgspersoner" er ikke fundet nogen steder.
4. **Surrogati/to fædre:** Overgangsreglen for surrogataftaler indgået før 1/1-2025 er ikke verificeret.
5. **Stedbarnsadoption:** Ikrafttrædelsen (børn født 1/1-2025 eller senere, jf. borger.dk) er ikke verificeret i lovteksten.
6. **Indlæggelse:** borger.dk-tekster siger stadig "højst 3 måneder". Loven siger 12 måneder pr. forælder for børn født 1/1-2026 eller senere. Regelmotoren skal skelne på fødselsdato.
7. **Ferieydelse for far/medmors 2 uger:** Står ikke eksplicit i § 25 b (kun ved solo-far/medmor).
8. **ATP-beløb 2026:** Kronebeløbet er ikke fundet.
9. **Overenskomsteksempler:** Kommune/region og industri er gengivet fra opsummeringer af sekundære sider (HK, DI). Statens tal er læst direkte i cirkulæret. Finanssektoren er ikke undersøgt.
10. **SU fødsels-støtte:** borger.dk siger "9 ekstra SU-klip" og su.dk "op til 9 måneder". Det er ikke verificeret, om det er 9 pr. forælder uden undtagelse (fx far/medmor på ungdomsuddannelse).
11. **Vejledning om beregning af barselsdagpenge** (retsinformation api/pdf/210372) er kun læst via søgeresultat, fordi PDF'en ikke kunne parses.
12. **Kommende ændring:** § 8 i lov nr. 630 af 11/6-2024 (helligdagsafskaffelse) træder i kraft 1/12-2026 og er ikke indarbejdet i LBK 206/2026. Den kan påvirke satsberegningen fra december 2026.
13. **Borger.dk "Kom godt i gang"-oversigten** (saadan-fungerer-barsel) returnerede 404. Oversigten er i stedet læst fra lønmodtager-siden.
