/**
 * Læsning og skrivning af kalenderdatoer som "YYYY-MM-DD".
 *
 * `new Date("1990-03-15")` tolteres som UTC-midnat, og `toISOString()` skriver
 * den tilbage i UTC. Begge dele flytter dagen for en læser i en tidszone der
 * ikke er UTC: en dansk standarddato kl. 01.00 bliver til *i går*, og en
 * fødselsdato læst bag UTC bliver dagen i går. Derfor bygger denne funktion
 * datoen af kalenderfelterne, så dagen kun afhænger af den dato, læseren har
 * indtastet.
 */

/** "YYYY-MM-DD" bygget af kalenderfelterne, så tidszonen ikke flytter dagen. */
export function tilIsoDato(dato: Date): string {
  const aar = String(dato.getFullYear()).padStart(4, "0");
  const maaned = String(dato.getMonth() + 1).padStart(2, "0");
  const dag = String(dato.getDate()).padStart(2, "0");
  return `${aar}-${maaned}-${dag}`;
}

/**
 * Læser "YYYY-MM-DD" som dato i lokal tid. Tomme, forkorte og umulige
 * værdier (31. februar) returneres som `null` frem for at rulle over i næste
 * måned, så et afklaret felt ikke viser en stille forkert dato.
 */
export function parseIsoDato(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const aar = Number(match[1]);
  const maaned = Number(match[2]);
  const dag = Number(match[3]);
  if (maaned < 1 || maaned > 12 || dag < 1 || dag > 31) return null;
  const dato = new Date(aar, maaned - 1, dag);
  if (
    dato.getFullYear() !== aar ||
    dato.getMonth() !== maaned - 1 ||
    dato.getDate() !== dag
  ) {
    return null;
  }
  return dato;
}

/**
 * Flytter en dato et antal kalendermåneder frem eller tilbage. En dato der
 * ikke findes i måneden (31. januar plus én måned) lander på månedens sidste
 * dag, så januar ikke springer til 3. marts.
 */
export function plusIsoMaaneder(iso: string, maaneder: number): string | null {
  const dato = parseIsoDato(iso);
  if (!dato) return null;
  const dag = dato.getDate();
  const maaned = dato.getMonth() + maaneder;
  const foerste = new Date(dato.getFullYear(), maaned, 1);
  const sidsteILaengden = new Date(
    foerste.getFullYear(),
    foerste.getMonth() + 1,
    0
  ).getDate();
  return tilIsoDato(
    new Date(foerste.getFullYear(), foerste.getMonth(), Math.min(dag, sidsteILaengden))
  );
}
