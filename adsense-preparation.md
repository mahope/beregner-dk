# AdSense Godkendelse - Forberedelse og Næste Skridt

## Hvad der er gjort

### Compliance Check ✅

Siden er allerede fuldt compliant med AdSense policies:

| Krav | Status | Kommentar |
|------|--------|-----------|
| **Privatlivspolitik** | ✅ | `/privatlivspolitik` - Omfattende privatlivspolitik |
| **Cookiepolitik** | ✅ | `/cookiepolitik` - Dokumenterer cookie-brug |
| **Kontaktinfo** | ✅ | `/om` side med `kontakt@minberegner.dk` |
| **Ingen thin content** | ✅ | Alle 20+ beregnere har substantielt indhold |
| **Proper navigation** | ✅ | Header, footer, breadcrumbs, relaterede links |
| **Ingen tracking scripts** | ✅ | Kun Plausible (cookie-fri) analytics |
| **FAQ sektioner** | ✅ | Alle sider har detaljerede FAQ |
| **Structured Data** | ✅ | FAQSchema, CalculatorSchema, BreadcrumbSchema |

### Build Verifikation ✅

```
npm run build
✓ Compiled successfully
✓ Generating static pages (48/48)
✓ Build completed successfully
```

### Commit & Push ✅

```
feat(adsense): AdSense compliance og ansøgning forberedelse
- Site har alle nødvendige compliance elementer
- Bygget og verificeret med npm run build
- Klar til AdSense ansøgning
```

---

## Næste Skridt for Mads

### 1. Opret AdSense Konto (eller log ind)

Gå til: **https://www.google.com/adsense**

Hvis du ikke har en AdSense konto:
- Klik "Kom i gang" eller "Sign up"
- Log ind med din Google konto (mads@mahope.dk eller personlig Gmail)

### 2. Tilføj Site

1. I AdSense dashboard, klik **"+ Tilføj site"** eller **"Add site"**
2. Indtast: `minberegner.dk`
3. Klik **"Indsend"**

### 3. Vent på Review

**Vigtigt:** Google gennemgår manuelt og det kan tage **1-4 uger** (nogle gange længere).

Google checker:
- ✅ At siden overholder deres politikker
- ✅ At der er nok indhold (tyndt indhold = afvisning)
- ✅ At der er korrekte sider (privatliv, kontakt)
- ✅ At siden er tilgængelig og fungerer

### 4. Hvis Afvist

Hvis ansøgningen afvises, vil Google sende en e-mail med årsagen. Typiske årsager:

| Årsag | Løsning |
|-------|---------|
| Thin content | Tilføj mere content/blog posts |
| Manglende privatlivspolitik | Allerede på plads ✅ |
| Ingen kontaktinfo | Allerede på plads ✅ |
| For mange ads scripts | Fjern andre annonceudbydere først |

### 5. Når Godkendt

Når du modtager godkendelses-e-mail:

1. Log ind på AdSense
2. Kopier dit **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
3. Tilføj det i `src/app/layout.tsx` (fjern kommentar fra AdSense script):
   ```tsx
   <script
     async
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-DIT_ID_HER"
     crossOrigin="anonymous"
   />
   ```
4. Deploy den nye version

---

## Aktivering af AdSense Script

Når du har fået dit Publisher ID, skal du redigere:

**Fil:** `src/app/layout.tsx`

```tsx
// FØR (kommenteret ud):
{/* <script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossOrigin="anonymous"
/> */}

// EFTER (aktiveret):
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-DIT_ACTUELLE_ID"
  crossOrigin="anonymous"
/>
```

Derefter:
1. Commit ændringen: `git add -A && git commit -m "feat(adsense): activate publisher ID"`
2. Push: `git push origin master`
3. Deploy til produktion

---

## Kontakt

Ved spørgsmål om AdSense processen:
- 📧 E-mail: `kontakt@minberegner.dk`
- 📖 AdSense Hjælp: https://support.google.com/adsense

---

**Dokument opdateret:** Februar 2026
