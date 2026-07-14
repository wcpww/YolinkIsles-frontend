/**
 * 作者基本信息
 */
export interface Author {
  id: string;
  username: string;
  bio: string;
  sexType: string;
  avatarUrl: string;
  bannerUrl: string;
  location: string | null;
  isFollowing: boolean;
  externalLinks: { platform: string; url: string }[];
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
    isVerified: boolean;
    isBanned: boolean;
    isDeactivated: boolean;
    banReason: string | null;
    bannedAt: string;
    bannedUntil: string | null;
  };
}
