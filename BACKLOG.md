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
- [ ] Blog posts linker til relevante beregnere

### Analytics
- [ ] Implementer Plausible (analytics.holstjensen.eu)
- [ ] Events: beregning_udført, resultat_kopieret, ad_clicked
- [ ] Goal: beregninger per bruger
- [ ] Search Console: track keyword rankings

---

## 🎯 UI/UX Princip
**Alle features SKAL være synlige og tilgængelige for brugeren!**
- Backend-funktionalitet → tilføj også UI (knap, menu, side)
- Ingen "skjulte" features — brugeren skal kunne finde og bruge det
- Test at UI er responsiv og intuitiv


## 📈 Phase 2: Engagement & Affiliate (Prioritet 2)

### Gem & Del Feature
- [ ] URL state encoding for beregninger (share link)
- [ ] "Kopier link" knap på alle beregnere
- [ ] Social share buttons (Facebook, LinkedIn)
- [ ] QR kode for print/deling

### Affiliate Integration
- [ ] Boliglån beregner → boliglån affiliate (Mybanker, etc.)
- [ ] Forsikring relaterede → forsikring sammenligning
- [ ] Opsparing beregner → investeringsplatforme
- [ ] Implementer disclosure ("annonce" labels)

### Content Expansion
- [ ] 5 nye blog posts:
  - "Sådan beregner du din reelle timeløn"
  - "Guide: Feriepenge - hvornår og hvor meget"
  - "BMI for børn - sådan tjekker du"
  - "Boligstøtte 2026 - nye regler"
  - "Pension: Hvor meget skal du spare op?"
- [ ] Hver post: 1000+ ord, FAQ sektion, relaterede beregnere

### UX Forbedringer
- [ ] Dark mode (system preference default)
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

<!-- auto-45m 2026-02-13 00:45 -->
- [ ] [auto-45m] Implementer SEO schema (JSON-LD) for 2 beregnere med test
- [ ] [auto-45m] Tilfoej relaterede beregnere paa 3 sider (InternalLinks)
- [ ] [auto-45m] Skriv 1 how-to stub (200 ord) til prioriteret emne
