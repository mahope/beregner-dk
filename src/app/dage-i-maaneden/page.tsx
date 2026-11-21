import {
  buildDageIManedenMetadata,
  DageIManedenRoute,
} from "@/components/DageIManeden";

const STI = "/dage-i-maaneden";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageIManedenMetadata(STI, new Date());
}

export default async function DageIManedenPage() {
  return DageIManedenRoute({ prefix: STI });
}
