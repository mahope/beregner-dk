import {
  buildDageTilbageIAaretMetadata,
  DageTilbageIAaretRoute,
} from "@/components/DageTilbageIAaret";

const STI = "/dagar-kvar-i-aret";

/** Se `/dage-tilbage-i-aaret/page.tsx` — nedtællingen følger dagens dato. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageTilbageIAaretMetadata(STI, new Date());
}

export default async function DagarKvarIAretPage() {
  return DageTilbageIAaretRoute({ prefix: STI });
}
