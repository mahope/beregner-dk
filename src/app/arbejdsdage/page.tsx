import {
  buildArbejdsdageMetadata,
  ArbejdsdageRoute,
} from "@/components/Arbejdsdage";

const STI = "/arbejdsdage";

/**
 * Arbejdsdagene og «arbejdsdage tilbage» regnes af dagens dato, så siden må
 * ikke bygges ind i tal der frosser ved `next build` — samme grund som på
 * `/dage-i-aaret` og `/dage-til`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildArbejdsdageMetadata(STI, new Date());
}

export default async function ArbejdsdagePage() {
  return ArbejdsdageRoute({ prefix: STI });
}
