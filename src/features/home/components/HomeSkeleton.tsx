import { Skeleton } from '@/components/ui/skeleton';

export default function HomeSkeleton() {
  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      {/* Banner Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-lg" />
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>

      {/* Scroll Banner */}
      <Skeleton className="h-40 w-full rounded-lg" />

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Left Column */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <Skeleton className="h-10 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
