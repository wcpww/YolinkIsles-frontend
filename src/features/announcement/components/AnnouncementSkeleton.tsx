import { Skeleton } from '@/components/ui/skeleton';

export default function AnnouncementSkeleton() {
  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <Skeleton className="h-8 w-48" />
      <div className="bg-card space-y-3 rounded-lg border p-6">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
