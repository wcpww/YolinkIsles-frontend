import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { toggleFollow } from '@/features/profile/api/toggleFollow';
import AuthorHoverCard from './AuthorHoverCard';
import type { FollowUser } from '../types';

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  users: FollowUser[] | undefined;
  isLoading: boolean;
  followersIds: Set<string>;
  followingIds: Set<string>;
}

function UserRow({
  user,
  isMutual,
  canFollow,
  onNavigate,
  onToggle,
}: {
  user: FollowUser;
  isMutual: boolean;
  canFollow: boolean;
  onNavigate: () => void;
  onToggle: () => void;
}) {
  const label = isMutual ? '互关' : canFollow ? '关注' : '已关注';

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-10 shrink-0 cursor-pointer" onClick={onNavigate}>
          <AvatarImage
            src={getSrcPath(user.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
            alt={user.username}
          />
          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <AuthorHoverCard authorId={user.id}>
            <span className="cursor-pointer text-sm font-medium" onClick={onNavigate}>
              {user.username}
            </span>
          </AuthorHoverCard>
          <p className="text-muted-foreground truncate text-xs">{user.bio}</p>
        </div>
      </div>
      <Button
        variant={isMutual || !canFollow ? 'secondary' : 'default'}
        size="sm"
        className="shrink-0 rounded-full"
        onClick={onToggle}
      >
        {label}
      </Button>
    </div>
  );
}

export default function FollowListDialog({
  open,
  onOpenChange,
  title,
  users,
  isLoading,
  followersIds,
  followingIds,
}: FollowListDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: toggleFollow,
    onSuccess: (data) => {
      const me = useAuthStore.getState().currentUserData;
      if (me) {
        useAuthStore.getState().setCurrentUserData({
          ...me,
          stats: {
            ...me.stats,
            following: data.isFollowing
              ? me.stats.following + 1
              : me.stats.following - 1,
          },
        });
      }
      queryClient.invalidateQueries({ queryKey: ['me-followers'] });
      queryClient.invalidateQueries({ queryKey: ['me-following'] });
    },
    onError: () => {
      toast.error('操作失败，请重试');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title} list</DialogDescription>
        </DialogHeader>

        <div className="no-scrollbar -mx-6 max-h-[60vh] overflow-y-auto px-6">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))
          ) : !users || users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No users found.</p>
          ) : (
            users.map((user) => {
              const isInFollowers = followersIds.has(user.id);
              const isInFollowing = followingIds.has(user.id);
              const isMutual = isInFollowers && isInFollowing;

              return (
                <UserRow
                  key={user.id}
                  user={user}
                  isMutual={isMutual}
                  canFollow={!isInFollowing}
                  onNavigate={() => {
                    onOpenChange(false);
                    navigate({ to: '/profile/$profileId', params: { profileId: user.id } });
                  }}
                  onToggle={() => followMutation.mutate(user.id)}
                />
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
