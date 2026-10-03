import {
  buildTimerIAaretMetadata,
  TimerIAaretRoute,
} from "@/components/TimerIAaret";

const STI = "/timer-i-aret";

/**
 * Oversigten og «timer tilbage» regnes af dagens dato, så siden må ikke bygges
 * ind i tal der frosser ved `next build` — samme grund som på `/dage-til` og
 * `/dage-mellem-datoer`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildTimerIAaretMetadata(STI, new Date());
}

export default async function TimerIAaretPage() {
  return TimerIAaretRoute({ prefix: STI });
}