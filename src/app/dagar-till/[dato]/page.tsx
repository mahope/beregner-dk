import { buildDageTilMetadata, DageTilRoute } from "@/components/DageTilPage";

const PREFIX = "/dagar-till/";

interface PageProps {
  params: Promise<{ dato: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { dato } = await params;
  return buildDageTilMetadata(PREFIX, decodeURIComponent(dato), new Date());
}

export default async function DagarTillPage({ params }: PageProps) {
  const { dato } = await params;
  return DageTilRoute({ prefix: PREFIX, slug: decodeURIComponent(dato) });
}
