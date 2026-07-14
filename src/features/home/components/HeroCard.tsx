import { useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import AuthorHoverCard from './AuthorHoverCard';
import type { PostCardData } from '../types';

// Helper function to parse date string in format "YYYY-MM-DD HH:MM:SS"
// TODO: 1. Chinese data format. 2. Maybe use a more intelligent date presentation in the future (e.g. "3 days ago", "yesterday", etc.)
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

interface HeroCardProps {
  post: PostCardData;
  onClick?: () => void;
  className?: string;
}

function HeroCard({ post, onClick, className }: HeroCardProps) {
  const [isIamgeLoading, setIsImageLoading] = useState(true);
  return (
    <Card
      data-slot="post-image-card"
      className={cn(
        'group relative cursor-pointer overflow-hidden transition-all duration-400',
        'hover:scale-103 hover:shadow-lg',
        className,
      )}
      onClick={onClick}
    >
      {/* Skeleton Placeholder */}
      {isIamgeLoading && <Skeleton className="absolute inset-0 h-full w-full" />}

      {/* Background Image */}
      <img
        className={cn(
          'absolute inset-0 h-full w-full bg-center object-cover',
          'transition-all duration-500',
          isIamgeLoading ? 'opacity-0' : 'opacity-100',
        )}
        src={getSrcPath(post.heroUrl.toString(), OSS_STYLE_PARAMETERS.HERO)}
        alt={post.title}
        onLoad={() => setIsImageLoading(false)}
        onError={() => setIsImageLoading(false)}
      />
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-t from-black/90 via-black/40',
          isIamgeLoading ? 'opacity-0' : 'opacity-50 group-hover:opacity-90',
          'transition-opacity duration-600',
        )}
      />

      {/* Content Overlay */}
      <CardHeader
        className={cn(
          'absolute inset-0 flex flex-col items-start justify-end p-4',
          isIamgeLoading ? 'text-foreground' : 'text-white',
          'transition-colors duration-300',
        )}
      >
        <CardTitle className="mb-2 line-clamp-2 text-lg leading-snug font-bold md:text-xl">
          {/* TODO: Long titles might overflow */}
          {post.title}
        </CardTitle>

        {/* TODO: When hover, show post description */}

        <CardContent className="flex items-center gap-3 p-0 text-sm">
          <AuthorHoverCard authorId={post.author.id}>
            <Button
              className={cn(
                'flex h-auto items-center gap-1 p-0 font-semibold',
                isIamgeLoading ? 'text-foreground/80' : 'text-white/80',
              )}
              variant="link"
              onClick={() => {
                // TODO: On avatar click, navigate to author profile page.
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

          <span className="text-muted-foreground/80">•</span>
          <span className="opacity-75">{parseDate(post.meta.createdAt)}</span>
        </CardContent>
      </CardHeader>
    </Card>
  );
}

export default HeroCard;
