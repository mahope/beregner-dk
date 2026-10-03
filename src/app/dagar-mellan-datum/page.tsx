import {
  buildDageMellemMetadata,
  DageMellemDatoerRoute,
} from "@/components/DageMellemDatoer";

const STI = "/dagar-mellan-datum";

/** Samme grund som den danske route: eksemplet følger dagens dato. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageMellemMetadata(STI, new Date());
}

export default async function DagarMellanDatumPage() {
  return DageMellemDatoerRoute({ prefix: STI });
}
