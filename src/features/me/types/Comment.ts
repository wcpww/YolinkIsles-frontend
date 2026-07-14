export interface Comment {
  commentId: string;
  postId: string;
  createdAt: string;
  content: string;
  status: 'normal' | 'deleted' | 'banned';
  likes: number;
  parentContent: string | null;
  postTitle: string;
}
