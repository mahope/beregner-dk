import {
  buildDageTilbageIAaretMetadata,
  DageTilbageIAaretRoute,
} from "@/components/DageTilbageIAaret";

const STI = "/dage-tilbage-i-aaret";

/**
 * Nedtællingen regnes af dagens dato, så siden må ikke bygges ind i tal der
 * frosser ved `next build` — samme grund som på `/dage-til`, `/dato`,
 * `/dage-i-aaret` og `/dage-mellem-datoer`. Derfor står den i sitemap som
 * `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageTilbageIAaretMetadata(STI, new Date());
}

export default async function DageTilbageIAaretPage() {
  return DageTilbageIAaretRoute({ prefix: STI });
}
