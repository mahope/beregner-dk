/**
 * Compare the unit price ("enhedspris" / "jämförpris") of two products.
 *
 * Each product has a total price and a quantity in the same unit (e.g. kg,
 * litre, pieces). The unit price is price / quantity; the cheaper product is
 * the one with the lower unit price. The saving is expressed as a percentage
 * relative to the more expensive product.
 */

export type Billigst = "A" | "B" | "lige";

export interface EnhedsprisResultat {
  enhedsprisA: number;
  enhedsprisB: number;
  billigst: Billigst;
  besparelseProcent: number;
}

export function sammenlignEnhedspris(
  prisA: number,
  maengdeA: number,
  prisB: number,
  maengdeB: number
): EnhedsprisResultat | null {
  if (
    prisA < 0 || prisB < 0 ||
    !maengdeA || maengdeA <= 0 ||
    !maengdeB || maengdeB <= 0
  ) return null;

  const enhedsprisA = prisA / maengdeA;
  const enhedsprisB = prisB / maengdeB;

  let billigst: Billigst;
  let besparelseProcent = 0;

  if (Math.abs(enhedsprisA - enhedsprisB) < 1e-9) {
    billigst = "lige";
  } else if (enhedsprisA < enhedsprisB) {
    billigst = "A";
    besparelseProcent = ((enhedsprisB - enhedsprisA) / enhedsprisB) * 100;
  } else {
    billigst = "B";
    besparelseProcent = ((enhedsprisA - enhedsprisB) / enhedsprisA) * 100;
  }

  return {
    enhedsprisA,
    enhedsprisB,
    billigst,
    besparelseProcent,
  };
}
