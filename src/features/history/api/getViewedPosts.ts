import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '../types';

interface GetViewedPostsResponse {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
    total: number;
    page: number;
    limit: number;
  };
}

export const getViewedPosts = async (
  limit: number,
  page: number,
): Promise<GetViewedPostsResponse['data']> => {
  const response = await axiosInstance.get<GetViewedPostsResponse>('/posts/viewed', {
    params: { limit, page },
  });
  return response.data.data;
};
