import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '../types';

interface GetPostsResponse {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
  };
}

export const getUserPosts = async (): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>('/me/posts');
  return response.data.data.posts;
};

export const getPinnedPosts = async (): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>('/me/posts/pinned');
  return response.data.data.posts;
};

export const getLikedPosts = async (): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>('/me/posts/liked');
  const data = response.data.data as any;
  // 兼容两种后端格式: { posts: [...] } 或直接返回数组
  return Array.isArray(data) ? data : data?.posts ?? [];
};
