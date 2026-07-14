import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '../types';

interface TagPostsResponse {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
  };
}

export async function getTagPosts(tagId: string): Promise<PostCardData[]> {
  const response = await axiosInstance.get<TagPostsResponse>(`/tag/${tagId}/posts`);
  return response.data.data.posts;
}
