import { ComparisonPanel } from "@/components/comparison/comparison-panel"

interface ComparisonResultsPageProps {
  params: Promise<{
    comparisonId: string
  }>
}

export default async function ComparisonResultsPage({ params }: ComparisonResultsPageProps) {
  const { comparisonId } = await params
  return (
    <div className="h-full w-full bg-zinc-950">
      <ComparisonPanel comparisonId={comparisonId} />
    </div>
  )
}
