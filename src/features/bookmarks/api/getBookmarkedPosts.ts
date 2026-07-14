import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '@/features/home/types';

interface GetBookmarkedPostsResponse {
  code: number;
  message: string;
  data: PostCardData[];
}

export const getBookmarkedPosts = async (): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetBookmarkedPostsResponse>(
    '/me/posts/bookmarked',
  );
  return response.data.data;
};
