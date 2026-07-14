import { CalendarDays, Eye, PenLine, Pin } from 'lucide-react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AuthorHoverCard from './AuthorHoverCard';
import type { PostDetailData } from '../types/PostDetailData';

interface PostHeaderProps {
  post: PostDetailData;
  onTagClick: (tagId: string) => void;
}

function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const sameYear = date.getFullYear() === new Date().getFullYear();
      return date.toLocaleDateString('zh-CN', {
        year: sameYear ? undefined : 'numeric',
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

const numFormatter = new Intl.NumberFormat('zh-CN', { notation: 'compact' });

const tagBadgeClass = cn(
  'h-5 shrink-0 cursor-pointer rounded-full px-2.5 text-xs whitespace-nowrap transition-colors',
  'bg-primary/80 hover:bg-primary text-white',
);

export default function PostHeader({ post, onTagClick }: PostHeaderProps) {
  if (post.heroUrl) {
    return (
      <div className="relative h-56 w-full overflow-hidden md:h-72">
        <img
          src={getSrcPath(post.heroUrl, OSS_STYLE_PARAMETERS.HERO)}
          alt={post.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-black/30 to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-5 md:p-8">
          <div className="mx-auto max-w-6xl space-y-3">
            <div className="flex items-end gap-4">
              <h1 className="flex-1 text-3xl leading-tight font-bold text-white drop-shadow-lg md:text-4xl">
                {post.title}
              </h1>
              {post.meta.isPinnedByAuthor && (
                <Pin className="mb-0.5 h-4 w-4 shrink-0 text-amber-400 drop-shadow" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-white/90">
              <AuthorHoverCard authorId={post.author.id}>
                <span className="flex items-center gap-2 text-white transition-opacity hover:opacity-75">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={getSrcPath(post.author.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                      alt={post.author.username}
                    />
                    <AvatarFallback className="text-sm">
                      {post.author.username.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-lg font-medium">{post.author.username}</span>
                </span>
              </AuthorHoverCard>

              <span className="flex items-center gap-1 text-sm text-white/70">
                <CalendarDays className="h-3 w-3" />
                {parseDate(post.meta.createdAt)}
              </span>

              {post.meta.updatedAt !== post.meta.createdAt && (
                <span className="flex items-center gap-1 text-sm text-white/70">
                  <PenLine className="h-3 w-3" />
                  修改于 {parseDate(post.meta.updatedAt)}
                </span>
              )}

              <span className="flex items-center gap-1 text-sm text-white/70">
                <Eye className="h-3 w-3" />
                {numFormatter.format(post.stats.numReads)}
              </span>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.tagId}
                      onClick={() => onTagClick(tag.tagId)}
                      className={tagBadgeClass}
                    >
                      {tag.tagName}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-muted/40 border-b bg-linear-to-b to-transparent">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        <div className="flex items-start gap-3">
          <h1 className="flex-1 text-2xl leading-tight font-bold md:text-3xl">{post.title}</h1>
          {post.meta.isPinnedByAuthor && <Pin className="mt-1 h-4 w-4 shrink-0 text-amber-500" />}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <AuthorHoverCard authorId={post.author.id}>
            <span className="flex items-center gap-2 transition-opacity hover:opacity-75">
              <Avatar className="size-8">
                <AvatarImage
                  src={getSrcPath(post.author.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                  alt={post.author.username}
                />
                <AvatarFallback className="text-sm">
                  {post.author.username.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-base font-medium">{post.author.username}</span>
            </span>
          </AuthorHoverCard>

          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <CalendarDays className="h-3 w-3" />
            {parseDate(post.meta.createdAt)}
          </span>

          {post.meta.updatedAt !== post.meta.createdAt && (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <PenLine className="h-3 w-3" />
              修改于 {parseDate(post.meta.updatedAt)}
            </span>
          )}

          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <Eye className="h-3 w-3" />
            {numFormatter.format(post.stats.numReads)}
          </span>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge
                  key={tag.tagId}
                  onClick={() => onTagClick(tag.tagId)}
                  className={tagBadgeClass}
                >
                  {tag.tagName}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
