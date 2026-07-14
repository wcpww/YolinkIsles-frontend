import axiosInstance from '@/api/axiosInstance';
import type { Comment } from '../types';

interface CommentChildrenResponse {
  code: number;
  data: { parentId: number; comments: Comment[] };
  message: string;
}

export const getCommentChildren = async (
  parentId: string,
  postId: string,
  layer: number,
): Promise<Comment[]> => {
  const response = await axiosInstance.get<CommentChildrenResponse>(
    `comment/${parentId}/children`,
    {
      params: { postId, layer },
    },
  );

  return response.data.data.comments || [];
};
