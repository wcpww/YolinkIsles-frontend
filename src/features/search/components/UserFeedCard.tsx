import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { UserResult } from '../types';

interface UserFeedCardProps {
  user: UserResult;
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

export function UserFeedCard({ user, onClick, className }: UserFeedCardProps) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);

  const handleCardClick = () => {
    navigate({ to: `/profile/${user.id}` });
    onClick?.();
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // TODO: Call follow/unfollow API
  };

  return (
    <Card
      data-slot="user-card"
      className={cn(
        'flex cursor-pointer flex-col transition-all hover:bg-white/5 hover:shadow-lg',
        className,
      )}
      onClick={handleCardClick}
    >
      {/* Header Section - Avatar, Username, Follow Button */}
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage
              src={getSrcPath(user.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
              alt={user.username}
            />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          {/* Username and Follow Button */}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{user.username}</h3>
              {user.accountStatus?.isVerified && (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-500" />
              )}
            </div>

            {/* Follow Button */}
            <Button
              size="sm"
              variant={isFollowing ? 'outline' : 'default'}
              className="w-full text-xs"
              onClick={handleFollowClick}
            >
              {isFollowing ? '已关注' : '关注'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Bio Section */}
      {user.bio && (
        <div className="px-4 pb-3">
          <p className="text-muted-foreground line-clamp-2 text-xs">{user.bio}</p>
        </div>
      )}

      {/* Content Section - Stats */}
      <CardContent className="space-y-3 pb-4 text-xs">
        {/* Row 1: Followers and Following */}
        <div className="flex gap-3">
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.followers)}
            </div>
            <div className="text-muted-foreground">粉丝</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.following)}
            </div>
            <div className="text-muted-foreground">关注</div>
          </div>
        </div>

        {/* Row 2: Posts and Total Likes */}
        <div className="flex gap-3">
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.totalPosts)}
            </div>
            <div className="text-muted-foreground">帖子</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.totalLikes)}
            </div>
            <div className="text-muted-foreground">获赞</div>
          </div>
        </div>

        {/* Row 3: Total Views and Total Comments */}
        <div className="flex gap-3">
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.totalViews)}
            </div>
            <div className="text-muted-foreground">浏览</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-foreground font-semibold">
              {formatNumber(user.stats.totalComments)}
            </div>
            <div className="text-muted-foreground">评论</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserFeedCard;
