# Lokaliseringsplan

Fase 1 (.dk):
- Dansk copy som kilde (da-DK)
- Enhedskonvertering, skatte-satser m.v. for DK

Fase 2 (.no / .se):
- Struktur for locale-specifik logik (satser, helligdage)
- Separate content-filer pr. sprog: `locales/no`, `locales/se`
- Canonicals/hreflang mellem domæner

Teknik:
- Next.js i18n routing (`/da`, `/no`, `/se`) eller separate domains
- `locales/` mappe med JSON for tekster + satser
- Feature flags: aktiver kun beregnere som er verificeret for landet

Checkliste før go-live i nyt land:
- [ ] Juridisk/ansvarsfraskrivelse valideret
- [ ] Skatte-/satstabeller verificeret af kilde
- [ ] SEO: titles, meta, schema på lokalt sprog
- [ ] Tracking-mål gennemtestet
