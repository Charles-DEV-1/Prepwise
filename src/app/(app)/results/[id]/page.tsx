import { ResultsPage } from "@/features/results/results-page";

export default async function ResultsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultsPage id={id} />;
}
