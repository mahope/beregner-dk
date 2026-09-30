/**
 * Fjern kommentarer uden at flytte en eneste linje.
 *
 * Portene i denne mappe læser hele `src/` som tekst og leder efter en *form* —
 * en kæde der vælger en `Intl`-tag, et ur der læser dagen. Kommentarer er det
 * naturlige sted at *diskutere* den form, så en port der ikke fjerner dem
 * markerer sin egen docblock. Og stripningen skal være en scanner med tilstand,
 * ikke to regexer: det er præcis den fejl, review 1/10 fandt i
 * `intl-locale-tag`-porten.
 *
 * 1. Blokkommentarer må ikke tømmes *før* linjekommentarer:
 *    `dato/page.tsx:30` er `// … \`/dage-til/*\`-siderne …`, så det `/*` åbner
 *    en "blokkommentar" helt til næste blokslut og tømmer 13 linjer rigtig kode
 *    (`:39-51`, hele `dageTilLinks`-blokken). Porten bliver så blind for præcis
 *    den fejlklasse den skal fange.
 * 2. Omvendt spiser reglen for `*`-fortsættelse blokkens afsluttende `*/`-linje,
 *    så `/**` bliver stående hængende og parrer sig med næste `/*` i filen.
 *
 * Derfor holder denne scanner rede på om den står i en linjekommentar, en
 * blokkommentar eller en streng, og rører ingen af de tre. Strenge *beholdes* —
 * de er kode, så et `/*` i en URL eller et glob-mønster i `"/dage-til/*"` ikke
 * kan åbne en kommentar. Mellemrum holdes i stedet for at slettes, så
 * **linjenumrene stadig passer** efter stripningen.
 */
export function stripKommentarer(kilde: string): string {
  let ud = "";
  let i = 0;
  const n = kilde.length;
  while (i < n) {
    const to = kilde.slice(i, i + 2);
    if (to === "//") {
      const nyeLinje = kilde.indexOf("\n", i);
      const stop = nyeLinje === -1 ? n : nyeLinje;
      ud += kilde.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (to === "/*") {
      const slut = kilde.indexOf("*/", i + 2);
      const stop = slut === -1 ? n : slut + 2;
      ud += kilde.slice(i, stop).replace(/[^\n]/g, " ");
      i = stop;
    } else if (kilde[i] === '"' || kilde[i] === "'" || kilde[i] === "`") {
      const citat = kilde[i];
      const start = i;
      i += 1;
      while (i < n && kilde[i] !== citat) i += kilde[i] === "\\" ? 2 : 1;
      i = Math.min(i + 1, n);
      ud += kilde.slice(start, i);
    } else {
      ud += kilde[i];
      i += 1;
    }
  }
  return ud;
}

/** 1-baseret linjenummer for et indeks i den *ustrippede* tekst. */
export function linjeNummer(kode: string, indeks: number): number {
  return kode.slice(0, indeks).split("\n").length;
}
