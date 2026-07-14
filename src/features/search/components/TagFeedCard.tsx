import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TagResult } from '../types';

interface TagFeedCardProps {
  tag: TagResult;
  onClick?: () => void;
  className?: string;
}

// 格式化数字：千位用k，万位用w
function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}w`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return num.toString();
}

export function TagFeedCard({ tag, onClick, className }: TagFeedCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate({ to: `/tag/${tag.tagId}` });
    onClick?.();
  };

  return (
    <Card
      data-slot="tag-card"
      className={cn(
        'flex cursor-pointer flex-col transition-all hover:bg-white/5 hover:shadow-lg',
        className,
      )}
      onClick={handleCardClick}
    >
      {/* Header Section - 标签名 */}
      <CardHeader className="pb-3">
        <CardTitle className="truncate text-base">#{tag.tagName}</CardTitle>
      </CardHeader>

      {/* Content Section - 水平统计展示 */}
      <CardContent className="flex items-center justify-between pb-4 text-sm">
        {/* Posts Count - Left */}
        <div className="flex-1 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-muted-foreground">帖子</span>
            <span className="text-foreground font-semibold">{formatNumber(tag.numTagPosts)}</span>
          </div>
        </div>

        <span className="text-muted-foreground">|</span>

        {/* Followers Count - Right */}
        <div className="flex-1 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-muted-foreground">关注</span>
            <span className="text-foreground font-semibold">
              {formatNumber(tag.numTagFollowers)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TagFeedCard;
