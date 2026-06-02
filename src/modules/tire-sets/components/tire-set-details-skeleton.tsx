import { ChevronRight, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import StyledTable from "@/components/ui/styled-table";

function DetailStatTileSkeleton() {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton className="size-3 rounded-sm sm:size-4" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg sm:h-12" />
    </div>
  );
}

export function TireSetDetailsBreadcrumbSkeleton() {
  return (
    <nav
      className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      aria-busy="true"
      aria-hidden
    >
      <Home className="size-4 text-primary-dark" />
      <ChevronRight className="size-4 shrink-0 opacity-60" />
      <Skeleton className="h-4 w-28" />
      <ChevronRight className="size-4 shrink-0 opacity-60" />
      <Skeleton className="h-4 w-36" />
      <ChevronRight className="size-4 shrink-0 opacity-60" />
      <Skeleton className="h-4 w-32" />
    </nav>
  );
}

export function TireSetHeaderSkeleton() {
  return (
    <Card className="rounded-lg border-0 bg-surface-container">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
          <Skeleton className="mx-auto size-12 shrink-0 rounded-full sm:size-16 md:mx-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="h-6 w-[52%] max-w-xs" />
            </div>
            <Skeleton className="mx-auto mb-4 h-4 w-[30%] max-w-[10rem] md:mx-0" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <DetailStatTileSkeleton key={i} />
              ))}
            </div>
          </div>
          <Skeleton className="mx-auto mt-4 h-9 w-full rounded-md sm:w-36 md:mx-0 md:mt-0" />
        </div>
      </CardContent>
    </Card>
  );
}

const individualTiresSkeletonColumns = [
  { header: "Tire #", render: () => null },
  { header: "Unique ID", render: () => null },
  { header: "Position", render: () => null },
  { header: "Status", render: () => null, align: "center" as const },
  { header: "Tread Depth", render: () => null, align: "center" as const },
  { header: "Condition", render: () => null, align: "center" as const },
];

export function TireSetIndividualTiresTableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <StyledTable
        isLoading
        rows={[]}
        keyProp={() => "skeleton"}
        columns={individualTiresSkeletonColumns}
      />
    </div>
  );
}

export function TireSetDetailsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <TireSetDetailsBreadcrumbSkeleton />
      <TireSetHeaderSkeleton />
      <TireSetIndividualTiresTableSkeleton />
    </div>
  );
}
