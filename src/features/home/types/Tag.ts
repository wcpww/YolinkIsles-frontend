export interface Tag {
  tagId: string;
  tagName: string;
  numTagPosts: number;
  numTagFollowers: number;
  isFollowing?: boolean;
}
