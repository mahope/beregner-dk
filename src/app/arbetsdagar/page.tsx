import {
  buildArbejdsdageMetadata,
  ArbejdsdageRoute,
} from "@/components/Arbejdsdage";

const STI = "/arbetsdagar";

/** Samme grund som den danske route: tallene følger dagens dato. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildArbejdsdageMetadata(STI, new Date());
}

export default async function ArbetsdagarPage() {
  return ArbejdsdageRoute({ prefix: STI });
}
