/**
 * 评论
 */
export interface Comment {
  /**
   * 用户头像
   */
  avatarUrl: string;
  /**
   * 递归地存放评论
   */
  children: Comment[];
  /**
   * 评论ID
   */
  commentId: string;
  /**
   * 评论内容
   */
  content: string;
  /**
   * 评论时间
   */
  createdAt: string;
  /**
   * 是否还有孩子
   */
  hasChildren: boolean;
  /**
   * 评论层级（从1开始）
   */
  level: number;
  /**
   * 点赞数
   */
  likes: number;
  /**
   * 当前用户是否已点赞
   */
  isLikedByUser?: boolean;
  /**
   * 属于哪篇文章
   */
  postId: string;
  /**
   * 这条评论是谁的评论？如果commentId==rootId，说明这条评论是文章的评论；否则是评论的评论（楼中楼）
   */
  rootId: string;
  /**
   * 评论状态（enum）
   */
  status: CommentStatus;
  /**
   * 用户ID
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

/**
 * 评论状态（const object）
 */
export const CommentStatus = {
  Banned: 'banned',
  Deleted: 'deleted',
  Normal: 'normal',
} as const;

export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];
