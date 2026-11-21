import {
  buildDageIAaretMetadata,
  DageIAaretRoute,
} from "@/components/DageIAaret";

const STI = "/dagar-i-aret";

/** Samme grund som den danske route: oversigten følger dagens dato. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageIAaretMetadata(STI, new Date());
}

export default async function DagarIAaretPage() {
  return DageIAaretRoute({ prefix: STI });
}
