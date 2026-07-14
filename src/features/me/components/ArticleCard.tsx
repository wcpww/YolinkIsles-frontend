import { CalendarDays, Bookmark, Heart, MessageCircle, Pencil } from 'lucide-react';
import { useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMeFilterStore } from '../store/useMeFilterStore';
import type { PostCardData, Tag } from '../types';

interface FeedCardProps {
  post: PostCardData;
  onClick?: () => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onEdit?: () => void;
  className?: string;
}

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

function ArticleCard({ post, onClick, onLike, onBookmark, onComment, onEdit, className }: FeedCardProps) {
  const numFormatter = new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const [isThumbnailLoading, setIsThumbnailLoading] = useState(true);
  const { selectedTags, toggleTag } = useMeFilterStore();

  return (
    <Card
      data-slot="post-card"
      className={cn(
        'flex cursor-pointer flex-col transition-all hover:bg-white/5 hover:shadow-lg',
        className,
      )}
      onClick={onClick}
    >
      {/* Header Section */}
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>

        {/* Bookmark & Edit Actions */}
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full p-5"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full p-5"
            onClick={(e) => {
              e.stopPropagation();
              onBookmark?.();
            }}
          >
            {post.interactions.isBookmarked ? (
              <Bookmark className="text-primary/80 size-5" fill="currentColor" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </Button>
        </CardAction>

        <CardDescription className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {/* 1. Date Section */}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            {parseDate(post.meta.createdAt)}
          </span>

          <span className="text-muted-foreground/50">•</span>

          {/* 2. Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag: Tag) => (
                <Badge
                  key={tag.tagId}
                  className={cn(
                    'inline-flex cursor-pointer items-center rounded-full p-2 text-xs transition-colors',
                    selectedTags.has(tag.tagId)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                      : 'bg-primary/10 text-primary hover:bg-primary/80 hover:text-background',
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTag(tag.tagId);
                  }}
                >
                  {tag.tagName}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <span className="text-muted-foreground inline-flex items-center text-xs">
                  +{post.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardDescription>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="flex w-full gap-4 text-sm">
        <div className="flex w-full justify-between gap-4 text-sm">
          <div className="flex h-auto flex-col justify-between gap-2">
            {/* 1. Description Section */}
            <p className="text-foreground/90 line-clamp-3 text-sm">{post.description}</p>

            {/* 2. Like & Comment Section */}
            <div className="text-foreground flex items-center gap-2">
              <Button
                variant="ghost"
                className="gap-2 py-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                {post.interactions.isLiked ? (
                  <Heart className="size-4 text-red-400" fill="currentColor" />
                ) : (
                  <Heart className="size-4" />
                )}
                <span>{numFormatter.format(post.stats.numLikes)}</span>
              </Button>
              <Button
                variant="ghost"
                className="gap-2 py-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onComment?.();
                }}
              >
                <MessageCircle className="size-4" />
                <span>{numFormatter.format(post.stats.numComments)}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 3. Thumbnail Section */}
        {post.heroUrl && (
          <div className="bg-muted relative h-20 w-32 shrink-0 overflow-hidden rounded-md border md:h-24 md:w-40">
            {isThumbnailLoading && <Skeleton className="absolute inset-0 h-full w-full" />}

            <img
              src={getSrcPath(post.heroUrl, OSS_STYLE_PARAMETERS.THUMBNAIL)}
              alt={post.title}
              className={cn(
                'h-full w-full object-cover',
                isThumbnailLoading ? 'opacity-0' : 'opacity-100',
                'transition-opacity duration-600',
              )}
              onLoad={() => setIsThumbnailLoading(false)}
              onError={() => setIsThumbnailLoading(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ArticleCard;
