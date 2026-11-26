# CVR field on /moms ("Din virksomhed")

An optional field under the VAT calculator on minberegner.dk/moms. A visitor enters a
CVR number and sees VAT status, VAT period and the next VAT deadlines, with an `.ics`
download. An unticked consent checkbox ("samtykke til begge") lets the visitor allow
cvrradar to recognise the company's network.

- Danish site only (minberegner.dk; the `localhost` dev config is also Danish). Never on
  beraknare.se or beregner.no, never in `/embed/moms`.
- Behind `NEXT_PUBLIC_MOMS_CVR` (`1`/`true` = on, default off). It is a `NEXT_PUBLIC_`
  variable, so it is inlined at **build time**: set it as a build arg/env in Dokploy and
  rebuild. Off hides the panel, the privacy section and makes `/api/cvr` answer 404.
- No cookies, no local storage, no analytics events with the CVR.
- Nothing about persons: the server whitelists company fields from cvrradar's answer.

## Files

| File | Role |
| --- | --- |
| `src/components/MomsCvrPanel.tsx` | Client form, consent checkbox, result, `.ics` download |
| `src/app/api/cvr/route.ts` | Server route; holds the secret key and talks to cvrradar |
| `src/lib/moms-cvr.ts` | Flag, CVR validation, IP prefix, mail domain, request builder, answer parser |
| `src/lib/momsfrister.ts` | VAT period from turnover, deadlines (bank-day adjusted), `.ics` |
| `src/app/privatlivspolitik/page.tsx` | Section `#cvr` (shown with the flag on) |

## Browser -> `/api/cvr`

`POST /api/cvr`, JSON:

```json
{ "cvr": "39413892", "samtykke": false }
```

- `cvr`: 8 digits, must pass the modulus-11 check, else 400 and no upstream call.
- `samtykke`: only the boolean `true` counts as consent.
- `mail` (optional, not sent by the UI today): reduced to its domain on the server and only
  forwarded with consent.

Answers (always `Cache-Control: no-store`):

```jsonc
{ "tilgaengelig": false }                       // no key, cvrradar down or odd answer
{ "tilgaengelig": true, "fundet": false }       // unknown CVR
{
  "tilgaengelig": true, "fundet": true,
  "cvr": "39413892", "navn": "Mahope",
  "momsregistreret": true,                      // true | false | null (unknown)
  "momsperiode": "halvaar",                     // "maaned" | "kvartal" | "halvaar"
  "momsperiodeKilde": "omsaetning",             // "cvrradar" | "omsaetning" | "standard"
  "omsaetning": 800000,                         // DKK or null
  "laert": false                                // true only with consent and upstream confirmation
}
```

Other statuses: 404 (flag off or non-Danish host), 403 (cross-site `Sec-Fetch-Site`),
429 (more than 20 lookups per minute from one /24 or /48 network).

## Server -> cvrradar (proposed contract)

The cvrradar side (`mahope/cvr`, branch `feat/beregner-cvr`) was not pushed when this was
built, so this is the contract minberegner expects. Keep it small; change both sides together.

`POST https://cvrradar.dk/v1/intern/beregner` (override with `CVRRADAR_BEREGNER_URL` for
local tests)

Headers: `Authorization: Bearer <CVRRADAR_BEREGNER_NOEGLE>`, `Content-Type: application/json`.

Request body:

```jsonc
{
  "cvr": "39413892",
  "kilde": "minberegner.dk/moms",
  "samtykke": "begge",          // "begge" (box ticked) | "ingen"
  "eget": true,                 // visitor says it is their company (same checkbox)
  "ipPrefiks": "81.7.12.0/24",  // only with consent; /24 IPv4 or /48 IPv6, e.g. "2a01:4f8:c17::/48"
  "mailDomaene": "firma.dk"     // only with consent and only if a mail was given; never the local part
}
```

Rules for cvrradar:

- Learn (store prefix -> CVR) only when `samtykke === "begge"` and `ipPrefiks` is present.
  Store the prefix, CVR, consent time and last-visit time; delete 30 days after last visit.
- Without consent the request has no `ipPrefiks`/`mailDomaene`; treat it as a plain lookup.
- Private, loopback and link-local addresses never produce a prefix.

Response body (200; 404 = unknown CVR):

```jsonc
{
  "fundet": true,
  "navn": "Mahope",
  "momsregistreret": true,      // boolean or null
  "omsaetning": 800000,         // latest annual turnover in DKK, or null
  "momsperiode": null,          // optional override: "maaned" | "kvartal" | "halvaar"
  "laert": true                 // true when the prefix was stored
}
```

Any other field (owners, directors, persons) is ignored by minberegner.

## VAT rules used

- Period from annual turnover: over 50 mio. kr. month, 5-50 mio. kr. quarter, under 5
  mio. kr. half year; unknown turnover gives half year (start rule).
- Deadlines: month = 25th of the following month (June: 17 August); quarter = 1 June,
  1 September, 1 December, 1 March; half year = 1 September, 1 March. Moved to the next
  bank day (weekends, holidays, 5 June, 24 and 31 December, Friday after Ascension).

## Withdrawal

The consent text links to `/privatlivspolitik#cvr`, which links to the withdrawal page
"Slet vores virksomheds netværk" at `https://cvrradar.dk/slet-netvaerk`
(`CVRRADAR_TILBAGETRAEK_URL` in `src/lib/moms-cvr.ts`; align with the cvr branch).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_MOMS_CVR` | build | `1` turns the feature on (default off) |
| `CVRRADAR_BEREGNER_NOEGLE` | runtime, secret | Bearer key for cvrradar; missing = panel says "kan ikke hente" |
| `CVRRADAR_BEREGNER_URL` | runtime, optional | Override endpoint (tests/staging) |
