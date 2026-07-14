import { CalendarDays, Bookmark, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useTagFilterStore } from '../store/useTagFilterStore';
import AuthorHoverCard from './AuthorHoverCard';
import type { PostCardData, Tag } from '../types';

interface TagCardProps {
  post: PostCardData;
  currentTag?: Tag;
  onClick?: () => void;
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
      return parsedDate.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function TagCard({ post, currentTag, onClick, className }: TagCardProps) {
  const numFormatter = new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const [isThumbnailLoading, setIsThumbnailLoading] = useState(true);
  const { selectedTags, toggleTag } = useTagFilterStore();

  // currentTag always first; deduplicate if post already has it
  const otherTags = post.tags ? post.tags.filter((t) => t.tagId !== currentTag?.tagId) : [];
  const allTags: Tag[] = currentTag ? [currentTag, ...otherTags] : otherTags;
  const visibleTags = allTags.slice(0, 3);
  const extraCount = allTags.length - visibleTags.length;

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

        {/* Bookmark Action */}
        <CardAction>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full p-5"
            onClick={(e) => {
              e.stopPropagation();
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
          {/* Author Section */}
          <AuthorHoverCard authorId={post.author.id}>
            <Button
              className="text-foreground/80 hover:text-foreground/90 flex h-auto cursor-pointer items-center gap-1 p-0 font-semibold"
              variant="link"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Avatar className="size-5">
                <AvatarImage
                  src={getSrcPath(post.author.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                  alt={post.author.username}
                />
                <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{post.author.username}</span>
            </Button>
          </AuthorHoverCard>

          <span className="text-muted-foreground/50">•</span>

          {/* Date Section */}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            {parseDate(post.meta.createdAt)}
          </span>

          <span className="text-muted-foreground/50">•</span>

          {/* Tags Section — current page tag always first (active, non-dismissible), then others */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visibleTags.map((tag: Tag) => {
                const isCurrent = tag.tagId === currentTag?.tagId;
                const isActive = isCurrent || selectedTags.has(tag.tagId);
                return (
                  <Badge
                    key={tag.tagId}
                    className={cn(
                      'inline-flex items-center rounded-full p-2 text-xs transition-colors',
                      isCurrent
                        ? 'bg-primary text-primary-foreground cursor-default'
                        : isActive
                          ? 'bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer'
                          : 'bg-primary/10 text-primary hover:bg-primary/80 hover:text-muted cursor-pointer',
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCurrent) toggleTag(tag.tagId);
                    }}
                  >
                    {tag.tagName}
                  </Badge>
                );
              })}
              {extraCount > 0 && (
                <span className="text-muted-foreground inline-flex items-center text-xs">
                  +{extraCount}
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
            {/* Description Section */}
            <p className="text-foreground/90 line-clamp-3 text-sm">{post.description}</p>

            {/* Like & Comment Section */}
            <div className="text-foreground flex items-center gap-2">
              <Button
                variant="ghost"
                className="gap-2 py-4"
                onClick={(e) => {
                  e.stopPropagation();
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
                }}
              >
                <MessageCircle className="size-4" />
                <span>{numFormatter.format(post.stats.numComments)}</span>
              </Button>
            </div>
          </div>

          {/* Thumbnail Section */}
          {post.heroUrl && (
            <div className="bg-muted relative h-20 w-32 shrink-0 overflow-hidden rounded-md border md:h-24 md:w-40">
              {isThumbnailLoading && <Skeleton className="absolute inset-0 h-full w-full" />}
              <img
                src={getSrcPath(post.heroUrl, OSS_STYLE_PARAMETERS.THUMBNAIL)}
                alt={post.title}
                className={cn(
                  'h-full w-full object-cover transition-opacity duration-600',
                  isThumbnailLoading ? 'opacity-0' : 'opacity-100',
                )}
                onLoad={() => setIsThumbnailLoading(false)}
                onError={() => setIsThumbnailLoading(false)}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TagCard;
