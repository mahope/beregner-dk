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
| `src/lib/moms-cvr.ts` | Flag, CVR validation, client IP and prefix, mail domain, request builder, answer parser |
| `src/lib/cvrradar-klient.ts` | HTTP client for cvrradar without browser headers |
| `src/lib/momsfrister.ts` | Period names, cvrradar deadlines to dates, `.ics` |
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
{ "tilgaengelig": false }                       // no key, cvrradar down/refused or odd answer
{ "tilgaengelig": true, "fundet": false }       // unknown CVR (cvrradar 404)
{ "tilgaengelig": true, "fundet": true, "selskab": false, "cvr": "12345678" }  // ENK, PMV, I/S ...: nothing else
{
  "tilgaengelig": true, "fundet": true, "cvr": "39413892",
  "selskab": true, "navn": "Mahope ApS", "aktiv": true,
  "momsregistreret": "ja",                      // "ja" | "nej" | "ukendt" (VIES)
  "momsperiode": "halvaar",                     // "maaned" | "kvartal" | "halvaar" | null (estimate)
  "grundlag": "omsaetning",                     // "omsaetning" | "bruttofortjeneste" | "ny_virksomhed" | "ukendt"
  "regnskabsaar": "2025",                       // or null
  "frister": [{ "fra": "2026-07-01", "til": "2026-12-31", "frist": "2027-03-01" }],
  "gemt": false                                 // cvrradar stored an observation; always false without consent
}
```

Other statuses: 404 (flag off or non-Danish host), 403 (cross-site `Sec-Fetch-Site`),
429 (more than 20 lookups per minute from one /24 or /48 network).

### Client IP

minberegner.dk is behind Cloudflare. The IP is read from `CF-Connecting-IP`, which
Cloudflare always overwrites with the address it saw. `X-Forwarded-For` is never used:
Cloudflare keeps whatever the browser sent there and only appends, so its first entry can
be forged. That would tie someone else's network to a CVR and get around the rate limit.
A value with a comma or space is refused. `MOMS_CVR_IP_HEADER` can name another
single-value header if the proxy setup changes. Remaining assumption: the origin is only
reachable through Cloudflare; a request sent straight to the origin could set the header
itself. Without the header there is no prefix (nothing is learned), and such requests
share one rate-limit bucket.

## Server -> cvrradar

The contract is cvrradar's: `mahope/cvr`, branch `feat/beregner-cvr`, `src/beregner/web.ts`
and the README section "minberegner.dk's CVR field". Change both sides together.

`POST https://cvrradar.dk/v1/intern/beregner` (override with `CVRRADAR_BEREGNER_URL` for
local tests). cvrradar needs `BESOEGSRADAR_BEREGNER=1` (else 404) and learns only with
`BESOEGSRADAR=1` as well.

Headers: `Authorization: Bearer <CVRRADAR_BEREGNER_NOEGLE>` (at least 32 characters on
cvrradar's side), `Content-Type: application/json`. Nothing that looks like a browser:
cvrradar answers 403 to `Origin`, any `Sec-Fetch-*` or `Cookie`. Node's `fetch` always adds
`Sec-Fetch-Mode: cors`, so the call goes through `node:http(s)` in
`src/lib/cvrradar-klient.ts`.

Request body (max 4 KB):

```jsonc
{
  "cvr": "39413892",
  "samtykke": "cvrradar-kunder",   // box ticked; otherwise "none"
  "eget": true,                    // visitor says it is their company (same checkbox)
  "ip_praefiks": "81.7.12.0/24",   // only with consent; public /24 IPv4 or /48 IPv6, e.g. "2a01:4f8:c17::/48"
  "maildomaene": "firma.dk"        // only with consent and only if a mail was given; never the local part
}
```

The checkbox text covers our own sites and cvrradar.dk's services to companies, so a tick
maps to cvrradar's widest scope, `cvrradar-kunder` (the other is `egne-sites`).
cvrradar answers 400 to private, CGNAT and documentation nets (192.0.0.0/16,
198.18.0.0/15, 2001:db8::/32); `ipPrefiks` returns null for all of them, so they are never sent.

Response (200; 404 = unknown CVR):

```jsonc
// company (ApS, A/S, P/S ...)
{
  "cvr": "39413892", "selskab": true, "navn": "Mahope ApS", "aktiv": true,
  "moms": {
    "registreret": "ja", "periode": "halvaar", "grundlag": "omsaetning", "regnskabsaar": "2025",
    "frister": [{ "fra": "2026-07-01", "til": "2026-12-31", "frist": "2027-03-01" }],  // next three, bank days
    "vejledende": true
  },
  "observation": { "gemt": true }
}
// not a company (ENK, PMV, I/S, K/S, estates): nothing about persons
{ "cvr": "12345678", "selskab": false, "observation": { "gemt": false }, "besked": "..." }
```

minberegner whitelists these fields (`parseCvrradarSvar`) and drops everything else. For a
non-company it keeps only `selskab: false`, even if a name came along.

`observation.gemt` means cvrradar stored an observation of the network, not that it has
learned it: learning needs one more confirmation (RIPE match, mail domain, or a second day).
The UI therefore says "Vi har noteret, at besøget kom fra jeres netværk", not that the network
is now recognised.

## VAT period and deadlines

Both come from cvrradar (`moms.periode`, `moms.grundlag`, `moms.frister`). minberegner does
not calculate them itself, so the page and the `.ics` file always match cvrradar. The period is
an estimate (`vejledende`), shown as such; with no period there are no deadlines and the UI
points to TastSelv Erhverv. `src/lib/momsfrister.ts` only names the periods and builds the
`.ics` file.

## Withdrawal

The consent text links to `/privatlivspolitik#cvr`, which links to the withdrawal page
"Slet vores virksomheds netværk" at `https://cvrradar.dk/slet-netvaerk`
(`CVRRADAR_TILBAGETRAEK_URL` in `src/lib/moms-cvr.ts`; matches cvrradar's `SLET_STI`).

## Environment

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_MOMS_CVR` | build | `1` turns the feature on (default off) |
| `CVRRADAR_BEREGNER_NOEGLE` | runtime, secret | Bearer key for cvrradar (same value as cvrradar's `BEREGNER_NOEGLE`); missing = panel says "kan ikke hente" |
| `CVRRADAR_BEREGNER_URL` | runtime, optional | Override endpoint (tests/staging) |
| `MOMS_CVR_IP_HEADER` | runtime, optional | Header with the client IP; default `cf-connecting-ip` |
