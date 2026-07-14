// src/features/profile/components/ProfileSkeleton.tsx

import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      {/* Header Container */}
      <div className="bg-card relative flex flex-col rounded-lg border pb-4 shadow-sm">
        {/* Banner */}
        <Skeleton className="h-32 w-full rounded-t-lg rounded-b-none md:h-48" />

        {/* Profile Info Bar */}
        <div className="-mt-10 mb-2 flex flex-wrap items-end justify-between gap-4 px-6">
          <div className="z-10 flex items-end gap-4">
            {/* Avatar overlapping the banner */}
            <Skeleton className="border-background h-24 w-24 rounded-full border-4" />
            {/* Title */}
            <Skeleton className="mb-2 h-8 w-40" />
          </div>

          {/* Action Buttons */}
          <div className="z-10 mb-2 flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      {/* Two-Column Content Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main Content (Left Column) */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-150 w-full rounded-lg" />
        </div>

        {/* Side Widget Area (Right Column) */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-150 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
