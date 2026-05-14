import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4">
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}
