import {
  buildDageMellemMetadata,
  DageMellemDatoerRoute,
} from "@/components/DageMellemDatoer";

const STI = "/dage-mellem-datoer";

/**
 * Eksemplet og årets længde regnes af dagens dato, så siden må ikke bygges ind
 * i tal der frosser ved `next build` — samme grund som på `/dage-til` og
 * `/klokken-i`. Derfor står den i sitemap som `daily`.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageMellemMetadata(STI, new Date());
}

export default async function DageMellemDatoerPage() {
  return DageMellemDatoerRoute({ prefix: STI });
}
