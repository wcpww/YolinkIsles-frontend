import { Pin } from 'lucide-react';
import { useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMeFilterStore } from '../store/useMeFilterStore';
import type { PostCardData, Tag } from '../types';

function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const currentYear = new Date().getFullYear();
      const dateYear = date.getFullYear();
      return date.toLocaleDateString('zh-CN', {
        year: dateYear === currentYear ? undefined : 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    const [datePart] = dateString.split(' ');
    const parsedDate = new Date(datePart);
    if (!isNaN(parsedDate.getTime())) {
      const currentYear = new Date().getFullYear();
      const dateYear = parsedDate.getFullYear();
      return parsedDate.toLocaleDateString('zh-CN', {
        year: dateYear === currentYear ? undefined : 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    return dateString;
  } catch {
    return dateString;
  }
}

interface PinnedCardProps {
  post: PostCardData;
  onClick?: () => void;
  className?: string;
}

function PinnedCard({ post, onClick, className }: PinnedCardProps) {
  const [isIamgeLoading, setIsImageLoading] = useState(true);
  const { selectedTags, toggleTag } = useMeFilterStore();

  return (
    <Card
      data-slot="post-image-card"
      className={cn(
        'group/card relative cursor-pointer overflow-hidden transition-all duration-400',
        'flex-none snap-start',
        className,
      )}
      onClick={onClick}
    >
      {isIamgeLoading && <Skeleton className="absolute inset-0 h-full w-full" />}

      <img
        className={cn(
          'absolute inset-0 h-full w-full bg-center object-cover transition-all duration-600 group-hover/card:scale-115',
          isIamgeLoading ? 'opacity-0' : 'opacity-100',
        )}
        src={getSrcPath(post.heroUrl.toString(), OSS_STYLE_PARAMETERS.HERO)}
        alt={post.title}
        onLoad={() => setIsImageLoading(false)}
        onError={() => setIsImageLoading(false)}
      />
      <div
        className={cn(
          'x absolute inset-0 bg-linear-to-t from-black/80 via-black/30',
          isIamgeLoading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-600',
        )}
      />

      <Pin className="absolute top-4 right-4 size-5 rotate-45 text-white opacity-0 transition-opacity duration-400 group-hover/card:opacity-100" />

      <CardHeader
        className={cn(
          'absolute inset-0 flex flex-col items-start justify-end p-4',
          isIamgeLoading ? 'text-foreground' : 'text-white',
          'transition-colors duration-300',
        )}
      >
        <span className="text-sm opacity-75">{parseDate(post.meta.createdAt)}</span>

        <CardTitle className="line-clamp-2 text-base leading-snug font-semibold">
          {post.title}
        </CardTitle>

        <CardContent className="mt-1 flex items-center gap-2 p-0 text-sm">
          {post.tags.slice(0, 2).map((tag: Tag) => (
            <Badge
              key={tag.tagId}
              className={cn(
                'inline-flex cursor-pointer items-center rounded-full p-1.5 text-xs transition-all',
                selectedTags.has(tag.tagId)
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-primary/30 text-primary hover:text-muted hover:bg-primary',
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggleTag(tag.tagId);
              }}
            >
              {tag.tagName}
            </Badge>
          ))}
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export default PinnedCard;
