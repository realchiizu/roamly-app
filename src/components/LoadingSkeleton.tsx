import { Skeleton } from "@/components/ui/skeleton";

export const TripCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden">
    <Skeleton className="w-full h-[220px]" />
  </div>
);

export const TripDetailSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Skeleton className="w-full h-[45vh]" />
    <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-4">
      <Skeleton className="w-full h-20 rounded-2xl" />
      <div className="mt-8 space-y-4">
        <Skeleton className="w-full h-12 rounded-2xl" />
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-3/4 h-32 rounded-2xl" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
    <div className="mb-10 flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-64 h-10" />
        <Skeleton className="w-40 h-6" />
      </div>
      <Skeleton className="w-32 h-9 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <TripCardSkeleton />
      <TripCardSkeleton />
      <TripCardSkeleton />
    </div>
  </div>
);
