import {
  buildDageIAaretMetadata,
  DageIAaretRoute,
} from "@/components/DageIAaret";

const STI = "/dage-i-aaret";

/**
 * Oversigten og «dage tilbage» regnes af dagens dato, så siden må ikke bygges
 * ind i tal der frosser ved `next build` — samme grund som på `/dage-til` og
 * `/dage-mellem-datoer`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageIAaretMetadata(STI, new Date());
}

export default async function DageIAaretPage() {
  return DageIAaretRoute({ prefix: STI });
}
