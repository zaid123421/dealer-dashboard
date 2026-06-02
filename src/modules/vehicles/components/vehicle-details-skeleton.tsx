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

export function VehicleDetailsBreadcrumbSkeleton() {
  return (
    <nav
      className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
      aria-busy="true"
      aria-hidden
    >
      <Home className="size-4 text-primary-dark" />
      <ChevronRight className="size-4" />
      <Skeleton className="h-4 w-28" />
      <ChevronRight className="size-4" />
      <Skeleton className="h-4 w-36" />
    </nav>
  );
}

export function VehicleDetailsCardSkeleton() {
  return (
    <Card className="rounded-lg border-0 bg-surface-container">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
          <Skeleton className="mx-auto size-12 shrink-0 rounded-full sm:size-16 md:mx-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-4 space-y-2 text-center md:text-left">
              <Skeleton className="mx-auto h-6 w-[55%] max-w-xs md:mx-0" />
              <Skeleton className="mx-auto h-4 w-[38%] max-w-[12rem] md:mx-0" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
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

const tireSetTableSkeletonColumns = [
  { header: "Set ID", render: () => null, align: "center" as const },
  { header: "Brand", render: () => null, align: "center" as const },
  { header: "Tire Size", render: () => null, align: "center" as const },
  { header: "Season", render: () => null, align: "center" as const },
  { header: "Tire Count", render: () => null, align: "center" as const },
  { header: "Display Label", render: () => null, align: "center" as const },
  { header: "Date Added", render: () => null, align: "center" as const },
  { header: "Actions", render: () => null, align: "center" as const, className: "min-w-[220px]" },
];

export function VehicleTireSetsSectionSkeleton() {
  return (
    <div className="mt-8 min-w-0" aria-busy="true" aria-live="polite">
      <Skeleton className="mb-6 h-6 w-28" />
      <StyledTable
        isLoading
        rows={[]}
        keyProp={() => "skeleton"}
        columns={tireSetTableSkeletonColumns}
      />
    </div>
  );
}

export function VehicleDetailsPageSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <VehicleDetailsBreadcrumbSkeleton />
      <VehicleDetailsCardSkeleton />
      <VehicleTireSetsSectionSkeleton />
    </div>
  );
}
