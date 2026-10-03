import {
  buildTimerIAaretMetadata,
  TimerIAaretRoute,
} from "@/components/TimerIAaret";

const STI = "/timmar-i-aret";

/**
 * Samme grund som den danske route: timetallet følger dagens dato, så siden må
 * ikke prerenderes med tal der frosser ved `next build`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildTimerIAaretMetadata(STI, new Date());
}

export default async function TimmarIAaretPage() {
  return TimerIAaretRoute({ prefix: STI });
}