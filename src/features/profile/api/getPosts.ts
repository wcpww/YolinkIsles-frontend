import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '../types';

interface GetPostsResponse {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
  };
}

// Get user posts for the profile page
export const getUserPosts = async (userId: string): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>(`/user/${userId}/posts`);

  return response.data.data.posts;
};

// Get pinned posts for the profile page
export const getPinnedPosts = async (userId: string): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>(`/user/${userId}/posts/pinned`);

  return response.data.data.posts;
};
