import axiosInstance from '@/api/axiosInstance';
import { type Comment } from '../types';

interface CommentResponse {
  code: number;
  data: { comments: Comment[] };
  message: string;
}

export const getPostComments = async (postId: string, layer = 3): Promise<Comment[]> => {
  const response = await axiosInstance.get<CommentResponse>(`/post/${postId}/comments`, {
    params: { layer },
  });
  return response.data.data.comments;
};
