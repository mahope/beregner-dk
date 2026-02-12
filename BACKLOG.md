# Minberegner.dk — Backlog

## Completed
- [x] 25+ beregnere implementeret og live
- [x] Blog med how-to guides
- [x] SEO skabelon (src/lib/seo.ts)
- [x] InternalLinks component
- [x] Cookie consent
- [x] Responsive design
- [x] Sitemap

## Eksisterende Beregnere
Løn efter skat, Dagpenge, Moms, BMI, Procent, Boliglån, Husleje, Boligstøtte, 
Rente, Pension, SU, Efterløn, Barselsdagpenge, Børnepenge, Rentefradrag, 
Feriepenge, Valuta, Tidszone, Alder, Opsparing, Bil/brændstof, Kalorier, 
Kvadratmeter, Timepris, Dato/tid

## In Progress / To Do

### Fix Build Issues (Prioritet 1)
- [ ] Fix FAQ og RelatedCalculators exports (navngivne exports)
- [ ] Verificer alle imports matcher eksisterende komponenter
- [ ] Kør fuld build og fix eventuelle fejl
- [ ] Deploy og verificer alle sider virker

### SEO & Content (Prioritet 2)
- [ ] Tilføj JSON-LD schema til hver beregner (Calculator type)
- [ ] Skriv 3 flere how-to blog posts
- [ ] Forbedre meta descriptions på alle sider
- [ ] Tilføj FAQ sektion til populære beregnere

### Gem & Del (Prioritet 3)
- [ ] Implementer URL state for beregninger (src/lib/calculation-state.ts exists)
- [ ] Tilføj "Kopier link" knap
- [ ] Social share buttons (FB, Twitter, LinkedIn)
- [ ] QR kode generator for deling

### UX Forbedringer
- [ ] Dark mode toggle (system preference default)
- [ ] Keyboard navigation forbedringer
- [ ] Print-venligt layout for resultater
- [ ] Loading states på tunge beregninger

### Analytics
- [ ] Implementer Plausible (analytics.holstjensen.eu)
- [ ] Event tracking: beregning_udført, resultat_kopieret, delt
- [ ] A/B test forskellige CTA placeringer

### Nye Beregnere (Lower Priority)
- [ ] Elafgift beregner (allerede delvist: Elberegner.tsx)
- [ ] Arveafgift beregner
- [ ] Aktieskat beregner
- [ ] Crypto skat beregner
