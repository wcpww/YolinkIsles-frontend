import type { Tag } from './Tag';

export interface PostCardData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  heroUrl: string;

  tags: Tag[];

  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };

  stats: {
    numLikes: number;
    numComments: number;
    numReads: number;
  };

  interactions: {
    isRead: boolean;
    isLiked: boolean;
    isBookmarked: boolean;
    isCommented: boolean;
  };

  meta: {
    createdAt: string;
    updatedAt: string;
    isHero: boolean;
    isPinnedByAuthor: boolean;
  };
}
