/**
 * 标签列表
 */
export interface Tag {
  /**
   * 关注话题的用户数量
   */
  numTagFollowers: number;
  /**
   * 该话题下的帖子数量
   */
  numTagPosts: number;
  /**
   * ID
   */
  tagId: string;
  /**
   * 话题名字（#后面的部分）
   */
  tagName: string;
  /**
   * 当前用户是否关注该话题
   */
  isFollowing?: boolean;
}
