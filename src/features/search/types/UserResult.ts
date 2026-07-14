export interface UserResult {
  id: string;
  username: string;
  bio: string;
  sexType: string;
  avatarUrl: string;
  isFollowing: boolean;

  stats: {
    followers: number;
    following: number;
    totalPosts: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalBookmarks: number;
  };

  meta: {
    joinedAt: string;
    lastSeenAt: string;
  };

  accountStatus: {
    isBanned: boolean;
    isVerified: boolean;
    isDeactivated: boolean;
    banReason?: string;
    bannedAt?: string;
    bannedUntil?: string;
  };
}
