// Where the driving-distance cache lives, how long it keeps a coordinate pair, and the sentence
// that tells the user so. The retention constant and the words about it live in ONE module so the
// code and the copy cannot drift apart: `/afstand-mellem-adresser` promised twice — in its prose
// and in the FAQ answer that `FAQSchema` publishes as JSON-LD — that neither address nor route is
// stored, while `rute.ts` has always written the route into memory under a key of the two rounded
// coordinates (about 11 m resolution, so a specific building) from the first successful lookup.
// `/privatlivspolitik` described the retention correctly, so the page was the wrong one of the two.
//
// Pure module, no server code: `rute.ts` reads the constant, the pages read the sentence.

/** How many days `findRute` keeps a route under its coordinate key, counted from the first hit. */
export const RUTE_CACHE_DAGE = 7;

/**
 * The Danish retention sentence, shared by the page prose, its FAQ answer and
 * `/privatlivspolitik`. Both are Danish because `/afstand-mellem-adresser` is
 * `daOnly`, so there is no translation to keep in step.
 *
 * It only says what *is* kept — the route and the two coordinate pairs, under
 * a key of those coordinates — so a caller can state its own "no address is
 * stored" claim right before it without the two sentences contradicting each
 * other.
 *
 * The number comes from {@link RUTE_CACHE_DAGE}, so if the cache is emptied
 * earlier or kept longer the sentence says so — it is not a promise anyone has
 * to remember to update.
 */
export function ruteCacheSætning(): string {
  return (
    `Ruten og de to koordinater gemmes i serverens hukommelse i ` +
    `${RUTE_CACHE_DAGE} dage, så samme opslag ikke skal beregnes to gange.`
  );
}
