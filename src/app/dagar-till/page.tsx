import { buildDageTilHubMetadata, DageTilHubRoute } from "@/components/DageTilHub";

const HUB = "/dagar-till";

export async function generateMetadata() {
  return buildDageTilHubMetadata(HUB, new Date());
}

export default async function DagarTillHubPage() {
  return DageTilHubRoute({ prefix: HUB });
}
