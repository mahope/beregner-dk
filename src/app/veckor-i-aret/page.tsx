import {
  buildUgerIAaretMetadata,
  UgerIAaretRoute,
} from "@/components/UgerIAaret";

const STI = "/veckor-i-aret";

/** Samme grund som den danske route: tallene følger dagens dato. */
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildUgerIAaretMetadata(STI, new Date());
}

export default async function VeckorIAaretPage() {
  return UgerIAaretRoute({ prefix: STI });
}
