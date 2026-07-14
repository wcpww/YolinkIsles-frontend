import axiosInstance from '@/api/axiosInstance';
import type { Comment } from '../types/Comment';

interface GetCommentsResponse {
  code: number;
  message: string;
  data: {
    comments: Comment[];
    total?: number;
    page?: number;
    limit?: number;
  };
}

export const getComments = async (
  limit: number,
  page: number,
): Promise<{
  comments: Comment[];
  total?: number;
  page?: number;
  limit?: number;
}> => {
  const response = await axiosInstance.get<GetCommentsResponse>('/me/comments', {
    params: { limit, page },
  });
  return response.data.data;
};
