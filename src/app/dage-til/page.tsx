import { buildDageTilHubMetadata, DageTilHubRoute } from "@/components/DageTilHub";

const HUB = "/dage-til";

export async function generateMetadata() {
  return buildDageTilHubMetadata(HUB, new Date());
}

export default async function DageTilHubPage() {
  return DageTilHubRoute({ prefix: HUB });
}
