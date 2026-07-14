import axiosInstance from '@/api/axiosInstance';
import type { Comment } from '@/features/me/types/Comment';

interface GetCommentsResponse {
  code: number;
  message: string;
  data: {
    comments: Comment[];
  };
}

export const getComments = async (
  userId: string,
  limit: number,
  page: number,
): Promise<{ comments: Comment[] }> => {
  const response = await axiosInstance.get<GetCommentsResponse>(`/user/${userId}/comments`, {
    params: { limit, page },
  });
  return response.data.data;
};
