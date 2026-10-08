import {
  buildUgerIAaretMetadata,
  UgerIAaretRoute,
} from "@/components/UgerIAaret";

const STI = "/uger-i-aret";

/**
 * Ugerne og «uger tilbage» regnes af dagens dato, så siden må ikke bygges ind
 * i tal der frosser ved `next build` — samme grund som på `/dage-i-aaret`,
 * `/timer-i-aret` og `/arbejdsdage`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildUgerIAaretMetadata(STI, new Date());
}

export default async function UgerIAaretPage() {
  return UgerIAaretRoute({ prefix: STI });
}
