'use client';

import { useNavigate } from '@tanstack/react-router';
import { MessageCircle, Settings, User, LogOut } from 'lucide-react';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import type { User as UserType } from '@/types/User';

interface UserProfileHoverCardProps {
  user: UserType | undefined;
  isLoading: boolean;
  trigger: React.ReactNode;
}

export const UserProfileHoverCard = ({ user, isLoading, trigger }: UserProfileHoverCardProps) => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  if (isLoading) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent className="w-80 overflow-hidden p-0" side="bottom">
          <div className="bg-muted h-48 animate-pulse" />
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Not logged in state
  if (!isLoggedIn) {
    const handleLogin = () => {
      navigate({ to: '/login' });
    };

    return (
      <HoverCard>
        <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
        <HoverCardContent className="w-80 overflow-hidden p-0" side="bottom">
          <div className="bg-popover flex flex-col">
            {/* Top Section - Empty Avatar and Login Prompt */}
            <div className="flex items-center gap-3 border-b px-4 pt-4 pb-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarFallback className="bg-muted text-muted-foreground">—</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="text-popover-foreground text-sm font-semibold">
                  请登录查看个人信息
                </h3>
              </div>
            </div>

            {/* Bottom Section - Login Button */}
            <div className="flex flex-col gap-1 px-2 py-2">
              <button
                onClick={handleLogin}
                className="text-popover-foreground hover:bg-accent flex w-full items-center justify-center rounded px-3 py-2 text-sm font-medium transition-colors"
              >
                去登陆
              </button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Logged in but no user data
  if (!user) {
    return <>{trigger}</>;
  }

  const handleNavigateProfile = () => {
    navigate({ to: `/profile/${user.id}` });
  };

  const handleCreatePost = () => {
    navigate({ to: '/create-post', search: { draftId: undefined } });
  };

  const handleSettings = () => {
    navigate({ to: '/settings' });
  };

  const handleLogout = () => {
    clearAuth();
    navigate({ to: '/login' });
  };

  // Logged in with user data - full profile card
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent className="w-80 overflow-hidden p-0" side="bottom">
        {/* Container with 3:2 aspect ratio and flexible height */}
        <div className="bg-popover flex flex-col" style={{ minHeight: '240px' }}>
          {/* Top Section - Avatar and Name */}
          <div className="flex items-center gap-3 border-b px-4 pt-4 pb-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage
                src={getSrcPath(user.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                alt={user.username}
              />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-popover-foreground truncate text-sm font-semibold">
                {user.username}
              </h3>
              {user.location && (
                <p className="text-muted-foreground truncate text-xs">{user.location}</p>
              )}
            </div>
          </div>

          {/* Middle Section - Stats */}
          <div className="flex items-center justify-around border-b px-4 py-3 text-center">
            <div className="flex-1">
              <div className="text-popover-foreground text-sm font-semibold">
                {user.stats.following}
              </div>
              <p className="text-muted-foreground text-xs">关注</p>
            </div>
            <div className="flex-1 border-r border-l">
              <div className="text-popover-foreground text-sm font-semibold">
                {user.stats.followers}
              </div>
              <p className="text-muted-foreground text-xs">粉丝</p>
            </div>
            <div className="flex-1">
              <div className="text-popover-foreground text-sm font-semibold">
                {user.stats.totalLikes}
              </div>
              <p className="text-muted-foreground text-xs">获赞</p>
            </div>
          </div>

          {/* Bottom Section - Actions List */}
          <div className="flex flex-col gap-1 px-2 py-2">
            <button
              onClick={handleCreatePost}
              className="text-popover-foreground hover:bg-accent flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>发帖子</span>
            </button>
            <button
              onClick={handleNavigateProfile}
              className="text-popover-foreground hover:bg-accent flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
            >
              <User className="h-4 w-4" />
              <span>个人主页</span>
            </button>
            <button
              onClick={handleSettings}
              className="text-popover-foreground hover:bg-accent flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>设置</span>
            </button>
            <button
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>登出</span>
            </button>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
