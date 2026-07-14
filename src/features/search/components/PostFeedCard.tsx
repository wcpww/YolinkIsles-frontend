import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { CalendarDays, Bookmark, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { toggleBookmark } from '@/features/me/api/toggleBookmark';
import { toggleLike } from '@/features/me/api/toggleLike';
import { cn } from '@/lib/utils';
import AuthorHoverCard from './AuthorHoverCard';
import type { PostResult, Tag } from '../types';

interface FeedCardProps {
  post: PostResult;
  onClick?: () => void;
  className?: string;
}

// Helper function to parse date string in format "YYYY-MM-DD HH:MM:SS"
// TODO: 1. Chinese data format. \n 2. Maybe use a more intelligent date presentation in the future (e.g. "3 days ago", "yesterday", etc.) \n 3. Cursor styles \n 4. When hovered in night mode, border color should be light or use a color to indicate it's hovered.
function parseDate(dateString: string): string {
  try {
    // Try ISO format first (standard)
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

    // Fall back to parsing "YYYY-MM-DD HH:MM:SS" format
    const [datePart] = dateString.split(' ');
    const parsedDate = new Date(datePart);
    if (!isNaN(parsedDate.getTime())) {
      const currentYear = new Date().getFullYear();
      const dateYear = date.getFullYear();
      return parsedDate.toLocaleDateString('zh-CN', {
        year: dateYear === currentYear ? undefined : 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    // If all parsing fails, return the original string
    return dateString;
  } catch {
    return dateString;
  }
}

export function FeedCard({ post, onClick, className }: FeedCardProps) {
  const navigate = useNavigate();
  const numFormatter = new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const [isThumbnailLoading, setIsThumbnailLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(post.interactions.isLiked);
  const [numLikes, setNumLikes] = useState(post.stats.numLikes);
  const [isBookmarked, setIsBookmarked] = useState(post.interactions.isBookmarked);

  const handleCardClick = () => {
    navigate({ to: `/post/${post.id}` });
    onClick?.();
  };

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onMutate: () => {
      setIsLiked((prev) => !prev);
      setNumLikes((prev) => (isLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setIsLiked((prev) => !prev);
      setNumLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      toast.error('操作失败，请重试');
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(post.id),
    onMutate: () => setIsBookmarked((prev) => !prev),
    onError: () => {
      setIsBookmarked((prev) => !prev);
      toast.error('操作失败，请重试');
    },
  });

  return (
    <Card
      data-slot="post-card"
      className={cn(
        'flex cursor-pointer flex-col transition-all hover:bg-white/5 hover:shadow-lg',
        className,
      )}
      onClick={handleCardClick}
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
              bookmarkMutation.mutate();
            }}
          >
            {isBookmarked ? (
              <Bookmark className="text-primary/80 size-5" fill="currentColor" />
            ) : (
              <Bookmark className="size-5" />
            )}
          </Button>
        </CardAction>

        <CardDescription className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {/* 1. Author Section */}
          <AuthorHoverCard authorId={post.author.id}>
            <Button
              className="text-foreground/80 hover:text-foreground/90 flex h-auto cursor-pointer items-center gap-1 p-0 font-semibold"
              variant="link"
              onClick={() => {
                void navigate({ to: `/profile/${post.author.id}` });
              }}
            >
              <Avatar className="size-5">
                <AvatarImage
                  src={getSrcPath(post.author.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                  alt={post.author.username}
                />
                <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="">{post.author.username}</span>
            </Button>
          </AuthorHoverCard>

          <span className="text-muted-foreground/50">•</span>

          {/* 2. Date Section */}
          <span className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            {parseDate(post.meta.createdAt)}
          </span>

          <span className="text-muted-foreground/50">•</span>

          {/* 3. Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag: Tag) => (
                <Badge
                  key={tag.tagId}
                  className="bg-primary/10 text-primary hover:bg-primary/80 hover:text-background inline-flex cursor-pointer items-center rounded-full p-2 text-xs transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    void navigate({ to: `/tag/${tag.tagId}` });
                  }}
                >
                  #{tag.tagName}
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
                  likeMutation.mutate();
                }}
              >
                {isLiked ? (
                  <Heart className="size-4 text-red-400" fill="currentColor" />
                ) : (
                  <Heart className="size-4" />
                )}
                <span>{numFormatter.format(numLikes)}</span>
              </Button>
              <Button
                variant="ghost"
                className="gap-2 py-4"
                onClick={(e) => {
                  e.stopPropagation();
                  void navigate({ to: `/post/${post.id}` });
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
            {/* Skeleton Placeholder */}
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

export default FeedCard;
