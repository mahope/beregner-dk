import {
  buildDageIManedenMetadata,
  DageIManedenRoute,
} from "@/components/DageIManeden";

const STI = "/dagar-i-manaden";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildDageIManedenMetadata(STI, new Date());
}

export default async function DagarIManadenPage() {
  return DageIManedenRoute({ prefix: STI });
}
