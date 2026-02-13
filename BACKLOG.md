# Minberegner.dk (Beregner.dk brand) — Backlog

> **Produkt:** Gratis online beregnere til danskere
> **Revenue model:** Ads (AdSense), Affiliate (finans, forsikring)
> **Target:** Danskere der søger på "beregn X", "X beregner"

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## ✅ Completed

### Core Site
- [x] 25+ beregnere implementeret og live
- [x] Blog med how-to guides
- [x] SEO skabelon (src/lib/seo.ts)
- [x] InternalLinks component
- [x] Cookie consent + GDPR
- [x] Responsive design
- [x] Sitemap generering
- [x] FAQ og RelatedCalculators exports fixed

### Eksisterende Beregnere
Løn efter skat, Dagpenge, Moms, BMI, Procent, Boliglån, Husleje, Boligstøtte, 
Rente, Pension, SU, Efterløn, Barselsdagpenge, Børnepenge, Rentefradrag, 
Feriepenge, Valuta, Tidszone, Alder, Opsparing, Bil/brændstof, Kalorier, 
Kvadratmeter, Timepris, Dato/tid

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## 🚀 Phase 1: SEO & Ads Revenue (Prioritet 1)

### Build & Deploy
- [x] Kør fuld production build og fix alle fejl
- [x] Deploy til Dokploy og verificer alle sider
  - ✅ **LØST (2026-02-12):** App kører på Dokploy med status "done"
  - Domæne konfigureret: minberegner.dk (HTTPS + Let's Encrypt)
  - Site verificeret tilgængeligt: HTTP 200
- [x] SSL og performance check
  - ✅ **LØST (2026-02-13):** SSL verificeret (gyldig til maj 2026)
  - Security headers tilføjet (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
  - Performance OK: TTFB ~200ms, Next.js caching aktivt
- [ ] Submit til Google Search Console
  - ✅ **LØST (2026-02-13):** sitemap.xml virker nu via API route handler
  - Rewrite regel: /sitemap.xml → /api/sitemap (dynamisk XML)
  - 30+ sider inkluderet med korrekte priorities
  - ⏳ **BRUGER-OPGAVE:** Gå til search.google.com/search-console, tilføj minberegner.dk, submit sitemap

### AdSense Setup
- [ ] Ansøg om AdSense godkendelse
- [ ] Placer ads: sidebar, mellem sektioner, footer
- [ ] A/B test ad placering (over vs under beregner)
- [ ] Respekter UX: max 3 ads per side

### SEO Improvements
- [x] JSON-LD Calculator schema på alle beregnere
- [x] FAQ schema på populære sider (løn, dagpenge, moms, bmi, boliglån, boligstøtte m.fl.)
- [x] Forbedre meta descriptions (inkluder tal/eksempler)
- [x] Internal linking: hver beregner → 5 relaterede
- [x] Blog posts linker til relevante beregnere
  - ✅ **LØST (2026-02-13):** 13+ nye beregner-links tilføjet i 3 blog posts

### Analytics
- [x] Implementer Plausible (analytics.holstjensen.eu)
  - ✅ **LØST (2026-02-13):** Self-hosted Plausible script tilføjet
  - analytics.ts utility med tracking funktioner
  - Integreret i BMI, Procent, Moms beregnere
- [x] Events: beregning_udført, resultat_kopieret, ad_clicked
  - ✅ **LØST (2026-02-13):** Event tracking implementeret med 2s delay
- [x] Goal: beregninger per bruger
  - ✅ **LØST (2026-02-13):** Event tracking implementeret via analytics.ts
  - `beregning_udført` event sendes med calculator prop
  - Goals skal sættes op manuelt i Plausible UI (analytics.holstjensen.eu)
- [ ] Search Console: track keyword rankings

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## 📈 Phase 2: Engagement & Affiliate (Prioritet 2)

### Gem & Del Feature
- [x] URL state encoding for beregninger (share link)
  - ✅ **LØST (2026-02-13):** Implementeret i ProcentBeregner, BMIBeregner, MomsBeregner, LoenBeregner
  - URL parameter ?s= gemmer input-værdier i base64-kodet state
  - Modtagere får præ-udfyldte beregnere når de åbner linket
- [x] "Kopier link" knap på alle beregnere
  - ✅ **LØST (2026-02-13):** "Del beregning" knap synlig under alle 4 beregnere
  - Åbner modal med kopiérbart link
- [x] Social share buttons (Facebook, LinkedIn)
  - ✅ **LØST (2026-02-13):** Twitter, Facebook, Email knapper i share modal
- [x] QR kode for print/deling
  - ✅ **LØST (2026-02-13):** QR-kode generator integreret i share modal

### Affiliate Integration
- [x] Boliglån beregner → boliglån affiliate (Mybanker, etc.)
  - ✅ **LØST (2026-02-13):** AffiliateBox komponent med 4 boliglån-partnere
  - Mybanker (sammenligning), Nordea, Totalkredit, Realkredit Danmark
  - Tydelig "Annonce" label per dansk markedsføringslov
  - Vises efter beregningsresultat for højest konvertering
  - Dark mode support + proper disclosure footer
- [x] Forsikring relaterede → forsikring sammenligning
  - ✅ **LØST (2026-02-13):** BilforsikringAffiliate komponent i BilBeregner
  - 4 partnere: Samlino, Alm. Brand, Topdanmark, Tryg
  - Synlig under tips-sektionen på /bilberegner
- [x] Opsparing beregner → investeringsplatforme
  - ✅ **LØST (2026-02-13):** OpsparingAffiliate komponent i OpsparingsBeregner
  - 3 partnere: Nordnet, Saxo Bank, Lunar
  - Synlig efter beregningsresultat på /opsparing
- [x] Implementer disclosure ("annonce" labels)
  - ✅ **LØST (2026-02-13):** Alle affiliate boxes har "Annonce" label + disclosure footer

### Content Expansion
- [ ] 5 nye blog posts (3/5 færdig):
  - [x] "Sådan beregner du din reelle timeløn"
    - ✅ **LØST (2026-02-13):** /blog/saadan-beregner-du-din-reelle-timeloen
    - 1.300+ ord, FAQ schema, links til timepris/løn-beregnere
  - [x] "Guide: Feriepenge - hvornår og hvor meget"
    - ✅ **LØST (2026-02-13):** /blog/guide-feriepenge-hvornaar-og-hvor-meget
    - 1.400+ ord, FAQ schema, 6 FAQ items
    - Forklaring af samtidighedsferie, ferieåret, beregninger
    - Links til feriepenge, dagpenge, barselsdagpenge beregnere
  - [x] "BMI for børn - sådan tjekker du"
    - ✅ **LØST (2026-02-13):** /blog/bmi-for-boern-saadan-tjekker-du
    - 1.500+ ord, 6 FAQ items med schema markup
    - Forklaring af percentiler vs faste BMI-grænser
    - Aldersbaserede BMI-tabeller for drenge og piger (2-16 år)
    - ISO BMI forklaring og eksempler
    - Links til BMI, kalorier, alder, børnepenge beregnere
  - "Boligstøtte 2026 - nye regler"
  - "Pension: Hvor meget skal du spare op?"
- [ ] Hver post: 1000+ ord, FAQ sektion, relaterede beregnere

### UX Forbedringer
- [x] Dark mode (system preference default)
  - ✅ **LØST (2026-02-13):** ThemeProvider + ThemeToggle implementeret
  - Tre modes: System (auto), Lys, Mørk — cykler via knap i header
  - Persisterer i localStorage, respekterer system preference
  - Alle core komponenter opdateret (layout, forside, header, mobile menu, cookie consent, BMI beregner)
- [ ] Keyboard navigation (tab through inputs)
- [ ] Print-venligt resultat layout
- [ ] Loading states på tunge beregninger
- [ ] Input validation med venlige fejlbeskeder

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## 🔧 Phase 3: Nye Beregnere & Scale (Prioritet 3)

### Høj-værdi Beregnere (affiliate potential)
- [ ] Billån beregner (→ billån affiliate)
- [ ] Forbrugslån beregner (→ lån sammenligning)
- [ ] Ejendomsværdiskat beregner
- [ ] Arveafgift beregner
- [ ] Aktieskat / crypto skat beregner

### Niche Beregnere
- [ ] Elafgift beregner (udvid eksisterende)
- [ ] Varmecheck beregner
- [ ] CO2 udledning beregner
- [ ] Madbudget beregner
- [ ] Bryllup budget beregner

### Technical
- [ ] API for beregnere (monetize B2B)
- [ ] Widget embed kode (gratis, med backlink)
- [ ] Mobile app (React Native wrapper)

### Internationalisering
- [ ] Norsk version (minberegner.no)
- [ ] Svensk version (minberegner.se)
- [ ] Lokaliser skatteregler per land

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## 📝 Notes

**Tech stack:** Next.js 15, TypeScript, Tailwind
**Hosting:** Dokploy
**Mål:** 50.000 månedlige besøgende inden Q4 2026
**AdSense krav:** God UX, unik content, policy compliance
