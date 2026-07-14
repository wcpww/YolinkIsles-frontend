import { Link } from '@tanstack/react-router';
import { CalendarDays, Link2, MapPin } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthorInfo } from '../hooks/useAuthorInfo';

interface AuthorHoverCardProps {
  children: ReactNode;
  authorId: string;
}

function parseJoinDate(dateString: string): string {
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
    return dateString;
  } catch {
    return dateString;
  }
}

export default function AuthorHoverCard({ children, authorId }: AuthorHoverCardProps) {
  const { data: authorInfo } = useAuthorInfo(authorId);
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false);

  const imagesReady = !authorInfo || ((!authorInfo.bannerUrl || isBannerLoaded) && isAvatarLoaded);

  return (
    <HoverCard openDelay={800}>
      <HoverCardTrigger asChild onClick={(e) => e.stopPropagation()}>
        <span className="cursor-pointer underline-offset-4 hover:underline">{children}</span>
      </HoverCardTrigger>

      <HoverCardContent
        className="w-75 overflow-hidden p-0 text-left shadow-xl transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Skeleton: shown while data is loading OR images haven't finished loading */}
        {(!authorInfo || !imagesReady) && (
          <div className="flex flex-col gap-2 p-0">
            <div className="relative">
              <Skeleton className="h-20 w-full rounded-none" />
              <Skeleton className="ring-background absolute -bottom-5 left-4 -mt-10 size-14 rounded-full ring-2" />
            </div>

            <div className="mt-5 flex flex-col gap-2 px-4 pb-4">
              <div className="space-y-2 pt-1">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        )}

        {authorInfo && (
          <div className={imagesReady ? 'flex flex-col gap-1' : 'hidden'}>
            <div className="relative">
              {/* Banner */}
              <div className="bg-muted h-20 w-full overflow-hidden">
                {authorInfo.bannerUrl ? (
                  <img
                    src={getSrcPath(authorInfo.bannerUrl, OSS_STYLE_PARAMETERS.HERO)}
                    alt="banner"
                    className="h-full w-full object-cover"
                    onLoad={() => setIsBannerLoaded(true)}
                    onError={() => setIsBannerLoaded(true)}
                  />
                ) : null}
              </div>

              {/* Avatar overlapping banner */}
              <div className="absolute -bottom-5 left-4">
                <Avatar className="ring-background size-14 ring-2">
                  <AvatarImage
                    src={getSrcPath(authorInfo.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                    onLoad={() => setIsAvatarLoaded(true)}
                    onError={() => setIsAvatarLoaded(true)}
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground text-lg font-medium">
                    {authorInfo.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Username & ID */}
            <div className="mt-5 flex flex-col gap-1 px-4">
              <h4 className="text-foreground text-lg leading-snug font-semibold">
                {authorInfo.username}
              </h4>
              <p className="text-muted-foreground text-xs">@{authorInfo.id}</p>
            </div>

            {/* Bio */}
            <p className="text-foreground/90 line-clamp-2 px-4 text-sm leading-relaxed">
              {authorInfo.bio || 'This user is mysterious and has no bio.'}
            </p>

            <div className="space-y-1.5 px-4 pt-1">
              {authorInfo.location && (
                <div className="text-muted-foreground flex items-center text-sm">
                  <MapPin className="mr-2 size-4 opacity-80" />
                  <span>{authorInfo.location}</span>
                </div>
              )}

              {authorInfo.externalLinks.length > 0 && (
                <div className="text-muted-foreground flex items-center text-sm">
                  <Link2 className="mr-2 size-4 opacity-80" />
                  <a
                    href={authorInfo.externalLinks[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    {authorInfo.externalLinks[0].url.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}

              <div className="text-muted-foreground flex items-center text-sm">
                <CalendarDays className="mr-2 size-4 opacity-80" />
                <span className="tracking-wider">
                  加入于{parseJoinDate(authorInfo.meta?.joinedAt || '')}
                </span>
              </div>
            </div>

            {/* Button → Author Profile */}
            <div className="px-4 pt-2 pb-4">
              <Button asChild size="sm" className="h-9 w-full text-sm" variant="default">
                <Link to="/profile/$profileId" params={{ profileId: authorInfo.id }}>
                  查看完整资料
                </Link>
              </Button>
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
