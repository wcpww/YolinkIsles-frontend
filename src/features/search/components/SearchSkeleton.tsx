import { PostCardSkeleton } from '@/components/post-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchSkeleton() {
  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
